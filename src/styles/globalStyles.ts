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
    font-family:"Pretendard";
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
`;
