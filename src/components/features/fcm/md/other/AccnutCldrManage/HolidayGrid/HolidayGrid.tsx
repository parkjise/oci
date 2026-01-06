import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  GridReadyEvent,
  CellValueChangedEvent,
  CellEditingStoppedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@/components/ui/form";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { StatusTagRenderer } from "@/components/ui/form/AgGrid/cells";
import type { AccnutCldrManageRestdeGridData } from "@/types/fcm/md/other/accnutCldrManage.types";
import { createComboBoxColumn } from "@/components/ui/form/AgGrid/columns/comboBoxColumn";
import { createDateColumn } from "@/utils/agGridUtils";
import dayjs from "dayjs";
import { useHolidayGrid } from "./useHolidayGrid";

interface HolidayGridProps {
  className?: string;
  isActive?: boolean; // 현재 탭이 활성화되어 있는지 여부
}

/**
 * HolidayGrid 컴포넌트
 * 
 * 책임:
 * - UI 렌더링 (그리드, 컬럼 정의)
 * - 이벤트 핸들러 연결
 * 
 * 비즈니스 로직은 useHolidayGrid Hook에서 관리
 */
const HolidayGrid: React.FC<HolidayGridProps> = ({
  className,
  isActive = true,
}) => {
  const { t } = useTranslation();
  const {
    internalRowData,
    setRestdeGridApi,
    handleBasicDateOrSolarLunarTypeChange,
    handleAddRow,
    handleDeleteRow,
    handleCopyRow,
    createNewRow,
  } = useHolidayGrid();

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      setRestdeGridApi(params.api);
    },
    [setRestdeGridApi]
  );

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<AccnutCldrManageRestdeGridData>) => {
      if (!params.data) return;

      const { colDef, newValue, api, node } = params;
      const field = colDef.field;

      // rowStatus 필드 변경은 무한 루프 방지를 위해 무시
      if (field === "rowStatus") return;

      // 기초일자 또는 양음력 변경 시 휴무일자 재계산
      if (field === "basicDate" || field === "solarLunarType") {
        // 날짜 형식 통일 (Date 객체 -> 문자열)
        const updatedBasicDate =
          field === "basicDate" && newValue instanceof Date
            ? dayjs(newValue).format("YYYY-MM-DD")
            : params.data.basicDate;

        // params.data에서 최신 값 가져오기 (newValue는 부정확할 수 있음)
        const updatedSolarLunarType = String(params.data.solarLunarType);

        handleBasicDateOrSolarLunarTypeChange(
          node.id!,
          api,
          updatedBasicDate,
          updatedSolarLunarType
        );
      }

      // rowStatus 업데이트 (신규 'C'가 아니고, 삭제 'D'가 아니며, 이미 'U'가 아닐 때만)
      if (
        params.data.rowStatus !== "C" &&
        params.data.rowStatus !== "D" &&
        params.data.rowStatus !== "U"
      ) {
        node.setDataValue("rowStatus", "U");
      }
    },
    [handleBasicDateOrSolarLunarTypeChange]
  );

  // 셀 편집 종료 이벤트 핸들러
  const handleCellEditingStopped = useCallback(
    (params: CellEditingStoppedEvent<AccnutCldrManageRestdeGridData>) => {
      if (!params.api) return;

      const { colDef, node } = params;
      const field = colDef.field;

      // rowStatus 필드는 무시
      if (field === "rowStatus") return;

      // node.data를 통해 최신 데이터 가져오기
      const currentData = node.data;
      if (!currentData) return;

      // 기초일자 또는 양음력 변경 시 휴무일자 재계산
      if (field === "basicDate" || field === "solarLunarType") {
        const updatedBasicDate = currentData.basicDate;
        const updatedSolarLunarType = String(currentData.solarLunarType);

        handleBasicDateOrSolarLunarTypeChange(
          node.id!,
          params.api,
          updatedBasicDate,
          updatedSolarLunarType
        );
      }

      // rowStatus 업데이트 (신규 'C'가 아니고, 삭제 'D'가 아니며, 이미 'U'가 아닐 때만)
      if (
        currentData.rowStatus !== "C" &&
        currentData.rowStatus !== "D" &&
        currentData.rowStatus !== "U"
      ) {
        node.setDataValue("rowStatus", "U");
      }
    },
    [handleBasicDateOrSolarLunarTypeChange]
  );

  const columnDefs: ExtendedColDef<AccnutCldrManageRestdeGridData>[] = useMemo(
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
        ...(createDateColumn<AccnutCldrManageRestdeGridData>(
          "basicDate",
          t("일자"),
          150
        ) as ExtendedColDef<AccnutCldrManageRestdeGridData>),
        headerClass: "ag-header-cell-center",
        valueGetter: (params) => {
          if (!params.data?.basicDate) return null;
          const date = dayjs(params.data.basicDate).toDate();
          return isNaN(date.getTime()) ? null : date;
        },
        valueSetter: (params) => {
          if (!params.data) return false;
          if (params.newValue instanceof Date) {
            params.data.basicDate = dayjs(params.newValue).format("YYYY-MM-DD");
            return true;
          }
          if (typeof params.newValue === "string") {
            params.data.basicDate = params.newValue;
            return true;
          }
          return false;
        },
      },
      {
        ...createComboBoxColumn<AccnutCldrManageRestdeGridData>(
          "solarLunarType",
          t("양음구분"),
          {
            comCodeParams: {
              module: "HR",
              type: "SUNLUN",
              enabledFlag: "Y",
            },
          },
          150
        ),
      },
      {
        field: "offDate",
        headerName: t("휴무일자"),
        width: 150,
        headerAlign: "center",
        bodyAlign: "center",
        editable: false, // readOnly
      },
      {
        field: "offDateName",
        headerName: t("휴무명칭"),
        width: 170,
        headerAlign: "center",
        bodyAlign: "left",
        editable: true,
      },
    ],
    [t]
  );

  return (
    <FormAgGrid<AccnutCldrManageRestdeGridData>
      className={className}
      rowData={internalRowData}
      columnDefs={columnDefs}
      showToolbar={true}
      toolbarButtons={{
        showDelete: isActive,
        showCopy: isActive,
        showAdd: isActive,
        enableExcelDownload: true,
        showExcelUpload: false,
      }}
      onGridReady={handleGridReady}
      onCellValueChanged={handleCellValueChanged}
      onCellEditingStopped={handleCellEditingStopped}
      createNewRow={createNewRow}
      onAddRow={handleAddRow}
      onDeleteRow={handleDeleteRow}
      onCopyRow={handleCopyRow}
      pagination={false}
      gridOptions={{
        getRowId: (params) => {
          // id 필드를 사용하여 행 식별 (index + 1로 설정된 id 사용)
          return params.data?.id ? String(params.data.id) : `row-${Date.now()}`;
        },
      }}
    />
  );
};

export default HolidayGrid;
