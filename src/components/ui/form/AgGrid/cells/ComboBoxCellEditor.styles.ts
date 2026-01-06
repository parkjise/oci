import styled from "styled-components";
import { Select } from "antd";

export const ComboBoxContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding: 0;
  overflow: visible;
  background-color: #fff;
  z-index: 1;

  .ant-select {
    width: 100%;
    min-height: 35px;
  }

  .ant-select-selector {
    border: none !important;
    box-shadow: none !important;
    padding: 0 24px 0 11px !important;
    min-height: 32px !important;
    display: flex !important;
    align-items: center !important;
  }

  .ant-select-selection-search {
    display: flex !important;
    align-items: center !important;
  }

  .ant-select-selection-item {
    line-height: 30px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    opacity: 1 !important;
    color: rgba(0, 0, 0, 0.88) !important;
  }

  .ant-select-selection-placeholder {
    line-height: 30px !important;
    display: flex !important;
    align-items: center !important;
    opacity: 0.4 !important;
  }

  /* 드롭다운 아이콘 표시 보장 */
  .ant-select-arrow {
    display: inline-flex !important;
    align-items: center !important;
    color: rgba(0, 0, 0, 0.45) !important;
    font-size: 12px !important;
    pointer-events: none !important;
    right: 11px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }

  .ant-select-focused .ant-select-arrow {
    color: rgba(0, 0, 0, 0.45) !important;
  }
`;

export const StyledSelect = styled(Select)`
  width: 100%;

  /* 드롭다운 아이콘 표시 보장 */
  .ant-select-arrow {
    display: inline-flex !important;
  }
`;
