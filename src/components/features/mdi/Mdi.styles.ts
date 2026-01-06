import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const MdiStyles = styled.section`
  padding: 0 20px;
  background-color: #fdfdfd;
  height: 50px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  ${mixins.flex("center", "space-between", "row")};
  .mdi-bar {
    &__title {
      ${mixins.flex("center", "flex-start", "row", "5px")}
      &-text {
        font-size: 14px;
        font-weight: 500;
      }
      &-icon {
        border: none;
        box-shadow: none;
        i {
          font-size: 20px;
          &:hover:not(.ri-arrow-drop-right-line, .ri-star-fill) {
            color: ${({ theme }) => theme.colors.neutral[800]};
          }
        }
        &--home {
          color: ${({ theme }) => theme.colors.grey[500]};
        }
        &--separator {
          padding-top: 2px;
          color: ${({ theme }) => theme.colors.neutral[500]};
        }
        &--bookmark {
          &.active {
            i {
              color: #fdc700;
            }
          }
        }
        &--manual {
          padding-top: 3px;
        }
        &.ant-btn:not(:disabled):hover,
        &.ant-btn:not(:disabled):active,
        &.ant-btn:not(:disabled):focus {
          border: none;
          color: ${({ theme }) => theme.colors.neutral[800]};
        }
      }
      &-actions {
        padding-left: 5px;
        ${mixins.flex("center", "flex-start", "row")}
        .ant-btn {
          width: 24px;
          height: 24px;
          .ant-wave {
            display: none !important;
          }
        }
        i {
          color: ${({ theme }) => theme.colors.neutral[400]};
          font-size: 18px;
        }
      }
    }
    &__controls {
      ${mixins.flex("center", "flex-start", "row", "5px")}
    }
    &__tab-list {
      ${mixins.flex("center", "flex-start", "row", "5px")}
    }
    &__tab {
      ${mixins.flex("center", "flex-start", "row")};
      border: 1px solid ${({ theme }) => theme.colors.grey[200]};
      border-radius: 2px;
      background-color: ${({ theme }) => theme.colors.white};
      height: 28px;
      /* min-width: 100px; */
      cursor: pointer;
      &-label {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.neutral[600]};
        padding-inline: 10px;
        line-height: 28px;
      }
      .ant-btn {
        width: 24px;
        height: 24px;
        opacity: 0;
        border: none;
        background-color: transparent;
        .ant-wave {
          display: none !important;
        }
        &:not(:disabled):hover,
        &:not(:disabled):active,
        &:not(:disabled):focus {
          border: none;
          color: ${({ theme }) => theme.colors.neutral[800]};
        }
      }
      i {
        color: ${({ theme }) => theme.colors.neutral[400]};
        font-size: 16px;
      }
      &:hover {
        .ant-btn {
          opacity: 1;
        }
        border: 1px solid ${({ theme }) => theme.colors.neutral[800]};
        .mdi-bar__tab-label {
          color: ${({ theme }) => theme.colors.neutral[900]};
        }
      }
      &--active {
        background-color: ${({ theme }) => theme.colors.mdi};
        border: 1px solid ${({ theme }) => theme.colors.mdi};
        .ant-btn {
          opacity: 1;
          i {
            color: ${({ theme }) => theme.colors.white};
          }
        }
        .mdi-bar__tab-label {
          color: ${({ theme }) => theme.colors.white};
        }
        &:hover {
          .ant-btn {
            &:not(:disabled):hover,
            &:not(:disabled):active,
            &:not(:disabled):focus {
              border: none;
              color: ${({ theme }) => theme.colors.white};
            }
          }
          .ant-btn {
            opacity: 1;
            background-color: transparent;
            i {
              color: ${({ theme }) => theme.colors.white};
            }
          }
          .mdi-bar__tab-label {
            color: ${({ theme }) => theme.colors.white};
          }
        }
      }
    }
    &__actions {
      ${mixins.flex("center", "flex-start", "row", "5px")}
    }
    &__action {
      width: 28px;
      height: 28px;
    }
  }
`;
