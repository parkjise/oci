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
    &__status {
      &-tag {
        font-size: 11px;
        border: none;
        border-radius: 4px;
        margin-inline-end: 0;
        padding-inline: 8px;
        padding-block: 2px;
        font-weight: 500;
        &--done {
          background-color: #f0f9ff;
          color: #005eac;
        }
        &--approved {
          background-color: #fef4e4;
          color: #f7b84b;
        }
        &--pending {
          background-color: #fff1ee;
          color: #f06548;
        }
      }
    }
    &__actions {
      width: 100%;
      ${mixins.flex("center", "space-between")}
      &-group {
        &--left {
          ${mixins.flex("center", "flex-start", "row", "5px")}
          .detail-view__divider {
            height: 10px;
          }
          .form-input {
            &--search {
              .ant-input {
                padding-block: 2px;
                &::placeholder {
                  font-size: 11px;
                }
              }
              .ant-btn {
                height: 28px;
                width: 28px;
              }
            }
          }
        }
        &--right {
          ${mixins.flex("center", "flex-start", "row", "5px")}
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
    &__attachment {
      position: relative;
      &--badge {
        position: absolute;
        top: -6px;
        right: -22px;
        .ant-scroll-number {
          color: ${({ theme }) => theme.colors.white};
          font-size: 11px;
        }
        .ant-badge {
          &-multiple-words {
            padding: 0 6px;
          }
        }
      }
    }
  }
`;
