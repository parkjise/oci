/**
 * 재무회계 > 기준정보 > 계정코드관리 > 표준재무제표 등록
 *
 * @description 표준재무제표 등록
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, type TabsProps } from "antd";
import SearchGridLayout from "@components/ui/layout/SearchGridLayout";
import type {
  StdFnnrTblatRegistDetailData,
  StdFnnrTblatRegistDetailListResponse,
  StdFnnrTblatRegistMainData,
  StdFnnrTblatRegistMainListResponse,
  StdFnnrTblatRegistSrchRequest
} from "@/types/fcm/md/account/stdFnnrTblatRegist.types";
import {
  saveStdFnnrTblatRegistDetail,
  saveStdFnnrTblatRegistMain,
  selectStdFnnrTblatRegistDetailList,
  selectStdFnnrTblatRegistMainList
} from "@apis/fcm/md/account/accountApi";
import { DetailGrid, FilterPanel, MainGrid } from "@components/features/fcm/md/account/StdFnnrTblatRegist";
import { LoadingSpinner, showSuccess, showWarning } from "@/components";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/com/auth";
import type { SelectOption } from "@components/features/fcm/md/partner/BcncRegist/Constants/SelectOption.ts";
import { getCodeListApi } from "@apis/system/code/codeApi.ts";
import GridSaveLayout from "@components/ui/layout/GridSaveLayout";
import type { ColDef, GridApi } from "ag-grid-community";
import { getUUID } from "@utils/uuidUtils";

const StdFnnrTblatRegist: React.FC = () => {
  const { t } = useTranslation();
  const [mainList, setMainList] = useState<StdFnnrTblatRegistMainListResponse[]>([]);
  const [detailList, setDetailList] = useState<StdFnnrTblatRegistDetailListResponse[]>([]);
  const [originMainMap, setOriginMainMap] = useState<Map<string, StdFnnrTblatRegistMainListResponse>>(new Map());
  const [originDetailMap, setOriginDetailMap] = useState<Map<string, StdFnnrTblatRegistDetailListResponse>>(new Map());
  const [filterOptions, setFilterOptions] = useState<SelectOption[]>([]);
  const [saving, setSaving] = useState(false);
  const isSavingRef = useRef(false);
  const searchRequestRef = useRef<StdFnnrTblatRegistSrchRequest | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('main');

  const mainGridRef = useRef<GridApi<StdFnnrTblatRegistMainListResponse> | null>(null);
  const detailGridRef = useRef<GridApi<StdFnnrTblatRegistDetailListResponse> | null>(null);

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const response = await getCodeListApi({
        module: 'GL',
        types: ['COTKND'],
        enabledFlag: 'Y',
      });
      if (response.success && response.data) {
        const mapped = response.data.map((value) => ({
          label: value.name1 ?? '',
          value: value.code,
        }));
        setFilterOptions(mapped);
        searchRequestRef.current = {
          asOfficeId: userOfficeId,
          asRepType: mapped[0]?.value ?? '',
        };
      }
    };
    fetchOptions();
  }, [userOfficeId]);

  const prohibitData = useCallback((colDef: ColDef | null) => {
    if (!colDef) {
      return;
    }
    const headerName = colDef.headerName ?? '';
    /*
      ko: {0}: 필수 입력 항목입니다.
      en: {0}: This is a required field.
     */
    const message = t("MSG_CM_2482");
    const warnMessage = `${headerName}: ${message.substring(4)}`;
    showWarning(warnMessage, 3);
    throw new Error(warnMessage);
  }, [t]);

  const handleSelectList = useCallback(async (data?: StdFnnrTblatRegistSrchRequest) => {
    // data가 없으면 최근 사용했던 searchRequestRef.current 또는 filterOptions의 첫 번째 값을 사용
    const request = data || searchRequestRef.current || {
      asOfficeId: userOfficeId,
      asRepType: filterOptions[0]?.value ?? '',
    };

    if (!request.asRepType) return;

    searchRequestRef.current = request;

    try {
      const [mainResponse, detailResponse] = await Promise.all([
        selectStdFnnrTblatRegistMainList(request),
        selectStdFnnrTblatRegistDetailList(request)
      ]);

      const newMainList = mainResponse.data.map((item) => ({
        ...item,
        useYn: !item.useYn ? 'N' : item.useYn,
        newYn: !item.newYn ? 'N' : item.newYn,
        uuid: `repType: ${item.repType}, repCde: ${item.repCde}`,
        willUpdate: false,
      }));

      const newDetailList = detailResponse.data.map((item) => {
        const uuid = item.id ? `${item.id}` : `nonexist_${getUUID()}`;
        return {
          ...item,
          uuid: uuid,
          willUpdate: false,
          willDelete: false,
        };
      });

      setMainList(newMainList);
      setDetailList(newDetailList);

      // 원본 데이터 보존을 위해 조회 시점의 상태를 Map으로 저장
      const newMainMap = new Map<string, StdFnnrTblatRegistMainListResponse>();
      newMainList.forEach(item => newMainMap.set(item.uuid, { ...item }));
      setOriginMainMap(newMainMap);

      const newDetailMap = new Map<string, StdFnnrTblatRegistDetailListResponse>();
      newDetailList.forEach(item => newDetailMap.set(item.uuid, { ...item }));
      setOriginDetailMap(newDetailMap);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    }
  }, [userOfficeId, filterOptions]);

  const handleSaveMainList = useCallback(async () => {
    if (!mainGridRef.current) {
      return;
    }

    // 입력 중이라 화면에는 값이 있지만 포커스를 빠져나오지 않아 반영되지 않은 셀을 편집 모드 끝내며 적용
    mainGridRef.current.stopEditing(false);

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);

    try {
      const colDefRepCde = mainGridRef.current?.getColumnDef('repCde');
      const colDefAccCdeN = mainGridRef.current?.getColumnDef('accCdeN');

      const saveMainList: StdFnnrTblatRegistMainData[] = mainList
        .filter(data => data.uuid.startsWith('new_') || data.willUpdate)
        .map(data => {
          const rowStatus =
            data.uuid.startsWith('new_') ? 'C' : 'U';

          const commonData = {
            repType: data.repType,
            repCde: data.repCde,
            accCdeN: data.accCdeN,
            accNmeN: data.accNmeN,
            accOutNme: data.accOutNme,
            useYn: data.useYn,
          };

          if (!commonData.repCde || commonData.repCde.trim().length === 0) {
            prohibitData(colDefRepCde);
          }
          if (!commonData.accCdeN || commonData.accCdeN.trim().length === 0) {
            prohibitData(colDefAccCdeN);
          }

          return {
            rowStatus,
            ...commonData,
          } as StdFnnrTblatRegistMainData;
        });

      if (saveMainList.length === 0) {
        /*
          ko: 저장할 데이터가 없습니다.
          en: There is no data to save.
         */
        showWarning(t("MSG_CM_2442"), 3);
        return;
      }

      await saveStdFnnrTblatRegistMain({ list: saveMainList });

      /*
        ko: 저장되었습니다.
        en: Saved successfully.
      */
      showSuccess(t("MSG_SY_0058"), 3);

      await handleSelectList();
    } finally {
      setSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    }
  }, [handleSelectList, mainList, prohibitData, t]);

  const handleSaveDetailList = useCallback(async () => {
    if (!detailGridRef.current) {
      return;
    }

    // 입력 중이라 화면에는 값이 있지만 포커스를 빠져나오지 않아 반영되지 않은 셀을 편집 모드 끝내며 적용
    detailGridRef.current.stopEditing(false);

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);

    try {
      const saveDetailList: StdFnnrTblatRegistDetailData[] = detailList
        .filter(data => data.uuid.startsWith('new_') || data.willDelete || data.willUpdate)
        .map(data => {
          const rowStatus =
            data.uuid.startsWith('new_') ? 'C'
              : (data.willDelete ? 'D' : 'U');

          if (rowStatus === 'D') {
            return {
              rowStatus: 'D',
              id: data.id,
            } as StdFnnrTblatRegistDetailData;
          }

          const commonData = {
            id: data.id,
            repType: data.repType,
            repCde: data.repCde,
            onerpAccCdeF: data.onerpAccCdeF,
            onerpAccCdeT: data.onerpAccCdeT,
          };

          return {
            rowStatus,
            ...commonData,
          } as StdFnnrTblatRegistDetailData;
        });

      if (saveDetailList.length === 0) {
        /*
          ko: 저장할 데이터가 없습니다.
          en: There is no data to save.
         */
        showWarning(t("MSG_CM_2442"), 3);
        return;
      }

      await saveStdFnnrTblatRegistDetail({ list: saveDetailList });

      /*
        ko: 저장되었습니다.
        en: Saved successfully.
      */
      showSuccess(t("MSG_SY_0058"), 3);

      await handleSelectList();
    } finally {
      setSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    }
  }, [detailList, handleSelectList, t]);

  const items: TabsProps["items"] = useMemo(() => [
    {
      key: "main",
      /*
        ko: 계정코드
        en: Account code
       */
      label: t("MSG_CM_0082"),
      children: (
        <GridSaveLayout
          onSave={handleSaveMainList}
        >
          <MainGrid
            className="page-layout__main-grid"
            mainList={mainList}
            setMainList={setMainList}
            originMainMap={originMainMap}
            searchRequestRef={searchRequestRef}
            gridRef={mainGridRef}
          />
        </GridSaveLayout>
      ),
    },
    {
      key: "detail",
      /*
        ko: 계정코드매핑
        en: Account code Mapping
       */
      label: t("계정코드매핑"),
      children: (
        <GridSaveLayout
          onSave={handleSaveDetailList}
        >
          <DetailGrid
            className="page-layout__main-grid"
            detailList={detailList}
            setDetailList={setDetailList}
            originDetailMap={originDetailMap}
            gridRef={detailGridRef}
          />
        </GridSaveLayout>
      ),
    },
  ], [mainList, originMainMap, handleSaveMainList, detailList, originDetailMap, handleSaveDetailList]);

  return (
    <SearchGridLayout
      filterPanel={
        <FilterPanel
          className="page-layout__filter-panel"
          handleSelectList={handleSelectList}
          filterOptions={filterOptions}
        />
      }
      grid={
        <>
          {
            /*
              ko: 저장 중...
              en: Saving...
             */
          }
          {saving && <LoadingSpinner tip={t("저장_중")} />}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            destroyOnHidden={false}
          />
        </>
      }
    />
  );
};

export default StdFnnrTblatRegist;
