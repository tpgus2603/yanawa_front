import React from "react";
import LogoIcon from "../icons/LogoIcon";
import useAuthStore from "../../store/authStore";

const HeaderLogoBar = () => {
  const { user } = useAuthStore(); // Zustand에서 user 상태 가져오기

  return (
    <div className="flex items-center justify-between w-full h-16 px-4 bg-white">
      {/* 왼쪽: 로고와 앱 이름 */}
      <div className="flex items-center">
        <LogoIcon width={32} height={32} />
        <span className="title-1">YANAWA</span>
      </div>

      {/* 오른쪽: 사용자 이름 */}
      <div className="flex items-center">
        <span className="text-gray-600 label-1">
          {user ? `${user.name}` : "guest"} 님
        </span>
      </div>
    </div>
  );
};

export default HeaderLogoBar;
