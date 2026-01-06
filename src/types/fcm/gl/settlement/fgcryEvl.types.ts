/**
 * 외화평가 관련 TypeScript 타입 정의
 */

/**
 * 외화평가 조회 요청 타입
 */
export interface FgcryEvlSrchRequest {
  asOfficeId: string;      // 사무소ID
  asStdDate: string;       // 기준일자 (yyyymmdd)
  asType: string;          // 평가구분
  asFrExEvalId?: string;    // 외화평가ID
  asCurrDeci?: string;      // 통화소수점
  asCurrFormat?: string;    // 통화포맷
  }
  
/**
 * 외화평가 헤더 목록 응답 타입
 */
export interface FgcryEvlHderListResponse {
  evalType?: string;          // 평가구분
  slipNo?: string;            // 전표번호
  revSlipNo?: string;         // Reverse 전표번호
  evaluationType?: string;    // 평가구분코드
  slpHeaderId?: string;       // 전표헤더ID
  revSlpHeaderId?: string;    // Reverse 전표헤더ID
  stdDate?: string;           // 기준일자
  frExEvalId?: string;        // 외화평가ID
  slipNoPosted?: string;      // 전표전기여부(Y/N)
  revSlipNoPosted?: string;   // Reverse 전표전기여부(Y/N)
  createdBy?: string;         // 생성자
  creationDate?: string;      // 생성일시
  lastUpdatedBy?: string;     // 최종수정자
  lastUpdateDate?: string;    // 최종수정일시
  programId?: string;         // 프로그램ID
  terminalId?: string;        // 터미널ID
}

  /**
   * 외화평가 상세 목록 응답 타입
   */
export interface FgcryEvlDetailListResponse {
  officeId?: string;         // 사무소ID
  stdDate?: string;          // 기준일자 (yyyymmdd)
  evaluationType?: string;   // 평가구분
  currency?: string;         // 통화
  accCde?: string;           // 계정코드
  accName?: string;          // 계정명
  accMgmtNbr1?: string;      // 관리번호1
  accMgmtNbr1Name?: string;  // 관리번호1명
  accMgmtNbr2?: string;      // 관리번호2
  exchangeRate?: number;     // 환율
  occurAmtFr?: number;       // 외화금액
  occurAmt?: number;         // 원화금액
  evaluExRate?: number;      // 평가환율
  exchangeAmt?: number;      // 환산금액
  gainLossAmt?: number;      // 환산평가손익
  slpHeaderId?: string;      // 전표헤더ID
  slipNo?: string;           // 전표번호
  attribute01?: string;      // 속성01
  attribute02?: string;
  attribute03?: string;
  attribute04?: string;
  attribute05?: string;
  attribute06?: string;
  attribute07?: string;
  attribute08?: string;
  attribute09?: string;
  attribute10?: string;
  invoiceNumber?: string;    // 송장번호
  salesNo?: string;          // 매출번호
  invoiceId?: string;        // 송장ID
  slsMstId?: string;         // 매출마스터ID
  pssnDept?: string;         // 귀속부서
  orgId?: string;            // 사업장ID
  dvs?: string;              // 사업부
  eCurrPre?: string;         // 통화정밀도
  eCurrConv?: string;        // 통화환산율
  eCurrFormat?: string;      // 통화포맷
  currFormat?: string;       // 통화포맷
}

  /**
 * 외화평가 Create 요청 타입
 */
export interface FgcryEvlCreatRequest {
  pOfficeId: string;      // 회사코드 (P_OFFICE_ID)
  pGlDate: string;        // 회계일자 (P_GL_DATE) - YYYYMMDD
  pCategory: string;      // 구분 (P_CATEGORY) - AP, AR, GL
  pUserId: string;        // 사용자 ID (P_USER_ID)
  pGCurr: string;         // 통화단위 (P_G_CURR)
  pProgramId?: string;    // 프로그램 ID (P_PROGRAM_ID)
  pTerminalId?: string;   // 터미널 ID (P_TERMINAL_ID)
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

/**
 * 외화평가 처리 결과 응답 타입
 */
export interface FgcryEvlResultResponse {
  presult?: string;      // 처리결과 (예: "S")
  perrbuff?: string;     // 에러메시지
  slpHeaderId?: number;  // 전표헤더ID
}

/**
 * 외화평가 삭제 요청 타입
 */
export interface FgcryEvlDeleteRequest {
  pExEvaluId: string;    // 외화평가ID
}

/**
 * 외화평가 Reverse 요청 타입
 */
export interface FgcryEvlReverseRequest {
  pSlipId: string;       // 전표ID
  pRevGlDate: string;    // Reverse 회계일자 (YYYYMMDD)
  pUserId: string;      // 사용자ID
  pProgramId?: string;    // 프로그램ID
  pTerminalId?: string;  // 터미널ID
}