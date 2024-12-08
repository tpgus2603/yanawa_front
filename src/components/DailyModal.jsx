import React, { useState } from "react";
import { Link } from "react-router-dom";

const DailyModal = ({ show, onClose }) => {
  const [doNotShowToday, setDoNotShowToday] = useState(false);

  const handleDoNotShowTodayChange = (e) => {
    setDoNotShowToday(e.target.checked);
  };

  const handleClose = () => {
    if (doNotShowToday) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      localStorage.setItem("modalDismissedUntil", tomorrow.toISOString());
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-11/12 max-w-lg p-6 bg-white shadow-lg rounded-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src={`${process.env.PUBLIC_URL}/logo196.png`}
            alt="Modal"
            className="w-1/2"
          />
          <p className="text-gray-700">
            홈화면에 앱 추가하고 <br />
            공지사항, 이벤트 알림을 받아보세요.
          </p>
        </div>
        <Link
          to="/guide"
          className="block px-6 py-2 mt-4 font-bold text-center text-white bg-blue-700 rounded-full hover:bg-blue-800"
        >
          설치없이 앱으로 열기
        </Link>
        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={doNotShowToday}
              onChange={handleDoNotShowTodayChange}
              className="mr-2"
            />
            오늘은 보지 않기
          </label>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyModal;
