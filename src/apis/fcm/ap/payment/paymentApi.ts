/**
 * ============================================================================
 * 지급처리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 지급 목록 조회
 */
export const getPaymentList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/ap/payment", { params });
  return response.data;
};

/**
 * 지급 처리
 */
export const processPayment = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/ap/payment", data);
  return response.data;
};

