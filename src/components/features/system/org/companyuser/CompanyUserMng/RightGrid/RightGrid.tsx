// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback, useEffect } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@form";
import { RightGridStyles } from "./RightGrid.Styles";
import { useTranslation } from "react-i18next";
import type { CompanyUserDetailDto } from "@apis/system/org/companyUserApi";
import { useCompanyUserMngStore } from "@store/system/org/companyuser/companyUserMngStore";
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
 * 회사사용자관리 오른쪽 그리드 컴포넌트 (회사 권한 목록)
 */
const RightGrid: React.FC<RightGridProps> = ({ className }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const gridRef = useRef<GridApi | null>(null);
  
  const {
    detailList,
    selectedHeader,
    companyOptions,
    fetchCompanyOptions,
    addDetailRow,
    deleteDetailRow,
    updateDetailList,
    saveDetailList,
  } = useCompanyUserMngStore();

  // 다국어 처리된 선택 라벨
  const chooseLabel = t("-선택-");

  // 회사 목록 조회
  useEffect(() => {
    fetchCompanyOptions();
  }, [fetchCompanyOptions]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      if (!gridRef.current) return;

      const allRows: CompanyUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as CompanyUserDetailDto);
        }
      });

      // Primary 변경 시 다른 행의 Primary 해제
      if (params.colDef.field === "primeYn" && params.newValue === "Y") {
        allRows.forEach((row, index) => {
          if (index !== params.rowIndex && row.primeYn === "Y") {
            row.primeYn = "N";
            gridRef.current
              ?.getRowNode(index.toString())
              ?.setDataValue("primeYn", "N");
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
        showWarning(t("MSG_CM_0477")); // 선택된 데이터가 없습니다.
        return;
    }

    addDetailRow(user.officeId, selectedHeader.empCode);

    // 포커스 이동
    setTimeout(() => {
      const rowCount = gridRef.current?.getDisplayedRowCount() || 0;
      if (rowCount > 0) {
        gridRef.current?.setFocusedCell(rowCount - 1, "authOfficeId");
        gridRef.current?.startEditingCell({
          rowIndex: rowCount - 1,
          colKey: "authOfficeId",
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

  // 회사 셀렉트 컬럼 정의
  const createCompanySelectColumn = (): ColDef<CompanyUserDetailDto> => {
    return {
      field: "authOfficeId",
      headerName: t("회사명"),
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: companyOptions.map((opt) => {
          if (opt.value === "") return chooseLabel;
          return `${opt.value} - ${opt.label}`;
        }),
      },
      valueGetter: (params) => {
        if (!params.data?.authOfficeId) return chooseLabel;
        const authOfficeId = params.data.authOfficeId;
        const option = companyOptions.find((opt) => opt.value === authOfficeId);
        return option ? `${option.value} - ${option.label}` : authOfficeId;
      },
      valueSetter: (params) => {
        const newValue = params.newValue;
        if (!newValue || newValue === chooseLabel) {
          params.data.authOfficeId = "";
          return true;
        }
        const codeMatch = newValue.match(/^([^-]+)/);
        const code = codeMatch ? codeMatch[1].trim() : newValue;
        params.data.authOfficeId = code;
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
        const option = companyOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        const option = companyOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
    };
  };

  // 컬럼 정의
  const columnDefs: ColDef<CompanyUserDetailDto>[] = [
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
    createCompanySelectColumn(),
    {
      field: "primeYn",
      headerName: t("Primary"),
      width: 100,
      flex: 0,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: "agCheckboxCellRenderer",
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      valueGetter: (params) => {
        return params.data?.primeYn === "Y";
      },
      valueSetter: (params) => {
        params.data.primeYn = params.newValue ? "Y" : "N";
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
        <FormAgGrid<CompanyUserDetailDto & { id?: string }>
          rowData={detailList.map((row, index) => ({
            ...row,
            id: `${row.authOfficeId || ""}_${row.empCode || ""}_${index}`,
          }))}
          headerHeight={32}
          columnDefs={columnDefs}
          height="100%"
          excelFileName={t("회사사용자관리_회사권한목록")}
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
              return `${params.data?.authOfficeId || ""}_${params.data?.empCode || ""
                }_${Math.random()}`;
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
