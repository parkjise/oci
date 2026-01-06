// AG-Grid 관련
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useTranslation } from "react-i18next";
import { LicenseManager } from "ag-grid-enterprise";
import {
  type ColDef,
  type GridOptions,
  type GridApi,
  type GridReadyEvent,
  type CellClickedEvent,
  type RowStyle,
  type RowClassParams,
  type SelectionChangedEvent,
  type IRowNode,
  type EditableCallbackParams,
  type CellEditingStoppedEvent,
  ModuleRegistry,
  AllCommunityModule,
  type ValueFormatterParams,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

// React
import React, { useState, useEffect, useRef } from "react";

// Ant Design
import { Upload, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";

// 유틸리티
import * as XLSX from "xlsx";
import clsx from "clsx";

// 내부 모듈
import { getSelectedRows } from "@utils/agGridUtils";
import { parseExcelFile } from "@utils/excelUtils";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import { FormButton } from "@components/ui/form";
import {
  StyledAgGridContainer,
  StyledGridToolbar,
  type AgGridStyleOptions,
} from "./FormAgGrid.styles";
import { FormAgGridLayoutStyles } from "./FormAgGridLayout.style";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
LicenseManager.setLicenseKey(import.meta.env.VITE_AGGRID_LICENSEMANAGER);

/** FormAgGrid 확장 ColDef 타입 */
export interface ExtendedColDef<TData> extends ColDef<TData> {
  /** 엑셀 다운로드에서 제외할지 여부 */
  excludeFromExcel?: boolean;
  /** 헤더 정렬: "left" | "center" | "right" (기본값: "center") */
  headerAlign?: "left" | "center" | "right";
  /** 바디 값 정렬: "left" | "center" | "right" (기본값: "center") */
  bodyAlign?: "left" | "center" | "right";
}

/**
 * FormAgGrid 컴포넌트 Props
 */
interface FormAgGridProps<TData> extends AgGridReactProps {
  /** 그리드 데이터 */
  rowData: TData[];
  /** 컬럼 정의 */
  columnDefs: ExtendedColDef<TData>[];
  /** 그리드 높이 */
  height?: number | string;
  /** 그리드 너비 */
  width?: number | string;
  /** AG-Grid 옵션 */
  gridOptions?: GridOptions;
  /** 추가 클래스명 */
  className?: string;
  /** 스타일 옵션 */
  styleOptions?: AgGridStyleOptions;
  /** 헤더 텍스트 정렬 (간편 설정) */
  headerTextAlign?: "left" | "center" | "right";
  /** 툴바 표시 여부 */
  showToolbar?: boolean;
  /** 행 추가 핸들러 */
  onAddRow?: (gridApi: GridApi<TData> | null) => void;
  /** 행 복사 핸들러 */
  onCopyRow?: (gridApi: GridApi<TData> | null) => void;
  /** 행 삭제 핸들러 */
  onDeleteRow?: (gridApi: GridApi<TData> | null) => void;
  /** 엑셀 다운로드 핸들러 */
  onExcelDownload?: (gridApi: GridApi<TData> | null) => void;
  /** 엑셀 업로드 핸들러 */
  onExcelUpload?: (file: File, gridApi: GridApi<TData> | null) => void;
  /** 그리드 리프레시 핸들러 */
  onRefresh?: (gridApi: GridApi<TData> | null) => void;
  /** 저장 핸들러 */
  onSave?: (gridApi: GridApi<TData> | null) => void;
  /** 원본 데이터 (리프레시 시 복원용) */
  originalRowData?: TData[];
  /** 새 행 생성 함수 */
  createNewRow?: (newId: number | string) => TData;
  /** 데이터 업데이트 함수 */
  setRowData?: (data: TData[]) => void;
  /** ID 필드명 (기본값: "id") */
  idField?: keyof TData;
  /** 엑셀 다운로드 파일명 (기본값: "grid_data_타임스탬프.xlsx") */
  excelFileName?: string | (() => string);
  /** 엑셀 다운로드에서 제외할 필드명 배열 */
  excludeFieldsFromExcel?: (keyof TData)[];
  /** 필터 기능 활성화 여부 (기본값: true) */
  enableFilter?: boolean;
  /** 커스텀 버튼들 (툴바 왼쪽에 표시) */
  customButtons?: React.ReactNode[];
  /** 커스텀 버튼 앞에 구분선 표시 여부 (기본값: true) */
  showCustomButtonsDivider?: boolean;
  /** 커스텀 버튼을 모두 표시할지 여부 (기본값: false - 2개까지 표시, 나머지는 드롭다운) */
  showAllCustomButtons?: boolean;
  /** 기본적으로 표시할 커스텀 버튼 개수 (기본값: 2) */
  maxVisibleCustomButtons?: number;
  /** 툴바 버튼 표시/활성화 옵션 */
  toolbarButtons?: {
    /** 행 추가 버튼 표시 여부 (기본값: true) */
    showAdd?: boolean;
    /** 행 복사 버튼 표시 여부 (기본값: true) */
    showCopy?: boolean;
    /** 행 삭제 버튼 표시 여부 (기본값: true) */
    showDelete?: boolean;
    /** 엑셀 다운로드 버튼 표시 여부 (기본값: true) */
    showExcelDownload?: boolean;
    /** 엑셀 업로드 버튼 표시 여부 (기본값: true) */
    showExcelUpload?: boolean;
    /** 그리드 새로고침 버튼 표시 여부 (기본값: false) */
    showRefresh?: boolean;
    /** 저장 버튼 표시 여부 (기본값: false) */
    showSave?: boolean;
    /** 행 추가 버튼 활성화 여부 (기본값: true) */
    enableAdd?: boolean;
    /** 행 복사 버튼 활성화 여부 (기본값: true) */
    enableCopy?: boolean;
    /** 행 삭제 버튼 활성화 여부 (기본값: true) */
    enableDelete?: boolean;
    /** 엑셀 다운로드 버튼 활성화 여부 (기본값: true) */
    enableExcelDownload?: boolean;
    /** 엑셀 업로드 버튼 활성화 여부 (기본값: true) */
    enableExcelUpload?: boolean;
    /** 그리드 새로고침 버튼 활성화 여부 (기본값: true) */
    enableRefresh?: boolean;
  };
}

const FormAgGrid = <TData extends { id?: number | string }>(
  props: FormAgGridProps<TData>
) => {
  const {
    rowData,
    columnDefs,
    height = "100%",
    width = "100%",
    gridOptions,
    className,
    styleOptions,
    headerTextAlign,
    showToolbar = false,
    onAddRow,
    onCopyRow,
    onDeleteRow,
    onExcelDownload,
    onExcelUpload,
    onRefresh,
    onSave,
    originalRowData,
    createNewRow,
    setRowData,
    idField = "id" as keyof TData,
    toolbarButtons,
    customButtons,
    showCustomButtonsDivider = true,
    showAllCustomButtons = false,
    maxVisibleCustomButtons = 2,
    onGridReady,
    ...rest
  } = props;
  const { t } = useTranslation();
  const mergedStyleOptions: AgGridStyleOptions = {
    ...styleOptions,
    headerTextAlign: headerTextAlign || styleOptions?.headerTextAlign,
  };

  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [clickedRowId, setClickedRowId] = useState<number | string | null>(
    null
  );
  const clickedRowIdRef = useRef<number | string | null>(null);
  const shouldRestoreEditingRef = useRef<{
    rowIndex: number;
    colId: string;
  } | null>(null);
  const initialRowDataRef = useRef<TData[]>([]);
  const gridApiRef = useRef<GridApi<TData> | null>(null);
  const hasInitialDataRef = useRef(false);

  useEffect(() => {
    if (rowData.length > 0 && !hasInitialDataRef.current) {
      initialRowDataRef.current = JSON.parse(JSON.stringify(rowData));
      hasInitialDataRef.current = true;
    }
  }, [rowData]);

  useEffect(() => {
    clickedRowIdRef.current = clickedRowId;
  }, [clickedRowId]);

  useEffect(() => {
    gridApiRef.current = gridApi;
  }, [gridApi]);

  const buttonOptions = {
    showAdd: toolbarButtons?.showAdd ?? true,
    showCopy: toolbarButtons?.showCopy ?? true,
    showDelete: toolbarButtons?.showDelete ?? true,
    showExcelDownload: toolbarButtons?.showExcelDownload ?? true,
    showExcelUpload: toolbarButtons?.showExcelUpload ?? true,
    showRefresh: toolbarButtons?.showRefresh ?? false,
    showSave: toolbarButtons?.showSave ?? false,
    enableAdd: toolbarButtons?.enableAdd ?? true,
    enableCopy: toolbarButtons?.enableCopy ?? true,
    enableDelete: toolbarButtons?.enableDelete ?? true,
    enableExcelDownload: toolbarButtons?.enableExcelDownload ?? true,
    enableExcelUpload: toolbarButtons?.enableExcelUpload ?? true,
    enableRefresh: toolbarButtons?.enableRefresh ?? true,
  };

  const defaultGridOptions: GridOptions = {
    defaultColDef: {
      ...(gridOptions?.defaultColDef || {}),
      sortable: gridOptions?.defaultColDef?.sortable ?? true,
      resizable: gridOptions?.defaultColDef?.resizable ?? true,
      flex: gridOptions?.defaultColDef?.flex ?? 1,
      minWidth: gridOptions?.defaultColDef?.minWidth ?? 100,
      filter: props.enableFilter ?? true,
    },
    rowSelection: "single",
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
    animateRows: true,
    headerHeight: 31,
    rowHeight: 31,
  };

  const isSameId = (
    id1: number | string | null | undefined,
    id2: number | string | null | undefined
  ): boolean => {
    if (id1 === id2) return true;
    if (id1 === null || id1 === undefined || id2 === null || id2 === undefined)
      return false;
    return String(id1) === String(id2) || Number(id1) === Number(id2);
  };

  const isClickedRow = (rowId: number | string | null | undefined): boolean => {
    const currentClickedRowId = clickedRowIdRef.current;
    return isSameId(rowId, currentClickedRowId);
  };

  const processEditable = (
    col: ExtendedColDef<TData>,
    disableFilter: boolean
  ): ExtendedColDef<TData> => {
    const originalEditable = col.editable;

    if (typeof originalEditable === "function") {
      return {
        ...col,
        ...(disableFilter && { filter: false }),
        editable: (params: EditableCallbackParams<TData>) => {
          const originalResult = originalEditable(params);
          if (originalResult === false) return false;

          const rowId = (params.data as TData | undefined)?.id;
          return isClickedRow(rowId) ? true : originalResult;
        },
      };
    }

    return disableFilter ? { ...col, filter: false } : col;
  };

  const applyColumnAlignment = (
    col: ExtendedColDef<TData>
  ): ExtendedColDef<TData> => {
    const result = { ...col };

    // 헤더 정렬 적용
    const headerAlign = col.headerAlign || "center";
    if (headerAlign !== "center") {
      const newClass = `ag-header-cell-${headerAlign}`;
      result.headerClass = col.headerClass
        ? `${col.headerClass} ${newClass}`
        : newClass;
    }

    // 바디 값 정렬 적용
    const bodyAlign = col.bodyAlign || "center";
    if (bodyAlign) {
      const textAlignStyle = {
        textAlign: bodyAlign as "left" | "center" | "right",
      };
      result.cellStyle = col.cellStyle
        ? { ...col.cellStyle, ...textAlignStyle }
        : textAlignStyle;
    }

    return result;
  };

  const processedColumnDefs = columnDefs.map((col) => {
    const processed = processEditable(col, props.enableFilter === false);
    return applyColumnAlignment(processed as ExtendedColDef<TData>);
  });

  const handleGridReady = (params: GridReadyEvent<TData>) => {
    setGridApi(params.api);
    onGridReady?.(params);
  };

  const handleCellEditingStopped = (params: CellEditingStoppedEvent<TData>) => {
    const restoreInfo = shouldRestoreEditingRef.current;
    if (
      restoreInfo &&
      params.rowIndex === restoreInfo.rowIndex &&
      params.column?.getColId() === restoreInfo.colId &&
      gridApi
    ) {
      requestAnimationFrame(() => {
        if (gridApi && restoreInfo) {
          const node = gridApi.getDisplayedRowAtIndex(restoreInfo.rowIndex);
          if (node) {
            gridApi.startEditingCell({
              rowIndex: restoreInfo.rowIndex,
              colKey: restoreInfo.colId,
            });
          }
          shouldRestoreEditingRef.current = null;
        }
      });
    }

    gridOptions?.onCellEditingStopped?.(params);
  };

  const handleCellClicked = (params: CellClickedEvent<TData>) => {
    if (!gridApi) {
      gridOptions?.onCellClicked?.(params);
      return;
    }

    const clickedColumnId = params.column?.getColId();
    const clickedRowIndex = params.node.rowIndex;
    const editingCells = gridApi.getEditingCells();

    const isEditingClickedCell = editingCells.some(
      (cell) =>
        cell.rowIndex === clickedRowIndex &&
        cell.column?.getColId() === clickedColumnId
    );

    if (isEditingClickedCell && clickedColumnId && clickedRowIndex !== null) {
      shouldRestoreEditingRef.current = {
        rowIndex: clickedRowIndex,
        colId: clickedColumnId,
      };
      gridOptions?.onCellClicked?.(params);
      return;
    }

    const clickedId = params.data?.id;
    const isCheckboxColumn =
      clickedColumnId === "ag-Grid-AutoColumn" ||
      params.column?.getColDef().checkboxSelection === true;

    const isEditingRow = editingCells.some(
      (cell) => cell.rowIndex === clickedRowIndex
    );

    if (isEditingRow) {
      if (clickedId !== undefined && clickedId !== null) {
        const newClickedId = isSameId(clickedId, clickedRowId)
          ? null
          : clickedId;
        clickedRowIdRef.current = newClickedId;
        setClickedRowId(newClickedId);
      }
      gridOptions?.onCellClicked?.(params);
      return;
    }

    // clickedRowId 업데이트
    if (clickedId !== undefined && clickedId !== null) {
      const newClickedId = isSameId(clickedId, clickedRowId) ? null : clickedId;
      clickedRowIdRef.current = newClickedId;
      setClickedRowId(newClickedId);
    } else {
      clickedRowIdRef.current = null;
      setClickedRowId(null);
    }

    if (
      !gridOptions?.suppressRowClickSelection &&
      !isCheckboxColumn &&
      !params.node.isSelected()
    ) {
      requestAnimationFrame(() => {
        if (gridApi) {
          gridApi.setNodesSelected({
            nodes: [params.node],
            newValue: true,
          });
        }
      });
    }

    gridOptions?.onCellClicked?.(params);
  };

  const handleSelectionChanged = (params: SelectionChangedEvent<TData>) => {
    if (!gridApi) {
      gridOptions?.onSelectionChanged?.(params);
      return;
    }

    const selectedNodes = gridApi.getSelectedNodes();

    if (selectedNodes.length > 0) {
      const selectedNode = selectedNodes[0];
      const selectedId = (selectedNode.data as TData)?.id;
      if (selectedId !== undefined && selectedId !== null) {
        clickedRowIdRef.current = selectedId;
        setClickedRowId(selectedId);
      }
    } else {
      clickedRowIdRef.current = null;
      setClickedRowId(null);
    }

    gridOptions?.onSelectionChanged?.(params);
  };

  const generateNewId = (): number => {
    if (rowData.length === 0) return 1;
    const maxId = Math.max(
      ...rowData.map((row) => {
        const id = row[idField];
        return typeof id === "number" ? id : parseInt(String(id)) || 0;
      })
    );
    return maxId + 1;
  };

  const focusFirstRow = () => {
    if (!gridApi) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gridApi.paginationGoToPage(0);
        const firstNode = gridApi.getDisplayedRowAtIndex(0);
        if (firstNode) {
          firstNode.setSelected(true);
          gridApi.ensureNodeVisible(firstNode, "top");
        }
      });
    });
  };

  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow(gridApi);
    } else if (createNewRow && setRowData) {
      const newId = generateNewId();
      const newRow = createNewRow(newId);
      gridApi?.deselectAll();
      setRowData([newRow, ...rowData]);
      focusFirstRow();
    }
  };

  const handleCopyRow = () => {
    if (onCopyRow) {
      onCopyRow(gridApi);
      return;
    }

    const selectedRows = getSelectedRows<TData>(gridApi, () => {
      showError("복사할 행을 선택해주세요.");
    });
    if (!selectedRows || selectedRows.length === 0) return;

    if (!setRowData) {
      showError("행 복사 기능을 사용하려면 setRowData prop이 필요합니다.");
      return;
    }

    const rowToCopy = selectedRows[0];
    const newId = generateNewId();

    const copiedRow: TData = createNewRow
      ? (() => {
          const newRow = createNewRow(newId);
          Object.keys(rowToCopy).forEach((key) => {
            if (key !== String(idField)) {
              (newRow as Record<string, unknown>)[key] = (
                rowToCopy as Record<string, unknown>
              )[key];
            }
          });
          return newRow;
        })()
      : ({ ...rowToCopy, [idField]: newId } as TData);

    gridApi?.deselectAll();
    setRowData([copiedRow, ...rowData]);
    showSuccess("행이 복사되었습니다.");
    focusFirstRow();
  };

  const handleDeleteRow = () => {
    if (onDeleteRow) {
      onDeleteRow(gridApi);
    } else {
      const selectedRows = getSelectedRows<TData>(gridApi, () => {
        showError("삭제할 행을 선택해주세요.");
      });
      if (!selectedRows || selectedRows.length === 0) return;

      if (!setRowData) return;

      const selectedIds = new Set(selectedRows.map((row) => row[idField]));

      // 신규 추가된 행은 완전히 제거, 기존 행은 삭제 상태로 변경
      const newData = rowData
        .map((row) => {
          if (!selectedIds.has(row[idField])) return row;

          const rowWithStatus = row as TData & { rowStatus?: "C" | "U" | "D" };
          // 신규 추가된 행은 완전히 제거 (null 반환 후 필터링)
          if (rowWithStatus.rowStatus === "C") {
            return null;
          }
          // 기존 행은 삭제 상태로 변경 (행 제거하지 않음)
          return { ...row, rowStatus: "D" as const } as TData;
        })
        .filter((row): row is TData => row !== null);

      // deselectAll을 먼저 호출하여 선택 상태를 먼저 업데이트
      gridApi?.deselectAll();

      // 데이터 업데이트 (한 번에 상태 업데이트)
      setRowData(newData);

      showSuccess("선택된 행이 삭제되었습니다.");
    }
  };

  const handleExcelDownload = () => {
    if (onExcelDownload) {
      onExcelDownload(gridApi);
    } else {
      try {
        if (rowData.length === 0) {
          showError("다운로드할 데이터가 없습니다.");
          return;
        }

        const excludeFieldsFromProps = props.excludeFieldsFromExcel || [];
        const excludeFieldsFromColDefs = columnDefs
          .filter((col) => col.excludeFromExcel === true && col.field)
          .map((col) => String(col.field));

        const excludeFields = [
          ...excludeFieldsFromProps.map((field) => String(field)),
          ...excludeFieldsFromColDefs,
        ];
        const excludeFieldSet = new Set(excludeFields);

        const excelData = rowData.map((row) => {
          const obj: Record<string, unknown> = {};
          columnDefs.forEach((col) => {
            if (col.field && !excludeFieldSet.has(col.field)) {
              const originalValue = (row as Record<string, unknown>)[col.field];
              let finalValue = originalValue;

              // useValueFormatterForExport가 true이고 valueFormatter가 함수인 경우
              if (
                col.useValueFormatterForExport === true &&
                typeof col.valueFormatter === "function"
              ) {
                // AG-Grid의 valueFormatter 파라미터 형식을 흉내내서 호출합니다.
                finalValue = col.valueFormatter({
                  value: originalValue,
                  data: row,
                } as ValueFormatterParams<typeof row>);
              }
              obj[col.headerName || col.field] = finalValue;
            }
          });
          return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        let fileName: string;
        if (typeof props.excelFileName === "function") {
          fileName = props.excelFileName();
        } else if (props.excelFileName) {
          fileName = `${props.excelFileName}_${new Date().getTime()}.xlsx`;
        } else {
          fileName = `grid_data_${new Date().getTime()}.xlsx`;
        }

        if (!fileName.endsWith(".xlsx")) {
          fileName += ".xlsx";
        }

        XLSX.writeFile(workbook, fileName);
        showSuccess("엑셀 파일이 다운로드되었습니다.");
      } catch (error) {
        showError("엑셀 다운로드 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("Excel download error:", error);
        }
      }
    }
  };

  const handleExcelUpload = async (file: File) => {
    if (onExcelUpload) {
      onExcelUpload(file, gridApi);
    } else if (setRowData) {
      try {
        const columnMapping: Record<string, string> = {};
        columnDefs.forEach((col) => {
          if (col.field) {
            const excelHeader = col.headerName || col.field;
            columnMapping[col.field] = String(excelHeader);
          }
        });

        const uploadedData = await parseExcelFile<TData>(file, {
          hasHeader: true,
          columnMapping:
            Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
        });

        const dataWithIds = uploadedData.map((row, index) => {
          const newId = generateNewId() + index;
          return {
            ...row,
            [idField]: newId,
            rowStatus: "C" as const,
          } as TData;
        });

        setRowData([...dataWithIds, ...rowData]);
        showSuccess(`${uploadedData.length}건의 데이터가 업로드되었습니다.`);
        gridApi?.refreshCells();
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "엑셀 업로드 중 오류가 발생했습니다."
        );
        if (import.meta.env.DEV) {
          console.error("Excel upload error:", error);
        }
      }
    }
    return false;
  };

  const restoreGridDataWithTransaction = (restoreData: TData[]) => {
    if (!gridApi) return;

    const currentRowNodes: IRowNode<TData>[] = [];
    gridApi.forEachNode((node) => {
      currentRowNodes.push(node);
    });

    gridApi.applyTransaction({
      remove: currentRowNodes
        .map((node) => node.data)
        .filter(Boolean) as TData[],
      add: restoreData,
      addIndex: 0,
    });
    gridApi.deselectAll();
    gridApi.refreshCells();
  };

  const restoreGridData = (restoreData: TData[]) => {
    if (!gridApi) return;

    if (setRowData) {
      setRowData(restoreData);
      gridApi.deselectAll();
      gridApi.refreshCells();
    } else {
      restoreGridDataWithTransaction(restoreData);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(gridApi);
      return;
    }

    if (!gridApi) return;

    const restoreData = (data: TData[]) => {
      return data
        .map((row) => {
          const rowWithStatus = row as TData & { rowStatus?: "C" | "U" | "D" };
          if (rowWithStatus.rowStatus === "C") {
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { rowStatus, ...rest } = rowWithStatus;
          return rest as TData;
        })
        .filter((row): row is TData => row !== null);
    };

    if (originalRowData && setRowData) {
      const restoredData = restoreData([...originalRowData]);
      setRowData(restoredData);
      gridApi.deselectAll();
      gridApi.refreshCells();
      showSuccess("모든 변경사항이 취소되었습니다.");
      return;
    }

    if (originalRowData) {
      const restoredData = restoreData([...originalRowData]);
      restoreGridDataWithTransaction(restoredData);
      showSuccess("모든 변경사항이 취소되었습니다.");
      return;
    }

    if (initialRowDataRef.current.length > 0) {
      const initialData = JSON.parse(JSON.stringify(initialRowDataRef.current));
      const restoredData = restoreData(initialData);
      restoreGridData(restoredData);
      showSuccess("모든 변경사항이 취소되었습니다.");
      return;
    }

    const currentData = JSON.parse(JSON.stringify(rowData));
    restoreGridData(currentData);
    showSuccess("그리드가 새로고침되었습니다.");
  };

  const renderCustomButtons = () => {
    if (!customButtons || customButtons.length === 0) {
      return null;
    }

    const applyButtonStyle = (button: React.ReactNode): React.ReactNode => {
      if (React.isValidElement(button)) {
        const buttonProps = button.props as {
          size?: "small" | "middle" | "large";
        };
        const currentSize = buttonProps.size;
        return React.cloneElement(
          button as React.ReactElement<{ size?: "small" | "middle" | "large" }>,
          {
            size: currentSize || "small",
          }
        );
      }
      return button;
    };

    const renderButtons = (buttons: React.ReactNode[]) => (
      <>
        {showCustomButtonsDivider && (
          <div className="data-grid-panel__divider"></div>
        )}
        {buttons.map((button, index) => (
          <React.Fragment key={index}>
            {applyButtonStyle(button)}
          </React.Fragment>
        ))}
      </>
    );

    if (
      showAllCustomButtons ||
      customButtons.length <= maxVisibleCustomButtons
    ) {
      return renderButtons(customButtons);
    }

    const visibleButtons = customButtons.slice(0, maxVisibleCustomButtons);
    const dropdownButtons = customButtons.slice(maxVisibleCustomButtons);

    const menuItems: MenuProps["items"] = dropdownButtons.map(
      (button, index) => {
        if (React.isValidElement(button)) {
          const buttonProps = button.props as {
            onClick?: () => void;
            children?: React.ReactNode;
          };
          return {
            key: `custom-${maxVisibleCustomButtons + index}`,
            label: (
              <FormButton onClick={buttonProps.onClick} size="small">
                {buttonProps.children}
              </FormButton>
            ),
          };
        }
        return {
          key: `custom-${maxVisibleCustomButtons + index}`,
          label: button,
        };
      }
    );

    return (
      <>
        {renderButtons(visibleButtons)}
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Tooltip title={t("더보기", "더보기")}>
            <FormButton
              type="text"
              size="small"
              icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
              className="data-grid-panel__button data-grid-panel__button--more ghost"
            />
          </Tooltip>
        </Dropdown>
      </>
    );
  };

  return (
    <FormAgGridLayoutStyles>
      <StyledAgGridContainer
        className={clsx("ag-theme-quartz", className)}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width,
        }}
        $styleOptions={mergedStyleOptions}
      >
        {showToolbar && (
          <StyledGridToolbar>
            <div className="data-grid-panel__toolbar">
              <div className="data-grid-panel-left">
                <div className="data-grid-panel__count">
                  {t("전체", "전체")}{" "}
                  <span className="data-grid-panel__count-number">
                    {rowData.length}
                  </span>{" "}
                  {t("건", "건")}
                </div>
                {renderCustomButtons()}
              </div>
              <div className="data-grid-panel-right">
                {buttonOptions.showAdd && (
                  <Tooltip title={t("행 추가", "행 추가")}>
                    <FormButton
                      icon={
                        <i className="ri-file-add-line data-grid-panel__icon" />
                      }
                      onClick={handleAddRow}
                      objId="BTN_ADD_ROW"
                      disabled={!buttonOptions.enableAdd}
                      className="data-grid-panel__button  data-grid-panel__button--add-row ghost"
                    />
                  </Tooltip>
                )}
                {buttonOptions.showCopy && (
                  <Tooltip title={t("행 복사", "행 복사")}>
                    <FormButton
                      icon={
                        <i className="ri-file-copy-line  data-grid-panel__icon" />
                      }
                      onClick={handleCopyRow}
                      objId="BTN_COPY_ROW"
                      disabled={!buttonOptions.enableCopy}
                      className="data-grid-panel__button data-grid-panel__button--copy-row ghost"
                    />
                  </Tooltip>
                )}
                {buttonOptions.showDelete && (
                  <Tooltip title={t("행 삭제", "행 삭제")}>
                    <FormButton
                      icon={
                        <i className="ri-delete-bin-line  data-grid-panel__icon" />
                      }
                      onClick={handleDeleteRow}
                      objId="BTN_DELETE_ROW"
                      disabled={!buttonOptions.enableDelete}
                      className="data-grid-panel__button data-grid-panel__button--delete-row ghost"
                    />
                  </Tooltip>
                )}
                {buttonOptions.showExcelDownload && (
                  <>
                    <div className="data-grid-panel__divider"></div>
                    <Tooltip title={t("엑셀 다운로드", "엑셀 다운로드")}>
                      <FormButton
                        icon={
                          <i className="ri-download-line  data-grid-panel__icon" />
                        }
                        onClick={handleExcelDownload}
                        objId="BTN_EXCEL_DOWNLOAD"
                        disabled={!buttonOptions.enableExcelDownload}
                        className="data-grid-panel__button  data-grid-panel__button--excel-download ghost"
                      />
                    </Tooltip>
                  </>
                )}
                {buttonOptions.showExcelUpload && (
                  <Tooltip title={t("엑셀 업로드", "엑셀 업로드")}>
                    <Upload
                      accept=".xlsx,.xls"
                      showUploadList={false}
                      beforeUpload={handleExcelUpload}
                      disabled={!buttonOptions.enableExcelUpload}
                    >
                      <FormButton
                        icon={
                          <i className="ri-upload-line  data-grid-panel__icon" />
                        }
                        objId="BTN_EXCEL_UPLOAD"
                        disabled={!buttonOptions.enableExcelUpload}
                        className="data-grid-panel__button  data-grid-panel__button--excel-upload ghost"
                      />
                    </Upload>
                  </Tooltip>
                )}
                {buttonOptions.showRefresh && (
                  <Tooltip title={t("초기화", "초기화")}>
                    <FormButton
                      icon={
                        <i className="ri-refresh-line  data-grid-panel__icon" />
                      }
                      onClick={handleRefresh}
                      disabled={!buttonOptions.enableRefresh}
                      className="data-grid-panel__button  data-grid-panel__button--refresh-grid ghost"
                    />
                  </Tooltip>
                )}
                {buttonOptions.showSave && (
                  <>
                    <div className="data-grid-panel__divider"></div>
                    <FormButton
                      onClick={() => onSave?.(gridApi)}
                      size="small"
                      objId="BTN_SAVE"
                      className="navy"
                    >
                      {t("저장", "저장")}
                    </FormButton>
                  </>
                )}
              </div>
            </div>
          </StyledGridToolbar>
        )}
        <AgGridReact<TData>
          theme="legacy"
          rowData={rowData}
          getRowId={(params) => String(params.data[idField])}
          columnDefs={processedColumnDefs}
          onGridReady={handleGridReady}
          {...defaultGridOptions}
          {...gridOptions}
          rowClassRules={{
            "ag-row-selected": (params) => {
              const data = params.data as
                | (TData & { rowStatus?: "C" | "U" | "D" })
                | undefined;
              return !!params.node.isSelected() && data?.rowStatus !== "D";
            },
            "ag-row-clicked": (params) => {
              const data = params.data as
                | (TData & { rowStatus?: "C" | "U" | "D" })
                | undefined;
              if (data?.rowStatus === "D") return false;
              const rowId = data?.id;
              const currentClickedRowId = clickedRowIdRef.current;
              return (
                rowId !== undefined &&
                rowId !== null &&
                currentClickedRowId !== null &&
                currentClickedRowId !== undefined &&
                (rowId === currentClickedRowId ||
                  String(rowId) === String(currentClickedRowId) ||
                  Number(rowId) === Number(currentClickedRowId))
              );
            },
            "ag-row-deleted": (params) => {
              const data = params.data as
                | (TData & { rowStatus?: "C" | "U" | "D" })
                | undefined;
              return data?.rowStatus === "D";
            },
            ...(gridOptions?.rowClassRules || {}),
          }}
          onCellClicked={handleCellClicked}
          onSelectionChanged={handleSelectionChanged}
          onCellEditingStopped={handleCellEditingStopped}
          {...rest}
          getRowStyle={(params) => {
            const restProps = rest as {
              getRowStyle?: (
                params: RowClassParams<TData>
              ) => RowStyle | undefined;
            };
            const customStyle =
              restProps?.getRowStyle?.(params) ||
              gridOptions?.getRowStyle?.(params);

            const data = params.data as TData | undefined;
            const rowId = data?.id;
            const currentClickedRowId = clickedRowIdRef.current;
            const rowWithStatus = data as TData & {
              rowStatus?: "C" | "U" | "D";
            };
            const isDeleted = rowWithStatus?.rowStatus === "D";

            if (isDeleted) {
              return {
                backgroundColor: "#f0f0f0",
                color: "#999999",
                textDecoration: "line-through",
              } as RowStyle;
            }

            const isClickedRow =
              rowId !== undefined &&
              rowId !== null &&
              currentClickedRowId !== null &&
              currentClickedRowId !== undefined &&
              (rowId === currentClickedRowId ||
                String(rowId) === String(currentClickedRowId) ||
                Number(rowId) === Number(currentClickedRowId));

            if (isClickedRow && !isDeleted) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { backgroundColor, color, ...restCustomStyle } =
                customStyle || {};
              return {
                ...restCustomStyle,
                backgroundColor: "#e6f7ff",
                color: "#1890ff",
              } as RowStyle;
            }

            if (params.node.isSelected() && !isDeleted) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { backgroundColor, ...restCustomStyle } = customStyle || {};
              return {
                backgroundColor: "#e6f7ff",
                ...restCustomStyle,
              } as RowStyle;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { backgroundColor, color, ...restCustomStyle } =
              customStyle || {};
            return restCustomStyle;
          }}
        />
      </StyledAgGridContainer>
    </FormAgGridLayoutStyles>
  );
};

export default FormAgGrid;
