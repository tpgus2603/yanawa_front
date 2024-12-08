import React, { useEffect } from "react";
import GoogleLogoIcon from "../components/icons/GoogleLogoIcon";
import Button from "../components/Button";
import { getLoginUrl } from "../api/auth";
import useAuthStore from "../store/authStore";

const LoginPage = () => {
  const { user, fetchSession, logoutUser, loading } = useAuthStore(); // Zustand 상태 가져오기

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    fetchSession(); // 세션 정보 가져오기
  }, [fetchSession]);

  // Google 로그인 처리
  const handleGoogleLogin = () => {
    const fcmToken = localStorage.getItem("fcmToken"); // FCM 토큰 가져오기

    // 기본 로그인 URL
    let loginUrl = getLoginUrl();

    // fcmToken이 있을 경우 state 파라미터에 추가
    if (fcmToken) {
      loginUrl += `?state=${encodeURIComponent(fcmToken)}`;
      console.log("FCM Token이 포함된 loginUrl:", loginUrl);
    } else {
      console.warn("FCM Token이 localStorage에 없습니다");
    }

    // Google OAuth로 리다이렉트
    window.location.href = loginUrl;
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    await logoutUser(); // 로그아웃 실행
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">로딩 중...</p>
      </div>
    );
  }

  // 로그인된 상태
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="flex flex-col items-center min-w-[260px] w-1/2 max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-900">
              환영합니다!
            </h2>
            <h2 className="text-xl font-bold text-center text-primary-500">
              {user.name}님
            </h2>
          </div>
          <p className="text-center text-gray-600">
            <span className="font-bold text-primary-500">번개모임</span>을
            생성하거나 참여해 보세요!
          </p>
          <Button size="md" theme="black" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    );
  }

  // 비로그인 상태
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="flex flex-col items-center min-w-[260px] justify-center w-1/2 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>
        <Button
          size="md"
          theme="white"
          icon={<GoogleLogoIcon />}
          onClick={handleGoogleLogin}
        >
          구글로 로그인
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
