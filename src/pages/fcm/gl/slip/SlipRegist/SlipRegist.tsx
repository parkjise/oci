import React from "react";
import { ListDetailLayout } from "@/components/ui/layout/ListDetailLayout";
import {
  FilterPanel,
  RecordList,
  DetailView,
  DetailGrid,
} from "@components/features/fcm/gl/slip/SlipRegist";

const SlipRegist: React.FC = () => {
  return (
    <ListDetailLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      listPanel={<RecordList className="page-layout__list-panel" />}
      detailPanel={<DetailView className="page-layout__detail-view" />}
      detailBottomPanel={<DetailGrid className="page-layout__detail-grid" />}
    />
  );
};

export default SlipRegist;
