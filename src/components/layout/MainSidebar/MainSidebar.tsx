/**
 * MainSidebar 컴포넌트
 *
 * 메인 애플리케이션의 사이드바를 렌더링합니다.
 * - 백엔드 API에서 메뉴 데이터를 가져와 계층 구조로 변환
 * - Ant Design Menu 컴포넌트를 사용하여 메뉴 렌더링
 * - 메뉴 클릭 시 해당 페이지를 탭으로 추가
 * - 로컬 스토리지를 사용한 메뉴 데이터 캐싱
 * - 동적 컴포넌트 로딩 (Vite의 import.meta.glob 사용)
 */
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@store/uiStore";
import type { MenuProps } from "antd";
import {
  StyledSidebar,
  StyledSidebarHeader,
  StyledSidebarHeaderCollapsed,
  StyledMenuContainer,
  StyledMenu,
  StyledCollapseButton,
  StyledFavoritesCount,
} from "./MainSidebar.styles";
import { getMainInitDataApi } from "@apis/main";
import type { MenuItem } from "@/types/api.types";
import type { RouteConfig } from "@/types/routes.types";
import { getMenuCache, setMenuCache } from "@utils/menuCache";
import { getMenuIcon } from "@utils/iconUtils";
import {
  ROOT_PARENT_PGM_NO,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
} from "@/constants";

type MenuItemType = Required<MenuProps>["items"][number];

/**
 * 백엔드 메뉴 데이터를 계층 구조로 변환
 * @param menus - 평면 구조의 메뉴 배열
 * @returns 계층 구조로 변환된 메뉴 트리
 */
const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  if (!menus || menus.length === 0) {
    return [];
  }

  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // 1. 모든 메뉴를 맵에 저장 (children은 빈 배열로 초기화)
  menus.forEach((menu) => {
    menuMap.set(menu.pgmNo, { ...menu, children: [] });
  });

  // 2. 레벨 순서대로 정렬하여 부모가 먼저 처리되도록 보장
  const sortedMenus = [...menus].sort((a, b) => {
    if (a.lvl !== b.lvl) {
      return a.lvl - b.lvl; // 레벨 우선 정렬
    }
    return (a.sort || 0) - (b.sort || 0); // 같은 레벨이면 sort로 정렬
  });

  // 3. 정렬된 순서대로 계층 구조 구성
  sortedMenus.forEach((menu) => {
    const menuNode = menuMap.get(menu.pgmNo);
    if (!menuNode) return;

    // parentPgmNo가 ROOT_PARENT_PGM_NO이고 lvl이 1인 메뉴만 루트로 처리
    // (lvl이 1이 아닌 경우는 데이터 오류로 간주하고 자식 메뉴로 처리)
    if (menu.parentPgmNo === ROOT_PARENT_PGM_NO && menu.lvl === 1) {
      rootMenus.push(menuNode);
    } else {
      // 자식 메뉴 - 부모에 추가
      const parent = menuMap.get(menu.parentPgmNo);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        // 중복 체크 후 추가
        if (!parent.children.some((child) => child.pgmNo === menu.pgmNo)) {
          parent.children.push(menuNode);
        }
      }
      // 부모가 없고 parentPgmNo가 ROOT_PARENT_PGM_NO가 아니면 무시 (데이터 오류)
    }
  });

  // 4. 최종 정렬 (sort 기준으로 재귀 정렬)
  const sortMenus = (menuList: MenuItem[]) => {
    menuList.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    menuList.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };

  sortMenus(rootMenus);
  return rootMenus;
};

/**
 * 메뉴 트리를 Ant Design Menu Items로 변환
 * @param menus - 계층 구조의 메뉴 배열
 * @param t - 다국어 번역 함수
 * @returns Ant Design Menu Items 배열
 */
const convertToMenuItems = (
  menus: MenuItem[],
  t: ReturnType<typeof useTranslation>["t"]
): MenuItemType[] => {
  if (!menus || menus.length === 0) {
    return [];
  }

  return menus
    .filter((menu) => menu.useYn === "Y" && menu.hidden !== "Y")
    .map((menu) => {
      // 다국어 번역: lKey가 있으면 번역 사용, 없으면 pgmName 사용
      // MainHeader의 t("profile", "프로필")과 동일한 패턴
      const label = menu.lKey
        ? t(menu.lKey, menu.pgmName || menu.lKey)
        : menu.pgmName || "";

      // 1단계 메뉴(lvl === 1)에만 아이콘 적용
      const icon =
        menu.lvl === 1 ? getMenuIcon(menu, "MainSidebar") : undefined;

      // children이 있으면 SubMenu로 변환
      if (
        menu.children &&
        Array.isArray(menu.children) &&
        menu.children.length > 0
      ) {
        const children = convertToMenuItems(menu.children, t);
        if (children.length > 0) {
          // SubMenu 타입 반환 (children이 있으면 자동으로 SubMenu로 인식)
          return icon
            ? { key: menu.pgmNo, label, icon, children }
            : { key: menu.pgmNo, label, children };
        }
      }

      // 일반 MenuItem (children이 없음)
      return icon
        ? { key: menu.pgmNo, label, icon }
        : { key: menu.pgmNo, label };
    })
    .filter((item) => item !== null && item !== undefined) as MenuItemType[];
};

/**
 * 페이지 컴포넌트 모듈 매핑
 * 중앙 집중식으로 관리하여 경로 문제를 방지합니다.
 */
import { pageModules } from "@utils/pageModules";

/**
 * PATH로 컴포넌트 동적 로드
 * @param path - 파일 경로 (예: /pages/users/Users.tsx)
 * @returns Lazy 컴포넌트 또는 null
 */
const getComponentByPath = (
  path: string
): React.LazyExoticComponent<React.ComponentType> | null => {
  if (!path) return null;
  try {
    // PATH 정규화: 다양한 형식의 /components/pages를 /pages로 변환
    // 1. /src/components/pages -> /pages
    // 2. /components/pages -> /pages
    // 3. src/components/pages -> pages
    // 4. components/pages -> pages
    // 5. /src/pages -> /pages (이미 올바른 형식)
    let normalizedPath = path
      .replace(/\/src\/components\/pages/gi, "/pages")
      .replace(/\/components\/pages/gi, "/pages")
      .replace(/^src\/components\/pages/gi, "pages")
      .replace(/^components\/pages/gi, "pages")
      .replace(/\/src\/pages/gi, "/pages")
      .replace(/^src\/pages/gi, "pages");
    
    // 앞뒤 공백 제거
    normalizedPath = normalizedPath.trim();

    // 정규화 후 /pages/ 포함 여부 확인
    if (
      !normalizedPath.includes("/pages/") &&
      !normalizedPath.includes("pages/")
    ) {
      return null;
    }

    // PATH를 상대 경로로 변환
    // import.meta.glob("../pages/**/*.{tsx,ts}")를 사용하면 (src/utils/pageModules.ts에서)
    // 키는 ../pages/... 형식으로 저장됩니다
    // 예: /pages/users/Users.tsx -> ../pages/users/Users.tsx
    const relativePath = (
      normalizedPath.startsWith("/")
        ? `../${normalizedPath.slice(1)}`
        : `../${normalizedPath}`
    ).replace(/\\/g, "/"); // Windows 경로 구분자 처리 (백슬래시를 슬래시로 변환)

    // 매핑된 모듈 찾기
    let moduleLoader = pageModules[relativePath];

    // 정확히 매칭되지 않으면 대소문자 무시하여 찾기 시도
    if (!moduleLoader) {
      const lowerRelativePath = relativePath.toLowerCase();
      for (const key in pageModules) {
        if (key.toLowerCase() === lowerRelativePath) {
          moduleLoader = pageModules[key];
          if (import.meta.env.DEV) {
            console.warn(
              `[MainSidebar] 대소문자 차이로 경로 매칭:`,
              `\n  요청: ${relativePath}`,
              `\n  실제: ${key}`
            );
          }
          break;
        }
      }
    }

    if (moduleLoader) {
      return React.lazy(async () => {
        const module = await moduleLoader();
        return { default: module.default };
      });
    }

    // 매핑에 없으면 확장자 없이도 찾기 시도
    if (!moduleLoader) {
      const pathWithoutExt = relativePath.replace(/\.(tsx|ts)$/, "");
      for (const key in pageModules) {
        const keyWithoutExt = key.replace(/\.(tsx|ts)$/, "");
        if (keyWithoutExt === pathWithoutExt || keyWithoutExt.toLowerCase() === pathWithoutExt.toLowerCase()) {
          moduleLoader = pageModules[key];
          if (import.meta.env.DEV) {
            console.warn(
              `[MainSidebar] 확장자 제거 후 경로 매칭:`,
              `\n  요청: ${relativePath}`,
              `\n  실제: ${key}`
            );
          }
          break;
        }
      }
    }

    if (moduleLoader) {
      return React.lazy(async () => {
        const module = await moduleLoader();
        return { default: module.default };
      });
    }

    // 매핑에 없으면 null 반환 (직접 import는 Vite에서 경로 문제 발생 가능)
    if (import.meta.env.DEV) {
      console.error(
        `[MainSidebar] import.meta.glob에서 모듈을 찾을 수 없습니다.`,
        `\n  요청 경로: ${relativePath}`,
        `\n  원본 경로: ${path}`,
        `\n  정규화된 경로: ${normalizedPath}`,
        `\n  사용 가능한 키 샘플:`,
        Object.keys(pageModules).slice(0, 10)
      );
    }

    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[MainSidebar] 컴포넌트 로드 실패: ${path}`, error);
    }
    return null;
  }
};

/**
 * PATH를 라우트 경로로 변환
 * @param path - 파일 경로 (예: /pages/users/Users.tsx)
 * @returns 라우트 경로 (예: /app/users)
 */
const convertPathToRoute = (path: string): string => {
  if (
    path.includes("/pages/") &&
    (path.endsWith(".tsx") || path.endsWith(".ts"))
  ) {
    const pathMatch = path.match(/\/pages\/(.+)\/([^/]+)\.(tsx|ts)$/);
    if (pathMatch) {
      const [, dirPath] = pathMatch;
      return `/app/${dirPath}`.replace(/\/+/g, "/");
    }
  }
  return `/app${path.startsWith("/") ? "" : "/"}${path}`.replace(/\/+/g, "/");
};

const MainSidebar: React.FC = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const { addTab, activeTabKey } = useUiStore();

  const DEFAULT_WIDTH = SIDEBAR_DEFAULT_WIDTH;
  const MAX_WIDTH = SIDEBAR_MAX_WIDTH;

  /**
   * 메뉴 데이터 로드
   * 로컬 스토리지 캐시를 우선 사용하고, 없으면 API 호출
   */
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);

        // 1. 캐시에서 먼저 확인
        const cachedMenus = getMenuCache();
        if (cachedMenus && cachedMenus.length > 0) {
          setMenus(cachedMenus);
          setLoading(false);
          return;
        }

        // 2. 캐시가 없거나 만료되었으면 API 호출
        const response = await getMainInitDataApi();
        if (response.success && response.data?.menus) {
          setMenus(response.data.menus);
          setMenuCache(response.data.menus);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load menus:", error);
        }
        // 에러 발생 시 캐시에서 가져오기 시도
        const cachedMenus = getMenuCache();
        if (cachedMenus) {
          setMenus(cachedMenus);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  // 메뉴 트리 구성
  const menuTree = useMemo(() => buildMenuTree(menus), [menus]);

  // Ant Design Menu Items 변환 (언어 변경 시 재렌더링)
  const sidebarMenuItems = useMemo(
    () => convertToMenuItems(menuTree, t),
    [menuTree, t]
  );

  /**
   * PGM_NO로 메뉴 찾기
   * @param pgmNo - 프로그램 번호
   * @returns 찾은 메뉴 또는 undefined
   */
  const findMenuByPgmNo = useCallback(
    (pgmNo: string): MenuItem | undefined => {
      const findInTree = (menuList: MenuItem[]): MenuItem | undefined => {
        for (const menu of menuList) {
          if (menu.pgmNo === pgmNo) return menu;
          if (menu.children) {
            const found = findInTree(menu.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      return findInTree(menuTree);
    },
    [menuTree]
  );

  /**
   * 사이드바 너비 계산 (메뉴 텍스트 길이에 따라 동적 조정)
   */
  const calculateWidth = useCallback(() => {
    if (collapsed || !menuContainerRef.current) return;

    requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      const menuItems = menuContainerRef.current?.querySelectorAll(
        ".ant-menu-item, .ant-menu-submenu-title"
      );
      if (!menuItems || menuItems.length === 0) return;

      let maxTextWidth = 0;
      const firstItem = menuItems[0] as HTMLElement;
      const computedStyle = window.getComputedStyle(firstItem);
      context.font = `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      menuItems.forEach((item: Element) => {
        const element = item as HTMLElement;
        const display = window.getComputedStyle(element).display;
        const visibility = window.getComputedStyle(element).visibility;
        const opacity = window.getComputedStyle(element).opacity;

        if (display !== "none" && visibility !== "hidden" && opacity !== "0") {
          let parentSubmenu = element.closest(".ant-menu-submenu");
          let isVisible = true;

          while (parentSubmenu) {
            if (!parentSubmenu.classList.contains("ant-menu-submenu-open")) {
              isVisible = false;
              break;
            }
            parentSubmenu =
              parentSubmenu.parentElement?.closest(".ant-menu-submenu") || null;
          }

          if (isVisible) {
            const textSpan = element.querySelector(".ant-menu-title-content");
            if (textSpan) {
              const textContent = textSpan.textContent || "";
              const textWidth = context.measureText(textContent).width;
              maxTextWidth = Math.max(maxTextWidth, textWidth);
            }
          }
        }
      });

      // 아이콘(28px) + 화살표(20px) + 패딩(40px) + 여유공간(50px)
      const totalWidth = maxTextWidth + 28 + 20 + 40 + 50;

      const newWidth = Math.max(
        DEFAULT_WIDTH,
        Math.min(MAX_WIDTH, Math.ceil(totalWidth))
      );

      setSidebarWidth((prevWidth: number) =>
        prevWidth !== newWidth ? newWidth : prevWidth
      );
    });
  }, [collapsed, DEFAULT_WIDTH, MAX_WIDTH]);

  /**
   * 메뉴 클릭 핸들러
   * 메뉴 클릭 시 해당 페이지를 탭으로 추가
   */
  const handleMenuClick = useCallback(
    (info: { key: string }) => {
      const menu = findMenuByPgmNo(info.key);
      if (!menu || !menu.path) return;

      const routePath = convertPathToRoute(menu.path);
      const Component = getComponentByPath(menu.path);

      if (Component) {
        const routeConfig: RouteConfig = {
          path: routePath,
          element: Component,
          meta: {
            title: menu.lKey || menu.pgmName || "",
            requiresAuth: true,
            pgmNo: menu.pgmNo,
          },
        };
        addTab(routeConfig);
      }

      // 사이드바가 열려있으면 너비 재계산
      if (!collapsed) {
        requestAnimationFrame(() => {
          setTimeout(() => calculateWidth(), 50);
          setTimeout(() => calculateWidth(), 200);
        });
      }
    },
    [findMenuByPgmNo, addTab, collapsed, calculateWidth]
  );

  /**
   * 서브메뉴 열림/닫힘 핸들러
   * 서브메뉴가 열리거나 닫힐 때 사이드바 너비 재계산 및 스크롤 조정
   */
  const handleMenuOpenChange = useCallback(
    (openKeys: string[]) => {
      if (!collapsed && menuContainerRef.current) {
        const container = menuContainerRef.current;
        const lastOpenKey = openKeys[openKeys.length - 1];

        // 마지막으로 열린 메뉴 항목으로 스크롤
        if (lastOpenKey) {
          requestAnimationFrame(() => {
            const menuItem = container.querySelector(
              `[data-menu-id*="${lastOpenKey}"]`
            ) as HTMLElement;
            if (menuItem) {
              menuItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          });
        }

        // 너비 재계산
        requestAnimationFrame(() => {
          setTimeout(() => calculateWidth(), 100);
          setTimeout(() => calculateWidth(), 250);
        });
      }
    },
    [collapsed, calculateWidth]
  );

  /**
   * 초기 너비 계산
   * 사이드바가 열릴 때 한 번만 실행
   */
  useEffect(() => {
    if (!collapsed && sidebarWidth === DEFAULT_WIDTH) {
      const timer = setTimeout(() => calculateWidth(), 100);
      return () => clearTimeout(timer);
    }
  }, [collapsed, sidebarWidth, DEFAULT_WIDTH, calculateWidth]);

  if (loading) {
    return (
      <StyledSidebar
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={collapsed ? 64 : sidebarWidth}
        collapsedWidth={64}
      >
        <div style={{ padding: 16, color: "#fff", textAlign: "center" }}>
          Loading...
        </div>
      </StyledSidebar>
    );
  }

  return (
    <StyledSidebar
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => {
        setCollapsed(value);
        if (!value) {
          setTimeout(() => calculateWidth(), 100);
        }
      }}
      trigger={null}
      width={collapsed ? 64 : sidebarWidth}
      collapsedWidth={64}
    >
      {collapsed ? (
        <StyledSidebarHeaderCollapsed>
          <StarOutlined />
        </StyledSidebarHeaderCollapsed>
      ) : (
        <StyledSidebarHeader>
          <span>{t("favorites", "즐겨찾기")}</span>
          <StyledFavoritesCount>5</StyledFavoritesCount>
        </StyledSidebarHeader>
      )}
      <StyledMenuContainer ref={menuContainerRef}>
        <StyledMenu
          theme="dark"
          selectedKeys={activeTabKey ? [activeTabKey] : undefined}
          mode="inline"
          items={sidebarMenuItems}
          onClick={handleMenuClick}
          onOpenChange={handleMenuOpenChange}
        />
      </StyledMenuContainer>
      <StyledCollapseButton onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </StyledCollapseButton>
    </StyledSidebar>
  );
};

export default MainSidebar;
