import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { routesConfig } from "@config/routes";
import { renderRoutes } from "@utils/routeUtils";
import ErrorBoundary from "@components/common/errorBoundary/ErrorBoundary";
import { GlobalStyle } from "./styles/globalStyles";
import { useAuthStore } from "@store/authStore";
import "@ant-design/v5-patch-for-react-19";

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initializeAuth();
  }, [initializeAuth]);

  return <>{renderRoutes(routesConfig)}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <GlobalStyle />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
