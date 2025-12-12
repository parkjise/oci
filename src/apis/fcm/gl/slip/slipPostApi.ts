/**
 * ============================================================================
 * 전표 전기 API 함수
 * ============================================================================
 *
 * 전표 전기 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  SlipPostSearchRequest,
  SlipPostSearchResponse,
  SlipPostSaveRequest,
} from "@/types/fcm/gl/slip/slipPost.types";

/**
 * 전표 전기 조회
 * @param request 조회 조건
 * @returns 전표 전기 목록
 */
export const selectSlipPostList = async (
  request: SlipPostSearchRequest
): Promise<ApiResponse<SlipPostSearchResponse[]>> => {
  return await post<SlipPostSearchResponse[]>(
    "/fcm/gl/slip/selectSlipPostList",
    request
  );
};

/**
 * 전표 전기 저장
 * @param request 저장할 전표 전기 데이터
 * @returns 저장 결과
 */
export const saveSlipPost = async (
  request: SlipPostSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/saveSlipPost", request);
};



