import styled from "styled-components";
import { Button } from "antd";
export const ButtonStyles = styled(Button)`
  border-radius: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.neutral[600]};
  &.ant-btn {
    font-family: "Pretendard";
    &:not(:disabled) {
      &:hover,
      &:active,
      &:focus {
        border-color: ${({ theme }) => theme.colors.neutral[800]};
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
    }
  }
  &.ghost {
    border: none;
  }
  &.ant-btn.navy {
    color: ${({ theme }) => theme.colors.white};
    font-size: 12px;
    background-color: ${({ theme }) => theme.colors.navy};
    border: 1px solid ${({ theme }) => theme.colors.navy};
    &:hover,
    &:active,
    &:focus {
      color: ${({ theme }) => theme.colors.white};
      background-color: ${({ theme }) => theme.colors.darknavy};
      border: 1px solid ${({ theme }) => theme.colors.darknavy};
    }
  }
`;
