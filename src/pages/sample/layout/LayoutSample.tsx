import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ListDetailLayout from "@/components/ui/layout/ListDetailLayout/ListDetailLayout";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout/SearchGridLayout";
import VerticalSplitLayout from "@/components/ui/layout/VerticalSplitLayout/VerticalSplitLayout";
import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";
import SearchTripleStackLayout from "@/components/ui/layout/SearchTripleStackLayout/SearchTripleStackLayout";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import {
  FilterPanel,
  DetailGrid,
  RecordList,
  DetailView,
} from "@components/features/sample2";
import styled from "styled-components";
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
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={<DetailGrid className="page-layout__detail-grid" />}
      />
    ),
  },
  {
    key: "3",
    label: "그리드(좌) + 그리드(우) Splitter",
    children: (
      <TwoGridLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        leftPanel={<DetailGrid className="page-layout__grid" />}
        rightPanel={<DetailGrid className="page-layout__grid" />}
      />
    ),
  },
  {
    key: "4",
    label: "그리드(상)+그리드(하) Splitter",
    children: (
      <VerticalSplitLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        topPanel={<DetailGrid className="page-layout__grid" />}
        bottomPanel={<DetailGrid className="page-layout__grid" />}
      />
    ),
  },
  {
    key: "5",
    label: "그리드(상)+그리드(하)",
    children: (
      <VerticalLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        topPanel={<DetailGrid className="page-layout__grid" />}
        bottomPanel={<DetailGrid className="page-layout__grid" />}
      />
    ),
  },
  {
    key: "6",
    label: "그리드(좌)+그리드(우상단)+그리드(우하단) Splitter",
    children: (
      <SearchTripleGridLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        leftPanel={<DetailGrid className="page-layout__grid" />}
        rightTopPanel={<DetailGrid className="page-layout__grid" />}
        rightBottomPanel={<DetailGrid className="page-layout__grid" />}
        rightTopPanelSize="40%"
        rightBottomPanelSize="60%"
      />
    ),
  },
  {
    key: "7",
    label: "그리드(좌)+그리드(우상단)+그리드(우하단)",
    children: <SearchTripleStackLayout />,
  },
  {
    key: "8",
    label: "그리드(좌) + 그리드(우) + 저장버튼 ",
    children: (
      <TwoGridSaveLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={
          <TowGridSaveLayout
            leftPanel={<DetailGrid className="page-layout__grid" />}
            rightPanel={<DetailGrid className="page-layout__grid" />}
          />
        }
      />
    ),
  },
];

const LayoutSample: React.FC = () => (
  <LayoutTabs defaultActiveKey="1" items={items} onChange={onChange} />
);

export const LayoutTabs = styled(Tabs)`
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
