import { get, post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  AccnutMngCodeSrchRequest,
  AccnutMngCodeMgmtDivCodeListResponse,
  AccnutMngCodeListResponse,
  AccnutMngCodeSaveRequest,
} from "@/types/fcm/md/account/AccnutMngCodeRegist.types";
import type {
  AtmcJrnlzMastrSetupHderListResponse,
  AtmcJrnlzMastrSetupSrchRequest,
  AtmcJrnlzMastrSetupDetailListResponse,
  AtmcJrnlzMastrSetupSaveRequest,
} from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";
import type {
  StdFnnrTblatRegistDetailListResponse,
  StdFnnrTblatRegistDetailSaveRequest,
  StdFnnrTblatRegistMainListResponse,
  StdFnnrTblatRegistMainSaveRequest,
  StdFnnrTblatRegistSrchRequest
} from "@/types/fcm/md/account/stdFnnrTblatRegist.types";
import type {
  AcntCodeSrchRequest,
  AcntCodeListResponse,
  AcntCodeHighResponse,
  AcntCodeSaveRequest,
} from "@/types/fcm/md/account/AcntCodeRegist.types";


/**
 * ============================================================================
 * 회계관리코드 등록 API 함수
 * ============================================================================
 */
/**
 * 회계관리코드 등록 관리구분코드 조회
 */
export const selectAccnutMngCodeMgmtDivCodeList = async (
  params: AccnutMngCodeSrchRequest
): Promise<ApiResponse<AccnutMngCodeMgmtDivCodeListResponse[]>> => {
  return post<AccnutMngCodeMgmtDivCodeListResponse[]>(
    "/fcm/md/account/selectMgmtDivCodeList",
    params
  );
};

/**
 * 회계관리코드 등록 목록 조회
 */
export const selectAccnutMngCodeList = async (
  params: AccnutMngCodeSrchRequest
): Promise<ApiResponse<AccnutMngCodeListResponse[]>> => {
  return post<AccnutMngCodeListResponse[]>(
    "/fcm/md/account/selectAccnutMngCodeList",
    params
  );
};

/**
 * 회계관리코드 등록 저장
 */
export const saveAccnutMngCode = async (
  request: AccnutMngCodeSaveRequest
): Promise<ApiResponse<void>> => {
  return post<void>("/fcm/md/account/saveAccnutMngCode", request);
};

/**
 * ============================================================================
 * 계정코드 등록 API 함수
 * ============================================================================
 */

/**
 * 계정코드 목록 조회
 */
export const selectAcntCodeList = async (
  params: AcntCodeSrchRequest
): Promise<ApiResponse<AcntCodeListResponse[]>> => {
  return post<AcntCodeListResponse[]>("/fcm/md/account/selectAcntCodeList", params);
};

/**
 * 상위 계정 정보 조회
 */
export const selectAcntCodeHigh = async (
  params: AcntCodeSrchRequest
): Promise<ApiResponse<AcntCodeHighResponse>> => {
  return post<AcntCodeHighResponse>("/fcm/md/account/selectAcntCodeHigh", params);
};

/**
 * 계정코드 저장
 */
export const saveAcntCode = async (
  request: AcntCodeSaveRequest
): Promise<ApiResponse<void>> => {
  return post<void>("/fcm/md/account/saveAcntCode", request);
};



/**
 * ============================================================================
 * 자동분개마스터셋업 API 함수
 * ============================================================================
 *
 * 자동분개마스터셋업 관련 API 호출 함수 정의
 */

/**
 * 자동분개마스터셋업 헤더 목록 조회
 * @returns 헤더 목록
 */
export const selectAtmcJrnlzMastrSetupHderList = async (): Promise<
  ApiResponse<AtmcJrnlzMastrSetupHderListResponse[]>
> => {
  return await post<AtmcJrnlzMastrSetupHderListResponse[]>(
    "/fcm/md/account/selectAtmcJrnlzMastrSetupHderList"
  );
};

/**
 * 자동분개마스터셋업 상세 목록 조회
 * @param request 조회 조건
 * @returns 상세 목록
 */
export const selectAtmcJrnlzMastrSetupDetailList = async (
  request: AtmcJrnlzMastrSetupSrchRequest
): Promise<ApiResponse<AtmcJrnlzMastrSetupDetailListResponse[]>> => {
  return await post<AtmcJrnlzMastrSetupDetailListResponse[]>(
    "/fcm/md/account/selectAtmcJrnlzMastrSetupDetailList",
    request
  );
};

/**
 * 자동분개마스터셋업 저장
 * @param request 저장 데이터 (헤더/상세)
 * @returns 저장 결과
 */
export const saveAtmcJrnlzMastrSetup = async (
  request: AtmcJrnlzMastrSetupSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/md/account/saveAtmcJrnlzMastrSetup", request);
};

/**
 * ============================================================================
 * 표준재무제표 등록 API 함수
 * ============================================================================
 *
 * 표준재무제표 등록 관련 API 호출 함수 정의
 */

/**
 * 표준재무제표 등록 메인 목록 조회 API
 * @param request - 검색 조건
 * @returns 표준재무제표 메인 목록
 */
export const selectStdFnnrTblatRegistMainList = (
  request: StdFnnrTblatRegistSrchRequest
): Promise<ApiResponse<StdFnnrTblatRegistMainListResponse[]>> => {
  const params = new URLSearchParams({
    asOfficeId: request.asOfficeId ?? '',
    asRepType: request.asRepType ?? '',
  });
  return get<StdFnnrTblatRegistMainListResponse[]>(
    `/fcm/md/account/selectStdFnnrTblatRegistMainList?${params.toString()}`,
  )
};

/**
 * 표준재무제표 등록 상세 목록 조회 API
 * @param request - 검색 조건
 * @returns 표준재무제표 상세 목록
 */
export const selectStdFnnrTblatRegistDetailList = (
  request: StdFnnrTblatRegistSrchRequest
): Promise<ApiResponse<StdFnnrTblatRegistDetailListResponse[]>> => {
  const params = new URLSearchParams({
    asOfficeId: request.asOfficeId ?? '',
    asRepType: request.asRepType ?? '',
  });
  return get<StdFnnrTblatRegistDetailListResponse[]>(
    `/fcm/md/account/selectStdFnnrTblatRegistDetailList?${params.toString()}`,
  )
};

/**
 * 표준재무제표 등록 메인 저장 API
 * @param request - 메인 저장 데이터 목록
 */
export const saveStdFnnrTblatRegistMain = (
  request: StdFnnrTblatRegistMainSaveRequest
): Promise<ApiResponse<void>> =>
  post<void>(
    "/fcm/md/account/saveStdFnnrTblatRegistMain",
    request
  );

/**
 * 표준재무제표 등록 상세 저장 API
 * @param request - 상세 저장 데이터 목록
 */
export const saveStdFnnrTblatRegistDetail = (
  request: StdFnnrTblatRegistDetailSaveRequest
): Promise<ApiResponse<void>> =>
  post<void>(
    "/fcm/md/account/saveStdFnnrTblatRegistDetail",
    request
  );
