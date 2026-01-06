import React from "react";
import type { RouteConfig } from "@/types/com/routes/routes.types";
import type { MenuItem } from "@/types/com/api/api.types";
import { pageModules } from "@utils/pageModules";
import { useUiStore } from "@store/com/ui/uiStore";
import { getMenuCache } from "@utils/menuCache";

type ModuleLoader = () => Promise<{ default: React.ComponentType }>;

// HMR (Hot-Module-Replacement) 업데이트 시에도 캐시를 유지하기 위해 window 객체 사용
// @ts-ignore
if (!window.__componentCache__) {
  // @ts-ignore
  window.__componentCache__ = new Map<
    string,
    React.LazyExoticComponent<React.ComponentType>
  >();
}
// @ts-ignore
const componentCache: Map<string, React.LazyExoticComponent<React.ComponentType>> = window.__componentCache__;

const normalizedPathCache = new Map<string, string>();
const relativePathCache = new Map<string, string>();

const normalizePath = (path: string): string => {
  const cached = normalizedPathCache.get(path);
  if (cached) return cached;

  const normalized = path
    .replace(/(^|\/)src\/components\/pages/gi, "$1pages")
    .replace(/(^|\/)components\/pages/gi, "$1pages")
    .replace(/(^|\/)src\/pages/gi, "$1pages")
    .trim();

  normalizedPathCache.set(path, normalized);
  return normalized;
};

const toRelativePath = (normalizedPath: string): string => {
  const cached = relativePathCache.get(normalizedPath);
  if (cached) return cached;

  const relative = `../${normalizedPath.replace(/^\//, "")}`.replace(
    /\\/g,
    "/"
  );
  relativePathCache.set(normalizedPath, relative);
  return relative;
};

const findModuleLoader = (relativePath: string): ModuleLoader | null => {
  const exactMatch = pageModules[relativePath];
  if (exactMatch) return exactMatch;

  const lowerPath = relativePath.toLowerCase();
  const pathWithoutExt = relativePath.replace(/\.(tsx|ts)$/, "");
  const lowerPathWithoutExt = pathWithoutExt.toLowerCase();

  for (const key in pageModules) {
    const keyLower = key.toLowerCase();
    const keyWithoutExt = key.replace(/\.(tsx|ts)$/, "");

    if (
      keyLower === lowerPath ||
      keyWithoutExt === pathWithoutExt ||
      keyWithoutExt.toLowerCase() === lowerPathWithoutExt
    ) {
      if (import.meta.env.DEV && key !== relativePath) {
        console.warn(
          `[menuTabUtils] 경로 매칭:`,
          `\n  요청: ${relativePath}`,
          `\n  실제: ${key}`
        );
      }
      return pageModules[key];
    }
  }

  return null;
};

const getComponentByPath = (
  path: string
): React.LazyExoticComponent<React.ComponentType> | null => {
  if (!path) return null;

  const cached = componentCache.get(path);
  if (cached) return cached;

  try {
    const normalizedPath = normalizePath(path);

    if (!normalizedPath.includes("pages/")) {
      return null;
    }

    const relativePath = toRelativePath(normalizedPath);
    const moduleLoader = findModuleLoader(relativePath);

    if (!moduleLoader) {
      if (import.meta.env.DEV) {
        console.error(
          `[menuTabUtils] 모듈을 찾을 수 없습니다.`,
          `\n  요청 경로: ${relativePath}`,
          `\n  원본 경로: ${path}`,
          `\n  정규화된 경로: ${normalizedPath}`,
          `\n  사용 가능한 키 샘플:`,
          Object.keys(pageModules).slice(0, 10)
        );
      }
      return null;
    }

    const LazyComponent = React.lazy(async () => {
      const module = await moduleLoader();
      return { default: module.default };
    });

    componentCache.set(path, LazyComponent);
    return LazyComponent;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[menuTabUtils] 컴포넌트 로드 실패: ${path}`, error);
    }
    return null;
  }
};

export const convertPathToRoute = (path: string): string => {
  const match = path.match(/\/pages\/(.+)\/([^/]+)\.(tsx|ts)$/);
  if (match) {
    return `/app/${match[1]}`.replace(/\/+/g, "/");
  }
  return `/app${path.startsWith("/") ? "" : "/"}${path}`.replace(/\/+/g, "/");
};

const flattenMenus = (items: MenuItem[]): MenuItem[] => {
  const result: MenuItem[] = [];
  const traverse = (menuItems: MenuItem[]) => {
    menuItems.forEach((item) => {
      result.push(item);
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };
  traverse(items);
  return result;
};

export const createRouteConfigFromMenu = (
  menu: MenuItem,
  params?: Record<string, unknown>
): RouteConfig | null => {
  if (!menu?.path) return null;

  const Component = getComponentByPath(menu.path);
  if (!Component) return null;

  return {
    path: convertPathToRoute(menu.path),
    element: Component,
    meta: {
      title: menu.lKey || menu.pgmName || "",
      requiresAuth: true,
      pgmNo: menu.pgmNo,
      ...(params && { params }),
    },
  };
};

export const openMenuTab = (
  menu: MenuItem,
  addTab: (tab: RouteConfig) => void,
  params?: Record<string, unknown>
): boolean => {
  const routeConfig = createRouteConfigFromMenu(menu, params);

  if (!routeConfig) {
    if (import.meta.env.DEV) {
      console.warn(
        `[menuTabUtils] 메뉴에서 탭을 열 수 없습니다:`,
        menu.pgmNo,
        menu.path
      );
    }
    return false;
  }

  addTab(routeConfig);
  return true;
};

export const openMenuTabByPgmNo = (
  pgmNo: string,
  menus: MenuItem[],
  addTab: (tab: RouteConfig) => void,
  params?: Record<string, unknown>
): boolean => {
  if (!pgmNo || !menus?.length) return false;

  const menu = flattenMenus(menus).find((m) => m.pgmNo === pgmNo);

  if (!menu) {
    if (import.meta.env.DEV) {
      console.warn(
        `[menuTabUtils] 프로그램 번호로 메뉴를 찾을 수 없습니다:`,
        pgmNo
      );
    }
    return false;
  }

  return openMenuTab(menu, addTab, params);
};

/**
 * 탭 열기 커스텀 훅
 * @example
 * ```tsx
 * const { openTab, openTabByPgmNo } = useOpenTab();
 * openTab(menu, { id: "123" });
 * openTabByPgmNo("PGM001", { id: "123" });
 * ```
 */
export const useOpenTab = () => {
  const addTab = useUiStore((state) => state.addTab);

  const openTab = (
    menu: MenuItem,
    params?: Record<string, unknown>
  ): boolean => {
    return openMenuTab(menu, addTab, params);
  };

  const openTabByPgmNo = (
    pgmNo: string,
    params?: Record<string, unknown>
  ): boolean => {
    const menus = getMenuCache() || [];
    return openMenuTabByPgmNo(pgmNo, menus, addTab, params);
  };

  return {
    openTab,
    openTabByPgmNo,
  };
};
