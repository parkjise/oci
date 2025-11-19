import styled from "styled-components";
import { Card } from "antd";

export const StyledLoginPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 98vh;
  background-color: #ffffff;
`;

export const StyledLoginCard = styled(Card)`
  width: 400px;
  padding: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;
