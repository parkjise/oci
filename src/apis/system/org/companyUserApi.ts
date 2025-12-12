// ============================================================================
// 회사사용자 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 회사사용자 헤더 DTO
 */
export interface CompanyUserHeaderDto {
  officeId?: string; // 회사코드
  empCode?: string; // 사용자코드
  empName?: string; // 성명
  deptCode?: string; // 부서코드
  deptName?: string; // 부서명
  useYn?: string; // 사용여부
}

/**
 * 회사사용자 상세 DTO
 */
export interface CompanyUserDetailDto {
  officeId?: string; // 회사코드
  empCode?: string; // 사용자코드
  authOfficeId?: string; // 권한회사코드
  oriOrgId?: string; // 권한회사코드(U,D용)
  primeYn?: string; // Primary 여부 (Y/N)
  rowStatus?: "C" | "U" | "D"; // 행 상태
}

/**
 * 회사 목록 DTO
 */
export interface CompanyDto {
  officeId?: string; // 회사코드
  officeName?: string; // 회사명
}

/**
 * 회사사용자 헤더 검색 요청
 */
export interface CompanyUserHeaderSearchRequest {
  officeId: string; // 회사코드
  type?: string; // 타입 (1: 부서, 2: 성명, 3: 사번)
  name?: string; // 검색어
  useYn?: string; // 사용여부 (Y/N/%)
}

/**
 * 회사사용자 상세 검색 요청
 */
export interface CompanyUserDetailSearchRequest {
  officeId: string; // 회사코드
  empCode: string; // 사용자코드
}

/**
 * 회사사용자 상세 저장 요청
 */
export interface CompanyUserDetailSaveRequest {
  detailList: CompanyUserDetailDto[];
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
 * 회사 목록 조회
 */
export const getCompanyListApi = async (params: {
  officeId: string;
}): Promise<ApiResponse<CompanyDto[]>> => {
  return post<CompanyDto[]>("/system/common/list/office", params);
};

/**
 * 회사사용자 헤더 목록 조회
 */
export const getCompanyUserHeaderListApi = async (
  params: CompanyUserHeaderSearchRequest
): Promise<ApiResponse<CompanyUserHeaderDto[]>> => {
  return get<CompanyUserHeaderDto[]>("/system/org/companyuser/headers", {
    params,
  });
};

/**
 * 회사사용자 상세 목록 조회
 */
export const getCompanyUserDetailListApi = async (
  params: CompanyUserDetailSearchRequest
): Promise<ApiResponse<CompanyUserDetailDto[]>> => {
  return get<CompanyUserDetailDto[]>("/system/org/companyuser/details", {
    params,
  });
};

/**
 * 회사사용자 상세 저장
 */
export const saveCompanyUserDetailListApi = async (
  request: CompanyUserDetailSaveRequest
): Promise<ApiResponse<SaveResponse>> => {
  return post<SaveResponse>("/system/org/companyuser/details", request);
};
