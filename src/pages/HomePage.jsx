import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import GetUserPermission from "../fcm/GetUserPermission";
import DailyModal from "../components/DailyModal";
import PWAPrompt from "react-ios-pwa-prompt";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import GoogleLogoIcon from "../components/icons/GoogleLogoIcon";
import MiniScheduleIcon from "../components/icons/MiniScheduleIcon";
import LogoIcon from "../components/icons/LogoIcon";
import ChatIcon from "../components/icons/ChatIcon";

const HomePage = () => {
  const { user, fetchSession } = useAuthStore(); // Zustand 상태 및 메서드 가져오기
  const [showModal, setShowModal] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [shouldShowPWAPrompt, setShouldShowPWAPrompt] = useState(false);
  const [showPushNotificationPrompt, setShowPushNotificationPrompt] =
    useState(false);

  const features = [
    {
      title: "Google OAuth 간편 로그인",
      description: "Google 계정을 통해 빠르고 간편하게 로그인하세요.",
      component: (
        <Button size="md" theme="white" icon={<GoogleLogoIcon />}>
          구글로 로그인
        </Button>
      ),
    },
    {
      title: "고정 및 유동적인 시간표 관리",
      description:
        "고정 시간표와 유동 시간표를 쉽게 관리하고, 일정을 효율적으로 조율하세요.",
      component: <MiniScheduleIcon />, // 예시 컴포넌트
    },
    {
      title: "친구 초대 및 번개 모임 관리",
      description:
        "친구를 초대하고 번개 모임을 생성하여 쉽고 빠르게 약속을 잡으세요.",
      component: (
        <div className="flex gap-2">
          <Button
            size="icon"
            theme="purple"
            icon={<LogoIcon fillColor="#ffffff" />}
          />
          <Button
            size="icon"
            theme="indigo"
            icon={<LogoIcon fillColor="#ffffff" />}
          />
          <Button
            size="icon"
            theme="mix"
            icon={<LogoIcon fillColor="#ffffff" />}
          />
        </div>
      ),
    },
    {
      title: "실시간 채팅 및 푸시 알림",
      description:
        "모임 중 실시간으로 소통하고, 알림을 통해 중요한 정보를 놓치지 마세요.",
      component: (
        <div className="flex flex-col items-center justify-center w-40 h-40 p-4 rounded-lg shadow-lg bg-primary-100">
          <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-md bg-primary-500">
            <ChatIcon />
          </div>
          <p className="mt-4 text-sm font-bold text-primary-500">채팅</p>
        </div>
      ),
    },
  ];

  const navigate = useNavigate();

  const handleStartNow = () => {
    if (user) {
      navigate("/chat-room"); // 번개 채팅방으로 리다이렉션
    } else {
      navigate("/login"); // 로그인 페이지로 리다이렉션
    }
  };

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        await fetchSession(); // 세션 정보 가져오기
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchUserSession();
  }, [fetchSession]); // 페이지 마운트 시 실행

  //PWA 권한 허용 및 FCM 토큰 받아오기
  useEffect(() => {
    GetUserPermission();
  }, []);

  useEffect(() => {
    const isDeviceIOS =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
    setIsIOS(isDeviceIOS);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPWAInstalled(true);
      const isFirstTimeOpen = localStorage.getItem("isFirstTimeOpen");
      if (!isFirstTimeOpen) {
        setShowPushNotificationPrompt(true);
        localStorage.setItem("isFirstTimeOpen", "false");
      }
      return;
    }

    const dismissedUntil = localStorage.getItem("modalDismissedUntil");
    if (dismissedUntil) {
      const now = new Date();
      if (new Date(dismissedUntil) > now) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("PWA 설치여부", isPWAInstalled);
      if (!isPWAInstalled) {
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [isPWAInstalled]);

  useEffect(() => {
    if (isIOS) {
      setShouldShowPWAPrompt(true);
    }
  }, [isIOS]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowInstallPrompt(false);
  };

  const handleAllowNotifications = () => {
    GetUserPermission();
    setShowPushNotificationPrompt(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen space-y-4 bg-grayscale-50">
      <div className="min-h-screen bg-grayscale-50">
        {/* 헤더 */}
        <header className="px-4 py-6 text-center text-white rounded-t-xl bg-gradient-pink">
          <h1 className="font-bold heading-1">번개 모임 관리 플랫폼</h1>
          <p className="mt-2 body-1">
            친구들과의 약속을 쉽고 빠르게 관리하세요!
          </p>
        </header>

        <section className="grid max-w-5xl grid-cols-1 gap-8 px-6 py-12 mx-auto tablet:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg"
            >
              {/* 컴포넌트 렌더링 */}
              <div className="flex items-center justify-center w-full h-48 mb-4">
                {feature.component}
              </div>
              <h2 className="mb-2 heading-2 text-primary-500">
                {feature.title}
              </h2>
              <p className="text-center text-gray-600 body-1">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* 번개 모임 예시 섹션 */}
        <section className="py-12 bg-primary-50">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="mb-4 heading-2 text-primary-500">번개 모임 예시</h2>
            <p className="px-4 mb-8 text-gray-600 body-1">
              실시간 번개 모임으로 친구들과 약속을 쉽게 잡아보세요!
            </p>
            {/* 기존 Card 컴포넌트 활용 */}
            <div className="grid grid-cols-1 gap-6 px-6 tablet:grid-cols-2">
              <div className="p-4 bg-white rounded shadow">
                <h3 className="mb-2 heading-3">🎉 번개 회식</h3>
                <p className="text-gray-600 body-2">
                  오늘 저녁 7시, 강남역 모임
                </p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h3 className="mb-2 heading-3">🍻 번개 술 약속</h3>
                <p className="text-gray-600 body-2">내일 오후 9시, 홍대입구</p>
              </div>
            </div>
          </div>
        </section>

        {/* 시작하기 버튼 섹션 */}
        <section className="flex flex-col items-center justify-center py-12 text-center bg-white">
          <h2 className="mb-4 heading-2">지금 바로 시작해보세요!</h2>
          <Button onClick={handleStartNow} size="xl" theme="mix">
            YANAWA 시작하기
          </Button>
        </section>
      </div>
      {showInstallPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center justify-center w-11/12 max-w-lg p-6 text-center bg-white rounded-xl">
            <img
              className="w-1/4 mx-auto"
              src={`${process.env.PUBLIC_URL}/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png`}
              alt="YANAWA"
            />
            <h2 className="mt-4 text-lg font-bold">
              YHANAWA를 설치하고 <br /> 번개모임을 만들어보세요!
            </h2>
            <p className="my-4 text-sm text-gray-600">
              앱에서 푸시 알림을 받을 수 있어요.
            </p>
            <div className="flex gap-2">
              <Button size="md" onClick={handleInstallClick}>
                설치
              </Button>
              <Button size="md" theme="white" onClick={handleCloseModal}>
                나중에 설치
              </Button>
            </div>
          </div>
        </div>
      )}
      {showPushNotificationPrompt && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
          <img
            className="w-24 h-24 mb-4"
            alt="알람"
            src={`${process.env.PUBLIC_URL}/android/android-launchericon-96-96.png`}
          />
          <h1 className="text-xl font-bold">푸시 알림 받기</h1>
          <p className="my-2 text-center text-gray-600">
            푸시 알림을 설정하고 각종 공지사항, 키워드 알림을 받아보세요!
          </p>
          <div className="flex gap-2 mt-4">
            <Button size="md" onClick={handleAllowNotifications}>
              알림 받기
            </Button>
            <Button
              size="md"
              theme="white"
              onClick={() => setShowPushNotificationPrompt(false)}
            >
              나중에 받을게요
            </Button>
          </div>
        </div>
      )}
      {showModal && <DailyModal onClose={handleCloseModal} />}
      {isIOS && (
        <PWAPrompt
          promptOnVisit={1}
          timesToShow={1}
          copyTitle="야나와 앱 설치하기 - 아이폰"
          copySubtitle="홈 화면에 앱을 추가하고 번개모임 생성 알림을 받아보세요."
          copyDescription="야나와는 앱설치 없이 홈화면에 추가를 통해 사용할 수 있습니다."
          copyShareStep="하단 메뉴에서 '공유' 아이콘을 눌러주세요."
          copyAddToHomeScreenStep="아래의 '홈 화면에 추가' 버튼을 눌러주세요."
          appIconPath={`${process.env.PUBLIC_URL}/ios/192.png`}
          isShown={shouldShowPWAPrompt}
        />
      )}
    </div>
  );
};

export default HomePage;
