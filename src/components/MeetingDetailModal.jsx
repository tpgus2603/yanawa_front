import React from "react";
import Modal from "./Modal";
import { convertIndexToTime } from "../utils/time";
import Label from "./Label";

const MeetingDetailModal = ({ isOpen, onClose, meeting }) => {
  if (!meeting) return null;

  const {
    title,
    description,
    location,
    timeIdxStart,
    timeIdxEnd,
    time_idx_deadline,
    type,
    creatorName,
    participants,
  } = meeting;

  const startTime = convertIndexToTime(timeIdxStart);
  const endTime = convertIndexToTime(timeIdxEnd);
  const deadlineTime = convertIndexToTime(time_idx_deadline);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="my-2 heading-1">번개모임 상세정보</h1>
      <hr />
      <div className="flex items-center gap-3 mt-4">
        <h2 className="heading-3">{title}</h2>
        <Label
          className={`${type === "OPEN" ? "text-green-500" : "text-red-500"}`}
          size="sm"
          theme="graysolid"
        >
          {type}
        </Label>
      </div>
      <p className="mb-4 text-gray-700 body-1">{description}</p>
      <div className="space-y-2">
        <p>장소: {location}</p>
        <p>
          시간: {startTime} ~ {endTime}
        </p>
        <p>참가 마감 시간: {deadlineTime}</p>
        <p>주최자: {creatorName}</p>
        <p>참가자 목록:</p>
        <ul className="pl-6 list-disc">
          {participants.map((participant) => (
            <li key={participant.userId}>
              {participant.name} ({participant.email})
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default MeetingDetailModal;
