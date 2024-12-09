// 기본 API URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * 모든 미팅 불러오기
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 20)
 * @returns {Promise<Object>} - 미팅 데이터
 */
export const getAllMeetings = async (page = 0, size = 20) => {
  const response = await fetch(
    `${BASE_URL}/api/meeting?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }

  return (await response.json()).data;
};

/**
 * 모임 상세 조회
 * @param {number} meetingId - 조회할 모임 ID
 * @returns {Promise<Object>} - 모임 상세 데이터
 */
export const getMeetingDetails = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meeting details");
  }

  return (await response.json()).data;
};

/**
 * 미팅 생성
 * @param {Object} meetingData - 미팅 생성에 필요한 데이터
 * @returns {Promise<Object>} - 생성된 미팅 데이터
 */
export const createMeeting = async (meetingData) => {
  const response = await fetch(`${BASE_URL}/api/meeting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return await response.json();
};

/**
 * 미팅 참가하기
 * @param {number} meetingId - 참가할 미팅 ID
 * @returns {Promise<Object>} - 참가 결과 메시지
 */
export const joinMeeting = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}/join`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to join meeting");
  }

  return await response.json();
};

/**
 * 내가 참가한 미팅 불러오기
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 20)
 * @returns {Promise<Object>} - 참가한 미팅 데이터
 */
export const getMyMeetings = async (page = 0, size = 20) => {
  const response = await fetch(
    `${BASE_URL}/api/meeting/my?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch my meetings");
  }

  return (await response.json()).data;
};

/**
 * 모임 탈퇴
 * @param {number} meetingId - 탈퇴할 모임 ID
 * @returns {Promise<Object>} - 탈퇴 결과 메시지
 */
export const leaveMeeting = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}/leave`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to leave meeting");
  }

  return await response.json();
};

/**
 * 모임 마감
 * @param {number} meetingId - 마감할 모임 ID
 * @returns {Promise<Object>} - 마감 결과 메시지 및 업데이트된 모임 데이터
 */
export const closeMeeting = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}/close`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to close meeting");
  }

  return await response.json();
};

export const deleteMeeting = async (meetingId) => {
  const response = await fetch(`${BASE_URL}/api/meeting/${meetingId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }

  return await response.json();
};
