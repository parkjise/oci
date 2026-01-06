import React, { useRef, useState, useCallback } from "react";
import SearchGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import {
  FilterPanel,
  MainGrid,
} from "@components/features/fcm/md/other/BankAcnutRegist";
import type { BankAcnutRowData, MainGridHandle } from "@components/features/fcm/md/other/BankAcnutRegist/MainGrid/MainGrid";
import type { FilterPanelHandle } from "@components/features/fcm/md/other/BankAcnutRegist/FilterPanel/FilterPanel";

const BankAcnutRegist: React.FC = () => {
  const [rowData, setRowData] = useState<BankAcnutRowData[]>([]);
  const filterPanelRef = useRef<FilterPanelHandle>(null);
  const mainGridRef = useRef<MainGridHandle>(null);

  const handleSaveSuccess = useCallback(() => {
    filterPanelRef.current?.handleSearch();
  }, []);

  const handleSave = useCallback(() => {
    mainGridRef.current?.handleSave();
  }, []);

  return (
    <SearchGridSaveLayout
      filterPanel={
        <FilterPanel
          ref={filterPanelRef}
          className="page-layout__filter-panel"
          setRowData={setRowData}
        />
      }
      grid={
        <GridSaveLayout onSave={handleSave}>
          <MainGrid
            ref={mainGridRef}
            className="page-layout__main-grid"
            rowData={rowData}
            setRowData={setRowData}
            onSaveSuccess={handleSaveSuccess}
          />
        </GridSaveLayout>
      }
      gridClassName="page-card--detail-grid"
    />
  );
};

export default BankAcnutRegist;
