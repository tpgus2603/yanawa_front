import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { createMeeting } from "../api/meeting";
import { convertTimeToIndex } from "../utils/time";
import { days } from "../constants/schedule";

const CreateMeetingModal = ({ isOpen, onClose, onMeetingCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dayStart, setDayStart] = useState("월");
  const [hourStart, setHourStart] = useState("0");
  const [minuteStart, setMinuteStart] = useState("0");
  const [dayEnd, setDayEnd] = useState("월");
  const [hourEnd, setHourEnd] = useState("0");
  const [minuteEnd, setMinuteEnd] = useState("0");
  const [dayDeadline, setDayDeadline] = useState("월");
  const [hourDeadline, setHourDeadline] = useState("0");
  const [minuteDeadline, setMinuteDeadline] = useState("0");
  const [maxNum, setMaxNum] = useState("1");

  const minutes = ["0", "15", "30", "45"];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString());
  const maxParticipants = Array.from({ length: 20 }, (_, i) =>
    (i + 1).toString()
  );

  const handleSubmit = async () => {
    try {
      const time_idx_start = convertTimeToIndex(
        dayStart,
        parseInt(hourStart),
        parseInt(minuteStart)
      );
      const time_idx_end = convertTimeToIndex(
        dayEnd,
        parseInt(hourEnd),
        parseInt(minuteEnd)
      );
      const time_idx_deadline = convertTimeToIndex(
        dayStart,
        parseInt(hourStart),
        parseInt(minuteStart)
      );

      const meetingData = {
        title,
        description,
        location,
        time_idx_start,
        time_idx_end,
        time_idx_deadline,
        type: "OPEN",
        max_num: parseInt(maxNum),
      };

      await createMeeting(meetingData);
      alert("모임이 성공적으로 생성되었습니다!");
      onMeetingCreated(); // 모임 생성 후 상태 동기화
      onClose(); // 모달 닫기
    } catch (error) {
      console.error("Failed to create meeting:", error);
      alert("모임 생성에 실패했습니다.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-4 text-2xl font-bold">번개 모임 만들기</h2>
      <hr />
      <div className="mt-4 space-y-4">
        <div>
          <label className="block mb-2 font-semibold">
            모임 이름
            <span className="relative ml-1 bottom-1 label-1 text-warning">
              *
            </span>
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="모임 이름을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            모임 설명
            <span className="relative ml-1 bottom-1 label-1 text-warning">
              *
            </span>
          </label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="모임 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            장소
            <span className="relative ml-1 bottom-1 label-1 text-warning">
              *
            </span>
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="장소를 입력하세요"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            시작 시간
            <span className="relative ml-1 bottom-1 label-1 text-warning">
              *
            </span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={dayStart}
              onChange={(e) => setDayStart(e.target.value)}
              className="p-2 border rounded"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select
              value={hourStart}
              onChange={(e) => setHourStart(e.target.value)}
              className="p-2 border rounded"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}시
                </option>
              ))}
            </select>
            <select
              value={minuteStart}
              onChange={(e) => setMinuteStart(e.target.value)}
              className="p-2 border rounded"
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}분
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold">
            종료 시간
            <span className="relative ml-1 bottom-1 label-1 text-warning">
              *
            </span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={dayEnd}
              onChange={(e) => setDayEnd(e.target.value)}
              className="p-2 border rounded"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select
              value={hourEnd}
              onChange={(e) => setHourEnd(e.target.value)}
              className="p-2 border rounded"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}시
                </option>
              ))}
            </select>
            <select
              value={minuteEnd}
              onChange={(e) => setMinuteEnd(e.target.value)}
              className="p-2 border rounded"
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}분
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold">최대 참가 인원</label>
          <select
            value={maxNum}
            onChange={(e) => setMaxNum(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {maxParticipants.map((num) => (
              <option key={num} value={num}>
                {num}명
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button size="md" theme="white" onClick={onClose}>
          취소
        </Button>
        <Button size="md" theme="mix" onClick={handleSubmit}>
          생성
        </Button>
      </div>
    </Modal>
  );
};

export default CreateMeetingModal;
