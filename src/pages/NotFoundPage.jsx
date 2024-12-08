import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"; // 기존 디자인 시스템의 버튼 컴포넌트

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
      <h1 className="text-6xl font-bold text-primary-500">404</h1>
      <p className="mt-4 text-lg text-gray-700">
        페이지를 찾을 수 없습니다. 잘못된 URL을 입력했거나 페이지가 삭제되었을
        수 있습니다.
      </p>
      <div className="mt-6">
        <Button size="lg" theme="indigo" onClick={handleGoHome}>
          홈으로 이동
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
