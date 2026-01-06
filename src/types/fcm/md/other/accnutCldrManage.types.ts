/**
 * ============================================================================
 * 회계달력 관리 타입 정의
 * ============================================================================
 *
 * 회계달력 관리 관련 TypeScript 타입 정의
 */

// ========== Constants ==========

/**
 * 양음력 구분 상수
 */
export const SOLAR_LUNAR_TYPE = {
  /** 양력 */
  SOLAR: "1",
  /** 음력 */
  LUNAR: "2",
} as const;

export type SolarLunarType = typeof SOLAR_LUNAR_TYPE[keyof typeof SOLAR_LUNAR_TYPE];

// ========== Request Types ==========

/**
 * 회계달력 관리 검색 요청
 */
export interface AccnutCldrManageSrchRequest {
  /** 사무소ID */
  asOfficeId?: string;
  /** 기준일자 (ISO-8601: yyyy-MM-dd) */
  asStndDate?: string;
  /** 기초일자 (ISO-8601: yyyy-MM-dd) */
  asBasicDate?: string;
}

// ========== Response Types ==========

/**
 * 회계달력 관리 달력 목록 응답
 */
export interface AccnutCldrManageCldrListResponse {
  /** 달력ID */
  transCalendarId?: number;
  /** 일자 (ISO-8601: yyyy-MM-dd) */
  transDate?: string;
  /** 요일 */
  dayOfWeek?: string;
  /** 영업일여부 (Y/N) */
  businessDayFlag?: string;
  /** 비고 */
  remark?: string;
}

/**
 * 회계달력 관리 휴일 목록 응답
 */
export interface AccnutCldrManageRestdeListResponse {
  /** 달력ID */
  transCalendarId?: number;
  /** 휴무일 (ISO-8601: yyyy-MM-dd) */
  offDate?: string;
  /** 휴무일명 */
  offDateName?: string;
  /** 기초일 (ISO-8601: yyyy-MM-dd) */
  basicDate?: string;
  /** 기초양음력 (1: 양력 / 2: 음력) */
  solarLunarType?: string;
  /** 기존휴무일 (ISO-8601: yyyy-MM-dd) */
  oriOffDate?: string;
  /** 기존기초일 (ISO-8601: yyyy-MM-dd) */
  oriBasicDate?: string;
  /** 기존기초양음력 (1: 양력 / 2: 음력) */
  oriSolarLunarType?: string;
}

/**
 * 회계달력 관리 달력ID 응답
 */
export interface AccnutCldrManageCldrIdResponse {
  /** 달력ID */
  glCalendarId?: number;
}

/**
 * 회계달력 관리 음력일자 응답
 */
export interface AccnutCldrManageSolcDateResponse {
  /** 양력일자 (ISO-8601: yyyy-MM-dd) */
  solcDate?: string;
}

// ========== Save Request Types ==========

/**
 * 회계달력 관리 달력 데이터
 */
export interface AccnutCldrManageCldrData {
  /** 달력ID */
  transCalendarId: string;
  /** 일자 (ISO-8601: yyyy-MM-dd) */
  transDate: string;
  /** 영업일여부 (Y/N) */
  businessDayFlag: string;
  /** 비고 */
  remark?: string;
}

/**
 * 회계달력 관리 달력 저장 요청
 */
export interface AccnutCldrManageCldrSaveRequest {
  /** 달력 목록 */
  list: AccnutCldrManageCldrData[];
}

/**
 * 회계달력 관리 휴일 데이터
 */
export interface AccnutCldrManageRestdeData {
  /** 행 상태 (C: 생성, U: 수정, D: 삭제) */
  rowStatus: "C" | "U" | "D";
  /** 달력ID */
  transCalendarId: string;
  /** 기존휴무일 (ISO-8601: yyyy-MM-dd) */
  oriOffDate?: string;
  /** 기존기초일 (ISO-8601: yyyy-MM-dd) */
  oriBasicDate?: string;
  /** 기존기초양음력 (1: 양력 / 2: 음력) */
  oriSolarLunarType?: string;
  /** 휴무일 (ISO-8601: yyyy-MM-dd) */
  offDate?: string;
  /** 기초일 (ISO-8601: yyyy-MM-dd) */
  basicDate?: string;
  /** 기초양음력 (1: 양력 / 2: 음력) */
  solarLunarType?: string;
  /** 휴무일명 */
  offDateName?: string;
}

/**
 * 회계달력 관리 휴일 저장 요청
 */
export interface AccnutCldrManageRestdeSaveRequest {
  /** 휴일 목록 */
  list: AccnutCldrManageRestdeData[];
}

// ========== Grid Data Types (with rowStatus for UI) ==========

/**
 * 달력 그리드 데이터 (UI용)
 */
export interface AccnutCldrManageCldrGridData
  extends AccnutCldrManageCldrListResponse {
  /** 행 상태 (C: 생성, U: 수정, D: 삭제) */
  rowStatus?: "C" | "U" | "D";
  /** 그리드 ID */
  id?: string;
}

/**
 * 휴일 그리드 데이터 (UI용)
 */
export interface AccnutCldrManageRestdeGridData
  extends AccnutCldrManageRestdeListResponse {
  /** 행 상태 (C: 생성, U: 수정, D: 삭제) */
  rowStatus?: "C" | "U" | "D";
  /** 그리드 ID */
  id?: string;
  
}


