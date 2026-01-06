/**
 * 회계기간 등록 타입 정의
 */

/**
 * 회계기간 데이터
 */
export interface PeriodData extends Record<string, unknown> {
  /** 그리드 고유 ID */
  id?: string | number;
  /** 행 상태 (C: 생성, U: 수정, D: 삭제) */
  rowStatus?: "C" | "U" | "D";
  /** 조직 ID */
  officeId: string;
  /** 회계연도 */
  accYear: string;
  /** 순번 (0: 결산, 1~12: 월별) */
  periodNum: number;
  /** Period 명 (예: 2026-01) */
  periodName: string;
  /** 월도 (00~12) */
  accMonth: string;
  /** 시작일 (YYYY-MM-DD) */
  dateF: string;
  /** 종료일 (YYYY-MM-DD) */
  dateT: string;
  /** 결산 여부 (Y/N) */
  adjustFlag: string;
  /** 실제 회계년도 */
  realYear: string;
  /** 실제 월도 */
  realMth: string;
  /** 분기 (1~4) */
  quarter: number;
  /** 반기 (1~2) */
  halfYearly: number;
}

/**
 * 회계기간 조회 파라미터
 */
export interface PeriodSearchParams {
  /** 사무소 ID */
  asOfficeId: string;
  /** 연도 */
  asYear: string;
  /** 다음 연도 (선택적) */
  asNextYear?: string;
}

/**
 * 다음 연도 복사 파라미터
 */
export interface CopyNextYearParams {
  /** 사무소 ID */
  asOfficeId: string;
  /** 기준 연도 */
  asYear: string;
  /** 복사할 연도 */
  asNextYear: string;
}

/**
 * 다음 연도 복사 결과
 */
export interface CopyNextYearResult {
  /** 복사된 건수 */
  resultCount: number;
}
