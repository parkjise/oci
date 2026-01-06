import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";
import { FormAgGrid } from "@/components/ui/form";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { StatusTagRenderer } from "@/components/ui/form/AgGrid/cells";
import { useAccnutCldrManageStore } from "@/store/fcm/md/other/AccnutCldrManage";
import type { AccnutCldrManageCldrGridData } from "@/types/fcm/md/other/accnutCldrManage.types";
import { createCheckboxColumn } from "@/components/ui/form/AgGrid/columns/checkboxColumn";

interface CalendarGridProps {
  className?: string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ className }) => {
  const { t } = useTranslation();
  const cldrGridData = useAccnutCldrManageStore((state) => state.cldrGridData);
  const setCldrGridApi = useAccnutCldrManageStore(
    (state) => state.setCldrGridApi
  );
  const setCldrGridData = useAccnutCldrManageStore(
    (state) => state.setCldrGridData
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      setCldrGridApi(params.api);
    },
    [setCldrGridApi]
  );

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<AccnutCldrManageCldrGridData>) => {
      if (!params.data) return;

      // rowStatus 업데이트 (undefined인 경우 "U"로 설정)
      const currentRowStatus = params.data.rowStatus;
      const newRowStatus =
        currentRowStatus === "C" ? ("C" as const) : ("U" as const);

      // rowStatus가 없거나 변경된 경우 업데이트
      if (!currentRowStatus || currentRowStatus !== newRowStatus) {
        params.node.setDataValue("rowStatus", newRowStatus);
      }

      // 그리드 데이터 동기화 (비동기로 처리하여 편집 모드 종료 후 실행)
      setTimeout(() => {
        const currentData: AccnutCldrManageCldrGridData[] = [];
        params.api.forEachNode((node) => {
          if (node.data) {
            currentData.push(node.data);
          }
        });
        setCldrGridData(currentData);
      }, 0);
    },
    [setCldrGridData]
  );

  const columnDefs: ExtendedColDef<AccnutCldrManageCldrGridData>[] = useMemo(
    () => [
      {
        headerName: "No.",
        width: 50,
        headerAlign: "center",
        bodyAlign: "center",
        pinned: "left",
        filter: false,
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: t("상태"),
        field: "rowStatus",
        width: 50,
        pinned: "left",
        excludeFromExcel: true,
        cellRenderer: StatusTagRenderer,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
      },
      {
        field: "transDate",
        headerName: t("일자"),
        width: 150,
        headerAlign: "center",
        bodyAlign: "center",
        editable: false,
      },
      {
        field: "dayOfWeek",
        headerName: t("요일"),
        width: 90,
        headerAlign: "center",
        bodyAlign: "center",
        editable: false,
      },
      {
        ...(createCheckboxColumn<
          AccnutCldrManageCldrGridData & Record<string, unknown>
        >(t("영업일여부"), "businessDayFlag", {
          width: 100,
          editable: true,
        }) as ExtendedColDef<AccnutCldrManageCldrGridData>),
      },
      {
        field: "remark",
        headerName: t("비고"),
        width: 170,
        headerAlign: "center",
        bodyAlign: "left",
        editable: true,
      },
    ],
    [t]
  );

  return (
    <FormAgGrid<AccnutCldrManageCldrGridData>
      className={className}
      rowData={cldrGridData}
      columnDefs={columnDefs}
      showToolbar={false}
      onGridReady={handleGridReady}
      onCellValueChanged={handleCellValueChanged}
      pagination={false}
      gridOptions={{
        suppressRowClickSelection: true, // 행 클릭 시 선택 방지
        getRowId: (params) => {
          // id 필드를 사용하여 행 식별 (index + 1로 설정된 id 사용)
          return params.data?.id ? String(params.data.id) : `row-${Date.now()}`;
        },
      }}
    />
  );
};

export default CalendarGrid;
