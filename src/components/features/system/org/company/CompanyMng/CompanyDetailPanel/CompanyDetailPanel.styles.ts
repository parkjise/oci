// ============================================================================
// 법인 상세 정보 패널 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import styled from "styled-components";

export const CompanyDetailPanelStyles = styled.div`
  padding: 16px 20px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${({ theme }) => theme?.colors?.neutral?.[50] || "#fafafa"};

  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-bottom: 0;
    text-align: left;

    > label {
      font-size: 13px;
      font-weight: 500;
      color: ${({ theme }) => theme?.colors?.neutral?.[700] || "#333"};
      height: 32px;
      line-height: 32px;
      white-space: nowrap;

      &.ant-form-item-required::before {
        display: none;
      }

      &.ant-form-item-required::after {
        display: none;
      }
    }
  }

  .ant-form-item-control {
    min-height: 32px;
  }

  .ant-form-item-control-input {
    min-height: 32px;
  }

  .ant-input,
  .ant-select-selector,
  .ant-picker {
    height: 32px;
    font-size: 13px;
  }

  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    line-height: 30px;
  }

  .ant-radio-group {
    display: flex;
    gap: 16px;
    align-items: center;

    .ant-radio-wrapper {
      margin-right: 0;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  /* 테이블 기반 레이아웃 */
  .company-detail__table {
    width: 100%;

    table {
      width: 100%;
      border: 1px solid
        ${({ theme }) =>
          theme?.colors?.grey?.[100] ||
          theme?.colors?.neutral?.[200] ||
          "#e5e5e5"};
      border-collapse: collapse;
      table-layout: auto;
      font-size: 13px;

      th,
      td {
        height: 36px;
        text-align: left;
        padding: 0 10px;
        background-color: ${({ theme }) => theme?.colors?.white || "#fff"};
        vertical-align: middle;
      }

      th {
        width: auto;
        min-width: 100px;
        background-color: ${({ theme }) =>
          theme?.colors?.neutral?.[100] || "#f5f5f5"};
        color: ${({ theme }) => theme?.colors?.neutral?.[800] || "#333"};
        border-right: 1px solid
          ${({ theme }) =>
            theme?.colors?.grey?.[100] ||
            theme?.colors?.neutral?.[200] ||
            "#e5e5e5"};
        border-bottom: 1px solid
          ${({ theme }) =>
            theme?.colors?.grey?.[100] ||
            theme?.colors?.neutral?.[200] ||
            "#e5e5e5"};
        border-left: 1px solid
          ${({ theme }) =>
            theme?.colors?.grey?.[100] ||
            theme?.colors?.neutral?.[200] ||
            "#e5e5e5"};
        font-weight: 400;
        white-space: nowrap;

        &:first-child {
          border-left: none;
        }

        &.signature-header {
          width: auto;
          min-width: 100px;
          text-align: center;
          vertical-align: top;
          padding-top: 8px;
        }

        .helptext {
          margin-left: 4px;
          display: inline-block;

          &.asterisk {
            color: ${({ theme }) => theme?.colors?.error?.[500] || "#ff4d4f"};
          }

          &.error {
            color: ${({ theme }) => theme?.colors?.error?.[500] || "#ff4d4f"};
          }

          &.question {
            color: ${({ theme }) => theme?.colors?.navy || "#1890ff"};
          }
        }
      }

      td {
        color: ${({ theme }) => theme?.colors?.neutral?.[600] || "#666"};
        border-bottom: 1px solid
          ${({ theme }) =>
            theme?.colors?.grey?.[100] ||
            theme?.colors?.neutral?.[200] ||
            "#e5e5e5"};

        /* 빈 셀은 최소 너비만 유지 */
        &:empty {
          width: 0;
          min-width: 0;
          padding: 0;
        }

        &.signature-cell {
          vertical-align: top;
          padding: 8px;
          width: 200px;
          min-width: 200px;
        }

        /* 마지막 행의 마지막 셀은 나머지 공간을 채움 */
        tr:last-child td:last-child {
          width: auto;
        }

        .ant-form-item {
          margin-bottom: 0;
          width: 100%;

          .ant-form-item-label {
            display: none;
          }

          .ant-form-item-control {
            width: 100%;
          }

          .ant-form-item-control-input {
            width: 100%;
          }
        }

        .ant-radio-group {
          margin: 0;
        }

        .ant-input,
        .ant-select-selector,
        .ant-picker {
          border: none;
          padding: 0;
          background: transparent;
          box-shadow: none;
          height: auto;
          width: 100%;

          &:focus,
          &:hover {
            border: none;
            box-shadow: none;
          }
        }

        /* Form.Item 전체 너비 설정 - 더 구체적인 선택자 사용 */
        .ant-form-item {
          width: 100% !important;
          margin-bottom: 0 !important;
          display: flex !important;
          flex-direction: column !important;

          .ant-form-item-control {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 !important;
            min-width: 0 !important;
          }

          .ant-form-item-control-input {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 !important;
            min-width: 0 !important;
          }

          .ant-form-item-control-input-content {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 !important;
            min-width: 0 !important;
            display: flex !important;
          }
        }

        /* Select 컴포넌트 강제 너비 설정 */
        .ant-select,
        .ant-select.ant-select-single,
        .ant-select.ant-select-show-arrow {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          flex: 1 !important;

          .ant-select-selector {
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-selection-search {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 !important;
            min-width: 0 !important;
          }

          .ant-select-selection-item,
          .ant-select-selection-placeholder {
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            box-sizing: border-box !important;
            flex: 1 !important;
            min-width: 0 !important;
          }

          .ant-select-selection-item {
            flex: 1 !important;
            min-width: 0 !important;
          }

          .ant-select-selection-placeholder {
            flex: 1 !important;
            min-width: 0 !important;
          }
        }

        .ant-picker {
          padding: 0;
          width: 100%;
        }

        .ant-radio-group {
          .ant-radio-wrapper {
            margin-right: 16px;
          }
        }
      }

      tr:last-child {
        th,
        td {
          border-bottom: none;
        }
      }
    }
  }

  .form-section {
    height: 100%;
    display: flex;
    flex-direction: column;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: ${({ theme }) => theme?.colors?.neutral?.[700] || "#333"};
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid
        ${({ theme }) => theme?.colors?.navy || "#1890ff"};
    }
  }

  .signature-section {
    margin-top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;

    .upload-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      flex: 1;
      min-height: calc(9 * 36px - 8px); /* 9개 행 높이 */

      .ant-upload {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        .ant-upload-select {
          width: 100%;
          height: 100%;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed
            ${({ theme }) => theme?.colors?.neutral?.[300] || "#d9d9d9"};
          border-radius: 4px;
          background-color: ${({ theme }) => theme?.colors?.white || "#fff"};
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: ${({ theme }) => theme?.colors?.navy || "#1890ff"};
          }
        }

        .ant-upload-list {
          width: 100%;
          flex: 1;

          .ant-upload-list-item {
            width: 100%;
            height: 100%;
            min-height: 200px;
            margin-top: 0;
            border-radius: 4px;
            overflow: hidden;

            .ant-upload-list-item-thumbnail {
              width: 100%;
              height: 100%;

              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                background-color: ${({ theme }) =>
                  theme?.colors?.neutral?.[50] || "#fafafa"};
              }
            }

            .ant-upload-list-item-actions {
              .anticon {
                color: ${({ theme }) => theme?.colors?.white || "#fff"};
              }
            }
          }
        }
      }

      .ant-btn {
        width: 100%;
        margin-top: 8px;
        height: 32px;
        font-size: 13px;
      }
    }
  }
`;
