import styled from "styled-components";
import { Input } from "antd";

export const InputStyles = styled(Input)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  &::placeholder {
    font-size: 12px;
    font-weight: 300;
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
  &.ant-input {
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
