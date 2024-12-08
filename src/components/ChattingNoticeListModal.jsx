import React from 'react';
import styled from 'styled-components';

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
  width: 80%;
  max-width: 600px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const NoticeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;

    &:hover {
      background: #f0f0f0;
    }
  }
`;

const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

export default function ChattingNoticeListModal({ notices, onClose, onNoticeClick }) {
  return (
    <ModalContainer>
      <ModalContent>
        <h2>공지사항 목록</h2>
        <NoticeList>
          {notices.map((notice, index) => (
            <li key={index} onClick={() => onNoticeClick(notice)}>
              {notice.message} (작성자: {notice.sender})
            </li>
          ))}
        </NoticeList>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
}