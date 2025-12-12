import styled from "styled-components";
import { Input } from "antd";
const { TextArea } = Input;
export const TextStyles = styled(TextArea)`
  &.ant-input {
    border-radius: 0.2rem;
    border: 1px solid #e5e8eb;
    font-size: 12px;
    &:hover,
    &:focus {
      border-color: ${({ theme }) => theme.colors.neutral[600]};
    }
    &::placeholder {
      color: ${({ theme }) => theme.colors.neutral[500]};
      font-size: 12px;
      font-weight: 300;
    }
  }
`;
