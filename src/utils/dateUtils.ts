/**
 * ============================================================================
 * 날짜 유틸리티 함수
 * ============================================================================
 */

import dayjs from "dayjs";

/**
 * 날짜 문자열을 "YYYY.MM.DD HH:mm:ss" 형식으로 변환
 * @param dateStr - "YYYYMMDDHHmmss" 또는 "YYYYMMDD" 형식의 날짜 문자열
 * @returns "YYYY.MM.DD HH:mm:ss" 형식의 문자열
 */
export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return "";

  // "YYYYMMDDHHmmss" 형식 (14자리)
  if (dateStr.length >= 14) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
  }

  // "YYYYMMDD" 형식 (8자리)
  if (dateStr.length >= 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}.${month}.${day} 00:00:00`;
  }

  return dateStr;
};

/**
 * 날짜 문자열을 dayjs를 사용하여 "YYYY.MM.DD HH:mm:ss" 형식으로 변환
 * @param dateStr - "YYYYMMDDHHmmss" 또는 "YYYYMMDD" 형식의 날짜 문자열
 * @returns "YYYY.MM.DD HH:mm:ss" 형식의 문자열
 */
export const formatDateTimeWithDayjs = (dateStr?: string): string => {
  if (!dateStr) return "";

  try {
    // "YYYYMMDDHHmmss" 형식 (14자리)
    if (dateStr.length >= 14) {
      const formatted = dayjs(
        `${dateStr.substring(0, 4)}-${dateStr.substring(
          4,
          6
        )}-${dateStr.substring(6, 8)} ${dateStr.substring(
          8,
          10
        )}:${dateStr.substring(10, 12)}:${dateStr.substring(12, 14)}`
      );
      return formatted.isValid()
        ? formatted.format("YYYY.MM.DD HH:mm:ss")
        : formatDateTime(dateStr); // fallback
    }

    // "YYYYMMDD" 형식 (8자리)
    if (dateStr.length >= 8) {
      const formatted = dayjs(
        `${dateStr.substring(0, 4)}-${dateStr.substring(
          4,
          6
        )}-${dateStr.substring(6, 8)}`
      );
      return formatted.isValid()
        ? formatted.format("YYYY.MM.DD 00:00:00")
        : formatDateTime(dateStr); // fallback
    }
  } catch {
    // dayjs 파싱 실패 시 기존 로직 사용
    return formatDateTime(dateStr);
  }

  return dateStr;
};

/**
 * 마감년월에서 월만 추출하는 함수
 * @param yymm - "YYYYMM" 형식의 문자열
 * @returns 월 (2자리 문자열, 예: "01", "12")
 */
export const extractMonth = (yymm?: string): string => {
  if (!yymm || yymm.length < 6) return "";
  return yymm.substring(4, 6); // 마지막 2자리 (월)
};

/**
 * YYYYMM 형식을 YYYY.MM 형식으로 변환
 * @param yyyymm - "YYYYMM" 형식의 문자열
 * @returns "YYYY.MM" 형식의 문자열
 */
export const formatYearMonth = (yyyymm: string): string => {
  if (!yyyymm || yyyymm.length !== 6) return yyyymm;
  return `${yyyymm.substring(0, 4)}.${yyyymm.substring(4, 6)}`;
};
