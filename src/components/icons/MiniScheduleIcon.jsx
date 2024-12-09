import React from "react";

const days = ["월", "화", "수", "목", "금", "토", "일"];

// 더미 데이터: 요일별 일정 상태 (고정 또는 유동)
const dummyScheduleStatus = [
  { day: "월", type: "fixed" },
  { day: "화", type: "flexible" },
  { day: "수", type: "empty" },
  { day: "목", type: "fixed" },
  { day: "금", type: "flexible" },
  { day: "토", type: "empty" },
  { day: "일", type: "flexible" },
];

const MiniScheduleIcon = ({ scheduleStatus = dummyScheduleStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 p-4 bg-white border rounded-lg shadow-lg border-grayscale-300 w-60">
      {/* 헤더 */}
      <div className="mb-2 text-gray-300 label-1">
        <span className="text-secondary-500">고정</span> /{" "}
        <span className="text-primary-500">유동</span>
      </div>

      {/* 요일별 상태 */}
      <div className="grid w-full grid-cols-7 gap-1">
        {days.map((day, index) => {
          const status =
            scheduleStatus.find((item) => item.day === day)?.type || "empty";
          return (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                status === "fixed"
                  ? "bg-primary-300 text-white"
                  : status === "flexible"
                  ? "bg-secondary-300 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              title={`${day} ${
                status === "fixed"
                  ? "고정 일정 있음"
                  : status === "flexible"
                  ? "유동 일정 있음"
                  : "일정 없음"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniScheduleIcon;
