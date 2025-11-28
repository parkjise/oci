/**
 * ============================================================================
 * 수금처리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 수금 목록 조회
 */
export const getReceiptList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/ar/receipt", { params });
  return response.data;
};

/**
 * 수금 처리
 */
export const processReceipt = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/ar/receipt", data);
  return response.data;
};

