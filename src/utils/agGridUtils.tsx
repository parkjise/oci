/**
 * AG Grid 관련 공통 유틸리티 함수
 *
 * ag-grid-community의 공통 기능들을 제공합니다.
 * - GridApi 관리
 * - 행 추가/삭제
 * - 선택된 행 조작
 * - 셀 포커스 및 편집
 *
 * 컬럼 생성 함수, Formatter, Renderer는 @components/ui/form/AgGrid/columns에서 제공됩니다.
 *
 * @see {@link @components/ui/form/AgGrid/columns} 컬럼 관련 함수들
 */
import React from "react";
import type { GridApi, GridReadyEvent } from "ag-grid-community";

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
// 컬럼 관련 함수들 (deprecated - columns 디렉토리로 이동됨)
// ============================================================================

/**
 * @deprecated 모든 컬럼 생성 함수, Formatter, Renderer는
 * {@link @components/ui/form/AgGrid/columns}에서 제공됩니다.
 *
 * 하위 호환성을 위해 re-export합니다.
 *
 * @example
 * ```typescript
 * // 권장 방식
 * import {
 *   createTextColumn,
 *   formatNumber,
 * } from "@components/ui/form/AgGrid/columns";
 *
 * // 기존 방식 (여전히 동작하지만 deprecated)
 * import { createTextColumn, formatNumber } from "@utils/agGridUtils";
 * ```
 */
export {
  // 컬럼 생성 함수들
  createCheckboxColumn,
  createTextColumn,
  createNumberColumn,
  createDateColumn,
  createTextAreaColumn,
  createCheckboxColumnEditable,
  createComboBoxColumn,
  createSearchColumn,
  // Formatter 함수들
  formatDate,
  formatCurrency,
  formatCurrencyWon,
  formatDateKorean,
  formatNumber,
  // Renderer 함수들
  createTagRenderer,
  createLinkRenderer,
  createTagArrayRenderer,
  createStatusRenderer,
} from "@components/ui/form/AgGrid/columns";
