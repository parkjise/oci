// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback, useEffect } from "react";
import type { GridApi, ColDef, GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";
import { FormAgGrid } from "@form";
import { RightGridStyles } from "./RightGrid.Styles";
import { useTranslation } from "react-i18next";
import type { WorkplaceUserDetailDto } from "@apis/system/org/workplaceUserApi";
import { useWorkplaceUserMngStore } from "@store/system/org/workplaceuser/workplaceUserMngStore";
import { useAuthStore } from "@store/com/auth/authStore";
import { showWarning } from "@components/ui/feedback/Message";

// ============================================================================
// Types
// ============================================================================
type RightGridProps = {
  className?: string;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 사업장사용자관리 오른쪽 그리드 컴포넌트 (사업장 목록)
 */
const RightGrid: React.FC<RightGridProps> = ({ className }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const gridRef = useRef<GridApi | null>(null);

  const {
    detailList,
    selectedHeader,
    workplaceOptions,
    fetchWorkplaceOptions,
    addDetailRow,
    deleteDetailRow,
    updateDetailList,
    saveDetailList,
  } = useWorkplaceUserMngStore();

  // 다국어 처리된 선택 라벨
  const chooseLabel = t("-선택-");

  // 사업장 목록 조회
  useEffect(() => {
    fetchWorkplaceOptions();
  }, [fetchWorkplaceOptions]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      if (!gridRef.current) return;

      const allRows: WorkplaceUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as WorkplaceUserDetailDto);
        }
      });

      // Primary 변경 시 다른 행의 Primary 해제
      if (params.colDef.field === "primary" && params.newValue === "Y") {
        allRows.forEach((row, index) => {
          if (index !== params.rowIndex && row.primary === "Y") {
            row.primary = "N";
            gridRef.current?.getRowNode(index.toString())?.setDataValue("primary", "N");
          }
        });
      }

      updateDetailList(allRows);
    },
    [updateDetailList]
  );

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    if (!gridRef.current || !user?.officeId || !selectedHeader?.empCode) {
      showWarning(t("MSG_SY_0111")); // 선택된 데이터가 없습니다.
      return;
    }

    addDetailRow(user.officeId, selectedHeader.empCode);

    // 포커스 이동
    setTimeout(() => {
      const rowCount = gridRef.current?.getDisplayedRowCount() || 0;
      if (rowCount > 0) {
        gridRef.current?.setFocusedCell(rowCount - 1, "orgId");
        gridRef.current?.startEditingCell({
          rowIndex: rowCount - 1,
          colKey: "orgId",
        });
      }
    }, 100);
  }, [user?.officeId, selectedHeader?.empCode, addDetailRow, t]);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    deleteDetailRow(selectedRows);
  }, [deleteDetailRow]);

  // 사업장 셀렉트 컬럼 정의
  const createWorkplaceSelectColumn = (): ColDef<WorkplaceUserDetailDto> => {
    return {
      field: "orgId",
      headerName: t("사업장"),
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: workplaceOptions.map((opt) => {
          if (opt.value === "") return chooseLabel;
          return `${opt.value} - ${opt.label}`;
        }),
      },
      valueGetter: (params) => {
        if (!params.data?.orgId) return chooseLabel;
        const orgId = params.data.orgId;
        const option = workplaceOptions.find((opt) => opt.value === orgId);
        return option ? `${option.value} - ${option.label}` : orgId;
      },
      valueSetter: (params) => {
        const newValue = params.newValue;
        if (!newValue || newValue === chooseLabel) {
          params.data.orgId = "";
          return true;
        }
        const codeMatch = newValue.match(/^([^-]+)/);
        const code = codeMatch ? codeMatch[1].trim() : newValue;
        params.data.orgId = code;
        if (!params.data.oriOrgId) {
          params.data.oriOrgId = code;
        }
        if (params.data.rowStatus !== "C") {
          params.data.rowStatus = "U";
        }
        return true;
      },
      valueFormatter: (params) => {
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        const option = workplaceOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        const option = workplaceOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
    };
  };

  // 컬럼 정의
  const columnDefs: ColDef<WorkplaceUserDetailDto>[] = [
    {
      headerName: "No.",
      width: 60,
      flex: 0,
      valueGetter: "node.rowIndex + 1",
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 80,
      flex: 0,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: (params: { value: string }) => {
        return params.value === "C" ? "New" : params.value === "U" ? "Mod" : params.value === "D" ? "Del" : "";
      },
    },
    createWorkplaceSelectColumn(),
    {
      field: "primary",
      headerName: t("소속사업장"),
      width: 100,
      flex: 0,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: "agCheckboxCellRenderer",
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      valueGetter: (params) => {
        return params.data?.primary === "Y";
      },
      valueSetter: (params) => {
        params.data.primary = params.newValue ? "Y" : "N";
        if (params.data.rowStatus !== "C") {
          params.data.rowStatus = "U";
        }
        return true;
      },
    },
  ];

  return (
    <RightGridStyles className={className}>
      <div className="data-grid-panel">
        <FormAgGrid<WorkplaceUserDetailDto & { id?: string }>
          rowData={detailList.map((row, index) => ({ ...row, id: `${row.orgId || ''}_${row.empyId || ''}_${index}` }))}
          headerHeight={32}
          columnDefs={columnDefs}
          height="100%"
          excelFileName={t("사업장사용자관리_사업장목록")}
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
              flex: undefined,
            },
            getRowId: (params) => {
              return `${params.data?.orgId || ''}_${params.data?.empyId || ''}_${Math.random()}`;
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: true,
            onGridReady: handleGridReady,
            onCellValueChanged: handleCellValueChanged,
          }}
          toolbarButtons={{
            showDelete: true,
            showCopy: false,
            showAdd: true,
            enableExcelDownload: true,
            showSave: true,
          }}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          onSave={saveDetailList}
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;
