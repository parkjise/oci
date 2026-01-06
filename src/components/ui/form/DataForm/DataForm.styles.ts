import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DataFormStyles = styled.div`
  .ant-input,
  .ant-select,
  .ant-input-number,
  .ant-picker {
    height: 26px;
  }
  &.page-layout__detail-view {
    ${mixins.flex("flex-start", "flex-start", "column", "10px")}
    height: fit-content;
    box-sizing: border-box;
  }
  .detail-view {
    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 5px;
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
                height: 28px;
                &::placeholder {
                  font-size: 11px;
                }
              }
              .ant-btn {
                height: 28px;
                width: 28px;
                &:not(:disabled) {
                  &:hover,
                  &:active,
                  &:focus {
                    border-color: ${({ theme }) => theme.colors.neutral[800]};
                    color: ${({ theme }) => theme.colors.neutral[800]};
                  }
                }
              }
            }
          }
        }
        &--right {
          ${mixins.flex("center", "flex-start", "row", "5px")}
          > div {
            gap: 5px;
          }
          .action-button-group__button--more {
            border: none;
            &:hover {
              background: none;
              border: none !important;
            }
          }
        }
      }
    }
    &__department,
    &__user {
      white-space: nowrap;
    }
    &__button {
      &--more {
        border: none;
        &:hover {
          border: none !important;
        }
      }
    }
    &__table {
      width: 100%;
      table {
        width: 100%;
        border: 1px solid ${({ theme }) => theme.colors.grey[100]};
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 12px;
        th,
        td {
          height: 36px;
          text-align: left;
          padding-inline: 10px;
          background-color: ${({ theme }) => theme.colors.white};
          font-size: 12px;
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
          .ant-typography {
            font-size: 12px;
            color: ${({ theme }) => theme.colors.neutral[600]};
            font-weight: 400;
          }
        }
        tr:last-child {
          th,
          td {
            &:last-child {
              border-bottom: none;
            }
          }
        }

        // 아코디언 행 스타일
        .detail-view__accordion-row {
          transition:
            opacity 0.3s ease-in-out,
            max-height 0.3s ease-in-out;

          // 첫 번째 행(헤더)은 항상 표시
          &.accordion-header {
            display: table-row;
          }

          // 나머지 행들은 확장 상태에 따라 표시/숨김
          &.collapsed {
            display: none;
          }

          &.expanded {
            display: table-row;
          }

          th,
          td {
            // 아코디언 행의 셀 스타일은 기본 스타일 상속
          }
        }

        // 아코디언 토글 버튼 스타일
        .detail-view__accordion-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-left: 8px;
          padding: 0;
          border: none;
          background: transparent;
          color: ${({ theme }) => theme.colors.neutral[600]};
          cursor: pointer;
          transition: color 0.2s ease-in-out;

          &:hover {
            color: ${({ theme }) => theme.colors.neutral[800]};
          }

          &:focus {
            outline: 2px solid ${({ theme }) => theme.colors.neutral[400]};
            outline-offset: 2px;
            border-radius: 2px;
          }

          i {
            font-size: 16px;
            line-height: 1;
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
