import { useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import type { CellValueChangedEvent } from "ag-grid-community";
import FormAgGrid from "@/components/ui/form/AgGrid";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import {
  createTextColumn,
  createNumberColumn,
  createCheckboxColumn,
} from "@/components/ui/form/AgGrid/columns";
import { StatusTagRenderer } from "@/components/ui/form/AgGrid/cells";
import { useAccnutPdRegistStore } from "@/store/fcm/md/other/AccnutPdRegist/accnutPdRegistStore";
import { usePeriodGrid } from "./usePeriodGrid";
import type { PeriodData } from "@/types/fcm/md/other/accnutPdRegist.types";
import type { GridReadyEvent } from "ag-grid-community";

interface PeriodGridProps {
  className?: string;
}

export interface PeriodGridRef {
  handleAddRow: () => void;
  handleDeleteRow: () => void;
  handleCopyRow: () => void;
}

const PeriodGrid = forwardRef<PeriodGridRef, PeriodGridProps>(
  ({ className }, ref) => {
    const { t } = useTranslation();
    const gridData = useAccnutPdRegistStore((state) => state.gridData);
    const gridApi = useAccnutPdRegistStore((state) => state.gridApi);
    const setGridApi = useAccnutPdRegistStore((state) => state.setGridApi);
    const setGridData = useAccnutPdRegistStore((state) => state.setGridData);

    // Custom Hook: UI 행위 관리
    const { handleAddRow, handleDeleteRow, handleCopyRow } =
      usePeriodGrid(gridApi);

    // 부모 컴포넌트에 메서드 노출
    useImperativeHandle(ref, () => ({
      handleAddRow,
      handleDeleteRow,
      handleCopyRow,
    }));

    // Grid Ready 이벤트
    const handleGridReady = useCallback(
      (params: GridReadyEvent) => {
        setGridApi(params.api);
      },
      [setGridApi]
    );

    // 셀 값 변경 이벤트
    const handleCellValueChanged = useCallback(
      (params: CellValueChangedEvent<PeriodData>) => {
        if (!params.data) return;

        // rowStatus 업데이트 (C는 유지, 나머지는 U로 변경)
        const currentRowStatus = params.data.rowStatus;
        const newRowStatus =
          currentRowStatus === "C" ? ("C" as const) : ("U" as const);

        // rowStatus가 없거나 변경된 경우 업데이트
        if (!currentRowStatus || currentRowStatus !== newRowStatus) {
          params.node.setDataValue("rowStatus", newRowStatus);
        }

        // 그리드 데이터 동기화
        setTimeout(() => {
          const currentData: PeriodData[] = [];
          params.api.forEachNode((node) => {
            if (node.data) {
              currentData.push(node.data);
            }
          });
          setGridData(currentData);
        }, 0);
      },
      [setGridData]
    );

    // 컬럼 정의
    const columnDefs = useMemo<ExtendedColDef<PeriodData>[]>(
      () => [
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
        createNumberColumn<PeriodData>("periodNum", t("순번_축약형"), 70),
        createTextColumn<PeriodData>("periodName", t("Period_명"), 150),
        createTextColumn<PeriodData>("accMonth", t("월도"), 100),
        createTextColumn<PeriodData>("dateF", t("기간") + "(From)", 120),
        createTextColumn<PeriodData>("dateT", t("기간") + "(To)", 120),
        {
          ...(createCheckboxColumn<PeriodData & Record<string, unknown>>(
            t("결산"),
            "adjustFlag",
            {
              width: 70,
              editable: true,
            }
          ) as ExtendedColDef<PeriodData>),
        },
        createTextColumn<PeriodData>("realYear", t("실제_회계년도"), 150),
        createTextColumn<PeriodData>("realMth", t("실제_월도"), 120),
        createNumberColumn<PeriodData>("halfYearly", t("반기"), 100),
        createNumberColumn<PeriodData>("quarter", t("분기"), 100),
      ],
      [t]
    );

    return (
      <FormAgGrid<PeriodData>
        rowData={gridData}
        columnDefs={columnDefs}
        onGridReady={handleGridReady}
        onCellValueChanged={handleCellValueChanged}
        className={className}
        showToolbar={true}
        excelFileName="회계기간등록"
        pagination={false}
        gridOptions={{
          rowSelection: "single", // 단일 행 선택 활성화
          suppressRowClickSelection: true, // 행 클릭 시 선택 방지 (프로그래밍 방식으로만 선택)
          getRowId: (params) => {
            return params.data?.id
              ? String(params.data.id)
              : `row-${Date.now()}`;
          },
          // 삭제된 행 스타일
          rowClassRules: {
            "ag-row-deleted": (params) => {
              return params.data?.rowStatus === "D";
            },
          },
        }}
      />
    );
  }
);

PeriodGrid.displayName = "PeriodGrid";

export default PeriodGrid;
