import { css } from "styled-components";
import * as mixins from "@/styles/mixins";

export const antdMdiTabsGlobal = css`
  .mdi-bar__tab-list-menu {
    background-color: ${({ theme }) => theme.colors.white};
    ${mixins.BoxShadow("0 1px 3px rgba(0, 0, 0, .08)")}
    max-height: 170px;
    overflow-y: auto;
    ${mixins.scrollbar()}
    &-item {
      padding: 0;
      li {
        list-style: none;
        padding-inline: 10px;
        padding-block: 5px;
        a {
          color: ${({ theme }) => theme.colors.neutral[600]};
          font-weight: 400;
          font-size: 12px;
          position: relative;
          padding: 5px 15px 5px 25px;
          width: 100%;
          display: block;
          &:before {
            position: absolute;
            top: 50%;
            left: 5px;
            transform: translateY(-50%);
            content: "\\ECED";
            font-family: "remixicon" !important;
            font-weight: normal;
            font-size: 14px;
            color: ${({ theme }) => theme.colors.neutral[500]};
          }
          &:hover {
            color: ${({ theme }) => theme.colors.neutral[800]};
            background-color: ${({ theme }) => theme.colors.neutral[200]};
            border-radius: 4px;
          }
          &:active {
            color: ${({ theme }) => theme.colors.neutral[800]};
          }
        }
      }
    }
  }
`;
