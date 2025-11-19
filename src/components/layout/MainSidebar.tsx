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
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  DashboardOutlined,
  DesktopOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@store/uiStore";
import { routesConfig } from "@config/routes";
import type { RouteConfig } from "@model/routes";
import { getAllRoutes } from "@utils/routeUtils";
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
type MenuItem = Required<MenuProps>["items"][number];

//Icon 셋팅 함수
const getIcon = (path: string): React.ReactNode => {
  switch (path) {
    case "dashboard":
      return <DashboardOutlined />;
    case "system":
      return <DesktopOutlined />;
    case "content":
      return <ContainerOutlined />;
    case "users":
      return <UserOutlined />;
    case "settings":
      return <SettingOutlined />;
    case "documents":
      return <FileTextOutlined />;
    case "sample":
      return <AppstoreOutlined />;
    case "sample1":
      return <AppstoreAddOutlined />;
    case "sample2":
      return <AppstoreAddOutlined />;
    case "sample3":
      return <AppstoreAddOutlined />;
    default:
      return null;
  }
};

const buildMenuItems = (
  routes: RouteConfig[],
  t: (key: string) => string,
  parentPath = ""
): MenuItem[] => {
  return routes
    .filter(
      (route) =>
        route.meta?.menu ||
        (route.children && route.children.length > 0) ||
        route.element
    )
    .map((route) => {
      const currentPath = `${parentPath}/${route.path}`.replace(/\/+/g, "/");

      if (route.children && route.children.length > 0) {
        return {
          key: currentPath,
          label: t(route.meta?.title || ""),
          icon: getIcon(route.path),
          children: buildMenuItems(route.children, t, currentPath),
        };
      }

      return {
        key: currentPath,
        label: t(route.meta?.title || ""),
        icon: getIcon(route.path),
      };
    });
};

const MainSidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const { addTab, activeTabKey } = useUiStore();

  const DEFAULT_WIDTH = 250;
  const MAX_WIDTH = 400;

  const appRoute = useMemo(
    () => routesConfig.find((route) => route.path === "/app"),
    []
  );

  const allAppRoutes = useMemo(() => {
    const routes = getAllRoutes(appRoute?.children || []);
    // Prepend '/app' to all paths to make them absolute from the root
    return routes.map((r) => ({
      ...r,
      path: `/app${r.path.startsWith("/") ? "" : "/"}${r.path}`.replace(
        /\/+/g,
        "/"
      ),
    }));
  }, [appRoute]);

  const sidebarMenuItems = useMemo(
    () => buildMenuItems(appRoute?.children || [], t, "/app"),
    [appRoute, t]
  );

  const calculateWidth = useCallback(() => {
    if (collapsed || !menuContainerRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      // Canvas를 사용해서 텍스트 너비 측정
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      // 메뉴 항목의 폰트 스타일 가져오기
      const menuItems = menuContainerRef.current?.querySelectorAll(
        ".ant-menu-item, .ant-menu-submenu-title"
      );
      if (!menuItems || menuItems.length === 0) return;

      let maxTextWidth = 0;

      // 첫 번째 메뉴 항목에서 폰트 스타일 추출
      const firstItem = menuItems[0] as HTMLElement;
      const computedStyle = window.getComputedStyle(firstItem);
      const fontFamily = computedStyle.fontFamily;
      const fontSize = computedStyle.fontSize;
      const fontWeight = computedStyle.fontWeight;
      const fontStyle = computedStyle.fontStyle;
      context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

      // 모든 메뉴 항목 중에서 보이는 항목들만 체크
      menuItems.forEach((item) => {
        const element = item as HTMLElement;
        const display = window.getComputedStyle(element).display;
        const visibility = window.getComputedStyle(element).visibility;
        const opacity = window.getComputedStyle(element).opacity;

        // 보이는 항목만 체크
        if (display !== "none" && visibility !== "hidden" && opacity !== "0") {
          // 부모 서브메뉴가 열려있는지 확인
          let parentSubmenu = element.closest(".ant-menu-submenu");
          let isVisible = true;

          // 부모 서브메뉴들을 체크하여 모두 열려있는지 확인
          while (parentSubmenu) {
            if (!parentSubmenu.classList.contains("ant-menu-submenu-open")) {
              isVisible = false;
              break;
            }
            const nextParent =
              parentSubmenu.parentElement?.closest(".ant-menu-submenu");
            parentSubmenu = nextParent || null;
          }

          // 열려있는 서브메뉴 내부의 항목만 체크
          if (isVisible) {
            // 텍스트 컨텐츠 추출 (아이콘 제외)
            const textSpan = element.querySelector(".ant-menu-title-content");
            if (textSpan) {
              const textContent = textSpan.textContent || "";
              const textWidth = context.measureText(textContent).width;
              maxTextWidth = Math.max(maxTextWidth, textWidth);
            }
          }
        }
      });

      // 아이콘 너비 (28px) + 화살표 너비 (submenu일 경우 20px) + 패딩 (40px) + 여유 공간 (40px)
      const iconWidth = 28;
      const arrowWidth = 20;
      const padding = 40;
      const buffer = 50;
      const totalWidth =
        maxTextWidth + iconWidth + arrowWidth + padding + buffer;

      const newWidth = Math.max(
        DEFAULT_WIDTH, // 최소 크기는 기본 크기(250px)로 유지
        Math.min(MAX_WIDTH, Math.ceil(totalWidth))
      );

      setSidebarWidth((prevWidth) => {
        if (prevWidth !== newWidth) {
          return newWidth;
        }
        return prevWidth;
      });
    });
  }, [collapsed]);

  const handleMenuClick = useCallback(
    (key: string) => {
      const routeToAdd = allAppRoutes.find((r) => r.path === key);
      if (routeToAdd && routeToAdd.element) {
        addTab(routeToAdd);
        navigate(key);
      }

      // 메뉴 클릭 후 DOM 업데이트 대기
      if (!collapsed) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            calculateWidth();
          }, 50);
          setTimeout(() => {
            calculateWidth();
          }, 200);
        });
      }
    },
    [allAppRoutes, addTab, navigate, collapsed, calculateWidth]
  );

  const handleMenuOpenChange = useCallback(() => {
    // 서브메뉴 열림/닫힘 시 너비 재계산
    if (!collapsed) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          calculateWidth();
        }, 100);
        setTimeout(() => {
          calculateWidth();
        }, 250);
      });
    }
  }, [collapsed, calculateWidth]);

  useEffect(() => {
    if (!collapsed && sidebarWidth === DEFAULT_WIDTH) {
      // 초기 로드 시 한 번만 너비 계산 (펼친 상태일 때)
      const timer = setTimeout(() => {
        calculateWidth();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [collapsed, sidebarWidth, calculateWidth]);

  return (
    <StyledSidebar
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => {
        setCollapsed(value);
        if (!value) {
          // 펼칠 때 너비 재계산
          setTimeout(() => {
            calculateWidth();
          }, 100);
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
          selectedKeys={activeTabKey ? [activeTabKey] : []}
          mode="inline"
          items={sidebarMenuItems}
          onClick={(info) => handleMenuClick(info.key)}
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
