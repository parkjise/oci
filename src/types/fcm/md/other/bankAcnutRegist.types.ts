/**
 * 은행계좌 등록 관련 타입 정의
 */

/**
 * 은행계좌 등록 검색 요청 타입
 */
export interface BankAcnutRegistSrchRequest {
    /** 사무소ID */
    asOfficeId?: string;
    /** 금융타입 */
    asBankType?: string;
    /** 은행코드 */
    asBankCode?: string;
    /** 계좌종류(일반/차입금/예적금) */
    asBkGubun?: string;
}

/**
 * 은행계좌 등록 목록 응답 타입
 */
export interface BankAcnutRegistListResponse {
    /** 사무소ID */
    officeId?: string;
    /** 은행코드 */
    bankCode?: string;
    /** 순번 */
    seq?: number;
    /** 은행명 */
    bankName?: string;
    /** 지점명 */
    bankRgnName?: string;
    /** 계좌번호별칭 */
    accNbr?: string;
    /** 계정코드 */
    accCode?: string;
    /** 계정명 */
    accName?: string;
    /** 은행주소 */
    bankAddr?: string;
    /** TR 사용여부 */
    trAccount?: string;
    /** 거래처 */
    custNo?: string;
    /** 계좌명 */
    accNbrName?: string;
    /** 실계좌번호 */
    accNbrCode?: string;
    /** 화폐 */
    currency?: string;
    /** 계좌종류(일반/차입금/예적금) */
    bkGubun?: string;
    /** 수금Default */
    receiptDefault?: string;
    /** 지급Default */
    paymentDefault?: string;
    /** 사용여부 */
    useYn?: string;
    /** 금융타입(BANK/LIFE INSU/FIRE INSU/STOCK FIRM) */
    bankType?: string;
    /** 사업부 */
    dvs?: string;
    /** 사업장 */
    orgId?: string;
    /** 구계정코드 */
    oldAccCode?: string;
    /** 구계좌번호 */
    oldAcctNbr?: string;
    /** 선수금계정 */
    onacctAccCode?: string;
    /** 선수금계정명 */
    onacctAccName?: string;
    /** 예금시제표 표시여부 */
    attribute10?: string;
    /** 최대순번 */
    maxSeq?: number;
}

/**
 * 은행계좌 등록 저장 요청 타입
 */
export interface BankAcnutRegistSaveRequest {
    /** 은행계좌 목록 */
    list: (BankAcnutRegistListResponse & { rowStatus: string })[];
}
