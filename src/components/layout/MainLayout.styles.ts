import styled from "styled-components";
import { Layout } from "antd";

export const StyledLayout = styled(Layout)`
  min-height: 100vh;
  height: 100vh;
  overflow: hidden !important;
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  box-sizing: border-box;
`;

export const StyledLayoutContent = styled(Layout)`
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden !important;
  width: 100%;
  box-sizing: border-box;
`;

export const StyledLayoutSubcontent = styled(Layout)`
  min-height: calc(100vh - 64px);
  height: calc(100vh - 64px);
  display: flex;
  overflow: hidden !important;
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100vw !important;
  box-sizing: border-box;
  background: #ffffff;
  color: #000000;

  * {
    color: #000000;
    box-sizing: border-box;
  }
`;
