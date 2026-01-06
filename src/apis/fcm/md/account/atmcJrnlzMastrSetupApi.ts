import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    AtmcJrnlzMastrSetupHderListResponse,
    AtmcJrnlzMastrSetupDetailListResponse,
    AtmcJrnlzMastrSetupSrchRequest,
    AtmcJrnlzMastrSetupSaveRequest,
} from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

/**
 * 자동분개마스터셋업 헤더 목록 조회
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
 */
export const saveAtmcJrnlzMastrSetup = async (
    request: AtmcJrnlzMastrSetupSaveRequest
): Promise<ApiResponse<void>> => {
    return await post<void>("/fcm/md/account/saveAtmcJrnlzMastrSetup", request);
};
