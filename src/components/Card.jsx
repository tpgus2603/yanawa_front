import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";
import Button from "./Button";
import Label from "./Label";
import { convertIndexToTime } from "../utils/time";
const cardVariants = cva("w-full rounded-xl shadow-lg p-4 overflow-hidden", {
  variants: {
    theme: {
      black: "bg-black text-white",
      white: "bg-white text-black",
      pink: "bg-gradient-pink text-white",
      purple: "bg-gradient-purple text-white",
      indigo: "bg-gradient-indigo text-white",
      mix: "bg-gradient-mix text-white",
      gray: "bg-gray-300 text-gray-500",
    },
  },
});

export default function Card({
  meeting,
  theme = "black",
  onClick,
  onJoin,
  onDelete,
  onClose,
  onLeave,
}) {
  const {
    title,
    timeIdxStart,
    timeIdxEnd,
    location,
    creatorName,
    time_idx_deadline,
    type,
    isParticipant,
    isScheduleConflict,
  } = meeting;

  const variantClass = cardVariants({
    theme:
      !isParticipant && !isScheduleConflict && type === "OPEN" ? "mix" : theme,
  });

  // 시간 변환
  const userName = localStorage.getItem("nickname");

  const startTime = convertIndexToTime(timeIdxStart);
  const endTime = convertIndexToTime(timeIdxEnd);
  const deadlineTime = convertIndexToTime(time_idx_deadline);

  return (
    <div className={cn(variantClass)} onClick={onClick}>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <Label size="sm" theme="black">
        장소: {location}
      </Label>
      <Label size="sm" theme="black">
        시간: {startTime} ~ {endTime}
      </Label>
      <Label size="sm" theme="black">
        마감 시간: {deadlineTime}
      </Label>
      <Label size="sm" theme="black">
        주최자: {creatorName}
      </Label>
      <div className="flex items-end justify-between mt-4">
        <div className="flex gap-2">
          <Label
            className={`${type === "OPEN" ? "text-green-500" : "text-red-500"}`}
            size="sm"
            theme="graysolid"
          >
            {type}
          </Label>
          {isParticipant && (
            <Label size="sm" theme="graysolid">
              참여중
            </Label>
          )}
          {!isParticipant && isScheduleConflict ? (
            <Label className="text-warning" size="sm" theme="graysolid">
              시간충돌
            </Label>
          ) : null}
        </div>

        {type === "OPEN" ? (
          <>
            {isParticipant ? (
              <>
                {creatorName === userName ? (
                  <div className="flex gap-2">
                    <Button size="sm" theme="black" onClick={onClose}>
                      마감
                    </Button>
                    <Button size="sm" theme="pink" onClick={onDelete}>
                      삭제
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button size="sm" theme="white" onClick={onLeave}>
                      나가기
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Button
                size="sm"
                theme="white"
                state={
                  isParticipant || isScheduleConflict ? "disable" : "default"
                }
                onClick={onJoin}
              >
                참가하기
              </Button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
