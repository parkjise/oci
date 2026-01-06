/**
 * ============================================================================
 * 고정자산관리 API 함수
 * ============================================================================
 */

import type {
  FdstLsCodeListResponse,
  FdstLsCodeSrchRequest,
  FdstTmplatListResponse
} from "@/types/fcm/fa.asset/fdstTmplat.types";
import { get } from "@/apis";
import type { ApiResponse } from "@/types/com/api/axios.types";

/**
 * 고정자산 템플릿 목록 조회 API
 * @returns 고정자산 템플릿 목록
 */
export const selectFdstTmplatList = (
): Promise<ApiResponse<FdstTmplatListResponse[]>> => {
  return get<FdstTmplatListResponse[]>(
    '/fcm/fa/asset/selectFdstTmplatList',
  )
};

/**
 * 고정자산 분류 목록 조회 API
 * @returns 고정자산 분류 목록
 */
export const selectFdstLsCodeList = (
  request: FdstLsCodeSrchRequest,
): Promise<ApiResponse<FdstLsCodeListResponse[]>> => {
  const params = new URLSearchParams({
    asOfficeId: request.asOfficeId ?? '',
    asScode: request.asScode ?? '',
    asScodeName: request.asScodeName ?? '',
  });
  return get<FdstLsCodeListResponse[]>(
    `/fcm/fa/asset/selectFdstLsCodeList?${params.toString()}`,
  )
};
