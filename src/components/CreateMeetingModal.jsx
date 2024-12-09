import React, { useState } from "react";
import { createMeeting } from "../api/meeting";
import Button from "./Button";

const CreateMeetingModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    time_idx_start: 0,
    time_idx_end: 0,
    max_num: 5,
    type: "OPEN", // 기본값
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await createMeeting(formData); // API 호출
      alert("번개 모임이 성공적으로 생성되었습니다!");
      onClose(); // 모달 닫기
      window.location.reload(); // 새로고침하여 번개 목록 업데이트
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("번개 모임 생성에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
        <h2 className="text-lg font-bold mb-4">번개 모임 만들기</h2>
        <div className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="설명"
            className="w-full p-2 border rounded"
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="장소"
            className="w-full p-2 border rounded"
          />
          <input
            name="time_idx_start"
            type="number"
            value={formData.time_idx_start}
            onChange={handleChange}
            placeholder="시작 시간 인덱스"
            className="w-full p-2 border rounded"
          />
          <input
            name="time_idx_end"
            type="number"
            value={formData.time_idx_end}
            onChange={handleChange}
            placeholder="종료 시간 인덱스"
            className="w-full p-2 border rounded"
          />
          <input
            name="max_num"
            type="number"
            value={formData.max_num}
            onChange={handleChange}
            placeholder="최대 인원"
            className="w-full p-2 border rounded"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="OPEN">OPEN</option>
            <option value="CLOSE">CLOSE</option>
          </select>
          <div className="flex justify-between">
            <Button size="sm" theme="pink" onClick={handleSubmit}>
              생성하기
            </Button>
            <Button size="sm" theme="gray" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;