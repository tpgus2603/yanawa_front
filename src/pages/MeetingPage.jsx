import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { fetchMyMeetings, joinMeeting } from "../api/meeting";
import CreateMeetingModal from "../components/CreateMeetingModal";

const MeetingPage = () => {
  const navigate = useNavigate();
  const { fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기
  const [meetings, setMeetings] = useState([]);
  const [meetingPage, setMeetingPage] = useState(0);
  const [meetingHasNext, setMeetingHasNext] = useState(true);
  const [meetingIsLoading, setMeetingIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showModal, setShowModal] = useState(false); // 모달 상태 관리

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!meetingHasNext || meetingIsLoading || hasError) return;

      try {
        setMeetingIsLoading(true);
        const data = await fetchMyMeetings(meetingPage, 20); // API 호출
        setMeetings((prev) => [...prev, ...data.content]); // 기존 데이터에 추가
        setMeetingHasNext(data.hasNext);
        setMeetingPage((prev) => prev + 1);
      } catch (error) {
        setHasError(true);
        console.error("Failed to fetch meetings:", error);
      } finally {
        setMeetingIsLoading(false);
      }
    };

    fetchMeetings();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingPage, meetingHasNext, meetingIsLoading]);

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

  const handleCreateMeeting = () => {
    setShowModal(true); // 모달 열기
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      await joinMeeting(meetingId);
      alert("번개 모임에 성공적으로 참가했습니다!");
      // 참가 후 UI를 업데이트할 필요가 있다면 추가
    } catch (error) {
      alert("번개 모임 참가에 실패했습니다.");
      console.error("Error joining meeting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-purple text-white">
        <h1 className="text-xl font-bold">번개 모임</h1>
        <Button size="sm" theme="pink" onClick={handleCreateMeeting}>
          번개 만들기
        </Button>
      </header>

      {/* 번개 모임 리스트 */}
      <main className="p-6">
        {meetings.length === 0 && !meetingIsLoading && (
          <p className="text-center text-gray-500">참여 중인 번개 모임이 없습니다.</p>
        )}
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              meeting={meeting}
              theme="white"
              onClick={() => navigate(`/meetings/${meeting.id}`)} // 상세 페이지로 이동
              onJoin={() => handleJoinMeeting(meeting.id)} // 참가하기 클릭 시 처리
            />
          ))}
        </div>
        {meetingIsLoading && <p className="text-center text-gray-500">로딩 중...</p>}
        {!meetingHasNext && meetings.length > 0 && (
          <p className="mt-4 text-sm text-center text-gray-400">
            더 이상 불러올 번개 모임이 없습니다.
          </p>
        )}
      </main>

      {/* 모달 */}
      {showModal && (
        <CreateMeetingModal onClose={() => setShowModal(false)} /> // 모달 닫기 핸들러
      )}
    </div>
  );
};

export default MeetingPage;

//
// black: "bg-black text-white",
//       white: "bg-white text-black",
//       pink: "bg-gradient-pink text-white",
//       purple: "bg-gradient-purple text-white",
//       indigo: "bg-gradient-indigo text-white",
//       mix: "bg-gradient-mix text-white",
//       gray: "bg-gray-300 text-gray-500"