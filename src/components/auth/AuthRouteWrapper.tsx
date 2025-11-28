import { Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteConfig } from "@model/routes";
import { useAuthStore } from "@store/authStore";
import LoadingSpinner from "@components/common/loadingSpinner";

interface AuthRouteWrapperProps {
  route: RouteConfig;
  Component: React.ComponentType<object>; // Accept Component directly
}

const AuthRouteWrapper: React.FC<AuthRouteWrapperProps> = ({
  route,
  Component, // Destructure Component directly
}) => {
  const { meta } = route;
  const { isAuthenticated, isInitialized } = useAuthStore();

  // ⚠️ 개발 모드: 인증 우회 (백엔드 없이 개발용)
  const BYPASS_AUTH = import.meta.env.DEV; // 개발 환경에서만 인증 우회

  // 초기화가 완료되지 않았으면 로딩 표시
  if (!isInitialized && !BYPASS_AUTH) {
    return <LoadingSpinner />;
  }

  // 로그인 페이지로 접근 시 인증된 상태면 메인 페이지로 리다이렉트
  if (route.path === "/" && (isAuthenticated || BYPASS_AUTH)) {
    return <Navigate to="/app" replace />;
  }

  // 인증이 필요한 라우트 처리 (개발 모드에서는 우회)
  if (meta?.requiresAuth && !isAuthenticated && !BYPASS_AUTH) {
    return <Navigate to="/" replace />;
  }

  // Component가 유효한 React 컴포넌트인지 확인
  // 함수형 컴포넌트 또는 클래스 컴포넌트여야 합니다.
  if (
    !Component ||
    (typeof Component !== "function" && typeof Component !== "object")
  ) {
    if (import.meta.env.DEV) {
      console.error(
        "AuthRouteWrapper: Invalid Component type for route:",
        route,
        "Type:",
        typeof Component,
        "Value:",
        Component
      );
    }
    return null; // 또는 에러 메시지 렌더링
  }

  // 컴포넌트인 경우 Suspense로 감싸고, 인스턴스인 경우 그대로 사용
  const routeElement = (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );

  // AuthRouteWrapper의 역할은 인증 후 routeElement를 렌더링하는 것입니다.
  // Outlet은 부모 Route에서 처리됩니다.
  return routeElement;
};

export default AuthRouteWrapper;
