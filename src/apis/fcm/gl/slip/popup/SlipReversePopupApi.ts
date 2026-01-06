/**
 * 전표 역분개 팝업 API 함수
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    SlipReversePopupRequest,
    SlipReversePopupResponse,
} from "@/types/fcm/gl/slip/popup/SlipReversePopup.types";

/**
 * 전표 역분개 (팝업)
 * @param request 역분개 요청 데이터
 * @returns 역분개 결과 (새 전표 ID)
 */
export const reverseSlip = async (
    request: SlipReversePopupRequest
): Promise<ApiResponse<SlipReversePopupResponse>> => {
    return await post<SlipReversePopupResponse>("/fcm/gl/slip/popup/reverseSlip", request);
};
