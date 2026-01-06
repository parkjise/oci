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
import { StarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@store/com/ui/uiStore";
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
import type { MenuItem } from "@/types/com/api/api.types";
import { getMenuCache, setMenuCache } from "@utils/menuCache";
import { getMenuIcon } from "@utils/iconUtils";
import { ROOT_PARENT_PGM_NO, SIDEBAR_DEFAULT_WIDTH } from "@/constants";
import { openMenuTab } from "@utils/menuTabUtils";

// ============================================================================
// 타입 정의
// ============================================================================

type MenuItemType = Required<MenuProps>["items"][number];

// ============================================================================
// 상수
// ============================================================================

const DEFAULT_WIDTH = SIDEBAR_DEFAULT_WIDTH;
const COLLAPSED_WIDTH = 70;

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 백엔드 메뉴 데이터를 계층 구조로 변환
 */
const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  if (!menus || menus.length === 0) {
    return [];
  }

  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // 1단계: 모든 메뉴를 맵에 저장
  menus.forEach((menu) => {
    menuMap.set(menu.pgmNo, { ...menu, children: [] });
  });

  // 2단계: 레벨 순서대로 정렬 (부모가 먼저 처리되도록 보장)
  const sortedMenus = [...menus].sort((a, b) => {
    if (a.lvl !== b.lvl) {
      return a.lvl - b.lvl;
    }
    return (a.sort || 0) - (b.sort || 0);
  });

  // 3단계: 계층 구조 구성 (중복 체크를 위한 Set 사용)
  const processedChildren = new Map<string, Set<string>>();

  sortedMenus.forEach((menu) => {
    const menuNode = menuMap.get(menu.pgmNo);
    if (!menuNode) return;

    // 루트 메뉴: parentPgmNo가 ROOT_PARENT_PGM_NO이고 lvl이 1인 경우
    if (menu.parentPgmNo === ROOT_PARENT_PGM_NO && menu.lvl === 1) {
      rootMenus.push(menuNode);
    } else {
      // 자식 메뉴: 부모에 추가
      const parent = menuMap.get(menu.parentPgmNo);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        // 중복 체크를 위한 Set 관리 (부모별로 관리)
        if (!processedChildren.has(menu.parentPgmNo)) {
          processedChildren.set(menu.parentPgmNo, new Set());
        }
        const childSet = processedChildren.get(menu.parentPgmNo)!;

        if (!childSet.has(menu.pgmNo)) {
          childSet.add(menu.pgmNo);
          parent.children.push(menuNode);
        }
      }
    }
  });

  // 4단계: 최종 정렬 (sort 기준으로 재귀 정렬)
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
 */
const convertToMenuItems = (
  menus: MenuItem[],
  t: ReturnType<typeof useTranslation>["t"],
  activePgmNo: string | null = null,
  depth: number = 1
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
    const depthClass = `menu-depth-${depth}`;

    // SubMenu 처리
    if (menu.children && menu.children.length > 0) {
      const children = convertToMenuItems(
        menu.children,
        t,
        activePgmNo,
        depth + 1
      );
      if (children.length > 0) {
        result.push(
          icon
            ? ({
                key: menu.pgmNo,
                label,
                icon,
                children,
                className: depthClass,
              } as MenuItemType)
            : ({
                key: menu.pgmNo,
                label,
                children,
                className: depthClass,
              } as MenuItemType)
        );
        continue;
      }
    }

    // 일반 MenuItem
    // active 클래스 로직 추가
    const isActive = activePgmNo === menu.pgmNo;
    const itemClass = isActive ? `${depthClass} active` : depthClass;

    result.push(
      icon
        ? ({
            key: menu.pgmNo,
            label,
            icon,
            className: itemClass,
          } as MenuItemType)
        : ({
            key: menu.pgmNo,
            label,
            className: itemClass,
          } as MenuItemType)
    );
  }

  return result;
};

// ============================================================================
// 컴포넌트
// ============================================================================

const MainSidebar: React.FC = () => {
  // ==========================================================================
  // Hooks
  // ==========================================================================
  const { t } = useTranslation();
  const addTab = useUiStore((state) => state.addTab);
  const activeTabKey = useUiStore((state) => state.activeTabKey);
  const openTabs = useUiStore((state) => state.openTabs);

  const activePgmNo = useMemo(() => {
    const activeTab = openTabs.find((tab) => tab.path === activeTabKey);
    return activeTab?.meta?.pgmNo || null;
  }, [openTabs, activeTabKey]);

  // ==========================================================================
  // State
  // ==========================================================================
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = DEFAULT_WIDTH;
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // ==========================================================================
  // Refs
  // ==========================================================================
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // Effects
  // ==========================================================================

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

  // ==========================================================================
  // Memoized Values
  // ==========================================================================

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
    () => convertToMenuItems(menuTree, t, activePgmNo),
    [menuTree, t, activePgmNo]
  );

  // ==========================================================================
  // Callbacks
  // ==========================================================================

  // 메뉴 찾기 (맵 사용으로 O(1) 조회)
  const findMenuByPgmNo = useCallback(
    (pgmNo: string): MenuItem | undefined => menuMap.get(pgmNo),
    [menuMap]
  );

  // 이벤트 핸들러
  const handleMenuClick = useCallback(
    (info: { key: string }) => {
      const menu = findMenuByPgmNo(info.key);
      if (!menu) return;

      // 유틸리티 함수 사용
      const success = openMenuTab(menu, addTab);

      // routeConfig가 성공적으로 생성된 경우
      if (success) {
        // 현재 클릭한 메뉴의 상위 경로만 열어두고 나머지는 닫기
        const parentKeys: string[] = [];
        let currentMenu = menu;
        while (
          currentMenu.parentPgmNo &&
          currentMenu.parentPgmNo !== ROOT_PARENT_PGM_NO
        ) {
          parentKeys.push(currentMenu.parentPgmNo);
          const parent = findMenuByPgmNo(currentMenu.parentPgmNo);
          if (!parent) break;
          currentMenu = parent;
        }
        setOpenKeys(parentKeys);
      }
    },
    [findMenuByPgmNo, addTab]
  );

  const handleMenuOpenChange = useCallback(
    (keys: string[]) => {
      setOpenKeys(keys);

      if (!collapsed && menuContainerRef.current) {
        const lastOpenKey = keys[keys.length - 1];

        // 마지막으로 열린 메뉴 항목으로 스크롤
        if (lastOpenKey) {
          requestAnimationFrame(() => {
            const container = menuContainerRef.current;
            if (!container) return;

            const menuItem = container.querySelector<HTMLElement>(
              `[data-menu-id*="${lastOpenKey}"]`
            );
            menuItem?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          });
        }
      }
    },
    [collapsed]
  );

  const handleCollapse = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  const handleCollapseButtonClick = useCallback(() => {
    handleCollapse(!collapsed);
  }, [collapsed, handleCollapse]);

  // ==========================================================================
  // Render
  // ==========================================================================

  if (loading) {
    return (
      <StyledSidebar
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={collapsed ? COLLAPSED_WIDTH : sidebarWidth}
        collapsedWidth={COLLAPSED_WIDTH}
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
      width={collapsed ? COLLAPSED_WIDTH : sidebarWidth}
      collapsedWidth={COLLAPSED_WIDTH}
    >
      {collapsed ? (
        <StyledSidebarHeaderCollapsed>
          <StarOutlined />
        </StyledSidebarHeaderCollapsed>
      ) : (
        <StyledSidebarHeader className="sidebar-favorites">
          <div className="sidebar-favorites__title">
            <span className="sidebar-favorites__icon">
              <i className="ri-star-line"></i>
            </span>
            <span className="sidebar-favorites__text">
              {t("favorites", "즐겨찾기")}
            </span>
            <StyledFavoritesCount className="sidebar-favorites__count">
              5
            </StyledFavoritesCount>
          </div>
          <span className="sidebar-favorites__chevron">
            <i className="ri-arrow-right-s-line"></i>
          </span>
        </StyledSidebarHeader>
      )}
      <StyledMenuContainer ref={menuContainerRef}>
        <StyledMenu
          theme="dark"
          selectedKeys={[]}
          openKeys={openKeys}
          mode="inline"
          items={sidebarMenuItems}
          onClick={handleMenuClick}
          onOpenChange={handleMenuOpenChange}
        />
      </StyledMenuContainer>
      <StyledCollapseButton
        className="collapse"
        onClick={handleCollapseButtonClick}
      >
        {collapsed ? (
          <i className="ri-skip-right-line"></i>
        ) : (
          <i className="ri-skip-left-line"></i>
        )}
        {/* {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} */}
      </StyledCollapseButton>
    </StyledSidebar>
  );
};

export default MainSidebar;
