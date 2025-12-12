import React from "react";
import { SearchGridLayout } from "@/components/ui/layout/SearchGridLayout";
import {
  FilterPanel,
  DetailGrid,
} from "@components/features/fcm/gl/slip/SlipPost";

const SlipPost: React.FC = () => {
  return (
    <SearchGridLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      grid={<DetailGrid className="page-layout__detail-grid" />}
    />
  );
};

export default SlipPost;
