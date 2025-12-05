import { Tabs } from "antd";
import type { TabsProps } from "antd";
import ListDetailLayout from "@/components/ui/layout/ListDetailLayout/ListDetailLayout";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout/SearchGridLayout";
import VerticalSplitLayout from "@/components/ui/layout/VerticalSplitLayout/VerticalSplitLayout";
import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
import { FilterPanel, DetailGrid } from "@components/features/sample2";
import {
  FilterPanel as FilterPanel2,
  RecordList,
  DetailView,
  DetailGrid as DetailGrid2,
} from "@components/features/sample2";
import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "좌측그리드(리스트)+헤더+디테일 Splitter",
    children: (
      <ListDetailLayout
        filterPanel={<FilterPanel2 className="page-layout__filter-panel" />}
        listPanel={<RecordList className="page-layout__record-list" />}
        detailPanel={<DetailView className="page-layout__detail-view" />}
        detailBottomPanel={<DetailGrid2 className="page-layout__detail-grid" />}
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
    children: <TwoGridLayout />,
  },
  {
    key: "4",
    label: "그리드(상)+그리드(하) Splitter",
    children: <VerticalSplitLayout />,
  },
  {
    key: "5",
    label: "그리드(상)+그리드(하)",
    children: <VerticalLayout />,
  },
  {
    key: "6",
    label: "그리드(좌)+그리드(우상단)+그리드(우하단)",
    children: <SearchTripleGridLayout />,
  },
];
const LayoutSample: React.FC = () => (
  <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
);

export default LayoutSample;
