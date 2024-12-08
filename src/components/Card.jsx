import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";
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

export default function Card({ meeting, theme = "black", onClick }) {
  const {
    title,
    timeIdxStart,
    timeIdxEnd,
    location,
    creatorName,
    time_idx_deadline,
    type,
  } = meeting;

  const variantClass = cardVariants({
    theme: type === "CLOSE" ? "gray" : theme,
  });

  // 시간 변환
  const startTime = convertIndexToTime(timeIdxStart);
  const endTime = convertIndexToTime(timeIdxEnd);
  const deadlineTime = convertIndexToTime(time_idx_deadline);

  return (
    <div className={cn(variantClass)} onClick={onClick}>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <Label size="sm" theme="indigo">
        {location}
      </Label>
      <Label size="sm" theme="indigo">
        시간: {startTime} ~ {endTime}
      </Label>
      <Label size="sm" theme="indigo">
        마감 시간: {deadlineTime}
      </Label>
      <div className="flex justify-between mt-2">
        <span className="text-sm text-white">작성자: {creatorName}</span>
        <span className="text-sm text-right underline">
          {type === "OPEN" ? "참여 가능" : "참여 마감"}
        </span>
      </div>
    </div>
  );
}
