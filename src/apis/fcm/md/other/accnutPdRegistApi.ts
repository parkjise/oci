/**
 * ============================================================================
 * 회계기간 등록 API
 * ============================================================================
 *
 * 회계기간 등록 관련 API 호출 함수 정의
 * 백엔드: fcm-service/src/main/java/com/ocic/onerp/fcm/md/other/controller/AccnutPdRegistController.java
 *
 * 참고: Backend가 조회 API도 POST 방식을 사용하고 있어 이에 맞춰 구현
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  PeriodData,
  PeriodSearchParams,
  CopyNextYearParams,
  CopyNextYearResult,
} from "@/types/fcm/md/other/accnutPdRegist.types";

/**
 * 회계기간 등록 초기화 정보 조회
 */
export const selectAccnutPdRegistInit = async (
  params: PeriodSearchParams
): Promise<ApiResponse<{ result: string }>> => {
  return await post<{ result: string }>(
    "/fcm/md/other/accnutPdRegist/selectAccnutPdRegistInit",
    params
  );
};

/**
 * 회계기간 목록 조회
 */
export const selectAccnutPdRegistList = async (
  params: PeriodSearchParams
): Promise<ApiResponse<PeriodData[]>> => {
  return await post<PeriodData[]>(
    "/fcm/md/other/accnutPdRegist/selectAccnutPdRegistList",
    params
  );
};

/**
 * 회계기간 저장
 */
export const saveAccnutPdRegist = async (
  data: PeriodData[]
): Promise<ApiResponse<void>> => {
  return await post<void>(
    "/fcm/md/other/accnutPdRegist/saveAccnutPdRegist",
    { list: data } // 백엔드 DTO 형식에 맞춰 list로 감싸서 전송
  );
};

/**
 * 다음 연도로 복사
 */
export const cloneAccnutPdRegistNextYear = async (
  params: CopyNextYearParams
): Promise<ApiResponse<CopyNextYearResult>> => {
  return await post<CopyNextYearResult>(
    "/fcm/md/other/accnutPdRegist/cloneAccnutPdRegistNextYear",
    params
  );
};
