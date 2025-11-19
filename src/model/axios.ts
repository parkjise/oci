/**
 * API 관련 타입 정의
 */

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string | number;
}

/**
 * API 에러 응답 구조
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
}

/**
 * 커스텀 Axios 에러
 */
export interface CustomAxiosError extends AxiosError<ApiErrorResponse> {
  response?: AxiosResponse<ApiErrorResponse>;
}

/**
 * API 요청 설정 (기본 설정 확장)
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean; // 인증 토큰 제외 여부
  skipErrorHandler?: boolean; // 에러 핸들러 스킵 여부
}

/**
 * 페이징 응답 구조
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
