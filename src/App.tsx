import { useEffect, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@components/providers";
import { GlobalStyle } from "@/styles/globalStyles";
import { useAuthStore } from "@store/authStore";
import { AuthRouteWrapper } from "@components/features";
import "@ant-design/v5-patch-for-react-19";

// 페이지 컴포넌트 lazy loading
const LoginPage = lazy(() => import("@pages/login/Login"));
const MainLayout = lazy(() =>
  import("@components/layout").then((module) => ({ default: module.MainLayout }))
);

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRouteWrapper
            route={{
              path: "/",
              meta: { title: "menu.login", requiresAuth: false },
            }}
            Component={LoginPage}
          />
        }
      />
      <Route
        path="/app/*"
        element={
          <AuthRouteWrapper
            route={{
              path: "/app",
              meta: { title: "menu.main", requiresAuth: true },
            }}
            Component={MainLayout}
          />
        }
      />
    </Routes>
  );
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
