/**
 * ============================================================================
 * 결산관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 결산 목록 조회
 */
export const getSettlementList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/gl/settlement", { params });
  return response.data;
};

/**
 * 결산 처리
 */
export const processSettlement = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/gl/settlement", data);
  return response.data;
};

