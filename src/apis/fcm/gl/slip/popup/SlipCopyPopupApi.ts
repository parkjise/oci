/**
 * 전표 복사 팝업 API 함수
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    SlipCopyPopupRequest,
    SlipCopyPopupResponse,
} from "@/types/fcm/gl/slip/popup/SlipCopyPopup.types";

/**
 * 전표 복사 (팝업)
 * @param request 복사 요청 데이터
 * @returns 복사 결과 (새 전표 ID)
 */
export const copySlip = async (
    request: SlipCopyPopupRequest
): Promise<ApiResponse<SlipCopyPopupResponse>> => {
    return await post<SlipCopyPopupResponse>("/fcm/gl/slip/popup/copySlip", request);
};
