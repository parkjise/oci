import { create } from "zustand";
import { clearAllTokens, getAccessToken } from "../utils/tokenUtils";
import { getUserInfoApi } from "../apis/authApi";

export interface AuthUser {
  officeId: string; //회사코드
  empCode: string; //사원 코드
  empName?: string; //사원 이름
  deptCode?: string; //부서 코드
  password?: string; //비밀번호
  useYn?: string | "Y"; //사용 여부 (Y/N)
  emailId?: string | null; //이메일 ID
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isInitialized: boolean; // 초기화 상태 추가
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  setInitialized: (isInitialized: boolean) => void; // 초기화 상태 설정 함수 추가
  initializeAuth: () => Promise<void>; // 인증 상태 초기화 함수
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isInitialized: false, // 초기값은 false
  setUser: (user: AuthUser | null) =>
    set({ user, isAuthenticated: !!user, isInitialized: true }),
  logout: () => {
    clearAllTokens(); // 토큰 삭제
    set({ user: null, isAuthenticated: false });
  },
  setInitialized: (isInitialized: boolean) => set({ isInitialized }), // 함수 구현
  initializeAuth: async () => {
    // 이미 초기화되었으면 스킵
    if (get().isInitialized) {
      return;
    }

    const token = getAccessToken();
    // 토큰이 없으면 초기화 완료
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    // 토큰이 있으면 사용자 정보 가져오기
    try {
      const response = await getUserInfoApi();
      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        // 사용자 정보 가져오기 실패 시 토큰 삭제
        clearAllTokens();
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      // 에러 발생 시 토큰 삭제하고 초기화 완료
      if (import.meta.env.DEV) {
        console.error("Failed to initialize auth:", error);
      }
      clearAllTokens();
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
}));
