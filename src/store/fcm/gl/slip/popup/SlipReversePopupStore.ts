/**
 * 전표 역분개 팝업 Store
 */

import { create } from "zustand";
import { reverseSlip } from "@/apis/fcm/gl/slip/popup/SlipReversePopupApi";
import type { SlipReversePopupRequest } from "@/types/fcm/gl/slip/popup/SlipReversePopup.types";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import { useSlipRegistStore } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";

interface SlipReversePopupState {
    loading: boolean;
    handleReverseSlip: (request: SlipReversePopupRequest) => Promise<boolean>;
}

export const useSlipReversePopupStore = create<SlipReversePopupState>((set) => ({
    loading: false,

    /**
     * 전표 역분개 (팝업)
     * @param request 역분개 요청 데이터
     * @returns 성공 여부
     */
    handleReverseSlip: async (request: SlipReversePopupRequest) => {
        try {
            set({ loading: true });
            const response = await reverseSlip(request);

            if (response.success && response.data) {
                showSuccess("전표가 역분개되었습니다. 새 전표번호: " + response.data.newSlpNumber);

                // 메인 전표 등록 스토어의 목록 새로고침 유도
                const registStore = useSlipRegistStore.getState();
                if (registStore.handleSearch && registStore.searchParams) {
                    await registStore.handleSearch(registStore.searchParams);
                }

                // 역분개된 새 전표 선택
                if (registStore.handleSelectSlip && response.data.newSlpHeaderId) {
                    await registStore.handleSelectSlip(response.data.newSlpHeaderId);
                }

                return true;
            } else {
                showError(response.message || "전표 역분개에 실패했습니다.");
                return false;
            }
        } catch (error) {
            showError("전표 역분개 중 오류가 발생했습니다.");
            console.error("Reverse slip error:", error);
            return false;
        } finally {
            set({ loading: false });
        }
    },
}));
