import React, { useMemo, useCallback, useRef } from "react";
import { FormAgGrid } from "@components/ui/form";
import type { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";
import { useAuthStore } from "@store/com/auth/authStore";
import { StatusTagRenderer } from "@components/ui/form/AgGrid/cells";
import { addNewRow, getSelectedRows } from "@utils/agGridUtils";
import { message } from "antd";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import type { DetailRowData } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

interface DetailGridProps {
    className?: string;
}

const DetailGrid: React.FC<DetailGridProps> = ({ className }) => {
    const { detailList: rowData, setDetailList, loading, selectedMasterRow, fetchDetailList } = useAtmcJrnlzMastrSetupStore();
    const { user } = useAuthStore();
    const gridRef = useRef<GridApi<DetailRowData> | null>(null);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridRef.current = params.api;
    }, []);

    const columnDefs = useMemo<ColDef<DetailRowData>[]>(
        () => [
            {
                headerName: "상태",
                field: "rowStatus",
                width: 60,
                pinned: "left",
                cellRenderer: StatusTagRenderer,
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
            },
            {
                headerName: "No.",
                width: 60,
                valueGetter: "node.rowIndex + 1",
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
            },
            {
                headerName: "코드",
                field: "glClass",
                width: 120,
                editable: (params) => params.data?.rowStatus === "C",
            },
            {
                headerName: "계정코드",
                field: "accountCode",
                width: 150,
                editable: true,
            },
            {
                headerName: "거래처코드",
                field: "cusCde",
                width: 120,
                editable: true,
            },
            {
                headerName: "품목코드",
                field: "itemCode",
                width: 150,
                editable: true,
            },
            {
                headerName: "최종수정일",
                field: "lastUpdateDate",
                width: 160,
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
            },
            {
                headerName: "최종수정자",
                field: "lastUpdatedBy",
                width: 150,
            },
        ],
        []
    );

    const handleAddRow = useCallback(() => {
        if (!selectedMasterRow) {
            message.warning("헤더를 먼저 선택해주세요.");
            return;
        }

        const createNewRow = (newId: string | number): DetailRowData => ({
            id: String(newId),
            officeId: user?.officeId || "OSE",
            applName: selectedMasterRow.applName,
            accountingType: selectedMasterRow.accountingType,
            glItem: selectedMasterRow.glItem,
            glClass: "",
            accountCode: "",
            cusCde: "",
            itemCode: "",
            lastUpdateDate: "",
            lastUpdatedBy: "",
            rowStatus: "C",
        });

        addNewRow<DetailRowData>(
            rowData,
            createNewRow,
            (updated) => setDetailList(updated),
            gridRef.current,
            "glClass"
        );
    }, [rowData, setDetailList, selectedMasterRow, user]);

    const handleCopyRow = useCallback(() => {
        if (!gridRef.current) return;
        const selectedRows = gridRef.current.getSelectedRows();
        if (selectedRows.length === 0) {
            message.warning("복사할 자료가 없습니다.");
            return;
        }

        const sourceRow = selectedRows[0];
        const newId = `copy_${Date.now()}`;
        const newRow: DetailRowData = {
            ...sourceRow,
            id: newId,
            rowStatus: "C",
            lastUpdateDate: "",
            lastUpdatedBy: "",
            oriGlClass: undefined,
        };

        const focusedIndex = gridRef.current.getFocusedCell()?.rowIndex ?? rowData.length - 1;
        const newData = [...rowData];
        newData.splice(focusedIndex + 1, 0, newRow);
        setDetailList(newData);

        setTimeout(() => {
            gridRef.current?.setFocusedCell(focusedIndex + 1, "glClass");
        }, 100);
    }, [rowData, setDetailList]);

    const handleDeleteRow = useCallback(() => {
        const selected = getSelectedRows<DetailRowData>(gridRef.current, () =>
            message.warning("삭제할 자료가 없습니다.")
        );
        if (!selected) return;

        const selectedIds = new Set(selected.map(r => r.id));
        const updated = rowData.map(row => {
            if (selectedIds.has(row.id)) {
                if (row.rowStatus === "C") return null;
                return { ...row, rowStatus: "D" as const };
            }
            return row;
        }).filter((r): r is DetailRowData => r !== null);

        setDetailList(updated);
    }, [rowData, setDetailList]);

    const handleCellValueChanged = useCallback((params: CellValueChangedEvent<DetailRowData>) => {
        if (params.data && params.data.rowStatus !== "C" && params.data.rowStatus !== "D") {
            params.data.rowStatus = "U";
            params.api.refreshCells({ rowNodes: [params.node], columns: ["rowStatus"], force: true });

            const updated = rowData.map(r => r.id === params.data.id ? params.data : r);
            setDetailList(updated);
        }
    }, [rowData, setDetailList]);

    const handleRefresh = useCallback(() => {
        if (selectedMasterRow) {
            fetchDetailList(
                user?.officeId || "OSE",
                selectedMasterRow.applName,
                selectedMasterRow.accountingType,
                selectedMasterRow.glItem
            );
        }
    }, [selectedMasterRow, fetchDetailList, user]);

    return (
        <FormAgGrid<DetailRowData>
            className={className}
            rowData={rowData}
            columnDefs={columnDefs}
            idField="id"
            loading={loading}
            showToolbar={true}
            enableFilter={false}
            gridOptions={{ pagination: false }}
            onGridReady={onGridReady}
            onCellValueChanged={handleCellValueChanged}
            toolbarButtons={{
                showAdd: true,
                showCopy: true,
                showDelete: true,
                showSave: false,
                showRefresh: true,
                showExcelDownload: true,
                showExcelUpload: false,
            }}
            onAddRow={handleAddRow}
            onCopyRow={handleCopyRow}
            onDeleteRow={handleDeleteRow}
            onRefresh={handleRefresh}
        />
    );
};

export default DetailGrid;
