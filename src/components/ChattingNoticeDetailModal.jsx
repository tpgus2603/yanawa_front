import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "./Button.jsx";

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 90%;
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .profile {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #f0f0f0;
    margin-right: 15px;
  }

  .info {
    display: flex;
    flex-direction: column;

    .author {
      font-size: 1rem;
      font-weight: bold;
      color: #333;
    }

    .timestamp {
      font-size: 0.875rem;
      color: #888;
    }
  }
`;

const NoticeContent = styled.div`
  margin-bottom: 20px;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;

  .section-title {
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 5px;
  }

  .section-content {
    margin-bottom: 10px;
  }
`;

const CloseButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const NoticeListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;

  li {
    display: flex;
    flex-direction: column;
    padding: 15px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #f9f9f9;
    }

    .message {
      font-size: 1rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .meta {
      font-size: 0.875rem;
      color: #555;
      display: flex;
      justify-content: space-between;

      .timestamp {
        color: #888;
      }

      .sender {
        color: #555;
        font-weight: 500;
      }
    }
  }
`;

export default function ChattingNoticeDetailModal({
  initialNotice,
  notices,
  onClose,
}) {
  const [currentView, setCurrentView] = useState("detail"); // 'detail' or 'list'
  const [selectedNotice, setSelectedNotice] = useState(initialNotice);
  const [sortedNotices, setSortedNotices] = useState([]);

  useEffect(() => {
    // 최신 공지가 상단에 오도록 정렬
    const sorted = [...notices].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    setSortedNotices(sorted);
  }, [notices]);

  const handleSelectNotice = (notice) => {
    setSelectedNotice(notice);
    setCurrentView("detail");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("ko-KR", options);
  };

  return (
    <ModalContainer>
      <ModalContent>
        {currentView === "detail" ? (
          <>
            <Header>
              <Button
                size="sm"
                theme="pink"
                onClick={() => setCurrentView("list")}
              >
                ← 공지사항 목록
              </Button>
              <Button onClick={onClose}>닫기</Button>
            </Header>
            <NoticeHeader>
              <div className="profile" />
              <div className="info">
                <span className="author">{selectedNotice.sender}</span>
                <span className="timestamp">
                  {formatTimestamp(selectedNotice.timestamp)}
                </span>
              </div>
            </NoticeHeader>
            <NoticeContent>
              <div className="section-content">{selectedNotice.message}</div>
            </NoticeContent>
          </>
        ) : (
          <>
            <Header>
              <div className="title">공지사항 목록</div>
              <Button onClick={onClose}>닫기</Button>
            </Header>
            <NoticeListContainer>
              {sortedNotices.map((item, index) => (
                <li key={index} onClick={() => handleSelectNotice(item)}>
                  <div className="message">{item.message}</div>
                  <div className="meta">
                    <span className="timestamp">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    <span className="sender">{item.sender}</span>
                  </div>
                </li>
              ))}
            </NoticeListContainer>
          </>
        )}
      </ModalContent>
    </ModalContainer>
  );
}