import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const DataGridStyles = styled.div`
  width: 100%;
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
  .dg-panel {
    &__toolbar {
      ${mixins.flex("center", "flex-end", "row")}
      margin-bottom: 10px;
    }
  }
  /* grid */
  .ag-theme-quartz {
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
    /* .ag-input-field-input[class^="ag-"][type="text"],
    input[class^="ag-"][type="text"]:focus,
    input[class^="ag-"][type="text"]:focus-within {
      border: none;
      border-radius: 0;
      box-shadow: none;
    } */
  }

  /* .ag-cell.ag-cell-last-left-pinned {
    border-right-color: ${({ theme }) => theme.colors.neutral[500]};
  } */

  .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(
      .ag-cell-range-single-cell
    ) {
    border-right-color: ${({ theme }) => theme.colors.neutral[200]};
  }
  .ag-ltr .ag-cell-focus:not(.ag-cell-range-selected):focus-within {
    border-right-color: ${({ theme }) => theme.colors.neutral[500]};
  }
`;
