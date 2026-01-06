import React, { useRef, useCallback } from "react";
import SearchGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import {
    FilterPanel,
    DetailGrid as MainGrid,
} from "@components/features/fcm/md/account/AccnutMngCodeRegist";

const AccnutMngCodeRegist: React.FC = () => {
    const filterPanelRef = useRef<{ handleSearch: () => Promise<void> } | null>(null);
    const mainGridRef = useRef<{ handleSave: () => Promise<void> } | null>(null);

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
                    onRefReady={(ref) => { filterPanelRef.current = ref; }}
                    className="page-layout__filter-panel"
                />
            }
            grid={
                <GridSaveLayout onSave={handleSave}>
                    <MainGrid
                        ref={mainGridRef}
                        className="page-layout__main-grid"
                        onSaveSuccess={handleSaveSuccess}
                    />
                </GridSaveLayout>
            }
            gridClassName="page-card--detail-grid"
        />
    );
};

export default AccnutMngCodeRegist;