/**
 * ============================================================================
 * 전표 등록 API 함수
 * ============================================================================
 * 
 * 전표 등록 관련 API 호출 함수 정의
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  SlipRegistSrchRequest,
  SlipRegistListResponse,
  SlipRegistHderResponse,
  SlipRegistDetailResponse,
  SlipRegistSaveRequest,
  SlipRegistConfmRequest,
  SlipRegistConfmResponse,
} from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";

/**
 * 전표 등록 목록 조회
 * @param request 조회 조건
 * @returns 전표 목록
 */
export const selectSlipRegistList = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistListResponse[]>> => {
  return await post<SlipRegistListResponse[]>("/fcm/gl/slip/selectSlipRegistList", request);
};

/**
 * 전표 일련번호 조회
 * @param request 조회 조건
 * @returns 전표 헤더 정보
 */
export const selectSerialNumber = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistHderResponse>> => {
  return await post<SlipRegistHderResponse>("/fcm/gl/slip/selectSlipSerialNumber", request);
};

/**
 * 전표 헤더 ID 생성
 * @param request 조회 조건
 * @returns 전표 헤더 정보
 */
export const createSlipHderId = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistHderResponse>> => {
  return await post<SlipRegistHderResponse>("/fcm/gl/slip/createSlipHderId", request);
};

/**
 * 전표 헤더 ID 조회
 * @param request 조회 조건
 * @returns 전표 헤더 정보
 */
export const selectSlipHderId = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistHderResponse>> => {
  return await post<SlipRegistHderResponse>("/fcm/gl/slip/selectSlipHderId", request);
};

/**
 * 전표 헤더 목록 조회
 * @param request 조회 조건
 * @returns 전표 헤더 정보
 */
export const selectHderList = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistHderResponse>> => {
  return await post<SlipRegistHderResponse>("/fcm/gl/slip/selectSlipHderList", request);
};

/**
 * 전표 상세 목록 조회
 * @param request 조회 조건
 * @returns 전표 상세 목록
 */
export const selectDetailList = async (
  request: SlipRegistSrchRequest
): Promise<ApiResponse<SlipRegistDetailResponse[]>> => {
  return await post<SlipRegistDetailResponse[]>("/fcm/gl/slip/selectSlipDetailList", request);
};

/**
 * 전표 헤더/상세 저장
 * @param request 저장할 전표 데이터
 * @returns 저장 결과
 */
export const saveHderDetail = async (
  request: SlipRegistSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/saveSlipHderDetail", request);
};

/**
 * 전표 복사 저장
 * @param request 복사할 전표 데이터
 * @returns 저장 결과
 */
export const saveCopyHderDetail = async (
  request: SlipRegistSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/saveSlipCopyHderDetail", request);
};

/**
 * 전표 헤더/상세 삭제
 * @param request 삭제할 전표 데이터
 * @returns 삭제 결과
 */
export const deleteHderDetail = async (
  request: SlipRegistSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/deleteSlipHderDetail", request);
};

/**
 * 승인 목록 조회
 * @param request 조회 조건
 * @returns 승인 목록
 */
export const selectConfmList = async (
  request: SlipRegistConfmRequest
): Promise<ApiResponse<SlipRegistConfmResponse[]>> => {
  return await post<SlipRegistConfmResponse[]>("/fcm/gl/slip/selectConfmList", request);
};

/**
 * 승인 취소
 * @param request 승인 취소할 데이터
 * @returns 취소 결과
 */
export const cancelConfm = async (
  request: SlipRegistConfmRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/cancelConfm", request);
};
