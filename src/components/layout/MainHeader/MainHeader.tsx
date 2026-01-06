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
import { useAuthStore } from "@store/com/auth/authStore";
import { clearAllTokens } from "@/utils/tokenUtils";
import { useUiStore } from "@store/com/ui/uiStore";
import { confirm } from "@/components/ui/feedback/Message";
import { logoutApi, updateEnvApi } from "@apis/auth";
import { getMainInitDataApi } from "@apis/main";
import type { MenuItem } from "@/types/com/api/api.types";
import { getMenuCache } from "@utils/menuCache";
import type { SearchableMenuItem } from "@/types/com/menu/menu.types";
import { FormButton } from "@components/ui/form";
import { openMenuTab, convertPathToRoute } from "@utils/menuTabUtils";
import { AppPageModal } from "@components/ui/feedback";
import { usePageModal } from "@hooks/usePageModal";
import type { ChangePasswordResult } from "@/types/com/auth/auth.types";
import eng from "@/assets/images/eng.svg";
import kor from "@/assets/images/kor.svg";

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { addTab } = useUiStore();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    user?.langType || i18n.language || "ko"
  );

  // 비밀번호 변경 모달 훅
  const changePasswordModal = usePageModal<
    Record<string, never>,
    ChangePasswordResult
  >(
    React.lazy(() => import("@components/features/auth/ChangePasswordModal")),
    {
      title: "비밀번호 변경",
      width: 480,
      centered: true,
      maskClosable: false,
      footer: null, // 모달 내부에서 버튼 처리
      onReturn: (result) => {
        if (result.success) {
          // 성공 처리 (이미 모달 내부에서 success 메시지 표시)
          // returnValue 호출 시 usePageModal의 handleReturn에서 자동으로 모달이 닫힘
        }
      },
    }
  );

  // 환경 설정 모달 훅
  const environmentSettingsModal = usePageModal<Record<string, never>, void>(
    React.lazy(
      () => import("@components/features/auth/EnvironmentSettingsModal")
    ),
    {
      title: "환경 설정",
      width: 450,
      centered: true,
      maskClosable: false,
      footer: null, // 모달 내부에서 버튼 처리
    }
  );

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
      } catch {
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
   * 현재 언어 감지 및 상태 업데이트
   * user.langType이 변경되면 언어도 업데이트
   */
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    // user.langType 우선 사용, 없으면 i18n.language 사용
    const language = user?.langType || i18n.language || "ko";
    setCurrentLanguage(language);

    // i18n 언어도 동기화
    if (user?.langType && user.langType !== i18n.language) {
      i18n.changeLanguage(user.langType);
    }

    // 언어 변경 이벤트 리스너 등록
    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, user?.langType]);

  /**
   * 언어 변경 핸들러
   */
  const handleLanguageChange = useCallback(
    async (language: string) => {
      try {
        await i18n.changeLanguage(language);
        setCurrentLanguage(language);

        // 서버에 언어 설정 업데이트
        if (user) {
          try {
            // 로그인 시 받은 사용자 정보를 유지하고 langType만 변경
            const response = await updateEnvApi({
              themeType: user.themeType as "light" | "dark" | undefined,
              langType: language as "ko" | "en",
              mainType: user.mainType,
              emailReceiveYn: user.emailReceiveYn as "Y" | "N" | undefined,
            });
            if (response.success && response.data) {
              // 사용자 정보 업데이트
              setUser(response.data);
            }
          } catch (error) {
            // API 호출 실패는 언어 변경에 영향을 주지 않음
            if (import.meta.env.DEV) {
              console.error("[Update Env Error]", error);
            }
          }
        }
      } catch {
        // 언어 변경 실패 처리
      }
    },
    [i18n, user, setUser]
  );

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
        } catch {
          // 로그아웃 실패 처리
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
        // 유틸리티 함수 사용
        const success = openMenuTab(menuItem.menu, addTab);

        if (success) {
          navigate(menuItem.path);
        }
      }
    },
    [searchableMenuItems, addTab, t, navigate]
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

  return (
    <>
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
            <Badge count={0} />
          </FormButton>
          <Dropdown
            placement="bottomCenter"
            overlayClassName="language-switcher"
            dropdownRender={() => (
              <div className="header-dropdown language-switcher__menu">
                <FormButton
                  type="link"
                  onClick={() => handleLanguageChange("ko")}
                  className={`language-switcher__option language-switcher__option--kor ${
                    (user?.langType || currentLanguage) === "ko"
                      ? "language-switcher__option--active"
                      : ""
                  }`}
                >
                  <span className="language-switcher__flag">
                    <img src={kor} alt={"KR"} />
                  </span>
                  <span className="language-switcher__label">{"KR"}</span>
                </FormButton>
                <FormButton
                  type="link"
                  onClick={() => handleLanguageChange("en")}
                  className={`language-switcher__option language-switcher__option--eng ${
                    (user?.langType || currentLanguage) === "en"
                      ? "language-switcher__option--active"
                      : ""
                  }`}
                >
                  <span className="language-switcher__flag">
                    <img src={eng} alt={"EN"} />
                  </span>
                  <span className="language-switcher__label">{"EN"}</span>
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
                  <div className="user-menu__name">{user?.empName || ""}</div>
                  <div className="user-menu__role">{user?.deptName || ""}</div>
                </div>
                <div className="user-menu__divider"></div>
                <div className="user-menu__group">
                  <FormButton
                    icon={<i className="ri-user-settings-line" />}
                    className="user-menu__item user-menu__item--settings"
                    onClick={() => environmentSettingsModal.openModal()}
                  >
                    환경설정
                  </FormButton>
                  <FormButton
                    icon={<i className="ri-lock-line" />}
                    className="user-menu__item user-menu__item--password"
                    onClick={() => changePasswordModal.openModal()}
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
      <AppPageModal {...changePasswordModal.modalProps} />
      <AppPageModal {...environmentSettingsModal.modalProps} />
    </>
  );
};

export default MainHeader;
