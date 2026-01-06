/**
 * 공통 API 함수
 */

import axiosInstance from "./axiosInstance";
import type {
  ApiResponse,
  ApiRequestConfig,
  PaginatedResponse,
} from "@/types/com/api/axios.types";

/**
 * GET 요청
 */
export const get = async <T>(
  url: string,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.get<ApiResponse<T>>(url, config);
  return response.data;
};

/**
 * POST 요청
 */
export const post = async <T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
  return response.data;
};

/**
 * PUT 요청
 */
export const put = async <T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
  return response.data;
};

/**
 * PATCH 요청
 */
export const patch = async <T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
  return response.data;
};

/**
 * DELETE 요청
 */
export const del = async <T>(
  url: string,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
  return response.data;
};

/**
 * 페이징 GET 요청
 */
export const getPaginated = async <T>(
  url: string,
  params?: {
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
  },
  config?: ApiRequestConfig
): Promise<ApiResponse<PaginatedResponse<T>>> => {
  const response = await axiosInstance.get<ApiResponse<PaginatedResponse<T>>>(
    url,
    {
      ...config,
      params,
    }
  );
  return response.data;
};

/**
 * Axios 인스턴스 직접 사용 (커스텀 요청이 필요한 경우)
 */
export { axiosInstance };
