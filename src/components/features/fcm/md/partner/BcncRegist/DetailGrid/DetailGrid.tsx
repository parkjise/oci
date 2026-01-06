import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  memo,
  Suspense,
} from "react";
import {
  showError,
  showWarning,
  showSuccess,
  showInfo,
} from "@/components/ui/feedback/Message";
import { useBcncRegistStore } from "@store/fcm/md/partner/BcncRegist/BcncRegistStore";
import type { BcncShipResponse } from "@/types/fcm/md/partner/BcncRegist/BcncRegist.types";
import SearchIconCellRenderer from "@components/ui/form/AgGrid/cells/SearchIconCellRenderer";
import { StatusTagRenderer } from "@components/ui/form/AgGrid/cells/TagCellRenderer";
import { createComboBoxColumn } from "@components/ui/form/AgGrid/columns/comboBoxColumn";
import { useGridCellEditor } from "./useGridCellEditor";
import dayjs from "dayjs";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellStyle,
  IRowNode,
  ValueFormatterParams,
  CellValueChangedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { AppPageModal } from "@components/ui/feedback";
import { useTranslation } from "react-i18next";

type DetailGridProps = {
  className?: string;
  rowData?: BcncShipResponse[];
};

export type GridRowData = BcncShipResponse & {
  id?: string;
  rowStatus?: "C" | "U" | "D";
};

// 영업사원 셀 렌더러 컴포넌트

// 공통 검색 셀 렌더러 컴포넌트 (국가코드, 화폐단위, 주소용)

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);
  // ✅ Store 통구독 문제 해결: 필요한 상태만 개별 selector로 구독
  const shipListData = useBcncRegistStore((state) => state.shipListData);
  const detailViewMode = useBcncRegistStore((state) => state.detailViewMode);

  const { handleOpenSearch, handleCellEditingStopped, modalProps } =
    useGridCellEditor();

  // DetailView의 edit 모드일 때만 버튼 활성화
  const isEditMode = detailViewMode === "edit";

  // Store의 shipListData를 우선 사용하고, 없으면 propRowData 사용
  // shipListData가 빈 배열이어도 명시적으로 설정된 것이므로 우선 사용
  const sourceData = useMemo(() => {
    // shipListData가 undefined가 아니면 사용 (빈 배열도 포함)
    if (shipListData !== undefined) {
      return shipListData;
    }
    return propRowData || [];
  }, [shipListData, propRowData]);

  // 내부 상태로 rowData 관리
  const [internalRowData, setInternalRowData] = useState<GridRowData[]>(() => {
    return sourceData.map((item, index) => ({
      ...item,
      id: item.shipId || (item as GridRowData).id || `row-${index}`,
      rowStatus: (item as GridRowData).rowStatus,
    }));
  });

  // ⚡ sourceData 동기화 최적화: 초기 로드 시에만 적용
  React.useEffect(() => {
    // ✅ 편집 모드가 아닐 때만 Store → Grid 동기화
    // 편집 중에는 Grid API가 단일 진실의 원천(Single Source of Truth)
    // 단, sourceData가 빈 배열이면 무조건 초기화 (입력 버튼 클릭 시)
    if (detailViewMode !== "edit" || sourceData.length === 0) {
      const newRowData = sourceData.map((item, index) => ({
        ...item,
        id: item.shipId || (item as GridRowData).id || `row-${index}`,
        rowStatus: (item as GridRowData).rowStatus,
      }));
      setInternalRowData(newRowData);

      if (gridRef.current) {
        gridRef.current.setGridOption("rowData", newRowData);
      }
    }
  }, [sourceData, detailViewMode]); // ⚡ detailViewMode 추가: 편집 중 동기화 방지

  const rowData = internalRowData;

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
    // Store에 detailGridApi 저장
    useBcncRegistStore.getState().setDetailGridApi(params.api);
  }, []);

  // 새 ID 생성 함수
  const generateNewId = useCallback((): string => {
    if (rowData.length === 0) return "1";
    // rowData의 ID들을 숫자로 변환하여 최대값 찾기 (문자열 등 섞여있을 수 있음 대비)
    const maxId = rowData.reduce((max, row) => {
      const idStr = String(row.id || "");
      // "row-" 시작하는 임시 ID는 제외
      if (idStr.startsWith("row-")) return max;
      const num = parseInt(idStr, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return String(maxId + 1);
  }, [rowData]);

  // 새 행 생성 함수
  const createNewRow = useCallback((newId?: number | string): GridRowData => {
    const idStr =
      newId !== undefined
        ? String(newId)
        : `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      // shipId와 shipCustNo는 새 행일 때 비어있어야 함 (백엔드에서 생성)
      id: idStr, // 그리드 내부 식별용 ID
      useYn: "Y",
      primaryChk: "N",
      country: "KOR", // 기본값: 대한민국
      nationName: "대한민국",
      orgId: "HO", // 기본값: HO
      rowStatus: "C",
      currency: "KRW",
    } as GridRowData;
  }, []);

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    if (!gridRef.current) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }
    const newId = generateNewId(); // 임시 ID 생성
    const newRow = createNewRow(newId);

    // ✅ 로컬 상태에 직접 추가 (edit 모드에서는 Store 동기화 안 되므로)
    setInternalRowData((prev) => [newRow, ...prev]);

    // Store에도 추가 (저장 시 활용)
    useBcncRegistStore.getState().addShipListItem(newRow);

    // 기존 선택 해제
    gridRef.current.deselectAll();

    // 새 행에 포커스 이동 (비동기 처리 - 그리드 렌더링 대기)
    setTimeout(() => {
      if (gridRef.current) {
        // ID 필드로 노드를 찾음
        const rowNode = gridRef.current.getRowNode(newRow.id || "");
        if (rowNode) {
          rowNode.setSelected(true);
          gridRef.current.ensureNodeVisible(rowNode, "top");
          gridRef.current.setFocusedCell(rowNode.rowIndex || 0, "shipName");
        } else {
          // fallback: 첫 번째 행 선택
          const firstNode = gridRef.current.getDisplayedRowAtIndex(0);
          if (firstNode) {
            firstNode.setSelected(true);
            gridRef.current.ensureNodeVisible(firstNode, "top");
          }
        }
      }
    }, 100);

    showSuccess("새 행이 추가되었습니다.");
  }, [generateNewId, createNewRow]);

  // 행 복사 핸들러
  const handleCopyRow = useCallback(() => {
    if (!gridRef.current) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = gridRef.current.getSelectedRows() as GridRowData[];
    if (selectedRows.length === 0) {
      showWarning("복사할 행을 선택해주세요.");
      return;
    }

    // 기존 선택 해제
    gridRef.current.deselectAll();

    // ✅ 복사할 행들을 배열로 모음
    const newRows: GridRowData[] = [];

    selectedRows.forEach((row, index) => {
      const newId = String(Date.now()) + index; // 충돌 방지용 간편 ID
      const newRow: GridRowData = {
        ...row,
        shipId: undefined, // 새 행이므로 shipId 제거
        shipCustno: undefined, // 새 행이므로 shipCustno 제거
        id: newId, // 그리드 내부 식별용 임시 ID
        rowStatus: "C" as const,
      };

      newRows.push(newRow);
      // Store에도 추가 (저장 시 활용)
      useBcncRegistStore.getState().addShipListItem(newRow);
    });

    // ✅ 로컬 상태에 직접 추가 (edit 모드에서는 Store 동기화 안 되므로)
    setInternalRowData((prev) => [...newRows, ...prev]);

    showSuccess(`${selectedRows.length}건의 행이 복사되었습니다.`);
  }, []);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = gridRef.current.getSelectedRows() as GridRowData[];
    if (selectedRows.length === 0) {
      showWarning("삭제할 행을 선택해주세요.");
      return;
    }

    const selectedIds = new Set(selectedRows.map((row) => row.id));

    setInternalRowData((prev) =>
      prev
        .map((item) => {
          if (selectedIds.has(item.id)) {
            // 신규 추가된 행(rowStatus: "C")은 완전히 제거
            if (item.rowStatus === "C") {
              return null;
            }
            // 기존 행은 삭제 상태로 변경
            return { ...item, rowStatus: "D" as const };
          }
          return item;
        })
        .filter((item): item is GridRowData => item !== null)
    );

    gridRef.current?.refreshCells();
    gridRef.current?.deselectAll();
    showSuccess(
      `선택된 ${selectedRows.length}건의 행이 삭제 상태로 표시되었습니다. 저장 시 반영됩니다.`
    );
  }, []);

  // 데이터 변경 추적 함수
  const handleSetRowData = useCallback((data: GridRowData[]) => {
    setInternalRowData(data);
  }, []);

  // ⚡ 저장 버튼 핸들러 최적화: Grid API에서 데이터 수집
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    // ✅ AG-Grid API에서 직접 데이터 수집 (로컬 상태/Store 상태 대신)
    const changedRows: GridRowData[] = [];
    gridRef.current.forEachNode((node) => {
      if (
        node.data &&
        (node.data.rowStatus === "C" ||
          node.data.rowStatus === "U" ||
          node.data.rowStatus === "D")
      ) {
        changedRows.push(node.data);
      }
    });

    if (changedRows.length === 0) {
      showWarning("저장할 변경사항이 없습니다.");
      return;
    }

    // ✅ 저장 시점에 Store 업데이트
    useBcncRegistStore.getState().setShipListData(changedRows);

    // TODO: API 호출
    // await save(changedRows);
    showInfo(
      `저장 기능은 API 연결 후 구현 예정입니다. (변경된 행: ${changedRows.length}건)`
    );
  }, []); // ⚡ 의존성 배열 비움: gridRef는 ref이므로 안정적

  // 컬럼 정의 (useMemo로 최적화)
  const columnDefs: ColDef<
    BcncShipResponse & { id?: string; rowStatus?: "C" | "U" | "D" }
  >[] = useMemo(() => {
    // 편집 가능 여부 결정 함수 (DetailView가 edit 모드이고 삭제된 행이 아닐 때만 편집 가능)
    const getEditable = (params: { data?: GridRowData }) => {
      if (!isEditMode) return false;
      return params.data?.rowStatus !== "D";
    };

    return [
      {
        field: "rowStatus",
        headerName: t("상태"),
        width: 80,
        pinned: "left",
        suppressExport: true, // 엑셀 다운로드에서 제외
        headerClass: "ag-header-cell-center",
        sortable: false,
        filter: false,
        checkboxSelection: false, // 체크박스가 이 컬럼에 들어가지 않도록 명시
        valueGetter: (params) => {
          // rowStatus 필드가 없으면 data에서 가져오기
          return params.data?.rowStatus;
        },
        cellRenderer: StatusTagRenderer,
        cellStyle: (params) => {
          const baseStyle: CellStyle = { textAlign: "center" };
          const rowStatus = params.value || params.data?.rowStatus;
          if (rowStatus === "D") {
            return { ...baseStyle, backgroundColor: "#fff1f0" };
          }
          return baseStyle;
        },
      },
      {
        field: "useYn",
        headerName: t("사용"),
        width: 80,
        editable: getEditable,
        cellEditor: "agCheckboxCellEditor",
        cellRenderer: "agCheckboxCellRenderer",
        valueGetter: (params) => {
          return params.data?.useYn === "Y";
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.useYn = params.newValue ? "Y" : "N";
            return true;
          }
          return false;
        },
        cellStyle: { textAlign: "center" } as CellStyle,
        cellClass: "ag-checkbox-cell-center",
        headerClass: "ag-header-cell-center required-header",
      },
      {
        field: "shipName",
        headerName: t("배송지명"),
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
        headerClass: "required-header",
      },
      {
        field: "primaryChk",
        headerName: "Primary",
        width: 80,
        editable: getEditable,
        cellEditor: "agCheckboxCellEditor",
        cellRenderer: "agCheckboxCellRenderer",
        valueGetter: (params) => {
          return params.data?.primaryChk === "Y";
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.primaryChk = params.newValue ? "Y" : "N";
            return true;
          }
          return false;
        },
        cellStyle: { textAlign: "center" } as CellStyle,
        cellClass: "ag-checkbox-cell-center",
        headerClass: "ag-header-cell-center",
      },
      {
        field: "orgId",
        headerName: t("사업장"),
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        // editable: getEditable,
      },
      {
        field: "salesMan",
        headerName: t("영업사원"),
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellRenderer: SearchIconCellRenderer,
        cellRendererParams: {
          onSearchClick: (node: IRowNode<GridRowData>, field: string) =>
            handleOpenSearch(node, field),
          field: "salesMan",
        },
        valueFormatter: (params) => {
          // salesName이 있으면 "salesMan (salesName)" 형식, 아니면 salesMan
          const { salesMan, salesName } = params.data || {};
          if (salesName) return `${salesMan || ""} (${salesName})`;
          return salesMan || "";
        },
      },
      {
        field: "salesName",
        headerName: t("영업사원명"),
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        // hide: true, // 영업사원 컬럼에 병합 표시하므로 숨김
      },
      {
        field: "country",
        headerName: t("국가코드"),
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center required-header",
        editable: getEditable,
        cellRenderer: SearchIconCellRenderer,
        cellRendererParams: {
          onSearchClick: (node: IRowNode<GridRowData>, field: string) =>
            handleOpenSearch(node, field),
          field: "country",
        },
      },
      {
        field: "nationName",
        headerName: t("국가명"),
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        // hide: true, // 국가코드에 병합 표시 고려 (일단 유지하거나 숨김)
      },
      {
        ...createComboBoxColumn<GridRowData>(
          "currency",
          t("화폐단위"),
          {
            comCodeParams: {
              module: "GL",
              type: "FRNCUR",
              enabledFlag: "Y",
            },
            allOptionLabel: "-선택-",
            labelKey: "code",
            // valueKey: "code",
            editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
          },
          100
        ),
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
      },
      {
        field: "shipAddr",
        headerName: t("주소"),
        width: 300,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
        cellRenderer: SearchIconCellRenderer,
        cellRendererParams: {
          onSearchClick: (node: IRowNode<GridRowData>, field: string) =>
            handleOpenSearch(node, field),
          field: "shipAddr",
        },
        tooltipField: "shipAddr", // 툴팁 추가
      },
      {
        field: "chargeMan",
        headerName: t("담당자"),
        width: 120,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
      {
        field: "phoneNum",
        headerName: t("전화번호"),
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
      {
        field: "chargeNumber",
        headerName: t("담당자번호"),
        width: 120,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
      {
        field: "siteFaxNo",
        headerName: t("팩스번호"),
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
      {
        field: "contractFrom",
        headerName: t("계약일"),
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agDateCellEditor",
        cellEditorParams: {
          format: "yyyy-MM-dd",
        },
        valueGetter: (params) => {
          if (!params.data) return null;
          const value = params.data.contractFrom;
          if (!value) return null;
          // 문자열이면 Date 객체로 변환
          if (typeof value === "string") {
            const date = dayjs(value);
            return date.isValid() ? date.toDate() : null;
          }
          // Date 객체면 그대로 반환
          if (
            value &&
            typeof value === "object" &&
            (value as any) instanceof Date
          ) {
            return value;
          }
          return null;
        },
        valueSetter: (params) => {
          if (!params.data) return false;
          // dayjs.isValid() check instead of instanceof Date
          const newVal = params.newValue;
          if (dayjs(newVal).isValid()) {
            params.data.contractFrom = dayjs(newVal).format("YYYY-MM-DD");
            return true;
          }
          return false;
        },
        valueFormatter: (params: ValueFormatterParams<GridRowData>) => {
          if (!params.value) return "";
          // Date 객체를 yyyy-MM-dd 형식으로 변환
          if (params.value instanceof Date) {
            return dayjs(params.value).format("YYYY-MM-DD");
          }
          // 문자열이면 dayjs로 파싱 후 포맷팅
          const date = dayjs(params.value);
          return date.isValid()
            ? date.format("YYYY-MM-DD")
            : String(params.value);
        },
      },
      {
        field: "contractTo",
        headerName: t("계약만료일"),
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agDateCellEditor",
        cellEditorParams: {
          format: "yyyy-MM-dd",
        },
        valueGetter: (params) => {
          if (!params.data) return null;
          const value = params.data.contractTo;
          if (!value) return null;
          // 문자열이면 Date 객체로 변환
          if (typeof value === "string") {
            const date = dayjs(value);
            return date.isValid() ? date.toDate() : null;
          }
          // Date 객체면 그대로 반환
          if (
            value &&
            typeof value === "object" &&
            (value as any) instanceof Date
          ) {
            return value;
          }
          return null;
        },
        valueSetter: (params) => {
          if (!params.data) return false;
          // dayjs.isValid() check instead of instanceof Date
          const newVal = params.newValue;
          if (dayjs(newVal).isValid()) {
            params.data.contractTo = dayjs(newVal).format("YYYY-MM-DD");
            return true;
          }
          return false;
        },
        valueFormatter: (params: ValueFormatterParams<GridRowData>) => {
          if (!params.value) return "";
          // Date 객체를 yyyy-MM-dd 형식으로 변환
          if (params.value instanceof Date) {
            return dayjs(params.value).format("YYYY-MM-DD");
          }
          // 문자열이면 dayjs로 파싱 후 포맷팅
          const date = dayjs(params.value);
          return date.isValid()
            ? date.format("YYYY-MM-DD")
            : String(params.value);
        },
      },
      {
        ...createComboBoxColumn<GridRowData>(
          "channel",
          t("채널") + "1",
          {
            comCodeParams: {
              module: "AR",
              type: "CHANEL",
              enabledFlag: "Y",
            },
            allOptionLabel: "-선택-",
            editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
          },
          100
        ),
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center required-header",
        editable: getEditable,
      },
      {
        field: "channel2",
        headerName: t("채널") + "2",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "channel3",
        headerName: t("채널") + "3",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "category1",
        headerName: "Territory1",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "category2",
        headerName: "Territory2",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "category3",
        headerName: "Territory3",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "category4",
        headerName: "Territory4",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: getEditable,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [""],
        },
        valueFormatter: () => "-선택-",
      },
      {
        field: "attribute1",
        headerName: t("비고"),
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
      {
        field: "attribute2",
        headerName: t("메모"),
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: getEditable,
      },
    ];
  }, [t, isEditMode, handleOpenSearch]);

  // 행 선택 여부 상태
  const [hasSelection, setHasSelection] = useState(false);

  return (
    <div className="data-grid-panel">
      <style>{`
        .ag-checkbox-cell-center {
          padding: 0 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .ag-checkbox-cell-center > div {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          height: 100% !important;
        }
        .ag-checkbox-cell-center .ag-checkbox {
          margin: 0 !important;
        }
      `}</style>
      {/* 그리드 */}
      <FormAgGrid<
        BcncShipResponse & { id?: string; rowStatus?: "C" | "U" | "D" }
      >
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height={300}
        excelFileName="거래처등록" // 엑셀 다운로드 파일명
        idField="id"
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
        gridOptions={useMemo(
          () => ({
            defaultColDef: {
              flex: undefined,
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false, // 행 클릭 선택 활성화
            onGridReady: handleGridReady,
            getRowId: (params) => {
              return params.data.id || params.data.shipId;
            },
            onSelectionChanged: (params) => {
              if (params.api) {
                const selectedRows = params.api.getSelectedRows();
                setHasSelection(selectedRows.length > 0);
              }
            },
            onCellValueChanged: (
              params: CellValueChangedEvent<GridRowData>
            ) => {
              if (params.data) {
                const updatedRow = params.data as GridRowData;
                const colId = params.column.getColId();

                // ✅ ComboBox 값 되돌림 방지
                // ComboBox가 값을 설정한 직후 AG-Grid가 빈 값으로 되돌리는 경우
                if (
                  params.oldValue &&
                  params.oldValue !== "" &&
                  params.oldValue !== null &&
                  params.oldValue !== undefined &&
                  (params.newValue === null ||
                    params.newValue === undefined ||
                    params.newValue === "")
                ) {
                  // 값을 즉시 복원
                  params.node.setDataValue(colId, params.oldValue);
                  return;
                }

                // 삭제된 행은 편집 불가
                if (updatedRow.rowStatus === "D") {
                  showError("삭제된 행은 편집할 수 없습니다.");
                  if (gridRef.current) {
                    gridRef.current.refreshCells({ rowNodes: [params.node] });
                  }
                  return;
                }

                // rowStatus 필드 변경은 무한 루프 방지를 위해 무시
                if (colId === "rowStatus") return;

                // ⚡ 성능 최적화: Store 실시간 업데이트 제거
                // AG-Grid 내부 상태만 업데이트하고, Store는 저장 시에만 업데이트
                if (
                  updatedRow.rowStatus !== "C" &&
                  updatedRow.rowStatus !== "U"
                ) {
                  params.node.setDataValue("rowStatus", "U");
                }

                // ❌ Store 업데이트 제거: 매 셀 변경마다 Store를 업데이트하면
                // Store 변경 → 컴포넌트 리렌더링 → 그리드 깜빡임/버벅임 발생
                // 저장 버튼 클릭 시 gridApi에서 데이터를 수집하여 한 번에 처리
              }
            },
            // ✅ 콤보박스 선택 완료를 위해 onCellEditingStopped 활성화 (Store 업데이트는 안 함)
            onCellEditingStopped: handleCellEditingStopped,
          }),
          [handleGridReady, handleCellEditingStopped]
        )}
        toolbarButtons={{
          showDelete: true,
          showCopy: true,
          showAdd: true, // 추가는 선택 여부와 관계없음
          enableDelete: isEditMode && hasSelection, // 수정 모드이고 행이 선택되어야 함
          enableCopy: isEditMode && hasSelection, // 수정 모드이고 행이 선택되어야 함
          enableAdd: isEditMode, // 수정 모드이면 가능
          enableExcelDownload: true,
          // showSave: true,
        }}
        onAddRow={handleAddRow}
        onCopyRow={handleCopyRow}
        onDeleteRow={handleDeleteRow}
        createNewRow={createNewRow}
        setRowData={handleSetRowData}
        onSave={handleSave}
      />
      <Suspense fallback={<div />}>
        <AppPageModal {...modalProps.writerModalProps} />
        <AppPageModal {...modalProps.nationalCodeModalProps} />
        <AppPageModal {...modalProps.addressModalProps} />
      </Suspense>
    </div>
  );
};

// React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(DetailGrid);
