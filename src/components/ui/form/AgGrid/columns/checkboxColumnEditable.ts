import type { ColDef } from "ag-grid-community";
import { createBaseColumnDef } from "./utils";

/**
 * 체크박스 편집 가능한 컬럼 생성
 *
 * 데이터 필드를 체크박스로 표시하고 편집할 수 있는 컬럼을 생성합니다.
 * 행 선택용 체크박스가 필요한 경우 createCheckboxColumn의 rowSelection 옵션을 사용하세요.
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createCheckboxColumnEditable<MyData>("isActive", "활성화", 100),
 * ];
 * ```
 *
 * @see createCheckboxColumn - Y/N 값 표시 또는 행 선택 모드
 */
export const createCheckboxColumnEditable = <TData = unknown>(
  field: string,
  headerName: string,
  width?: number
): ColDef<TData> => ({
  ...createBaseColumnDef<TData>({ field, headerName, width, editable: true }),
  cellEditor: "agCheckboxCellEditor",
  cellRenderer: "agCheckboxCellRenderer",
});

