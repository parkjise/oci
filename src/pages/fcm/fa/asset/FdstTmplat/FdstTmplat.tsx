import React, { useCallback, useRef, useState } from "react";
import GridSaveLayout from "@components/ui/layout/GridSaveLayout";
import { MainGrid } from "@components/features/fcm/fa/asset/FdstTmplat";
import type { FdstTmplatListResponse } from "@/types/fcm/fa.asset/fdstTmplat.types";
import type { GridApi } from "ag-grid-community";
import { SearchGridSaveLayout } from "@components/ui/layout/SearchGridSaveLayout";
import { FormButton } from "@form";
import { selectFdstTmplatList } from "@apis/fcm/fa/asset/assetApi";
import { LoadingSpinner } from "@/components";
import { useTranslation } from "react-i18next";

const FdstTmplat: React.FC = () => {
  const { t } = useTranslation();

  const [list, setList] = useState<FdstTmplatListResponse[]>([]);
  const [originMap, setOriginMap] = useState<Map<string, FdstTmplatListResponse>>(new Map());

  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const gridRef = useRef<GridApi<FdstTmplatListResponse> | null>(null);

  const handleSelectList = useCallback(async () => {
    // 이미 검색 중이면 중복 실행 방지
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const response = await selectFdstTmplatList();

      const newList = response.data.map((item) => ({
        ...item,
        uuid: `${item.interfaceId}`,
        willDelete: false,
        willUpdate: false,
        deprnFlag: item.deprnFlag ?? 'N',
        assetsCost: item.assetsCost ?? 0,
        governmentSubsidiesYn: item.governmentSubsidiesYn ?? 'N',
        ioChk: item.ioChk ?? 'N',
        costCodeChk: item.costCodeChk ?? 'N',
      }));

      setList(newList);
      console.log(newList);

      // 원본 데이터 보존을 위해 조회 시점의 상태를 Map으로 저장
      const newMap = new Map<string, FdstTmplatListResponse>();
      newList.forEach(item => newMap.set(item.uuid, { ...item }));
      setOriginMap(newMap);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, []);

  return (
    <>
      {
        /*
          ko: 조회 중...
          en: Fetching...
         */
      }
      {loading && <LoadingSpinner tip={t("조회_중")} />}
      <SearchGridSaveLayout
        grid={
          <GridSaveLayout
            onSave={() => {}}
            buttonGroupProps={{
              customButtons: [
                <FormButton
                  key="search"
                  onClick={handleSelectList}
                >
                  조회
                </FormButton>,
              ],
              showCustomButtonsDivider: true,
              showAllCustomButtons: true,
            }}
          >
            <MainGrid
              className="page-layout__main-grid"
              list={list}
              setList={setList}
              originMap={originMap}
              gridRef={gridRef}
            />
          </GridSaveLayout>
        }
        gridClassName="page-card--detail-grid"
      />
    </>

  );
}

export default FdstTmplat;
