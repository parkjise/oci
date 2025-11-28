// ============================================================================
// 인증 관련 API
// ============================================================================
import { post, get } from "../common/api";
import { setAccessToken } from "@utils/tokenUtils";
import type { ApiResponse } from "@/types/axios.types";
import type { AuthUser } from "@/types/auth.types";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/api.types";

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
    // refreshToken은 HttpOnly 쿠키로 자동 설정되므로 별도 저장 불필요
    // (백엔드에서 쿠키로 설정됨)

    // 사용자 정보 조회 (실패해도 로그인은 성공으로 처리)
    try {
      const userResponse = await getUserInfoApi();
      if (userResponse.success && userResponse.data) {
        response.data.user = userResponse.data;
      }
    } catch (error) {
      // 사용자 정보 조회 실패는 로그인 성공에 영향을 주지 않음
      if (import.meta.env.DEV) {
        console.error("[User Info Error]", error);
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
 * @returns 새로운 액세스 토큰
 * @remarks
 * - refreshToken은 쿠키(HttpOnly)에서 자동으로 가져옵니다.
 * - 백엔드는 쿠키에서만 refreshToken을 읽습니다.
 * - 백엔드 응답은 accessToken만 포함하며, refreshToken은 쿠키로만 전송됩니다.
 * - 토큰 저장은 axiosInstance의 응답 인터셉터에서 처리됩니다.
 * - 에러 처리도 axiosInstance에서 처리되므로 skipErrorHandler를 사용합니다.
 * - withCredentials: true로 설정되어 있어 cookie가 자동으로 전송됩니다.
 */
export const refreshTokenApi = async (): Promise<
  ApiResponse<RefreshTokenResponse>
> => {
  return post<RefreshTokenResponse>(
    "/auth/refresh",
    {}, // 빈 body (쿠키에서 refreshToken 읽음)
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
  return get<AuthUser>("/system/org/user/me");
};
