/**
 * 전표 복사 팝업 관련 TypeScript 타입 정의
 * 백엔드 DTO 경로: com.ocic.onerp.fcm.gl.slip.popup.dto.request / com.ocic.onerp.fcm.gl.slip.popup.dto.response
 */

/**
 * 전표 복사 팝업 요청 타입
 * 백엔드: SlipCopyPopupRequest.java
 */
export interface SlipCopyPopupRequest {
    sourceSlpHeaderId?: string;
    newGlDate?: string;
    newDept?: string;
    newDescription?: string;
    changeFrom?: string;
    changeTo?: string;
}

/**
 * 전표 복사 팝업 응답 타입
 * 백엔드: SlipCopyPopupResponse.java
 */
export interface SlipCopyPopupResponse {
    newSlpHeaderId?: string;
    newSlpNumber?: string;
}

/**
 * 전표 복사 팝업 초기 데이터
 */
export interface SlipCopyPopupData {
    sourceSlpHeaderId: string;
    sourceGlDate: string;
    sourceDept: string;
    sourceDeptName: string;
    sourceDescription: string;
}

/**
 * 전표 복사 팝업 Props
 */
export interface SlipCopyPopupProps {
    initialData?: SlipCopyPopupData;
    setConfirmHandler?: (handler: (() => void) | null) => void;
    returnValue?: (data: any) => void;
    close?: () => void;
}
