import styled from "styled-components";
import { Button } from "antd";
export const ButtonStyles = styled(Button)`
  border-radius: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.neutral[600]};
  &.ant-btn {
    font-family: "Pretendard";
  }
  &.ghost {
    border: none;
  }
  &.navy {
    color: ${({ theme }) => theme.colors.white};
    font-size: 12px;
    background-color: ${({ theme }) => theme.colors.navy};
  }
`;
