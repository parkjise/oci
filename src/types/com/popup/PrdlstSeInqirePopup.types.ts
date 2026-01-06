/**
 * 품목군 조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 품목군 조회 팝업 검색 요청 타입
 */
export interface PrdlstSeInqirePopupSrchRequest {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 품목군코드 */
    asMatclass?: string;
    /** 검색어 */
    asSegment?: string;
}

/**
 * 품목군 조회 팝업 목록 응답 타입
 */
export interface PrdlstSeInqirePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;
    /** 품목군코드 */
    itemGroup: string;
    /** 품목군명 */
    itemGroupName: string;
    [key: string]: unknown;
}

/**
 * 반환할 품목군 데이터 타입
 */
export interface SelectedPrdlstSe {
    itemGroup: string;
    itemGroupName: string;
}

/**
 * PrdlstSeInqirePopup 컴포넌트의 Props 타입
 */
export interface PrdlstSeInqirePopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 조직 ID */
    asOrgId?: string;
    /** 초기 품목군코드 */
    itemGroup?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
