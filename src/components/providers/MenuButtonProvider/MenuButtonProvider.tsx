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
import { getRoleMenuButtonsByPgmNoApi } from "@apis/system/pgm/access/permission/permissionApi";
import type { MenuButton } from "@/types/com/menu/menuButton.type";
import type { RoleMenuWinObjDto } from "@/types/com/auth/auth.types";
import { getMenuCache } from "@/utils/menuCache";
import type { MenuItem } from "@/types/com/api/api.types";
import { useUiStore } from "@store/com/ui/uiStore";

interface MenuButtonContextValue {
  buttons: RoleMenuWinObjDto[];
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

  const [menuButtons, setMenuButtons] = useState<MenuButton[]>([]);
  const [roleButtons, setRoleButtons] = useState<RoleMenuWinObjDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pgmNo) {
      setMenuButtons([]);
      setRoleButtons([]);
      return;
    }

    const fetchButtons = async () => {
      setLoading(true);
      try {
        // 두 API를 병렬로 호출
        const [menuResponse, roleResponse] = await Promise.all([
          getMenuButtonsApi(pgmNo),
          getRoleMenuButtonsByPgmNoApi(pgmNo),
        ]);

        if (menuResponse.success && menuResponse.data) {
          setMenuButtons(menuResponse.data);
        } else {
          setMenuButtons([]);
        }

        if (roleResponse.success && roleResponse.data) {
          console.log("roleResponse.data", roleResponse.data);
          setRoleButtons(roleResponse.data);
        } else {
          setRoleButtons([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[MenuButtonProvider] API 호출 실패:", error);
        }
        setMenuButtons([]);
        setRoleButtons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchButtons();
  }, [pgmNo]);

  // 메뉴 버튼과 권한 버튼을 결합한 최종 버튼 목록
  const buttons = useMemo(() => {
    return roleButtons;
  }, [roleButtons]);

  const hasPermission = useCallback(
    (objId: string): boolean => {
      if (!objId) return true;

      // 1. 메뉴에 버튼이 정의되어 있는지 확인 (visibleYn 체크)
      const menuButton = menuButtons.find((btn) => btn.objId === objId);
      if (!menuButton) return true; // 메뉴에 없으면 기본 허용
      if (menuButton.visibleYn !== "Y") return false; // visibleYn이 "Y"가 아니면 권한 없음

      // 2. 권한이 있는지 확인 (roleEnabled 체크)
      const roleButton = roleButtons.find(
        (btn) => btn.objectId === objId || btn.id === objId
      );
      if (!roleButton) return true; // 권한 정보가 없으면 기본 허용

      // roleEnabled가 "Y"인 경우에만 권한 있음
      return roleButton.roleEnabled === "Y";
    },
    [menuButtons, roleButtons]
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
