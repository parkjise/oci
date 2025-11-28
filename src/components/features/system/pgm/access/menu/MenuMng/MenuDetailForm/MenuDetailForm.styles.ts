import styled from "styled-components";

export const MenuDetailFormStyles = styled.div`
  width: 100%;

  .menu-detail-form__table {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.grey[100]};
    border-collapse: collapse;
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

    .checkbox-th {
      width: 50px;
      min-width: 50px;
      max-width: 50px;
      /* 다른 헤더와 동일한 왼쪽 여백 유지 */
      padding-left: 10px;
    }

    .checkbox-td {
      width: 40px;
      min-width: 40px;
      max-width: 40px;
      /* 기본 padding-left를 유지하고 가운데 정렬만 적용 */
      text-align: center;
    }

    .period-th {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }

    .period-td {
      width: 320px;
      min-width: 320px;

      .ant-picker {
        width: 100% !important;
        min-width: 320px;
      }
    }

    .sort-th {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }

    .sort-td {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }

    td {
      color: ${({ theme }) => theme.colors.neutral[600]};
      border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};

      .ant-form-item {
        margin-bottom: 0;
      }

      .ant-input,
      .ant-select-selector,
      .ant-picker {
        border: 1px solid ${({ theme }) => theme.colors.grey[300]};
        border-radius: 4px;
        height: 28px;
        font-size: 13px;
        line-height: 20px;

        &:focus,
        &:hover {
          border-color: #1890ff;
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
`;


