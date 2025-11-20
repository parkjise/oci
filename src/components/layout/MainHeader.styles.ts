import styled from "styled-components";
import { Layout, Button, Select } from "antd";

const { Header } = Layout;

export const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 0 16px;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0;
  overflow-x: hidden !important;
  overflow-y: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
`;

export const StyledHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
`;

export const StyledLogo = styled.div<{ $logoSrc?: string }>`
  display: flex;
  align-items: center;
  height: 64px;
  max-width: 200px;
  min-width: 200px;
  width: 200px;
  flex-shrink: 0;
  background-image: url(${(props) => props.$logoSrc || ""});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 16px;
  box-sizing: border-box;
  overflow: hidden;
`;

export const StyledSearchSelect = styled(Select)`
  width: 300px;
  max-width: 300px;
  min-width: 200px;
  flex-shrink: 1;
  margin-left: 24px;
  text-align: left;
  color: #000000;
  box-sizing: border-box;

  .ant-select-selector {
    color: #000000;
    box-sizing: border-box;
    max-width: 100%;
  }

  .ant-select-selection-placeholder {
    color: rgba(0, 0, 0, 0.45);
  }
`;

export const StyledHeaderRight = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  color: #000000;

  * {
    color: #000000;
    box-sizing: border-box;
  }
`;

export const StyledUserButton = styled(Button)`
  color: #000000 !important;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;

  span {
    color: #000000 !important;
  }
`;

export const StyledIconButton = styled(Button)`
  color: #000000 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #000000 !important;
  }

  .anticon {
    color: #000000 !important;
  }
`;
