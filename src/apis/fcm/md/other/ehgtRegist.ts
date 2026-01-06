import { post } from "@apis/common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    EhgtRegistSrchRequest,
    EhgtRegistListResponse,
    EhgtRegistSaveRequest,
    EhgtRegistCountResponse
} from "@/types/fcm/md/other/ehgtRegist.types";

/**
 * 환율 등록 목록 조회 API
 * @param params - 검색 조건
 * @returns 환율 목록
 */
export const selectEhgtRegistList = async (
    params: EhgtRegistSrchRequest
): Promise<ApiResponse<EhgtRegistListResponse[]>> => {
    return post<EhgtRegistListResponse[]>(
        "/fcm/md/other/ehgtRegist/selectEhgtRegistList",
        params
    );
};

/**
 * 환율 등록 중복 건수 조회 API
 * @param params - 검색 조건
 * @returns 중복 건수
 */
export const selectEhgtRegistCount = async (
    params: EhgtRegistSrchRequest
): Promise<ApiResponse<EhgtRegistCountResponse>> => {
    return post<EhgtRegistCountResponse>(
        "/fcm/md/other/ehgtRegist/selectEhgtRegistCount",
        params
    );
};

/**
 * 환율 등록 저장 API
 * @param params - 저장 데이터 목록
 * @returns 성공 여부
 */
export const saveEhgtRegist = async (
    params: EhgtRegistSaveRequest
): Promise<ApiResponse<void>> => {
    return post<void>(
        "/fcm/md/other/ehgtRegist/saveEhgtRegist",
        params
    );
};

/**
 * 환율 등록 복사 API
 * @param params - 복사 조건
 * @returns 복사 건수
 */
export const cloneEhgtRegist = async (
    params: EhgtRegistSrchRequest
): Promise<ApiResponse<number>> => {
    return post<number>(
        "/fcm/md/other/ehgtRegist/cloneEhgtRegist",
        params
    );
};



