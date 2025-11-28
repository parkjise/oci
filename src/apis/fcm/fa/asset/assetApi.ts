/**
 * ============================================================================
 * 고정자산관리 API 함수
 * ============================================================================
 */

import { axiosInstance } from "@apis/common";

/**
 * 고정자산 목록 조회
 */
export const getAssetList = async (params: unknown) => {
  const response = await axiosInstance.get("/fcm/fa/asset", { params });
  return response.data;
};

/**
 * 고정자산 등록
 */
export const createAsset = async (data: unknown) => {
  const response = await axiosInstance.post("/fcm/fa/asset", data);
  return response.data;
};

