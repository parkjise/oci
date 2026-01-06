/**
 * 환율 등록 관련 타입 정의
 */

/**
 * 환율 등록 검색 요청 타입
 */
export interface EhgtRegistSrchRequest {
    /** 조회시작일자 (YYYYMMDD) */
    asDateFrom?: string;
    /** 조회종료일자 (YYYYMMDD) */
    asDateTo?: string;
    /** 통화 */
    asCurrency?: string;
    /** 복사원본일자 (YYYYMMDD) */
    asCopyFr?: string;
    /** 복사대상일자 (YYYYMMDD) */
    asCopyTo?: string;
}

/**
 * 환율 등록 목록 응답 타입
 */
export interface EhgtRegistListResponse {
    /** 환율일자 */
    curDate?: string;
    /** 통화 */
    cur?: string;
    /** 환율 */
    exchg?: number;
    /** 환율 */
    exchgIn?: number;
    /** 환율(달러기준) */
    antiUsd?: number;
    /** 환율변동 */
    exchgChg?: number;
    /** 전신환매도율 */
    remitOutRate?: number;
    /** 전신환매입율 */
    remitInRate?: number;
    /** 현찰매도율 */
    cashOutRate?: number;
    /** 현찰매입율 */
    cashInRate?: number;
    /** 일람출금율 */
    viewRate?: number;
    /** TC매도율 */
    tcOutRate?: number;
    /** 속성1 */
    attribute1?: string;
    /** 속성2 */
    attribute2?: string;
    /** 속성3 */
    attribute3?: string;
    /** 속성4 */
    attribute4?: string;
    /** 속성5 */
    attribute5?: string;
    /** 속성6 */
    attribute6?: string;
    /** 속성7 */
    attribute7?: string;
    /** 속성8 */
    attribute8?: string;
    /** 속성9 */
    attribute9?: string;
    /** 속성10 */
    attribute10?: string;
}

/**
 * 환율 등록 저장 요청 타입
 */
export interface EhgtRegistSaveRequest {
    /** 환율 목록 */
    list: (EhgtRegistListResponse & { rowStatus: string })[];
}

/**
 * 환율 등록 중복 건수 응답 타입
 */
export interface EhgtRegistCountResponse {
    /** 중복건수 */
    dupCnt?: number;
}



