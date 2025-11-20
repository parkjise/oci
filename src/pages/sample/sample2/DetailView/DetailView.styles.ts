import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailViewStyles = styled.div`
  &.page-layout__detail-view {
    ${mixins.flex("flex-start", "flex-start", "column", "10px")}
    ${mixins.Card()}
    height: fit-content;
    box-sizing: border-box;
  }
  .detail-view {
    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 10px;
    }
    &__actions {
      width: 100%;
      ${mixins.flex("center", "space-between")}
      &-group {
        &--left {
          ${mixins.flex("center", "flex-start", "", "5px")}
          .detail-view__divider {
            height: 10px;
          }
        }
        &--right {
          ${mixins.flex("center", "flex-start", "", "5px")}
        }
      }
    }
    &__button {
      &--more {
        border: none;
      }
    }
    &__table {
      width: 100%;
      overflow: hidden;
      table {
        width: 100%;
        border: 1px solid ${({ theme }) => theme.colors.grey[100]};
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 13px;
        th,
        td {
          height: 36px;
          text-align: left;
          padding-left: 10px;
          background-color: ${({ theme }) => theme.colors.white};
        }
        th {
          width: 100px;
          background-color: ${({ theme }) => theme.colors.neutral[100]};
          color: ${({ theme }) => theme.colors.neutral[800]};
          border-right: 1px solid ${({ theme }) => theme.colors.grey[100]};
          border-left: 1px solid ${({ theme }) => theme.colors.grey[100]};
          border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
          font-weight: 400;
          &:first-child {
            border-left: none;
          }
        }
        td {
          color: ${({ theme }) => theme.colors.neutral[600]};
          border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
        }
        tr:last-child {
          th,
          td {
            &:last-child {
              border-bottom: none;
            }
          }
        }
      }
    }
  }
`;
