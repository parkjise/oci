/**
 * ============================================================================
 * 지출결의 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 지출결의 목록 조회
 */
export const getExpenseList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/ap/expense", { params });
  return response.data;
};

/**
 * 지출결의 등록
 */
export const createExpense = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/ap/expense", data);
  return response.data;
};

