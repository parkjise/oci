import React from "react";
import type { ICellRendererParams, IRowNode } from "ag-grid-community";
import {
  CellContainer,
  ValueSpan,
  SearchIcon,
} from "./SearchIconCellRenderer.styles";

interface SearchIconCellRendererParams<TData = unknown>
  extends ICellRendererParams<TData> {
  /** 검색 아이콘 클릭 핸들러 */
  onSearchClick?: (node: IRowNode<TData>, field: string) => void;
  /** 필드명 (자동으로 column.getColId() 사용) */
  field?: string;
  /** 아이콘 표시 여부 (기본값: true) */
  showIcon?: boolean;
  /** 셀 클래스 (정렬상태를 렌더러에서 그려주기 위해) */
  cellClass?: string;
}

/**
 * AG-Grid 검색 아이콘이 있는 셀 렌더러
 * 값과 검색 아이콘을 함께 표시하고, 아이콘 클릭 시 검색 기능 실행
 *
 * @example
 * ```typescript
 * {
 *   field: 'productName',
 *   cellRenderer: SearchIconCellRenderer,
 *   cellRendererParams: {
 *     onSearchClick: (node, field) => {
 *       // 검색 모달 열기 등의 처리
 *       console.log('검색:', field, node.data);
 *     },
 *     showIcon: true // 아이콘 표시 여부
 *   }
 * }
 * ```
 */
export const SearchIconCellRenderer = <TData extends Record<string, unknown>>(
  params: SearchIconCellRendererParams<TData>
) => {
  const { value, node, column, onSearchClick, field, showIcon = true, cellClass } = params;

  // 필드명 결정: props로 전달된 field 우선, 없으면 컬럼 ID 사용
  const fieldName = field || column?.getColId() || "";

  const handleSearchClick = (e: React.MouseEvent) => {
    // 그리드 행 클릭 이벤트와 충돌 방지
    e.stopPropagation();
    if (node && onSearchClick) {
      onSearchClick(node, fieldName);
    }
  };

  return (
    <CellContainer>
      <ValueSpan
        className={cellClass}
      >
        {value ?? ""}
      </ValueSpan>
      {showIcon && <SearchIcon onClick={handleSearchClick} />}
    </CellContainer>
  );
};

export default SearchIconCellRenderer;
