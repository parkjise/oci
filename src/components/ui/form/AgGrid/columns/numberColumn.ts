import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { createBaseColumnDef } from "./utils";

/**
 * 숫자 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @param min - 최소값 (선택사항)
 * @param max - 최대값 (선택사항)
 * @param valueFormatter - 커스텀 포맷터 (선택사항)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createNumberColumn<MyData>("amount", "금액", 150, 0, 1000000, formatNumber),
 * ];
 * ```
 */
export const createNumberColumn = <TData = unknown>(
  field: string,
  headerName: string,
  width?: number,
  min?: number,
  max?: number,
  valueFormatter?: (params: ValueFormatterParams) => string
): ColDef<TData> => ({
  ...createBaseColumnDef<TData>({ field, headerName, width, editable: true }),
  cellEditor: "agNumberCellEditor",
  cellEditorParams: { min, max },
  valueFormatter,
  type: "numericColumn",
});

