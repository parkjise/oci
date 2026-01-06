/**
 * 재무회계 > 기준정보 > 기타관리 > 지급조건 등록
 *
 * @description 지급조건 등록
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { SearchGridSaveLayout } from "@components/ui/layout/SearchGridSaveLayout";
import { FilterPanel, MainGrid } from "@components/features/fcm/md/other/PymntCndRegist";
import {
  type PymntCndRegistData,
  type PymntCndRegistListResponse,
  type PymntCndRegistSrchRequest,
  type RowStatus,
} from "@/types/fcm/md/other/pymntCndRegist.types";
import { savePymntCndRegist, selectPymntCndRegistList } from "@apis/fcm/md/other/pymntCndRegistApi";
import { showSuccess, showWarning } from "@components/ui/feedback/Message";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/com/auth";
import { LoadingSpinner } from "@/components";
import GridSaveLayout from "@components/ui/layout/GridSaveLayout";
import type { ColDef, GridApi } from "ag-grid-community";

const PymntCndRegist: React.FC = () => {
  const { t } = useTranslation();
  const [list, setList] = useState<PymntCndRegistListResponse[]>([]);
  const [originMap, setOriginMap] = useState<Map<string, PymntCndRegistListResponse>>(new Map());
  const [searchRequest, setSearchRequest] = useState<PymntCndRegistSrchRequest | undefined>(undefined);

  const [saving, setSaving] = useState(false);
  const isSavingRef = useRef(false);

  const mainGridRef = useRef<GridApi<PymntCndRegistListResponse> | null>(null);

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

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

  const handleSelectList = useCallback(async (data?: PymntCndRegistSrchRequest) => {
    const request = data || searchRequest || {
      asOfficeId: userOfficeId,
      asType: '',
      asUseYn: 'Y',
    };

    setSearchRequest(request);
    const response = await selectPymntCndRegistList(request);

    const newList = response.data.map((item) => ({
      ...item,
      monthOfLast: !item.monthOfLast ? 'N' : item.monthOfLast,
      useYn: !item.useYn ? 'N' : item.useYn,
      uuid: `officeId: ${item.officeId}, termsCode: ${item.termsCode}`,
      willDelete: false,
      willUpdate: false,
    }));

    setList(newList);

    // 원본 데이터 보존을 위해 조회 시점의 상태를 Map으로 저장
    const newMap = new Map<string, PymntCndRegistListResponse>();
    newList.forEach(item => newMap.set(item.uuid, { ...item }));
    setOriginMap(newMap);
  }, [userOfficeId, searchRequest]);

  const handleSaveList = useCallback(async () => {
    if (!mainGridRef.current) {
      return;
    }

    // 입력 중이라 화면에는 값이 있지만 포커스를 빠져나오지 않아 반영되지 않은 셀을 편집 모드 끝내며 적용
    mainGridRef.current.stopEditing(false);

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);

    try {
      const colDefTermsCode = mainGridRef.current?.getColumnDef('termsCode');
      const colDefTermsName = mainGridRef.current?.getColumnDef('termsName');

      const saveList: PymntCndRegistData[] = list
        .filter(data => data.uuid.startsWith('new_') || data.willDelete || data.willUpdate)
        .map(data => {
          const rowStatus: RowStatus =
            data.uuid.startsWith('new_') ? 'C'
              : (data.willDelete ? 'D' : 'U');

          if (rowStatus === 'D') {
            return {
              rowStatus: 'D',
              officeId: userOfficeId,
              termsCode: data.termsCode,
              termsName: data.termsName,
            } as PymntCndRegistData;
          }

          const commonData = {
            officeId: userOfficeId,
            termsCode: data.termsCode,
            termsName: data.termsName,
            termsType: data.termsType,
            cutOfDate: data.cutOfDate,
            monthOfLast: data.monthOfLast,
            holidayPayType: data.holidayPayType,
            monthForword: data.monthForword,
            dayOfMonth: data.dayOfMonth,
            dateForword: data.dateForword,
            days: data.days,
            noteDueDays: data.noteDueDays,
            useYn: data.useYn,
            attribute5: data.attribute5,
            attribute7: data.attribute7,
            attribute10: data.attribute10,
            oldTermsCode: data.oldTermsCode,
          };

          if (!commonData.termsCode || commonData.termsCode.length === 0) {
            prohibitData(colDefTermsCode);
          }
          if (!commonData.termsName || commonData.termsName.length === 0) {
            prohibitData(colDefTermsName);
          }

          return {
            rowStatus,
            ...commonData,
          } as PymntCndRegistData;
        });

      if (saveList.length === 0) {
        /*
          ko: 저장할 데이터가 없습니다.
          en: There is no data to save.
         */
        showWarning(t("MSG_CM_2442"), 3);
        return;
      }

      await savePymntCndRegist({ list: saveList });

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
  }, [list, t, handleSelectList, userOfficeId, prohibitData]);

  return (
    <SearchGridSaveLayout
      filterPanel={
        <FilterPanel
          className="page-layout__filter-panel"
          handleSelectList={handleSelectList}
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
          <GridSaveLayout
            onSave={handleSaveList}
          >
            <MainGrid
              list={list}
              setList={setList}
              originMap={originMap}
              gridRef={mainGridRef}
            />
          </GridSaveLayout>
        </>
      }
    />
  );
};

export default PymntCndRegist;
