/**
 * 작성자조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 작성자조회 팝업 검색 요청 타입
 */
export interface WrterInqirePopupSrchRequest {
    /** 대표사무소 (사업장 ID) */
    asOfficeId?: string;
    /** 부서코드 */
    asDeptCode?: string;
    /** 사용자ID (성명/코드 등 검색어) */
    asUserId?: string;
}

/**
 * 작성자조회 팝업 목록 응답 타입
 */
export interface WrterInqirePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;
    /** 사원코드 */
    empCode: string;
    /** 사원명 */
    empName: string;
    /** 부서코드 */
    deptCode: string;
    /** 부서명 */
    deptName: string;
    /** 기타 필드 */
    checkId?: string;
    empyId?: string;
    emailId?: string;
    pstnCde?: string;
    [key: string]: unknown;
}

/**
 * 반환할 작성자 데이터 타입
 */
export type SelectedWriter = {
    makeUser: string;
    makeUserName: string;
};

/**
 * WrterInqirePopup 컴포넌트의 Props 타입
 */
export interface WrterInqirePopupProps {
    /** 대표사무소 (사업장 ID) */
    asOfficeId?: string;
    /** 초기 검색어 (사용자ID, 사원코드, 사원명) */
    initialUserId?: string;
    /** 부서코드 */
    asDeptCode?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
