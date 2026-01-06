import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ListDetailLayout from "@/components/ui/layout/ListDetailLayout/ListDetailLayout";
// import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout/SearchGridLayout";
// // import VerticalSplitLayout from "@/components/ui/layout/VerticalSplitLayout/VerticalSplitLayout";
// import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
// import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";
import SearchTripleStackLayout from "@/components/ui/layout/SearchTripleStackLayout/SearchTripleStackLayout";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import SearchTriPaneLayout from "@/components/ui/layout/SearchTriPaneLayout/SearchTriPaneLayout";
import SearchTriPanel from "@/components/ui/layout/SearchTriPaneLayout/SearchTriPanel";
import {
  FilterPanel,
  DetailGrid,
  RecordList,
  DetailView,
} from "@components/features/sample2";
import styled from "styled-components";

import { useUiStore } from "@store/com/ui/uiStore";
import * as mixins from "@/styles/mixins";
const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "좌측그리드(리스트)+헤더+디테일 Splitter",
    children: (
      <ListDetailLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        listPanel={<RecordList className="page-layout__record-list" />}
        detailPanel={<DetailView className="page-layout__detail-view" />}
        detailBottomPanel={<DetailGrid className="page-layout__detail-grid" />}
      />
    ),
  },
  {
    key: "2",
    label: "그리드(단일)",
    children: (
      <SearchGridLayout
      className="page-layout--search-grid-panel"
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={<DetailGrid className="page-layout__detail-grid" />}
      />
    ),
  },
  // {
  //   key: "3",
  //   label: "그리드(좌) + 그리드(우) Splitter",
  //   children: (
  //     <TwoGridLayout
  //       filterPanel={<FilterPanel className="page-layout__filter-panel" />}
  //       leftPanel={<DetailGrid className="page-layout__grid" />}
  //       rightPanel={<DetailGrid className="page-layout__grid" />}
  //     />
  //   ),
  // },
  // {
  //   key: "4",
  //   label: "그리드(상)+그리드(하) Splitter",
  //   children: (
  //     <VerticalSplitLayout
  //       filterPanel={<FilterPanel className="page-layout__filter-panel" />}
  //       topPanel={<DetailGrid className="page-layout__grid" />}
  //       bottomPanel={<DetailGrid className="page-layout__grid" />}
  //     />
  //   ),
  // },
  // {
  //   key: "5",
  //   label: "그리드(상)+그리드(하)",
  //   children: (
  //     <VerticalLayout
  //       filterPanel={<FilterPanel className="page-layout__filter-panel" />}
  //       topPanel={<DetailGrid className="page-layout__grid" />}
  //       bottomPanel={<DetailGrid className="page-layout__grid" />}
  //     />
  //   ),
  // },
  // {
  //   key: "6",
  //   label: "그리드(좌)+그리드(우상단)+그리드(우하단) Splitter",
  //   children: (
  //     <SearchTripleGridLayout
  //       filterPanel={<FilterPanel className="page-layout__filter-panel" />}
  //       leftPanel={<DetailGrid className="page-layout__grid" />}
  //       rightTopPanel={<DetailGrid className="page-layout__grid" />}
  //       rightBottomPanel={<DetailGrid className="page-layout__grid" />}
  //       rightTopPanelSize="50%"
  //       rightBottomPanelSize="50%"
  //     />
  //   ),
  // },
  {
    key: "7",
    label: "그리드(좌)+그리드(우상단)+그리드(우하단)",
    children: (
      <TwoGridSaveLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={<SearchTripleStackLayout 
            leftPanel={<DetailGrid className="page-layout__grid" />}
            rightTopPanel={<DetailGrid className="page-layout__grid" />}
            rightBottomPanel={<DetailGrid className="page-layout__grid" />}
        />}
      />
    ),
  },
  {
    key: "8",
    label: "그리드(좌) + 그리드(우) + 저장버튼 ",
    children: (
      <TwoGridSaveLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={
          <TowGridSaveLayout
            primaryPanel={<DetailGrid className="page-layout__grid" />}
            secondaryPanel={<DetailGrid className="page-layout__grid" />}
          />
        }
      />
    ),
  },
  {
    key: "9",
    label: "그리드(좌)+그리드(우상단)+그리드(우하단) Splitter ",
    children: (
      <SearchTriPaneLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={
          <SearchTriPanel
            leftPanel={<DetailGrid className="page-layout__grid" />}
            rightTopPanel={<DetailGrid className="page-layout__grid" />}
            rightBottomPanel={<DetailGrid className="page-layout__grid" />}
          />
        }
      />
    ),
  },
];

const LayoutSample: React.FC = () => {
  // UI Store (탭 파라미터 받기)
  const { activeTabKey, openTabs } = useUiStore();

  // 중복 실행 방지용 ref
  const printedParamsRef = React.useRef<string | null>(null);

  // 파라미터 계산 (useMemo로 최적화)
  const params = React.useMemo(() => {
    const activeTab = activeTabKey
      ? openTabs.find((tab) => tab.path === activeTabKey)
      : null;

    return (
      activeTab?.meta?.params ||
      openTabs.find((tab) => tab.meta?.params)?.meta?.params ||
      null
    );
  }, [activeTabKey, openTabs]);

  // 파라미터가 변경될 때만 출력
  React.useEffect(() => {
    if (params) {
      // 파라미터를 문자열로 변환해서 비교 (중복 출력 방지)
      const paramsKey = JSON.stringify(params);

      // 이미 출력한 파라미터가 아니면 출력
      if (printedParamsRef.current !== paramsKey) {
        printedParamsRef.current = paramsKey;
        console.log("=== LayoutSample 전달받은 파라미터 ===");
        console.log("파라미터:", params);
        console.log("================================");
      }
    }
  }, [params]);

  return (
    <LayoutTabs
      className="tabs-overlap-scroll"
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
    />
  );
};

export const LayoutTabs = styled(Tabs)`
  &.tabs-overlap-scroll .ant-tabs-nav {
    margin: 0;
  }
  &.tabs-overlap-scroll .ant-tabs-nav-wrap {
    height: 44px;
  }
  &.tabs-overlap-scroll .ant-tabs-nav-wrap,
  &.tabs-overlap-scroll .ant-tabs-nav-list {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-gutter: stable;
    ${mixins.scrollbar()}
  }
  &.tabs-overlap-scroll .ant-tabs-nav-wrap::-webkit-scrollbar,
  &.tabs-overlap-scroll .ant-tabs-nav-list::-webkit-scrollbar {
    height: 2px;
  }
  .ant-tabs-nav {
    margin: 0;
  }

  .ant-tabs-nav .ant-tabs-nav-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    div {
      font-size: 13px;
    }
  }

  .ant-tabs-tab {
    white-space: nowrap;
    padding: 12px 10px;
    margin-left: 10px !important;
  }
`;

export default LayoutSample;
