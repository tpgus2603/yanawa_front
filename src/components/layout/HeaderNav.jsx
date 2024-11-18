import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";

export default function HeaderNav() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navigateToTimeTable = () => navigate("/timetable");
  const navigateToHome = () => navigate("/");
  const navigateToChattingList = () => navigate("/chattinglist");
  const navigateToLogin = () => navigate("/login");

  return (
    <div className="fixed z-30 flex items-center justify-center w-full p-1 bg-white border-b-[1px] border-grayscale-400 desktop:h-[6rem] tablet:h-[5rem] mobile:h-[4rem]">
      <div className="flex items-center space-x-6">
        {isMobile ? (
          <>
            <Button
              size="icon"
              theme="pink"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToHome}
            />
            <Button
              size="icon"
              theme="purple"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToTimeTable}
            />
            <Button
              size="icon"
              theme="mix"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToChattingList}
            />
            <Button
              size="icon"
              theme="black"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToLogin}
            />
          </>
        ) : (
          <>
            <Button
              size="icon"
              theme="pink"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToHome}
            />
            <Button
              size="lg"
              theme="purple"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToHome}
            >
              홈
            </Button>
            <Button
              size="lg"
              theme="indigo"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToTimeTable}
            >
              캘린더
            </Button>
            <Button
              size="lg"
              theme="mix"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToChattingList}
            >
              번개채팅방
            </Button>
            <Button
              size="lg"
              theme="black"
              icon="https://i.namu.wiki/i/TH3mmCfG6-vJG_dFJ4pvAO7wQx4ibyHMuXFWodRXXVOmsxKbWkC1hXDoY_FfhSxxN4pgX0pIrQJTy6gK8-yhDA.svg"
              onClick={navigateToLogin}
            >
              로그인
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
