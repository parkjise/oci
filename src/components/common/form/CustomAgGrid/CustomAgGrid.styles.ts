import styled, { css } from "styled-components";

// AG-Grid 스타일 커스터마이징 옵션 인터페이스
export interface AgGridStyleOptions {
  // General
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;

  // Border
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: string;

  // Spacing
  padding?: string;
  cellPadding?: string;
  headerPadding?: string;
  rowHeight?: string;
  headerHeight?: string;

  // Header
  headerBackgroundColor?: string;
  headerColor?: string;
  headerFontSize?: string;
  headerFontWeight?: string;
  headerBorderColor?: string;
  headerBorderWidth?: string;

  // Cells
  cellBackgroundColor?: string;
  cellColor?: string;
  cellBorderColor?: string;
  cellBorderWidth?: string;
  oddRowBackgroundColor?: string;
  evenRowBackgroundColor?: string;
  selectedRowBackgroundColor?: string;
  hoverRowBackgroundColor?: string;

  // Icons
  iconColor?: string;
  iconSize?: string;
  iconHoverColor?: string;
}

// 기본 스타일 옵션
const defaultStyleOptions: AgGridStyleOptions = {
  // General
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  fontSize: "14px",
  fontFamily: "inherit",

  // Border
  borderColor: "#d0d5dd",
  borderWidth: "1px",
  borderRadius: "8px",
  borderStyle: "solid",

  // Spacing
  padding: "10px",
  cellPadding: "8px",
  headerPadding: "12px",
  rowHeight: "42px",
  headerHeight: "48px",

  // Header
  headerBackgroundColor: "#f8f9fa",
  headerColor: "#1a1a1a",
  headerFontSize: "14px",
  headerFontWeight: "600",
  headerBorderColor: "#e5e7eb",
  headerBorderWidth: "1px",

  // Cells
  cellBackgroundColor: "#ffffff",
  cellColor: "#1a1a1a",
  cellBorderColor: "#e5e7eb",
  cellBorderWidth: "1px",
  oddRowBackgroundColor: "#ffffff",
  evenRowBackgroundColor: "#fafafa",
  selectedRowBackgroundColor: "#e3f2fd",
  hoverRowBackgroundColor: "#f5f5f5",

  // Icons
  iconColor: "#6b7280",
  iconSize: "16px",
  iconHoverColor: "#374151",
};

// 스타일 옵션을 CSS 변수로 변환
const getStyleVariables = (options: AgGridStyleOptions = {}) => {
  const merged = { ...defaultStyleOptions, ...options };
  return css`
    /* General */
    --ag-background-color: ${merged.backgroundColor};
    --ag-foreground-color: ${merged.color};
    --ag-font-size: ${merged.fontSize};
    --ag-font-family: ${merged.fontFamily};

    /* Border */
    --ag-border-color: ${merged.borderColor};
    --ag-border-width: ${merged.borderWidth};
    --ag-border-radius: ${merged.borderRadius};

    /* Spacing */
    --ag-row-height: ${merged.rowHeight};
    --ag-header-height: ${merged.headerHeight};
    --ag-cell-horizontal-padding: ${merged.cellPadding};
    --ag-header-cell-horizontal-padding: ${merged.headerPadding};

    /* Header */
    --ag-header-background-color: ${merged.headerBackgroundColor};
    --ag-header-foreground-color: ${merged.headerColor};
    --ag-header-font-size: ${merged.headerFontSize};
    --ag-header-font-weight: ${merged.headerFontWeight};
    --ag-header-cell-hover-background-color: ${merged.hoverRowBackgroundColor};

    /* Cells */
    --ag-odd-row-background-color: ${merged.oddRowBackgroundColor};
    --ag-row-hover-color: ${merged.hoverRowBackgroundColor};
    --ag-selected-row-background-color: ${merged.selectedRowBackgroundColor};
    --ag-range-selection-background-color: ${merged.selectedRowBackgroundColor};

    /* Icons */
    --ag-icon-color: ${merged.iconColor};
    --ag-icon-size: ${merged.iconSize};
    --ag-icon-hover-color: ${merged.iconHoverColor};
  `;
};

export const StyledAgGridContainer = styled.div<{
  $styleOptions?: AgGridStyleOptions;
}>`
  ${({ $styleOptions }) => getStyleVariables($styleOptions)}

  padding: ${({ $styleOptions }) =>
    $styleOptions?.padding || defaultStyleOptions.padding};
  border: ${({ $styleOptions }) =>
      $styleOptions?.borderWidth || defaultStyleOptions.borderWidth}
    ${({ $styleOptions }) =>
      $styleOptions?.borderStyle || defaultStyleOptions.borderStyle}
    ${({ $styleOptions }) =>
      $styleOptions?.borderColor || defaultStyleOptions.borderColor};
  border-radius: ${({ $styleOptions }) =>
    $styleOptions?.borderRadius || defaultStyleOptions.borderRadius};

  /* AG-Grid 셀 스타일 커스터마이징 */
  .ag-cell {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.cellBackgroundColor ||
      defaultStyleOptions.cellBackgroundColor};
    color: ${({ $styleOptions }) =>
      $styleOptions?.cellColor || defaultStyleOptions.cellColor};
    border-color: ${({ $styleOptions }) =>
      $styleOptions?.cellBorderColor || defaultStyleOptions.cellBorderColor};
    border-width: ${({ $styleOptions }) =>
      $styleOptions?.cellBorderWidth || defaultStyleOptions.cellBorderWidth};
  }

  /* 짝수 행 배경색 */
  .ag-row-even {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.evenRowBackgroundColor ||
      defaultStyleOptions.evenRowBackgroundColor};
  }

  /* 홀수 행 배경색 */
  .ag-row-odd {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.oddRowBackgroundColor ||
      defaultStyleOptions.oddRowBackgroundColor};
  }

  /* 헤더 스타일 */
  .ag-header-cell {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.headerBackgroundColor ||
      defaultStyleOptions.headerBackgroundColor};
    color: ${({ $styleOptions }) =>
      $styleOptions?.headerColor || defaultStyleOptions.headerColor};
    font-size: ${({ $styleOptions }) =>
      $styleOptions?.headerFontSize || defaultStyleOptions.headerFontSize};
    font-weight: ${({ $styleOptions }) =>
      $styleOptions?.headerFontWeight || defaultStyleOptions.headerFontWeight};
    border-color: ${({ $styleOptions }) =>
      $styleOptions?.headerBorderColor ||
      defaultStyleOptions.headerBorderColor};
    border-width: ${({ $styleOptions }) =>
      $styleOptions?.headerBorderWidth ||
      defaultStyleOptions.headerBorderWidth};
  }

  /* 아이콘 스타일 */
  .ag-icon {
    color: ${({ $styleOptions }) =>
      $styleOptions?.iconColor || defaultStyleOptions.iconColor};
    font-size: ${({ $styleOptions }) =>
      $styleOptions?.iconSize || defaultStyleOptions.iconSize};
  }

  .ag-icon:hover {
    color: ${({ $styleOptions }) =>
      $styleOptions?.iconHoverColor || defaultStyleOptions.iconHoverColor};
  }
`;
