import styled, { css } from "styled-components";
import * as mixins from "@/styles/mixins";

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
  headerTextAlign?: "left" | "center" | "right";

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
  fontSize: "13px",
  fontFamily: "inherit",

  // Border
  borderColor: "#d0d5dd",
  borderWidth: "1px",
  borderRadius: "8px",
  borderStyle: "solid",

  // Spacing
  padding: "10px",
  cellPadding: "6px",
  headerPadding: "8px",
  rowHeight: "36px",
  headerHeight: "40px",

  // Header
  headerBackgroundColor: "#f8f9fa",
  headerColor: "#1a1a1a",
  headerFontSize: "13px",
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
const getStyleVariables = (options?: AgGridStyleOptions) => {
  const merged: AgGridStyleOptions = {
    ...defaultStyleOptions,
    ...(options || {}),
  };
  return css`
    /* General */
    --ag-background-color: ${merged.backgroundColor ||
    defaultStyleOptions.backgroundColor};
    --ag-foreground-color: ${merged.color || defaultStyleOptions.color};
    --ag-font-size: ${merged.fontSize || defaultStyleOptions.fontSize};
    --ag-font-family: ${merged.fontFamily || defaultStyleOptions.fontFamily};

    /* Border */
    --ag-border-color: ${merged.borderColor || defaultStyleOptions.borderColor};
    --ag-border-width: ${merged.borderWidth || defaultStyleOptions.borderWidth};
    --ag-border-radius: ${merged.borderRadius ||
    defaultStyleOptions.borderRadius};

    /* Spacing */
    --ag-row-height: ${merged.rowHeight || defaultStyleOptions.rowHeight};
    --ag-header-height: ${merged.headerHeight ||
    defaultStyleOptions.headerHeight};
    --ag-cell-horizontal-padding: ${merged.cellPadding ||
    defaultStyleOptions.cellPadding};
    --ag-header-cell-horizontal-padding: ${merged.headerPadding ||
    defaultStyleOptions.headerPadding};

    /* Header */
    --ag-header-background-color: ${merged.headerBackgroundColor ||
    defaultStyleOptions.headerBackgroundColor};
    --ag-header-foreground-color: ${merged.headerColor ||
    defaultStyleOptions.headerColor};
    --ag-header-font-size: ${merged.headerFontSize ||
    defaultStyleOptions.headerFontSize};
    --ag-header-font-weight: ${merged.headerFontWeight ||
    defaultStyleOptions.headerFontWeight};
    --ag-header-cell-hover-background-color: ${merged.hoverRowBackgroundColor ||
    defaultStyleOptions.hoverRowBackgroundColor};

    /* Cells */
    --ag-odd-row-background-color: ${merged.oddRowBackgroundColor ||
    defaultStyleOptions.oddRowBackgroundColor};
    --ag-row-hover-color: ${merged.hoverRowBackgroundColor ||
    defaultStyleOptions.hoverRowBackgroundColor};
    --ag-selected-row-background-color: ${merged.selectedRowBackgroundColor ||
    defaultStyleOptions.selectedRowBackgroundColor};
    --ag-range-selection-background-color: ${merged.selectedRowBackgroundColor ||
    defaultStyleOptions.selectedRowBackgroundColor};

    /* Icons */
    --ag-icon-color: ${merged.iconColor || defaultStyleOptions.iconColor};
    --ag-icon-size: ${merged.iconSize || defaultStyleOptions.iconSize};
    --ag-icon-hover-color: ${merged.iconHoverColor ||
    defaultStyleOptions.iconHoverColor};
  `;
};

export const StyledAgGridContainer = styled.div<{
  $styleOptions?: AgGridStyleOptions;
}>`
  ${({ $styleOptions }) => getStyleVariables($styleOptions || undefined)}

  /* 높이 계산에 패딩과 보더 포함 */
  box-sizing: border-box;

  /* 넘치는 내용 숨기기 (그리드는 내부에서 스크롤 처리) */
  overflow: hidden;

  /* 플렉스 레이아웃으로 툴바와 그리드 분리 */
  display: flex;
  flex-direction: column;

  padding: ${({ $styleOptions }) =>
    $styleOptions?.padding ?? defaultStyleOptions.padding};
  border: ${({ $styleOptions }) =>
      $styleOptions?.borderWidth ?? defaultStyleOptions.borderWidth}
    ${({ $styleOptions }) =>
      $styleOptions?.borderStyle ?? defaultStyleOptions.borderStyle}
    ${({ $styleOptions }) =>
      $styleOptions?.borderColor ?? defaultStyleOptions.borderColor};
  border-radius: ${({ $styleOptions }) =>
    $styleOptions?.borderRadius ?? defaultStyleOptions.borderRadius};

  /* AgGrid 루트 요소가 컨테이너 내부에서 올바르게 크기 조정되도록 */
  .ag-root-wrapper {
    flex: 1;
    min-height: 0;
    height: 100%;
  }

  /* 헤더 텍스트 정렬 (변수로 제어 가능) */
  .ag-header-cell-text {
    text-align: ${({ $styleOptions }) =>
      $styleOptions?.headerTextAlign || "center"} !important;
    width: 100%;
  }

  /* 헤더별 정렬 (headerClass 기반) */
  .ag-header-cell-left .ag-header-cell-text {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  .ag-header-cell-right .ag-header-cell-text {
    text-align: right !important;
    justify-content: flex-end !important;
  }

  /* 헤더별 정렬 (headerClass 기반) */
  .ag-header-cell-left .ag-header-cell-text {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  .ag-header-cell-right .ag-header-cell-text {
    text-align: right !important;
    justify-content: flex-end !important;
  }

  /* AG-Grid 셀 스타일 커스터마이징 */
  .ag-cell {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.cellBackgroundColor ??
      defaultStyleOptions.cellBackgroundColor};
    color: ${({ $styleOptions }) =>
      $styleOptions?.cellColor ?? defaultStyleOptions.cellColor};
    border-color: ${({ $styleOptions }) =>
      $styleOptions?.cellBorderColor ?? defaultStyleOptions.cellBorderColor};
    border-width: ${({ $styleOptions }) =>
      $styleOptions?.cellBorderWidth ?? defaultStyleOptions.cellBorderWidth};
    /* 기본 중앙 정렬 (낮은 우선순위) */
    text-align: center;
  }

  /* 짝수 행 배경색 (클릭되지 않은 경우만) */
  .ag-row-even:not(.ag-row-clicked) {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.evenRowBackgroundColor ??
      defaultStyleOptions.evenRowBackgroundColor};
  }

  /* 홀수 행 배경색 (클릭되지 않은 경우만) */
  .ag-row-odd:not(.ag-row-clicked) {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.oddRowBackgroundColor ??
      defaultStyleOptions.oddRowBackgroundColor};
  }

  /* 헤더 스타일 */
  .ag-header-cell {
    background-color: ${({ $styleOptions }) =>
      $styleOptions?.headerBackgroundColor ??
      defaultStyleOptions.headerBackgroundColor};
    color: ${({ $styleOptions }) =>
      $styleOptions?.headerColor ?? defaultStyleOptions.headerColor};
    font-size: ${({ $styleOptions }) =>
      $styleOptions?.headerFontSize ?? defaultStyleOptions.headerFontSize};
    font-weight: ${({ $styleOptions }) =>
      $styleOptions?.headerFontWeight ?? defaultStyleOptions.headerFontWeight};
    border-color: ${({ $styleOptions }) =>
      $styleOptions?.headerBorderColor ??
      defaultStyleOptions.headerBorderColor};
    border-width: ${({ $styleOptions }) =>
      $styleOptions?.headerBorderWidth ??
      defaultStyleOptions.headerBorderWidth};
  }

  /* ag-grid 헤더 필수 표시 */
  .ag-header-cell.required-header .ag-header-cell-text::before,
  .ag-theme-quartz .ag-header-cell.required-header .ag-header-cell-text::before,
  .ag-theme-legacy
    .ag-header-cell.required-header
    .ag-header-cell-text::before {
    content: "*";
    color: #ff4d4f;
    margin-right: 4px;
    font-weight: bold;
    display: inline-block;
  }

  /* 아이콘 스타일 */
  .ag-icon {
    color: ${({ $styleOptions }) =>
      $styleOptions?.iconColor ?? defaultStyleOptions.iconColor};
    font-size: ${({ $styleOptions }) =>
      $styleOptions?.iconSize ?? defaultStyleOptions.iconSize};
  }

  .ag-icon:hover {
    color: ${({ $styleOptions }) =>
      $styleOptions?.iconHoverColor ?? defaultStyleOptions.iconHoverColor};
  }

  /* 그리드 선택 행 스타일 (클릭되지 않은 경우만) - 최고 우선순위 */
  .ag-row-selected:not(.ag-row-clicked),
  .ag-row.ag-row-selected:not(.ag-row-clicked),
  .ag-row-even.ag-row-selected:not(.ag-row-clicked),
  .ag-row-odd.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-quartz .ag-row-selected:not(.ag-row-clicked),
  .ag-theme-legacy .ag-row-selected:not(.ag-row-clicked),
  .ag-theme-quartz .ag-row.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-legacy .ag-row.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-quartz .ag-row-even.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-legacy .ag-row-even.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-quartz .ag-row-odd.ag-row-selected:not(.ag-row-clicked),
  .ag-theme-legacy .ag-row-odd.ag-row-selected:not(.ag-row-clicked) {
    background-color: #000 !important;
  }

  /* 선택된 행의 셀에도 색상 적용 */
  .ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-row.ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-row-even.ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-row-odd.ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-theme-quartz .ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-theme-legacy .ag-row-selected:not(.ag-row-clicked) .ag-cell {
    background-color: #e6f7ff !important;
  }

  .ag-row-selected:not(.ag-row-clicked):hover,
  .ag-row-even.ag-row-selected:not(.ag-row-clicked):hover,
  .ag-row-odd.ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-quartz .ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-legacy .ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-quartz .ag-row-even.ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-legacy .ag-row-even.ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-quartz .ag-row-odd.ag-row-selected:not(.ag-row-clicked):hover,
  .ag-theme-legacy .ag-row-odd.ag-row-selected:not(.ag-row-clicked):hover {
    background-color: #bae7ff !important;
  }

  /* 그리드 클릭된 행 스타일 (선택 여부와 관계없이) - 최고 우선순위 */
  /* 짝수/홀수 행과 선택된 행 스타일보다 우선하도록 더 구체적인 선택자 사용 */
  /* 모든 가능한 선택자 조합을 사용하여 확실하게 적용 */
  .ag-row.ag-row-clicked,
  .ag-row-clicked,
  .ag-row-even.ag-row-clicked,
  .ag-row-odd.ag-row-clicked,
  .ag-row-selected.ag-row-clicked,
  .ag-row-even.ag-row-selected.ag-row-clicked,
  .ag-row-odd.ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row.ag-row-clicked,
  .ag-theme-legacy .ag-row.ag-row-clicked,
  .ag-theme-quartz .ag-row-clicked,
  .ag-theme-legacy .ag-row-clicked,
  .ag-theme-quartz .ag-row-even.ag-row-clicked,
  .ag-theme-legacy .ag-row-even.ag-row-clicked,
  .ag-theme-quartz .ag-row-odd.ag-row-clicked,
  .ag-theme-legacy .ag-row-odd.ag-row-clicked,
  .ag-theme-quartz .ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row-selected.ag-row-clicked {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }

  /* 셀에도 색상 적용 */
  .ag-row.ag-row-clicked .ag-cell,
  .ag-row-clicked .ag-cell,
  .ag-row-even.ag-row-clicked .ag-cell,
  .ag-row-odd.ag-row-clicked .ag-cell,
  .ag-row-selected.ag-row-clicked .ag-cell,
  .ag-theme-quartz .ag-row.ag-row-clicked .ag-cell,
  .ag-theme-legacy .ag-row.ag-row-clicked .ag-cell {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }

  .ag-row.ag-row-clicked:hover,
  .ag-row-clicked:hover,
  .ag-row-even.ag-row-clicked:hover,
  .ag-row-odd.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-even.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-even.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-odd.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-odd.ag-row-clicked:hover {
    background-color: #bae7ff !important;
  }

  /* 선택된 행이면서 클릭된 행인 경우 - 클릭 스타일이 우선 (더 구체적인 선택자) */
  .ag-row.ag-row-selected.ag-row-clicked,
  .ag-row-selected.ag-row-clicked,
  .ag-row-even.ag-row-selected.ag-row-clicked,
  .ag-row-odd.ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row.ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row.ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row-even.ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row-even.ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row-odd.ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row-odd.ag-row-selected.ag-row-clicked {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }

  .ag-row.ag-row-selected.ag-row-clicked:hover,
  .ag-row-selected.ag-row-clicked:hover,
  .ag-row-even.ag-row-selected.ag-row-clicked:hover,
  .ag-row-odd.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-selected.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-selected.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-even.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-even.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-quartz .ag-row-odd.ag-row-selected.ag-row-clicked:hover,
  .ag-theme-legacy .ag-row-odd.ag-row-selected.ag-row-clicked:hover {
    background-color: #bae7ff !important;
  }

  /* 삭제된 행 스타일 - 최고 우선순위 (모든 다른 스타일보다 우선) */
  .ag-row.ag-row-deleted,
  .ag-row-deleted,
  .ag-row-even.ag-row-deleted,
  .ag-row-odd.ag-row-deleted,
  .ag-row-selected.ag-row-deleted,
  .ag-row-clicked.ag-row-deleted,
  .ag-row-even.ag-row-selected.ag-row-deleted,
  .ag-row-odd.ag-row-selected.ag-row-deleted,
  .ag-row-even.ag-row-clicked.ag-row-deleted,
  .ag-row-odd.ag-row-clicked.ag-row-deleted,
  .ag-theme-quartz .ag-row.ag-row-deleted,
  .ag-theme-legacy .ag-row.ag-row-deleted,
  .ag-theme-quartz .ag-row-deleted,
  .ag-theme-legacy .ag-row-deleted,
  .ag-theme-quartz .ag-row-even.ag-row-deleted,
  .ag-theme-legacy .ag-row-even.ag-row-deleted,
  .ag-theme-quartz .ag-row-odd.ag-row-deleted,
  .ag-theme-legacy .ag-row-odd.ag-row-deleted,
  .ag-theme-quartz .ag-row-selected.ag-row-deleted,
  .ag-theme-legacy .ag-row-selected.ag-row-deleted,
  .ag-theme-quartz .ag-row-clicked.ag-row-deleted,
  .ag-theme-legacy .ag-row-clicked.ag-row-deleted {
    background-color: #f0f0f0 !important;
    color: #999999 !important;
    text-decoration: line-through !important;
  }

  /* 삭제된 행의 셀에도 색상 적용 */
  .ag-row.ag-row-deleted .ag-cell,
  .ag-row-deleted .ag-cell,
  .ag-row-even.ag-row-deleted .ag-cell,
  .ag-row-odd.ag-row-deleted .ag-cell,
  .ag-row-selected.ag-row-deleted .ag-cell,
  .ag-row-clicked.ag-row-deleted .ag-cell,
  .ag-theme-quartz .ag-row.ag-row-deleted .ag-cell,
  .ag-theme-legacy .ag-row.ag-row-deleted .ag-cell {
    background-color: #f0f0f0 !important;
    color: #999999 !important;
    text-decoration: line-through !important;
  }

  .ag-row.ag-row-deleted:hover,
  .ag-row-deleted:hover,
  .ag-row-even.ag-row-deleted:hover,
  .ag-row-odd.ag-row-deleted:hover,
  .ag-theme-quartz .ag-row.ag-row-deleted:hover,
  .ag-theme-legacy .ag-row.ag-row-deleted:hover {
    background-color: #f0f0f0 !important;
  }

  /* js */
  &.ag-theme-quartz {
    border: none;
    padding: 0;
    border-radius: 0;
  }
  .ag-root-wrapper {
    border-radius: 0;
    border: none;
  }
  .ag-header {
    border-top: 1px solid ${({ theme }) => theme.colors.neutral[600]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
    &-cell {
      background-color: #fafafa;
      font-size: 12px;
      font-weight: 400;
      color: ${({ theme }) => theme.colors.neutral[800]};
      &-resize::after {
        width: 1px;
        background-color: #e3e4e6;
      }
      &-menu-button:hover,
      &-filter-button:hover {
        background-color: transparent;
        box-shadow: none;
      }
    }
    & .ag-header-menu-icon {
      margin-left: 5px !important;
    }
    & .ag-filter-active::after {
      width: 4px;
      height: 4px;
      background-color: ${({ theme }) => theme.colors.navy};
    }
    .ag-icon,
    .ag-icon-menu-alt,
    .ag-icon-filter {
      font-size: 12px;
    }
    .ag-pinned-left-header {
      border-right-color: ${({ theme }) => theme.colors.neutral[200]};
    }
    .ag-filter-active {
      background-color: transparent;
    }
  }
  .ag-row {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  }
  .ag-cell {
    border: none;
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.neutral[600]};
  }
  .ag-checkbox-input-wrapper.ag-indeterminate::before {
    content: "";
  }
  .ag-checkbox-input-wrapper.ag-indeterminate::after {
    content: "";
    /* border: 1px solid ${({ theme }) => theme.colors.grey[300]}; */
    font-family: "remixicon";
    content: "\\F1AF";
    font-style: normal;
    font-weight: normal;
    background-color: ${({ theme }) => theme.colors.grey[300]};
    color: #fff;
  }

  .ag-checkbox-input-wrapper::after {
    content: "";
  }
  .ag-checkbox-input-wrapper::before {
    border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  }
  .ag-checkbox-input-wrapper.ag-checked::after {
    font-family: "remixicon";
    content: "\\EB7B";
    font-style: normal;
    font-weight: 600;
    background-color: #35507d;
    color: #fff;
    font-size: 12px;
    width: 16px;
    height: 16px;
    text-align: center;
  }
  .ag-checkbox-input-wrapper:focus-within {
    /* box-shadow: 0 0 0 3px rgba(53, 80, 125, 0.2); */
    box-shadow: none;
  }

  .ag-menu {
    background-color: #fff;
    font-family: "Pretendard";
    box-shadow: none;
    border-color: ${({ theme }) => theme.colors.grey[200]};
    &-option-active {
      background-color: ${({ theme }) => theme.colors.neutral[200]};
    }
    &-option-text {
      font-size: 12px;
      font-weight: 400;
      color: ${({ theme }) => theme.colors.neutral[700]} !important;
    }
    & .ag-input-field-input,
    & .ag-picker-field-wrapper {
      border-radius: 2px !important;
      &:focus {
        box-shadow: none;
        border: 1px solid ${({ theme }) => theme.colors.neutral[700]};
      }
    }
    .ag-picker-field-display {
      font-size: 12px;
    }
    & .ag-input-field-label {
      font-size: 13px;
      font-weight: 400;
      color: ${({ theme }) => theme.colors.neutral[700]};
    }
    .ag-filter-virtual-list-item {
      & + .ag-filter-virtual-list-item {
      }
    }
  }

  /* 셀에도 색상 적용 */
  .ag-row.ag-row-clicked .ag-cell,
  .ag-row-clicked .ag-cell,
  .ag-row-even.ag-row-clicked .ag-cell,
  .ag-row-odd.ag-row-clicked .ag-cell,
  .ag-row-selected.ag-row-clicked .ag-cell,
  .ag-theme-quartz .ag-row.ag-row-clicked .ag-cell {
    background-color: #f9fafb !important;
    /* font-weight: 500; */
    /* color: ${({ theme }) => theme.colors.neutral[800]} !important; */
  }

  .ag-row.ag-row-clicked .ag-cell,
  .ag-row-clicked .ag-cell,
  .ag-row-even.ag-row-clicked .ag-cell {
    color: ${({ theme }) => theme.colors.neutral[800]} !important;
  }
  .ag-row-selected .ag-cell {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.neutral[800]} !important;
  }
  .ag-row-selected.ag-row-clicked .ag-cell {
    font-weight: 500;
  }

  .ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-row.ag-row-selected:not(.ag-row-clicked) .ag-cell,
  .ag-row-even.ag-row-selected:not(.ag-row-clicked) .ag-cell {
    background-color: #f9fafb !important;
  }
  .ag-ltr .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
    border: 1px solid ${({ theme }) => theme.colors.neutral[600]};
  }

  .ag-cell-inline-editing {
    border-radius: 0;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.colors.neutral[500]} !important;
    & .ant-select-outlined {
      border: none;
      &.ant-select-open {
        & .ant-select-content-value {
          font-size: 12px;
          line-height: 34px;
        }
      }
    }
    .ag-input-field-input,
    .ag-input-field-input:focus,
    .ag-input-field-input:focus-within {
      font-size: 12px;
      border: none;
      border-radius: 0;
      box-shadow: none;
    }

    .ag-ltr .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
      border-right-color: ${({ theme }) => theme.colors.neutral[500]};
    }
  }
  .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(
      .ag-cell-range-single-cell
    ) {
    border-right-color: ${({ theme }) => theme.colors.neutral[200]};
  }
`;

// 그리드 툴바 스타일
export const StyledGridToolbar = styled.div`
  width: 100%;
  flex-shrink: 0; /* 툴바가 축소되지 않도록 */
  .data-grid-panel {
    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 5px;
      height: 14px;
    }
    &__toolbar {
      ${mixins.flex("center", "space-between", "row")}
      margin-bottom: 10px;
    }
    &-left {
      ${mixins.flex("center", "flex-start", "row")}
      .data-grid-panel__button {
        & + .data-grid-panel__button:not(.data-grid-panel__button--more) {
          margin-left: 5px;
        }
        &.data-grid-panel__button--more {
          &:hover {
            border: none;
          }
        }
      }
      .data-grid-panel__divider {
        margin: 0 10px;
      }
    }
    &-right {
      ${mixins.flex("center", "flex-start", "row", "5px")}
      .ant-btn-icon-only {
        box-shadow: none;
        i {
          color: ${({ theme }) => theme.colors.grey[500]};
        }
        &:hover {
          border: none;
          i {
            color: ${({ theme }) => theme.colors.grey[800]};
          }
        }
      }
    }
    &__count {
      white-space: nowrap;
      font-size: 11px;
      color: ${({ theme }) => theme.colors.neutral[500]};
      &-number {
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
    }
    &__icon {
      font-size: 20px;
      &--small {
        font-size: 16px;
      }
    }
  }
`;
