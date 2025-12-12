// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import { useTranslation } from "react-i18next";
import type { CompanyUserHeaderDto } from "@apis/system/org/companyUserApi";

// ============================================================================
// Types
// ============================================================================
type LeftGridProps = {
    className?: string;
    rowData?: CompanyUserHeaderDto[];
    onRowSelectionChanged?: (selectedRow: CompanyUserHeaderDto | null) => void;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 회사사용자관리 왼쪽 그리드 컴포넌트 (사용자 목록)
 * - 변경이력: 2025.12.12 : ckkim (최초작성 - WorkplaceUserMng 참조)
 */
const LeftGrid: React.FC<LeftGridProps> = ({
    className,
    rowData = [],
    onRowSelectionChanged,
}) => {
    const { t } = useTranslation();
    const gridRef = useRef<GridApi | null>(null);

    // 그리드 준비 핸들러
    const handleGridReady = useCallback(
        (params: GridReadyEvent) => {
            gridRef.current = params.api;
        },
        []
    );

    // 행 선택 변경 핸들러
    const handleSelectionChanged = useCallback(() => {
        if (!gridRef.current || !onRowSelectionChanged) return;

        const selectedRows = gridRef.current.getSelectedRows();
        if (selectedRows.length > 0) {
            onRowSelectionChanged(selectedRows[0] as CompanyUserHeaderDto);
        } else {
            onRowSelectionChanged(null);
        }
    }, [onRowSelectionChanged]);

    // 컬럼 정의
    const columnDefs: ColDef<CompanyUserHeaderDto>[] = [
        {
            headerName: "No.",
            width: 50,
            valueGetter: "node.rowIndex + 1",
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-cell-center",
        },
        {
            field: "empCode",
            headerName: t("사용자 ID"),
            width: 120,
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-cell-center",
        },
        {
            field: "empName",
            headerName: t("사용자명"),
            width: 120,
            cellStyle: { textAlign: "left" },
            headerClass: "ag-header-cell-center",
        },
        {
            field: "deptName",
            headerName: t("소속부서"),
            width: 200,
            cellStyle: { textAlign: "left" },
            headerClass: "ag-header-cell-center",
        },
        {
            field: "useYn",
            headerName: t("사용여부"),
            width: 100,
            cellStyle: { textAlign: "center" },
            headerClass: "ag-header-cell-center",
        },
    ];

    return (
        <LeftGridStyles className={className}>
            <div className="data-grid-panel">
                <FormAgGrid<CompanyUserHeaderDto & { id?: string }>
                    rowData={rowData.map((row, index) => ({ ...row, id: row.empCode || String(index) }))}
                    headerHeight={32}
                    columnDefs={columnDefs}
                    height={600}
                    excelFileName={t("회사사용자관리_사용자목록")}
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
                            // empCode를 rowId로 사용
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
