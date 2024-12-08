// src/api/auth.js

/**
 * Google 로그인 URL 반환
 * @returns {string} 로그인 엔드포인트 URL
 */
export const getLoginUrl = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const fcmToken = localStorage.getItem("fcmToken");

  // fcmToken이 있을 경우 파라미터에 추가
  const params = new URLSearchParams();
  if (fcmToken) {
    params.append("fcmToken", fcmToken);
  }

  return `${baseUrl}/api/auth/login?${params.toString()}`;
};

/**
 * 로그아웃 API 호출
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/auth/logout`,
      {
        method: "GET",
        credentials: "include", // 세션 쿠키 포함
      }
    );
    if (!response.ok) {
      throw new Error("Failed to logout");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

/**
 * 세션 정보 확인 API 호출
 * @returns {Promise<Object|null>} 세션이 있으면 사용자 정보 반환, 없으면 null 반환
 */
export const getSessionInfo = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/session/info`,
      {
        method: "GET",
        credentials: "include", // 세션 쿠키 포함
      }
    );
    if (response.ok) {
      return await response.json(); // 사용자 정보 반환
    }
    return null; // 세션 없음
  } catch (error) {
    console.error("Error checking session info:", error);
    throw error;
  }
};
