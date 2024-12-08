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
      localStorage.setItem("user", { user: userInfo });
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
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  },
}));

export default useAuthStore;
