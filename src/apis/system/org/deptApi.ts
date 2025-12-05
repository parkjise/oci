// ============================================================================
// 부서 관리 API
// ============================================================================
// 변경이력:
// - 2025.12.04 : ckkim (최초작성)

import { post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 부서 검색 요청
 */
export interface DeptSearchRequest {
  officeId?: string; // AS_OFFICE_ID
  find?: string; // AS_FIND (부서코드 또는 부서명)
  useType?: string; // AS_USE_TYPE
  useYno?: string; // AS_USE_YNO
}

/**
 * 부서 DTO
 */
export interface DeptDto {
  officeId?: string; // OFFICE_ID
  deptCde?: string; // DEPT_CDE
  deptNme?: string; // DEPT_NME
  deptAbbrv?: string; // DEPT_ABBRV
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 부서 목록 조회 (검색)
 */
export const searchDeptListApi = async (
  request: DeptSearchRequest
): Promise<ApiResponse<DeptDto[]>> => {
  return post<DeptDto[]>("/system/org/dept/search", request);
};

