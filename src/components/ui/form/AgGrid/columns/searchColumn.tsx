import type { ColDef, IRowNode, ICellRendererParams } from "ag-grid-community";
import { SearchIconCellRenderer } from "../cells/SearchIconCellRenderer";
import { toFieldType } from "./utils";

/**
 * 검색 아이콘이 있는 컬럼 정의 생성 헬퍼
 *
 * @example
 * ```typescript
 * const columnDefs = [
 *   createSearchColumn<MyData>(
 *     "상품명",
 *     "productName",
 *     (node, field) => {
 *       // 검색 모달 열기 등의 처리
 *       console.log("검색:", field, node.data);
 *     },
 *     {
 *       width: 200,
 *       editable: true,
 *       showIcon: true,
 *       bodyAlign: "left"
 *     }
 *   )
 * ];
 * ```
 */
export const createSearchColumn = <TData extends Record<string, unknown>>(
  headerName: string,
  field: keyof TData,
  onSearchClick: (node: IRowNode<TData>, field: string) => void,
  options?: {
    width?: number;
    editable?: boolean;
    showIcon?: boolean;
    bodyAlign?: "left" | "center" | "right";
    headerAlign?: "left" | "center" | "right";
    filter?: boolean;
  }
): ColDef<TData> => {
  const {
    width = 120,
    editable = true,
    showIcon = true,
    bodyAlign = "left",
    headerAlign = "center",
    filter = false,
  } = options || {};

  const fieldName = String(field);

  const cellClass =
    bodyAlign === "left"
      ? "ag-cell-align-left"
      : bodyAlign === "right"
        ? "ag-cell-align-right"
        : "ag-cell-align-center";

  const headerClass =
    headerAlign === "left"
      ? "ag-header-cell-left"
      : headerAlign === "right"
        ? "ag-header-cell-right"
        : "ag-header-cell-center";

  return {
    headerName,
    field: toFieldType(fieldName),
    width,
    editable,
    filter,
    cellClass,
    headerClass,
    cellRenderer: (params: ICellRendererParams<TData>) => (
      <SearchIconCellRenderer
        {...params}
        onSearchClick={onSearchClick}
        field={fieldName}
        showIcon={showIcon}
        cellClass={cellClass}
      />
    ),
  };
};
