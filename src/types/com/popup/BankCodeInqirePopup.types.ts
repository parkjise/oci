/**
 * BankCode 조회 팝업 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * BankCode 조회 팝업 검색 요청 타입
 */
export interface BankCodeInqirePopupSrchRequest {
    /** 대표사무소 */
    asOfficeId?: string;
    /** BankCode */
    asBankCode?: string;
}

/**
 * BankCode 조회 팝업 목록 응답 타입
 */
export interface BankCodeInqirePopupListResponse {
    /** 대표사무소 */
    officeId?: string;
    /** BankCode */
    bankCode?: string;
    /** 은행명 */
    bankNm?: string;
    /** 지점명 */
    bankBhfNm?: string;
    /** 대표계좌 */
    reprsntAcnut?: string;
}
