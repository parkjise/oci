import { css } from "styled-components";
// import { BoxShadow } from "@/styles/mixins";

export const antdTooltipGlobal = css`
  .ant-tooltip {
    font-size: 11px;
    .ant-tooltip-inner {
      min-height: 24px;
    }
    .ant-tooltip-container {
      min-height: 24px;
      border-radius: 2px;
      padding: 2px 8px;
      line-height: 20px;
    }
  }
`;
