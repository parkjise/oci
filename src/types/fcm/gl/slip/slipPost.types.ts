/**
 * 전표 전기 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 전표 전기 조회 요청 타입
 *
 * 필수 필드:
 * - asOfficeId: 사무소ID (WHERE 절 및 SELECT 절에서 사용)
 * - asFrDate: 시작일자 (WHERE 절에서 사용)
 * - asToDate: 종료일자 (WHERE 절에서 사용)
 * - asGCurr: 기준화폐 (SELECT 절에서 사용)
 * - asGCurrDeci: 기준화폐 소수점 (SELECT 절에서 사용)
 * - asGCurrFormat: 기준화폐 포맷 (SELECT 절에서 사용)
 */
export interface SlipPostSearchRequest {
  /** 대표사무소ID (쿼리에서 사용되지 않음) */
  asRpsnOfficeId?: string;
  /** 사무소ID (필수) */
  asOfficeId: string;
  /** 부서 (선택) */
  asDept?: string;
  /** 시작일자 (YYYYMMDD 형식, 필수) */
  asFrDate: string;
  /** 종료일자 (YYYYMMDD 형식, 필수) */
  asToDate: string;
  /** 전기여부 (Y: 전기, N: 미전기, 선택) */
  asTgt?: string;
  /** 전표유형 (선택) */
  asSlipType?: string;
  /** 사업부 (선택) */
  asDvs?: string;
  /** 전표발생원천 (선택) */
  asSlipExptnSrc?: string;
  /** 적요 (선택) */
  asRem?: string;
  /** 기준화폐 (필수) */
  asGCurr: string;
  /** 기준화폐 소수점 (필수) */
  asGCurrDeci: string;
  /** 기준화폐 포맷 (필수) */
  asGCurrFormat: string;
  /** 전표번호 (선택) */
  asSlipNo?: string;
}

/**
 * 전표 전기 조회 응답 타입
 */
export interface SlipPostSearchResponse {
  /** 선택여부 */
  chk?: string;
  /** 건설부서회계전표 */
  bltDeptAckSlp?: string;
  /** 건설일자회계전표 (YYYYMMDD 형식) */
  bltDateAckSlp?: string;
  /** 일련회계전표 */
  serAckSlp?: string;
  /** 작성부서 */
  makeDept?: string;
  /** 작성부서명 */
  mkDeptName?: string;
  /** 전표유형 */
  slipType?: string;
  /** 총합계금액 */
  sumTotAmt?: number;
  /** 승인일자 */
  ackDate?: string;
  /** 적요 */
  description?: string;
  /** 승인자 */
  ackPer?: string;
  /** 전표발생원천 */
  slipExptnSrc?: string;
  /** 전표발생원천명 */
  slipExptnSrcNme?: string;
  /** 전기여부 (Y: 전기, N: 미전기) */
  exptnTgt?: string;
  /** 작성부서활동증명서 */
  mkDeptActCertf?: string;
  /** 부서명 */
  deptName?: string;
  /** 작성일자활동증명서 */
  mkDateActCertf?: string;
  /** 일련활동증명서 */
  serActCertf?: string;
  /** 전표유형명 */
  slipTypeName?: string;
  /** 원천테이블명 */
  sourceTableName?: string;
  /** 블록 */
  blk?: string;
  /** 승인순번 */
  ackSeq?: string;
  /** 사용자명 */
  cbname?: string;
  /** 마감태그 */
  magamTag?: string;
  /** 마감태그2 */
  magamTag2?: string;
  /** 원천키 */
  sourceKey?: string;
  /** 회계전표ID */
  slpHeaderId?: string;
  /** 기준화폐 */
  gCurr?: string;
  /** 기준화폐 소수점 */
  gCurrDeci?: string;
  /** 기준화폐 포맷 */
  gCurrFormat?: string;
  /** 전기일자 */
  reference2?: string;
  /** 전기취소일자 */
  reference4?: string;
  /** 거래처명 */
  custname?: string;
  /** 원천테이블 */
  sourceTable?: string;
  /** 디테일 원천ID */
  dSourceId?: string;
  /** 역전 */
  reverse?: string;
  /** 문서상태 */
  cdStatus?: string;
  /** 전자결재상태명 */
  appStatusName?: string;
  /** 행 순번 */
  rowSeq?: number;
  /** 마스터ID */
  masterId?: string;
}

/**
 * 전표 전기 저장 요청 타입
 */
export interface SlipPostSaveRequest {
  headers: SlipPostSaveHeader[];
  details: SlipPostSaveDetail[];
}

/**
 * 전표 전기 저장 헤더 타입
 */
export interface SlipPostSaveHeader {
  slpHeaderId: string;
  ackPer?: string;
  exptnTgt: string;
  reference2?: string;
  reference4?: string;
  rowStatus: string;
  lastUpdatedBy: string;
  programId: string;
  terminalId: string;
}

/**
 * 전표 전기 저장 상세 타입
 */
export interface SlipPostSaveDetail {
  exptnTgt: string;
  slpHeaderId: string;
  rowSeq: number;
  rowStatus: string;
  lastUpdatedBy: string;
  programId: string;
  terminalId: string;
}
