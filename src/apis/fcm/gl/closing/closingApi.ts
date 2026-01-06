/**
 * ============================================================================
 * 월마감관리 API 함수
 * ============================================================================
 */

import { post, get } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";

/**
 * 월마감 목록 조회
 */
export const getClosingList = async (params: unknown) => {
  return get("/fcm/gl/closing", { params });
};

/**
 * 월마감 처리
 */
export const processClosing = async (data: unknown) => {
  return post("/fcm/gl/closing", data);
};

/**
 * ============================================================================
 * 월마감/연이월 팝업 API
 * ============================================================================
 */

/**
 * 연이월 처리 요청 타입
 */
export interface YyCyfdPopupSrchRequest {
  asRpsnOfficeId?: string; // 대표사업장 ID
  asOfficeId?: string; // 사업장 ID
  asYearFr?: string; // 회계연도(시작)
  asYearTo?: string; // 회계연도(종료)
  asUserId?: string; // 사용자 ID
  asProgramId?: string; // 프로그램 ID
  asTerminalId?: string; // 터미널 ID
}

/**
 * 연이월 처리 응답 타입
 */
export interface YyCyfdPopupProcResponse {
  pResult?: string; // 처리 결과
}

/**
 * 월마감 팝업 Period 목록 조회 요청 타입
 */
export interface MtClosPopupMTSrchRequest {
  officeId: string; // 사업장 ID (필수)
  year?: string; // 회계연도 (예: "2025")
  periodName?: string; // 기간명
  adjustFlag?: string; // 조정여부 ("N": 마감 안됨, "Y": 마감됨, "%": 전체)
}

/**
 * 월마감 팝업 Period 목록 응답 타입
 */
export interface MtClosPopupMTListResponse {
  officeId?: string; // 사업장 ID
  accYear?: string; // 회계연도
  periodNum?: string; // 기간번호
  periodName?: string; // 기간명 (예: "2025-01")
  dateF?: string; // 시작일 (YYYYMMDD)
  dateT?: string; // 종료일 (YYYYMMDD)
  adjustFlag?: string; // 조정여부 ("N" or "Y")
  yymm?: string; // 연월 (YYYYMM)
}

/**
 * 월마감 처리 요청 타입
 */
export interface MtClosPopupCreatRequest {
  rspnOfficeId: string; // 대표사업장 ID (필수)
  officeId: string; // 사업장 ID (필수)
  realYmF: string; // 실제 회계연월 시작 (필수, 예: "202501")
  realYmT: string; // 실제 회계연월 종료 (필수, 예: "202512")
  dvs: string; // 사업부 (필수)
  rapDept?: string; // 담당부서
  userId: string; // 사용자 ID (필수)
  programId: string; // 프로그램 ID (필수)
  terminalId: string; // 터미널 ID (필수)
}

/**
 * 월마감 처리 응답 타입
 */
export interface MtClosPopupProcResponse {
  result?: string; // 결과
}

/**
 * 월마감 팝업 Period 목록 조회 API 호출
 */
export const selectMtClosPopupMT = async (
  params: MtClosPopupMTSrchRequest
): Promise<ApiResponse<MtClosPopupMTListResponse[]>> => {
  return post<MtClosPopupMTListResponse[]>(
    "/fcm/gl/closing/popup/selectMtClosPopupMT",
    params
  );
};

/**
 * 연이월 처리 API 호출
 */
export const processYyCyfd = async (
  params: YyCyfdPopupSrchRequest
): Promise<ApiResponse<YyCyfdPopupProcResponse>> => {
  return post<YyCyfdPopupProcResponse>(
    "/fcm/gl/closing/popup/processYyCyfd",
    params
  );
};

/**
 * 월마감 처리 API 호출
 */
export const createMtClosPopupTagCreat = async (
  params: MtClosPopupCreatRequest
): Promise<ApiResponse<MtClosPopupProcResponse>> => {
  return post<MtClosPopupProcResponse>(
    "/fcm/gl/closing/popup/createMtClosPopupTagCreat",
    params
  );
};

/**
 * ============================================================================
 * 마감 TAG 관리 API
 * ============================================================================
 */

/**
 * 마감 TAG 관리 검색 요청 타입
 */
export interface ClosTagManageSrchRequest {
  asOfficeId?: string; // 사무소ID
  asYear?: string; // 년도
  asYymm?: string; // 년월
}

/**
 * 마감 TAG 관리 목록 응답 타입
 */
export interface ClosTagManageListResponse {
  officeId?: string; // 사무소ID
  year?: string; // 년도
  mth?: string; // 월
  tag?: string; // 마감상태
  plTag?: string; // 손익마감
  subModule?: string; // 서브모듈
  attribute1?: string; // 최초마감여부
  lastUpdatedBy?: string; // 최종등록자
  lastUpdateDate?: string; // 최종등록일자
  createdBy?: string; // 생성자
  creationDate?: string; // 생성일자
  programId?: string; // Program Id
  terminalId?: string; // Terminal Id
  empName?: string; // 직원명
  amendTag?: string; // 수정태그
  allFlag?: string; // 전체플래그
  cnt?: number; // 미전기건수
  yymm?: string; // 년월
}

/**
 * 마감 TAG 관리 상세 목록 응답 타입
 */
export interface ClosTagManageDetailListResponse {
  officeId?: string; // 사무소ID
  year?: string; // 년도
  mth?: string; // 월
  subModule?: string; // 모듈구분
  tag?: string; // 마감상태
  createdBy?: string; // 생성자
  creationDate?: string; // 생성일자
  lastUpdatedBy?: string; // 최종등록자
  lastUpdateDate?: string; // 최종등록일자
  programId?: string; // Program Id
  terminalId?: string; // Terminal Id
  lastUpdatedByUser?: string; // 최종등록자명
  createdByUser?: string; // 생성자명
}

/**
 * 마감 TAG 관리 헤더 데이터 타입
 */
export interface ClosTagManageHderData {
  rowStatus?: string; // 행상태
  officeId?: string; // 사무소ID
  year?: string; // 년도
  mth?: string; // 월
  tag?: string; // 마감상태
  plTag?: string; // 손익마감
  subModule?: string; // 서브모듈
  attribute1?: string; // 최초마감여부
  lastUpdatedBy?: string; // 최종등록자
  lastUpdateDate?: string; // 최종등록일자
  createdBy?: string; // 생성자
  creationDate?: string; // 생성일자
  programId?: string; // Program Id
  terminalId?: string; // Terminal Id
  empName?: string; // 직원명
  amendTag?: string; // 수정태그
  allFlag?: string; // 전체플래그
  cnt?: number; // 미전기건수
  yymm?: string; // 년월
}

/**
 * 마감 TAG 관리 상세 데이터 타입
 */
export interface ClosTagManageDetailData {
  rowStatus?: string; // 행상태
  officeId?: string; // 사무소ID
  year?: string; // 년도
  mth?: string; // 월
  subModule?: string; // 모듈구분
  tag?: string; // 마감상태
  createdBy?: string; // 생성자
  creationDate?: string; // 생성일자
  lastUpdatedBy?: string; // 최종등록자
  lastUpdateDate?: string; // 최종등록일자
  programId?: string; // Program Id
  terminalId?: string; // Terminal Id
  lastUpdatedByUser?: string; // 최종등록자명
  createdByUser?: string; // 생성자명
}

/**
 * 마감 TAG 관리 저장 요청 타입
 */
export interface ClosTagManageSaveRequest {
  headerList?: ClosTagManageHderData[]; // 헤더 목록
  detailList?: ClosTagManageDetailData[]; // 상세 목록
}

/**
 * 마감 TAG 관리 생성 요청 타입
 */
export interface ClosTagManageCreatRequest {
  asOfficeId?: string; // 사무소ID
  asYear?: string; // 년도
  asUser?: string; // 사용자ID
}

/**
 * 마감 TAG 관리 프로시저 응답 타입
 */
export interface ClosTagManageProcResponse {
  pResult?: string; // 결과
  pErrbuff?: string; // 에러메시지
}

/**
 * 마감 TAG 관리 목록 조회 API 호출
 */
export const selectClosTagManageList = async (
  params: ClosTagManageSrchRequest
): Promise<ApiResponse<ClosTagManageListResponse[]>> => {
  return post<ClosTagManageListResponse[]>(
    "/fcm/gl/closing/selectClosTagManageList",
    params
  );
};

/**
 * 마감 TAG 관리 상세 목록 조회 API 호출
 */
export const selectClosTagManageDetailList = async (
  params: ClosTagManageSrchRequest
): Promise<ApiResponse<ClosTagManageDetailListResponse[]>> => {
  return post<ClosTagManageDetailListResponse[]>(
    "/fcm/gl/closing/selectClosTagManageDetailList",
    params
  );
};

/**
 * 마감 TAG 관리 헤더/상세 저장 API 호출
 */
export const saveClosTagManageHderDetail = async (
  params: ClosTagManageSaveRequest
): Promise<ApiResponse<void>> => {
  return post<void>("/fcm/gl/closing/saveClosTagManageHderDetail", params);
};

/**
 * 마감 TAG 관리 GL 업데이트 API 호출
 */
export const updateClosTagManageGL = async (
  params: ClosTagManageHderData
): Promise<ApiResponse<void>> => {
  return post<void>("/fcm/gl/closing/updateClosTagManageGL", params);
};

/**
 * 마감 TAG 관리 TAG 생성 API 호출
 */
export const createClosTagManageTag = async (
  params: ClosTagManageCreatRequest
): Promise<ApiResponse<ClosTagManageProcResponse>> => {
  return post<ClosTagManageProcResponse>(
    "/fcm/gl/closing/createClosTagManageTag",
    params
  );
};
