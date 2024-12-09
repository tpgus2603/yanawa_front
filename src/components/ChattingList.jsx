import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

// 웹소켓 서버 연결 URL
const WS_URL = process.env.REACT_APP_WS_URL;

function ChattingList() {
  const [rooms, setRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [nickname] = useState(localStorage.getItem("nickname") || "");
  const { user, fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기
  const navigate = useNavigate();
  const ws = useRef(null);

  // WebSocket 연결 및 실시간 업데이트
  const setupWebSocket = () => {
    console.log("연결하는 url", WS_URL);
    // ws.current = new WebSocket(WS_URL); // WebSocket 연결
    ws.current = new WebSocket(WS_URL, [], {
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": `${process.env.REACT_APP_BASE_URL}`,
      },
    });

    ws.current.onopen = () => {
      console.log('WebSocket 연결 성공');
    };

    ws.current.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);

        if (messageData.type === 'message') {
          const { chatRoomId, sender, message, timestamp } = messageData;

          // 마지막 메시지 업데이트
          setRooms((prevRooms) =>
            prevRooms.map((room) =>
              room.chatRoomId === chatRoomId
                ? {
                    ...room,
                    lastMessage: { sender, message, timestamp },
                  }
                : room
            )
          );

          // 읽지 않은 메시지 개수 업데이트
          setUnreadCounts((prevUnreadCounts) => ({
            ...prevUnreadCounts,
            [chatRoomId]: (prevUnreadCounts[chatRoomId] || 0) + 1,
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('("채팅 목록) WebSocket 연결이 종료되었습니다.');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);

      if (error.target) {
        console.error("WebSocket 오류 대상:", error.target);
      }
    };
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/chat/rooms`, {
        method: "GET",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // const fetchUnreadMessages = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:8080/api/chat/unread-messages/${nickname}`);
  //     if (!response.ok) throw new Error("Failed to fetch unread messages");
  //     const data = await response.json();
  //     const joinedChatRoomIds = data.map((chatRoom) => chatRoom.chatRoomId);
  //     const unreadCountsMap = data.reduce((acc, chatRoom) => {
  //       acc[chatRoom.chatRoomId] = chatRoom.unreadCount;
  //       return acc;
  //     }, {});
  //     setJoinedRooms(joinedChatRoomIds);
  //     setUnreadCounts(unreadCountsMap);
  //   } catch (err) {
  //     console.error("Error fetching unread messages:", err);
  //   }
  // };
  const fetchUnreadMessages = useCallback(async () => {
    try {

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/chat/unread-messages/${nickname}`, {
        method: "GET",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch unread messages");
      const data = await response.json();
      const joinedChatRoomIds = data.map((chatRoom) => chatRoom.chatRoomId);
      const unreadCountsMap = data.reduce((acc, chatRoom) => {
        acc[chatRoom.chatRoomId] = chatRoom.unreadCount;
        return acc;
      }, {});
      setJoinedRooms(joinedChatRoomIds);
      setUnreadCounts(unreadCountsMap);
    } catch (err) {
      console.error("Error fetching unread messages:", err);
    }
  }, [nickname]);

  const joinRoom = (chatRoomId, chatRoomName) => {
    setUnreadCounts((prevUnreadCounts) => ({
      ...prevUnreadCounts,
      [chatRoomId]: 0,
    }));
    navigate(`/chat/chatRoom/${chatRoomId}`, { state: { nickname, chatRoomId, chatRoomName } });
  };

  useEffect(() => {
    console.log("Unread counts updated:", unreadCounts);
  }, [unreadCounts]);

  useEffect(() => {
    fetchRooms();
    if (nickname) {
      fetchUnreadMessages();
    }
    setupWebSocket(); // WebSocket 연결 설정
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [nickname, fetchUnreadMessages]);

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

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6 font-sans">
        <h1 className="text-3xl font-bold mb-6">번개 채팅방 목록</h1>
        <p className="text-center text-gray-500">로그인이 필요합니다. 로그인 페이지로 이동해주세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">번개 채팅방 목록</h1>
      <div className="flex justify-start mb-4">
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {rooms.length === 0 ? (
          <p className="text-gray-500 p-6 text-center">생성된 채팅방이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rooms.map((chatRoom) => (
              <li
                key={chatRoom.chatRoomId}
                className="flex items-center justify-between w-full p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => joinRoom(chatRoom.chatRoomId, chatRoom.chatRoomName)} // 클릭하면 상세 페이지로 이동
              >
                <div className="flex items-center w-full">
                  <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden mr-4">
                    <img
                      src="https://via.placeholder.com/50"
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800">{chatRoom.chatRoomName}</div>
                    <div className="text-sm text-gray-600">
                      <strong>{chatRoom.lastMessage?.sender || "없음"}:</strong>{" "}
                      {chatRoom.lastMessage?.message || "메시지 없음"}
                    </div>
                  </div>
                  {joinedRooms.includes(chatRoom.chatRoomId) && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts[chatRoom.chatRoomId] || 0}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ChattingList;