import React, { Suspense } from "react";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@store/com/ui/uiStore";
import { LoadingSpinner } from "@components/ui/feedback";
import {
  StyledContent,
  StyledContentInner,
  StyledWelcomeCard,
  StyledTabContent,
  StyledTabPanel,
} from "./MainContent.styles";
import TabBar from "./TabBar";

const { Title, Paragraph } = Typography;

// Module-level cache to survive MainContent component remounts
const globalTabComponentCache = new Map<string, React.ComponentType>();

// 탭 패널 컴포넌트 - React.memo로 최적화
const TabPanel: React.FC<{
  isActive: boolean;
  Component: React.ComponentType;
}> = React.memo(
  ({ isActive, Component }) => {
    return (
      <StyledTabPanel
        $isActive={isActive}
        role="tabpanel"
        aria-hidden={!isActive}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Component />
        </Suspense>
      </StyledTabPanel>
    );
  },
  (prevProps, nextProps) => {
    // Component 타입이 같고, 활성 상태가 같으면 재렌더링 방지
    return (
      prevProps.Component === nextProps.Component &&
      prevProps.isActive === nextProps.isActive
    );
  }
);
TabPanel.displayName = "TabPanel";

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const { openTabs, activeTabKey, setActiveTabKey, removeTab, closeAllTabs } =
    useUiStore();

  // 렌더링 중에 전역 캐시를 동기적으로 업데이트
  const currentPaths = new Set<string>();
  openTabs.forEach((tab) => {
    currentPaths.add(tab.path);
    if (tab.element && !globalTabComponentCache.has(tab.path)) {
      globalTabComponentCache.set(tab.path, tab.element as React.ComponentType);
    }
  });

  // 닫힌 탭을 전역 캐시에서 제거
  for (const path of Array.from(globalTabComponentCache.keys())) {
    if (!currentPaths.has(path)) {
      globalTabComponentCache.delete(path);
    }
  }

  const tabPanels = openTabs.map((tab) => {
    const Component = globalTabComponentCache.get(tab.path);
    if (!Component) {
      return null;
    }
    const isActive = tab.path === activeTabKey;
    return (
      <TabPanel key={tab.path} isActive={isActive} Component={Component} />
    );
  });

  // 로그인 후 열려있는 탭이 없을 때 환영 메시지 표시
  if (openTabs.length === 0) {
    return (
      <StyledContent>
        <StyledContentInner>
          <StyledWelcomeCard>
            <Title level={2}>{t("welcome_main", "환영합니다!")}</Title>
            <Paragraph>
              {t("main_description", "좌측 메뉴를 클릭하여 시작하세요.")}
            </Paragraph>
          </StyledWelcomeCard>
        </StyledContentInner>
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      {/* 탭 바 */}
      <TabBar
        openTabs={openTabs}
        activeTabKey={activeTabKey}
        setActiveTabKey={setActiveTabKey}
        removeTab={removeTab}
        closeAllTabs={closeAllTabs}
      />
      {/* 탭 내용 영역 - 모든 탭을 렌더링하되 활성화된 탭만 표시 */}
      <StyledTabContent>
        {tabPanels}
      </StyledTabContent>
    </StyledContent>
  );
};

export default MainContent;