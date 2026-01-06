// ============================================================================
// 다국어 라벨 상세 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.16 : ckkim (DetailGrid로 리팩토링, SlipPost 패턴 적용)
// - 2025.12.16 : ckkim (Store 패턴 적용)
// - 2025.12.16 : ckkim (별도 스타일 제거, 공통 컴포넌트만 사용)
// - 2025.12.16 : ckkim (커스텀 렌더러 간소화)
// - 2025.12.16 : ckkim (AG Grid cellClassRules로 상태 표시)

import { useRef, useCallback, useMemo } from "react";
import type {
  ColDef,
  GridReadyEvent,
  GridApi,
  CellValueChangedEvent,
} from "ag-grid-enterprise";
import { FormAgGrid } from "@components/ui/form";
import type { LabelDto } from "@apis/system/label/labelApi";
import { useTranslation } from "react-i18next";
import { useLabelMngStore } from "@store/system/pgm/lang/label/labelMngStore";
import { confirm } from "@components/ui/feedback/Message";

// ============================================================================
// Component
// ============================================================================
const DetailGrid: React.FC = () => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);

  // Store에서 상태와 액션 가져오기
  const {
    labelList,
    langTypeList,
    insert,
    deleteRows,
    save,
    handleCellValueChanged: updateRowStatus,
    setGridApi: setStoreGridApi,
  } = useLabelMngStore();

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
    const selectedRows = gridRef.current.getSelectedRows() as (LabelDto & {
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

  // 언어 타입 옵션 맵 (langTypeOptions에서 생성)
  const langTypeOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    langTypeOptions.forEach((opt) => {
      if (opt.value && opt.label) {
        map[opt.value] = opt.label;
      }
    });
    return map;
  }, [langTypeOptions]);

  const columnDefs: ColDef<LabelDto & { id?: string; chk?: boolean }>[] =
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
            field: "locale",
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
            field: "key",
            headerName: t("레이블 키"),
            width: 150,
            editable: true,
          },
          {
            field: "label",
            headerName: t("레이블 내용"),
            width: 300,
            editable: true,
          },
          {
            field: "desc",
            headerName: t("레이블 설명"),
            width: 300,
            editable: true,
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
        ] as ColDef<LabelDto & { id?: string; chk?: boolean }>[],
      [t, langTypeOptions, langTypeOptionsMap, langTypeList]
    );

  return (
    <FormAgGrid<LabelDto & { id?: string; chk?: boolean }>
      height="100%"
      columnDefs={columnDefs}
      rowData={labelList || []}
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
          onCellValueChanged: handleCellValueChanged,
        }),
        [handleGridReady, handleCellValueChanged]
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
