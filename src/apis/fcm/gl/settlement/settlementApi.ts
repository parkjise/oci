import { get, post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  FgcryEvlSrchRequest,
  FgcryEvlHderListResponse,
  FgcryEvlDetailListResponse,
  FgcryEvlCreatRequest,
  FgcryEvlDeleteRequest,
  FgcryEvlReverseRequest,
  FgcryEvlResultResponse,
  ChkGlDateRequest,
  ChkGlDateResponse,
} from "@/types/fcm/gl/settlement/fgcryEvl.types";
import type {
  AdvpayCtDtaCreatSearchRequest,
  AdvpayCtDtaCreatSearchResponse,
  AdvpayCtDtaCreatSaveRequest,  // 저장요청 데이터 타입
} from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import type {
  AdvpayCtExcclcProcessSearchRequest,
  AdvpayCtExcclcProcessDetailResponse,
  AdvpayCtExcclcProcessProcRequest,
  AdvpayCtExcclcProcessProcResponse,
} from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";

/**
 * ============================================================================
 * 결산관리 API 함수
 * ============================================================================
 */

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
): Promise<ApiResponse<FgcryEvlHderListResponse[]>> => {
  return await post<FgcryEvlHderListResponse[]>(
    "/fcm/gl/settlement/selectFgcryEvlHderList",
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
): Promise<ApiResponse<FgcryEvlDetailListResponse[]>> => {
  return await post<FgcryEvlDetailListResponse[]>(
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
 * 외화평가 생성
 * @param request 생성 요청 데이터
 * @returns 생성 결과
 */
export const createFgcryEvl = async (
  request: FgcryEvlCreatRequest
): Promise<ApiResponse<FgcryEvlResultResponse>> => {
  return await post<FgcryEvlResultResponse>(
    "/fcm/gl/settlement/createFgcryEvl",
    request
  );
};

/**
 * 외화평가 삭제
 * @param request 삭제 요청 데이터
 * @returns 삭제 결과
 */
export const deleteFgcryEvl = async (
  request: FgcryEvlDeleteRequest
): Promise<ApiResponse<FgcryEvlResultResponse>> => {
  return await post<FgcryEvlResultResponse>(
    "/fcm/gl/settlement/deleteFgcryEvl",
    request
  );
};

/**
 * 외화평가 Reverse
 * @param request Reverse 요청 데이터
 * @returns Reverse 결과
 */
export const reverseFgcryEvl = async (
  request: FgcryEvlReverseRequest
): Promise<ApiResponse<FgcryEvlResultResponse>> => {
  return await post<FgcryEvlResultResponse>(
    "/fcm/gl/settlement/reverseFgcryEvl",
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

/**
 * 선급비용자료생성 신규자료검색
 * POST /fcm/gl/settlement/selectNewAdvpayCtDtaCreatList
 */
export const selectNewAdvpayCtDtaCreatList = async (
  request: AdvpayCtDtaCreatSearchRequest
): Promise<ApiResponse<AdvpayCtDtaCreatSearchResponse[]>> => {
  return await post<AdvpayCtDtaCreatSearchResponse[]>(
    "/fcm/gl/settlement/selectNewAdvpayCtDtaCreatList",
    request
  );
};


/**
 * 선급비용자료생성 삭제
 */
export const deleteAdvpayCtDtaCreat = async (
  request: AdvpayCtDtaCreatSaveRequest
): Promise<ApiResponse<void>> => {
  console.log("[DEBUG] request:", request);
  return await post<void>(
    "/fcm/gl/settlement/deleteAdvpayCtDtaCreat",
    request
  );
};

/**
 * 선급비용자료생성 저장 (통합)
 * 헤더/상세 저장 및 인보이스라인 업데이트 (rowStatus가 "C"인 경우만 처리)
 */
export const saveAdvpayCtDtaCreat = async (
  request: AdvpayCtDtaCreatSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/gl/settlement/saveAdvpayCtDtaCreat",
    request
  );
};

/**
 * ============================================================================
 * 선급비용 정산 처리 API 함수
 * ============================================================================
 *
 * 선급비용 정산 처리 관련 API 호출 함수 정의
 */

/**
 * 선급비용 정산 처리 상세 목록 조회
 * @param request 조회 조건
 * @returns 선급비용 정산 처리 상세 목록
 */
export const selectAdvpayCtExcclcProcessDetailList = async (
  request: AdvpayCtExcclcProcessSearchRequest
): Promise<ApiResponse<AdvpayCtExcclcProcessDetailResponse[]>> => {
  return await post<AdvpayCtExcclcProcessDetailResponse[]>(
    "/fcm/gl/settlement/selectAdvpayCtExcclcProcessDetailList",
    request
  );
};


/**
 * GL 수기처리 여부 업데이트
 * POST /fcm/gl/settlement/updateAdvpayCtExcclcProcessGlgu
 * @param request 선택한 행(들) 데이터 (백단: List<AdvpayCtExcclcProcessDetailResponse>)
 */
export const updateAdvpayCtExcclcProcessGlgu = async (
  request: AdvpayCtExcclcProcessDetailResponse[]
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/gl/settlement/updateAdvpayCtExcclcProcessGlgu",
    request
  );
};

/**
 * 전표 생성
 * POST /fcm/gl/settlement/createAdvpayCtExcclcProcessSlip
 * @param request 프로시저 실행 요청
 * @returns 프로시저 실행 결과
 */
export const createAdvpayCtExcclcProcessSlip = async (
  request: AdvpayCtExcclcProcessProcRequest
): Promise<ApiResponse<AdvpayCtExcclcProcessProcResponse>> => {
  return await post<AdvpayCtExcclcProcessProcResponse>(
    "/fcm/gl/settlement/createAdvpayCtExcclcProcessSlip",
    request
  );
};

/**
 * 전표 취소
 * POST /fcm/gl/settlement/cancelAdvpayCtExcclcProcessSlip
 * @param request 프로시저 실행 요청
 * @returns 프로시저 실행 결과
 */
export const cancelAdvpayCtExcclcProcessSlip = async (
  request: AdvpayCtExcclcProcessProcRequest
): Promise<ApiResponse<AdvpayCtExcclcProcessProcResponse>> => {
  return await post<AdvpayCtExcclcProcessProcResponse>(
    "/fcm/gl/settlement/cancelAdvpayCtExcclcProcessSlip",
    request
  );
};