/**
 * 전표 역분개 팝업 관련 TypeScript 타입 정의
 */

/**
 * 전표 역분개 팝업 요청 타입
 */
export interface SlipReversePopupRequest {
    sourceSlpHeaderId?: string;
    newGlDate?: string;
    newDept?: string;
    newDescription?: string;
    changeFrom?: string;
    changeTo?: string;
    reverseType?: '1' | '2'; // 1: Sign, 2: Switch
}

/**
 * 전표 역분개 팝업 응답 타입
 */
export interface SlipReversePopupResponse {
    newSlpHeaderId?: string;
    newSlpNumber?: string;
}

/**
 * 전표 역분개 팝업 초기 데이터
 */
export interface SlipReversePopupData {
    sourceSlpHeaderId: string;
    sourceGlDate: string;
    sourceDept: string;
    sourceDeptName: string;
    sourceDescription: string;
}

/**
 * 전표 역분개 팝업 Props
 */
export interface SlipReversePopupProps {
    initialData?: SlipReversePopupData;
    setConfirmHandler?: (handler: (() => void) | null) => void;
    returnValue?: (data: any) => void;
    close?: () => void;
}
