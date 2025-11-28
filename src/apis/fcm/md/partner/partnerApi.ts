/**
 * ============================================================================
 * 거래처관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 거래처 목록 조회
 */
export const getPartnerList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/md/partner", { params });
  return response.data;
};

/**
 * 거래처 등록
 */
export const createPartner = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/md/partner", data);
  return response.data;
};

