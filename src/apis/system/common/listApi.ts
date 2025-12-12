// ============================================================================
// 공통 목록 조회 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 공통 목록 응답 DTO
 */
export interface ListResponse {
  code?: string; // 코드
  name?: string; // 이름
  description?: string; // 설명
  additionalInfo?: string; // 추가 정보
}

/**
 * 조직/사업장 조회 요청 DTO
 */
export interface OrgRequest {
  officeId: string; // 사무실 ID
  empyId?: string; // 직원 ID (선택)
  orgId?: string; // 조직 ID (선택)
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 입고 사업장 목록 조회 (IN_ORG_ID)
 * AS-IS selectCommonList의 IN_ORG_ID와 동일한 기능
 */
export const getInOrgListApi = async (
  request: OrgRequest
): Promise<ApiResponse<ListResponse[]>> => {
  return post<ListResponse[]>("/system/common/list/org/inbound", request);
};

/**
 * 전체 사업장 목록 조회 (ORG_ID_ALL)
 * AS-IS selectCommonList의 ORG_ID_ALL과 동일한 기능
 */
export const getAllOrgListApi = async (
  request: OrgRequest
): Promise<ApiResponse<ListResponse[]>> => {
  return post<ListResponse[]>("/system/common/list/org/all", request);
};

