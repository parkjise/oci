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
          ${mixins.flex("center", "flex-start", "row", "5px")}
          .detail-view__divider {
            height: 10px;
          }
        }
        &--right {
          ${mixins.flex("center", "flex-start", "row", "5px")}
        }
      }
    }
    &__more-container {
      position: relative;
      display: inline-block;
    }
    &__more-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.grey[200]};
      border-radius: 4px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 80px;
      white-space: nowrap;
    }
    &__button {
      &--more {
        border: none;
      }
      &--save {
        &.ant-btn-primary {
          color: white !important;
          &,
          &:hover,
          &:focus,
          &:active,
          &:hover:not(:disabled),
          &:focus:not(:disabled),
          &:active:not(:disabled) {
            color: white !important;
            span,
            .anticon {
              color: white !important;
            }
          }
          > span {
            color: white !important;
          }
        }
      }
    }
    &__table {
      width: 100%;

      .detail-view__inputs-inline {
        display: flex;
        gap: 6px;
        align-items: center;
        width: 100%;

        .ant-form-item {
          flex: 1;
          min-width: 0;

          &:first-of-type {
            flex: 1;
            min-width: 0;
          }
        }

        .detail-view__input {
          flex: 1;
          min-width: 0;
        }
      }

      table {
        width: 100%;
        border: 1px solid ${({ theme }) => theme.colors.grey[100]};
        border-collapse: collapse;
        table-layout: auto;
        font-size: 13px;
        th,
        td {
          min-height: 40px;
          text-align: left;
          padding-left: 10px;
          background-color: ${({ theme }) => theme.colors.white};
        }
        th {
          width: 120px;
          background-color: ${({ theme }) => theme.colors.neutral[100]};
          color: ${({ theme }) => theme.colors.neutral[800]};
          border-right: 1px solid ${({ theme }) => theme.colors.grey[100]};
          border-left: 1px solid ${({ theme }) => theme.colors.grey[100]};
          border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
          font-weight: 400;
          padding: 8px 12px;
          &:first-child {
            border-left: none;
          }
        }
        td {
          color: ${({ theme }) => theme.colors.neutral[600]};
          border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};
          padding: 8px 12px;
          .ant-form-item {
            margin-bottom: 0;
            flex: 1;
            display: flex;
            align-items: center;
            width: 100%;

            .detail-view__input {
              width: 100%;
            }
          }

          .ant-form-item-control {
            flex: 1;
            width: 100%;
          }

          .ant-form-item-control-input {
            min-height: auto;
            width: 100%;
          }

          .ant-form-item-control-input-content {
            display: flex;
            width: 100%;
          }

          .detail-view__text {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            font-size: 13px;
            line-height: 20px;
            padding: 4px 8px;
            box-sizing: border-box;
            width: 100%;
          }
          
          // 두 개의 input이 있는 경우를 위한 div 스타일
          > div {
            display: flex;
            gap: 6px;
            align-items: center;
            width: 100%;
            
            // 조회 모드일 때 텍스트 간격
            > span {
              display: inline-block;
              line-height: 1.5;
              &:first-child {
                min-width: 80px;
                font-weight: 500;
              }
            }
            
            // 편집 모드일 때 input 스타일
            .detail-view__input {
              border: 1px solid ${({ theme }) => theme.colors.grey[300]};
              border-radius: 4px;
              padding: 4px 8px;
              margin: 0;
              background: ${({ theme }) => theme.colors.white};
              height: 28px;
              font-size: 13px;
              line-height: 20px;
              &:focus {
                border-color: #1890ff;
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                outline: none;
              }
              &:hover {
                border-color: #1890ff;
              }
            }
          }
          
          // 단일 input인 경우 (div 없이 직접 td에 있는 경우)
          > .detail-view__input {
            width: 100%;
            border: 1px solid ${({ theme }) => theme.colors.grey[300]};
            border-radius: 4px;
            padding: 4px 8px;
            margin: 0;
            background: ${({ theme }) => theme.colors.white};
            height: 28px;
            font-size: 13px;
            line-height: 20px;
            box-sizing: border-box;
            &.detail-view__input--readonly-accent[readonly] {
              background-color: #f4f6fb;
              border-color: #c3d4f0;
              color: #1d3a6b;
              font-weight: 600;
            }
            &:focus {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
              outline: none;
            }
            &:hover {
              border-color: #1890ff;
            }
          }

          .detail-view__gl-slip {
            width: 100%;
            .detail-view__input {
              cursor: default;
            }
            &--active {
              cursor: pointer;
              .detail-view__input {
                cursor: pointer;
              }
            }
          }
        }

        .detail-view__description-expand {
          width: 100%;

          .detail-view__input--description {
            width: 100%;
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
      }
    }
  }
`;
