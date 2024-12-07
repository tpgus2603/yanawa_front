import { create } from "zustand";
import { getSessionInfo, logout } from "../api/auth";

const useAuthStore = create((set) => ({
  user: null, // 사용자 정보
  // user: { name: "윤석찬", email: "ysc0731@ajou.ac.kr" }, // 사용자 정보

  // 세션 정보 가져오기
  fetchSession: async () => {
    try {
      const userInfo = await getSessionInfo();
      set({ user: userInfo });
    } catch (error) {
      console.error("Failed to fetch session info:", error);
      set({ user: null });
    }
  },

  // 로그아웃 처리
  logoutUser: async () => {
    try {
      await logout();
      set({ user: null });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  },
}));

export default useAuthStore;
