import React, { Suspense, useMemo, useCallback } from "react";
import { Typography, Button, Tooltip, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@store/uiStore";
import LoadingSpinner from "@components/common/loadingSpinner";
import {
  LeftSquareOutlined,
  CloseSquareOutlined,
  RightSquareOutlined,
} from "@ant-design/icons";
import {
  StyledContent,
  StyledContentInner,
  StyledWelcomeCard,
  StyledTabContent,
  StyledTabs,
} from "./MainContent.styles";

const { Title, Paragraph } = Typography;

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const { openTabs, activeTabKey, setActiveTabKey, removeTab, closeAllTabs } =
    useUiStore();

  const onEdit = useCallback(
    (targetKey: React.MouseEvent | React.KeyboardEvent | string) => {
      if (typeof targetKey === "string") {
        removeTab(targetKey);
      }
    },
    [removeTab]
  );

  const activeIndex = useMemo(() => {
    return openTabs.findIndex((tab) => tab.path === activeTabKey);
  }, [openTabs, activeTabKey]);

  const handlePrevTab = useCallback(() => {
    if (activeIndex > 0 && activeIndex < openTabs.length) {
      setActiveTabKey(openTabs[activeIndex - 1].path);
    }
  }, [activeIndex, openTabs, setActiveTabKey]);

  const handleNextTab = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < openTabs.length - 1) {
      setActiveTabKey(openTabs[activeIndex + 1].path);
    }
  }, [activeIndex, openTabs, setActiveTabKey]);

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

  const tabBarExtraContent = (
    <Space>
      <Tooltip title={t("prev_tab", "이전 탭")}>
        <Button
          type="text"
          icon={<LeftSquareOutlined />}
          onClick={handlePrevTab}
          disabled={activeIndex <= 0 || activeIndex >= openTabs.length}
        />
      </Tooltip>
      <Tooltip title={t("next_tab", "다음 탭")}>
        <Button
          type="text"
          icon={<RightSquareOutlined />}
          onClick={handleNextTab}
          disabled={activeIndex < 0 || activeIndex >= openTabs.length - 1}
        />
      </Tooltip>
      <Tooltip title={t("close_all_tabs", "모두 닫기")}>
        <Button
          type="text"
          icon={<CloseSquareOutlined />}
          onClick={closeAllTabs}
          disabled={openTabs.length === 0}
        />
      </Tooltip>
    </Space>
  );

  return (
    <StyledContent>
      <StyledTabs
        hideAdd
        type="editable-card"
        onChange={setActiveTabKey}
        activeKey={activeTabKey || undefined}
        onEdit={onEdit}
        tabBarExtraContent={tabBarExtraContent}
        items={openTabs.map((tab) => {
          const Element = tab.element;
          return {
            label: t(tab.meta?.title || "No Title"),
            key: tab.path,
            children: (
              <StyledTabContent>
                <Suspense fallback={<LoadingSpinner />}>
                  {React.isValidElement(Element)
                    ? Element
                    : Element
                    ? React.createElement(Element as React.ComponentType)
                    : null}
                </Suspense>
              </StyledTabContent>
            ),
            closable: true,
          };
        })}
      />
    </StyledContent>
  );
};

export default MainContent;
