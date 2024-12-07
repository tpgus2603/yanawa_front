import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './ChattingDetail.css';
import styled, { keyframes } from 'styled-components';
import { FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Button from "../components/Button";

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
  overflow-y: auto;
  padding: 10px;
  margin-top: 10px;
`;

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: ${(props) => (props.highlighted ? '2px solid blue' : 'none')};
  transition: background-color 0.3s ease, border 0.3s ease;
  animation: ${(props) => (props.highlighted ? shakeAnimation : 'none')} 0.5s ease;
`;

const MessageBubble = styled.div`
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  background-color: ${(props) => (props.isMine ? '#dcf8c6' : '#f9f9f9')};
  text-align: ${(props) => (props.isMine ? 'right' : 'left')};
  border: ${(props) => (props.highlighted ? '2px solid blue' : 'none')};
  word-wrap: break-word;
  transition: background-color 0.3s ease, border 0.3s ease;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  animation: ${(props) => (props.highlighted ? shakeAnimation : 'none')} 0.5s ease;
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
  text-align: ${(props) => (props.isMine ? 'right' : 'left')};
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

function ChattingDetail() {
  const { chatRoomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname, chatRoomName } = location.state;

  const [notice, setNotice] = useState(null); // 공지 메시지  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(nickname);
  const [chatUnread, setChatUnread] = useState({});
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const chatRoomMessagesRef = useRef(null); // 메시지 컨테이너 참조
  


  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let isTabActive = true; // 브라우저 탭 상태를 저장

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
    [chatUnread]
  );

  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/unread-count/${chatRoomId}`);
      if (response.ok) {
        const data = await response.json();
        setChatUnread(data);
      } else {
        console.error('Failed to fetch unread counts');
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  /// 합친 코드
  const updateUserStatusAndLogId = async (status) => {
    let logId = null;
    // isOnline이 false일 경우 마지막 메시지의 logId를 가져옴
    // isOnline이 false로 전환될 때 마지막 메시지가 없으면 가장 최근 메시지의 logId를 설정
    if (!status) {
      if (messages.length > 0) {
        logId = messages[messages.length - 1]._id;  // 가장 최근 메시지의 logId로 설정
      } else {
        logId = lastReadLogIdRef.current;  // 마지막 읽은 logId를 그대로 유지
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/chat/update-status-and-logid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomId,
          nickname,
          isOnline: status,
          logId: logId,  // 상태에 따라 logId도 함께 보냄
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status and logId');
      }

      console.log(`${nickname} : 상태업데이트 to ${status}, logId updated to ${logId} for `);
    } catch (err) {
      console.error('Error updating status and logId:', err);
    }
  };

  useEffect(() => {
    // 공지가 변경되면 렌더링
    console.log('공지사항 업데이트:', notice);
  }, [notice]);


  const handleRightClick = async (e, messageData) => {
    e.preventDefault();
    if (window.confirm("이 메시지를 공지로 설정하시겠습니까?")) {
      try {

        const noticeMessage = {
          type: 'notice',          // 메시지 유형: 공지사항 설정
          chatRoomId: chatRoomId, // 현재 채팅방 ID
          nickname: loggedInUser,     // 공지 설정한 사용자 닉네임
          text: messageData.message,          // 공지 내용
        };

        // WebSocket을 통해 서버로 메시지 전송
        ws.current.send(JSON.stringify(noticeMessage));
        console.log('공지사항 설정 메시지 전송:', noticeMessage);


        const response = await fetch(
          `http://localhost:8080/api/chat/${chatRoomId}/notices`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
          console.error('Failed to set notice');
        }
      } catch (error) {
        console.error('Error setting notice:', error);
      }
    }
  };
  
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateUserStatusAndLogId(false);
      if (ws.current) {
        ws.current.close(); // WebSocket 연결 종료
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload); // 브라우저 종료/새로고침 이벤트 리스너 추가

    return () => {
      console.log("페이지 이동시 상태 업데이트");
      updateUserStatusAndLogId(false); // 페이지 이동 시 상태 업데이트
      window.removeEventListener('beforeunload', handleBeforeUnload); // 컴포넌트 언마운트 시 이벤트 리스너 제거
      if (ws.current) {
        ws.current.close(); // WebSocket 연결 종료
      }
    };
  }, [chatRoomId]); // chatRoomId 변경 또는 컴포넌트 언마운트 시 실행

  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const highlightedMessageRef = useRef(null);

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
        const response = await fetch(`http://localhost:8080/api/chat/${chatRoomId}/notices/latest`);
        if (response.ok) {
          const latestNotice = await response.json();

          const dismissedNotices = JSON.parse(localStorage.getItem('dismissedNotices')) || [];
          const isDismissed = dismissedNotices.includes(latestNotice.message);

          setNotice(latestNotice); // 최신 공지 업데이트
          setIsNoticeVisible(!isDismissed); // 숨겨진 공지가 아니면 표시
        } else if (response.status === 404) {
          setNotice(null); // 공지가 없는 경우 처리
          setIsNoticeVisible(false);
        } else {
          console.error('Failed to fetch latest notice');
        }
      } catch (error) {
        console.error('Error fetching latest notice:', error);
      }
  };

  useEffect(() => {
    fetchLatestNotice();
  }, [chatRoomId]); // 채팅방 ID가 변경될 때마다 공지사항 업데이트

  const scrollToHighlightedMessage = () => {
    if (highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const joinRoom = () => {
    if (ws.current) {
      ws.current.close(); // 기존 WebSocket 연결 종료
    }

    ws.current = new WebSocket('ws://localhost:8081');
    ws.current.onopen = () => {
      if (ws.current.isTimedOut) {
        console.log(`타임아웃된 클라이언트의 재연결을 차단: ${nickname}`);
        ws.current.close();
        return;
      }
      
      reconnectAttempts = 0; // 재연결 성공 시 시도 횟수 초기화
      const joinMessage = JSON.stringify({
        type: 'join',
        chatRoomId,
        nickname,
      });
      ws.current.send(joinMessage);
      console.log(`(클라이언트) WebSocket 연결 완료 - 채팅방: ${chatRoomId}, 닉네임: ${nickname}`);
    };

    ws.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("받은 메시지", messageData);

      if (messageData.type === 'status') {
        const { nickname, isOnline } = messageData;
        if (!isOnline) {
          console.log(`${nickname}님이 오프라인 상태로 전환되었습니다.`);
        }
        fetchUnreadCounts();
        return;
      }

      if (messageData.type === 'notice') {
        // 공지사항 변경 이벤트 처리
        console.log('새 공지사항 알림 수신:', messageData);
        setNotice({
          sender: messageData.sender,
          message: messageData.message,
        });
        setIsNoticeVisible(true); // 공지를 표시하도록 설정
        fetchLatestNotice(); // 최신 공지사항 업데이트
      } else if (messageData.type === 'previousMessages') {
        // setMessages((prevMessages) => [...prevMessages, ...messageData.messages]);
        setMessages((prevMessages) => {
          const messageIds = new Set(prevMessages.map((msg) => msg._id)); // 기존 메시지의 ID 저장
          const newMessages = messageData.messages.filter((msg) => !messageIds.has(msg._id)); // 중복 제거
          return [...prevMessages, ...newMessages];
        });
      } else {
        // setMessages((prevMessages) => [...prevMessages, messageData]);
        setMessages((prevMessages) => {
          const messageIds = new Set(prevMessages.map((msg) => msg._id)); // 기존 메시지의 ID 저장
          if (!messageIds.has(messageData._id)) { // 새 메시지가 중복되지 않으면 추가
            return [...prevMessages, messageData];
          }
          return prevMessages;
        });

        lastReadLogIdRef.current = messageData._id;
        // messages 배열에 메시지가 추가된 후에 logId를 업데이트
        const lastMessage = messageData;  // 새로 받은 메시지
        lastReadLogIdRef.current = lastMessage._id;

        console.log('Received message logId:', lastReadLogIdRef.current);
        if (!chatUnreadSortArray.length || chatUnreadSortArray[chatUnreadSortArray.length - 1][1] <= messageData._id) {
          fetchUnreadCounts(chatRoomId);
        }
      }
      updateLastReadAt();
    };

    ws.current.onclose = async (event) => {
      console.warn('(클라이언트)WebSocket 연결이 종료되었습니다.', event);

      // 탭이 활성화된 상태에서만 재연결 시도
      if (isTabActive && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          console.log(`WebSocket 재연결 시도 (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          reconnectAttempts++;
          joinRoom(); // 재연결 시도
        }, 2000); // 2초 후 재연결
      } else if (!isTabActive) {
        console.log('브라우저 탭이 비활성화 상태입니다. WebSocket 재연결을 시도하지 않습니다.');
      } else {
        console.error('WebSocket 재연결 실패: 최대 시도 횟수를 초과했습니다.');
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
  };

  const updateLastReadAt = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/chat/update-read-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatRoomId, nickname }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lastReadAt');
      }

      console.log('lastReadAt updated for', nickname);
    } catch (err) {
      console.error('Error updating lastReadAt:', err);
    }
    
  };

  

  // 채팅방에서 퇴장
  const leaveRoom = () => {
    const leaveMessage = JSON.stringify({
      type: 'leave',
      chatRoomId,
      nickname,
    });
    try {
      ws.current.send(leaveMessage);  // 서버로 퇴장 메시지 전송
      console.log('퇴장 메시지 전송:', leaveMessage);
      ws.current.close();  // 웹소켓 연결 종료
    } catch (error) {
      console.error('퇴장 메시지 전송 오류:', error);
    } 
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const results = messages.filter((message) => message.message.includes(searchTerm));
      setSearchResults(results);
      setCurrentSearchIndex(results.length > 0 ? results.length - 1 : -1);
      setIsSearching(true);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 100);
    }
  };

  const handleArrowDown = () => {
    if (searchResults.length > 0 && currentSearchIndex < searchResults.length - 1) {
      setCurrentSearchIndex((prevIndex) => prevIndex + 1);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 0);
    } else {
      alert('더 이상 검색결과가 없습니다.');
    }
  };

  const handleArrowUp = () => {
    if (searchResults.length > 0 && currentSearchIndex > 0) {
      setCurrentSearchIndex((prevIndex) => prevIndex - 1);
      setTimeout(() => {
        scrollToHighlightedMessage();
      }, 0);
    } else {
      alert('더 이상 검색결과가 없습니다.');
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const message = JSON.stringify({
        type: 'message',
        chatRoomId,
        sender: loggedInUser,
        nickname,
        text: input,
      });

      try {
        ws.current.send(message);
        console.log('전송한 메시지:', message);
        updateLastReadAt();
      } catch (error) {
        console.error('메시지 전송 오류:', error);
      }

      setInput('');
    } else {
      alert('메시지를 입력하세요.');
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
          type: 'heartbeat',
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
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        stopHeartbeat();
      } else if (document.visibilityState === 'visible') {
        startHeartbeat();
      }
    });

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [chatRoomId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') { // 브라우저 탭이 비활성화되었을 때
        isTabActive = false; // 탭 비활성화 상태로 설정
        updateUserStatusAndLogId(false);
        if (ws.current) {
          ws.current.close(); // WebSocket 연결 종료
          console.log('브라우저 탭 비활성화: WebSocket 연결 종료');
        }
      } else if (document.visibilityState === 'visible') { // 브라우저 탭이 다시 활성화되었을 때
        isTabActive = true; // 탭 활성화 상태로 설정
        updateUserStatusAndLogId(true);
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          console.log('브라우저 탭 활성화: WebSocket 연결 재시작');
          joinRoom(); // WebSocket 재연결 시도
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatRoomId]);

  useEffect(() => {
    if (searchResults.length > 0) {
      scrollToHighlightedMessage();
    }
  }, [currentSearchIndex]);

  useEffect(() => {
    console.log('chatRoomId:', chatRoomId);
    console.log('nickname:', nickname);
    setLoggedInUser(nickname);
  }, [chatRoomId, nickname]);

  const highlightSearchTerm = (message) => {
    if (!searchTerm) return message;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = message.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
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
        <h1>채팅방: {chatRoomName}</h1>
        {/* 검색 버튼 */}
        <Button
          size="lg"
          theme="pink"
          icon={<FaSearch />} 
          onClick={toggleSearchBar}
        >
          
        </Button>
      </ChatRoomHeader>

      {isSearching && (
      <FixedSearchBar>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          placeholder="대화 내용 검색"
        />
        <div className="arrow-buttons">
          <FaArrowUp
            onClick={handleArrowUp}
            size={20}
            style={{ pointerEvents: currentSearchIndex > 0 ? 'auto' : 'none', opacity: currentSearchIndex > 0 ? 1 : 0.5 }}
          />
          <FaArrowDown
            onClick={handleArrowDown}
            size={20}
            style={{
              pointerEvents: currentSearchIndex < searchResults.length - 1 ? 'auto' : 'none',
              opacity: currentSearchIndex < searchResults.length - 1 ? 1 : 0.5,
            }}
          />
        </div>
        {searchResults.length === 0 && (
          <p style={{ color: 'gray', fontSize: '0.9em', textAlign: 'center', marginTop: '10px' }}>
            더 이상 검색 결과가 없습니다.
          </p>
        )}
      </FixedSearchBar>
    )}

      <ChatRoomMessages>
        {messages.length === 0 ? (
          <p>메시지가 없습니다.</p>
        ) : (
          messages.map((messageData, index) => {
            if (messageData.type === "join" || messageData.type === "leave") {
              return (
                <CenteredMessage key={index}>{messageData.message}</CenteredMessage>
              );
            }

            return (
              <MessageContainer
                key={index}
                isMine={messageData.sender === loggedInUser}
                highlighted={searchResults[currentSearchIndex] === messageData}
                ref={
                  searchResults[currentSearchIndex] === messageData
                    ? highlightedMessageRef
                    : null
                }
              >
                <MessageBubble 
                  isMine={messageData.sender === loggedInUser}
                  onContextMenu={(e) => handleRightClick(e, messageData)}  
                > 
                  <div>
                    {messageData.sender !== loggedInUser && (
                      <strong>{messageData.sender}</strong>
                    )}
                    {highlightSearchTerm(messageData.message)}
                  </div>
                  <MessageTimestamp isMine={messageData.sender === loggedInUser}>
                    {new Date(messageData.timestamp).toLocaleTimeString()}
                    <span>{` (${unreadCount(
                      messageData._id
                    )}명이 읽지 않음)`}</span>
                  </MessageTimestamp>
                </MessageBubble>
              </MessageContainer>
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
        />
        <button onClick={sendMessage}>전송</button>
      </ChatRoomInput>
    </ChatRoomContainer>
  );
}

export default ChattingDetail;