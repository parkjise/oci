import React from "react";
import { SearchGridSaveLayout } from "@/components/ui/layout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import { useBcncAcnutRegistStore } from "@/store/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegistStore";
import {
  FilterPanel,
  BcncAcnutRegistGrid,
} from "@/components/features/fcm/md/partner/BcncAcnutRegist";

import { useUiStore } from "@store/com/ui/uiStore";

const BcncAcnutRegist: React.FC = () => {
  const saveData = useBcncAcnutRegistStore((state) => state.saveData);
  const openTabs = useUiStore((state) => state.openTabs);
  const activeTabKey = useUiStore((state) => state.activeTabKey);
  const reset = useBcncAcnutRegistStore((state) => state.reset);

  const handleSave = React.useCallback(async () => {
    await saveData();
  }, [saveData]);

  // Reset store on unmount to clear data when tab is closed
  React.useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const initialParams = React.useMemo(() => {
    const currentTab = openTabs.find((tab) => tab.path === activeTabKey);
    return currentTab?.meta?.params as Record<string, unknown> | undefined;
  }, [openTabs, activeTabKey]);

  return (
    <SearchGridSaveLayout
      filterPanel={
        <FilterPanel
          className="page-layout__filter-panel"
          initialParams={initialParams}
        />
      }
      grid={
        <GridSaveLayout onSave={handleSave}>
          <BcncAcnutRegistGrid className="page-layout__detail-grid" />
        </GridSaveLayout>
      }
    />
  );
};

export default BcncAcnutRegist;
