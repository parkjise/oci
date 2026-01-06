// ============================================================================
// 공통코드 상세 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.16 : ckkim (DetailGrid로 리팩토링, SlipPost 패턴 적용)
// - 2025.12.16 : ckkim (Store 패턴 적용)
// - 2025.12.16 : ckkim (별도 스타일 제거, 공통 컴포넌트만 사용)
// - 2025.12.16 : ckkim (AG Grid cellClassRules로 상태 표시)

import { useRef, useCallback, useMemo } from "react";
import type {
  ColDef,
  GridReadyEvent,
  GridApi,
  CellValueChangedEvent,
} from "ag-grid-enterprise";
import { FormAgGrid, FormButton } from "@components/ui/form";
import type { CodeDto } from "@apis/system/code/codeApi";
import { useTranslation } from "react-i18next";
import { useCodeMngStore } from "@store/system/pgm/code/codeMngStore";
import { confirm } from "@components/ui/feedback/Message";
import { PlusOutlined } from "@ant-design/icons";

// ============================================================================
// Component
// ============================================================================
interface DetailGridProps {
  onInsertTypeHeader?: () => void;
}

const DetailGrid: React.FC<DetailGridProps> = ({ onInsertTypeHeader }) => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);

  const {
    codeList,
    insert,
    copy,
    deleteRows,
    save,
    handleCellValueChanged: updateRowStatus,
    setGridApi: setStoreGridApi,
  } = useCodeMngStore();

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setStoreGridApi(params.api);
    },
    [setStoreGridApi]
  );

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      updateRowStatus(params);
    },
    [updateRowStatus]
  );

  const handleInsert = useCallback(() => {
    insert();
  }, [insert]);

  const handleCopy = useCallback(() => {
    copy();
  }, [copy]);

  const handleDelete = useCallback(() => {
    if (!gridRef.current) return;
    const selectedRows = gridRef.current.getSelectedRows() as (CodeDto & {
      id?: string;
    })[];
    deleteRows(selectedRows);
  }, [deleteRows]);

  const handleSave = useCallback(async () => {
    confirm({
      title: t("저장 확인"),
      content: t("MSG_SY_0083"),
      okText: t("저장"),
      cancelText: t("취소"),
      onOk: async () => {
        await save();
      },
    });
  }, [save, t]);

  // USER_TYPE 표시용
  const userTypeMap: Record<string, string> = {
    A: "ADMIN",
    U: "USER",
  };

  const columnDefs: ColDef<CodeDto & { id?: string; chk?: boolean }>[] =
    useMemo(
      () =>
        [
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
            cellStyle: {
              textAlign: "center" as const,
              fontWeight: "bold" as const,
            },
            cellClassRules: {
              "ag-cell-status-create": (params: any) => params.value === "C",
              "ag-cell-status-update": (params: any) => params.value === "U",
              "ag-cell-status-delete": (params: any) => params.value === "D",
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
            cellStyle: { textAlign: "center" as const },
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
        ] as ColDef<CodeDto & { id?: string; chk?: boolean }>[],
      [t]
    );

  // 커스텀 버튼들 (그리드 왼쪽 상단)
  const customButtons = useMemo(() => {
    if (!onInsertTypeHeader) return undefined;
    return [
      <FormButton
        key="insert-type-header"
        size="small"
        className="data-grid-panel__button"
        icon={<PlusOutlined />}
        onClick={onInsertTypeHeader}
      >
        {t("공통코드구분 입력")}
      </FormButton>,
    ];
  }, [onInsertTypeHeader, t]);

  return (
    <FormAgGrid<CodeDto & { id?: string; chk?: boolean }>
      height="100%"
      columnDefs={columnDefs}
      rowData={codeList || []}
      idField="id"
      showToolbar={true}
      styleOptions={{
        fontSize: "12px",
        headerFontSize: "12px",
        rowHeight: "35px",
        headerHeight: "35px",
        cellPadding: "6px",
        headerPadding: "8px",
        selectedRowBackgroundColor: "#e6f7ff",
        hoverRowBackgroundColor: "#bae7ff",
      }}
      gridOptions={useMemo(
        () => ({
          defaultColDef: {
            resizable: true,
            sortable: true,
            filter: true,
          },
          rowSelection: "multiple",
          animateRows: true,
          pagination: false,
          rowHeight: 35,
          suppressRowClickSelection: true,
          onGridReady: handleGridReady,
          onFirstDataRendered: () => {
            if (gridRef.current) {
              setStoreGridApi(gridRef.current);
            }
          },
          onCellValueChanged: handleCellValueChanged,
        }),
        [handleGridReady, handleCellValueChanged, setStoreGridApi]
      )}
      toolbarButtons={{
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showExcelDownload: false,
        showExcelUpload: false,
        showRefresh: false,
        showSave: true,
      }}
      customButtons={customButtons}
      onAddRow={handleInsert}
      onCopyRow={handleCopy}
      onDeleteRow={handleDelete}
      onSave={handleSave}
    />
  );
};

export default DetailGrid;
