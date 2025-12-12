/**
 * MainHeader 컴포넌트
 *
 * 메인 애플리케이션의 헤더를 렌더링합니다.
 * - 로고 표시
 * - 메뉴 검색 기능 (백엔드 메뉴 데이터 기반)
 * - 사용자 프로필 및 로그아웃 메뉴
 * - 로컬 스토리지를 사용한 메뉴 데이터 캐싱
 */
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Dropdown, Badge } from "antd";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { SelectProps } from "antd";
import { useAuthStore } from "@/store/authStore";
import { clearAllTokens } from "@/utils/tokenUtils";
import { useUiStore } from "@store/uiStore";
import { confirm } from "@/components/ui/feedback/Message";
import { logoutApi } from "@apis/auth";
import { getMainInitDataApi } from "@apis/main";
import type { MenuItem } from "@/types/api.types";
import { getMenuCache } from "@utils/menuCache";
import type { RouteConfig } from "@/types/routes.types";
import type { SearchableMenuItem } from "@/types/menu.types";
import { FormButton } from "@components/ui/form";
import eng from "@/assets/images/eng.svg";
import kor from "@/assets/images/kor.svg";

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
    )
      return null;

    // PATH를 상대 경로로 변환
    // import.meta.glob("../pages/**/*.{tsx,ts}")를 사용하면 (src/utils/pageModules.ts에서)
    // 키는 ../pages/... 형식으로 저장됩니다
    // 예: /pages/users/Users.tsx -> ../pages/users/Users.tsx
    let relativePath = normalizedPath.startsWith("/")
      ? `../${normalizedPath.slice(1)}`
      : `../${normalizedPath}`;

    // Windows 경로 구분자 처리 (백슬래시를 슬래시로 변환)
    relativePath = relativePath.replace(/\\/g, "/");

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
              `[MainHeader] 대소문자 차이로 경로 매칭:`,
              `\n  요청: ${relativePath}`,
              `\n  실제: ${key}`
            );
          }
          break;
        }
      }
    }

    // 확장자 없이도 찾기 시도
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
              `[MainHeader] 확장자 제거 후 경로 매칭:`,
              `\n  요청: ${relativePath}`,
              `\n  실제: ${key}`
            );
          }
          break;
        }
      }
    }

    if (!moduleLoader) {
      // 디버깅: 개발 모드에서만 로그 출력
      if (import.meta.env.DEV) {
        const availableKeys = Object.keys(pageModules).slice(0, 5);
        console.error(
          `[MainHeader] 모듈을 찾을 수 없습니다.`,
          `\n  요청 경로: ${relativePath}`,
          `\n  원본 경로: ${path}`,
          `\n  정규화된 경로: ${normalizedPath}`,
          `\n  사용 가능한 경로 예시:`,
          availableKeys.map((k) => `\n    - ${k}`).join("")
        );
      }
      return null;
    }

    return React.lazy(async () => {
      const module = await moduleLoader();
      return { default: module.default };
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[MainHeader] 컴포넌트 로드 실패: ${path}`, error);
    }
    return null;
  }
};
import logoImage from "@/assets/images/logo.png";
import {
  StyledHeader,
  StyledHeaderLeft,
  StyledLogo,
  StyledSearchSelect,
  StyledHeaderRight,
  StyledSearchOptionContainer,
  StyledSearchOptionIcon,
  StyledSearchOptionText,
  StyledSearchOptionLabel,
  StyledSearchOptionBreadcrumb,
} from "./MainHeader.styles";

/**
 * PATH를 라우트 경로로 변환
 *
 * 예: "/pages/users/Users.tsx" -> "/app/users"
 *
 * @param path - 파일 경로 (예: "/pages/users/Users.tsx")
 * @returns 라우트 경로 (예: "/app/users")
 */
const convertPathToRoute = (path: string): string => {
  // PATH 정규화: /components/pages를 /pages로 변환
  // 모든 /components/pages 인스턴스를 /pages로 변환
  const normalizedPath = path.replace(/\/components\/pages/g, "/pages");

  if (
    normalizedPath.includes("/pages/") &&
    (normalizedPath.endsWith(".tsx") || normalizedPath.endsWith(".ts"))
  ) {
    const pathMatch = normalizedPath.match(/\/pages\/(.+)\/([^/]+)\.(tsx|ts)$/);
    if (pathMatch) {
      const [, dirPath] = pathMatch;
      return `/app/${dirPath}`.replace(/\/+/g, "/");
    }
  }
  return `/app${
    normalizedPath.startsWith("/") ? "" : "/"
  }${normalizedPath}`.replace(/\/+/g, "/");
};

/**
 * 메뉴를 평면화하여 검색 가능한 리스트로 변환
 *
 * 계층 구조의 메뉴를 평면 배열로 변환하여 검색 기능에서 사용합니다.
 * 자식이 없는 메뉴만 실제 페이지로 간주하여 검색 결과에 포함합니다.
 *
 * @param menus - 계층 구조의 메뉴 배열
 * @param t - 다국어 번역 함수
 * @param parentPath - 부모 메뉴 경로 (재귀 호출 시 사용)
 * @returns 검색 가능한 메뉴 아이템 배열
 */
const flattenMenuItems = (
  menus: MenuItem[],
  t: ReturnType<typeof useTranslation>["t"],
  parentPath: string = ""
): SearchableMenuItem[] => {
  const result: SearchableMenuItem[] = [];

  for (const menu of menus) {
    // 사용하지 않거나 숨겨진 메뉴는 제외
    if (menu.useYn !== "Y" || menu.hidden === "Y") {
      continue;
    }

    // 다국어 번역된 라벨 생성
    const label = menu.lKey
      ? t(menu.lKey, menu.pgmName || menu.lKey)
      : menu.pgmName || "";

    // 부모 경로와 현재 라벨을 조합하여 breadcrumb 생성
    const currentPath = parentPath ? `${parentPath} > ${label}` : label;

    // 라우트 경로 생성
    const routePath = menu.path
      ? convertPathToRoute(menu.path)
      : `/app/menu/${menu.pgmNo}`;

    // 자식이 없는 경우만 실제 페이지로 간주하여 검색 결과에 추가
    if (!menu.children || menu.children.length === 0) {
      result.push({
        pgmNo: menu.pgmNo,
        label,
        path: routePath,
        breadcrumb: currentPath,
        menu,
      });
    }

    // 자식 메뉴 재귀적으로 처리
    if (menu.children && menu.children.length > 0) {
      result.push(...flattenMenuItems(menu.children, t, currentPath));
    }
  }

  return result;
};

const MainHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);
  const { addTab } = useUiStore();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

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
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[MainHeader] 메뉴 로드 실패:", error);
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

  /**
   * 검색 가능한 메뉴 리스트 생성
   */
  const searchableMenuItems = useMemo(() => {
    if (!menus || menus.length === 0) {
      return [];
    }
    return flattenMenuItems(menus, t);
  }, [menus, t]);

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = useCallback(() => {
    confirm({
      content: t("logoutConfirmation", "로그아웃 하시겠습니까?"),
      onOk: async () => {
        try {
          clearAllTokens();
          await logoutApi();
          logoutStore();
          navigate("/");
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("[MainHeader] 로그아웃 실패:", error);
          }
        }
      },
    });
  }, [t, logoutStore, navigate]);

  /**
   * 검색 선택 핸들러
   * 선택된 메뉴를 탭으로 추가하고 해당 페이지로 이동
   */
  const handleSearchSelect = useCallback(
    (value: unknown) => {
      const pgmNo = typeof value === "string" ? value : String(value);
      const menuItem = searchableMenuItems.find((item) => item.pgmNo === pgmNo);
      if (menuItem && menuItem.menu.path) {
        // 컴포넌트 동적 로드
        const Component = getComponentByPath(menuItem.menu.path);

        if (Component) {
          // RouteConfig 형식으로 변환하여 탭 추가
          const routeConfig: RouteConfig = {
            path: menuItem.path,
            element: Component,
            meta: {
              title: menuItem.label,
              requiresAuth: true,
              pgmNo: menuItem.pgmNo,
            },
          };
          addTab(routeConfig);
          navigate(menuItem.path);
        } else {
          if (import.meta.env.DEV) {
            console.warn(
              `[MainHeader] 컴포넌트를 찾을 수 없습니다: ${menuItem.menu.path}`
            );
          }
        }
      }
    },
    [searchableMenuItems, addTab, navigate]
  );

  /**
   * 검색 필터 함수 (한글/영문, 경로, 메뉴명 모두 검색)
   */
  const filterMenuOptions: SelectProps["filterOption"] = useCallback(
    (
      input: string,
      option?: { label?: React.ReactNode; value?: string | number | null }
    ) => {
      if (!input || !option) return true;

      const searchText = String(input).toLowerCase().trim();
      const pgmNo = String(option?.value || "");
      const menuItem = searchableMenuItems.find((item) => item.pgmNo === pgmNo);

      if (!menuItem) return false;

      // 메뉴명 검색 (한글/영문)
      const labelLower = menuItem.label.toLowerCase();
      if (labelLower.includes(searchText)) return true;

      // 부모 경로 검색
      const breadcrumbLower = menuItem.breadcrumb.toLowerCase();
      if (breadcrumbLower.includes(searchText)) return true;

      // 경로 검색
      const pathLower = menuItem.path.toLowerCase();
      if (pathLower.includes(searchText)) return true;

      // pgmName 검색
      const pgmNameLower = (menuItem.menu.pgmName || "").toLowerCase();
      if (pgmNameLower.includes(searchText)) return true;

      return false;
    },
    [searchableMenuItems]
  );

  // const userMenuItems: MenuProps["items"] = [
  //   {
  //     key: "user",
  //     icon: <UserOutlined />,
  //     label: <>{user?.empName || t("user", "사용자")}</>,
  //   },
  //   {
  //     key: "profile",
  //     icon: <UserOutlined />,
  //     label: t("profile", "프로필"),
  //   },
  //   {
  //     key: "settings",
  //     icon: <SettingOutlined />,
  //     label: t("settings", "설정"),
  //   },
  //   {
  //     type: "divider",
  //   },
  //   {
  //     key: "logout",
  //     icon: <LogoutOutlined />,
  //     label: t("logout", "로그아웃"),
  //   },
  // ];

  return (
    <StyledHeader className="header">
      <StyledHeaderLeft className="header__left">
        <StyledLogo $logoSrc={logoImage} />
        <StyledSearchSelect
          className="header__search-select"
          showSearch
          placeholder={t("search_menu", "메뉴 검색...")}
          onSelect={handleSearchSelect}
          filterOption={filterMenuOptions}
          loading={loading}
          notFoundContent={
            loading
              ? t("loading", "로딩 중...")
              : t("no_results", "검색 결과가 없습니다")
          }
          optionRender={(option) => {
            const menuItem = searchableMenuItems.find(
              (item) => item.pgmNo === option.value
            );
            if (!menuItem) return option.label;

            return (
              <StyledSearchOptionContainer className="header__search-option-container">
                {menuItem.icon && (
                  <StyledSearchOptionIcon>
                    {menuItem.icon}
                  </StyledSearchOptionIcon>
                )}
                <StyledSearchOptionText className="header__search-option-text">
                  <StyledSearchOptionLabel className="header__search-option-label">
                    {menuItem.label}
                  </StyledSearchOptionLabel>
                  {menuItem.breadcrumb !== menuItem.label && (
                    <StyledSearchOptionBreadcrumb className="header__search-option-breadcrumb">
                      {menuItem.breadcrumb}
                    </StyledSearchOptionBreadcrumb>
                  )}
                </StyledSearchOptionText>
              </StyledSearchOptionContainer>
            );
          }}
          options={searchableMenuItems.map((item) => ({
            value: item.pgmNo,
            label: item.label,
          }))}
        />
      </StyledHeaderLeft>
      <StyledHeaderRight className="header__right">
        <FormButton
          icon={<i className="ri-notification-2-line" />}
          className="header__button header__button--notification"
        >
          <Badge count={85} />
        </FormButton>
        <Dropdown
          placement="bottomCenter"
          overlayClassName="language-switcher"
          dropdownRender={() => (
            <div className="header-dropdown language-switcher__menu">
              <FormButton
                type="link"
                className="language-switcher__option  language-switcher__option--kor language-switcher__option--active"
              >
                <span className="language-switcher__flag">
                  <img src={kor} alt="한국" />
                </span>
                <span className="language-switcher__label">KOR</span>
              </FormButton>
              <FormButton
                type="link"
                className="language-switcher__option  language-switcher__option--eng"
              >
                <span className="language-switcher__flag">
                  <img src={eng} alt="미국" />
                </span>
                <span className="language-switcher__label">ENG</span>
              </FormButton>
            </div>
          )}
        >
          <FormButton
            icon={<i className="ri-global-line" />}
            className="header__button header__button--language"
          />
        </Dropdown>
        <FormButton
          icon={<i className="ri-sun-line" />}
          className="header__button header__button--theme"
        />
        <FormButton
          icon={<i className="ri-settings-3-line" />}
          className="header__button header__button--setting"
        />
        <Dropdown
          // menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          overlayClassName="user-menu"
          dropdownRender={() => (
            <div className="header-dropdown user-menu__content">
              <div className="user-menu__profile">
                <div className="user-menu__name">홍길동</div>
                <div className="user-menu__role">시스템 엔지니어</div>
              </div>
              <div className="user-menu__divider"></div>
              <div className="user-menu__group">
                <FormButton
                  icon={<i className="ri-user-settings-line" />}
                  className="user-menu__item user-menu__item--settings"
                >
                  환경설정
                </FormButton>
                <FormButton
                  icon={<i className="ri-lock-line" />}
                  className="user-menu__item user-menu__item--password"
                >
                  비밀번호 변경
                </FormButton>
              </div>
              <div className="user-menu__divider"></div>
              <div className="user-menu__group user-menu__group--logout">
                <FormButton
                  className="user-menu__item user-menu__item--logout"
                  onClick={handleLogout}
                >
                  로그아웃
                </FormButton>
              </div>
            </div>
          )}
        >
          <FormButton
            icon={<i className="ri-user-line" />}
            className="header__button header__button--user"
          ></FormButton>
        </Dropdown>
      </StyledHeaderRight>
    </StyledHeader>
  );
};

export default MainHeader;
