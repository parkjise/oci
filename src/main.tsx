import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// i18n 설정
import "./i18n";
// theme 설정
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";
// providers
import AppWithLocale from "./components/providers/AppWithLocale";
// remix icon
import "remixicon/fonts/remixicon.css";
import "pretendard/dist/web/static/pretendard.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithLocale>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </AppWithLocale>
  </StrictMode>
);
