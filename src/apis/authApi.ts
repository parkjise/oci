// ============================================================================
// 인증 관련 API
// ============================================================================
import { post, get } from "./common/api";
import { setAccessToken, setRefreshToken } from "@utils/tokenUtils";
import type { ApiResponse } from "../model/axios";
import type { AuthUser } from "@store/authStore";

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  empCode: string;
  password: string;
  remember?: boolean;
  locale?: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * 로그인 API
 * @param data - 로그인 요청 데이터
 * @returns 로그인 응답 데이터 (토큰 및 사용자 정보 포함)
 * @remarks
 * - 로그인 성공 시 토큰을 저장하고 사용자 정보를 조회합니다.
 * - 사용자 정보 조회 실패 시에도 로그인은 성공으로 처리됩니다.
 */
export const loginApi = async (
  data: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  const response = await post<LoginResponse>("/auth/login", data, {
    skipAuth: true,
  });

  // 로그인 성공 시 토큰 저장 및 사용자 정보 조회
  if (response.success && response.data) {
    setAccessToken(response.data.accessToken);
    if (response.data.refreshToken) {
      setRefreshToken(response.data.refreshToken);
    }

    // 사용자 정보 조회 (실패해도 로그인은 성공으로 처리)
    try {
      const userResponse = await getUserInfoApi();
      if (userResponse.success && userResponse.data) {
        response.data.user = userResponse.data;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch user info after login", error);
      }
    }
  }

  return response;
};

/**
 * 로그아웃 API
 * @returns 로그아웃 응답
 * @remarks
 * - 서버에 로그아웃 요청을 전송합니다.
 * - 토큰 삭제는 호출하는 쪽에서 처리해야 합니다 (useAuthStore.logout).
 */
export const logoutApi = async (): Promise<ApiResponse<void>> => {
  return post<void>("/auth/logout");
};

/**
 * 토큰 갱신 API
 * @param refreshToken - 리프레시 토큰 (선택적, 없으면 cookie에서 가져옴)
 * @returns 새로운 액세스 토큰과 리프레시 토큰 (선택적)
 * @remarks
 * - refreshToken이 제공되지 않으면 cookie에서 자동으로 가져옵니다.
 * - 토큰 저장은 axiosInstance의 응답 인터셉터에서 처리됩니다.
 * - 에러 처리도 axiosInstance에서 처리되므로 skipErrorHandler를 사용합니다.
 * - withCredentials: true로 설정되어 있어 cookie가 자동으로 전송됩니다.
 */
export const refreshTokenApi = async (
  refreshToken?: string
): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> => {
  // refreshToken이 제공되지 않으면 cookie에서 가져옴 (서버에서 cookie 사용 시)
  // refreshToken이 제공되면 body에 포함하여 전송
  const requestData = refreshToken ? { refreshToken } : {};

  return post<{ accessToken: string; refreshToken?: string }>(
    "/auth/refresh",
    requestData,
    {
      skipAuth: true, // 리프레시 토큰 요청은 인증 토큰 불필요
      skipErrorHandler: true, // 에러는 axiosInstance에서 처리
      withCredentials: true, // cookie 전송을 위해 필요
    }
  );
};

/**
 * 사용자 정보 조회 API
 * @returns 현재 로그인한 사용자 정보
 * @remarks
 * - 인증 토큰이 필요합니다.
 * - 토큰이 만료된 경우 401 에러가 발생하며, axiosInstance에서 자동으로 토큰 갱신을 시도합니다.
 */
export const getUserInfoApi = async (): Promise<ApiResponse<AuthUser>> => {
  return get<AuthUser>("/system/employees/me");
};
