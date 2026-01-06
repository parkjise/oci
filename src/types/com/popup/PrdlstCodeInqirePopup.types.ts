/**
 * 품목코드 조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 품목코드 조회 팝업 검색 요청 타입
 */
export interface PrdlstCodeInqirePopupSrchRequest {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 품목코드/명 */
    asMatcode?: string;
    /** 품목구분 */
    asMatclass?: string;
    /** 사용여부 */
    asEnabledFlag?: string;
    /** 검색어 (기존 호환성용) */
    asFind?: string;
    /** 기준일자 */
    asStndDate?: string;
}

/**
 * 품목코드 조회 팝업 목록 응답 타입
 * @description 구시스템 selectItemList6 쿼리 결과 기반
 */
export interface PrdlstCodeInqirePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;

    // 기본 품목 정보
    /** 품목코드 ID */
    matcodeId?: string;
    MATCODE_ID?: string;

    /** 품목코드 */
    itemCode: string;
    matcode?: string;
    MATCODE?: string;

    /** 품목명 */
    itemName: string;
    matname?: string;
    MATNAME?: string;

    /** 단위 */
    unitCde?: string;
    matunit?: string;
    MATUNIT?: string;
    unit?: string;

    /** 품목구분 */
    mtrlKnd?: string;
    matclass?: string;
    MATCLASS?: string;

    /** 품목유형 */
    matGb?: string;
    MAT_GB?: string;

    /** 모집단 관리 여부 (Lot 관리) */
    lotGb?: string;
    LOT_GB?: string;

    /** 사용여부 */
    enabledFlag?: string;
    ENABLED_FLAG?: string;

    /** 창고 */
    subinv?: string;
    SUBINV?: string;

    /** 계정코드 */
    accCode?: string;
    ACC_CODE?: string;

    /** 구 품목코드 */
    oldItemCode?: string;
    OLD_ITEM_CODE?: string;

    /** 현재고수량 */
    onhand?: number;
    ONHAND?: number;

    // 별칭 (기존 호환성)
    /** 품목코드 (별칭) */
    finGdsCode?: string;
    /** 품목명 (별칭) */
    finGdsName?: string;
    /** 품목규격 */
    finGdsSize?: string;
    itemDesc?: string;

    [key: string]: unknown;
}

/**
 * 반환할 품목 데이터 타입
 */
export type SelectedPrdlstCode = {
    itemCode: string;
    itemName: string;
    finGdsCode: string;
    finGdsName: string;
    finGdsSize: string;
    unitCde: string;
    mtrlKnd: string;
};

/**
 * PrdlstCodeInqirePopup 컴포넌트의 Props 타입
 */
export interface PrdlstCodeInqirePopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 초기 품목구분 */
    asMatclass?: string;
    /** 초기 검색어 (품목코드 또는 품목명) */
    initialFind?: string;
    /** 기준일자 (YYYYMMDD 형식) */
    asStndDate?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
