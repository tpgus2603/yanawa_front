// components/Card.jsx
import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";
import Button from "./Button";
import Label from "./Label";
import { convertIndexToTime } from "../utils/time";

const cardVariants = cva(
    "w-full rounded-xl shadow-lg p-4 overflow-hidden cursor-pointer",
    {
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
    }
);

export default function Card({
                                 meeting,
                                 theme = "black",
                                 onDetail,
                                 onJoin,
                                 onDelete,
                                 onClose,
                                 onLeave,
                                 currentUserId, // ✅ 추가: 로그인 유저 id를 부모로부터 받음
                             }) {
    const {
        title,
        timeIdxStart,
        timeIdxEnd,
        location,
        creatorName,
        time_idx_deadline,
        type, // "OPEN" | "CLOSE"
        isParticipant,
        isScheduleConflict,
        creatorId, // ✅ DTO에서 내려오는 필드 사용
    } = meeting;

    // ✅ 주최자 여부: id 비교 (닉네임 사용 X)
    const isOwner = Number(creatorId) === Number(currentUserId);

    // “참여 가능 카드 강조” 기존 효과 유지
    const variantClass = cardVariants({
        theme: !isParticipant && !isScheduleConflict && type === "OPEN" ? "mix" : theme,
    });

    // 시간 변환
    const startTime = convertIndexToTime(timeIdxStart);
    const endTime = convertIndexToTime(timeIdxEnd);
    const deadlineTime = convertIndexToTime(time_idx_deadline);

    // 버튼 클릭이 카드 onClick으로 전파되지 않게 막기
    const stop = (fn) => (e) => {
        e.stopPropagation();
        fn?.(e);
    };

    return (
        <div className={cn(variantClass)} onClick={onDetail}>
            <h3 className="mb-2 text-xl font-bold" onClick={onDetail}>
                {title}
            </h3>

            <Label size="sm" theme="black">장소: {location}</Label>
            <Label size="sm" theme="black">시간: {startTime} ~ {endTime}</Label>
            <Label size="sm" theme="black">마감 시간: {deadlineTime}</Label>
            <Label size="sm" theme="black">주최자: {creatorName}</Label>

            <div className="flex items-end justify-between mt-4">
                <div className="flex gap-2">
                    <Label
                        className={type === "OPEN" ? "text-green-500" : "text-red-500"}
                        size="sm"
                        theme="graysolid"
                    >
                        {type}
                    </Label>

                    {isParticipant && (
                        <Label size="sm" theme="graysolid">참여중</Label>
                    )}

                    {!isParticipant && isScheduleConflict && (
                        <Label className="text-warning" size="sm" theme="graysolid">
                            시간충돌
                        </Label>
                    )}
                </div>

                {/* 버튼 모음 */}
                <div className="flex gap-2">
                    {/* OPEN일 때만 참가/나가기/마감 노출 규칙 유지 */}
                    {type === "OPEN" && (
                        <>
                            {isParticipant ? (
                                isOwner ? (
                                    <Button size="sm" theme="black" onClick={stop(onClose)}>
                                        마감
                                    </Button>
                                ) : (
                                    <Button size="sm" theme="white" onClick={stop(onLeave)}>
                                        나가기
                                    </Button>
                                )
                            ) : (
                                <Button
                                    size="sm"
                                    theme="white"
                                    state={isScheduleConflict ? "disable" : "default"}
                                    onClick={stop(onJoin)}
                                >
                                    참가하기
                                </Button>
                            )}
                        </>
                    )}

                    {/* ✅ 삭제 버튼: 주최자는 OPEN/CLOSE 상관없이 항상 노출 */}
                    {isOwner && (
                        <Button size="sm" theme="pink" onClick={stop(onDelete)}>
                            삭제
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
