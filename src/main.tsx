import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// i18n 설정 파일을 import 합니다.
import "./i18n";
// theme 설정
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
// remix icon
import "remixicon/fonts/remixicon.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
