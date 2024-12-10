import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import CreateMeetingModal from "../components/CreateMeetingModal";
import MeetingDetailModal from "../components/MeetingDetailModal";
import {
  getAllMeetings,
  getMyMeetings,
  getMeetingDetails,
  joinMeeting,
  deleteMeeting,
  closeMeeting,
  leaveMeeting,
} from "../api/meeting";

const MeetingPage = () => {
  const navigate = useNavigate();
  const { fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기
  const [activeTab, setActiveTab] = useState("all"); // 현재 활성화된 탭 (전체/내 번개)
  const [meetings, setMeetings] = useState([]);
  const [myMeetings, setMyMeetings] = useState([]);
  const [meetingPage, setMeetingPage] = useState(0);
  const [myMeetingPage, setMyMeetingPage] = useState(0);
  const [meetingHasNext, setMeetingHasNext] = useState(true);
  const [myMeetingHasNext, setMyMeetingHasNext] = useState(true);
  const [meetingIsLoading, setMeetingIsLoading] = useState(false);
  const [myMeetingIsLoading, setMyMeetingIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // 모임 생성 모달
  const [showDetailModal, setShowDetailModal] = useState(false); // 모임 상세 모달
  const [selectedMeeting, setSelectedMeeting] = useState(); // 선택된 모임

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

  useEffect(() => {
    const fetchAllMeetings = async () => {
      if (!meetingHasNext || meetingIsLoading || hasError) return;

      try {
        setMeetingIsLoading(true);
        const data = await getAllMeetings(meetingPage, 20);
        setMeetings((prev) => [...prev, ...data.content]);
        setMeetingHasNext(data.hasNext);
        setMeetingPage((prev) => prev + 1);
      } catch (error) {
        setHasError(true);
        console.error("Failed to fetch meetings:", error);
      } finally {
        setMeetingIsLoading(false);
      }
    };

    if (activeTab === "all") {
      fetchAllMeetings();
    }
  }, [activeTab, meetingPage, meetingHasNext, meetingIsLoading, hasError]);

  useEffect(() => {
    const fetchMyMeetings = async () => {
      if (!myMeetingHasNext || myMeetingIsLoading || hasError) return;

      try {
        setMyMeetingIsLoading(true);
        const data = await getMyMeetings(myMeetingPage, 20);
        setMyMeetings((prev) => [...prev, ...data.content]);
        setMyMeetingHasNext(data.hasNext);
        setMyMeetingPage((prev) => prev + 1);
      } catch (error) {
        setHasError(true);
        console.error("Failed to fetch my meetings:", error);
      } finally {
        setMyMeetingIsLoading(false);
      }
    };

    if (activeTab === "my") {
      fetchMyMeetings();
    }
  }, [
    activeTab,
    myMeetingPage,
    myMeetingHasNext,
    myMeetingIsLoading,
    hasError,
  ]);

  const handleCreateMeeting = async () => {
    setShowCreateModal(true); // 모달 열기
  };

  const handleJoinButtonClick = async (e, meetingId) => {
    e.stopPropagation();
    try {
      await joinMeeting(meetingId);
      alert("번개 모임에 성공적으로 참가했습니다!");

      // 최신 데이터 다시 가져오기
      const updatedAllMeetingData = await getAllMeetings(0, meetingPage * 20);
      setMeetings(updatedAllMeetingData.content);
      const updatedMyMeetingData = await getMyMeetings(0, myMeetingPage * 20);
      setMyMeetings(updatedMyMeetingData.content);
    } catch (error) {
      alert("번개 모임 참가에 실패했습니다.");
      console.error("Error joining meeting:", error);
    }
  };

  const handleCardClick = async (meetingId) => {
    try {
      const meetingDetail = await getMeetingDetails(meetingId);
      setSelectedMeeting(meetingDetail);
      setShowDetailModal(true);
    } catch (error) {
      alert("번개 모임 상세 정보 불러오기 실패했습니다.");
      console.error("Error fetching meeting detail:", error);
    }
  };

  const handleDeleteButtonClick = async (e, meetingId) => {
    e.stopPropagation();
    try {
      await deleteMeeting(meetingId);
      alert("번개 모임을 삭제했습니다!");

      // 최신 데이터 다시 가져오기
      const updatedAllMeetingData = await getAllMeetings(0, meetingPage * 20);
      setMeetings(updatedAllMeetingData.content);
      const updatedMyMeetingData = await getMyMeetings(0, myMeetingPage * 20);
      setMyMeetings(updatedMyMeetingData.content);
    } catch (error) {
      alert("번개 모임 삭제에 실패했습니다.");
      console.error("Error deleting meeting:", error);
    }
  };

  const handleLeaveButtonClick = async (e, meetingId) => {
    e.stopPropagation();
    try {
      await leaveMeeting(meetingId);
      alert("번개 모임을 나갔습니다!");

      // 최신 데이터 다시 가져오기
      const updatedAllMeetingData = await getAllMeetings(0, meetingPage * 20);
      setMeetings(updatedAllMeetingData.content);
      const updatedMyMeetingData = await getMyMeetings(0, myMeetingPage * 20);
      setMyMeetings(updatedMyMeetingData.content);
    } catch (error) {
      alert("번개 모임 나가기에 실패했습니다.");
      console.error("Error leaving meeting:", error);
    }
  };

  const handleCloseButtonClick = async (e, meetingId) => {
    e.stopPropagation();
    try {
      await closeMeeting(meetingId);
      alert("번개 모임을 마감했습니다!");

      // 최신 데이터 다시 가져오기
      const updatedAllMeetingData = await getAllMeetings(0, meetingPage * 20);
      setMeetings(updatedAllMeetingData.content);
      const updatedMyMeetingData = await getMyMeetings(0, myMeetingPage * 20);
      setMyMeetings(updatedMyMeetingData.content);
    } catch (error) {
      alert("번개 모임 마감에 실패했습니다.");
      console.error("Error closing meeting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 text-black border-b-2 rounded-t-xl border-grayscale-300">
        <h1 className="heading-1">번개 모임</h1>
        <Button size="lg" theme="mix" onClick={handleCreateMeeting}>
          번개 만들기
        </Button>
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex justify-center py-2 space-x-6 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "all"
              ? "text-secondary-500 border-b-2 border-secondary-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("all")}
        >
          전체 번개 모임
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "my"
              ? "text-tertiary-500 border-b-2 border-tertiary-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("my")}
        >
          나의 번개 모임
        </button>
      </div>

      {/* 번개 모임 리스트 */}
      <main className="p-6">
        {activeTab === "all" && (
          <>
            {meetings.length === 0 && !meetingIsLoading && (
              <p className="text-center text-gray-500">
                현재 조회되는 번개 모임이 없습니다.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
              {meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  meeting={meeting}
                  theme="white"
                  onDetail={() => handleCardClick(meeting.id)}
                  onJoin={(e) => handleJoinButtonClick(e, meeting.id)}
                  onClose={(e) => handleCloseButtonClick(e, meeting.id)}
                  onDelete={(e) => handleDeleteButtonClick(e, meeting.id)}
                  onLeave={(e) => handleLeaveButtonClick(e, meeting.id)}
                />
              ))}
            </div>
            {meetingIsLoading && (
              <p className="text-center text-gray-500">로딩 중...</p>
            )}
            {!meetingHasNext && meetings.length > 0 && (
              <p className="mt-4 text-sm text-center text-gray-400">
                더 이상 불러올 번개 모임이 없습니다.
              </p>
            )}
          </>
        )}

        {activeTab === "my" && (
          <>
            {myMeetings.length === 0 && !myMeetingIsLoading && (
              <p className="text-center text-gray-500">
                현재 조회되는 나의 번개 모임이 없습니다.
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
              {myMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  meeting={meeting}
                  theme="white"
                  onDetail={() => handleCardClick(meeting.id)}
                  onJoin={(e) => handleJoinButtonClick(e, meeting.id)}
                  onClose={(e) => handleCloseButtonClick(e, meeting.id)}
                  onDelete={(e) => handleDeleteButtonClick(e, meeting.id)}
                  onLeave={(e) => handleLeaveButtonClick(e, meeting.id)}
                />
              ))}
            </div>
            {myMeetingIsLoading && (
              <p className="text-center text-gray-500">로딩 중...</p>
            )}
            {!myMeetingHasNext && myMeetings.length > 0 && (
              <p className="mt-4 text-sm text-center text-gray-400">
                더 이상 불러올 나의 번개 모임이 없습니다.
              </p>
            )}
          </>
        )}
      </main>

      {/* 모달 */}
      <CreateMeetingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMeetingCreated={async () => {
          const updatedData = await getAllMeetings(0, meetingPage * 20);
          setMeetings(updatedData.content);
          const updatedMyData = await getMyMeetings(0, myMeetingPage * 20);
          setMyMeetings(updatedMyData.content);
        }}
      />

      <MeetingDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        meeting={selectedMeeting}
      />
    </div>
  );
};

export default MeetingPage;
