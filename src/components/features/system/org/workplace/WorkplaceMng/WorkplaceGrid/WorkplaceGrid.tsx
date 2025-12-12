// ============================================================================
// 사업장 관리 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent, ICellRendererParams, SelectionChangedEvent, RowClickedEvent } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { WorkplaceGridStyles, GridContainer } from "./WorkplaceGrid.styles";
import type { WorkplaceDto } from "@apis/system/org/workplaceApi";
import { useTranslation } from "react-i18next";

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<ICellRendererParams<WorkplaceDto & { id?: string; chk?: boolean }>> = ({ value }) => {
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
          <span></span>
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
interface WorkplaceGridProps {
  className?: string;
  rowData: (WorkplaceDto & { id?: string; chk?: boolean })[];
  loading?: boolean;
  onModify?: (modified: boolean) => void;
  onAddRow?: (gridApi: any) => void;
  onCopyRow?: (gridApi: any) => void;
  onDeleteRow?: (gridApi: any) => void;
  onSave?: () => void;
  isModified?: boolean;
  totalCount?: number;
  onRowSelection?: (selectedRows: WorkplaceDto[]) => void;
}

export interface WorkplaceGridRef {
  getGridData: () => (WorkplaceDto & { id?: string; chk?: boolean })[];
  getSelectedRows: () => (WorkplaceDto & { id?: string; chk?: boolean })[];
  getGridApi: () => GridApi | null;
}

// ============================================================================
// Component
// ============================================================================
const WorkplaceGrid = forwardRef<WorkplaceGridRef, WorkplaceGridProps>(({
  className,
  rowData,
  onModify,
  onAddRow,
  onCopyRow,
  onDeleteRow,
  onSave,
  onRowSelection,
}, ref) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const prevSelectedOrgIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    getGridData: () => {
      if (!gridApi) return rowData || [];

      const allRows: (WorkplaceDto & { id?: string; chk?: boolean })[] = [];
      gridApi.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data);
        }
      });
      return allRows;
    },
    getSelectedRows: () => {
      if (!gridApi) return [];
      return gridApi.getSelectedRows() as (WorkplaceDto & { id?: string; chk?: boolean })[];
    },
    getGridApi: () => {
      return gridApi;
    },
  }), [gridApi, rowData]);

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  const hasModifiedRow = useCallback((gridApi: GridApi, excludeOrgId?: string | null): boolean => {
    if (!gridApi) return false;
    
    const allRows = gridApi.getRenderedNodes()
      .map(node => node.data as WorkplaceDto)
      .filter(row => row && (!excludeOrgId || row.orgId !== excludeOrgId));
    
    return allRows.some(
      (row) => row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D"
    );
  }, []);

  const handleRowClicked = useCallback(
    (event: RowClickedEvent) => {
      if (!gridApi || !event.data) return;
      
      const clickedRow = event.data as WorkplaceDto;
      const currentSelectedRows = gridApi.getSelectedRows() as WorkplaceDto[];
      const currentSelectedOrgId = currentSelectedRows.length > 0 ? currentSelectedRows[0].orgId : null;
      
      if (currentSelectedOrgId === clickedRow.orgId) {
        prevSelectedOrgIdRef.current = clickedRow.orgId || null;
        return;
      }
      
      const hasModified = hasModifiedRow(gridApi, currentSelectedOrgId || undefined);
      
      if (hasModified) {
        event.node.setSelected(false);
        if (currentSelectedOrgId) {
          gridApi.forEachNode((node) => {
            if (node.data?.orgId === currentSelectedOrgId) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
        } else {
          gridApi.deselectAll();
        }
        return;
      }
      
      prevSelectedOrgIdRef.current = clickedRow.orgId || null;
    },
    [gridApi, hasModifiedRow]
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selectedRows = event.api.getSelectedRows() as WorkplaceDto[];
      
      const allRows = event.api.getRenderedNodes()
        .map(node => node.data as WorkplaceDto)
        .filter(row => row);
      
      const hasModified = allRows.some(
        (row) => row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D"
      );
      
      if (hasModified && selectedRows.length > 0) {
        const newSelectedWorkplace = selectedRows[0];
        
        if (prevSelectedOrgIdRef.current) {
          const prevSelectedRow = allRows.find(
            (row) => row.orgId === prevSelectedOrgIdRef.current
          );
          
          if (prevSelectedRow) {
            const isPrevRowModified = prevSelectedRow.rowStatus === "U" || 
                                      prevSelectedRow.rowStatus === "C" || 
                                      prevSelectedRow.rowStatus === "D";
            
            if (isPrevRowModified && newSelectedWorkplace.orgId !== prevSelectedOrgIdRef.current) {
              event.api.deselectAll();
              event.api.forEachNode((node) => {
                if (node.data?.orgId === prevSelectedOrgIdRef.current) {
                  node.setSelected(true);
                } else {
                  node.setSelected(false);
                }
              });
              return;
            }
          }
        }
        
        const hasOtherModifiedRow = allRows.some(
          (row) => row.orgId !== newSelectedWorkplace.orgId && 
                   (row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D")
        );
        
        if (hasOtherModifiedRow && prevSelectedOrgIdRef.current && 
            newSelectedWorkplace.orgId !== prevSelectedOrgIdRef.current) {
          event.api.deselectAll();
          event.api.forEachNode((node) => {
            if (node.data?.orgId === prevSelectedOrgIdRef.current) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
          return;
        }
        
        prevSelectedOrgIdRef.current = newSelectedWorkplace.orgId || null;
      } else if (selectedRows.length > 0) {
        prevSelectedOrgIdRef.current = selectedRows[0].orgId || null;
      } else {
        prevSelectedOrgIdRef.current = null;
      }
      
      if (onRowSelection) {
        onRowSelection(selectedRows);
      }
    },
    [onRowSelection]
  );

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    if (!gridApi || !event.data) return;

    const rowData = event.data as WorkplaceDto & { id?: string; chk?: boolean };
    if (!rowData.rowStatus || rowData.rowStatus === undefined) {
      rowData.rowStatus = "U";
      gridApi.applyTransaction({ update: [rowData] });
      gridApi.refreshCells({
        rowNodes: [event.node!],
        columns: ["rowStatus"],
        force: true
      });
    }

    if (onModify) {
      onModify(true);
    }
  }, [gridApi, onModify]);

  useEffect(() => {
    if (gridApi && rowData && rowData.length > 0 && isInitialLoadRef.current) {
      const timeoutId = setTimeout(() => {
        if (!isInitialLoadRef.current) {
          return;
        }
        const firstRow = gridApi.getDisplayedRowAtIndex(0);
        const selectedRows = gridApi.getSelectedRows();
        if (firstRow && firstRow.data && selectedRows.length === 0) {
          gridApi.setNodesSelected({ nodes: [firstRow], newValue: true });
          if (onRowSelection) {
            const newSelectedRows = gridApi.getSelectedRows() as WorkplaceDto[];
            if (newSelectedRows.length > 0) {
              onRowSelection(newSelectedRows);
            }
          }
          isInitialLoadRef.current = false;
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gridApi, rowData, onRowSelection]);

  const columnDefs: ColDef<WorkplaceDto & { id?: string; chk?: boolean }>[] = [
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
      valueGetter: (params) => {
        return params.data?.rowStatus || "";
      },
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
      field: "orgId",
      headerName: t("코드"),
      width: 100,
      editable: true,
      pinned: "left",
    },
    {
      field: "orgNme",
      headerName: t("사업장명"),
      width: 200,
      editable: false,
    },
    {
      field: "orgEngNme",
      headerName: t("사업장명(영문)"),
      width: 200,
      editable: false,
    },
    {
      field: "regtNo",
      headerName: t("사업장등록번호"),
      width: 150,
      editable: false,
    },
    {
      field: "regtNoSeq",
      headerName: t("종사업장번호"),
      width: 120,
      editable: false,
    },
    {
      field: "invOrg",
      headerName: t("수불사업장"),
      width: 100,
      editable: false,
    },
    {
      field: "enabledFlag",
      headerName: t("사용여부"),
      width: 100,
      editable: false,
    },
    {
      field: "sortOrder",
      headerName: t("Sort Order"),
      width: 100,
      editable: false,
    },
    {
      field: "rpsnNme",
      headerName: t("대표자"),
      width: 150,
      editable: false,
    },
    {
      field: "addr",
      headerName: t("주소"),
      width: 400,
      editable: false,
    },
  ];

  return (
    <WorkplaceGridStyles className={className}>
      <GridContainer>
        <AgGrid<WorkplaceDto & { id?: string; chk?: boolean }>
          height="100%"
          columnDefs={columnDefs}
          rowData={rowData || []}
          pagination={false}
          showToolbar={true}
          onAddRow={onAddRow}
          onCopyRow={onCopyRow}
          onDeleteRow={onDeleteRow}
          onSave={onSave}
          toolbarButtons={{
            showAdd: true,
            showCopy: true,
            showDelete: true,
            showExcelDownload: true,
            showExcelUpload: false,
            showRefresh: false,
            showSave: true,
          }}
          onGridReady={handleGridReady}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          onRowClicked={handleRowClicked}
          rowSelection="single"
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            flex: undefined,
            minWidth: 100,
            suppressSizeToFit: true,
          }}
          suppressRowClickSelection={false}
          domLayout="normal"
          animateRows={true}
          rowHeight={30}
          headerHeight={32}
          ensureDomOrder={true}
          enableRangeSelection={false}
        />
      </GridContainer>
    </WorkplaceGridStyles>
  );
});

WorkplaceGrid.displayName = "WorkplaceGrid";

export default WorkplaceGrid;

