import { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import type { GridApi, GridReadyEvent, ColDef, CellValueChangedEvent } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import type { AccnutMngCodeListResponse, AccnutMngCodeSaveRequest } from "@/types/fcm/md/account/AccnutMngCodeRegist.types";
import { useAccnutMngCodeRegistStore } from "@/store/fcm/md/account/AccnutMngCodeRegistStore";
import { useAuthStore } from "@/store/com/auth/authStore";
import { saveAccnutMngCode } from "@/apis/fcm/md/account";
import { message } from "antd";
import { StatusTagRenderer } from "@components/ui/form/AgGrid/cells";
import { addNewRow, getSelectedRows } from "@utils/agGridUtils";

type MainGridProps = {
  className?: string;
  onSaveSuccess?: () => void;
};

export interface MainGridHandle {
  handleSave: () => Promise<void>;
}

export type AccnutMngCodeRowData = AccnutMngCodeListResponse & {
  id: string | number;
  rowStatus?: "C" | "U" | "D";
};

const MainGrid = forwardRef<MainGridHandle, MainGridProps>(({ className, onSaveSuccess }, ref) => {
  const { searchData, setSearchData, loading, setLoading, lastSearchRequest } = useAccnutMngCodeRegistStore();
  const { user } = useAuthStore();
  const gridRef = useRef<GridApi | null>(null);

  const rowData = useMemo(() => {
    return (searchData || []).map((item, index) => ({
      ...item,
      id: item.code || `new_${index}`,
      rowStatus: item.rowStatus as "C" | "U" | "D" | undefined,
    })) as AccnutMngCodeRowData[];
  }, [searchData]);

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);

  const createNewRow = useCallback((newId: string | number): AccnutMngCodeRowData => {
    // XML 로직: 최하단 CODE 다음 순번 계산
    let nextCode = "";
    if (searchData && searchData.length > 0) {
      const lastCode = searchData[searchData.length - 1].code || "";
      if (lastCode.length >= 2) {
        const stringPart = lastCode.slice(0, -2);
        const lastPart = lastCode.slice(-2);
        const lastNum = parseInt(lastPart, 10);
        if (!isNaN(lastNum)) {
          nextCode = stringPart + String(lastNum + 1).padStart(2, "0");
        }
      }
    }

    return {
      id: String(newId),
      officeId: user?.officeId || "",
      module: "GL",
      type: lastSearchRequest?.asType || "ACCMNG",
      code: nextCode,
      name1: "",
      nameDesc: "",
      rowStatus: "C",
    };
  }, [user, lastSearchRequest, searchData]);

  const handleAddRow = useCallback(() => {
    addNewRow<AccnutMngCodeRowData>(
      rowData,
      createNewRow,
      (updated) => setSearchData(updated),
      gridRef.current,
      "code"
    );
  }, [rowData, createNewRow, setSearchData]);

  const handleCopyRow = useCallback(() => {
    const selected = getSelectedRows<AccnutMngCodeRowData>(gridRef.current, () =>
      message.warning("복사할 행을 선택해주세요.")
    );
    if (!selected) return;

    const newRows = selected.map((row) => ({
      ...row,
      id: `copy_${Date.now()}_${Math.random()}`,
      rowStatus: "C" as const,
    }));
    setSearchData([...rowData, ...newRows]);
  }, [rowData, setSearchData]);

  const handleDeleteRow = useCallback(() => {
    const selected = getSelectedRows<AccnutMngCodeRowData>(gridRef.current, () =>
      message.warning("삭제할 행을 선택해주세요.")
    );
    if (!selected) return;

    const selectedIds = new Set(selected.map(r => r.id));
    const updated = rowData.map(row => {
      if (selectedIds.has(row.id)) {
        if (row.rowStatus === "C") return null;
        return { ...row, rowStatus: "D" as const };
      }
      return row;
    }).filter((r): r is AccnutMngCodeRowData => r !== null);

    setSearchData(updated);
  }, [rowData, setSearchData]);

  const handleSave = useCallback(async () => {
    const changedData = rowData.filter(r => r.rowStatus);
    if (changedData.length === 0) {
      message.info("변경사항이 없습니다.");
      return;
    }

    try {
      setLoading(true);
      const saveRequest: AccnutMngCodeSaveRequest = {
        list: changedData.map(r => ({
          ...r,
          rowStatus: r.rowStatus as "C" | "U" | "D",
        })),
      };

      const response = await saveAccnutMngCode(saveRequest);
      if (response.success) {
        message.success("저장에 성공하였습니다.");
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [rowData, setLoading, onSaveSuccess]);

  useImperativeHandle(ref, () => ({
    handleSave,
  }));

  const handleCellValueChanged = useCallback((params: CellValueChangedEvent<AccnutMngCodeRowData>) => {
    if (params.data && params.data.rowStatus !== "C" && params.data.rowStatus !== "D") {
      params.data.rowStatus = "U";
      params.api.refreshCells({ rowNodes: [params.node], columns: ["rowStatus"], force: true });

      // Store 동기화
      const updated = rowData.map(r => r.id === params.data.id ? params.data : r);
      setSearchData(updated);
    }
  }, [rowData, setSearchData]);

  const columnDefs = useMemo<ColDef<AccnutMngCodeRowData>[]>(() => [
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
      field: "code",
      headerName: "관리코드",
      width: 150,
      editable: (params) => params.data?.rowStatus === "C",
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "name1",
      headerName: "관리코드약명",
      width: 200,
      editable: true,
      headerClass: "ag-header-cell-center",
    },
    {
      field: "nameDesc",
      headerName: "관리코드명",
      width: 300,
      editable: true,
      headerClass: "ag-header-cell-center",
    },
  ], []);

  return (
    <FormAgGrid<AccnutMngCodeRowData>
      className={className}
      rowData={rowData}
      columnDefs={columnDefs}
      idField="id"
      loading={loading}
      showToolbar={true}
      enableFilter={false}
      onGridReady={handleGridReady}
      onCellValueChanged={handleCellValueChanged}
      toolbarButtons={{
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showSave: false, // GridSaveLayout에서 별도로 처리함
        showExcelDownload: true,
        showExcelUpload: false,
        showRefresh: true,
      }}
      onAddRow={handleAddRow}
      onCopyRow={handleCopyRow}
      onDeleteRow={handleDeleteRow}
      onRefresh={onSaveSuccess}
      onSave={handleSave}
      excelFileName="회계관리코드등록"
      gridOptions={{
        pagination: false,
      }}
    />
  );
});

MainGrid.displayName = "MainGrid";

export default MainGrid;