/**
 * 선급비용자료생성 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 선급비용자료생성 조회 요청 타입
 *
 * 필수 필드:
 * - asOfficeId: 사무소ID
 * - asFrDate: 시작일자 (YYYYMMDD 형식)
 * - asToDate: 종료일자 (YYYYMMDD 형식)
 * - asGCurr: 기준통화
 * - asGCurrDeci: 기준통화소수점
 * - asGCurrFormat: 기준통화포맷
 */
export interface AdvpayCtDtaCreatSearchRequest {
  /** 사무소ID */
  asOfficeId: string;
  /** 사업장ID */
  asOrgId?: string;
  /** 거래처코드 */
  asCustno?: string;
  /** 귀속부서 */
  asDept?: string;
  /** 시작일자 (YYYYMMDD 형식) */
  asFrDate: string;
  /** 종료일자 (YYYYMMDD 형식) */
  asToDate: string;
  /** 기준통화 */
  asGCurr: string;
  /** 기준통화소수점 */
  asGCurrDeci: string;
  /** 기준통화포맷 */
  asGCurrFormat: string;
}

/**
 * 선급비용자료생성 목록 응답 타입
 */
export interface AdvpayCtDtaCreatSearchResponse {
  /** 체크 */
  chk?: string;
  /** 사무소ID */
  officeId?: string;
  /** 사업장ID */
  orgId?: string;
  /** 작성부서 */
  mkDeptPayCertf?: string;
  /** 작성일자 */
  mkDatePayCertf?: string;
  /** 작성일자(표시용) */
  mkDate?: string;
  /** 일련번호 */
  serPayCertf?: string;
  /** 라인번호 */
  seqPayCertf?: string;
  /** 발생금액 */
  occurAmt?: number;
  /** 외화금액 */
  frgnCurrAmt?: number;
  /** 발생일자 */
  occurDate?: string;
  /** 발생일자(표시용) */
  oDate?: string;
  /** 만기일자 */
  maturDate?: string;
  /** 만기일자(표시용) */
  mDate?: string;
  /** 생성여부 */
  creationYn?: string;
  /** 정산금액 */
  applyAmount?: number;
  /** 선급비용계정 */
  fromAccount?: string;
  /** 선급비용계정명 */
  fromAcctNme?: string;
  /** 비용계정 */
  toAccount?: string;
  /** 비용계정명 */
  toAcctNme?: string;
  /** FROM귀속부서 */
  fromDept?: string;
  /** FROM귀속부서명 */
  fromDeptName?: string;
  /** TO귀속부서 */
  toDept?: string;
  /** TO귀속부서명 */
  toDeptName?: string;
  /** TO사업장 */
  toDeptOrg?: string;
  /** 횟수 */
  numberTimes?: string;
  /** 거래처코드 */
  supplier?: string;
  /** 거래처명 */
  custname?: string;
  /** 비고 */
  attribute1?: string;
  /** 이관여부 */
  modified?: string;
  /** 공정코드 */
  costCenter?: string;
  /** 공정코드명 */
  costCenterName?: string;
  /** 화폐 */
  currency?: string;
  /** 인보이스ID */
  invoiceId?: string;
  /** 인보이스라인ID */
  invoiceLineId?: string;
  /** 지출결의번호 */
  invoiceNo?: string;
  /** 차량번호 */
  carNum?: string;
  /** 월할여부 */
  attribute3?: string;
  /** 사업부 */
  dvs?: string;
  /** 신규자료여부 */
  newData?: string;
  /** 기준통화 */
  gCurr?: string;
  /** 기준통화소수점 */
  gCurrDeci?: string;
  /** 기준통화포맷 */
  gCurrFormat?: string;
  /** 외화포맷 */
  eCurrFormat?: string;
  /** 외화소수점 */
  eCurrDeci?: string;
  /** 계정코드옵션 */
  cstCdeOpt?: string;
}
