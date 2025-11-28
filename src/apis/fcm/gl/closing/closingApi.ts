/**
 * ============================================================================
 * 월마감관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 월마감 목록 조회
 */
export const getClosingList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/gl/closing", { params });
  return response.data;
};

/**
 * 월마감 처리
 */
export const processClosing = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/gl/closing", data);
  return response.data;
};

