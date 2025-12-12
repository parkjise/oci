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
import { getMenuCache, setMenuCache } from "@utils/menuCache";
import { getMenuIcon } from "@utils/iconUtils";
import {
  ROOT_PARENT_PGM_NO,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
} from "@/constants";
import { pageModules } from "@utils/pageModules";

type MenuItemType = Required<MenuProps>["items"][number];

// 상수
const DEFAULT_WIDTH = SIDEBAR_DEFAULT_WIDTH;
const MAX_WIDTH = SIDEBAR_MAX_WIDTH;

// 컴포넌트 캐시 맵 (동일한 경로에 대한 중복 컴포넌트 생성 방지)
const componentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType>
>();

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
        // Set으로 중복 체크 최적화
        const childPgmNos = new Set(
          parent.children.map((child) => child.pgmNo)
        );
        if (!childPgmNos.has(menu.pgmNo)) {
          parent.children.push(menuNode);
        }
      }
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

  const result: MenuItemType[] = [];

  for (const menu of menus) {
    if (menu.useYn !== "Y" || menu.hidden === "Y") continue;

    const label = menu.lKey
      ? t(menu.lKey, menu.pgmName || menu.lKey)
      : menu.pgmName || "";

    const icon = menu.lvl === 1 ? getMenuIcon(menu, "MainSidebar") : undefined;

    // SubMenu 처리
    if (menu.children && menu.children.length > 0) {
      const children = convertToMenuItems(menu.children, t);
      if (children.length > 0) {
        result.push(
          icon
            ? ({ key: menu.pgmNo, label, icon, children } as MenuItemType)
            : ({ key: menu.pgmNo, label, children } as MenuItemType)
        );
        continue;
      }
    }

    // 일반 MenuItem
    result.push(
      icon
        ? ({ key: menu.pgmNo, label, icon } as MenuItemType)
        : ({ key: menu.pgmNo, label } as MenuItemType)
    );
  }

  return result;
};

/**
 * Lazy 컴포넌트 생성 및 캐싱 헬퍼 함수
 */
const createLazyComponent = (
  moduleLoader: () => Promise<{ default: React.ComponentType }>,
  path: string
): React.LazyExoticComponent<React.ComponentType> => {
  const LazyComponent = React.lazy(async () => {
    const module = await moduleLoader();
    return { default: module.default };
  });
  componentCache.set(path, LazyComponent);
  return LazyComponent;
};

/**
 * PATH로 컴포넌트 동적 로드
 * @param path - 파일 경로 (예: /pages/users/Users.tsx)
 * @returns Lazy 컴포넌트 또는 null
 */
const getComponentByPath = (
  path: string
): React.LazyExoticComponent<React.ComponentType> | null => {
  if (!path) return null;

  // 캐시 확인
  if (componentCache.has(path)) {
    return componentCache.get(path)!;
  }

  try {
    // PATH 정규화
    const normalizedPath = path
      .replace(/\/src\/components\/pages/gi, "/pages")
      .replace(/\/components\/pages/gi, "/pages")
      .replace(/^src\/components\/pages/gi, "pages")
      .replace(/^components\/pages/gi, "pages")
      .replace(/\/src\/pages/gi, "/pages")
      .replace(/^src\/pages/gi, "pages")
      .trim();

    // /pages/ 포함 여부 확인
    if (
      !normalizedPath.includes("/pages/") &&
      !normalizedPath.includes("pages/")
    ) {
      return null;
    }

    // 상대 경로로 변환 (../pages/... 형식)
    const relativePath = (
      normalizedPath.startsWith("/")
        ? `../${normalizedPath.slice(1)}`
        : `../${normalizedPath}`
    ).replace(/\\/g, "/");

    // 모듈 로더 찾기
    let moduleLoader = pageModules[relativePath];

    // 대소문자 무시하여 찾기 시도
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

    // 확장자 없이 찾기 시도
    if (!moduleLoader) {
      const pathWithoutExt = relativePath.replace(/\.(tsx|ts)$/, "");
      for (const key in pageModules) {
        const keyWithoutExt = key.replace(/\.(tsx|ts)$/, "");
        if (
          keyWithoutExt === pathWithoutExt ||
          keyWithoutExt.toLowerCase() === pathWithoutExt.toLowerCase()
        ) {
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
      return createLazyComponent(moduleLoader, path);
    }

    // 모듈을 찾을 수 없음
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
  const widthCalculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Zustand 선택적 구독
  const addTab = useUiStore((state) => state.addTab);
  const activeTabKey = useUiStore((state) => state.activeTabKey);

  // Canvas 초기화
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      contextRef.current = canvasRef.current.getContext("2d");
    }
  }, []);

  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);

        // 캐시에서 먼저 확인
        const cachedMenus = getMenuCache();
        if (cachedMenus && cachedMenus.length > 0) {
          setMenus(cachedMenus);
          setLoading(false);
          return;
        }

        // API 호출
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

  // 메뉴 데이터 변환 및 캐싱
  const menuTree = useMemo(() => buildMenuTree(menus), [menus]);

  const menuMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    const buildMap = (menuList: MenuItem[]) => {
      menuList.forEach((menu) => {
        map.set(menu.pgmNo, menu);
        if (menu.children && menu.children.length > 0) {
          buildMap(menu.children);
        }
      });
    };
    buildMap(menuTree);
    return map;
  }, [menuTree]);

  const sidebarMenuItems = useMemo(
    () => convertToMenuItems(menuTree, t),
    [menuTree, t]
  );

  const selectedKeys = useMemo(
    () => (activeTabKey ? [activeTabKey] : []),
    [activeTabKey]
  );

  // 메뉴 찾기 (맵 사용으로 O(1) 조회)
  const findMenuByPgmNo = useCallback(
    (pgmNo: string): MenuItem | undefined => menuMap.get(pgmNo),
    [menuMap]
  );

  // 사이드바 너비 계산 (디바운싱 적용)
  const calculateWidth = useCallback(() => {
    if (collapsed || !menuContainerRef.current) return;

    // 기존 타이머 취소
    if (widthCalculationTimeoutRef.current) {
      clearTimeout(widthCalculationTimeoutRef.current);
    }

    widthCalculationTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const context = contextRef.current;
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

          if (
            display !== "none" &&
            visibility !== "hidden" &&
            opacity !== "0"
          ) {
            let parentSubmenu = element.closest(".ant-menu-submenu");
            let isVisible = true;

            while (parentSubmenu) {
              if (!parentSubmenu.classList.contains("ant-menu-submenu-open")) {
                isVisible = false;
                break;
              }
              parentSubmenu =
                parentSubmenu.parentElement?.closest(".ant-menu-submenu") ||
                null;
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

        setSidebarWidth((prevWidth) =>
          prevWidth !== newWidth ? newWidth : prevWidth
        );
      });
    }, 150);
  }, [collapsed]);

  // 이벤트 핸들러
  const handleMenuClick = useCallback(
    (info: { key: string }) => {
      const menu = findMenuByPgmNo(info.key);
      if (!menu?.path) return;

      const routePath = convertPathToRoute(menu.path);
      const Component = getComponentByPath(menu.path);

      if (Component) {
        addTab({
          path: routePath,
          element: Component,
          meta: {
            title: menu.lKey || menu.pgmName || "",
            requiresAuth: true,
            pgmNo: menu.pgmNo,
          },
        });
      }

      if (!collapsed) {
        calculateWidth();
      }
    },
    [findMenuByPgmNo, addTab, collapsed, calculateWidth]
  );

  const handleMenuOpenChange = useCallback(
    (openKeys: string[]) => {
      if (!collapsed && menuContainerRef.current) {
        const lastOpenKey = openKeys[openKeys.length - 1];

        // 마지막으로 열린 메뉴 항목으로 스크롤
        if (lastOpenKey) {
          requestAnimationFrame(() => {
            const menuItem = menuContainerRef.current?.querySelector(
              `[data-menu-id*="${lastOpenKey}"]`
            ) as HTMLElement;
            menuItem?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          });
        }

        calculateWidth();
      }
    },
    [collapsed, calculateWidth]
  );

  const handleCollapse = useCallback(
    (value: boolean) => {
      setCollapsed(value);
      if (!value) {
        calculateWidth();
      }
    },
    [calculateWidth]
  );

  // 초기 너비 계산
  useEffect(() => {
    if (!collapsed && sidebarWidth === DEFAULT_WIDTH && !loading) {
      const timer = setTimeout(() => calculateWidth(), 200);
      return () => clearTimeout(timer);
    }
  }, [collapsed, sidebarWidth, loading, calculateWidth]);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (widthCalculationTimeoutRef.current) {
        clearTimeout(widthCalculationTimeoutRef.current);
      }
    };
  }, []);

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
      onCollapse={handleCollapse}
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
          selectedKeys={selectedKeys}
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
