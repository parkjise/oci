import styled, { css } from "styled-components";
import { Input } from "antd";

const readOnlyStyles = css`
  background: #f8f8f8 !important; /* Antd 기본 스타일 덮어쓰기 위해 !important 권장 */
  color: ${({ theme }) => theme.colors.neutral[800]};
  cursor: default;
  border-color: #e5e8eb;
  box-shadow: none;

  &:hover,
  &:focus {
    border-color: #d9d9d9;
    box-shadow: none;
  }
`;
export const InputStyles = styled(Input)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  height: 28px;
  [readonly],
  &.ant-input[readonly] {
    ${readOnlyStyles}
  }
  & .ant-input[readonly] {
    ${readOnlyStyles}
  }
  &::placeholder {
    font-size: 12px;
    font-weight: 300;
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
  &.ant-input {
    &-sm {
      height: 24px;
    }
    &-lg {
      height: 32px;
    }
    &:hover,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
    }
    &[value] {
      color: ${({ theme }) => theme.colors.neutral[700]};
      font-size: 12px;
    }
  }
`;

export const PasswordStyles = styled(Input.Password)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  height: 28px;
  &::placeholder {
    font-size: 12px;
    font-weight: 300;
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
  &.ant-input {
    &-sm {
      height: 24px;
    }
    &-lg {
      height: 32px;
    }
    &:hover,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
    }
    &[value] {
      color: ${({ theme }) => theme.colors.neutral[700]};
      font-size: 12px;
    }
  }
`;
