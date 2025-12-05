// ============================================================================
// 공통코드 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import axiosInstance from "@apis/common/axiosInstance";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

// 공통코드 DTO (backend CodeDto 매핑)
export interface CodeDto {
  officeId?: string;
  module: string;
  type: string;
  code: string;
  name1?: string;
  name2?: string;
  nameDesc?: string;
  nameAbbrv?: string;
  segment1?: string;
  segment2?: string;
  segment3?: string;
  segment4?: string;
  segment5?: string;
  segment6?: string;
  segment7?: string;
  segment8?: string;
  segment9?: string;
  segment10?: string;
  segment11?: string;
  segment12?: string;
  segment13?: string;
  segment14?: string;
  segment15?: string;
  orgId?: string;
  enabledFlag?: string;
  startDate?: string;
  endDate?: string;
  orderSeq?: number | null;
  defaultYn?: string;
  userType?: string;
  onerpExec?: string;
  nameAbbrvLength?: number | null;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  // 프론트 전용 필드
  rowStatus?: "C" | "U" | "D";
}

// 공통코드 상세 조회 요청 (단일 타입에 대한 헤더+상세)
export interface CodeDetailSearchRequest {
  module: string;
  type: string;
  enabledFlag?: string;
  checkDateRange?: boolean;
}

// 공통코드 목록 조회 요청 (여러 타입)
export interface CodeSearchRequest {
  module: string;
  types: string[];
  enabledFlag?: string;
  checkDateRange?: boolean;
}

// 공통코드 타입 목록 조회 요청 (모듈별 타입 헤더)
export interface CodeTypeSearchRequest {
  module: string;
  enabledFlag?: string;
  checkDateRange?: boolean;
}

// 공통코드 저장 요청
export interface CodeSaveRequest {
  codeList: CodeDto[];
}

// 공통코드 저장 결과
export interface CodeSaveResponse {
  status: string;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 공통코드 목록 조회 (여러 타입)
 */
export const getCodeListApi = async (
  params: CodeSearchRequest
): Promise<ApiResponse<CodeDto[]>> => {
  const { types, ...restParams } = params;
  const response = await axiosInstance.get("/system/pgm/code", {
    params: {
      ...restParams,
      types: types.join(","),
    },
  });
  return response.data;
};

/**
 * 공통코드 상세 목록 조회 (헤더 + 상세)
 */
export const getCodeDetailListApi = async (
  params: CodeDetailSearchRequest
): Promise<ApiResponse<CodeDto[]>> => {
  const response = await axiosInstance.get("/system/pgm/code/detail", { params });
  return response.data;
};

/**
 * 공통코드 타입 목록 조회 (모듈별 타입 헤더)
 */
export const getCodeTypeListApi = async (
  params: CodeTypeSearchRequest
): Promise<ApiResponse<CodeDto[]>> => {
  const response = await axiosInstance.get("/system/pgm/code/types", { params });
  return response.data;
};

/**
 * 공통코드 저장 (등록/수정/삭제)
 */
export const saveCodeListApi = async (
  request: CodeSaveRequest
): Promise<ApiResponse<CodeSaveResponse>> => {
  const response = await axiosInstance.post("/system/pgm/code", request);
  return response.data;
};


