/**
 * ============================================================================
 * 매출처리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 매출 목록 조회
 */
export const getSalesList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/ar/sales", { params });
  return response.data;
};

/**
 * 매출 등록
 */
export const createSales = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/ar/sales", data);
  return response.data;
};

