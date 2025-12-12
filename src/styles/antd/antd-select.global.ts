import { css } from "styled-components";
import { BoxShadow } from "@/styles/mixins";

export const antdSelectGlobal = css`
  .ant-select-dropdown {
    border-radius: 2px;
    ${BoxShadow("0 1px 3px rgba(0, 0, 0, 0.06)")}
    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[300]};
    }
    .ant-select-item-option-content {
      font-size: 12px;
    }
  }
`;
