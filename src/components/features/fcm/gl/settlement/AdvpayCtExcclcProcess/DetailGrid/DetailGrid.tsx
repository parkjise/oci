import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, GridReadyEvent, CellStyle } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { formatNumber } from "@utils/agGridUtils";

type DetailGridData = {
  id?: string | number;
  chk?: string;
  slipNo?: string;
  transferYn?: string;
  invoice_line_id?: string;
  count?: number;
  prepaidExpenseAccount?: string;
  prepaidExpenseAccountName?: string;
  expenseAccount?: string;
  expenseAccountName?: string;
  processCode?: string;
  processCodeName?: string;
  occurDate?: string;
  endDate?: string;
  days?: number;
  monthlyCostKr?: number;
  monthlyCostFr?: number;
  monthlyOriginalKr?: number;
  foreignOriginal?: number;
  fromDept?: string;
  toDept?: string;
  toDeptName?: string;
  remark?: string;
  customerCode?: string;
  customerName?: string;
  monthlyKrAmount?: number;
  expenseApprovalNo?: string;
  lineNo?: number;
  accountSlipNo?: string;
  invId?: string;
  toOffice?: string;
  glManualProcess?: string;
};

type DetailGridProps = {
  className?: string;
  rowData?: DetailGridData[];
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  const gridRef = useRef<GridApi | null>(null);

  // rowData 타입 명시적으로 지정
  const rowData = useMemo<(DetailGridData & { id?: string })[]>(() => {
    const rawRowData = propRowData || [];
    return rawRowData.map((item) => ({
      ...item,
      id: item.id !== undefined ? String(item.id) : undefined,
    }));
  }, [propRowData]);

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);


  const columnDefs = useMemo(
    () => [
      {
        field: "chk",
        headerName: "CHK",
        width: 80,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "slipNo",
        headerName: "전표",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "transferYn",
        headerName: "전기여부",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "invoice_line_id",
        headerName: "처리연월",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "count",
        headerName: "회차",
        width: 80,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "prepaidExpenseAccount",
        headerName: "선급비용계정",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "prepaidExpenseAccountName",
        headerName: "선급비용계정명",
        width: 180,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "expenseAccount",
        headerName: "비용계정",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "expenseAccountName",
        headerName: "비용계정명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "processCode",
        headerName: "공정코드",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "processCodeName",
        headerName: "공정코드명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "occurDate",
        headerName: "발생일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "endDate",
        headerName: "만기일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "days",
        headerName: "일수",
        width: 80,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "monthlyCostKr",
        headerName: "월비용원화",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "monthlyCostFr",
        headerName: "월비용외화",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "monthlyOriginalKr",
        headerName: "월원작원화",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "foreignOriginal",
        headerName: "외화원작",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "fromDept",
        headerName: "발생부서",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "toDept",
        headerName: "귀속부서",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "toDeptName",
        headerName: "귀속부서명",
        width: 180,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "remark",
        headerName: "적요",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "customerCode",
        headerName: "거래처",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "customerName",
        headerName: "거래처명",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "monthlyKrAmount",
        headerName: "월원화금액",
        width: 150,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "expenseApprovalNo",
        headerName: "지출번호",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "lineNo",
        headerName: "순번",
        width: 100,
        cellStyle: { textAlign: "right" } as CellStyle,
        headerClass: "ag-header-cell-center",
        valueFormatter: formatNumber,
      },
      {
        field: "accountSlipNo",
        headerName: "회계전표",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "invId",
        headerName: "전표ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "toOffice",
        headerName: "사업장",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "glManualProcess",
        headerName: "GL수기처리",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
    ] as ExtendedColDef<DetailGridData & { id?: string }>[],
    []
  );

  return (
    <div className="data-grid-panel">
      <FormAgGrid<DetailGridData & { id?: string }>
        rowData={rowData}
        columnDefs={columnDefs}
        headerHeight={32}
        height={600}
        idField="id"
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
        onGridReady={handleGridReady}
      />
    </div>
  );
};

export default DetailGrid;