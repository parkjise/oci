import styled from "styled-components";
import * as mixins from "@/styles/mixins";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
export const AuthzStyles = styled(Article)`
  /* 권한관리 */
  &.authz {
    flex-direction: row;
    .ant-btn {
      height: 28px;
    }
  }
  .authz {
    /* left */
    &__column {
      width: 100%;
      &--list {
        width: 25%;
        height: 100%;
        min-height: 0;
        ${mixins.flex("flex-start", "flex-start", "column", "10px")}
      }
      &--detail {
        ${mixins.flex("flex-start", "flex-start", "column", "10px")}
        height: 100%;
      }
    }
    &__header {
      width: 100%;
      flex: 0 0 auto;
      &--list {
        ${mixins.flex("center", "space-between", "row")}
      }
      &--detail {
        ${mixins.flex("center", "space-between", "row")}
      }
    }
    &__body {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      ${mixins.scrollbar()}
      scrollbar-gutter: auto;
      box-sizing: border-box;
      &--list {
        width: 100%;
        height: 100%;
      }
      &--detail {
        width: 100%;
        height: 100%;
        ${mixins.flex("flex-start", "flex-start", "row", "10px")}
      }
    }
    &__tree {
      height: 100%;
      overflow-y: auto;
    }
    /* right */
    &__meta {
      ${mixins.flex("center", "flex-start", "row", "40px")}
      &-item {
        ${mixins.flex("center", "flex-start", "row", "20px")}
        &--name {
          ${mixins.flex("center", "flex-start", "row", "5px")}
          .authz__meta-label {
            padding-right: 10px;
          }
        }
      }
      &-label {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.neutral[600]};
      }
      &-value {
        font-size: 14px;
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
      & .divider {
        width: 1px;
        height: 15px;
        background-color: ${({ theme }) => theme.colors.neutral[300]};
      }
    }
    &__pane {
      ${mixins.flex("flex-start", "flex-start", "column", "10px")}
      &--roles,
      &--menus {
        width: 30%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      &--roles {
        flex: 1;
      }
    }
    &__toolbar {
      width: 100%;
      flex: 0 0 auto;
      ${mixins.flex("center", "space-between")}
    }
    &__actions {
      ${mixins.flex("center", "flex-start", "row", "5px")}
    }
    &__content {
      &--menus {
        width: 100%;
        height: 100%;
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        box-sizing: border-box;
        ${mixins.scrollbar()}
        scrollbar-gutter: auto;
      }
    }
  }
`;
