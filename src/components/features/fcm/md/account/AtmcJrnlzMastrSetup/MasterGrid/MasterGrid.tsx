import React, { useMemo, useCallback, useRef } from "react";
import { FormAgGrid } from "@components/ui/form";
import type { ColDef, GridApi, GridReadyEvent, RowSelectedEvent, CellValueChangedEvent } from "ag-grid-community";
import { useAuthStore } from "@store/com/auth/authStore";
import { StatusTagRenderer } from "@components/ui/form/AgGrid/cells";
import { getSelectedRows } from "@utils/agGridUtils";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";
import type { MasterRowData, DetailRowData } from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";

import { message } from "antd";

interface MasterGridProps {
    className?: string;
}

const MasterGrid: React.FC<MasterGridProps> = ({ className }) => {
    const { masterList: rowData, setMasterList, loading, setSelectedMasterRow, fetchDetailList } = useAtmcJrnlzMastrSetupStore();
    const { user } = useAuthStore();
    const gridRef = useRef<GridApi<MasterRowData> | null>(null);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        gridRef.current = params.api;
    }, []);

    const onRowSelected = useCallback(
        (event: RowSelectedEvent<MasterRowData>) => {
            if (event.node.isSelected() && event.data) {
                setSelectedMasterRow(event.data);
                if (event.data.rowStatus !== "C") {
                    fetchDetailList(
                        user?.officeId || "OSE",
                        event.data.applName,
                        event.data.accountingType,
                        event.data.glItem
                    );
                }
            }
        },
        [setSelectedMasterRow, fetchDetailList, user]
    );

    const columnDefs = useMemo<ColDef<MasterRowData>[]>(
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
                headerName: "모듈",
                field: "applName",
                width: 100,
                editable: true,
            },
            {
                headerName: "타입",
                field: "accountingType",
                width: 150,
                editable: true,
            },
            {
                headerName: "구분",
                field: "glItem",
                width: 150,
                editable: true,
            },
            {
                headerName: "적요",
                field: "description",
                width: 300,
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
                width: 120,
            },
        ],
        []
    );

    const handleAddRow = useCallback(() => {
        if (!gridRef.current) return;

        const newId = `new_${Date.now()}`;
        const newRow: MasterRowData = {
            id: newId,
            applName: "",
            accountingType: "",
            glItem: "",
            description: "",
            lastUpdateDate: "",
            lastUpdatedBy: "",
            rowStatus: "C",
        };

        const focusedCell = gridRef.current.getFocusedCell();
        const insertIndex = focusedCell ? focusedCell.rowIndex + 1 : rowData.length;

        const newData = [...rowData];
        newData.splice(insertIndex, 0, newRow);
        setMasterList(newData);

        setTimeout(() => {
            gridRef.current?.setFocusedCell(insertIndex, "applName");
        }, 100);
    }, [rowData, setMasterList]);

    const handleCopyRow = useCallback(() => {
        if (!gridRef.current) return;
        const selectedRows = gridRef.current.getSelectedRows();
        if (selectedRows.length === 0) {
            message.warning("복사할 행을 선택해 주십시오.");
            return;
        }

        const sourceRow = selectedRows[0];
        const newId = `copy_${Date.now()}`;
        const newRow: MasterRowData = {
            ...sourceRow,
            id: newId,
            rowStatus: "C",
            lastUpdateDate: "",
            lastUpdatedBy: "",
            oriApplName: undefined,
            oriAccountingType: undefined,
            oriGlItem: undefined,
        };

        const focusedIndex = gridRef.current.getFocusedCell()?.rowIndex ?? rowData.length - 1;
        const newData = [...rowData];
        newData.splice(focusedIndex + 1, 0, newRow);

        // 1. 마스터 목록 업데이트
        setMasterList(newData);

        // 2. 디테일 행 복사 및 캐시 저장
        const { detailCache } = useAtmcJrnlzMastrSetupStore.getState();
        const sourceDetails = (detailCache[sourceRow.id] || []).filter(d => d.rowStatus !== "D");

        if (sourceDetails.length > 0) {
            const timestamp = Date.now();
            const newDetails = sourceDetails.map((detail, index) => ({
                ...detail,
                id: `copy_detail_${timestamp}_${index}`,
                rowStatus: "C" as const,
                lastUpdateDate: "",
                lastUpdatedBy: "",
                // 새 마스터의 키 정보와 동기화
                applName: newRow.applName,
                accountingType: newRow.accountingType,
                glItem: newRow.glItem,
                oriApplName: undefined,
                oriAccountingType: undefined,
                oriGlItem: undefined,
                oriGlClass: undefined,
            })) as DetailRowData[];

            // 직접 스토어의 캐시 업데이트
            useAtmcJrnlzMastrSetupStore.setState({
                detailCache: {
                    ...detailCache,
                    [newId]: newDetails
                }
            });
        }

        // 3. 새로 생성된 행으로 선택 및 포커스 이동
        setTimeout(() => {
            gridRef.current?.setFocusedCell(focusedIndex + 1, "applName");
            const newNode = gridRef.current?.getRowNode(newId);
            if (newNode) {
                newNode.setSelected(true);
            }
        }, 100);
    }, [rowData, setMasterList]);

    const handleDeleteRow = useCallback(() => {
        const selected = getSelectedRows<MasterRowData>(gridRef.current, () =>
            message.warning("삭제할 행을 선택해주세요.")
        );
        if (!selected) return;

        const { detailCache } = useAtmcJrnlzMastrSetupStore.getState();
        const newDetailCache = { ...detailCache };
        const selectedIds = new Set(selected.map(r => r.id));

        const updated = rowData.map(row => {
            if (selectedIds.has(row.id)) {
                if (row.rowStatus === "C") {
                    delete newDetailCache[row.id];
                    return null;
                }

                // 마스터가 삭제되면 해당 상세 내역들도 모두 삭제 상태로 변경
                if (newDetailCache[row.id]) {
                    newDetailCache[row.id] = newDetailCache[row.id].map(d => ({
                        ...d,
                        rowStatus: "D" as const
                    }));
                }
                return { ...row, rowStatus: "D" as const };
            }
            return row;
        }).filter((r): r is MasterRowData => r !== null);

        useAtmcJrnlzMastrSetupStore.setState({ detailCache: newDetailCache });
        setMasterList(updated);
    }, [rowData, setMasterList]);

    const handleCellValueChanged = useCallback((params: CellValueChangedEvent<MasterRowData>) => {
        const { data, colDef, node } = params;
        if (!data) return;

        // 1. 기존 데이터인 경우 상태를 'U'로 변경 (새 행인 'C'나 삭제 예정인 'D'는 제외)
        if (data.rowStatus !== "C" && data.rowStatus !== "D" && params.oldValue !== params.newValue) {
            data.rowStatus = "U";
            params.api.refreshCells({ rowNodes: [node], columns: ["rowStatus"], force: true });
        }

        // 2. 마스터 목록 상태 업데이트
        const updatedMasterList = rowData.map(r => r.id === data.id ? data : r);
        setMasterList(updatedMasterList);

        // 3. 헤더 키 필드(모듈, 타입, 구분) 변경 시 디테일 정보 동기화
        const field = colDef.field;
        if (field === "applName" || field === "accountingType" || field === "glItem") {
            const { detailCache, setDetailList, selectedMasterRow } = useAtmcJrnlzMastrSetupStore.getState();
            const masterId = data.id;
            const currentDetails = detailCache[masterId] || [];

            if (currentDetails.length > 0) {
                const updatedDetails = currentDetails.map(d => ({
                    ...d,
                    [field]: params.newValue,
                    // 마스터 키가 바뀌었으므로 디테일의 상태도 업데이트가 필요함 (기존 데이터인 경우만)
                    rowStatus: d.rowStatus || "U"
                })) as DetailRowData[];

                // 현재 편집 중인 마스터가 선택되어 있다면 화면의 디테일 리스트도 갱신
                if (selectedMasterRow && selectedMasterRow.id === masterId) {
                    setDetailList(updatedDetails);
                } else {
                    // 선택되지 않은 마스터인 경우 캐시만 업데이트
                    useAtmcJrnlzMastrSetupStore.setState({
                        detailCache: {
                            ...detailCache,
                            [masterId]: updatedDetails
                        }
                    });
                }
            }
        }
    }, [rowData, setMasterList]);

    return (
        <FormAgGrid<MasterRowData>
            className={className}
            rowData={rowData}
            columnDefs={columnDefs}
            idField="id"
            loading={loading}
            showToolbar={true}
            enableFilter={false}
            gridOptions={{ pagination: false, rowSelection: 'single' }}
            onGridReady={onGridReady}
            onRowSelected={onRowSelected}
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
            onRefresh={() => useAtmcJrnlzMastrSetupStore.getState().fetchMasterList()}
        />
    );
};

export default MasterGrid;
