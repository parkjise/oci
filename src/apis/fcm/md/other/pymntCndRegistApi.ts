import type {
  PymntCndRegistListResponse,
  PymntCndRegistSaveRequest,
  PymntCndRegistSrchRequest
} from "@/types/fcm/md/other/pymntCndRegist.types";
import { get, post } from "@/apis";
import type { ApiResponse } from "@/types/com/api/axios.types";

/**
 * 지급조건 등록 목록 조회 API
 * @param request - 검색 조건
 * @returns 지급조건 목록
 */
export const selectPymntCndRegistList = (
  request: PymntCndRegistSrchRequest
): Promise<ApiResponse<PymntCndRegistListResponse[]>> => {
  const params = new URLSearchParams({
    asOfficeId: request.asOfficeId ?? '',
    asType: request.asType ?? '',
    asUseYn: request.asUseYn ?? '',
  });
  return get<PymntCndRegistListResponse[]>(
    `/fcm/md/other/pymntCndRegist/selectPymntCndRegistList?${params.toString()}`,
  )
};

/**
 * 지급조건 등록 저장 API
 * @param request - 저장 데이터 목록
 */
export const savePymntCndRegist = (
  request: PymntCndRegistSaveRequest
): Promise<ApiResponse<void>> =>
  post<void>(
    "/fcm/md/other/pymntCndRegist/savePymntCndRegist",
    request
  );
