import { days } from "../constants/schedule";

export const generateTimeSlots = () => {
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

export const convertIndexToTime = (timeIndex) => {
  const dayIndex = Math.floor(timeIndex / 96);
  const timeSlotIndex = timeIndex % 96;
  const hour = Math.floor(timeSlotIndex / 4);
  const minute = (timeSlotIndex % 4) * 15;
  const day = days[dayIndex];
  const time = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
  return `${day} ${time}`;
};
