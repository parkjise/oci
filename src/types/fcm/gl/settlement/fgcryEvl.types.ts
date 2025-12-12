/**
 * 외화평가 관련 TypeScript 타입 정의
 */

/**
 * 외화평가 검색 요청 타입
 */
export interface FgcryEvlSrchRequest {
    FgcryDate?: string; // 회계일자 (YYYYMMDD)
    dvs?: string; // 구분 (AP, AR, GL)
    reverseDate?: string; // Reverse일자
    slipNo?: string; // 전표번호
    frExEvalId?: string; // 외화평가 ID
    pageNum?: number;
    pageSize?: number;
  }
  
  /**
   * 외화평가 목록 응답 타입
   */
  export interface FgcryEvlListResponse {
    id?: string | number;
    dvs?: string; // 구분 (AP, AR, GL)
    slipNo?: string; // 전표번호
    reverseSlipNo?: string; // Reverse 전표
    posted?: string; // 전기여부 (Y/N)
    revSlipNoPosted?: string; // Rev Slip No Posted (Y/N)
    frExEvalId?: string; // Fr Ex Eval Id
    [key: string]: unknown;
  }
  
  /**
   * 외화평가 상세 응답 타입
   */
  export interface FgcryEvlDetailResponse {
    id?: number;
    status?: string; // 상태
    invNo?: string; // Invoice No.
    currency?: string; // 통화
    account?: string; // 계정
    accountName?: string; // 계정명
    customer?: string; // 거래처
    customerName?: string; // 거래처명
    manageNo2?: string; // 관리번호2
    exchangeRate?: number; // 환율
    foreignAmount?: number; // 외화금액
    localAmount?: number; // 원화금액
    evaluationRate?: number; // 평가환율
    evaluationAmount?: number; // 환산금액
    evaluationProfit?: number; // 환산 평가 손익
    businessUnit?: string; // 사업부
    slipHeaderId?: string; // Slp Header Id
    slipNo?: string; // 전표번호
    [key: string]: unknown;
  }

  /**
 * 외화평가 Create 요청 타입
 */
export interface FgcryEvlCreateRequest {
  officeId: string;      // 회사코드 (P_OFFICE_ID)
  glDate: string;        // 회계일자 (P_GL_DATE) - YYYYMMDD
  category: string;      // 구분 (P_CATEGORY) - AP, AR, GL
  userId: string;        // 사용자 ID (P_USER_ID)
  gCurr: string;         // 통화단위 (P_G_CURR)
  programId?: string;    // 프로그램 ID (P_PROGRAM_ID)
  terminalId?: string;   // 터미널 ID (P_TERMINAL_ID)
}

/**
 * 회계일자 체크 요청 타입
 */
export interface ChkGlDateRequest {
  officeId: string;
  category: string;      // GL
  glDate: string;        // YYYYMMDD
}

/**
 * 회계일자 체크 응답 타입
 */
export interface ChkGlDateResponse {
  result: number;        // > 0이면 통과
}