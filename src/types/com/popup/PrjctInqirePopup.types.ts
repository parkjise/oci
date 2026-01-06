/**
 * 프로젝트 조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 프로젝트 조회 팝업 검색 요청 타입
 */
export interface PrjctInqirePopupSrchRequest {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 프로젝트코드 */
    asProjectCode?: string;
}

/**
 * 프로젝트 조회 팝업 목록 응답 타입
 */
export interface PrjctInqirePopupListResponse {
    /** ID (그리드용) */
    id?: string | number;
    /** 대표사무소 */
    officeId?: string;
    /** 프로젝트코드 */
    projectCode: string;
    /** 프로젝트명 */
    projectName: string;
    /** 프로젝트설명 */
    projectDesc?: string;
    /** 시작일자 */
    startDate?: string;
    /** 종료일자 */
    endDate?: string;
    /** 상태 */
    status?: string;
    [key: string]: unknown;
}

/**
 * 반환할 프로젝트 데이터 타입
 */
export type SelectedProject = {
    projectCode: string;
    projectName: string;
};

/**
 * PrjctInqirePopup 컴포넌트의 Props 타입
 */
export interface PrjctInqirePopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 초기 프로젝트코드 */
    initialProjectCode?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
