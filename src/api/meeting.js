// src/api/meeting.js

// 기본 API URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

// 번개 모임 조회
export const fetchMyMeetings = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/meeting?page=${page}&size=${size}`,// 내가 참여한 번개 모임 목록 조회할거면 my
      {
        method: "GET",
        credentials: "include", // 세션 기반 인증을 위해 필요
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("번개 모임 조회", response);

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

// 번개 모임 생성
export const createMeeting = async (meetingData) => {
  const response = await fetch(`${BASE_URL}/api/meeting`, {
    method: "POST",
    credentials: "include", // 세션 기반 인증
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create meeting: ${response.status}`);
  }

  return await response.json();
};

// 번개 모임 참가
export const joinMeeting = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}/join`, {
    method: "POST",
    credentials: "include", // 세션 기반 인증
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to join meeting: ${response.status}`);
  }

  return await response.json();
};