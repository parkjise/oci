import React, { useEffect } from "react";
import { SearchGridSaveLayout } from "@/components/ui/layout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import {
  FilterPanel,
  DetailGrid,
} from "@components/features/fcm/gl/slip/SlipPost";
import { useSlipPostStore } from "@/store/fcm/gl/slip/SlipPost";

const SlipPost: React.FC = () => {
  // Store에서 저장 액션 직접 가져오기 (ref 기반 통신 제거)
  const handleSave = useSlipPostStore((state) => state.handleSaveFromGrid);
  const reset = useSlipPostStore((state) => state.reset);

  // 화면 이탈 시 데이터 초기화 (cleanup)
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <SearchGridSaveLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      grid={
        <GridSaveLayout onSave={handleSave}>
          <DetailGrid className="page-layout__detail-grid" />
        </GridSaveLayout>
      }
    />
  );
};

export default SlipPost;
