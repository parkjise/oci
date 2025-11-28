// ============================================================================
// 메인 화면 관련 API
// ============================================================================
import { get } from "../common/api";
import type { ApiResponse } from "@/types/axios.types";
import type { MainInitResponse } from "@/types/api.types";

/**
 * 초기 데이터 조회 API
 * @returns 메뉴 리스트와 사용자 기본 정보
 */
export const getMainInitDataApi = async (): Promise<ApiResponse<MainInitResponse>> => {
  return get<MainInitResponse>("/system/main/init");
};

