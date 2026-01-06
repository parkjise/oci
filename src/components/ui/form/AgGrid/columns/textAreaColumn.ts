import type { ColDef } from "ag-grid-community";
import { createBaseColumnDef } from "./utils";

/**
 * 긴 텍스트 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @param maxLength - 최대 글자 수 (선택사항)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createTextAreaColumn<MyData>("description", "설명", 300, 500),
 * ];
 * ```
 */
export const createTextAreaColumn = <TData = unknown>(
  field: string,
  headerName: string,
  width?: number,
  maxLength?: number
): ColDef<TData> => ({
  ...createBaseColumnDef<TData>({ field, headerName, width, editable: true }),
  cellEditor: "agLargeTextCellEditor",
  cellEditorParams: { maxLength },
});

