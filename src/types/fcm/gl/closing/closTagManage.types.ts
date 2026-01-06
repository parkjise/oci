/**
 * ============================================================================
 * 마감 TAG 관리 타입 정의
 * ============================================================================
 */

/**
 * 왼쪽 그리드 데이터 타입
 */
export type LeftGridData = {
  id?: string;
  rowStatus?: "C" | "U" | "D";
  status?: string; // 상태
  closingYearMonth?: string; // 마감년월
  profitLossClosing?: string; // 손익마감
  tag?: string; // 마감태그 (Y: 마감, N: 미마감)
  firstClosingYn?: string; // 최초마감여부 (attribute1)
  subModule?: string; // 서브모듈 (SUB_MODULE)
  lastRegUser?: string; // 최종등록자
  lastRegDate?: string; // 최종등록일자
  creator?: string; // 생성자
  createDate?: string; // 생성일자
  cnt?: number; // 미전기 전표 수
};

/**
 * 오른쪽 그리드 데이터 타입
 */
export type RightGridData = {
  id?: string;
  rowStatus?: "C" | "U" | "D";
  status?: string; // 상태
  moduleType?: string; // 모듈구분
  closingStatus?: string; // 마감상태
  lastRegUser?: string; // 최종등록자
  creator?: string; // 생성자
  createDate?: string; // 생성일자
  lastRegDate?: string; // 최종등록일자
  mth?: string; // 월
  // 원본 필드들
  CREATED_BY?: string;
  LAST_UPDATED_BY?: string;
  CREATION_DATE?: string;
  LAST_UPDATE_DATE?: string;
  SUB_MODULE?: string;
  CREATED_BY_USER?: string;
  YEAR?: string;
  OFFICE_ID?: string;
  TAG?: string; // "Y" | "N"
  LAST_UPDATED_BY_USER?: string;
};

