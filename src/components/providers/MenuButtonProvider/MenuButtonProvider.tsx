import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import { getMenuButtonsApi } from "@apis/menu";
import type { MenuButton } from "@/types/menuButton.type";
import { getMenuCache } from "@/utils/menuCache";
import type { MenuItem } from "@/types/api.types";
import { useUiStore } from "@/store/uiStore";

interface MenuButtonContextValue {
  buttons: MenuButton[];
  loading: boolean;
  hasPermission: (objId: string) => boolean;
  pgmNo?: string;
}

const MenuButtonContext = createContext<MenuButtonContextValue | null>(null);

interface MenuButtonProviderProps {
  /** 프로그램 번호 (선택적) */
  pgmNo?: string;
  children: React.ReactNode;
}

/**
 * 화면별 메뉴 버튼 권한 Provider
 */
export const MenuButtonProvider: React.FC<MenuButtonProviderProps> = ({
  pgmNo: propPgmNo,
  children,
}) => {
  const location = useLocation();
  const params = useParams();
  const { openTabs, activeTabKey } = useUiStore();

  const pgmNoFromActiveTab = useMemo(() => {
    if (!activeTabKey) return undefined;
    const activeTab = openTabs.find((tab) => tab.path === activeTabKey);
    return activeTab?.meta?.pgmNo;
  }, [activeTabKey, openTabs]);

  const pgmNoFromQuery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("pgmNo") || undefined;
  }, [location.search]);

  const pgmNoFromParams = useMemo(() => {
    return params.pgmNo || params.id || undefined;
  }, [params]);

  const pgmNoFromMenuCache = useMemo(() => {
    if (propPgmNo || pgmNoFromActiveTab || pgmNoFromQuery || pgmNoFromParams) {
      return undefined;
    }

    const menus = getMenuCache();
    if (!menus || menus.length === 0) {
      return undefined;
    }

    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) {
      return undefined;
    }

    const flattenMenus = (items: MenuItem[]): MenuItem[] => {
      const result: MenuItem[] = [];
      const traverse = (menuItems: MenuItem[]) => {
        for (const item of menuItems) {
          result.push(item);
          if (item.children && item.children.length > 0) {
            traverse(item.children);
          }
        }
      };
      traverse(items);
      return result;
    };

    const convertPathToRoute = (path: string): string => {
      const normalizedPath = path.replace(/\/components\/pages/g, "/pages");
      if (
        normalizedPath.includes("/pages/") &&
        (normalizedPath.endsWith(".tsx") || normalizedPath.endsWith(".ts"))
      ) {
        const pathMatch = normalizedPath.match(
          /\/pages\/(.+)\/([^/]+)\.(tsx|ts)$/
        );
        if (pathMatch) {
          const [, dirPath] = pathMatch;
          return `/app/${dirPath}`.replace(/\/+/g, "/");
        }
      }
      return `/app${
        normalizedPath.startsWith("/") ? "" : "/"
      }${normalizedPath}`.replace(/\/+/g, "/");
    };

    const allMenus = flattenMenus(menus);

    for (let i = pathSegments.length; i > 0; i--) {
      const partialPath = "/" + pathSegments.slice(0, i).join("/");
      for (const menu of allMenus) {
        if (!menu.path) continue;
        const routePath = convertPathToRoute(menu.path);
        if (
          routePath === partialPath ||
          location.pathname.startsWith(routePath + "/")
        ) {
          return menu.pgmNo;
        }
      }
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment) {
      for (const menu of allMenus) {
        if (!menu.path) continue;
        const menuPathSegments = menu.path.split("/").filter(Boolean);
        const menuFileName = menuPathSegments[menuPathSegments.length - 1]
          ?.replace(/\.(tsx|ts)$/, "")
          .toLowerCase();
        if (menuFileName && lastSegment.toLowerCase() === menuFileName) {
          return menu.pgmNo;
        }
      }
    }

    return undefined;
  }, [
    location.pathname,
    propPgmNo,
    pgmNoFromActiveTab,
    pgmNoFromQuery,
    pgmNoFromParams,
  ]);

  const pgmNo = useMemo(() => {
    return (
      propPgmNo ||
      pgmNoFromActiveTab ||
      pgmNoFromQuery ||
      pgmNoFromParams ||
      pgmNoFromMenuCache
    );
  }, [
    propPgmNo,
    pgmNoFromActiveTab,
    pgmNoFromQuery,
    pgmNoFromParams,
    pgmNoFromMenuCache,
  ]);

  const [buttons, setButtons] = useState<MenuButton[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pgmNo) {
      setButtons([]);
      return;
    }

    const fetchButtons = async () => {
      setLoading(true);
      try {
        const response = await getMenuButtonsApi(pgmNo);
        if (response.success && response.data) {
          setButtons(response.data);
        } else {
          setButtons([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[MenuButtonProvider] API 호출 실패:", error);
        }
        setButtons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchButtons();
  }, [pgmNo]);

  const hasPermission = useCallback(
    (objId: string): boolean => {
      if (!objId) return true;
      const button = buttons.find((btn) => btn.objId === objId);
      if (!button) return true;
      return button.visibleYn === "Y";
    },
    [buttons]
  );

  const value = useMemo(
    () => ({ buttons, loading, hasPermission, pgmNo }),
    [buttons, loading, hasPermission, pgmNo]
  );

  return (
    <MenuButtonContext.Provider value={value}>
      {children}
    </MenuButtonContext.Provider>
  );
};

export const useMenuButtonPermission = () => {
  const context = useContext(MenuButtonContext);
  if (!context) {
    return {
      buttons: [],
      loading: false,
      hasPermission: () => true,
      pgmNo: undefined,
    };
  }
  return context;
};
