import React from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
  FilterPanel,
  LeftGrid,
  RightGrid,
} from "@components/features/fcm/gl/settlement/fgcryEvl";

const FgcryEvl: React.FC = () => {
  return (
    <TwoGridLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      leftPanel={<LeftGrid className="page-layout__left-grid" />}
      rightPanel={<RightGrid className="page-layout__right-grid" />}
    />
  );
};

export default FgcryEvl;
