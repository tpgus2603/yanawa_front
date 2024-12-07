import React, { useState } from "react";
import LogoIcon from "../icons/LogoIcon";
import useAuthStore from "../../store/authStore";
import Button from "../Button";

const HeaderLogoBar = () => {
  const { user, logoutUser } = useAuthStore(); // Zustand에서 상태 및 메서드 가져오기
  const [loading, setLoading] = useState(false); // 로딩 상태 관리

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true); // 로딩 상태 활성화
      await logoutUser(); // 로그아웃 실행
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div className="flex items-center justify-between w-full h-16 px-4 bg-white shadow-md">
      {/* 왼쪽: 로고와 앱 이름 */}
      <div className="flex items-center">
        <LogoIcon width={32} height={32} />
        <span className="ml-2 text-lg font-bold text-gray-900">YANAWA</span>
      </div>

      {/* 오른쪽: 사용자 정보 및 로그아웃 */}
      <div className="flex items-center">
        <span className="mr-3 text-gray-600 label-1">
          {user ? `${user.name}` : "guest"} 님
        </span>
        {user && (
          <Button size="sm" onClick={handleLogout} disabled={loading}>
            {loading ? "로그아웃 중..." : "로그아웃"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeaderLogoBar;
