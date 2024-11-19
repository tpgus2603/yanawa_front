import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import LogoIcon from "../icons/LogoIcon";

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
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-center w-full h-16 px-4 bg-white">
        <div className="flex items-center space-x-6">
          {isMobile ? (
            <>
              <Button
                size="icon"
                theme="pink"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToHome}
              />
              <Button
                size="icon"
                theme="purple"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToTimeTable}
              />
              <Button
                size="icon"
                theme="mix"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToChattingList}
              />
              <Button
                size="icon"
                theme="black"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToLogin}
              />
            </>
          ) : (
            <>
              <Button
                size="icon"
                theme="pink"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToHome}
              />
              <Button
                size="lg"
                theme="purple"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToHome}
              >
                홈
              </Button>
              <Button
                size="lg"
                theme="indigo"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToTimeTable}
              >
                캘린더
              </Button>
              <Button
                size="lg"
                theme="mix"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToChattingList}
              >
                번개채팅방
              </Button>
              <Button
                size="lg"
                theme="black"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToLogin}
              >
                로그인
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
