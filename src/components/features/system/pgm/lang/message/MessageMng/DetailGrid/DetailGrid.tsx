// ============================================================================
// 다국어 메시지 상세 그리드 컴포넌트
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
import { FormAgGrid } from "@components/ui/form";
import type { MessageDto } from "@apis/system/message/messageApi";
import { useTranslation } from "react-i18next";
import { useMessageMngStore } from "@store/system/pgm/lang/message/messageMngStore";
import { confirm } from "@components/ui/feedback/Message";

// ============================================================================
// Component
// ============================================================================
const DetailGrid: React.FC = () => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);

  // Store에서 상태와 액션 가져오기
  const {
    messageList,
    langTypeList,
    iconTypeList,
    buttonTypeList,
    insert,
    deleteRows,
    save,
    handleCellValueChanged: updateRowStatus,
    setGridApi: setStoreGridApi,
  } = useMessageMngStore();

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setStoreGridApi(params.api);
    },
    [setStoreGridApi]
  );

  // 그리드 데이터 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      updateRowStatus(params);
    },
    [updateRowStatus]
  );

  // 입력 핸들러
  const handleInsert = useCallback(() => {
    insert();
  }, [insert]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (!gridRef.current) return;
    const selectedRows = gridRef.current.getSelectedRows() as (MessageDto & {
      id?: string;
    })[];
    deleteRows(selectedRows);
  }, [deleteRows]);

  // 저장 핸들러
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

  // 언어 타입 옵션 배열
  const langTypeOptions = useMemo(
    () =>
      langTypeList.map((item) => ({
        value: item.code || "",
        label: item.name1 || "",
      })),
    [langTypeList]
  );

  // 아이콘 타입 옵션 배열
  const iconTypeOptions = useMemo(
    () =>
      iconTypeList.map((item) => ({
        value: item.code || "",
        label: item.name1 || "",
      })),
    [iconTypeList]
  );

  // 버튼 타입 옵션 배열
  const buttonTypeOptions = useMemo(
    () =>
      buttonTypeList.map((item) => ({
        value: item.code || "",
        label: item.name1 || "",
      })),
    [buttonTypeList]
  );

  // 언어 타입 옵션 맵
  const langTypeOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    langTypeList.forEach((item) => {
      if (item.code && item.name1) {
        map[item.code] = item.name1;
      }
    });
    return map;
  }, [langTypeList]);

  const columnDefs: ColDef<MessageDto & { id?: string; chk?: boolean }>[] =
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
            // AG Grid의 cellClassRules를 사용하여 상태별 색상 적용
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
            field: "lang",
            headerName: t("언어"),
            width: 100,
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
              values: langTypeOptions.map((opt) => opt.value),
            },
            valueFormatter: (params) => {
              if (!params.value) return "";
              return langTypeOptionsMap[params.value] || params.value;
            },
          },
          {
            field: "msgKey",
            headerName: t("메시지 키"),
            width: 200,
            editable: true,
          },
          {
            field: "msgContents",
            headerName: t("메시지 내용"),
            width: 350,
            editable: true,
          },
          {
            field: "msgIconType",
            headerName: t("아이콘타입"),
            width: 120,
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
              // name1 값으로 저장되므로 name1 값들을 옵션으로 사용
              values: iconTypeOptions.map((opt) => opt.label),
            },
            // name1 값이 저장되어 있으므로 valueFormatter 불필요 (그대로 표시)
          },
          {
            field: "msgButtonType",
            headerName: t("메시지버튼타입"),
            width: 150,
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
              // name1 값으로 저장되므로 name1 값들을 옵션으로 사용
              values: buttonTypeOptions.map((opt) => opt.label),
            },
            // name1 값이 저장되어 있으므로 valueFormatter 불필요 (그대로 표시)
          },
          {
            field: "createdBy",
            headerName: t("작성자"),
            width: 100,
            editable: false,
          },
          {
            field: "creationDate",
            headerName: t("작성일자"),
            width: 120,
            editable: false,
            valueFormatter: (params) => {
              if (!params.value) return "";
              if (typeof params.value === "string") {
                return params.value.substring(0, 10);
              }
              return params.value;
            },
          },
          {
            field: "lastUpdatedBy",
            headerName: t("수정자"),
            width: 100,
            editable: false,
          },
          {
            field: "lastUpdateDate",
            headerName: t("수정일자"),
            width: 120,
            editable: false,
            valueFormatter: (params) => {
              if (!params.value) return "";
              if (typeof params.value === "string") {
                return params.value.substring(0, 10);
              }
              return params.value;
            },
          },
          {
            field: "programId",
            headerName: t("프로그램ID"),
            width: 150,
            editable: false,
          },
          {
            field: "terminalId",
            headerName: t("터미널ID"),
            width: 150,
            editable: false,
          },
        ] as ColDef<MessageDto & { id?: string; chk?: boolean }>[],
      [
        t,
        langTypeOptions,
        langTypeOptionsMap,
        iconTypeOptions,
        buttonTypeOptions,
      ]
    );

  return (
    <FormAgGrid<MessageDto & { id?: string; chk?: boolean }>
      height="100%"
      columnDefs={columnDefs}
      rowData={messageList || []}
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
        showCopy: false,
        showDelete: true,
        showExcelDownload: false,
        showExcelUpload: false,
        showRefresh: false,
        showSave: true,
      }}
      onAddRow={handleInsert}
      onDeleteRow={handleDelete}
      onSave={handleSave}
    />
  );
};

export default DetailGrid;
