import styled from "styled-components";
import { InputNumber } from "antd";

export const InputNumberStyles = styled(InputNumber)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  &::placeholder {
    font-size: 12px;
  }
  &.ant-input-number {
    &:hover,
    &:active,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
    }
    input[value] {
      font-size: 12px;
      color: ${({ theme }) => theme.colors.neutral[700]};
    }
  }
`;
