/**
 * ============================================================================
 * 증빙관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 증빙 목록 조회
 */
export const getEvidenceList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/ap/evidence", { params });
  return response.data;
};

/**
 * 증빙 등록
 */
export const createEvidence = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/ap/evidence", data);
  return response.data;
};

