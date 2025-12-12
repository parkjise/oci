import React from "react";
import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
import {
  FilterPanel,
  LeftGrid,
  DetailView,
  DetailGrid,
} from "@components/features/fcm/md/partner/BcncRegist";

const BcncRegist: React.FC = () => {
  return (
    <SearchTripleGridLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      leftPanel={<LeftGrid className="page-layout__left-grid" />}
      rightTopPanel={<DetailView className="page-layout__detail-view" />}
      rightBottomPanel={<DetailGrid className="page-layout__bottom-panel" />}
      leftPanelSize="30%"
    />
  );
};

export default BcncRegist;
