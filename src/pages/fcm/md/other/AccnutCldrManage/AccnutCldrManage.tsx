import { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, message } from "antd";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import { SearchGridSaveLayout } from "@/components/ui/layout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import { useAccnutCldrManageStore } from "@/store/fcm/md/other/AccnutCldrManage";
import {
  FilterPanel,
  CalendarGrid,
  HolidayGrid,
} from "@/components/features/fcm/md/other/AccnutCldrManage";
import { useUiStore } from "@store/com/ui/uiStore";
import { FormButton } from "@/components/ui/form";
import styled from "styled-components";

const AccnutCldrManage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState<string>("holiday");
  const { openTabs, activeTabKey: uiActiveTabKey } = useUiStore();

  const fetchCldrList = useAccnutCldrManageStore(
    (state) => state.fetchCldrList
  );
  const fetchRestdeList = useAccnutCldrManageStore(
    (state) => state.fetchRestdeList
  );
  const saveCldr = useAccnutCldrManageStore((state) => state.saveCldr);
  const saveRestde = useAccnutCldrManageStore((state) => state.saveRestde);
  const reset = useAccnutCldrManageStore((state) => state.reset);
  const createCldr = useAccnutCldrManageStore((state) => state.createCldr);
  const copyRestde = useAccnutCldrManageStore((state) => state.copyRestde);

  // 초기 파라미터 처리
  const initialParams = useMemo(() => {
    const currentTab = openTabs.find((tab) => tab.path === uiActiveTabKey);
    return currentTab?.meta?.params as Record<string, unknown> | undefined;
  }, [openTabs, uiActiveTabKey]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTabKey(key);
      // 탭 변경 시 해당 탭의 데이터 조회
      const lastSearchRequest =
        useAccnutCldrManageStore.getState().lastSearchRequest;
      if (lastSearchRequest) {
        if (key === "holiday") {
          fetchRestdeList(lastSearchRequest);
        } else {
          fetchCldrList(lastSearchRequest);
        }
      }
    },
    [fetchCldrList, fetchRestdeList]
  );

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (activeTabKey === "holiday") {
      await saveRestde();
    } else {
      await saveCldr();
    }
  }, [activeTabKey, saveCldr, saveRestde]);

  // Calendar 생성 버튼 핸들러
  const handleCreateCalendar = useCallback(async () => {
    const lastSearchRequest =
      useAccnutCldrManageStore.getState().lastSearchRequest;
    if (!lastSearchRequest) {
      message.warning("먼저 조회를 실행해주세요.");
      return;
    }
    await createCldr(lastSearchRequest);
  }, [createCldr]);

  // 전년도 복사 버튼 핸들러
  const handleCopyHoliday = useCallback(async () => {
    const lastSearchRequest =
      useAccnutCldrManageStore.getState().lastSearchRequest;
    if (!lastSearchRequest) {
      message.warning("먼저 조회를 실행해주세요.");
      return;
    }
    await copyRestde(lastSearchRequest);
  }, [copyRestde]);

  // 컴포넌트 언마운트 시 초기화
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // 커스텀 버튼 메모이제이션
  const customButtons = useMemo(
    () => [
      <FormButton
        key="create-calendar"
        size="small"
        onClick={handleCreateCalendar}
        disabled={activeTabKey === "holiday"}
      >
        {t("Calendar_생성")}
      </FormButton>,
      <FormButton
        key="copy-holiday"
        size="small"
        onClick={handleCopyHoliday}
        disabled={activeTabKey === "calendar"}
      >
        {t("전년도_복사")}
      </FormButton>,
    ],
    [t, activeTabKey, handleCreateCalendar, handleCopyHoliday]
  );

  // 탭 아이템 정의 (children은 한번만 생성)
  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: "holiday",
        label: t("휴일"),
        children: (
          <HolidayGrid
            className="page-layout__detail-grid"
            isActive={activeTabKey === "holiday"}
          />
        ),
      },
      {
        key: "calendar",
        label: t("달력"),
        children: <CalendarGrid className="page-layout__detail-grid" />,
      },
    ],
    [t, activeTabKey]
  );

  // FilterPanel 메모이제이션
  const filterPanel = useMemo(
    () => (
      <FilterPanel
        className="page-layout__filter-panel"
        initialParams={initialParams}
        activeTabKey={activeTabKey}
      />
    ),
    [initialParams, activeTabKey]
  );

  // Grid 영역 메모이제이션
  const gridContent = useMemo(
    () => (
      <GridSaveLayout
        onSave={handleSave}
        buttonGroupProps={{
          customButtons,
        }}
      >
        <StyledTabs
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={tabItems}
        />
      </GridSaveLayout>
    ),
    [handleSave, customButtons, activeTabKey, handleTabChange, tabItems]
  );

  return <SearchGridSaveLayout filterPanel={filterPanel} grid={gridContent} />;
};

const StyledTabs = styled(Tabs)`
  height: 100%;
  overflow: hidden;

  .ant-tabs-content-holder {
    overflow: auto;
  }
`;

export default AccnutCldrManage;
