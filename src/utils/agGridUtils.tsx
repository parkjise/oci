/**
 * AG Grid 관련 공통 유틸리티 함수
 *
 * ag-grid-community의 공통 기능들을 제공합니다.
 * - GridApi 관리
 * - 행 추가/삭제
 * - 선택된 행 조작
 * - 셀 포커스 및 편집
 * - 공통 ColumnDef 헬퍼
 * - ValueFormatter 함수들
 * - CellRenderer 함수들
 */
import type {
  GridApi,
  GridReadyEvent,
  ColDef,
  ValueFormatterParams,
} from "ag-grid-community";
import React from "react";
import { Tag, Space } from "antd";
import dayjs from "dayjs";

// ============================================================================
// GridApi 관리
// ============================================================================

/**
 * GridApi를 저장하는 onGridReady 핸들러 생성
 *
 * @param setGridApi - GridApi를 저장할 setState 함수
 * @returns onGridReady 핸들러 함수
 *
 * @example
 * ```tsx
 * const [gridApi, setGridApi] = useState<GridApi | null>(null);
 * const onGridReady = createGridReadyHandler(setGridApi);
 *
 * <FormAgGrid onGridReady={onGridReady} ... />
 * ```
 */
export const createGridReadyHandler = <TData = unknown,>(
  setGridApi: (api: GridApi<TData> | null) => void
) => {
  return (params: GridReadyEvent<TData>) => {
    setGridApi(params.api);
  };
};

/**
 * GridApi를 ref에 저장하는 onGridReady 핸들러 생성
 *
 * @param gridApiRef - GridApi를 저장할 ref
 * @returns onGridReady 핸들러 함수
 *
 * @example
 * ```tsx
 * const gridApiRef = useRef<GridApi | null>(null);
 * const onGridReady = createGridReadyHandlerRef(gridApiRef);
 *
 * <FormAgGrid onGridReady={onGridReady} ... />
 * ```
 */
export const createGridReadyHandlerRef = <TData = unknown,>(
  gridApiRef: React.MutableRefObject<GridApi<TData> | null>
) => {
  return (params: GridReadyEvent<TData>) => {
    gridApiRef.current = params.api;
  };
};

// ============================================================================
// 행 추가/삭제
// ============================================================================

/**
 * 새 행 추가 (ID 자동 생성)
 *
 * @param currentData - 현재 그리드 데이터
 * @param createNewRow - 새 행을 생성하는 함수
 * @param setData - 데이터를 업데이트하는 함수
 * @param gridApi - GridApi (선택사항, 포커스 이동 시 사용)
 * @param focusField - 포커스를 이동할 필드명 (선택사항)
 * @param insertAtTop - true면 첫 줄에 추가, false면 마지막 줄에 추가 (기본값: false)
 *
 * @example
 * ```tsx
 * const handleAddRow = () => {
 *   addNewRow(
 *     gridData,
 *     (newId) => ({ id: newId, name: "", amount: 0 }),
 *     setGridData,
 *     gridApi,
 *     "name",
 *     true  // 첫 줄에 추가
 *   );
 * };
 * ```
 */
export const addNewRow = <TData extends { id: number | string }>(
  currentData: TData[],
  createNewRow: (newId: number | string) => TData,
  setData: (data: TData[]) => void,
  gridApi?: GridApi<TData> | null,
  focusField?: string,
  insertAtTop: boolean = false
): void => {
  // 새 ID 생성
  const newId =
    currentData.length > 0
      ? Math.max(
          ...currentData.map((row) =>
            typeof row.id === "number" ? row.id : parseInt(String(row.id)) || 0
          )
        ) + 1
      : 1;

  // 새 행 생성 및 추가
  const newRow = createNewRow(newId);
  const newData = insertAtTop
    ? [newRow, ...currentData]
    : [...currentData, newRow];
  setData(newData);

  // 포커스 이동 (선택사항)
  if (gridApi && focusField) {
    setTimeout(() => {
      const rowIndex = insertAtTop ? 0 : newData.length - 1;
      focusAndEditCell(gridApi, rowIndex, focusField);
    }, 100);
  }
};

/**
 * 선택된 행 삭제
 *
 * @param gridApi - GridApi
 * @param currentData - 현재 그리드 데이터
 * @param setData - 데이터를 업데이트하는 함수
 * @param getId - 행에서 ID를 추출하는 함수 (기본값: (row) => row.id)
 * @param onNoSelection - 선택된 행이 없을 때 호출할 함수 (선택사항)
 * @throws {Error} getId 함수에서 id가 없거나 잘못된 경우
 *
 * @example
 * ```tsx
 * const handleDeleteRows = () => {
 *   deleteSelectedRows(
 *     gridApi,
 *     gridData,
 *     setGridData,
 *     (row) => row.id,
 *     () => showError("삭제할 행을 선택해주세요.")
 *   );
 * };
 * ```
 */
export const deleteSelectedRows = <TData extends { id?: number | string }>(
  gridApi: GridApi<TData> | null,
  currentData: TData[],
  setData: (data: TData[]) => void,
  getId: (row: TData) => number | string = (row: TData) => {
    const id = row.id;
    if (id === undefined || id === null || id === "") {
      throw new Error("Row ID is required for delete operation");
    }
    return id;
  },
  onNoSelection?: () => void
): void => {
  const selectedRows = getSelectedRows(gridApi, onNoSelection);
  if (!selectedRows) return;

  const selectedIds = selectedRows.map(getId);
  const newData = currentData.filter(
    (row) => !selectedIds.includes(getId(row))
  );
  setData(newData);
  gridApi?.deselectAll();
};

// ============================================================================
// 선택된 행 조작
// ============================================================================

/**
 * 선택된 행 가져오기
 *
 * @param gridApi - GridApi
 * @param onNoSelection - 선택된 행이 없을 때 호출할 함수 (선택사항)
 * @returns 선택된 행 배열 또는 null
 */
export const getSelectedRows = <TData,>(
  gridApi: GridApi<TData> | null,
  onNoSelection?: () => void
): TData[] | null => {
  if (!gridApi) {
    onNoSelection?.();
    return null;
  }

  const selectedRows = gridApi.getSelectedRows();
  if (selectedRows.length === 0) {
    onNoSelection?.();
    return null;
  }

  return selectedRows;
};

/**
 * 모든 선택 해제
 *
 * @param gridApi - GridApi
 */
export const deselectAll = <TData,>(gridApi: GridApi<TData> | null): void => {
  gridApi?.deselectAll();
};

// ============================================================================
// 셀 포커스 및 편집
// ============================================================================

/**
 * 셀에 포커스 이동 및 편집 시작
 *
 * @param gridApi - GridApi
 * @param rowIndex - 행 인덱스
 * @param colKey - 컬럼 키
 */
export const focusAndEditCell = <TData,>(
  gridApi: GridApi<TData> | null,
  rowIndex: number,
  colKey: string
): void => {
  if (!gridApi) return;

  gridApi.setFocusedCell(rowIndex, colKey);
  gridApi.startEditingCell({ rowIndex, colKey });
};

// ============================================================================
// 공통 ColumnDef 헬퍼
// ============================================================================

/**
 * 체크박스 선택 컬럼 생성
 */
export const createCheckboxColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number,
  pinned?: "left" | "right",
  headerCheckboxSelection: boolean = true
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  pinned,
  checkboxSelection: true,
  headerCheckboxSelection,
  editable: false,
});

/**
 * 텍스트 편집 가능한 컬럼 생성
 */
export const createTextColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number,
  flex?: number
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  flex,
  editable: true,
  cellEditor: "agTextCellEditor",
});

/**
 * 숫자 편집 가능한 컬럼 생성
 */
export const createNumberColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number,
  min?: number,
  max?: number,
  valueFormatter?: (params: ValueFormatterParams) => string
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  editable: true,
  cellEditor: "agNumberCellEditor",
  cellEditorParams: { min, max },
  valueFormatter,
  type: "numericColumn",
});

/**
 * 셀렉트 편집 가능한 컬럼 생성
 */
export const createSelectColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  values: string[],
  width?: number
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  editable: true,
  cellEditor: "agSelectCellEditor",
  cellEditorParams: { values },
  filter: "agSetColumnFilter",
});

/**
 * 날짜 포맷터 (YYYY-MM-DD)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 날짜 문자열 (YYYY-MM-DD) 또는 빈 문자열
 *
 * @example
 * ```tsx
 * const columnDef = {
 *   field: "date",
 *   valueFormatter: formatDate,
 * };
 * ```
 */
export const formatDate = (params: ValueFormatterParams): string => {
  if (!params.value) return "";

  if (params.value instanceof Date) {
    return dayjs(params.value).format("YYYY-MM-DD");
  }

  if (typeof params.value === "string") {
    return dayjs(params.value).format("YYYY-MM-DD");
  }

  return "";
};

/**
 * 날짜 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param width - 컬럼 너비 (선택사항)
 * @param min - 최소 날짜 (선택사항)
 * @param max - 최대 날짜 (선택사항)
 * @param valueFormatter - 커스텀 포맷터 (선택사항, 기본값: formatDate)
 * @returns ColDef<TData>
 */
export const createDateColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number,
  min?: Date,
  max?: Date,
  valueFormatter?: (params: ValueFormatterParams) => string
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  editable: true,
  cellEditor: "agDateCellEditor",
  cellEditorParams: { min, max },
  valueFormatter: valueFormatter || formatDate,
  filter: "agDateColumnFilter",
});

/**
 * 긴 텍스트 편집 가능한 컬럼 생성
 */
export const createTextAreaColumn = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number,
  maxLength?: number
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  editable: true,
  cellEditor: "agLargeTextCellEditor",
  cellEditorParams: { maxLength },
});

/**
 * 체크박스 편집 가능한 컬럼 생성
 */
export const createCheckboxColumnEditable = <TData = unknown,>(
  field: string,
  headerName: string,
  width?: number
): ColDef<TData> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: field as any,
  headerName,
  width,
  editable: true,
  cellEditor: "agCheckboxCellEditor",
  cellRenderer: "agCheckboxCellRenderer",
});

// ============================================================================
// ValueFormatter 함수들
// ============================================================================

/**
 * 통화 포맷터 (원화)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 통화 문자열 (₩1,000) 또는 빈 문자열
 */
export const formatCurrency = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return `₩${params.value.toLocaleString()}`;
  }
  return "";
};

/**
 * 통화 포맷터 (원)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 통화 문자열 (1,000원) 또는 빈 문자열
 */
export const formatCurrencyWon = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return `${params.value.toLocaleString()}원`;
  }
  return "";
};

/**
 * 날짜 포맷터 (한국어 형식)
 */
export const formatDateKorean = (params: ValueFormatterParams): string => {
  if (!params.value) return "";

  if (params.value instanceof Date) {
    return params.value.toLocaleDateString("ko-KR");
  }

  if (typeof params.value === "string") {
    return dayjs(params.value).format("YYYY. M. D.");
  }

  return "";
};

/**
 * 숫자 포맷터 (천 단위 구분)
 */
export const formatNumber = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return params.value.toLocaleString();
  }
  return "";
};

// ============================================================================
// CellRenderer 함수들
// ============================================================================

/**
 * 태그 렌더러 (Ant Design Tag)
 */
export const createTagRenderer =
  (color?: string) => (params: { value: string }) => {
    if (!params.value) return "-";
    return (
      <Tag color={color} style={{ margin: 0 }}>
        {params.value}
      </Tag>
    );
  };

/**
 * 링크 렌더러 (클릭 가능한 텍스트)
 */
export const createLinkRenderer =
  <TData = unknown,>(onClick: (data: TData) => void) =>
  (params: { value: string; data: TData }) => {
    return (
      <span
        style={{
          color: "#1890ff",
          cursor: "pointer",
          textDecoration: "underline",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(params.data);
        }}
      >
        {params.value}
      </span>
    );
  };

/**
 * 태그 배열 렌더러 (여러 태그 표시)
 */
export const createTagArrayRenderer =
  (color: string = "blue") =>
  (params: { value: string[] }) => {
    if (!params.value || params.value.length === 0) return "-";
    return (
      <Space size="small" wrap>
        {params.value.map((item: string, index: number) => (
          <Tag key={index} color={color}>
            {item}
          </Tag>
        ))}
      </Space>
    );
  };

/**
 * 상태 렌더러 (활성/비활성 등)
 */
export const createStatusRenderer =
  (
    activeColor: string = "green",
    inactiveColor: string = "red",
    activeValue: string = "활성"
  ) =>
  (params: { value: string }) => {
    const color = params.value === activeValue ? activeColor : inactiveColor;
    return (
      <Tag color={color} style={{ margin: 0 }}>
        {params.value}
      </Tag>
    );
  };
