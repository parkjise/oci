// ============================================================================
// 법인 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 법인 DTO
 */
export interface CompanyDto {
  officeId?: string; // OFFICE_ID
  officeNme?: string; // OFFICE_NME
  officeEngNme?: string; // OFFICE_ENG_NME
  rpsnNme?: string; // RPSN_NME
  rpsnEngNme?: string; // RPSN_ENG_NME
  rpsnIdNbr?: string; // RPSN_ID_NBR
  corpNo?: string; // CORP_NO
  businessCategory?: string; // BUSINESS_CATEGORY
  addr?: string; // ADDR
  addrEng?: string; // ADDR_ENG
  uptae?: string; // UPTAE
  jong?: string; // JONG
  telNo?: string; // TEL_NO
  faxNo?: string; // FAX_NO
  prefix?: string; // PREFIX
  establishDate?: string; // ESTABLISH_DATE
  officeImgId?: string; // OFFICE_IMG_ID
  rowStatus?: string; // 행 상태 (C: 추가, U: 수정, D: 삭제)
}

/**
 * 법인 검색 요청
 */
export interface CompanySearchRequest {
  officeId?: string; // 회사코드
}

/**
 * 법인 저장 요청
 */
export interface CompanySaveRequest {
  companyList: CompanyDto[];
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
 * 법인 목록 조회
 */
export const getCompanyListApi = async (
  params?: CompanySearchRequest
): Promise<ApiResponse<CompanyDto[]>> => {
  return get<CompanyDto[]>("/system/org/company", {
    params: {
      officeId: params?.officeId,
    },
  });
};

/**
 * 법인 상세 조회
 */
export const getCompanyApi = async (officeId: string): Promise<ApiResponse<CompanyDto>> => {
  return get<CompanyDto>(`/system/org/company/${officeId}`);
};

/**
 * 법인 저장 (배치 처리)
 */
export const saveCompanyListApi = async (
  request: CompanySaveRequest
): Promise<ApiResponse<SaveResponse>> => {
  return post<SaveResponse>("/system/org/company", request);
};

