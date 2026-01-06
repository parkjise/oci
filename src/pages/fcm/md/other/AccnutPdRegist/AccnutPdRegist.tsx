import React, { useEffect, useMemo, useRef } from "react";
import { SearchGridSaveLayout } from "@/components/ui/layout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import {
  FilterPanel,
  PeriodGrid,
} from "@/components/features/fcm/md/other/AccnutPdRegist";
import type { PeriodGridRef } from "@/components/features/fcm/md/other/AccnutPdRegist/PeriodGrid/PeriodGrid";
import { useAccnutPdRegistStore } from "@/store/fcm/md/other/AccnutPdRegist/accnutPdRegistStore";
import type { ActionButtonType } from "@/components/ui/form/Button/ActionButton";

const AccnutPdRegist: React.FC = () => {
  const gridRef = useRef<PeriodGridRef>(null);

  const initPage = useAccnutPdRegistStore((state) => state.initPage);
  const savePeriodList = useAccnutPdRegistStore(
    (state) => state.savePeriodList
  );
  const canModify = useAccnutPdRegistStore((state) => state.canModify);
  const reset = useAccnutPdRegistStore((state) => state.reset);

  // 페이지 초기화
  useEffect(() => {
    initPage();
  }, [initPage]);

  // Reset store on unmount to clear data when tab is closed
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // 권한에 따라 숨길 버튼 결정
  const hideButtons = useMemo<ActionButtonType[]>(() => {
    const hidden: ActionButtonType[] = ["edit", "expand"];
    if (!canModify) {
      hidden.push("create", "delete", "copy");
    }
    return hidden;
  }, [canModify]);

  return (
    <SearchGridSaveLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      grid={
        <GridSaveLayout
          onSave={savePeriodList}
          onButtonClick={{
            create: () => gridRef.current?.handleAddRow(),
            delete: () => gridRef.current?.handleDeleteRow(),
            copy: () => gridRef.current?.handleCopyRow(),
          }}
          hideButtons={hideButtons}
        >
          <PeriodGrid ref={gridRef} className="page-layout__detail-grid" />
        </GridSaveLayout>
      }
    />
  );
};

export default AccnutPdRegist;
