import { create } from "zustand";
import { getSessionInfo, logout } from "../api/auth";

const useAuthStore = create((set) => ({
  user: null, // 사용자 정보
  loading: true, // 로딩 상태

  // 세션 정보 가져오기
  fetchSession: async () => {
    set({ loading: true });
    try {
      const userInfo = await getSessionInfo();
      set({ user: userInfo });
      localStorage.setItem("user", userInfo);
      const nickname = userInfo.name || "Unknown";
      localStorage.setItem("nickname", nickname);
      console.log("반환값 userInfo: " + userInfo);
      const localuser = localStorage.getItem("user");
      console.log("user: " + localuser);
      console.log("nickname: " + nickname);
    } catch (error) {
      console.error("Failed to fetch session info:", error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  // 로그아웃 처리
  logoutUser: async () => {
    try {
      await logout();
      set({ user: null });
      localStorage.removeItem("user");
      localStorage.removeItem("nickname");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  },
}));

export default useAuthStore;
