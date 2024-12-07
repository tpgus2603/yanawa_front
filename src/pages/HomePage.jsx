import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";

const HomePage = () => {
  const { user, fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        await fetchSession(); // 세션 정보 가져오기
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchUserSession();
  }, [fetchSession]); // 페이지 마운트 시 실행

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen space-y-4">
      <h1 className="heading-1">야나와 홈페이지</h1>
      {user ? (
        <p className="text-lg text-gray-700">
          안녕하세요,{" "}
          <span className="font-bold text-primary-500">{user.name}</span> 님!
        </p>
      ) : (
        <p className="text-lg text-gray-700">로그인이 필요합니다.</p>
      )}
    </div>
  );
};

export default HomePage;
