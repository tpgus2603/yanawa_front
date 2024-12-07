import React, { useEffect, useState } from "react";
import GoogleLogo from "../components/icons/GoogleLogoIcon";
import Button from "../components/Button";
import { getLoginUrl } from "../api/auth";
import useAuthStore from "../store/authStore";

const LoginPage = () => {
  const { user, fetchSession, logoutUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    const fetchSessionInfo = async () => {
      setLoading(true);
      try {
        await fetchSession(); // 세션 정보 가져오기
      } catch (error) {
        console.error("Failed to fetch session info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionInfo();
  }, [fetchSession]);

  // Google 로그인 처리
  const handleGoogleLogin = () => {
    const loginUrl = getLoginUrl(); // 로그인 URL 가져오기
    window.location.href = loginUrl; // 리다이렉트
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="flex flex-col items-center justify-center min-w-[260px] w-1/2 max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="text-center heading-2">환영합니다!</h2>
            <h2 className="text-center heading-1">
              <span className="text-primary-500">{user.name}</span>님
            </h2>
          </div>
          <p className="text-center text-gray-700">
            <span className="text-primary-500 title-1">번개모임</span>을 생성해
            보세요!
          </p>
          <Button size="md" theme="black" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="flex flex-col items-center min-w-[260px] justify-center w-1/2 max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>
        <Button
          size="md"
          theme="white"
          icon={<GoogleLogo />}
          onClick={handleGoogleLogin}
        >
          구글로 로그인
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
