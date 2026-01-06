/**
 * 환율 등록 - 메인 그리드
 */

import React, { useCallback, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { GridApi, GridReadyEvent, ColDef, CellValueChangedEvent, ValueGetterParams, ValueSetterParams } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { message } from "antd";
import dayjs from "dayjs";
import { getCodeDetailApi } from "@apis/com/code";
import { StatusTagRenderer } from "@components/ui/form/AgGrid/cells";
import { saveEhgtRegist } from "@apis/fcm/md/other/ehgtRegist";

// 행 데이터 타입 정의
export type EhgtRegistRowData = {
    id: string | number;
    curDate?: string; // 환율일자 (YYYYMMDD)
    cur?: string; // 통화
    exchg?: number; // 환율
    antiUsd?: number; // 환율(달러기준)
    remitOutRate?: number; // 전신환매도율
    remitInRate?: number; // 전신환매입율
    cashOutRate?: number; // 현찰매도율
    cashInRate?: number; // 현찰매입율
    viewRate?: number; // 일람출금율
    tcOutRate?: number; // TC매도율
    rowStatus?: "C" | "U" | "D";
};

type MainGridProps = {
    className?: string;
    rowData: EhgtRegistRowData[];
    setRowData: React.Dispatch<React.SetStateAction<EhgtRegistRowData[]>>;
    onSaveSuccess?: () => void;
    setSaving?: (saving: boolean) => void;
};

export interface MainGridHandle {
    handleSave: () => Promise<void>;
    handleRefresh: () => void;
}

const MainGrid = forwardRef<MainGridHandle, MainGridProps>(
    ({ className, rowData, setRowData, onSaveSuccess, setSaving }, ref) => {
        const gridRef = useRef<GridApi<EhgtRegistRowData> | null>(null);
        const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);

        // 통화 목록 조회
        React.useEffect(() => {
            const fetchCurrencies = async () => {
                try {
                    const currencyResponse = await getCodeDetailApi({
                        module: "GL",
                        type: "FRNCUR",
                        enabledFlag: "Y"
                    });
                    if (currencyResponse.success && Array.isArray(currencyResponse.data)) {
                        setCurrencyOptions(currencyResponse.data.map((item) => ({
                            value: String(item.code || ""),
                            label: String(item.code || ""),
                        })));
                    }
                } catch (error) {
                    console.error("Failed to fetch currencies:", error);
                }
            };
            fetchCurrencies();
        }, []);

        const onGridReady = useCallback((params: GridReadyEvent<EhgtRegistRowData>) => {
            gridRef.current = params.api;
        }, []);

        // 새 행 생성 함수
        const createNewRow = useCallback((newId: number | string): EhgtRegistRowData => ({
            id: String(newId),
            curDate: dayjs().format("YYYYMMDD"),
            cur: "",
            exchg: undefined,
            antiUsd: undefined,
            remitOutRate: undefined,
            remitInRate: undefined,
            cashOutRate: undefined,
            cashInRate: undefined,
            viewRate: undefined,
            tcOutRate: undefined,
            rowStatus: "C",
        }), []);

        // 새 ID 생성 함수
        const generateNewId = useCallback((): string => {
            if (rowData.length === 0) return "1";
            const maxId = Math.max(
                ...rowData.map((row) => {
                    const id = row.id;
                    if (typeof id === "number") return id;
                    const num = parseInt(String(id), 10);
                    return isNaN(num) ? 0 : num;
                })
            );
            return String(maxId + 1);
        }, [rowData]);

        // 행 추가 핸들러
        const handleAddRow = useCallback(() => {
            const newId = generateNewId();
            const newRow = createNewRow(newId);
            setRowData([...rowData, newRow]);

            setTimeout(() => {
                if (gridRef.current) {
                    const rowCount = gridRef.current.getDisplayedRowCount();
                    const lastNode = gridRef.current.getDisplayedRowAtIndex(rowCount - 1);
                    if (lastNode) {
                        lastNode.setSelected(true);
                        gridRef.current.ensureNodeVisible(lastNode, "bottom");
                    }
                }
            }, 100);
        }, [rowData, generateNewId, createNewRow, setRowData]);

        // 행 복사 핸들러
        const handleCopyRow = useCallback(() => {
            if (!gridRef.current) return;
            const selectedRows = gridRef.current.getSelectedRows();
            if (selectedRows.length === 0) {
                message.warning("복사할 행을 선택해주세요.");
                return;
            }

            const newRows = selectedRows.map((row) => {
                const newId = generateNewId();
                return {
                    ...row,
                    id: newId,
                    rowStatus: "C" as const
                };
            });

            setRowData([...rowData, ...newRows]);

            setTimeout(() => {
                if (gridRef.current) {
                    const rowCount = gridRef.current.getDisplayedRowCount();
                    const lastNode = gridRef.current.getDisplayedRowAtIndex(rowCount - 1);
                    if (lastNode) {
                        lastNode.setSelected(true);
                        gridRef.current.ensureNodeVisible(lastNode, "bottom");
                    }
                }
            }, 100);
        }, [rowData, generateNewId, setRowData]);

        // 저장 핸들러
        const handleSave = useCallback(async () => {
            const changedData = rowData.filter(row => row.rowStatus);
            if (changedData.length === 0) {
                message.info("변경사항이 없습니다.");
                return;
            }

            try {
                if (setSaving) setSaving(true);
                const saveList = changedData.map(row => {
                    const mappedRow = { ...row };
                    if (mappedRow.curDate) {
                        mappedRow.curDate = dayjs(mappedRow.curDate, "YYYYMMDD").format("YYYY-MM-DD");
                    }
                    return mappedRow;
                }).filter(row => row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D");

                if (saveList.length === 0) {
                    setRowData(prev => prev.filter(r => r.rowStatus !== "D"));
                    return;
                }

                const response = await saveEhgtRegist({ list: saveList as any });

                if (response.success) {
                    message.success("저장에 성공하였습니다.");
                    if (onSaveSuccess) {
                        onSaveSuccess();
                    }
                }
            } catch (error) {
                console.error("Save error:", error);
                message.error("저장 중 오류가 발생했습니다.");
            } finally {
                if (setSaving) setSaving(false);
            }
        }, [rowData, onSaveSuccess, setRowData, setSaving]);

        const handleRefresh = useCallback(() => {
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        }, [onSaveSuccess]);

        useImperativeHandle(ref, () => ({
            handleSave,
            handleRefresh,
        }));

        // 숫자 포맷터
        const numberFormatter = useCallback((params: { value?: number }) => {
            if (params.value === undefined || params.value === null) return "";
            return params.value.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 5
            });
        }, []);

        // 날짜 포맷터
        const dateFormatter = useCallback((params: { value?: string | Date }) => {
            if (!params.value) return "";
            let date: dayjs.Dayjs;
            if (params.value instanceof Date) {
                date = dayjs(params.value);
            } else if (typeof params.value === "string") {
                if (params.value.length === 8) {
                    date = dayjs(params.value, "YYYYMMDD");
                } else {
                    date = dayjs(params.value);
                }
            } else {
                return String(params.value);
            }
            if (!date.isValid()) return String(params.value);
            return date.format("YYYY-MM-DD");
        }, []);

        const columnDefs = useMemo<ColDef<EhgtRegistRowData>[]>(() => [
            {
                headerName: "상태",
                field: "rowStatus",
                width: 50,
                pinned: "left",
                excludeFromExcel: true,
                cellRenderer: StatusTagRenderer,
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
            },
            {
                headerName: "순번",
                valueGetter: "node.rowIndex + 1",
                width: 50,
                pinned: "left",
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
            },
            {
                headerName: "환율일자",
                field: "curDate",
                width: 120,
                pinned: "left",
                editable: (params) => params.data?.rowStatus === "C",
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
                valueFormatter: dateFormatter,
                valueGetter: (params: ValueGetterParams<EhgtRegistRowData>) => {
                    if (!params.data?.curDate) return null;
                    const dateStr = params.data.curDate;
                    if (typeof dateStr === "string" && dateStr.length === 8) {
                        const year = parseInt(dateStr.substring(0, 4), 10);
                        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
                        const day = parseInt(dateStr.substring(6, 8), 10);
                        return new Date(year, month, day);
                    }
                    return null;
                },
                valueSetter: (params: ValueSetterParams<EhgtRegistRowData>) => {
                    if (params.data && params.newValue) {
                        let date: Date;
                        if (params.newValue instanceof Date) {
                            date = params.newValue;
                        } else if (typeof params.newValue === "string" || typeof params.newValue === "number") {
                            date = new Date(params.newValue);
                        } else {
                            return false;
                        }
                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            params.data.curDate = `${year}${month}${day}`;
                            return true;
                        }
                    }
                    return false;
                },
                cellEditor: "agDateCellEditor",
                cellEditorParams: {
                    format: "yyyy-MM-dd",
                },
            },
            {
                headerName: "통화",
                field: "cur",
                width: 80,
                pinned: "left",
                editable: true,
                cellStyle: { textAlign: "center" },
                headerClass: "ag-header-cell-center",
                cellEditor: "agSelectCellEditor",
                cellEditorParams: {
                    values: currencyOptions.map((opt) => opt.value),
                },
            },
            {
                headerName: "환율",
                field: "exchg",
                width: 120,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "환율(달러기준)",
                field: "antiUsd",
                width: 120,
                editable: false,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                type: "numericColumn",
            },
            {
                headerName: "전신환매도율",
                field: "remitOutRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "전신환매입율",
                field: "remitInRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "현찰매도율",
                field: "cashOutRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "현찰매입율",
                field: "cashInRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "일람출금율",
                field: "viewRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
            {
                headerName: "TC매도율",
                field: "tcOutRate",
                width: 130,
                editable: true,
                cellStyle: { textAlign: "right" },
                headerClass: "ag-header-cell-center",
                valueFormatter: numberFormatter,
                cellEditor: "agNumberCellEditor",
                cellEditorParams: {
                    precision: 5,
                    min: 0,
                },
                type: "numericColumn",
            },
        ], [dateFormatter, numberFormatter, currencyOptions]);

        const toolbarButtons = useMemo(() => ({
            showAdd: true,
            showCopy: true,
            showDelete: true,
            showExcelDownload: true,
            showExcelUpload: false,
            showRefresh: true,
            showSave: false
        }), []);

        const handleCellValueChanged = useCallback((params: CellValueChangedEvent<EhgtRegistRowData>) => {
            if (params.data) {
                const updatedRow = params.data;

                if (updatedRow.rowStatus !== "C" && updatedRow.rowStatus !== "D") {
                    updatedRow.rowStatus = "U";
                }

                const updatedRowData = rowData.map((row: EhgtRegistRowData) =>
                    row.id === updatedRow.id ? updatedRow : row
                );
                setRowData(updatedRowData);

                params.api.refreshCells({
                    rowNodes: [params.node],
                    columns: ["rowStatus"],
                    force: true
                });
            }
        }, [rowData, setRowData]);

        const gridOptions = useMemo(() => ({
            rowSelection: "multiple" as const,
            animateRows: true,
            pagination: false,
            suppressRowClickSelection: false,
            onGridReady,
            onCellValueChanged: handleCellValueChanged,
        }), [onGridReady, handleCellValueChanged]);

        return (
            <FormAgGrid<EhgtRegistRowData>
                idField="id"
                columnDefs={columnDefs}
                rowData={rowData}
                gridOptions={gridOptions}
                showToolbar={true}
                enableFilter={false}
                toolbarButtons={toolbarButtons}
                onAddRow={handleAddRow}
                onCopyRow={handleCopyRow}
                setRowData={setRowData}
                createNewRow={createNewRow}
                onRefresh={handleRefresh}
                excelFileName={() => {
                    const d = new Date();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return `환율 등록_${year}${month}${day}`;
                }}
                className={className}
            />
        );
    }
);

export default MainGrid;
