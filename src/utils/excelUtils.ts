// src/utils/excelUtils.ts

import * as XLSX from "xlsx";

/**
 * Excel 셀 값 타입
 */
type CellValue = string | number | boolean | Date | null | undefined;

/**
 * Excel 행 데이터 타입
 */
type ExcelRow = CellValue[];

/**
 * Excel 파일 파싱 옵션
 */
export interface ExcelParseOptions<T = Record<string, unknown>> {
  /** 시트 인덱스 (기본값: 0, 첫 번째 시트) */
  sheetIndex?: number;
  /** 시트 이름 (sheetIndex보다 우선) */
  sheetName?: string;
  /** 헤더 행이 있는지 여부 (기본값: true) */
  hasHeader?: boolean;
  /** 헤더 행 인덱스 (기본값: 0) */
  headerRowIndex?: number;
  /** 데이터 시작 행 인덱스 (기본값: hasHeader ? 1 : 0) */
  dataStartRowIndex?: number;
  /**
   * 컬럼 매핑 설정
   * - 헤더 기반: { fieldName: "헤더명" } 형태
   * - 인덱스 기반: { fieldName: 0 } 형태 (숫자)
   */
  columnMapping?: Record<string, string | number>;
  /** 데이터 변환 함수 */
  transformers?: Record<
    string,
    (value: unknown, row: ExcelRow, index: number) => unknown
  >;
  /** 데이터 검증 함수 (false 반환 시 해당 행 제외) */
  validator?: (row: T, index: number) => boolean;
  /** 빈 행 필터링 여부 (기본값: true) */
  filterEmptyRows?: boolean;
}

/**
 * 빈 셀인지 확인
 */
const isEmptyCell = (cell: unknown): boolean => {
  return (
    cell === "" ||
    cell === null ||
    cell === undefined ||
    (typeof cell === "string" && cell.trim() === "")
  );
};

/**
 * 헤더 이름을 필드명으로 변환
 */
const normalizeFieldName = (header: string): string => {
  return header.replace(/\s+/g, "").replace(/[^a-zA-Z0-9가-힣]/g, "");
};

/**
 * 컬럼 매핑을 통해 값을 가져오기
 */
const getValueByMapping = (
  row: ExcelRow,
  mapping: string | number,
  headers: string[]
): unknown => {
  if (typeof mapping === "number") {
    return row[mapping];
  }
  const headerIndex = headers.findIndex(
    (h) => h === mapping || h.toLowerCase() === mapping.toLowerCase()
  );
  return headerIndex >= 0 ? row[headerIndex] : undefined;
};

/**
 * 변환 함수 적용
 */
const applyTransformer = (
  value: unknown,
  fieldName: string,
  row: ExcelRow,
  rowIndex: number,
  transformers?: Record<
    string,
    (value: unknown, row: ExcelRow, index: number) => unknown
  >
): unknown => {
  if (transformers?.[fieldName]) {
    return transformers[fieldName](value, row, rowIndex);
  }
  return value;
};

/**
 * Excel 파일을 읽어서 배열로 변환 (범용 함수)
 * @param file Excel 파일 (File 객체)
 * @param options 파싱 옵션
 * @returns 파싱된 데이터 배열
 */
export const parseExcelFile = async <T = Record<string, unknown>>(
  file: File,
  options: ExcelParseOptions<T> = {}
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("파일 데이터를 읽을 수 없습니다."));
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });

        if (workbook.SheetNames.length === 0) {
          reject(new Error("Excel 파일에 시트가 없습니다."));
          return;
        }

        const sheetName =
          options.sheetName || workbook.SheetNames[options.sheetIndex ?? 0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error(`시트 "${sheetName}"를 찾을 수 없습니다.`));
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        }) as ExcelRow[];

        if (jsonData.length === 0) {
          reject(new Error("Excel 파일에 데이터가 없습니다."));
          return;
        }

        const hasHeader = options.hasHeader ?? true;
        const headerRowIndex = options.headerRowIndex ?? 0;
        const dataStartRowIndex =
          options.dataStartRowIndex ??
          (hasHeader ? headerRowIndex + 1 : headerRowIndex);
        const filterEmptyRows = options.filterEmptyRows ?? true;

        // 헤더 추출
        const headers = hasHeader
          ? (jsonData[headerRowIndex] || []).map((h) => String(h).trim())
          : [];

        // 데이터 행 추출 및 필터링
        let rows = jsonData.slice(dataStartRowIndex);
        if (filterEmptyRows) {
          rows = rows.filter((row) => row.some((cell) => !isEmptyCell(cell)));
        }

        // 데이터 변환
        const result: T[] = rows
          .map((row, rowIndex) => {
            const rowData: Record<string, unknown> = {};

            if (options.columnMapping) {
              // 컬럼 매핑 사용
              Object.entries(options.columnMapping).forEach(
                ([fieldName, mapping]) => {
                  const value = getValueByMapping(row, mapping, headers);
                  rowData[fieldName] = applyTransformer(
                    value,
                    fieldName,
                    row,
                    rowIndex,
                    options.transformers
                  );
                }
              );
            } else if (hasHeader && headers.length > 0) {
              // 헤더 기반 자동 매핑
              headers.forEach((header, index) => {
                if (header) {
                  const fieldName = normalizeFieldName(header);
                  const value = row[index];
                  rowData[fieldName] = applyTransformer(
                    value,
                    fieldName,
                    row,
                    rowIndex,
                    options.transformers
                  );
                }
              });
            } else {
              // 인덱스 기반 매핑
              row.forEach((cell, index) => {
                rowData[`column${index}`] = cell;
              });
            }

            return rowData as T;
          })
          .filter((rowData, index) => {
            return options.validator ? options.validator(rowData, index) : true;
          });

        if (result.length === 0) {
          reject(new Error("유효한 데이터가 없습니다."));
          return;
        }

        resolve(result);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Excel 파일 파싱 중 오류가 발생했습니다.")
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Excel 파일 확장자 검증
 * @param file 검증할 File 객체
 * @returns 유효한 Excel 파일이면 true, 아니면 false
 */
export const isValidExcelFile = (file: File): boolean => {
  const validExtensions = [".xlsx", ".xls"];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
};

/**
 * 날짜 형식 변환 헬퍼 함수
 * Excel 날짜 또는 문자열 날짜를 YYYY-MM-DD 형식으로 변환
 * @param dateValue 변환할 날짜 값
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export const parseExcelDate = (dateValue: unknown): string => {
  if (!dateValue) {
    return new Date().toISOString().split("T")[0];
  }

  // 이미 YYYY-MM-DD 형식인 경우
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // 날짜 객체인 경우
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split("T")[0];
  }

  // Excel 날짜 숫자인 경우 (1900년 기준)
  if (typeof dateValue === "number") {
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(
      excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000
    );
    return date.toISOString().split("T")[0];
  }

  // 문자열 날짜 파싱 시도
  try {
    const date = new Date(String(dateValue));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // 파싱 실패 시 현재 날짜 반환
  }

  return new Date().toISOString().split("T")[0];
};

/**
 * 문자열을 배열로 변환하는 헬퍼 함수
 * @param value 변환할 값
 * @param separator 구분자 (기본값: ",")
 * @returns 문자열 배열
 */
export const parseStringToArray = (
  value: unknown,
  separator: string = ","
): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  const str = String(value);
  return str
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * 숫자로 변환하는 헬퍼 함수
 * @param value 변환할 값
 * @param defaultValue 기본값 (기본값: 0)
 * @returns 숫자
 */
export const parseNumber = (
  value: unknown,
  defaultValue: number = 0
): number => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// ============================================================================
// Sample3 전용 함수 (하위 호환성 유지)
// ============================================================================

import type { UserData } from "@pages/sample/sample3/sample3Data";

/**
 * Excel 파일을 읽어서 UserData 배열로 변환 (Sample3 전용)
 * @param file Excel 파일 (File 객체)
 * @returns UserData 배열
 * @deprecated parseExcelFile을 사용하세요
 */
export const parseExcelToUserData = async (file: File): Promise<UserData[]> => {
  return parseExcelFile<UserData>(file, {
    hasHeader: true,
    columnMapping: {
      id: 0,
      name: 1,
      email: 2,
      phone: 3,
      department: 4,
      position: 5,
      status: 6,
      joinDate: 7,
      salary: 8,
      memo: 9,
      gender: 10,
      hobby: 11,
    },
    transformers: {
      id: (value) => parseNumber(value, 0),
      name: (value) => String(value || ""),
      email: (value) => String(value || ""),
      phone: (value) => String(value || ""),
      department: (value) => String(value || ""),
      position: (value) => String(value || ""),
      status: (value) => String(value || "활성"),
      joinDate: parseExcelDate,
      salary: (value) => parseNumber(value, 0),
      memo: (value) => String(value || ""),
      gender: (value) => (value ? String(value) : undefined),
      hobby: (value) => parseStringToArray(value, ","),
    },
    validator: (data) => !!(data.name && data.email),
  });
};
