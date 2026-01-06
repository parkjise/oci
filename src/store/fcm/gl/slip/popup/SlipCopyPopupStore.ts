/**
 * 전표 복사 팝업 Store
 */

import { create } from "zustand";
import { copySlip } from "@/apis/fcm/gl/slip/popup/SlipCopyPopupApi";
import type { SlipCopyPopupRequest } from "@/types/fcm/gl/slip/popup/SlipCopyPopup.types";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import { useSlipRegistStore } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";

interface SlipCopyPopupState {
    loading: boolean;
    handleCopySlip: (request: SlipCopyPopupRequest) => Promise<boolean>;
}

export const useSlipCopyPopupStore = create<SlipCopyPopupState>((set) => ({
    loading: false,

    /**
     * 전표 복사 (팝업)
     * @param request 복사 요청 데이터
     * @returns 성공 여부
     */
    handleCopySlip: async (request: SlipCopyPopupRequest) => {
        try {
            set({ loading: true });
            const response = await copySlip(request);

            if (response.success && response.data) {
                showSuccess("전표가 복사되었습니다. 새 전표번호: " + response.data.newSlpNumber);

                // 메인 전표 등록 스토어의 목록 새로고침 유도
                const registStore = useSlipRegistStore.getState();
                if (registStore.handleSearch && registStore.searchParams) {
                    await registStore.handleSearch(registStore.searchParams);
                }

                return true;
            } else {
                showError(response.message || "전표 복사에 실패했습니다.");
                return false;
            }
        } catch (error) {
            showError("전표 복사 중 오류가 발생했습니다.");
            console.error("Copy slip error:", error);
            return false;
        } finally {
            set({ loading: false });
        }
    },
}));
