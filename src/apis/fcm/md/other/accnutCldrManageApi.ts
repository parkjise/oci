/**
 * ============================================================================
 * 회계달력 관리 API
 * ============================================================================
 *
 * 회계달력 관리 관련 API 호출 함수 정의
 * 백엔드: fcm-service/src/main/java/com/ocic/onerp/fcm/md/other/controller/AccnutCldrManageController.java
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  AccnutCldrManageSrchRequest,
  AccnutCldrManageCldrListResponse,
  AccnutCldrManageRestdeListResponse,
  AccnutCldrManageCldrIdResponse,
  AccnutCldrManageSolcDateResponse,
  AccnutCldrManageCldrSaveRequest,
  AccnutCldrManageRestdeSaveRequest,
} from "@/types/fcm/md/other/accnutCldrManage.types";

/**
 * 회계달력 관리 달력 목록 조회
 */
export const selectAccnutCldrManageCldrList = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<AccnutCldrManageCldrListResponse[]>> => {
  return await post<AccnutCldrManageCldrListResponse[]>(
    "/fcm/md/other/accnutCldrManage/selectAccnutCldrManageCldrList",
    request
  );
};

/**
 * 회계달력 관리 휴일 목록 조회
 */
export const selectAccnutCldrManageRestdeList = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<AccnutCldrManageRestdeListResponse[]>> => {
  return await post<AccnutCldrManageRestdeListResponse[]>(
    "/fcm/md/other/accnutCldrManage/selectAccnutCldrManageRestdeList",
    request
  );
};

/**
 * 회계달력 관리 달력ID 조회
 */
export const selectAccnutCldrManageCldrId = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<AccnutCldrManageCldrIdResponse>> => {
  return await post<AccnutCldrManageCldrIdResponse>(
    "/fcm/md/other/accnutCldrManage/selectAccnutCldrManageCldrId",
    request
  );
};

/**
 * 회계달력 관리 음력일자 조회
 */
export const selectAccnutCldrManageSolcDate = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<AccnutCldrManageSolcDateResponse>> => {
  return await post<AccnutCldrManageSolcDateResponse>(
    "/fcm/md/other/accnutCldrManage/selectAccnutCldrManageSolcDate",
    request
  );
};

/**
 * 회계달력 관리 달력 생성
 */
export const createAccnutCldrManageCldr = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/md/other/accnutCldrManage/createAccnutCldrManageCldr",
    request
  );
};

/**
 * 회계달력 관리 전년도 휴일 복사
 */
export const copyAccnutCldrManageRestde = async (
  request: AccnutCldrManageSrchRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/md/other/accnutCldrManage/copyAccnutCldrManageRestde",
    request
  );
};

/**
 * 회계달력 관리 달력 저장
 */
export const saveAccnutCldrManageCldr = async (
  request: AccnutCldrManageCldrSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/md/other/accnutCldrManage/saveAccnutCldrManageCldr",
    request
  );
};

/**
 * 회계달력 관리 휴일 저장
 */
export const saveAccnutCldrManageRestde = async (
  request: AccnutCldrManageRestdeSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/md/other/accnutCldrManage/saveAccnutCldrManageRestde",
    request
  );
};
