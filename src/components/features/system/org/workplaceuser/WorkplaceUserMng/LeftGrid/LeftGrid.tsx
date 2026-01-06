// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { FormAgGrid } from "@form";
import { LeftGridStyles } from "./LeftGrid.Styles";
import { useTranslation } from "react-i18next";
import type { WorkplaceUserHeaderDto } from "@apis/system/org/workplaceUserApi";
import { useWorkplaceUserMngStore } from "@store/system/org/workplaceuser/workplaceUserMngStore";

// ============================================================================
// Types
// ============================================================================
type LeftGridProps = {
  className?: string;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 사업장사용자관리 왼쪽 그리드 컴포넌트 (사용자 목록)
 */
const LeftGrid: React.FC<LeftGridProps> = ({ className }) => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);
  const { headerList, setSelectedHeader } = useWorkplaceUserMngStore();

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);

  // 행 선택 변경 핸들러
  const handleSelectionChanged = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length > 0) {
      setSelectedHeader(selectedRows[0] as WorkplaceUserHeaderDto);
    } else {
      setSelectedHeader(null);
    }
  }, [setSelectedHeader]);

  // 컬럼 정의
  const columnDefs: ColDef<WorkplaceUserHeaderDto>[] = [
    {
      field: "deptName",
      headerName: t("부서명"),
      flex: 2,
      minWidth: 150,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "empCode",
      headerName: t("사용자 ID"),
      flex: 1,
      minWidth: 100,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "empName",
      headerName: t("사용자명"),
      flex: 1,
      minWidth: 100,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "useYn",
      headerName: t("사용여부"),
      flex: 1,
      minWidth: 80,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: (params: { value: string }) => {
        if (params.value === "Y") {
          return <span style={{ color: "green" }}>{t("Yes")}</span>;
        } else if (params.value === "N") {
          return <span style={{ color: "red" }}>{t("No")}</span>;
        }
        return params.value || "-";
      },
    },
    {
      field: "orgFlag",
      headerName: "",
      width: 50,
      flex: 0,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: (params: { value: string }) => {
        if (params.value === "Y") {
          return <input type="checkbox" checked disabled />;
        }
        return <input type="checkbox" disabled />;
      },
    },
    {
      field: "multiFlag",
      headerName: "",
      width: 50,
      flex: 0,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
  ];

  return (
    <LeftGridStyles className={className}>
      <div className="data-grid-panel">
        <FormAgGrid<WorkplaceUserHeaderDto & { id?: string }>
          rowData={headerList.map((row, index) => ({ ...row, id: row.empCode || String(index) }))}
          headerHeight={32}
          columnDefs={columnDefs}
          height="100%"
          excelFileName={t("사업장사용자관리_사용자목록")}
          showToolbar={true}
          styleOptions={{
            fontSize: "12px",
            headerFontSize: "12px",
            rowHeight: "32px",
            headerHeight: "32px",
            cellPadding: "6px",
            headerPadding: "8px",
            selectedRowBackgroundColor: "#e6f7ff",
            hoverRowBackgroundColor: "#bae7ff",
          }}
          gridOptions={{
            defaultColDef: {
              flex: 1,
              minWidth: 80,
            },
            getRowId: (params) => {
              return params.data?.empCode || String(Math.random());
            },
            rowSelection: "single",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false,
            onGridReady: handleGridReady,
            onSelectionChanged: handleSelectionChanged,
          }}
          toolbarButtons={{
            showDelete: false,
            showCopy: false,
            showAdd: false,
            enableExcelDownload: true,
            showSave: false,
          }}
        />
      </div>
    </LeftGridStyles>
  );
};

export default LeftGrid;
