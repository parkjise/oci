/**
 * ============================================================================
 * 거래처 등록 API 함수
 * ============================================================================
 *
 * 거래처 등록 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  BcncSrchRequest,
  BcncListResponse,
  BcncDetailResponse,
  BcncShipResponse,
  BcncInsertInfoResponse,
  BcncSaveRequest,
} from "@/types/fcm/md/partner/bcncRegist.types";

/**
 * 거래처 등록 - 목록 조회
 * @param request 조회 조건
 * @returns 거래처 목록
 */
export const selectBcncList = async (
  request: BcncSrchRequest
): Promise<ApiResponse<BcncListResponse[]>> => {
  return await post<BcncListResponse[]>(
    "/fcm/md/partner/selectBcncList",
    request
  );
};

/**
 * 거래처 등록 - 상세 조회
 * @param request 조회 조건
 * @returns 거래처 상세 정보
 */
export const selectBcncDetail = async (
  request: BcncSrchRequest
): Promise<ApiResponse<BcncDetailResponse>> => {
  return await post<BcncDetailResponse>(
    "/fcm/md/partner/selectBcncDetail",
    request
  );
};

/**
 * 거래처 등록 - 하단(배송지) 조회
 * @param request 조회 조건
 * @returns 배송지 목록
 */
export const selectBcncShipList = async (
  request: BcncSrchRequest
): Promise<ApiResponse<BcncShipResponse[]>> => {
  return await post<BcncShipResponse[]>(
    "/fcm/md/partner/selectBcncShipList",
    request
  );
};

/**
 * 거래처 등록 메인상세 저장
 * @param request 저장할 거래처 데이터
 * @returns 저장 결과
 */
export const saveBcnc = async (
  request: BcncSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/md/partner/saveBcnc", request);
};

/**
 * 거래처 등록 - 입력 관련 정보 조회
 * @param request 조회 조건
 * @returns 입력 관련 정보
 */
export const selectBcncInsertInfo = async (
  request: BcncSrchRequest
): Promise<ApiResponse<BcncInsertInfoResponse>> => {
  return await post<BcncInsertInfoResponse>(
    "/fcm/md/partner/selectBcncInsertInfo",
    request
  );
};

/**
 * 팝업 검색 - 거래처 검색
 * @param request 조회 조건
 * @returns 거래처 목록
 */
export const searchBcncList = async (
  request: BcncSrchRequest
): Promise<ApiResponse<BcncDetailResponse[]>> => {
  return await post<BcncDetailResponse[]>(
    "/fcm/md/partner/searchBcncList",
    request
  );
};

