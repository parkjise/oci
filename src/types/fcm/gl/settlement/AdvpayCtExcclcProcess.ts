/**
 * 선급비용 정산 처리 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 선급비용 정산 처리 조회 요청 타입
 *
 * 필수 필드:
 * - asOfficeId: 사무소ID
 * - asMonthFr: 적용시작년월 (YYYYMM 형식)
 * - asMonthTo: 적용종료년월 (YYYYMM 형식)
 * - asGCurr: 기준통화
 * - asGCurrDeci: 기준통화자릿수
 * - asGCurrFormat: 기준통화포맷
 */
export interface AdvpayCtExcclcProcessSearchRequest {
  /** 사무소ID */
  asOfficeId: string;
  /** 조직ID */
  asOrgId?: string;
  /** 거래처번호 */
  asSupplier?: string;
  /** 부서코드 */
  asDept?: string;
  /** 적용시작년월 (YYYYMM 형식) */
  asMonthFr: string;
  /** 적용종료년월 (YYYYMM 형식) */
  asMonthTo: string;
  /** 전표생성여부 */
  asRbYn?: string;
  /** GL수기처리여부 */
  asAttribute8?: string;
  /** 기준통화 */
  asGCurr: string;
  /** 기준통화자릿수 */
  asGCurrDeci: string;
  /** 기준통화포맷 */
  asGCurrFormat: string;
}

/**
 * 선급비용 정산 처리 상세 목록 응답 타입
 */
export interface AdvpayCtExcclcProcessDetailResponse {
  /** 체크 */
  chk?: string;
  /** 사무소ID */
  officeId?: string;
  /** 조직ID */
  orgId?: string;
  /** 조직명 */
  orgNme?: string;
  /** 작성부서 */
  mkDeptPayCertf?: string;
  /** 작성일자 */
  mkDatePayCertf?: string;
  /** 작성순번 */
  serPayCertf?: string;
  /** 작성세부순번 */
  seqPayCertf?: string;
  /** 적용년월 */
  applyYm?: string;
  /** 월비용(원화) */
  monthAmt?: string;
  /** 월비용(외화) */
  monthForeAmt?: string;
  /** 발생금액(원화) */
  occurAmt?: string;
  /** 발생금액(외화) */
  frgnCurrAmt?: string;
  /** 잔액(원화) */
  janAmt?: string;
  /** 잔액(외화) */
  janAmtFr?: string;
  /** 전표생성여부 */
  creationYn?: string;
  /** 선급비용계정 */
  fromAccount?: string;
  /** 선급비용계정명 */
  fromAcctName?: string;
  /** 비용계정 */
  toAccount?: string;
  /** 비용계정명 */
  toAcctName?: string;
  /** 발생부서 */
  fromDept?: string;
  /** 발생부서명 */
  fromDeptName?: string;
  /** 귀속부서 */
  toDept?: string;
  /** 귀속부서명 */
  toDeptName?: string;
  /** 회차 */
  numberTimes?: string;
  /** 거래처 */
  supplier?: string;
  /** 거래처명 */
  custname?: string;
  /** 발생일 */
  occurDate?: string;
  /** 만기일 */
  maturDate?: string;
  /** 일수 */
  days?: string;
  /** 적요 */
  attribute1?: string;
  /** 비고2 */
  attribute2?: string;
  /** 비고3 */
  attribute3?: string;
  /** GL수기처리여부 */
  attribute8?: string;
  /** 작성일시 */
  creationDate?: string;
  /** 작성자 */
  createdBy?: string;
  /** 비용코드 */
  costCenter?: string;
  /** 비용코드명 */
  costCenterName?: string;
  /** 전표번호 */
  glNumber?: string;
  /** 기준통화 */
  gCurr?: string;
  /** 기준통화자릿수 */
  gCurrDeci?: string;
  /** 기준통화포맷 */
  gCurrFormat?: string;
  /** 인보이스ID */
  invoiceId?: string;
  /** 인보이스라인ID */
  invoiceLineId?: string;
  /** 통화 */
  currency?: string;
  /** 원가옵션 */
  cstCdeOpt?: string;
  /** 전기여부 */
  exptnTgt?: string;
}
/**
 * ============================================================================
 * 선급비용 정산 처리 - 요청/응답 타입
 * ============================================================================
 */

/**
 * 선급비용 정산 처리 전표 생성/취소 요청 DTO
 * (AdvpayCtExcclcProcessProcRequest.java)
 */
export interface AdvpayCtExcclcProcessProcRequest {
  /** 사무소ID */
  pOfficeId: string;

  /** 조직ID */
  pOrgId: string;

  /** 부서코드 */
  pDept: string;

  /** 작성일자 (YYYYMMDD) */
  pDate: string;

  /** 작성순번 */
  pSerPayCertf: string;

  /** 작성세부순번 */
  pSeqPayCertf: string;

  /** 적용년월 (YYYYMM) */
  pApplyYm: string;

  /** GL 처리일자 (YYYYMMDD) */
  pGlDate: string;

  /** 통화 */
  pCurrency: string;

  /** 사용자ID */
  pUserId: string;

  /** 전표ID */
  pAccSlpId?: string; // 취소 시에만 필요한 경우가 많아서 optional 권장

  /** 판매유형 */
  pSaleType: string;
}

/**
 * 선급비용 정산 처리 전표 생성/취소 응답 DTO
 * (AdvpayCtExcclcProcessProcResponse.java)
 */
export interface AdvpayCtExcclcProcessProcResponse {
  /** 결과코드 (S / E 등) */
  pResult: string;

  /** 오류메시지 */
  pErrbuff: string;
}
