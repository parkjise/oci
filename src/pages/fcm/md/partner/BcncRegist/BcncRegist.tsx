import React, { memo } from "react";
import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
import {
  FilterPanel,
  LeftGrid,
  DetailView,
  DetailGrid,
} from "@components/features/fcm/md/partner/BcncRegist";

// ⚡ [성능 최적화] 각 컴포넌트를 memo로 감싸서 불필요한 리렌더링 방지
const MemoizedFilterPanel = memo(FilterPanel);
const MemoizedLeftGrid = memo(LeftGrid);
const MemoizedDetailView = memo(DetailView);
const MemoizedDetailGrid = memo(DetailGrid);

const BcncRegist: React.FC = () => {
  return (
    <SearchTripleGridLayout
      filterPanel={
        <MemoizedFilterPanel className="page-layout__filter-panel" />
      }
      leftPanel={<MemoizedLeftGrid className="page-layout__left-grid" />}
      rightTopPanel={
        <MemoizedDetailView className="page-layout__detail-view" />
      }
      rightBottomPanel={
        <MemoizedDetailGrid className="page-layout__bottom-panel" />
      }
      leftPanelSize="25%"
    />
  );
};

export default BcncRegist;
