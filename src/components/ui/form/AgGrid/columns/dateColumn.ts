import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import dayjs from "dayjs";
import { createBaseColumnDef } from "./utils";

/**
 * 날짜 포맷터 (YYYY-MM-DD)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 날짜 문자열 (YYYY-MM-DD) 또는 빈 문자열
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "date",
 *   valueFormatter: formatDate,
 * };
 * ```
 */
export const formatDate = (params: ValueFormatterParams): string => {
  if (!params.value) return "";

  if (params.value instanceof Date) {
    return dayjs(params.value).format("YYYY-MM-DD");
  }

  if (typeof params.value === "string") {
    return dayjs(params.value).format("YYYY-MM-DD");
  }

  return "";
};

/**
 * 날짜 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @param min - 최소 날짜 (선택사항)
 * @param max - 최대 날짜 (선택사항)
 * @param valueFormatter - 커스텀 포맷터 (선택사항, 기본값: formatDate)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createDateColumn<MyData>(
 *     "startDate",
 *     "시작일",
 *     150,
 *     new Date(2020, 0, 1),
 *     new Date(2030, 11, 31)
 *   ),
 * ];
 * ```
 */
export const createDateColumn = <TData = unknown>(
  field: string,
  headerName: string,
  width?: number,
  min?: Date,
  max?: Date,
  valueFormatter?: (params: ValueFormatterParams) => string
): ColDef<TData> => ({
  ...createBaseColumnDef<TData>({ field, headerName, width, editable: true }),
  cellEditor: "agDateCellEditor",
  cellEditorParams: { min, max },
  valueFormatter: valueFormatter || formatDate,
  filter: "agDateColumnFilter",
});

