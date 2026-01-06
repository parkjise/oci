import React, { useState, useMemo, useCallback } from "react";
import { FormButton } from "@/components/ui";
import { TabBarStyles } from "./TabBar.styles";
import { Tooltip, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import type { RouteConfig } from "@/types/com/routes/routes.types";

interface TabBarProps {
  openTabs?: RouteConfig[];
  activeTabKey?: string | null;
  setActiveTabKey?: (key: string | null) => void;
  removeTab?: (key: string) => void;
  closeAllTabs?: () => void;
}

const MAX_VISIBLE_TABS = 5;

const TabBar: React.FC<TabBarProps> = ({
  openTabs = [],
  activeTabKey = null,
  setActiveTabKey,
  removeTab,
  closeAllTabs,
}) => {
  const { t } = useTranslation();
  const [bookmark, setBookmark] = useState(false);

  // 활성 탭 정보
  const activeTab = useMemo(
    () => openTabs.find((tab) => tab.path === activeTabKey),
    [openTabs, activeTabKey]
  );

  const activeIndex = useMemo(
    () => openTabs.findIndex((tab) => tab.path === activeTabKey),
    [openTabs, activeTabKey]
  );

  const activeTabTitle = useMemo(
    () => (activeTab ? t(activeTab.meta?.title || "No Title") : ""),
    [activeTab, t]
  );

  // 탭 목록 분할
  const visibleTabs = useMemo(
    () => openTabs.slice(0, MAX_VISIBLE_TABS),
    [openTabs]
  );

  const hiddenTabs = useMemo(
    () => openTabs.slice(MAX_VISIBLE_TABS),
    [openTabs]
  );

  const shouldShowMore = openTabs.length > MAX_VISIBLE_TABS;

  // 이벤트 핸들러
  const handleClickBookmark = useCallback(() => {
    setBookmark((prev) => !prev);
  }, []);

  const handleTabClick = useCallback(
    (tabPath: string) => {
      setActiveTabKey?.(tabPath);
    },
    [setActiveTabKey]
  );

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabPath: string) => {
      e.stopPropagation();
      removeTab?.(tabPath);
    },
    [removeTab]
  );

  const handlePrevTab = useCallback(() => {
    if (activeIndex > 0 && setActiveTabKey) {
      setActiveTabKey(openTabs[activeIndex - 1].path);
    }
  }, [activeIndex, openTabs, setActiveTabKey]);

  const handleNextTab = useCallback(() => {
    if (activeIndex < openTabs.length - 1 && setActiveTabKey) {
      setActiveTabKey(openTabs[activeIndex + 1].path);
    }
  }, [activeIndex, openTabs, setActiveTabKey]);

  const handleCloseAll = useCallback(() => {
    closeAllTabs?.();
  }, [closeAllTabs]);

  // 탭 제목 가져오기 헬퍼 함수
  const getTabTitle = useCallback(
    (tab: RouteConfig) => t(tab.meta?.title || "No Title"),
    [t]
  );

  return (
    <TabBarStyles className="mdi-bar">
      <div className="mdi-bar__title">
        <Tooltip title="홈">
          <FormButton
            icon={<i className="ri-home-5-line" />}
            className="mdi-bar__title-icon mdi-bar__title-icon--home"
          />
        </Tooltip>
        <span className="mdi-bar__title-icon mdi-bar__title-icon--separator">
          <i className="ri-arrow-drop-right-line" />
        </span>
        <h2 className="mdi-bar__title-text">{activeTabTitle || "홈"}</h2>
        <div className="mdi-bar__title-actions">
          <Tooltip title="즐겨찾기">
            <FormButton
              icon={<i className="ri-star-fill" />}
              className={`mdi-bar__title-icon mdi-bar__title-icon--bookmark ${
                bookmark ? "active" : ""
              }`}
              onClick={handleClickBookmark}
            />
          </Tooltip>
          <Tooltip title="매뉴얼">
            <FormButton
              icon={<i className="ri-book-line" />}
              className="mdi-bar__title-icon mdi-bar__title-icon--manual"
            />
          </Tooltip>
        </div>
      </div>
      <div className="mdi-bar__controls">
        <div className="mdi-bar__tab-list">
          {openTabs.length > 0 ? (
            visibleTabs.map((tab) => {
              const isActive = tab.path === activeTabKey;
              return (
                <div
                  key={tab.path}
                  className={`mdi-bar__tab ${
                    isActive ? "mdi-bar__tab--active" : ""
                  }`}
                  onClick={() => handleTabClick(tab.path)}
                >
                  <span className="mdi-bar__tab-label">{getTabTitle(tab)}</span>
                  <FormButton
                    className="mdi-bar__tab-close"
                    icon={<i className="ri-close-circle-fill" />}
                    onClick={(e) => handleTabClose(e, tab.path)}
                  />
                </div>
              );
            })
          ) : (
            <div className="mdi-bar__tab mdi-bar__tab--active">
              <span className="mdi-bar__tab-label">홈</span>
            </div>
          )}
        </div>
        <div className="mdi-bar__actions">
          <Tooltip title="이전탭">
            <FormButton
              icon={<i className="ri-arrow-left-s-line" />}
              className="mdi-bar__action mdi-bar__action--prev-tab"
              onClick={handlePrevTab}
              disabled={activeIndex <= 0}
            />
          </Tooltip>
          <Tooltip title="다음탭">
            <FormButton
              icon={<i className="ri-arrow-right-s-line" />}
              className="mdi-bar__action mdi-bar__action--next-tab"
              onClick={handleNextTab}
              disabled={activeIndex >= openTabs.length - 1}
            />
          </Tooltip>

          {shouldShowMore && (
            <Dropdown
              placement="bottomLeft"
              overlayClassName="mdi-bar__tab-list-menu"
              dropdownRender={() => (
                <div className="mdi-bar__tab-list-menu-content">
                  <ul className="mdi-bar__tab-list-menu-item">
                    {hiddenTabs.map((tab) => {
                      const isActive = tab.path === activeTabKey;
                      return (
                        <li key={tab.path}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleTabClick(tab.path);
                            }}
                            style={{
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? "#747474" : undefined,
                            }}
                          >
                            {getTabTitle(tab)}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            >
              <Tooltip title="더보기">
                <FormButton
                  icon={<i className="ri-more-line" />}
                  className="mdi-bar__action mdi-bar__action--tab-list"
                />
              </Tooltip>
            </Dropdown>
          )}
          <Tooltip title="모두닫기">
            <FormButton
              icon={<i className="ri-close-line" />}
              className="mdi-bar__action mdi-bar__action--close"
              onClick={handleCloseAll}
              disabled={openTabs.length === 0 || !closeAllTabs}
            />
          </Tooltip>
        </div>
      </div>
    </TabBarStyles>
  );
};

export default TabBar;
