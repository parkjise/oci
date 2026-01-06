import { createGlobalStyle } from "styled-components";
import { antdSelectGlobal } from "@/styles/antd/antd-select.global";
import { antdTooltipGlobal } from "@/styles/antd/antd-tooltip.global";
import { antdDropdownGlobal } from "@/styles/antd/antd-dropdown.global";
import { antdMdiTabsGlobal } from "@/styles/antd/antd-mdi-tab.global";
import { antdModalGlobal } from "@/styles/antd/antd-modal.global";
import { antdTabsGlobal } from "@/styles/antd/antd-tabs.global";
import * as mixins from "@/styles/mixins";

export const GlobalStyle = createGlobalStyle`
  ${antdSelectGlobal}
  ${antdTooltipGlobal}
  ${antdDropdownGlobal}
  ${antdMdiTabsGlobal}
  ${antdTabsGlobal}
  ${antdModalGlobal}
  .css-var-root{
    --ant-font-family: "Pretendard","Noto Sans KR", "Roboto", sans-serif ;
    --ant-font-family-code: "Pretendard","Noto Sans KR", "Roboto", sans-serif;
    
    &.ant-input-css-var{
      --ant-input-active-shadow: 0 0 0 2px rgba(0, 0, 0, 0.07);
    }
    &.ant-picker-css-var{
      --ant-date-picker-active-shadow :0 0 0 2px rgba(0, 0, 0, 0.07);
    }
    &.ant-input-number-css-var{
      --ant-input-number-active-shadow:0 0 0 2px rgba(0, 0, 0, 0.07);
    }
  }
  .css-var-root{
    .ant-btn{
      --ant-button-default-shadow :none;
    }
  }
  html{
    font-size: 62.5%;
  }
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    /* overflow-x: hidden !important; */
    overflow-y: hidden;
    /* max-width: 100vw !important; */
    box-sizing: border-box;
    background-color:#F2F4F6;
    font-weight: 400;
    letter-spacing: -0.5px;
    font-family:"Pretendard" ;
  }

  #root {
    width: 100%;
    height: 100%;
    /* overflow-x: hidden !important; */
    /* max-width: 100vw !important; */
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .ant-tabs,.ant-col,.ant-splitter {
    font-family:"Pretendard" ;
    color: ${({ theme }) => theme.colors.neutral[800]};
    font-weight: 400;
  }


  .helptext{
    i{
      padding-left: 5px;
      vertical-align: middle;
    }
  }
  .asterisk{
    i{
      color: ${({ theme }) => theme.colors.error};
      font-size: 8px;
      vertical-align: text-top;
    }
  }

  /* Form */
  .form-select {
    ${mixins.flex("center", "flex-start", "row", "5px")}

  }


  /* AG Grid 클릭된 행 스타일 - 전역 스타일로 추가하여 확실하게 적용
  .ag-row.ag-row-clicked,
  .ag-row-clicked,
  .ag-row-even.ag-row-clicked,
  .ag-row-odd.ag-row-clicked,
  .ag-row-selected.ag-row-clicked,
  .ag-row-even.ag-row-selected.ag-row-clicked,
  .ag-row-odd.ag-row-selected.ag-row-clicked,
  .ag-theme-quartz .ag-row.ag-row-clicked,
  .ag-theme-legacy .ag-row.ag-row-clicked,
  .ag-theme-quartz .ag-row-clicked,
  .ag-theme-legacy .ag-row-clicked,
  .ag-theme-quartz .ag-row-even.ag-row-clicked,
  .ag-theme-legacy .ag-row-even.ag-row-clicked,
  .ag-theme-quartz .ag-row-odd.ag-row-clicked,
  .ag-theme-legacy .ag-row-odd.ag-row-clicked,
  .ag-theme-quartz .ag-row-selected.ag-row-clicked,
  .ag-theme-legacy .ag-row-selected.ag-row-clicked {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }

  /* 클릭된 행의 셀에도 색상 적용
  .ag-row.ag-row-clicked .ag-cell,
  .ag-row-clicked .ag-cell,
  .ag-row-even.ag-row-clicked .ag-cell,
  .ag-row-odd.ag-row-clicked .ag-cell,
  .ag-row-selected.ag-row-clicked .ag-cell,
  .ag-theme-quartz .ag-row.ag-row-clicked .ag-cell,
  .ag-theme-legacy .ag-row.ag-row-clicked .ag-cell,
  .ag-theme-quartz .ag-row-clicked .ag-cell,
  .ag-theme-legacy .ag-row-clicked .ag-cell {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
  }
   */
`;
