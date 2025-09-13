#!/usr/bin/env bash
set -euo pipefail

# ========== 0) .env 로드 ==========
ENV_FILE="$(dirname "$0")/.env"
[[ -f $ENV_FILE ]] || { echo "❌  $ENV_FILE 가 없습니다."; exit 1; }
export $(grep -v '^[[:space:]]*#' "$ENV_FILE" | grep -v '^[[:space:]]*$' | xargs)

# ========== 1) 변수/기본값 ==========
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
RELEASES_DIR="${RELEASES_DIR:-/var/www/releases}"
NGINX_ROOT_LINK="${NGINX_ROOT_LINK:-/var/www/releases/current}"   # << 여기만 변경
KEEP_RELEASES="${KEEP_RELEASES:-5}"
STAMP=$(date +%Y%m%d-%H%M%S)
TARGET_DIR="${RELEASES_DIR}/${STAMP}"

[[ -n "${DEPLOY_HOST:-}" ]] || { echo "❌  DEPLOY_HOST 가 비었습니다."; exit 1; }
REMOTE="ssh ${DEPLOY_HOST}"

# ========== 2) 로컬 빌드 ==========
echo "🔨  npm ci && npm run build (PROJECT_DIR=${PROJECT_DIR})"
cd "$PROJECT_DIR"
if ! npm ci --no-audit --no-fund; then
  echo "⚠️  npm ci 실패 → 캐시 정리 후 재시도"
  rm -rf node_modules/.cache/babel-loader || true
  npm ci --no-audit --no-fund
fi
npm run build

# BUILD_DIR 자동 감지
if [[ -z "${BUILD_DIR:-}" ]]; then
  if [[ -f "${PROJECT_DIR}/build/index.html" ]]; then
    BUILD_DIR="${PROJECT_DIR}/build"
  elif [[ -f "${PROJECT_DIR}/dist/index.html" ]]; then
    BUILD_DIR="${PROJECT_DIR}/dist"
  else
    echo "❌  BUILD_DIR 미지정이고 build/dist 어디에도 index.html 이 없습니다."
    exit 1
  fi
fi
[[ -f "${BUILD_DIR}/index.html" ]] || { echo "❌  ${BUILD_DIR}/index.html 이 없습니다."; exit 1; }
echo "✅  build artifact 확인: ${BUILD_DIR}/index.html"

# ========== 3) 서버 폴더 준비 ==========
echo "🛫  원격 준비: ${DEPLOY_HOST}:${TARGET_DIR}"
$REMOTE -T "sudo mkdir -p '${RELEASES_DIR}' && sudo chown -R \$USER:www-data '${RELEASES_DIR}' && mkdir -p '${TARGET_DIR}'"

# ========== 4) rsync 전송 ==========
rsync -avz --delete -e "ssh -T" "${BUILD_DIR}/" "${DEPLOY_HOST}:${TARGET_DIR}/"

# ========== 5) 심볼릭 링크 스왑/권한/리로드/정리 ==========
$REMOTE <<EOF
set -e
sudo chown -R www-data:www-data '${TARGET_DIR}'
sudo ln -sfn '${TARGET_DIR}' '${NGINX_ROOT_LINK}'
sudo chown -h www-data:www-data '${NGINX_ROOT_LINK}'
sudo nginx -t && sudo systemctl reload nginx
cd '${RELEASES_DIR}'
ls -1dt */ 2>/dev/null | tail -n +$((${KEEP_RELEASES}+1)) | xargs -r rm -rf
echo "👉 CURRENT_ROOT=\$(readlink -f '${NGINX_ROOT_LINK}')"
EOF

echo "🟢  Deploy completed : ${STAMP}"
