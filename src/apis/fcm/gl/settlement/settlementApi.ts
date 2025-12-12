/**
 * ============================================================================
 * 결산관리 API 함수
 * ============================================================================
 */

import { get, post } from "@apis/common";
import type { ApiResponse } from "@/types/axios.types";
import type {
  FgcryEvlSrchRequest,
  FgcryEvlListResponse,
  FgcryEvlDetailResponse,
  FgcryEvlCreateRequest,
  ChkGlDateRequest,
  ChkGlDateResponse,
} from "@/types/fcm/gl/settlement/fgcryEvl.types";
import type {
  AdvpayCtDtaCreatSearchRequest,
  AdvpayCtDtaCreatSearchResponse,
} from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";

/**
 * 결산 목록 조회
 * @param params 조회 조건
 * @returns 결산 목록
 */
export const getSettlementList = async (
  params?: unknown
): Promise<ApiResponse<unknown[]>> => {
  return await get<unknown[]>("/fcm/gl/settlement", { params });
};

/**
 * 결산 처리
 * @param data 처리할 데이터
 * @returns 처리 결과
 */
export const processSettlement = async (
  data: unknown
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/settlement", data);
};

/**
 * ============================================================================
 * 외화평가 API 함수
 * ============================================================================
 *
 * 외화평가 관련 API 호출 함수 정의
 */
/**
 * 외화평가 목록 조회
 * @param request 조회 조건
 * @returns 외화평가 목록
 */
export const selectFgcryEvlList = async (
  request: FgcryEvlSrchRequest
): Promise<ApiResponse<FgcryEvlListResponse[]>> => {
  return await post<FgcryEvlListResponse[]>(
    "/fcm/gl/settlement/selectFgcryEvlList",
    request
  );
};

/**
 * 외화평가 상세 목록 조회
 * @param request 조회 조건
 * @returns 외화평가 상세 목록
 */
export const selectFgcryEvlDetailList = async (
  request: FgcryEvlSrchRequest
): Promise<ApiResponse<FgcryEvlDetailResponse[]>> => {
  return await post<FgcryEvlDetailResponse[]>(
    "/fcm/gl/settlement/selectFgcryEvlDetailList",
    request
  );
};

/**
 * 회계일자 체크 (회계 기초/마감 여부 체크)
 * @param request 체크 조건
 * @returns 체크 결과 (> 0이면 통과)
 */
export const chkGlDate = async (
  request: ChkGlDateRequest
): Promise<ApiResponse<ChkGlDateResponse>> => {
  return await post<ChkGlDateResponse>(
    "/fcm/gl/settlement/chkGlDate",
    request
  );
};

/**
 * 외화평가 Create
 * @param request 생성 요청 데이터
 * @returns 생성 결과
 */
export const createFgcryEvl = async (
  request: FgcryEvlCreateRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/gl/settlement/createFgcryEvl",
    request
  );
};

/**
 * ============================================================================
 * 선급비용자료생성 API 함수
 * ============================================================================
 *
 * 선급비용자료생성 관련 API 호출 함수 정의
 */

/**
 * 선급비용자료생성 목록 조회
 * @param request 조회 조건
 * @returns 선급비용자료생성 목록
 */
export const selectAdvpayCtDtaCreatList = async (
  request: AdvpayCtDtaCreatSearchRequest
): Promise<ApiResponse<AdvpayCtDtaCreatSearchResponse[]>> => {
  return await post<AdvpayCtDtaCreatSearchResponse[]>(
    "/fcm/gl/settlement/selectAdvpayCtDtaCreatList",
    request
  );
};