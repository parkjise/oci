import React, { useMemo, useCallback } from "react";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import { FormButton, ActionButtonGroup } from "@components/ui/form";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import { usePageModal } from "@hooks/usePageModal";
import { AppPageModal } from "@components/ui/feedback/Modal";
import MtClos from "@/pages/fcm/gl/closing/MtClos/MtClos";
import type { MtClosResult } from "@/pages/fcm/gl/closing/MtClos/MtClos";
import YyCyfd from "@/pages/fcm/gl/closing/YyCyfd/YyCyfd";
import type { YyCyfdResult } from "@/pages/fcm/gl/closing/YyCyfd/YyCyfd";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { useAuthStore } from "@store/com/auth/authStore";
import {
  FilterPanel,
  LeftGrid,
  RightGrid,
} from "@components/features/fcm/gl/closing/ClosTagManage";
import { useTranslation } from "react-i18next";

const ClosTagManage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { collectAndSave, search } = useClosTagManageStore();
  // 선택된 LeftGrid 행 가져오기
  const selectedLeftRow = useClosTagManageStore(
    (state) => state.selectedLeftRow
  );
  // 마지막 검색 파라미터 가져오기
  const lastSearchParams = useClosTagManageStore(
    (state) => state.lastSearchParams
  );

  // 월마감 모달 훅
  const mtClosModal = usePageModal<
    {
      initialYear?: string;
      initialMonth?: string;
      setConfirmHandler?: (handler: (() => void) | null) => void;
    },
    MtClosResult
  >(MtClos, {
    title: t("월마감"),
    centered: true,
    width: 550,
    height: 400,
    destroyOnHidden: true,
    onReturn: async (value) => {
      if (import.meta.env.DEV) {
        console.log("월마감 처리 결과:", value);
      }

      // 월마감 처리 성공 후 그리드 재조회
      if (value && lastSearchParams && user?.officeId && user?.empCode) {
        try {
          // 현재 검색 조건으로 재조회
          await search(
            lastSearchParams,
            {
              officeId: user.officeId,
              empCode: user.empCode,
            },
            {
              skipAutoSelect: false, // 자동 선택 활성화
            }
          );

          if (import.meta.env.DEV) {
            console.log("월마감 처리 후 그리드 재조회 완료");
          }
        } catch (error) {
          console.error("월마감 처리 후 재조회 중 오류:", error);
        }
      }
    },
  });

  // 연이월 모달 훅
  const yyCyfdModal = usePageModal<
    {
      initialYear?: string;
      setConfirmHandler?: (handler: (() => void) | null) => void;
    },
    YyCyfdResult
  >(YyCyfd, {
    title: t("연이월"),
    centered: true,
    width: 500,
    height: 300,
    destroyOnHidden: true,
    onReturn: async (value) => {
      if (import.meta.env.DEV) {
        console.log("연이월 처리 결과:", value);
      }

      // 연이월 처리 성공 후 그리드 재조회
      if (value && lastSearchParams && user?.officeId && user?.empCode) {
        try {
          // 현재 검색 조건으로 재조회
          await search(
            lastSearchParams,
            {
              officeId: user.officeId,
              empCode: user.empCode,
            },
            {
              skipAutoSelect: false, // 자동 선택 활성화
            }
          );

          if (import.meta.env.DEV) {
            console.log("연이월 처리 후 그리드 재조회 완료");
          }
        } catch (error) {
          console.error("연이월 처리 후 재조회 중 오류:", error);
        }
      }
    },
  });

  // 월마감 버튼 핸들러
  const handleMonthClose = useCallback(() => {
    // 선택된 LeftGrid 행에서 연도와 월 추출
    const year = selectedLeftRow?.closingYearMonth?.substring(0, 4);
    const month = selectedLeftRow?.closingYearMonth?.substring(4, 6);

    mtClosModal.openModal({
      initialYear: year,
      initialMonth: month,
      setConfirmHandler: mtClosModal.setConfirmHandler,
    });
  }, [mtClosModal, selectedLeftRow]);

  // 연이월 버튼 핸들러
  const handleYearCarryForward = useCallback(() => {
    yyCyfdModal.openModal({
      setConfirmHandler: yyCyfdModal.setConfirmHandler,
    });
  }, [yyCyfdModal]);

  // 커스텀 버튼 설정
  const customButtons = useMemo(
    () => [
      <FormButton key="monthClose" size="small" onClick={handleMonthClose}>
        {t("월마감")}
      </FormButton>,
      <FormButton
        key="yearCarryForward"
        size="small"
        onClick={handleYearCarryForward}
      >
        {t("연이월")}
      </FormButton>,
    ],
    [handleMonthClose, handleYearCarryForward, t]
  );

  // 저장 핸들러 (비즈니스 로직은 Store의 collectAndSave로 이동)
  const handleSave = useCallback(async () => {
    if (!user?.officeId || !user?.empCode) {
      return;
    }

    await collectAndSave({
      officeId: user.officeId,
      empCode: user.empCode,
    });
  }, [collectAndSave, user]);

  return (
    <>
      <TwoGridSaveLayout
        filterPanel={<FilterPanel className="page-layout__filter-panel" />}
        grid={
          <>
            <DataGridStyles className="data-grid-panel">
              <div className="data-grid-panel__toolbar">
                <div className="data-grid-panel-left">
                  {/* 왼쪽 영역 (필요시 추가) */}
                </div>
                <div className="data-grid-panel-right">
                  <ActionButtonGroup
                    hideButtons={["edit", "copy", "delete", "expand", "create"]}
                    onButtonClick={{
                      save: handleSave,
                    }}
                    customButtons={customButtons}
                  />
                </div>
              </div>
            </DataGridStyles>
            <TowGridSaveLayout
              primaryPanel={<LeftGrid className="page-layout__grid" />}
              secondaryPanel={<RightGrid className="page-layout__grid" />}
            />
          </>
        }
      />
      {/* 월마감 모달 */}
      <AppPageModal {...mtClosModal.modalProps} />
      {/* 연이월 모달 */}
      <AppPageModal {...yyCyfdModal.modalProps} />
    </>
  );
};

export default ClosTagManage;
