// ============================================================================
// 사업장 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 사업장 DTO
 */
export interface WorkplaceDto {
  officeId?: string; // OFFICE_ID
  orgId?: string; // ORG_ID
  orgNme?: string; // ORG_NME
  orgEngNme?: string; // ORG_ENG_NME
  regtNo?: string; // REGT_NO
  rpsnNme?: string; // RPSN_NME
  rpsnEngNme?: string; // RPSN_ENG_NME
  rpsnIdNbr?: string; // RPSN_ID_NBR
  addr?: string; // ADDR
  addrEng?: string; // ADDR_ENG
  invOrg?: string; // INV_ORG
  regtNoSeq?: string; // REGT_NO_SEQ
  sortOrder?: string; // SORT_ORDER
  enabledFlag?: string; // ENABLED_FLAG
  uptae?: string; // UPTAE
  jong?: string; // JONG
  telNo?: string; // TEL_NO
  faxNo?: string; // FAX_NO
  dclDept?: string; // DCL_DEPT
  dclPerNme?: string; // DCL_PER_NME
  dclTelNo?: string; // DCL_TEL_NO
  zipCode?: string; // ZIP_CODE
  defaultVatDept?: string; // DEFAULT_VAT_DEPT
  deptName?: string; // DEPT_NAME
  homeTaxId?: string; // HOME_TAX_ID
  taxOfficeCode?: string; // TAX_OFFICE_CODE
  orgImgId?: string; // ORG_IMG_ID
  rowStatus?: string; // 행 상태 (C: 추가, U: 수정, D: 삭제)
}

/**
 * 사업장 검색 요청
 */
export interface WorkplaceSearchRequest {
  officeId?: string; // 회사코드
}

/**
 * 사업장 저장 요청
 */
export interface WorkplaceSaveRequest {
  workplaceList: WorkplaceDto[];
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
 * 사업장 목록 조회
 */
export const getWorkplaceListApi = async (
  params?: WorkplaceSearchRequest
): Promise<ApiResponse<WorkplaceDto[]>> => {
  return get<WorkplaceDto[]>("/system/org/workplace", {
    params: {
      officeId: params?.officeId,
    },
  });
};

/**
 * 사업장 저장 (배치 처리)
 */
export const saveWorkplaceListApi = async (
  request: WorkplaceSaveRequest
): Promise<ApiResponse<SaveResponse>> => {
  return post<SaveResponse>("/system/org/workplace", request);
};
