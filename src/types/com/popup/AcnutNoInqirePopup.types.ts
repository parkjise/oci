/**
 * AcnutNo(계좌번호) 조회 팝업 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * AcnutNo 조회 팝업 검색 요청 타입
 */
export interface AcnutNoInqirePopupSrchRequest {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 은행코드 또는 계좌번호 */
    asBankCode?: string;
    /** 통화 */
    asCurrency?: string;
    /** 계정코드 */
    asAccCode?: string;
}

/**
 * AcnutNo 조회 팝업 목록 응답 타입
 */
export interface AcnutNoInqirePopupListResponse {
    /** 대표사무소 */
    officeId?: string;
    /** 은행코드 */
    bankCode?: string;
    /** SEQ */
    seq?: string;
    /** 은행명 */
    bankName?: string;
    /** 지점명 */
    bankRgnName?: string;
    /** 계좌번호 */
    accNbr?: string;
    /** 계정코드 */
    accCode?: string;
    /** 사용자ID */
    userId?: string;
    /** 시작일 */
    wrkDate?: string;
    /** 계좌명 */
    accNbrName?: string;
    /** 계좌코드 */
    accNbrCode?: string;
    /** 통화 */
    currency?: string;
    /** 사업장 */
    orgId?: string;
    /** DVS */
    dvs?: string;
}
