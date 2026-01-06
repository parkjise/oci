import styled from "styled-components";
import { Input } from "antd";
const { Search } = Input;
export const InputSearchStyles = styled(Search)`
  .ant-input {
    border-radius: 0.2rem;
    border: 1px solid #e5e8eb;
    height: 28px;
    &-sm {
      height: 24px;
    }
    &-lg {
      height: 32px;
    }
    &:hover,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
      &[value] {
        color: ${({ theme }) => theme.colors.neutral[700]};
        font-size: 12px;
      }
    }
    &::placeholder {
      font-size: 12px;
      font-weight: 300;
      color: ${({ theme }) => theme.colors.neutral[500]};
    }
    &[value] {
      color: ${({ theme }) => theme.colors.neutral[700]};
      font-size: 12px;
    }
  }
  .ant-btn {
    border-radius: 0.2rem;
    border: 1px solid #e5e8eb;
    &:not(:disabled) {
      &:hover,
      &:active,
      &:focus {
        border-color: ${({ theme }) => theme.colors.neutral[800]};
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
    }
  }
`;
