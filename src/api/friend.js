// 기본 API URL
const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * 친구 요청 보내기
 * @param {Object} requestData - 요청 데이터 (userId, email)
 * @returns {Promise<Object>} - 생성된 친구 요청 데이터
 */
export const sendFriendRequest = async (requestData) => {
  const response = await fetch(`${BASE_URL}/api/friend/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error("Failed to send friend request");
  }

  return await response.json();
};

/**
 * 받은 친구 요청 조회
 * @returns {Promise<Object[]>} - 받은 친구 요청 리스트
 */
export const getReceivedFriendRequests = async () => {
  const response = await fetch(`${BASE_URL}/api/friend/requests/received`);

  if (!response.ok) {
    throw new Error("Failed to fetch received friend requests");
  }

  return (await response.json()).data;
};

/**
 * 보낸 친구 요청 조회
 * @returns {Promise<Object[]>} - 보낸 친구 요청 리스트
 */
export const getSentFriendRequests = async () => {
  const response = await fetch(`${BASE_URL}/api/friend/requests/sent`);

  if (!response.ok) {
    throw new Error("Failed to fetch sent friend requests");
  }

  return (await response.json()).data;
};

/**
 * 친구 요청 수락
 * @param {number} requestId - 친구 요청 ID
 * @returns {Promise<Object>} - 수락된 친구 요청 데이터
 */
export const acceptFriendRequest = async (requestId) => {
  const response = await fetch(
    `${BASE_URL}/api/friend/request/${requestId}/accept`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to accept friend request");
  }

  return (await response.json()).data;
};

/**
 * 친구 요청 거절
 * @param {number} requestId - 친구 요청 ID
 * @returns {Promise<Object>} - 거절된 친구 요청 데이터
 */
export const rejectFriendRequest = async (requestId) => {
  const response = await fetch(
    `${BASE_URL}/api/friend/request/${requestId}/reject`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reject friend request");
  }

  return (await response.json()).data;
};

/**
 * 친구 목록 조회
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} - 친구 목록 데이터
 */
export const getAllFriends = async (page = 0, size = 10) => {
  const response = await fetch(
    `${BASE_URL}/api/friend/all?page=${page}&size=${size}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch friends list");
  }

  return (await response.json()).data.content;
};

/**
 * 친구 삭제
 * @param {number} friendId - 삭제할 친구 ID
 * @returns {Promise<Object>} - 삭제 결과 데이터
 */
export const deleteFriend = async (friendId) => {
  const response = await fetch(`${BASE_URL}/api/friends/${friendId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete friend");
  }

  return await response.json();
};
