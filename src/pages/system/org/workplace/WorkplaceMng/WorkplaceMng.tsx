// ============================================================================
// 사업장 관리 페이지 (WorkplaceMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2024.12.26 : Antigravity (Store 패턴 적용 및 대규모 리팩토링)

import React, { useEffect } from "react";
import TwoGridLayout from "@components/ui/layout/TwoGridLayout/TwoGridLayout";
import {
  Search,
  WorkplaceGrid,
  WorkplaceDetailPanel,
} from "@components/features/system/org/workplace/WorkplaceMng";
import { useWorkplaceMngStore } from "@store/system/org/workplace/workplaceMngStore";

const WorkplaceMng: React.FC = () => {
  const { reset, fetchWorkplaceList } = useWorkplaceMngStore();

  useEffect(() => {
    // Initial fetch
    fetchWorkplaceList();
    return () => reset();
  }, [fetchWorkplaceList, reset]);

  return (
    <TwoGridLayout
      filterPanel={<Search />}
      leftPanel={<WorkplaceGrid />}
      rightPanel={<WorkplaceDetailPanel />}
      leftPanelSize="50%"
    />
  );
};

export default WorkplaceMng;
