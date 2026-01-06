/**
 * 회계관리코드 등록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 회계관리코드 등록 관리구분 목록 응답 타입
 */
export interface AccnutMngCodeMgmtDivCodeListResponse {
    type?: string;  //타입
}

/**
 * 회계관리코드 등록 검색 요청 타입
 */
export interface AccnutMngCodeSrchRequest {
    asOfficeId?: string;    //사무소ID
    asModule?: string;      //모듈
    asType: string;         //타입
    asCode?: string;        //코드
}

/**
 * 회계관리코드 등록 목록 응답 타입
 */
export interface AccnutMngCodeListResponse {
    officeId?: string;                    // 사무소ID
    module?: string;                      // 모듈
    type?: string;                        // 타입
    code?: string;                        // 코드
    name1?: string;                       // 명칭1
    nameDesc?: string;                    // 명칭설명
    lastUpdatedBy?: string;               // 최종수정자
    lastUpdateDate?: string;              // 최종수정일시 (yyyy-MM-dd HH:mm:ss)
    rowStatus?: "C" | "U" | "D";         // 행 상태 (C: 신규, U: 수정, D: 삭제)
}

/**
 * 회계관리코드 등록 저장 요청 타입
 */
export interface AccnutMngCodeSaveRequest {
    list: (AccnutMngCodeListResponse & { rowStatus: "C" | "U" | "D" })[];
}
