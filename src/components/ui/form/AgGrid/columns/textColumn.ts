import type { ColDef } from "ag-grid-community";
import { createBaseColumnDef } from "./utils";

/**
 * 텍스트 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @param flex - 유연한 너비 비율 (선택사항, width와 함께 사용 불가)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createTextColumn<MyData>("name", "이름", 200),
 *   createTextColumn<MyData>("email", "이메일", undefined, 1), // flex 사용
 * ];
 * ```
 */
export const createTextColumn = <TData = unknown>(
  field: string,
  headerName: string,
  width?: number,
  flex?: number
): ColDef<TData> => ({
  ...createBaseColumnDef<TData>({ field, headerName, width, editable: true }),
  ...(flex !== undefined && { flex }),
  cellEditor: "agTextCellEditor",
});

