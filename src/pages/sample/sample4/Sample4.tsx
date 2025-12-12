import React from "react";
import { ListDetailLayout } from "@/components/ui/layout/ListDetailLayout";
import DetailView from "./DetailView";
import RecordList from "./RecordList";
import FilterPanel from "./FilterPanel";
import DetailGrid from "./DetailGrid";
const Sample4: React.FC = () => {
  return (
    <ListDetailLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      listPanel={<RecordList className="page-layout__list-panel" />}
      detailPanel={<DetailView className="page-layout__detail-view" />}
      detailBottomPanel={<DetailGrid className="page-layout__detail-grid" />}
    />
  );
};

export default Sample4;
