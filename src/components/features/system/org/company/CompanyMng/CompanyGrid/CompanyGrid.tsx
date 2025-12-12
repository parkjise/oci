// ============================================================================
// 법인 관리 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent, ICellRendererParams, SelectionChangedEvent, RowClickedEvent } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { CompanyGridStyles, GridContainer } from "./CompanyGrid.styles";
import type { CompanyDto } from "@apis/system/org/companyApi";
import { useTranslation } from "react-i18next";

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<ICellRendererParams<CompanyDto & { id?: string; chk?: boolean }>> = ({ value }) => {
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
interface CompanyGridProps {
  className?: string;
  rowData: (CompanyDto & { id?: string; chk?: boolean })[];
  loading?: boolean;
  onModify?: (modified: boolean) => void;
  onAddRow?: (gridApi: any) => void;
  onCopyRow?: (gridApi: any) => void;
  onDeleteRow?: (gridApi: any) => void;
  onSave?: () => void;
  isModified?: boolean;
  totalCount?: number;
  onRowSelection?: (selectedRows: CompanyDto[]) => void;
}

export interface CompanyGridRef {
  getGridData: () => (CompanyDto & { id?: string; chk?: boolean })[];
  getSelectedRows: () => (CompanyDto & { id?: string; chk?: boolean })[];
  getGridApi: () => GridApi | null;
}

// ============================================================================
// Component
// ============================================================================
const CompanyGrid = forwardRef<CompanyGridRef, CompanyGridProps>(({
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
  const prevSelectedOfficeIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    getGridData: () => {
      if (!gridApi) return rowData || [];

      const allRows: (CompanyDto & { id?: string; chk?: boolean })[] = [];
      gridApi.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data);
        }
      });
      return allRows;
    },
    getSelectedRows: () => {
      if (!gridApi) return [];
      return gridApi.getSelectedRows() as (CompanyDto & { id?: string; chk?: boolean })[];
    },
    getGridApi: () => {
      return gridApi;
    },
  }), [gridApi, rowData]);

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  const hasModifiedRow = useCallback((gridApi: GridApi, excludeOfficeId?: string | null): boolean => {
    if (!gridApi) return false;
    
    const allRows = gridApi.getRenderedNodes()
      .map(node => node.data as CompanyDto)
      .filter(row => row && (!excludeOfficeId || row.officeId !== excludeOfficeId));
    
    return allRows.some(
      (row) => row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D"
    );
  }, []);

  const handleRowClicked = useCallback(
    (event: RowClickedEvent) => {
      if (!gridApi || !event.data) return;
      
      const clickedRow = event.data as CompanyDto;
      const currentSelectedRows = gridApi.getSelectedRows() as CompanyDto[];
      const currentSelectedOfficeId = currentSelectedRows.length > 0 ? currentSelectedRows[0].officeId : null;
      
      if (currentSelectedOfficeId === clickedRow.officeId) {
        prevSelectedOfficeIdRef.current = clickedRow.officeId || null;
        return;
      }
      
      const hasModified = hasModifiedRow(gridApi, currentSelectedOfficeId || undefined);
      
      if (hasModified) {
        event.node.setSelected(false);
        if (currentSelectedOfficeId) {
          gridApi.forEachNode((node) => {
            if (node.data?.officeId === currentSelectedOfficeId) {
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
      
      prevSelectedOfficeIdRef.current = clickedRow.officeId || null;
    },
    [gridApi, hasModifiedRow]
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selectedRows = event.api.getSelectedRows() as CompanyDto[];
      
      const allRows = event.api.getRenderedNodes()
        .map(node => node.data as CompanyDto)
        .filter(row => row);
      
      const hasModified = allRows.some(
        (row) => row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D"
      );
      
      if (hasModified && selectedRows.length > 0) {
        const newSelectedCompany = selectedRows[0];
        
        if (prevSelectedOfficeIdRef.current) {
          const prevSelectedRow = allRows.find(
            (row) => row.officeId === prevSelectedOfficeIdRef.current
          );
          
          if (prevSelectedRow) {
            const isPrevRowModified = prevSelectedRow.rowStatus === "U" || 
                                      prevSelectedRow.rowStatus === "C" || 
                                      prevSelectedRow.rowStatus === "D";
            
            if (isPrevRowModified && newSelectedCompany.officeId !== prevSelectedOfficeIdRef.current) {
              event.api.deselectAll();
              event.api.forEachNode((node) => {
                if (node.data?.officeId === prevSelectedOfficeIdRef.current) {
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
          (row) => row.officeId !== newSelectedCompany.officeId && 
                   (row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D")
        );
        
        if (hasOtherModifiedRow && prevSelectedOfficeIdRef.current && 
            newSelectedCompany.officeId !== prevSelectedOfficeIdRef.current) {
          event.api.deselectAll();
          event.api.forEachNode((node) => {
            if (node.data?.officeId === prevSelectedOfficeIdRef.current) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
          return;
        }
        
        prevSelectedOfficeIdRef.current = newSelectedCompany.officeId || null;
      } else if (selectedRows.length > 0) {
        prevSelectedOfficeIdRef.current = selectedRows[0].officeId || null;
      } else {
        prevSelectedOfficeIdRef.current = null;
      }
      
      if (onRowSelection) {
        onRowSelection(selectedRows);
      }
    },
    [onRowSelection]
  );

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    if (!gridApi || !event.data) return;

    const rowData = event.data as CompanyDto & { id?: string; chk?: boolean };
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
            const newSelectedRows = gridApi.getSelectedRows() as CompanyDto[];
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

  const columnDefs: ColDef<CompanyDto & { id?: string; chk?: boolean }>[] = [
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
      field: "officeId",
      headerName: t("회사코드"),
      width: 100,
      editable: true,
      pinned: "left",
    },
    {
      field: "officeNme",
      headerName: t("회사명"),
      width: 200,
      editable: false,
    },
    {
      field: "officeEngNme",
      headerName: t("회사명(영문)"),
      width: 300,
      editable: false,
    },
    {
      field: "rpsnNme",
      headerName: t("대표자"),
      width: 150,
      editable: false,
    },
    {
      field: "corpNo",
      headerName: t("법인번호"),
      width: 150,
      editable: false,
    },
    {
      field: "addr",
      headerName: t("주소"),
      width: 500,
      editable: false,
    },
  ];

  return (
    <CompanyGridStyles className={className}>
      <GridContainer>
        <AgGrid<CompanyDto & { id?: string; chk?: boolean }>
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
    </CompanyGridStyles>
  );
});

CompanyGrid.displayName = "CompanyGrid";

export default CompanyGrid;

