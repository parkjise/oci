// ============================================================================
// 사업장사용자 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 사업장사용자 헤더 DTO
 */
export interface WorkplaceUserHeaderDto {
  officeId?: string; // 회사코드
  deptCode?: string; // 부서코드
  deptName?: string; // 부서명
  empCode?: string; // 사용자코드
  empName?: string; // 사용자명
  useYn?: string; // 사용여부
  orgFlag?: string; // ORG_FLAG
  multiFlag?: string; // MULTI_FLAG
}

/**
 * 사업장사용자 상세 DTO
 */
export interface WorkplaceUserDetailDto {
  officeId?: string; // 회사코드
  empyId?: string; // 사원코드
  orgId?: string; // 사업장코드
  oriOrgId?: string; // 사업장코드(U,D용)
  multiOrgYno?: string; // MULTI_ORG_YNO
  userId?: string; // 사용자코드
  wrkDate?: string; // WRK_DATE
  primary?: string; // 소속사업장 (Y/N)
  rowStatus?: "C" | "U" | "D"; // 행 상태
}

/**
 * 사업장사용자 헤더 검색 요청
 */
export interface WorkplaceUserHeaderSearchRequest {
  officeId: string; // 회사코드
  type?: string; // 타입 (1: 부서, 2: 성명, 3: 사번)
  name?: string; // 검색어
  useYn?: string; // 사용여부 (Y/N/%)
}

/**
 * 사업장사용자 상세 검색 요청
 */
export interface WorkplaceUserDetailSearchRequest {
  officeId: string; // 회사코드
  empyId: string; // 사원코드
}

/**
 * 사업장사용자 상세 저장 요청
 */
export interface WorkplaceUserDetailSaveRequest {
  detailList: WorkplaceUserDetailDto[];
}

/**
 * 저장 응답
 */
export interface SaveResponse {
  result: string; // S: 성공, F: 실패
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 사업장사용자 헤더 목록 조회
 */
export const getWorkplaceUserHeaderListApi = async (
  params: WorkplaceUserHeaderSearchRequest
): Promise<ApiResponse<WorkplaceUserHeaderDto[]>> => {
  return get<WorkplaceUserHeaderDto[]>("/system/org/workplaceuser/headers", {
    params,
  });
};

/**
 * 사업장사용자 상세 목록 조회
 */
export const getWorkplaceUserDetailListApi = async (
  params: WorkplaceUserDetailSearchRequest
): Promise<ApiResponse<WorkplaceUserDetailDto[]>> => {
  return get<WorkplaceUserDetailDto[]>("/system/org/workplaceuser/details", {
    params,
  });
};

/**
 * 사업장사용자 상세 저장
 */
export const saveWorkplaceUserDetailListApi = async (
  request: WorkplaceUserDetailSaveRequest
): Promise<ApiResponse<SaveResponse>> => {
  return post<SaveResponse>("/system/org/workplaceuser/details", request);
};

