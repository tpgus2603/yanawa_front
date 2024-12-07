import React, { useEffect, useState } from "react";
import Label from "../components/Label";
import {
  createSchedule,
  deleteSchedule,
  // fetchScheduleByTimeIndex,
  fetchAllSchedules,
  updateSchedule,
} from "../api/schedule";

const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      timeSlots.push(
        `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      );
    }
  }
  return timeSlots;
};

const days = ["월", "화", "수", "목", "금", "토", "일"];

// const dummySchedules = [
//   {
//     id: 1,
//     user_id: 1,
//     title: "알고리즘 스터디",
//     is_fixed: true,
//     time_indices: [36, 37, 38, 39],
//     createdAt: "2024-12-02T09:52:00.000Z",
//     updatedAt: "2024-12-02T09:52:00.000Z",
//   },
//   {
//     id: 5,
//     user_id: 1,
//     title: "웹시설 팀플",
//     is_fixed: true,
//     time_indices: [165, 166, 167, 255, 256, 257],
//     createdAt: "2024-12-02T09:54:53.000Z",
//     updatedAt: "2024-12-02T09:54:53.000Z",
//   },
// ];

const SchedulePage = () => {
  const timeSlots = generateTimeSlots();
  const [schedules, setSchedules] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [isFixed, setIsFixed] = useState(true);

  useEffect(() => {
    // API
    const initializeSchedules = async () => {
      try {
        const data = await fetchAllSchedules();
        setSchedules(data);
      } catch (error) {
        console.error("Failed to load schedules", error);
      }
    };

    initializeSchedules();

    // 임시 코드
    // setSchedules(dummySchedules);
  }, []);

  const handleSlotClick = async (timeIdx) => {
    if (!isEditMode) return;

    // API
    // try {
    //   const response = await fetchScheduleByTimeIndex(timeIdx);
    //   if (response && response.data && response.data.schedule) {
    //     setSelectedSchedule(response.data.schedule); // API로 가져온 스케줄 설정
    //   } else {
    //     console.error("No schedule found for time index:", timeIdx);
    //   }
    // } catch (error) {
    //   console.error("Failed to fetch schedule for time index:", timeIdx, error);
    // }

    // 임시 코드
    const slotInSchedule = schedules.find((s) =>
      s.time_indices.includes(timeIdx)
    );

    if (slotInSchedule) {
      if (selectedSlots.length === 0) {
        setSelectedSchedule(slotInSchedule);
      }
      return;
    }

    if (selectedSlots.includes(timeIdx)) {
      setSelectedSlots((prev) => prev.filter((idx) => idx !== timeIdx));
    } else {
      setSelectedSlots((prev) => [...prev, timeIdx]);
    }
  };

  const handleCancelSchedule = () => {
    setSelectedSlots([]);
    setNewTitle("");
    setIsFixed(true);
    setSelectedSchedule(null);
  };

  const handleEditSchedule = () => {
    setIsUpdateMode(true);
    setSchedules((prev) =>
      prev.filter((s) => s.title !== selectedSchedule.title)
    );
    setSelectedSlots(selectedSchedule.time_indices);
    setNewTitle(selectedSchedule.title);
    setIsFixed(selectedSchedule.is_fixed);
  };

  const handleUpdateSchedule = async () => {
    try {
      const scheduleData = {
        originalTitle: selectedSchedule.title,
        title: newTitle,
        is_fixed: isFixed,
        time_indices: selectedSlots,
      };
      // API
      const newSchedule = await updateSchedule(scheduleData);

      // 임시 코드
      // const newSchedule = {
      //   ...scheduleData,
      //   id: Date.now(),
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // };

      setSchedules((prev) => [...prev, newSchedule]);
      setSelectedSchedule(newSchedule);
      setSelectedSlots([]);
      setNewTitle("");
      setIsFixed(true);
      alert("스케줄을 수정했습니다.!");
    } catch (error) {
      console.error("스케줄 수정에 실패했습니다.:", error);
      alert("스케줄 수정에 실패했습니다.");
    } finally {
      setIsUpdateMode(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const scheduleData = {
        title: newTitle,
        is_fixed: isFixed,
        time_indices: selectedSlots,
      };

      // API
      const newSchedule = await createSchedule(scheduleData);

      // 임시코드
      // const newSchedule = {
      //   ...scheduleData,
      //   id: Date.now(),
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // };

      setSchedules((prev) => [...prev, newSchedule]);
      setSelectedSlots([]);
      setNewTitle("");
      setIsFixed(true);
      alert("스케줄이 추가되었습니다!");
    } catch (error) {
      console.error("스케줄 삭제에 실패했습니다:", error);
      alert("스케줄 추가에 실패했습니다.");
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      const body = { title: selectedSchedule.title };

      // API 호출 준비가 되었을 때 사용:
      await deleteSchedule(body);

      const updatedSchedules = await fetchAllSchedules();
      setSchedules(updatedSchedules);

      // 임시코드
      // setSchedules((prev) =>
      //   prev.filter((s) => s.title !== selectedSchedule.title)
      // );

      setSelectedSchedule(null);
      alert("스케줄이 삭제되었습니다.");
    } catch (error) {
      console.error("스케줄 삭제에 실패했습니다:", error);
    }
  };

  return (
    <div className="min-h-screen bg-grayscale-50">
      {/* Toggle View/Edit Mode */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="heading-1">Schedule</h1>
        <label className="flex items-center space-x-3 cursor-pointer">
          <span className="title-1 text-primary-500">Edit Mode</span>
          <div
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isEditMode ? "bg-primary-500" : "bg-grayscale-300"
            }`}
            onClick={() => {
              setIsEditMode((prev) => !prev);
              setSelectedSlots([]);
              setSelectedSchedule(null);
            }}
          >
            <div
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isEditMode ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* Sticky Container in Edit Mode */}
      {isEditMode && (
        <div className="fixed bottom-0 right-0 flex items-center justify-center w-full ">
          <div
            className={`transform transition-transform w-full max-w-[768px] tablet:rounded-2xl bg-primary-100 p-6 text-center shadow-lg`}
          >
            {selectedSlots.length === 0 && selectedSchedule ? (
              <div className="flex flex-col items-center justify-center w-full">
                <h3 className="mb-2 heading-2 text-primary-500">스케줄 정보</h3>
                <div className="flex flex-col items-start w-1/2">
                  <p className="mb-1 body-1">
                    <strong>제목:</strong> {selectedSchedule.title}
                  </p>
                  <p className="mb-1 body-1">
                    <strong>스케줄 타입:</strong>{" "}
                    {selectedSchedule.is_fixed ? "고정" : "유동"}
                  </p>
                  <div className="mb-4 body-1">
                    <strong>선택된 시간:</strong>{" "}
                    {selectedSchedule.time_indices.map((time_idx) => (
                      <Label key={time_idx} theme="indigo" size="sm">
                        {time_idx}
                      </Label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button
                    className="px-4 py-2 font-bold text-white rounded bg-gradient-purple"
                    onClick={handleEditSchedule}
                  >
                    수정하기
                  </button>
                  <button
                    className="px-4 py-2 font-bold text-white rounded bg-gradient-pink"
                    onClick={handleDeleteSchedule}
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isUpdateMode ? (
                  <h3 className="mb-4 heading-2 text-primary-500">
                    스케줄 수정하기
                  </h3>
                ) : (
                  <h3 className="mb-4 heading-2 text-primary-500">
                    새 스케줄 만들기
                  </h3>
                )}
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full p-2 mb-4 border rounded shadow-input-box"
                />
                <div className="flex items-center justify-center mb-4 space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_fixed"
                      value={true}
                      checked={isFixed === true}
                      onChange={() => setIsFixed(true)}
                    />
                    <span className="body-1">고정 스케줄</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_fixed"
                      value={false}
                      checked={isFixed === false}
                      onChange={() => setIsFixed(false)}
                    />
                    <span className="body-1">유동 스케줄</span>
                  </label>
                </div>
                <div className="mb-4 body-1">
                  <span>선택된 시간:</span>
                  {selectedSlots.map((time_idx) => (
                    <Label key={time_idx} theme="indigo" size="sm">
                      {time_idx}
                    </Label>
                  ))}
                </div>
                {isUpdateMode ? (
                  <button
                    className="px-4 py-2 font-bold text-white rounded bg-gradient-pink"
                    onClick={() => handleUpdateSchedule()}
                  >
                    수정 완료
                  </button>
                ) : (
                  <div className="flex justify-center mt-4 space-x-4">
                    <button
                      className="px-4 py-2 font-bold text-white rounded bg-tertiary-900"
                      onClick={() => handleCancelSchedule()}
                    >
                      취소
                    </button>
                    <button
                      className="px-4 py-2 font-bold text-white rounded bg-gradient-pink"
                      onClick={() => handleCreateSchedule()}
                    >
                      추가
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="p-4">
        <div className="overflow-auto scrollbar-hide">
          <div className="w-[100vw] tablet:w-[960px] grid grid-cols-[64px,repeat(7,1fr)] gap-2">
            {/* Header */}
            <div className="min-w-[54px] p-2 font-bold text-center bg-grayscale-200 select-none">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="p-2 font-bold text-center select-none bg-grayscale-200"
              >
                {day}
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((time, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {/* Time Column */}
                <div className="min-w-[54px] p-2 font-bold text-center bg-grayscale-100 select-none">
                  {time}
                </div>
                {days.map((_, colIndex) => {
                  const slotIndex = colIndex * timeSlots.length + rowIndex;
                  const isSelected = selectedSlots.includes(slotIndex);
                  const schedule = schedules.find((s) =>
                    s.time_indices.includes(slotIndex)
                  );

                  return (
                    <div
                      key={slotIndex}
                      className={`p-2 border rounded ${
                        schedule
                          ? "bg-primary-300 text-white cursor-not-allowed"
                          : isSelected
                          ? "bg-primary-100 border-primary-300"
                          : "bg-grayscale-50 cursor-pointer"
                      }`}
                      onClick={() => handleSlotClick(slotIndex)}
                    >
                      {schedule ? schedule.title : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
