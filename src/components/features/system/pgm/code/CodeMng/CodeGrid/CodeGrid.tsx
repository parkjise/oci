// ============================================================================
// 공통코드 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent, ICellRendererParams } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { CodeGridStyles } from "./CodeGrid.styles";
import type { CodeDto } from "@apis/system/code/codeApi";
import { useTranslation } from "react-i18next";

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<ICellRendererParams<CodeDto & { id?: string; chk?: boolean }>> = ({ value }) => {
  const status = value || "";

  let icon = null;
  let backgroundColor = "";
  let iconColor = "";
  let iconClass = "";
  let tooltip = "";

  switch (status) {
    case "C":
      iconClass = "ri-add-circle-fill";
      backgroundColor = "#e6f7ff";
      iconColor = "#1890ff";
      tooltip = "추가";
      break;
    case "U":
      iconClass = "ri-edit-circle-fill";
      backgroundColor = "#f6ffed";
      iconColor = "#52c41a";
      tooltip = "수정";
      break;
    case "D":
      iconClass = "ri-delete-bin-fill";
      backgroundColor = "#fff1f0";
      iconColor = "#ff4d4f";
      tooltip = "삭제";
      break;
    default:
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <span />
        </div>
      );
  }

  icon = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: backgroundColor,
        transition: "all 0.2s ease",
      }}
      title={tooltip}
    >
      <i
        className={iconClass}
        style={{
          color: iconColor,
          fontSize: "14px",
          lineHeight: "1",
        }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      {icon}
    </div>
  );
};

// ============================================================================
// Types
// ============================================================================
interface CodeGridProps {
  className?: string;
  rowData: (CodeDto & { id?: string; chk?: boolean })[];
  loading?: boolean;
  onModify?: (modified: boolean) => void;
}

export interface CodeGridRef {
  getGridData: () => (CodeDto & { id?: string; chk?: boolean })[];
  getSelectedRows: () => (CodeDto & { id?: string; chk?: boolean })[];
}

// ============================================================================
// Component
// ============================================================================
const CodeGrid = forwardRef<CodeGridRef, CodeGridProps>(({ className, rowData, onModify }, ref) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<(CodeDto & { id?: string; chk?: boolean })[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      getGridData: () => {
        if (!gridApi) return gridData;
        const allRows: (CodeDto & { id?: string; chk?: boolean })[] = [];
        gridApi.forEachNode((node) => {
          if (node.data) {
            allRows.push(node.data);
          }
        });
        return allRows;
      },
      getSelectedRows: () => {
        if (!gridApi) return [];
        return gridApi.getSelectedRows() as (CodeDto & { id?: string; chk?: boolean })[];
      },
    }),
    [gridApi, gridData],
  );

  // rowData 변경 시 gridData 업데이트
  useEffect(() => {
    if (rowData) {
      setGridData(rowData);
    } else {
      setGridData([]);
    }
  }, [rowData]);

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      if (!gridApi || !event.data) return;

      const rowData = event.data as CodeDto & { id?: string; chk?: boolean };
      if (!rowData.rowStatus || rowData.rowStatus === undefined) {
        rowData.rowStatus = "U";
        gridApi.applyTransaction({ update: [rowData] });
        gridApi.refreshCells({
          rowNodes: [event.node!],
          columns: ["rowStatus"],
          force: true,
        });
      }

      if (onModify) {
        onModify(true);
      }
    },
    [gridApi, onModify],
  );

  // USER_TYPE 표시용
  const userTypeMap: Record<string, string> = {
    A: "ADMIN",
    U: "USER",
  };

  const columnDefs: ColDef<CodeDto & { id?: string; chk?: boolean }>[] = [
    {
      width: 50,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      resizable: false,
      suppressHeaderMenuButton: true,
      pinned: "left",
      headerName: "",
      field: "chk",
      valueGetter: (params) => {
        return params.data?.chk || false;
      },
      valueSetter: (params) => {
        if (params.data) {
          params.data.chk = params.newValue;
          return true;
        }
        return false;
      },
      valueFormatter: () => "",
    },
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 80,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      cellRenderer: StatusCellRenderer,
      valueGetter: (params) => params.data?.rowStatus || "",
    },
    {
      headerName: t("No."),
      width: 80,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex ?? 0;
        return rowIndex + 1;
      },
    },
    {
      field: "type",
      headerName: t("코드구분"),
      width: 110,
      editable: false,
    },
    {
      field: "code",
      headerName: t("공통코드"),
      width: 110,
      editable: true,
    },
    {
      field: "name1",
      headerName: t("공통코드명"),
      width: 140,
      editable: true,
    },
    {
      field: "nameDesc",
      headerName: t("공통코드 세부설명"),
      width: 180,
      editable: true,
    },
    {
      field: "segment1",
      headerName: t("상세정보1"),
      width: 120,
      editable: true,
    },
    {
      field: "segment2",
      headerName: t("상세정보2"),
      width: 120,
      editable: true,
    },
    {
      field: "segment3",
      headerName: t("상세정보3"),
      width: 120,
      editable: true,
    },
    {
      field: "segment4",
      headerName: t("상세정보4"),
      width: 120,
      editable: true,
    },
    {
      field: "segment5",
      headerName: t("상세정보5"),
      width: 120,
      editable: true,
    },
    {
      field: "segment6",
      headerName: t("상세정보6"),
      width: 120,
      editable: true,
    },
    {
      field: "segment7",
      headerName: t("상세정보7"),
      width: 120,
      editable: true,
    },
    {
      field: "segment8",
      headerName: t("상세정보8"),
      width: 120,
      editable: true,
    },
    {
      field: "userType",
      headerName: t("Type"),
      width: 90,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["A", "U"],
      },
      valueFormatter: (params) => {
        if (!params.value) return "";
        return userTypeMap[params.value] || params.value;
      },
    },
    {
      field: "enabledFlag",
      headerName: t("Active"),
      width: 90,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Y", "N"],
      },
    },
    {
      field: "startDate",
      headerName: t("시작일자"),
      width: 120,
      editable: true,
    },
    {
      field: "endDate",
      headerName: t("종료일자"),
      width: 120,
      editable: true,
    },
    {
      field: "orderSeq",
      headerName: t("정렬순서"),
      width: 100,
      editable: true,
    },
  ];

  const getRowId = useCallback((params: { data: CodeDto & { id?: string; chk?: boolean } }) => {
    return params.data.id || `${params.data.module}_${params.data.type}_${params.data.code}`;
  }, []);

  return (
    <CodeGridStyles className={className}>
      <AgGrid<CodeDto & { id?: string; chk?: boolean }>
        height="100%"
        columnDefs={columnDefs}
        rowData={gridData}
        getRowId={getRowId}
        pagination={false}
        showToolbar={false}
        onGridReady={handleGridReady}
        onCellValueChanged={handleCellValueChanged}
        rowSelection="multiple"
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
        }}
        suppressRowClickSelection={true}
        animateRows={true}
        rowHeight={35}
        headerHeight={35}
      />
    </CodeGridStyles>
  );
});

CodeGrid.displayName = "CodeGrid";

export default CodeGrid;


