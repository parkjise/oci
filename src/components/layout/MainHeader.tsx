import React, { useMemo, useCallback } from "react";
import { Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import { useAuthStore } from "@/store/authStore";
import { clearAllTokens } from "@/utils/tokenUtils";
import { useUiStore } from "@store/uiStore";
import { routesConfig } from "@config/routes";
import { getAllRoutes } from "@utils/routeUtils";
import { confirm } from "@/components/common/message";
import { logoutApi } from "@apis/authApi";
import logoImage from "@/assets/images/logo_main_onerp.png";
import {
  StyledHeader,
  StyledHeaderLeft,
  StyledLogo,
  StyledSearchSelect,
  StyledHeaderRight,
  StyledUserButton,
} from "./MainHeader.styles";

const MainHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const { addTab } = useUiStore();
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

  const searchableRoutes = useMemo(
    () => allAppRoutes.filter((r) => r.element),
    [allAppRoutes]
  );

  const handleLogout = useCallback(() => {
    confirm({
      content: t("logoutConfirmation", "로그아웃 하시겠습니까?"),
      onOk: async () => {
        clearAllTokens();
        await logoutApi();
        logoutStore();
        navigate("/");
      },
    });
  }, [t, logoutStore, navigate]);

  const handleSearchSelect = useCallback(
    (value: unknown) => {
      const path = typeof value === "string" ? value : String(value);
      const routeToAdd = allAppRoutes.find((r) => r.path === path);
      if (routeToAdd) {
        addTab(routeToAdd);
        navigate(path);
      }
    },
    [allAppRoutes, addTab, navigate]
  );

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      switch (key) {
        case "profile":
          // TODO: 프로필 페이지로 이동
          break;
        case "settings":
          // TODO: 설정 페이지로 이동
          break;
        case "logout":
          handleLogout();
          break;
        default:
          break;
      }
    },
    [handleLogout]
  );

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("profile", "프로필"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: t("settings", "설정"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("logout", "로그아웃"),
    },
  ];

  return (
    <StyledHeader>
      <StyledLogo $logoSrc={logoImage} />
      <StyledHeaderLeft>
        <StyledSearchSelect
          showSearch
          placeholder={t("search_menu", "메뉴 검색...")}
          onSelect={handleSearchSelect}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={searchableRoutes.map((route) => ({
            value: route.path,
            label: t(route.meta?.title || route.path),
          }))}
        />
      </StyledHeaderLeft>
      <StyledHeaderRight>
        <Space size="middle">
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            placement="bottomRight"
          >
            <StyledUserButton type="text">
              <Space>
                <Avatar icon={<UserOutlined />} size="small" />
                <span>{user?.empName || t("user", "사용자")}</span>
              </Space>
            </StyledUserButton>
          </Dropdown>
        </Space>
      </StyledHeaderRight>
    </StyledHeader>
  );
};

export default MainHeader;
