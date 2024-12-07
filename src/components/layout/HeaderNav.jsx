import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import LogoIcon from "../icons/LogoIcon";
import useAuthStore from "../../store/authStore";

export default function HeaderNav() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore(); // Zustand에서 user 상태 가져오기

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
  const navigateToMyPage = () => navigate("/mypage");

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
                onClick={user ? navigateToMyPage : navigateToLogin} // 조건부 이동
              />
            </>
          ) : (
            <>
              <Button
                size="lg"
                theme="pink"
                icon={<LogoIcon fillColor="#ffffff" />}
                onClick={navigateToHome}
              >
                홈
              </Button>
              <Button
                size="lg"
                theme="purple"
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
              {user ? (
                <Button
                  size="lg"
                  theme="black"
                  icon={<LogoIcon fillColor="#ffffff" />}
                  onClick={navigateToMyPage}
                >
                  마이페이지
                </Button>
              ) : (
                <Button
                  size="lg"
                  theme="black"
                  icon={<LogoIcon fillColor="#ffffff" />}
                  onClick={navigateToLogin}
                >
                  로그인
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
