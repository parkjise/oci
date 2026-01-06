import styled from "styled-components";
import { DatePicker } from "antd";

export const DatePickerStyles = styled(DatePicker)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  height: 28px;
  .ant-picker-input > input::placeholder {
    font-size: 12px;
    color: #999;
  }
  &.ant-picker {
    &-small {
      height: 24px;
    }
    &-large {
      height: 32px;
    }
    &:hover,
    &:active,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
    }
  }
  .ant-picker-input {
    input[value] {
      font-size: 12px;
      color: ${({ theme }) => theme.colors.neutral[700]};
    }
  }
  .ant-picker-active-bar {
    background-color: ${({ theme }) => theme.colors.neutral[800]};
  }
`;
