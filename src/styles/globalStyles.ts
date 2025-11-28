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
`;
