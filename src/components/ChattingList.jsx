import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ChattingList() {
  const [rooms, setRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
  const navigate = useNavigate();
  const ws = useRef(null);

  // WebSocket 연결 및 실시간 업데이트
  const setupWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:8081'); // WebSocket 연결

    ws.current.onopen = () => {
      console.log('WebSocket 연결 성공');
    };

    ws.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);

      // 메시지 타입에 따라 처리
      if (messageData.type === 'message') {
        // 해당 채팅방의 마지막 메시지와 읽지 않은 메시지 개수를 업데이트
        console.log("마지막에 전송된 메시지", messageData);
        const { chatRoomId, sender, message, timestamp } = messageData;
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.chatRoomId === chatRoomId
              ? {
                  ...room,
                  lastMessage: { sender, message, timestamp },
                }
              : room
          )
        );
          
        setUnreadCounts(prevUnreadCounts => ({
          ...prevUnreadCounts,
          [chatRoomId]: (prevUnreadCounts[chatRoomId] || 0) + 1, // 새로운 메시지가 도착할 때마다 개수 증가
        }));
      }
    };

    ws.current.onclose = () => {
      console.log('("채팅 목록) WebSocket 연결이 종료되었습니다.');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/chat/rooms");
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/unread-messages/${nickname}`);
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
  };

  const joinRoom = (chatRoomId, chatRoomName) => {
    if (!nickname.trim()) {
      alert("닉네임을 입력하세요.");
      return;
    }
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
  }, [nickname]);

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