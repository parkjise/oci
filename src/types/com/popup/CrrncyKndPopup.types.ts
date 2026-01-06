/**
 * 화폐종류 팝업 관련 TypeScript 타입 정의
 */

/**
 * 화폐종류 팝업 검색 요청 타입
 */
export interface CrrncyKndPopupSrchRequest {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 모듈 */
    asModule?: string;
    /** 타입 */
    asType?: string;
    /** 화폐코드 */
    asCode?: string;
}

/**
 * 화폐종류 팝업 목록 응답 타입
 */
export interface CrrncyKndPopupListResponse {
    /** ID (그리드용) */
    id?: string | number;
    /** 화폐코드 */
    currCode: string;
    /** 화폐명 */
    currName: string;
    /** 명칭설명 */
    nameDesc?: string;
    /** 정렬순서 */
    orderSeq?: string;
    [key: string]: unknown;
}

/**
 * 반환할 화폐 데이터 타입
 */
export type SelectedCurrency = {
    currCode: string;
    currName: string;
};

/**
 * CrrncyKndPopup 컴포넌트의 Props 타입
 */
export interface CrrncyKndPopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 초기 화폐코드 */
    initialCurrCode?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
