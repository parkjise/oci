// ============================================================================
// Axios 인스턴스 설정
// ============================================================================
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@utils/tokenUtils";
import type { ApiRequestConfig, ApiErrorResponse } from "../../model/axios";
import { refreshTokenApi } from "../authApi";
import { useAuthStore } from "@store/authStore";
import { showError } from "@/components/common/message";

// --------------------------------------------------------------------------
// 상수
// --------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// --------------------------------------------------------------------------
// 토큰 갱신 관련 상태 관리
// --------------------------------------------------------------------------
// 토큰 갱신 중인지 추적하는 플래그 (동시 요청 시 중복 갱신 방지)
let isRefreshing = false;
// 갱신 대기 중인 요청들을 저장하는 큐
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * 대기 중인 요청들을 처리
 * @param error - 에러가 발생한 경우 에러 객체, 성공한 경우 null
 * @param token - 새로운 액세스 토큰 (성공한 경우)
 */
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --------------------------------------------------------------------------
// Axios 인스턴스 생성
// --------------------------------------------------------------------------
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// --------------------------------------------------------------------------
// 요청 인터셉터
// --------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as InternalAxiosRequestConfig &
      ApiRequestConfig;

    // 인증 토큰 추가
    if (!requestConfig.skipAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// --------------------------------------------------------------------------
// 응답 인터셉터
// --------------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig &
      ApiRequestConfig;

    // skipErrorHandler 옵션이 있으면 기본 에러 핸들링 스킵
    if (originalRequest?.skipErrorHandler) {
      return Promise.reject(error);
    }

    // 네트워크 에러
    if (!error.response) {
      showError("네트워크 오류가 발생했습니다. 연결을 확인해주세요.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 401 Unauthorized - 토큰 만료 또는 인증 실패
    if (status === 401 && originalRequest && !originalRequest.skipAuth) {
      // refreshTokenApi 요청 자체가 401인 경우 무한 루프 방지
      if (originalRequest.url?.includes("/auth/refresh")) {
        // 리프레시 토큰도 만료된 경우
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        showError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // 리프레시 토큰이 없는 경우
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        showError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        return Promise.reject(error);
      }

      // 이미 갱신 중인 경우, 대기 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 토큰 갱신 시작
      isRefreshing = true;

      try {
        const refreshResponse = await refreshTokenApi(refreshToken);
        if (refreshResponse.success && refreshResponse.data?.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          // 새 액세스 토큰 저장
          setAccessToken(newAccessToken);

          // 새 리프레시 토큰이 있으면 저장 (토큰 로테이션)
          if (refreshResponse.data.refreshToken) {
            setRefreshToken(refreshResponse.data.refreshToken);
          }

          // 대기 중인 요청들 처리
          processQueue(null, newAccessToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          isRefreshing = false;
          return axiosInstance(originalRequest);
        } else {
          // 갱신 실패 (응답은 받았지만 토큰이 없는 경우)
          throw new Error("Token refresh failed: No access token in response");
        }
      } catch (refreshError) {
        // 갱신 실패 시 대기 중인 요청들 모두 실패 처리
        processQueue(error, null);
        isRefreshing = false;

        if (import.meta.env.DEV) {
          console.error("Unable to refresh token", refreshError);
        }

        // 토큰 갱신 실패
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        showError("로그인이 만료되었습니다. 다시 로그인해주세요.");

        return Promise.reject(error);
      }
    }

    // 403 Forbidden - 권한 없음
    if (status === 403) {
      showError(data?.message || "접근 권한이 없습니다.");
      return Promise.reject(error);
    }

    // 404 Not Found
    if (status === 404) {
      showError(data?.message || "요청한 리소스를 찾을 수 없습니다.");
      return Promise.reject(error);
    }

    // 500 Internal Server Error
    if (status >= 500) {
      showError(
        data?.message || "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
      return Promise.reject(error);
    }

    // 기타 에러
    const errorMessage =
      data?.message || error.message || "오류가 발생했습니다.";
    showError(errorMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;
