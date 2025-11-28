import { lazy } from "react";
import type { RouteConfig } from "@model/routes";

// 페이지 컴포넌트 lazy loading
const LoginPage = lazy(() => import("@pages/login/Login"));
const MainLayout = lazy(() => import("@components/layout/MainLayout"));
const DashboardPage = lazy(() => import("@pages/dashboard/Dashboard"));
const UsersPage = lazy(() => import("@pages/users/Users"));
const DocumentsPage = lazy(() => import("@pages/documents/Documents"));
const SettingsPage = lazy(() => import("@pages/settings/Settings"));
const SamplePage1 = lazy(() => import("@pages/sample/sample1/Sample1"));
const SamplePage2 = lazy(() => import("@pages/sample/sample2/Sample2"));
const SamplePage3 = lazy(() => import("@pages/sample/sample3/Sample3"));

/**
 * 애플리케이션 라우트 설정
 * 이 배열을 수정하여 라우트를 추가/제거할 수 있습니다.
 */
export const routesConfig: RouteConfig[] = [
  {
    path: "/",
    element: LoginPage, // Pass component type
    meta: {
      title: "menu.login",
      requiresAuth: false,
    },
  },
  {
    path: "/app",
    element: MainLayout, // Pass component type
    meta: {
      title: "menu.main",
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        element: DashboardPage, // Pass component type
        meta: {
          title: "menu.dashboard",
          requiresAuth: true,
          menu: true,
        },
      },
      {
        path: "system",
        meta: {
          title: "menu.system",
          requiresAuth: true,
          menu: true,
        },
        children: [
          {
            path: "users",
            element: UsersPage, // Pass component type
            meta: {
              title: "menu.system.users",
              requiresAuth: true,
            },
          },
          {
            path: "settings",
            element: SettingsPage, // Pass component type
            meta: {
              title: "menu.system.settings",
              requiresAuth: true,
            },
          },
          {
            path: "sample",
            meta: {
              title: "menu.sample",
              requiresAuth: true,
              menu: true,
            },
            children: [
              {
                path: "sample1",
                element: SamplePage1, // Pass component type
                meta: {
                  title: "menu.sample1",
                  requiresAuth: true,
                },
              },
              {
                path: "sample2",
                element: SamplePage2, // Pass component type
                meta: {
                  title: "menu.sample2",
                  requiresAuth: true,
                },
              },
              {
                path: "sample3",
                element: SamplePage3, // Pass component type
                meta: {
                  title: "menu.sample3",
                  requiresAuth: true,
                },
              },
            ],
          },
        ],
      },
      {
        path: "content",
        meta: {
          title: "menu.content",
          requiresAuth: true,
          menu: true,
        },
        children: [
          {
            path: "documents",
            element: DocumentsPage, // Pass component type
            meta: {
              title: "menu.content.documents",
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },
];
