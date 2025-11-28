/**
 * ============================================================================
 * 계정코드관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 계정코드 목록 조회
 */
export const getAccountList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/md/account", { params });
  return response.data;
};

/**
 * 계정코드 등록
 */
export const createAccount = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/md/account", data);
  return response.data;
};

