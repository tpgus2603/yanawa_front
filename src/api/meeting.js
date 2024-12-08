// src/api/meeting.js

// 기본 API URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

// 내가 참여하고 있는 채팅방 가져오기
export const fetchMyMeetings = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/meeting/my?page=${page}&size=${size}`,
      {
        method: "GET",
        credentials: "include", // 세션 기반 인증을 위해 필요
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to fetch meetings.");
    }

    return result.data; // 서버에서 제공된 데이터 반환
  } catch (error) {
    console.error("Error fetching my meetings:", error);
    throw error;
  }
};
