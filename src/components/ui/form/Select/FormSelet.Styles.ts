import styled from "styled-components";
import { Select } from "antd";

export const SelectStyles = styled(Select)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  padding-right: 5px;
  height: 28px;
  &.ant-select {
    &-sm {
      height: 24px;
    }
    &-lg {
      height: 32px;
    }
  }
  .anticon-down {
    svg {
      display: none;
    }
    &::before {
      display: inline-block;
      content: "\\ea4e";
      font-family: "remixicon" !important;
      font-weight: normal;
      font-size: 18px;
      line-height: 22px;
    }
  }

  .anticon-down &:focus,
  &:hover {
    border-color: ${({ theme }) => theme.colors.neutral[600]};
  }

  .ant-select-content {
    align-items: center;
    .ant-select-placeholder {
      color: ${({ theme }) => theme.colors.neutral[500]};
      font-size: 12px;
      font-weight: 300;
    }
  }
  .ant-select-content-value {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.neutral[600]};
    font-weight: 400;
  }
`;
