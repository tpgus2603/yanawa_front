import GetFCMToken from "./GetFCMToken";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "center-center",
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const GetUserPermission = async () => {
  try {
    if (!("Notification" in window)) {
      alert(
        "알림 서비스를 원활하게 사용하시려면 바탕화면에 바로가기 추가 후, 홈페이지에 종모양아이콘 클릭하여 알림 허용을 해주세요."
      );
      return;
    }

    console.log("Checking notification permission...");

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
        console.log("Notification permission granted. Ready to send token...");
        await GetFCMToken();
        let isFCMToken = localStorage.getItem("fcmToken");
        if (!isFCMToken) {
          await GetFCMToken();
          Toast.fire({
            icon: "info",
            title: `알림 토큰 저장 중`,
          });
        } else {
          console.log("token setting complete");
        }
      } catch {
        Toast.fire({
          icon: "error",
          title: `알림 토큰 요청 실패`,
        });
      }
    } else if (permission === "denied") {
      console.log(
        "Notification permission not granted. Requesting permission..."
      );
    } else {
    }
  } catch (error) {
    Toast.fire({
      icon: "error",
      title: `알림 설정 요청 실패`,
    });
    console.error("Failed to check or request notification permission:", error);
  }
};

export default GetUserPermission;
