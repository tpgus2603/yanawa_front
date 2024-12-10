import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "./ChattingDetail.css";
import styled, { keyframes } from "styled-components";
import { FaSearch, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Button from "../components/Button";
import ChattingNoticeDetailModal from "../components/ChattingNoticeDetailModal";
import ChattingNoticeListModal from "../components/ChattingNoticeListModal";

// 웹소켓 서버 연결 URL
const WS_URL = process.env.REACT_APP_WS_URL;

// 흔들리는 애니메이션을 위한 keyframes 정의
const shakeAnimation = keyframes`
  0% { transform: translateY(0); }
  25% { transform: translateY(-5px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(5px); }
  100% { transform: translateY(0); }
`;

const ChatRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* 전체 화면 높이 */
  width: 100%;
  overflow: hidden; /* 부모 요소의 스크롤 제거 */
`;

const ChatRoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  input {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  .arrow-buttons {
    display: flex;
    align-items: center;
    margin-left: 10px;

    svg {
      cursor: pointer;
      margin-left: 5px;
    }
  }
`;

const ChatRoomMessages = styled.div`
  flex: 1;
  overflow-y: auto; /* 메시지 영역만 스크롤 가능 */
  padding: 10px;
  margin-top: 10px; /* 검색 바와 메시지 사이 여백 */
`;

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isMine ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: ${(props) => (props.highlighted ? "2px solid blue" : "none")};
  transition: background-color 0.3s ease, border 0.3s ease;
  animation: ${(props) => (props.highlighted ? shakeAnimation : "none")} 0.5s
    ease;
`;

const MessageBubble = styled.div`
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  background-color: ${(props) => (props.isMine ? "#dcf8c6" : "#f9f9f9")};
  text-align: ${(props) => (props.isMine ? "right" : "left")};
  border: ${(props) => (props.highlighted ? "2px solid blue" : "none")};
  word-wrap: break-word;
  transition: background-color 0.3s ease, border 0.3s ease;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  animation: ${(props) => (props.highlighted ? shakeAnimation : "none")} 0.5s
    ease;
`;

const CenteredMessage = styled.div`
  text-align: center;
  font-size: 0.9em;
  color: #888;
  margin: 20px 0;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
  max-width: 50%;
  margin-left: auto;
  margin-right: auto;
`;

const MessageTimestamp = styled.div`
  font-size: 0.8em;
  color: #888;
  text-align: ${(props) => (props.isMine ? "right" : "left")};
`;

const ChatRoomInput = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;

  input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    margin-right: 10px;
  }

  button {
    padding: 10px;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
`;

const FixedSearchBar = styled(SearchBar)`
  position: sticky;
  top: 0; /* 화면 상단에 고정 */
  z-index: 10; /* 다른 요소 위에 표시 */
  background-color: white; /* 배경색 지정 */
  border-bottom: 1px solid #ddd;
`;

const NoticeContainer = styled.div`
  background-color: ${({ isCollapsed }) =>
    isCollapsed ? "transparent" : "#f8f9fa"};
  padding: ${({ isCollapsed }) => (isCollapsed ? "0" : "10px")};
  border-bottom: ${({ isCollapsed }) =>
    isCollapsed ? "none" : "1px solid #ddd"};
  position: relative; /* 확성기 위치 조정을 위해 사용 */
`;

const NoticeMessage = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 최대 3줄까지만 표시 */
  white-space: normal;
  height: calc(1.3em * 3); /* 3줄 높이로 제한 */
  cursor: pointer;
  margin-bottom: -30px; /* 메시지와 작성자 사이 간격 */
`;

const NoticeSender = styled.div`
  font-size: 0.875rem;
  color: #888;
  text-align: left;
`;

const NoticeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;

  button {
    padding: 5px 10px;
    border: none;
    background-color: #e7e7e7;
    color: #555;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
  }

  button:hover {
    background-color: #d6d6d6;
  }
`;

function ChattingDetail() {
  const { chatRoomId } = useParams();
  const location = useLocation();
  const { nickname, chatRoomName } = location.state;

  // const [notice, setNotice] = useState(null); // 공지 메시지
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(nickname);
  const [chatUnread, setChatUnread] = useState({});
  // const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [notice, setNotice] = useState(null); // 공지 메시지
  const [isNoticeVisible, setIsNoticeVisible] = useState(true); // 공지 표시 여부
  const [isNoticeCollapsed, setIsNoticeCollapsed] = useState(false); // 공지 접힘 여부
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isNoticeDetailModalOpen, setIsNoticeDetailModalOpen] = useState(false); // 공지 상세 모달 상태
  const [selectedNotice, setSelectedNotice] = useState(null); // 선택된 공지
  const [notices, setNotices] = useState([]); // 공지사항 목록

  // const chatRoomMessagesRef = useRef(null); // 메시지 컨테이너 참조
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const highlightedMessageRef = useRef(null);
  const isTabActiveRef = useRef(true); // useRef로 상태 초기화

  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  // let isTabActive = true; // 브라우저 탭 상태를 저장

  const lastReadLogIdRef = useRef(null);

  const chatUnreadSortArray = useMemo(() => {
    return Object.entries(chatUnread).sort(([key1], [key2]) => {
      return key1.localeCompare(key2);
    });
  }, [chatUnread]);

  const toggleSearchBar = () => {
    setIsSearching((prevState) => !prevState);
  };

  const unreadCount = useCallback(
    (logId) => {
      if (chatUnreadSortArray.length === 0) {
        return 0;
      }

      for (let i = 0; i < chatUnreadSortArray.length; i++) {
        if (logId <= chatUnreadSortArray[i][1]) {
          return i === 0 ? 0 : Number(chatUnreadSortArray[i - 1][0]);
        }
      }

      return Number(chatUnreadSortArray[chatUnreadSortArray.length - 1][0]);
    },
    [chatUnreadSortArray]
  );

  const handleNoticeClick = () => {
    setSelectedNotice(notice); // 현재 공지사항을 선택
    setIsNoticeDetailModalOpen(true); // 상세 모달 열기
  };

  const closeNoticeDetailModal = () => {
    setIsNoticeDetailModalOpen(false); // 상세 모달 닫기
  };

  const handleNoticeCollapse = () => {
    setIsNoticeCollapsed(true); // 공지를 접음
  };

  const handleMegaphoneClick = () => {
    setIsNoticeCollapsed(false); // 공지를 펼침
  };

  const handleDismissNotice = () => {
    const dismissedNotices =
      JSON.parse(localStorage.getItem("dismissedNotices")) || [];

    // 현재 공지사항이 로컬 스토리지에 추가되도록 처리
    if (notice && !dismissedNotices.includes(notice.message)) {
      dismissedNotices.push(notice.message);
      localStorage.setItem(
        "dismissedNotices",
        JSON.stringify(dismissedNotices)
      );
    }

    setIsNoticeVisible(false); // 공지를 숨김
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/chat/unread-count/${chatRoomId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setChatUnread(data);
      } else {
        console.error("Failed to fetch unread counts");
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  /// 합친 코드
  const updateUserStatusAndLogId = async (status) => {
    let logId = null;
    // isOnline이 false일 경우 마지막 메시지의 logId를 가져옴
    // isOnline이 false로 전환될 때 마지막 메시지가 없으면 가장 최근 메시지의 logId를 설정
    if (!status) {
      if (messages.length > 0) {
        logId = messages[messages.length - 1]._id; // 가장 최근 메시지의 logId로 설정
      } else {
        logId = lastReadLogIdRef.current; // 마지막 읽은 logId를 그대로 유지
      }
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/chat/update-status-and-logid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatRoomId,
            nickname,
            isOnline: status,
            logId: logId, // 상태에 따라 logId도 함께 보냄
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status and logId");
      }

      console.log(
        `${nickname} : 상태업데이트 to ${status}, logId updated to ${logId} for `
      );
    } catch (err) {
      console.error("Error updating status and logId:", err);
    }
  };

  const handleRightClick = async (e, messageData) => {
    e.preventDefault();
    if (window.confirm("이 메시지를 공지로 설정하시겠습니까?")) {
      try {
        const noticeMessage = {
          type: "notice", // 메시지 유형: 공지사항 설정
          chatRoomId: chatRoomId, // 현재 채팅방 ID
          nickname: loggedInUser, // 공지 설정한 사용자 닉네임
          text: messageData.message, // 공지 내용
        };

        // WebSocket을 통해 서버로 메시지 전송
        ws.current.send(JSON.stringify(noticeMessage));
        console.log("공지사항 설정 메시지 전송:", noticeMessage);

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/chat/${chatRoomId}/notices`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: messageData.sender,
              message: messageData.message,
            }),
          }
        );

        if (response.ok) {
          const newNotice = await response.json();
          setNotice(newNotice); // 공지를 로컬 상태로 업데이트
        } else {
          console.error("Failed to set notice");
        }
      } catch (error) {
        console.error("Error setting notice:", error);
      }
    }
  };

  // // 새로운 메시지가 왔을 때만 스크롤
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     const lastMessage = messages[messages.length - 1];
  //     if (lastMessage.type === 'message') {
  //       scrollToBottom();
  //     }
  //   }
  // }, [messages]); // messages가 변경될 때만 실행

  // const scrollToBottom = () => {
  //   console.log("바닥 스크롤")
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  const fetchLatestNotice = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/chat/${chatRoomId}/notices/latest`
      );
      if (response.ok) {
        const latestNotice = await response.json();

        const dismissedNotices =
          JSON.parse(localStorage.getItem("dismissedNotices")) || [];
        const isDismissed = dismissedNotices.includes(latestNotice.message);

        // 새로운 공지라면 표시하고, 숨겨진 공지가 아니라면 표시
        setNotice(latestNotice);
        setIsNoticeVisible(!isDismissed);
      } else if (response.status === 404) {
        // 공지가 없는 경우 처리
        setNotice(null);
        setIsNoticeVisible(false);
      } else {
        console.error("Failed to fetch latest notice");
      }
    } catch (error) {
      console.error("Error fetching latest notice:", error);
    }
  };

  const scrollToHighlightedMessage = () => {
    if (highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const joinRoom = () => {
    if (ws.current) {
      ws.current.close(); // 기존 WebSocket 연결 종료
    }

    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => {
      if (ws.current.isTimedOut) {
        console.log(`타임아웃된 클라이언트의 재연결을 차단: ${nickname}`);
        ws.current.close();
        return;
      }

      reconnectAttempts = 0; // 재연결 성공 시 시도 횟수 초기화
      const joinMessage = JSON.stringify({
        type: "join",
        chatRoomId,
        nickname,
      });
      ws.current.send(joinMessage);
      console.log(
        `(클라이언트) WebSocket 연결 완료 - 채팅방: ${chatRoomId}, 닉네임: ${nickname}`
      );
    };

    ws.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("받은 메시지", messageData);

      if (messageData.type === "status") {
        const { nickname, isOnline } = messageData;
        if (!isOnline) {
          console.log(`${nickname}님이 오프라인 상태로 전환되었습니다.`);
        }
        fetchUnreadCounts();
        return;
      }

      if (messageData.type === "notice") {
        // 공지사항 변경 이벤트 처리
        console.log("새 공지사항 알림 수신:", messageData);
        setNotice({
          sender: messageData.sender,
          message: messageData.message,
        });
        setIsNoticeVisible(true); // 공지를 표시하도록 설정
        fetchLatestNotice(); // 최신 공지사항 업데이트
      } else if (messageData.type === "previousMessages") {
        // setMessages((prevMessages) => [...prevMessages, ...messageData.messages]);
        setMessages((prevMessages) => {
          const messageIds = new Set(prevMessages.map((msg) => msg._id)); // 기존 메시지의 ID 저장
          const newMessages = messageData.messages.filter(
            (msg) => !messageIds.has(msg._id)
          ); // 중복 제거
          return [...prevMessages, ...newMessages];
        });
      } else {
        // setMessages((prevMessages) => [...prevMessages, messageData]);
        setMessages((prevMessages) => {
          const messageIds = new Set(prevMessages.map((msg) => msg._id)); // 기존 메시지의 ID 저장
          if (!messageIds.has(messageData._id)) {
            // 새 메시지가 중복되지 않으면 추가
            return [...prevMessages, messageData];
          }
          return prevMessages;
        });

        lastReadLogIdRef.current = messageData._id;
        // messages 배열에 메시지가 추가된 후에 logId를 업데이트
        const lastMessage = messageData; // 새로 받은 메시지
        lastReadLogIdRef.current = lastMessage._id;

        console.log("Received message logId:", lastReadLogIdRef.current);
        if (
          !chatUnreadSortArray.length ||
          chatUnreadSortArray[chatUnreadSortArray.length - 1][1] <=
            messageData._id
        ) {
          fetchUnreadCounts(chatRoomId);
        }
      }
      updateLastReadAt();
    };

    ws.current.onclose = async (event) => {
      console.warn("(클라이언트)WebSocket 연결이 종료되었습니다.", event);

      // 탭이 활성화된 상태에서만 재연결 시도
      if (
        isTabActiveRef.current &&
        reconnectAttempts < MAX_RECONNECT_ATTEMPTS
      ) {
        setTimeout(() => {
          console.log(
            `WebSocket 재연결 시도 (${
              reconnectAttempts + 1
            }/${MAX_RECONNECT_ATTEMPTS})`
          );
          reconnectAttempts++;
          joinRoom(); // 재연결 시도
        }, 2000); // 2초 후 재연결
      } else if (!isTabActiveRef.current) {
        console.log(
          "브라우저 탭이 비활성화 상태입니다. WebSocket 재연결을 시도하지 않습니다."
        );
      } else {
        console.error("WebSocket 재연결 실패: 최대 시도 횟수를 초과했습니다.");
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket 오류:", error);
    };
  };

  const updateLastReadAt = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/chat/update-read-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatRoomId, nickname }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lastReadAt");
      }

      console.log("lastReadAt updated for", nickname);
    } catch (err) {
      console.error("Error updating lastReadAt:", err);
    }
  };

  // // 채팅방에서 퇴장
  // const leaveRoom = () => {
  //   const leaveMessage = JSON.stringify({
  //     type: 'leave',
  //     chatRoomId,
  //     nickname,
  //   });
  //   try {
  //     ws.current.send(leaveMessage);  // 서버로 퇴장 메시지 전송
  //     console.log('퇴장 메시지 전송:', leaveMessage);
  //     ws.current.close();  // 웹소켓 연결 종료
  //   } catch (error) {
  //     console.error('퇴장 메시지 전송 오류:', error);
  //   }
  // };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const results = messages.filter((message) =>
        message.message.includes(searchTerm)
      );
      setSearchResults(results);
      setCurrentSearchIndex(results.length > 0 ? results.length - 1 : -1);
      setIsSearching(true);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 100);
    }
  };

  const handleArrowDown = () => {
    if (
      searchResults.length > 0 &&
      currentSearchIndex < searchResults.length - 1
    ) {
      setCurrentSearchIndex((prevIndex) => prevIndex + 1);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 0);
    } else {
      alert("더 이상 검색결과가 없습니다.");
    }
  };

  const handleArrowUp = () => {
    if (searchResults.length > 0 && currentSearchIndex > 0) {
      setCurrentSearchIndex((prevIndex) => prevIndex - 1);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 0);
    } else {
      alert("더 이상 검색결과가 없습니다.");
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const message = JSON.stringify({
        type: "message",
        chatRoomId,
        sender: loggedInUser,
        nickname,
        text: input,
      });

      try {
        ws.current.send(message);
        console.log("전송한 메시지:", message);
        updateLastReadAt();
      } catch (error) {
        console.error("메시지 전송 오류:", error);
      }

      setInput("");
    } else {
      alert("메시지를 입력하세요.");
    }
  };

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    let heartbeatInterval;

    const sendHeartbeat = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const heartbeatMessage = JSON.stringify({
          type: "heartbeat",
          chatRoomId,
          nickname,
        });
        ws.current.send(heartbeatMessage);
        // console.log('Heartbeat sent:', heartbeatMessage);
      }
    };

    const startHeartbeat = () => {
      // 5초 간격으로 Heartbeat 전송
      heartbeatInterval = setInterval(sendHeartbeat, 5000);
    };

    const stopHeartbeat = () => {
      clearInterval(heartbeatInterval);
    };

    joinRoom();
    // WebSocket 연결 시 Heartbeat 시작
    startHeartbeat();

    updateLastReadAt();

    // 탭 상태가 변경되면 Heartbeat 중단/재개
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        stopHeartbeat();
      } else if (document.visibilityState === "visible") {
        startHeartbeat();
      }
    });

    return () => {
      if (ws.current) ws.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // 브라우저 탭이 비활성화되었을 때
        // isTabActive = false; // 탭 비활성화 상태로 설정
        isTabActiveRef.current = false; // 탭 비활성화 상태로 설정
        updateUserStatusAndLogId(false);
        if (ws.current) {
          ws.current.close(); // WebSocket 연결 종료
          console.log("브라우저 탭 비활성화: WebSocket 연결 종료");
        }
      } else if (document.visibilityState === "visible") {
        // 브라우저 탭이 다시 활성화되었을 때
        // isTabActive = true; // 탭 활성화 상태로 설정
        isTabActiveRef.current = false; // 탭 비활성화 상태로 설정
        updateUserStatusAndLogId(true);
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          console.log("브라우저 탭 활성화: WebSocket 연결 재시작");
          joinRoom(); // WebSocket 재연결 시도
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  useEffect(() => {
    if (searchResults.length > 0) {
      scrollToHighlightedMessage();
    }
  }, [currentSearchIndex, searchResults.length]);

  useEffect(() => {
    console.log("chatRoomId:", chatRoomId);
    console.log("nickname:", nickname);
    setLoggedInUser(nickname);
  }, [chatRoomId, nickname]);

  useEffect(() => {
    fetchLatestNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]); // 채팅방 ID가 변경될 때마다 공지사항 업데이트

  useEffect(() => {
    // 공지사항 목록 가져오기
    const fetchNotices = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/chat/${chatRoomId}/notices`
        );
        if (response.ok) {
          const data = await response.json();
          setNotices(data); // 공지사항 목록 업데이트
        } else {
          console.error("Failed to fetch notices");
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    fetchNotices();
  }, [chatRoomId]);

  useEffect(() => {
    // 공지가 변경되면 렌더링
    console.log("공지사항 업데이트:", notice);
  }, [notice]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      updateUserStatusAndLogId(false);
      if (ws.current) {
        ws.current.close(); // WebSocket 연결 종료
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload); // 브라우저 종료/새로고침 이벤트 리스너 추가

    return () => {
      console.log("페이지 이동시 상태 업데이트");
      updateUserStatusAndLogId(false); // 페이지 이동 시 상태 업데이트
      window.removeEventListener("beforeunload", handleBeforeUnload); // 컴포넌트 언마운트 시 이벤트 리스너 제거
      if (ws.current) {
        ws.current.close(); // WebSocket 연결 종료
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]); // chatRoomId 변경 또는 컴포넌트 언마운트 시 실행

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    localStorage.setItem(`loadedPreviousMessages-${chatRoomId}`, "true");

    const hasLoadedPreviousMessages = localStorage.getItem(
      `loadedPreviousMessages-${chatRoomId}`
    );

    if (
      !hasLoadedPreviousMessages &&
      lastMessage &&
      lastMessage.type === "previousMessages"
    ) {
      return; // 이전 메시지일 경우 자동 스크롤 방지
    }

    // 새 메시지 수신 시 자동으로 아래로 스크롤
    if (
      lastMessage &&
      lastMessage.type === "message" &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatRoomId]);

  const highlightSearchTerm = (message) => {
    if (!searchTerm) return message;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = message.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span
          key={index}
          style={{ backgroundColor: "yellow", fontWeight: "bold" }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <ChatRoomContainer>
      <ChatRoomHeader>
        <h1 className="text-gray-800 heading-1">{chatRoomName}</h1>
        {/* 검색 버튼 */}
        <Button
          size="lg"
          theme="pink"
          icon={<FaSearch />}
          onClick={toggleSearchBar}
        ></Button>
      </ChatRoomHeader>

      {/* 공지사항 */}
      {isNoticeVisible && notice && (
        <NoticeContainer isCollapsed={isNoticeCollapsed}>
          {!isNoticeCollapsed ? (
            <>
              <NoticeMessage
                isCollapsed={isNoticeCollapsed}
                onClick={handleNoticeClick}
              >
                📢 {notice?.message}
              </NoticeMessage>
              <NoticeSender>{notice?.sender}</NoticeSender>
              <NoticeActions>
                <button onClick={handleNoticeCollapse}>접어두기</button>
                <button onClick={handleDismissNotice}>다시 열지 않음</button>
              </NoticeActions>
            </>
          ) : (
            <Button
              size="lg"
              theme="mix"
              onClick={handleMegaphoneClick}
              style={{
                position: "absolute",
                bottom: "-100px",
                right: "30px",
                zIndex: "20",
              }}
            >
              📢
            </Button>
          )}
        </NoticeContainer>
      )}

      {/* 공지사항 상세 모달 */}
      {isNoticeDetailModalOpen && (
        <ChattingNoticeDetailModal
          initialNotice={selectedNotice}
          notices={notices}
          onClose={closeNoticeDetailModal}
          onSelectNotice={(notice) => setSelectedNotice(notice)}
        />
      )}

      {/* 공지사항 목록 모달 */}
      {isNoticeModalOpen && (
        <ChattingNoticeListModal
          notices={notices}
          onClose={() => setIsNoticeModalOpen(false)}
          onNoticeClick={(notice) => {
            setSelectedNotice(notice);
            setIsNoticeDetailModalOpen(true);
          }}
        />
      )}

      {isSearching && (
        <FixedSearchBar>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            placeholder="대화 내용 검색"
            className="flex-[1.2] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-3"
          />
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              theme="purple"
              onClick={handleArrowUp}
              state={currentSearchIndex > 0 ? "default" : "disable"}
              icon={<FaArrowUp />}
            />
            <Button
              size="sm"
              theme="purple"
              onClick={handleArrowDown}
              state={
                currentSearchIndex < searchResults.length - 1
                  ? "default"
                  : "disable"
              }
              icon={<FaArrowDown />}
            />
            <Button
              size="sm"
              theme="black"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setCurrentSearchIndex(0);
                setIsSearching(false);
              }}
            >
              닫기
            </Button>
          </div>
        </FixedSearchBar>
      )}

      <ChatRoomMessages>
        {messages.length === 0 ? (
          <p>메시지가 없습니다.</p>
        ) : (
          messages.map((messageData, index) => {
            const isMine = messageData.sender === loggedInUser;
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];

            const sameSenderAsPrev =
              prevMessage && prevMessage.sender === messageData.sender;

            const sameSenderAsNext =
              nextMessage && nextMessage.sender === messageData.sender;

            const messageTime = new Date(
              messageData.timestamp
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            const prevMessageTime =
              prevMessage &&
              new Date(prevMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

            // 새로운 분 단위 메시지인지 확인
            const isNewMinute = !prevMessage || messageTime !== prevMessageTime;
            const isLastMessageInGroup = !sameSenderAsNext;
            const isDifferentUserFromPrev = !sameSenderAsPrev;

            if (messageData.type === "join" || messageData.type === "leave") {
              return (
                <CenteredMessage key={index}>
                  {messageData.message}
                </CenteredMessage>
              );
            }

            const unreadCountValue = unreadCount(messageData._id);

            return (
              <div key={index}>
                {/* 이전 사용자와 다르거나 분이 달라지면 이름 표시 */}
                {isDifferentUserFromPrev && !isMine && (
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "-12px",
                      fontSize: "0.9em",
                      color: "#555",
                    }}
                  >
                    {messageData.sender}
                  </strong>
                )}

                <MessageContainer
                  isMine={isMine}
                  highlighted={
                    searchResults[currentSearchIndex] === messageData
                  }
                  ref={
                    searchResults[currentSearchIndex] === messageData
                      ? highlightedMessageRef
                      : null
                  }
                  style={{
                    marginTop: sameSenderAsPrev ? "-16px" : "8px",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    alignItems: "center", // 중앙 정렬
                  }}
                >
                  {/* 내가 보낸 메시지: 읽지 않은 사람 수는 왼쪽에 표시 */}
                  {isMine && unreadCountValue > 0 && (
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "gray",
                        marginRight: "8px", // 메시지 버블과 간격
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {unreadCountValue}
                    </div>
                  )}

                  <MessageBubble
                    isMine={isMine}
                    highlighted={
                      searchResults[currentSearchIndex] === messageData
                    }
                    onContextMenu={(e) => handleRightClick(e, messageData)}
                    style={{
                      textAlign: "left",
                      maxWidth: "75%", // 화면의 75%를 넘지 않도록 제한
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      {highlightSearchTerm(messageData.message)}
                    </div>

                    {/* 메시지의 하단 시간 표시 */}
                    {(isNewMinute || isLastMessageInGroup) && (
                      <MessageTimestamp isMine={isMine}>
                        {messageTime}
                      </MessageTimestamp>
                    )}
                  </MessageBubble>

                  {/* 상대방이 보낸 메시지: 읽지 않은 사람 수는 오른쪽에 표시 */}
                  {!isMine && unreadCountValue > 0 && (
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "gray",
                        marginLeft: "8px", // 메시지 버블과 간격
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {unreadCountValue}
                    </div>
                  )}
                </MessageContainer>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </ChatRoomMessages>

      <ChatRoomInput>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="w-3/4 px-4 py-2 border rounded-md tablet:w-auto tablet:flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button
          size="lg"
          theme="pink"
          state={input.trim() ? "default" : "disable"}
          onClick={sendMessage}
          className="flex items-center justify-center w-1/4 ml-3 tablet:w-16 whitespace-nowrap" // w-32로 버튼 너비 설정
        >
          전송
        </Button>
      </ChatRoomInput>
    </ChatRoomContainer>
  );
}

export default ChattingDetail;
