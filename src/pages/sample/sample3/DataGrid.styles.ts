import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const DataGridStyles = styled.div`
  width: 100%;
  .data-grid-panel {
    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 10px;
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
      }
    }
    &-right {
      ${mixins.flex("center", "flex-start", "row", "5px")}
      .ant-btn {
        box-shadow: none;
        &-icon {
          i {
            color: ${({ theme }) => theme.colors.grey[500]};
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
  }
`;
