/**
 * 공정코드 조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 공정코드 조회 팝업 검색 요청 타입
 */
export interface ProcsCodePopupSrchRequest {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 공정코드 */
    asCostCode?: string;
    /** 공정레벨 */
    asCostLevel?: string;
    /** 공정부문 */
    asCostPart?: string;
    /** 상위공정코드1 */
    asHighCostCode1?: string;
    /** 사용여부 */
    asEnabledFlag?: string;
}

/**
 * 공정코드 조회 팝업 목록 응답 타입
 * @description 구시스템 selectCostCodeList2 쿼리 결과 기반
 */
export interface ProcsCodePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;

    // 기본 공정 정보
    /** 대표사무소 ID */
    officeId?: string;
    OFFICE_ID?: string;

    /** 조직 ID (사업장) */
    orgId?: string;
    ORG_ID?: string;

    /** 공정코드 */
    costCode: string;
    COST_CODE?: string;

    /** 공정명 */
    costCodeName: string;
    COST_CODE_NAME?: string;

    /** 공정명2 */
    costCodeName2?: string;
    COST_CODE_NAME2?: string;

    /** Cost Level */
    costLevel?: string;
    COST_LEVEL?: string;

    /** Cost Part */
    costPart?: string;
    COST_PART?: string;

    /** 상위공정코드1 */
    highCostCode1?: string;
    HIGH_COST_CODE1?: string;

    /** 상위공정명1 */
    highCostName1?: string;
    HIGH_COST_NAME1?: string;

    /** 사용여부 */
    enabledFlag?: string;
    ENABLED_FLAG?: string;

    /** 생산 */
    prodSet?: string;
    PROD_SET?: string;

    /** 재고 */
    invSet?: string;
    INV_SET?: string;

    /** 인사 */
    paySet?: string;
    PAY_SET?: string;

    /** 회계 */
    accSet?: string;
    ACC_SET?: string;

    /** 정렬순서 */
    sortSeq?: string;
    SORT_SEQ?: string;

    /** 하위공정코드 */
    lowCostCode?: string;
    LOW_COST_CODE?: string;

    /** 하위공정명 */
    lowCostName?: string;
    LOW_COST_NAME?: string;

    // 기존 호환성
    costDesc?: string;
    status?: string;

    [key: string]: unknown;
}

/**
 * 반환할 공정코드 데이터 타입
 */
export type SelectedProcsCode = {
    costCode: string;
    costCodeName: string;
};

/**
 * ProcsCodePopup 컴포넌트의 Props 타입
 */
export interface ProcsCodePopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 초기 공정코드 */
    initialCostCode?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
