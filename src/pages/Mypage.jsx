import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import {
  getReceivedFriendRequests,
  sendFriendRequest,
  getAllFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
} from "../api/friend";
import Button from "../components/Button";
import LogoIcon from "../components/icons/LogoIcon";
import { fetchMyMeetings } from "../api/meeting";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const { user, fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기
  const [activeTab, setActiveTab] = useState("lightning"); // 현재 활성화된 탭
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState(""); // 친구 요청할 이메일
  const [page, setPage] = useState(0); // 친구 목록 페이지
  const [hasNext, setHasNext] = useState(true); // 페이지네이션 상태
  const [isLoading, setIsLoading] = useState(false);

  const [meetings, setMeetings] = useState([]);
  const [meetingPage, setMeetingPage] = useState(0);
  const [meetingHasNext, setMeetingHasNext] = useState(true);
  const [meetingIsLoading, setMeetingIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  // 탭 변경 함수
  const switchTab = (tab) => setActiveTab(tab);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const userInfo = localStorage.getItem("user");
        if (!userInfo) {
          alert("로그인이 필요한 페이지입니다.");
          navigate("/login");
        }
        await fetchSession(); // 세션 정보 가져오기
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchUserSession();
  }, [fetchSession, navigate]); // 페이지 마운트 시 실행

  // 번개 모임 가져오기
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!meetingHasNext || meetingIsLoading || hasError) return;

      try {
        setMeetingIsLoading(true);
        const data = await fetchMyMeetings(meetingPage, 20);
        setMeetings((prev) => [...prev, ...data.content]);
        setMeetingHasNext(data.meetingHasNext);
        setMeetingPage((prev) => prev + 1);
      } catch (error) {
        setHasError(true);
        console.error("Failed to fetch meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "lightning") fetchMeetings();
  }, [activeTab, meetingPage, meetingHasNext, meetingIsLoading]);

  // 받은 친구 요청 조회
  useEffect(() => {
    const fetchReceivedRequests = async () => {
      try {
        const data = await getReceivedFriendRequests();
        setReceivedRequests(data);
      } catch (error) {
        console.error("Failed to fetch received requests:", error);
      }
    };
    if (activeTab === "friends") fetchReceivedRequests();
  }, [activeTab]);

  // 친구 목록 무한스크롤 처리
  useEffect(() => {
    const fetchFriends = async () => {
      if (!hasNext || isLoading || hasError) return;

      try {
        setIsLoading(true);
        const response = await getAllFriends(page, 10);

        const content = Array.isArray(response?.content)
          ? response.content
          : [];
        const nextPage = response?.hasNext ?? false;

        setFriends((prev) => [...prev, ...content]);
        setHasNext(nextPage);
        setPage((prev) => prev + 1);
      } catch (error) {
        setHasError(true);
        console.error("Failed to fetch friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "friends") fetchFriends();
  }, [page, hasNext, activeTab, isLoading]);

  // 친구 요청 보내기
  const handleSendRequest = async () => {
    try {
      const requestData = { email };
      const response = await sendFriendRequest(requestData);
      setSentRequests((prev) => [...prev, response.data]);
      setEmail(""); // 입력 필드 초기화
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  // 친구 요청 수락
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await acceptFriendRequest(requestId);
      setReceivedRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      setFriends((prev) => [response, ...prev]); // 친구 목록에 추가
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  // 친구 요청 거절
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      setReceivedRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  // 친구 삭제
  const handleDeleteFriend = async (friendId) => {
    try {
      await deleteFriend(friendId);
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Failed to delete friend:", error);
    }
  };

  return (
    <div className="w-full max-w-screen-lg min-h-screen mx-auto bg-white">
      {/* 프로필 영역 */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex-shrink-0">
          <LogoIcon className="w-20 h-20 rounded-full" />
        </div>
        <div className="flex-grow ml-6">
          <h1 className="text-xl font-bold">{user?.name || "Guest"}</h1>
          <p className="text-gray-600">{user?.email || "guest@example.com"}</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex justify-center py-2 space-x-6 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "lightning"
              ? "text-secondary-500 border-b-2 border-secondary-500"
              : "text-gray-600"
          }`}
          onClick={() => switchTab("lightning")}
        >
          번개 모임
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "friends"
              ? "text-tertiary-500 border-b-2 border-tertiary-500"
              : "text-gray-600"
          }`}
          onClick={() => switchTab("friends")}
        >
          친구
        </button>
      </div>
      {/* 번개 모임 탭 */}
      {activeTab === "lightning" && (
        <div className="p-4">
          {meetings.length === 0 && !isLoading && (
            <p className="text-center">참여 중인 번개 모임이 없습니다.</p>
          )}
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {meetings.map((meeting) => (
              <Card
                key={meeting.id}
                meeting={meeting}
                theme="purple"
                onClick={() => console.log("Clicked meeting:", meeting.id)}
              />
            ))}
          </div>
          {isLoading && <p className="text-center">로딩 중...</p>}
          {!hasNext && meetings.length > 0 && (
            <p className="text-sm text-center text-gray-500">
              더 이상 불러올 번개 모임이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 친구 탭 */}
      {activeTab === "friends" && (
        <div className="p-4 space-y-8">
          {/* 친구 요청하기 */}
          <div>
            <h2 className="text-lg font-bold">친구 요청하기</h2>
            <div className="flex items-center my-4 space-x-4">
              <input
                type="email"
                className="flex-1 min-w-0 p-3 border rounded-full"
                placeholder="친구 이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                size="md"
                theme="indigo"
                className="min-w-[50px]"
                onClick={handleSendRequest}
              >
                요청
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {sentRequests.map((request) => (
                <div key={request.id} className="p-2 border rounded-lg">
                  <p className="text-sm">
                    {request.receiver.name} ({request.receiver.email})
                  </p>
                  <p className="text-xs text-gray-500">{request.status}</p>
                </div>
              ))}
            </div>
          </div>
          <hr />
          {/* 받은 친구 요청 */}
          <div>
            <h2 className="mb-2 text-lg font-bold">받은 친구 요청</h2>
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-md">
                      {request.requester.name}
                    </h3>
                    <p className="text-[10px] tablet:text-sm text-gray-600">
                      {request.requester.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      theme="indigo"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      수락
                    </Button>
                    <Button
                      size="sm"
                      theme="pink"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      거절
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr />

          {/* 친구 목록 */}
          <div>
            <h2 className="mb-2 text-lg font-bold">친구 목록</h2>
            <div className="space-y-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-md">
                      {friend.friendInfo.name}
                    </h3>
                    <p className="text-[10px] tablet:text-sm text-gray-600">
                      {friend.friendInfo.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    theme="black"
                    onClick={() => handleDeleteFriend(friend.id)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
              {isLoading && <p>로딩 중...</p>}
              {!hasNext && (
                <p className="text-center label-2">더 이상 친구가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
