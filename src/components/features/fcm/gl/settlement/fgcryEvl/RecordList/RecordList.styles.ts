import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const RecordListStyles = styled.div`
  height: 100%;
  ${mixins.Card()}
  display: flex;
  flex-direction: column;
  padding: 0;

  .record-list__header {
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .record-list__count {
      font-size: 13px;
      strong {
        font-weight: bold;
      }
    }

    .record-list__actions {
      display: flex;
      gap: 4px;

      .ant-btn {
        &.active {
          color: #1890ff;
          background-color: #e6f7ff;
        }
      }
    }
  }

  .record-list__content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;

    &:not(.record-list__content--grid) {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background-color: #f7f9fb;
      padding: 12px 16px;

      .record-item {
        background-color: #fff;
        border: 1px solid #e5e9f0;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
        padding: 8px 12px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
        }

        &.active {
          border-color: #1677ff;
          box-shadow: 0 8px 22px rgba(22, 119, 255, 0.18);
        }

        &.editing {
          background-color: #f0f8ff;
          border-color: #1890ff;
          border-left: 4px solid #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
        }

        &.editing.active {
          background-color: #e6f7ff;
          border-color: #1677ff;
          border-left: 4px solid #1677ff;
          box-shadow: 0 8px 22px rgba(22, 119, 255, 0.25);
        }

        &__line {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
        }

        &__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        &__line-first,
        &__line-second {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        &__value {
          position: relative;
          padding-left: 14px;
          color: #1f2937;
          font-weight: 500;
          white-space: nowrap;
          margin-right: 12px;
          
          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #d0d7e2;
          }
        }
      }
    }

    &--grid {
      padding: 0;
      overflow: hidden;

      .ag-theme-quartz {
        height: 100%;

        // Header 스타일 (DetailGrid와 동일)
        --ag-header-background-color: #f8f9fa;
        --ag-header-foreground-color: #666;
        --ag-header-cell-hover-background-color: #f0f0f0;

        .ag-header-cell-label {
          font-weight: 600;
          font-size: 13px;
          justify-content: center;
          text-align: center;
          display: flex;
          align-items: center;
        }

        // 선택된 행 스타일 강화
        .ag-row-selected {
          background-color: #fff7e6 !important;
          
          .ag-cell {
            background-color: #fff7e6 !important;
          }
        }

        // 행 호버 스타일
        .ag-row:hover {
          background-color: #fffbf0;
        }

        // 선택된 행 호버 스타일
        .ag-row-selected:hover {
          background-color: #ffe7ba !important;
          
          .ag-cell {
            background-color: #ffe7ba !important;
          }
        }
      }
    }
  }

  .record-item {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;

    &__line {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    &__value {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      margin-right: 12px;
    }

    &__label {
      font-weight: 500;
      color: #666;
      min-width: 60px;
    }

    &__value {
      color: #333;
    }

    &__id {
      font-weight: bold;
      margin-right: 8px;
      color: #333;
    }

    &__status {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: auto;

      &.blue { color: #1890ff; background: #e6f7ff; }
      &.orange { color: #fa8c16; background: #fff7e6; }
      &.red { color: #f5222d; background: #fff1f0; }
    }

    &__date {
      color: #999;
    }

    &__company {
      color: #666;
    }
  }
`;
