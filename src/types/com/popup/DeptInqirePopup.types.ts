/**
 * 부서조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 부서조회 팝업 검색 요청 타입
 */
export interface DeptInqirePopupSrchRequest {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 검색어 (부서코드 또는 부서명) */
    asFind?: string;
    /** 기준일자 (YYYYMMDD 형식) */
    asStndDate?: string;
}

/**
 * 부서조회 팝업 목록 응답 타입
 */
export interface DeptInqirePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;
    /** 부서코드 */
    deptCde: string;
    /** 부서명 */
    deptNme: string;
    [key: string]: unknown;
}

/**
 * 반환할 부서 데이터 타입 (FilterPanel.tsx의 필드명과 일치)
 */
export type SelectedDept = {
    makeDept: string;
    makeDeptName: string;
};

/**
 * DeptInqirePopup 컴포넌트의 Props 타입
 */
export interface DeptInqirePopupProps {
    /** 대표사무소 (사업장 ID) */
    asOfficeId?: string;
    /** 초기 검색어 (부서코드 또는 부서명) */
    initialDeptCode?: string;
    /** 기준일자 (YYYYMMDD 형식) */
    asStndDate?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
