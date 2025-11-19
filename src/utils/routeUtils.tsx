import { type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import type { RouteConfig } from "@/model/routes";
import AuthRouteWrapper from "@/components/auth/AuthRouteWrapper";

// Helper function to recursively render routes
const renderRouteElements = (routes: RouteConfig[]): ReactNode[] => {
  return routes.map((route) => {
    const element = <AuthRouteWrapper route={route} Component={route.element as React.ComponentType<object>} />;

    if (route.children) {
      return (
        <Route key={route.path} path={route.path} element={element}>
          {renderRouteElements(route.children)}
        </Route>
      );
    }
    return <Route key={route.path} path={route.path} element={element} />;
  });
};

/**
 * 라우트 설정 배열을 Routes 컴포넌트로 변환
 */
export const renderRoutes = (routes: RouteConfig[]): ReactNode => {
  return <Routes>{renderRouteElements(routes)}</Routes>;
};

/**
 * 라우트 경로로 라우트 설정 찾기
 */
export const findRouteByPath = (
  routes: RouteConfig[],
  path: string
): RouteConfig | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (route.children) {
      const found = findRouteByPath(route.children, path);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * 모든 라우트 경로 가져오기 (플랫 구조)
 */
export const getAllRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  const allRoutes: RouteConfig[] = [];

  const traverse = (routeList: RouteConfig[], parentPath: string) => {
    for (const route of routeList) {
      // 경로가 '/'로 시작하면 부모 경로를 무시하고, 그렇지 않으면 부모 경로와 조합
      const currentPath = route.path.startsWith("/")
        ? route.path
        : `${parentPath}/${route.path}`.replace(/\/+/g, "/");

      const newRoute = { ...route, path: currentPath };
      allRoutes.push(newRoute);

      if (route.children) {
        traverse(route.children, currentPath);
      }
    }
  };

  traverse(routes, "");
  return allRoutes;
};
