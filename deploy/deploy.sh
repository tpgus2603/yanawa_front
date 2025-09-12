#!/usr/bin/env bash
set -euo pipefail

# ========== 0) .env 로드 ==========
ENV_FILE="$(dirname "$0")/.env"
[[ -f $ENV_FILE ]] || { echo "❌  $ENV_FILE 가 없습니다."; exit 1; }
# shellcheck disable=SC2046
export $(grep -v '^[[:space:]]*#' "$ENV_FILE" | grep -v '^[[:space:]]*$' | xargs)

# ========== 1) 변수/기본값 ==========
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
RELEASES_DIR="${RELEASES_DIR:-/var/www/releases}"
NGINX_ROOT_LINK="${NGINX_ROOT_LINK:-/var/www/yanawa.shop}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
STAMP=$(date +%Y%m%d-%H%M%S)
TARGET_DIR="${RELEASES_DIR}/${STAMP}"

# DEPLOY_HOST 필수
[[ -n "${DEPLOY_HOST:-}" ]] || { echo "❌  DEPLOY_HOST 가 비었습니다."; exit 1; }

REMOTE="ssh ${DEPLOY_HOST}"

# ========== 2) 로컬 빌드 ==========
echo "🔨  npm ci && npm run build (PROJECT_DIR=${PROJECT_DIR})"
cd "$PROJECT_DIR"

# npm ci ENOTEMPTY 등에 대비하여 캐시 일부 제거 후 재시도 로직
if ! npm ci --no-audit --no-fund; then
  echo "⚠️  npm ci 실패 → 캐시 정리 후 재시도"
  rm -rf node_modules/.cache/babel-loader || true
  npm ci --no-audit --no-fund
fi

npm run build

# BUILD_DIR 자동 감지 (명시된 값이 없으면 build → dist 순서)
if [[ -z "${BUILD_DIR:-}" ]]; then
  if [[ -f "${PROJECT_DIR}/build/index.html" ]]; then
    BUILD_DIR="${PROJECT_DIR}/build"
  elif [[ -f "${PROJECT_DIR}/dist/index.html" ]]; then
    BUILD_DIR="${PROJECT_DIR}/dist"
  else
    echo "❌  BUILD_DIR 미지정이고 build/dist 어디에도 index.html 이 없습니다."
    echo "    .env 에 BUILD_DIR 를 명시하거나, 빌드 산출물을 확인하세요."
    exit 1
  fi
fi

# 산출물 존재 확인 (빈 폴더 업로드 방지)
[[ -f "${BUILD_DIR}/index.html" ]] || { echo "❌  ${BUILD_DIR}/index.html 이 없습니다."; exit 1; }
echo "✅  build artifact 확인: ${BUILD_DIR}/index.html"

# ========== 3) 서버 폴더 준비 ==========
echo "🛫  원격 준비: ${DEPLOY_HOST}:${TARGET_DIR}"

# releases 디렉터리 생성 및 권한(소유자는 현재 SSH 사용자, 그룹은 www-data)
$REMOTE -T "sudo mkdir -p '${RELEASES_DIR}' && sudo chown -R \$USER:www-data '${RELEASES_DIR}' && mkdir -p '${TARGET_DIR}'"

# ========== 4) rsync 전송 ==========
# 주의: 소스 경로 끝에 / 필수 (rsync 관례)
rsync -avz --delete -e "ssh -T" "${BUILD_DIR}/" "${DEPLOY_HOST}:${TARGET_DIR}/"

# ========== 5) 심볼릭 링크 스왑 + 권한 + Nginx reload + 보관본 정리 ==========
$REMOTE <<EOF
set -e
# 새 릴리즈 소유권(정적파일은 www-data가 읽을 수 있게)
sudo chown -R www-data:www-data '${TARGET_DIR}'
# 심볼릭 링크 스왑
sudo ln -sfn '${TARGET_DIR}' '${NGINX_ROOT_LINK}'
sudo chown -h www-data:www-data '${NGINX_ROOT_LINK}'
# Nginx 테스트 & 리로드
sudo nginx -t && sudo systemctl reload nginx
# 보관본 정리 (최신 ${KEEP_RELEASES}개만 유지)
cd '${RELEASES_DIR}'
ls -1dt */ 2>/dev/null | tail -n +$((${KEEP_RELEASES}+1)) | xargs -r rm -rf
# 디버깅용 출력
echo "👉 CURRENT_ROOT=\$(readlink -f '${NGINX_ROOT_LINK}')"
EOF

echo "🟢  Deploy completed : ${STAMP}"
