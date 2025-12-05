import React, { useRef } from "react";
import { ListDetailLayout } from "@/components/ui/layout/ListDetailLayout";
import {
  FilterPanel,
  DetailGrid,
} from "@components/features/fcm/gl/slip/slipPost";
import { useSlipPostStore } from "@store/slipPostStore";

const SlipPost: React.FC = () => {
  const { searchData, setSPostYn } = useSlipPostStore();
  const filterPanelRef = useRef<{ handleSearch: () => Promise<void> } | null>(
    null
  );

  return (
    <ListDetailLayout
      filterPanel={
        <FilterPanel
          className="page-layout__filter-panel"
          onPostYnChange={setSPostYn}
          onRefReady={(ref) => {
            filterPanelRef.current = ref;
          }}
        />
      }
      detailPanel={
        <DetailGrid className="page-layout__detail-grid" rowData={searchData} />
      }
    />
  );
};

export default SlipPost;
