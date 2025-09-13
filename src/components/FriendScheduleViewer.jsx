import React, { useMemo, useRef, useState, useEffect } from "react";
import { days, colorClasses } from "../constants/schedule";
import { generateTimeSlots } from "../utils/time";
import Button from "./Button";

const FriendScheduleViewer = ({ open, onClose, friend, schedules, loading }) => {
    const timeSlots = useMemo(() => generateTimeSlots(), []);
    const [showAllTime, setShowAllTime] = useState(false);

    // === 모달 드래그 상태 ===
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 }); // 모달의 translate 좌표
    const startRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 }); // 드래그 시작점

    // 처음 열릴 때 화면 정중앙 배치
    useEffect(() => {
        if (open) {
            setPos({ x: 0, y: 0 });
        }
    }, [open]);

    const onDragStart = (e) => {
        e.preventDefault();
        setDragging(true);
        startRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            x: pos.x,
            y: pos.y,
        };
        // 드래그 중 텍스트 선택 방지
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
    };

    const onDragMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startRef.current.mouseX;
        const dy = e.clientY - startRef.current.mouseY;
        // 새 좌표 후보
        let nx = startRef.current.x + dx;
        let ny = startRef.current.y + dy;

        // 간단한 경계 클램프 (뷰포트 바깥으로 과도하게 못 나가게)
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        // 여백 허용치
        const margin = 40;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // 모달 자체 폭/높이는 tailwind에서 %로 지정되어 있으므로 대략적 클램프만 적용
        nx = clamp(nx, -vw / 2 + margin, vw / 2 - margin);
        ny = clamp(ny, -vh / 2 + margin, vh / 2 - margin);

        setPos({ x: nx, y: ny });
    };

    const onDragEnd = () => {
        setDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    };

    // 포커스가 모달 밖으로 빠지지 않도록 배경 클릭 시 닫기 막음(헤더/버튼 제외)
    const overlayClick = (e) => {
        // 모달 바깥을 클릭했을 때만 닫고 싶다면 주석 해제
        // if (e.target === e.currentTarget) onClose();
    };

    const titleColorMap = useMemo(() => {
        const m = new Map();
        (schedules || []).forEach((s) => {
            if (!m.has(s.title))
                m.set(s.title, colorClasses[m.size % colorClasses.length]);
        });
        return m;
    }, [schedules]);

    const getColor = (title) => titleColorMap.get(title);

    const filterTime = (t) => {
        const h = parseInt(t.split(":")[0], 10);
        return showAllTime || (h >= 8 && h <= 18);
    };

    const renderCell = (slotIndex) => {
        const schedule = schedules?.find((s) =>
            s.time_indices.includes(slotIndex)
        );

        const isFirst =
            schedule &&
            !schedule.time_indices.includes(slotIndex - 1) &&
            Math.floor((slotIndex - 1) / 96) === Math.floor(slotIndex / 96);

        const isLast =
            schedule &&
            !schedule.time_indices.includes(slotIndex + 1) &&
            Math.floor((slotIndex + 1) / 96) === Math.floor(slotIndex / 96);

        return (
            <div
                key={slotIndex}
                className={`p-2 border select-none ${
                    schedule
                        ? `${getColor(schedule.title)} text-white
               ${!isFirst && !isLast ? "border-t-0 border-b-0" : ""}
               ${!isFirst ? "border-t-0" : ""}
               ${!isLast ? "border-b-0" : ""}`
                        : "bg-grayscale-50"
                }`}
            >
                {isFirst ? schedule?.title : ""}
            </div>
        );
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onClick={overlayClick}
        >
            {/* 드래그 가능한 모달 컨테이너 */}
            <div
                className="relative w-[95vw] max-w-[1100px] rounded-2xl bg-white shadow-xl transition-transform"
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 (드래그 핸들) */}
                <div
                    className={`flex items-center justify-between px-5 py-4 border-b ${
                        dragging ? "cursor-grabbing" : "cursor-grab"
                    } select-none`}
                    onMouseDown={onDragStart}
                >
                    <div className="pointer-events-none">
                        <h3 className="heading-3">{friend?.name ?? "친구"}</h3>
                        <p className="text-sm text-gray-500">{friend?.email}</p>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        <Button theme="white" size="sm" onClick={() => setShowAllTime((v) => !v)}>
                            {showAllTime ? "시간 접기" : "전체 시간 보기"}
                        </Button>
                        <Button theme="black" size="sm" onClick={onClose}>
                            닫기
                        </Button>
                    </div>
                </div>

                {/* 내용: 가로/세로 스크롤 모두 지원 */}
                <div className="p-4">
                    {loading ? (
                        <div className="py-16 text-center text-gray-500">불러오는 중…</div>
                    ) : (schedules?.length ?? 0) === 0 ? (
                        <div className="py-16 text-center text-gray-500">
                            등록된 시간표가 없습니다.
                        </div>
                    ) : (
                        // 스크롤 영역: 모달 높이를 넘칠 경우 오른쪽/아래 스크롤 생성
                        <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
                            {/* 그리드를 모달보다 넓게해서 가로 스크롤 유도 */}
                            <div className="min-w-[1000px] grid grid-cols-[64px,repeat(7,1fr)] gap-0">
                                {/* Header row */}
                                <div className="min-w-[54px] p-2 font-bold text-center bg-grayscale-200 select-none">
                                    Time
                                </div>
                                {days.map((d) => (
                                    <div
                                        key={d}
                                        className="p-2 font-bold text-center select-none bg-grayscale-200"
                                    >
                                        {d}
                                    </div>
                                ))}

                                {/* Body rows */}
                                {timeSlots.map((time, rowIndex) => {
                                    if (!filterTime(time)) return null;
                                    return (
                                        <React.Fragment key={rowIndex}>
                                            <div className="min-w-[54px] p-2 font-bold text-center bg-grayscale-100 select-none sticky left-0">
                                                {time}
                                            </div>
                                            {days.map((_, colIndex) => {
                                                const slotIndex = colIndex * timeSlots.length + rowIndex;
                                                return renderCell(slotIndex);
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendScheduleViewer;
