import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html{
    font-size: 62.5%;
  }
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden !important;
    overflow-y: auto;
    max-width: 100vw !important;
    box-sizing: border-box;
    background-color:#F2F4F6;
    font-weight: 400;
    letter-spacing: -0.5px;
  }

  #root {
    width: 100%;
    height: 100%;
    overflow-x: hidden !important;
    max-width: 100vw !important;
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
  .ant-tooltip{
    font-size: 11px;
    .ant-tooltip-inner{
      min-height: 24px;
      padding: 4px 8px;
    }
    .ant-tooltip-container{
      min-height: 24px;
    }
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

  /* AG Grid 클릭된 행 스타일 - 전역 스타일로 추가하여 확실하게 적용 */
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

  /* 클릭된 행의 셀에도 색상 적용 */
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
`;
