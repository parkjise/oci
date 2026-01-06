import React, { useRef, useEffect, useCallback } from "react";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import { MasterGrid, DetailGrid, FilterPanel } from "@components/features/fcm/md/account/AtmcJrnlzMastrSetup";
import type { FilterPanelHandle } from "@components/features/fcm/md/account/AtmcJrnlzMastrSetup/FilterPanel/FilterPanel";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout/GridSaveLayout";
import { message } from "antd";
import { saveAtmcJrnlzMastrSetup } from "@/apis/fcm/md/account/atmcJrnlzMastrSetupApi";
import type { AtmcJrnlzMastrSetupSaveRequest, AtmcJrnlzMastrSetupHderData, AtmcJrnlzMastrSetupDetailData, DetailRowData } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

const AtmcJrnlzMastrSetup: React.FC = () => {
  const filterPanelRef = useRef<FilterPanelHandle>(null);
  const { masterList, detailCache, fetchMasterList, reset, setLoading } = useAtmcJrnlzMastrSetupStore();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSave = useCallback(async () => {
    const modifiedMaster = masterList.filter((item) => item.rowStatus);
    const allDetails = Object.values(detailCache).flat();
    const modifiedDetail = allDetails.filter((item) => item.rowStatus);

    if (modifiedMaster.length === 0 && modifiedDetail.length === 0) {
      message.info("변경사항이 없습니다.");
      return;
    }

    try {
      setLoading(true);
      const request: AtmcJrnlzMastrSetupSaveRequest = {
        headerList: modifiedMaster.map((item) => ({
          rowStatus: item.rowStatus,
          applName: item.applName,
          accountingType: item.accountingType,
          glItem: item.glItem,
          description: item.description,
          oriApplName: item.oriApplName,
          oriAccountingType: item.oriAccountingType,
          oriGlItem: item.oriGlItem,
        })) as AtmcJrnlzMastrSetupHderData[],
        detailList: modifiedDetail.map((item) => ({
          rowStatus: item.rowStatus,
          officeId: item.officeId,
          applName: item.applName,
          accountingType: item.accountingType,
          glItem: item.glItem,
          glClass: item.glClass,
          accountCode: item.accountCode,
          cusCde: item.cusCde,
          itemCode: item.itemCode,
          oriApplName: item.oriApplName,
          oriAccountingType: item.oriAccountingType,
          oriGlItem: item.oriGlItem,
          oriGlClass: item.oriGlClass,
        })) as AtmcJrnlzMastrSetupDetailData[],
      };

      const response = await saveAtmcJrnlzMastrSetup(request);
      if (response.success) {
        message.success("저장에 성공하였습니다.");

        const { detailCache: latestCache, masterList: latestMasters, detailList: latestDetails } = useAtmcJrnlzMastrSetupStore.getState();

        const updatedMasters = latestMasters
          .filter((m) => m.rowStatus !== "D")
          .map((m) => ({ ...m, rowStatus: undefined }));

        const updatedDetails = latestDetails
          .filter((d) => d.rowStatus !== "D")
          .map((d) => ({ ...d, rowStatus: undefined }));

        const cleanedCache: Record<string, DetailRowData[]> = {};
        Object.keys(latestCache).forEach((key) => {
          cleanedCache[key] = latestCache[key]
            .filter((d) => d.rowStatus !== "D")
            .map((d) => ({ ...d, rowStatus: undefined }));
        });

        useAtmcJrnlzMastrSetupStore.setState({
          masterList: updatedMasters,
          detailList: updatedDetails,
          detailCache: cleanedCache,
        });

        await fetchMasterList();
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [masterList, detailCache, fetchMasterList, setLoading]);

  return (
    <TwoGridSaveLayout
      filterPanel={<FilterPanel ref={filterPanelRef} className="page-layout__filter-panel" />}
      grid={
        <GridSaveLayout onSave={handleSave}>
          <TowGridSaveLayout
            primaryPanel={<MasterGrid className="page-layout__grid" />}
            secondaryPanel={<DetailGrid className="page-layout__grid" />}
            leftPanelSize="60%"
          />
        </GridSaveLayout>
      }
    />
  );
};

export default AtmcJrnlzMastrSetup;