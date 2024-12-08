import React, { useEffect, useState, useMemo } from "react";
import Label from "../components/Label";
import {
  createSchedule,
  deleteSchedule,
  fetchAllSchedules,
  updateSchedule,
} from "../api/schedule";
import Button from "../components/Button";
import { days, colorClasses } from "../constants/schedule";
import { generateTimeSlots, convertIndexToTime } from "../utils/time";

const SchedulePage = () => {
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const [schedules, setSchedules] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [isFixed, setIsFixed] = useState(true);
  const [titleColorMap, setTitleColorMap] = useState(new Map());
  const [showAllTimeSlot, setShowAllTimeSlot] = useState(false);

  useEffect(() => {
    const initializeSchedules = async () => {
      try {
        const data = await fetchAllSchedules();
        const sortedSchedules = [...data].sort((a, b) => {
          const aMin = Math.min(...a.time_indices);
          const bMin = Math.min(...b.time_indices);
          return aMin - bMin;
        });
        setSchedules(sortedSchedules);
      } catch (error) {
        console.error("Failed to load schedules", error);
      }
    };

    initializeSchedules();
  }, []);

  useEffect(() => {
    const newColorMap = new Map();
    schedules.forEach((schedule) => {
      if (!newColorMap.has(schedule.title)) {
        newColorMap.set(
          schedule.title,
          colorClasses[newColorMap.size % colorClasses.length]
        );
      }
    });
    setTitleColorMap(newColorMap);
  }, [schedules]);

  const handleSlotClick = async (timeIdx) => {
    if (!isEditMode) return;
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
      const newSchedule = await updateSchedule(scheduleData);
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
      const newSchedule = await createSchedule(scheduleData);
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
      await deleteSchedule(selectedSchedule.title);
      const updatedSchedules = await fetchAllSchedules();
      setSchedules(updatedSchedules);
      setSelectedSchedule(null);
      alert("스케줄이 삭제되었습니다.");
    } catch (error) {
      console.error("스케줄 삭제에 실패했습니다:", error);
    }
  };

  const getColorForTitle = (title) => {
    if (!titleColorMap.has(title)) {
      const newColor = colorClasses[titleColorMap.size % colorClasses.length];
      setTitleColorMap((prev) => new Map(prev).set(title, newColor));
      return newColor;
    }
    return titleColorMap.get(title);
  };

  const renderTimeSlot = (slotIndex) => {
    const schedule = schedules.find((s) => s.time_indices.includes(slotIndex));
    const isSelected = selectedSlots.includes(slotIndex);

    const isFirstSlot =
      schedule &&
      !schedule.time_indices.includes(slotIndex - 1) &&
      Math.floor((slotIndex - 1) / 96) === Math.floor(slotIndex / 96);

    const isLastSlot =
      schedule &&
      !schedule.time_indices.includes(slotIndex + 1) &&
      Math.floor((slotIndex + 1) / 96) === Math.floor(slotIndex / 96);

    return (
      <div
        key={slotIndex}
        className={`p-2 border ${
          schedule
            ? `${getColorForTitle(schedule.title)} text-white
               ${!isFirstSlot && !isLastSlot ? "border-t-0 border-b-0" : ""}
               ${!isFirstSlot ? "border-t-0" : ""}
               ${!isLastSlot ? "border-b-0" : ""}`
            : isSelected
            ? "bg-primary-100 border-primary-300"
            : "bg-grayscale-50"
        } cursor-pointer`}
        onClick={() => handleSlotClick(slotIndex)}
      >
        {isFirstSlot ? schedule?.title : ""}
      </div>
    );
  };

  const filterTimeSlots = (time) => {
    const hour = parseInt(time.split(":")[0]);
    return showAllTimeSlot || (hour >= 8 && hour <= 18);
  };

  return (
    <div className="min-h-screen bg-grayscale-50">
      {/* Toggle View/Edit Mode */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="heading-2">내 시간표</h1>
        <label className="flex items-center space-x-3 cursor-pointer">
          <span className="title-1 text-primary-500">수정 모드</span>
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

      {/* 더보기 버튼 */}
      <div className="flex justify-center mt-4">
        <Button
          theme="white"
          size="sm"
          className="w-full mx-4 hover:bg-grayscale-50"
          onClick={() => setShowAllTimeSlot(!showAllTimeSlot)}
        >
          {showAllTimeSlot ? "시간 접기" : "전체 시간 보기"}
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="p-4 pb-[210px]">
        <div className="overflow-auto scrollbar-hide">
          <div className="w-[100vw] tablet:w-[960px] grid grid-cols-[64px,repeat(7,1fr)] gap-0">
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
            {timeSlots.map((time, rowIndex) => {
              if (!filterTimeSlots(time)) return null;

              return (
                <React.Fragment key={rowIndex}>
                  <div className="min-w-[54px] p-2 font-bold text-center bg-grayscale-100 select-none">
                    {time}
                  </div>
                  {days.map((_, colIndex) => {
                    const slotIndex = colIndex * timeSlots.length + rowIndex;
                    return renderTimeSlot(slotIndex);
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Container in Edit Mode */}
      {isEditMode && (
        <div className="fixed bottom-0 right-0 z-10 flex items-center justify-center w-full">
          <div className="transform transition-transform w-full max-w-[768px] tablet:rounded-2xl bg-primary-100/90 backdrop-blur-sm p-6 text-center shadow-lg">
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
                        {convertIndexToTime(time_idx)}
                      </Label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center w-full mt-4 space-x-2">
                  <Button
                    theme="indigo"
                    size="md"
                    className="flex-1"
                    onClick={() => handleEditSchedule()}
                  >
                    수정하기
                  </Button>
                  <Button
                    theme="pink"
                    size="md"
                    className="flex-1"
                    onClick={() => handleDeleteSchedule()}
                  >
                    삭제하기
                  </Button>
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
                  placeholder="스케줄 제목"
                  className="w-full p-2 px-4 mb-4 border rounded-full shadow-input-box"
                />
                <div className="flex items-center justify-center mb-4 space-x-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_fixed"
                        value={true}
                        checked={isFixed === true}
                        onChange={() => setIsFixed(true)}
                        className="hidden peer"
                      />
                      <div className="flex items-center justify-center w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:border-tertiary-500 peer-checked:bg-tertiary-500">
                        <div className="w-2.5 h-2.5 bg-white rounded-full peer-checked:bg-white"></div>
                      </div>
                      <span className="ml-2 text-sm font-medium peer-checked:text-tertiary-500">
                        고정 스케줄
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_fixed"
                        value={false}
                        checked={isFixed === false}
                        onChange={() => setIsFixed(false)}
                        className="hidden peer"
                      />
                      <div className="flex items-center justify-center w-5 h-5 border-2 border-gray-400 rounded-full peer-checked:border-primary-500 peer-checked:bg-primary-500">
                        <div className="w-2.5 h-2.5 bg-white rounded-full peer-checked:bg-white"></div>
                      </div>
                      <span className="ml-2 text-sm font-medium peer-checked:text-primary-500">
                        유동 스케줄
                      </span>
                    </label>
                  </div>
                </div>
                <span className="heading-4">선택된 시간</span>
                <div className="flex flex-wrap gap-1 p-2 m-2 body-1">
                  {selectedSlots.map((time_idx) => (
                    <Label key={time_idx} theme="solid" size="sm">
                      {convertIndexToTime(time_idx)}
                    </Label>
                  ))}
                </div>
                {isUpdateMode ? (
                  <Button
                    theme="pink"
                    size="md"
                    onClick={() => handleUpdateSchedule()}
                  >
                    수정 완료
                  </Button>
                ) : (
                  <div className="flex justify-center w-full mt-4 space-x-2">
                    <Button
                      theme="indigo"
                      size="md"
                      className="flex-1"
                      onClick={() => handleCancelSchedule()}
                    >
                      취소
                    </Button>
                    <Button
                      theme="pink"
                      size="md"
                      className="flex-1"
                      onClick={() => handleCreateSchedule()}
                    >
                      추가
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
