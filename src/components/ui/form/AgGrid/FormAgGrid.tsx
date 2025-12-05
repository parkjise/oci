// AG-Grid 관련
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
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

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
LicenseManager.setLicenseKey(import.meta.env.VITE_AGGRID_LICENSEMANAGER);

/**
 * FormAgGrid에서 사용하는 확장된 ColDef 타입
 */
export interface ExtendedColDef<TData> extends ColDef<TData> {
  /** 엑셀 다운로드에서 제외할지 여부 */
  excludeFromExcel?: boolean;
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
    height = 400,
    width = "100%",
    gridOptions,
    className,
    styleOptions,
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

  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [clickedRowId, setClickedRowId] = useState<number | string | null>(
    null
  );
  const clickedRowIdRef = useRef<number | string | null>(null);
  const shouldRestoreEditingRef = useRef<{
    rowIndex: number;
    colId: string;
  } | null>(null);

  useEffect(() => {
    clickedRowIdRef.current = clickedRowId;
    if (gridApi) {
      const timeoutId = setTimeout(() => {
        if (gridApi) {
          gridApi.redrawRows();
          gridApi.refreshCells({ force: true });
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [clickedRowId, gridApi]);

  /**
   * 툴바 버튼 옵션 기본값 설정
   */
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
  };

  /**
   * ID 비교 헬퍼 함수
   */
  const isSameId = (
    id1: number | string | null | undefined,
    id2: number | string | null | undefined
  ): boolean => {
    if (id1 === id2) return true;
    if (id1 === null || id1 === undefined || id2 === null || id2 === undefined)
      return false;
    return String(id1) === String(id2) || Number(id1) === Number(id2);
  };

  /**
   * 클릭된 행인지 확인하는 헬퍼 함수
   */
  const isClickedRow = (rowId: number | string | null | undefined): boolean => {
    const currentClickedRowId = clickedRowIdRef.current;
    return isSameId(rowId, currentClickedRowId);
  };

  /**
   * editable 함수를 처리하는 헬퍼 함수
   */
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

  const processedColumnDefs = columnDefs.map((col) =>
    processEditable(col, props.enableFilter === false)
  );

  const handleGridReady = (params: GridReadyEvent<TData>) => {
    setGridApi(params.api);
    onGridReady?.(params);
  };

  const handleCellEditingStopped = (params: CellEditingStoppedEvent<TData>) => {
    // 편집이 의도치 않게 종료된 경우 다시 시작
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

    // 편집 중인 셀을 클릭한 경우, 편집 모드 유지를 위해 복원 정보 저장
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

    // 편집 중인 행을 클릭한 경우, 행 선택 변경을 하지 않아 편집 모드 유지
    const isEditingRow = editingCells.some(
      (cell) => cell.rowIndex === clickedRowIndex
    );

    if (isEditingRow) {
      // clickedRowId만 업데이트
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

    // 행 선택 업데이트
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
          gridApi.redrawRows();
          gridApi.refreshCells({ force: true });
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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!gridApi) return;

        if (selectedNodes.length > 0) {
          gridApi.redrawRows({ rowNodes: selectedNodes });
          gridApi.refreshCells({
            rowNodes: selectedNodes,
            force: true,
          });
        }

        const nodesToRefresh: IRowNode<TData>[] = [];
        gridApi.forEachNode((node) => {
          if (!node.isSelected()) {
            nodesToRefresh.push(node);
          }
        });

        if (nodesToRefresh.length > 0) {
          gridApi.redrawRows({ rowNodes: nodesToRefresh });
          gridApi.refreshCells({
            rowNodes: nodesToRefresh,
            force: true,
          });
        }

        gridApi.redrawRows();
        gridApi.refreshCells({ force: true });
      });
    });

    gridOptions?.onSelectionChanged?.(params);
  };

  /**
   * 새 ID 생성 (기존 데이터의 최대 ID + 1)
   */
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

  /**
   * 첫 번째 행으로 포커스 이동
   */
  const focusFirstRow = () => {
    if (!gridApi) return;
    setTimeout(() => {
      gridApi.paginationGoToPage(0);
      const firstNode = gridApi.getDisplayedRowAtIndex(0);
      if (firstNode) {
        firstNode.setSelected(true);
        gridApi.ensureNodeVisible(firstNode, "top");
      }
    }, 100);
  };

  /**
   * 행 추가 핸들러
   */
  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow(gridApi);
    } else if (createNewRow && setRowData) {
      const newId = generateNewId();
      const newRow = createNewRow(newId);
      setRowData([newRow, ...rowData]);
      focusFirstRow();
    }
  };

  /**
   * 행 복사 핸들러 (선택된 행을 맨 위에 복사)
   */
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

    setRowData([copiedRow, ...rowData]);
    showSuccess("행이 복사되었습니다.");
    focusFirstRow();
  };

  /**
   * 행 삭제 핸들러
   * - 신규 추가된 행(rowStatus: "C")은 실제 삭제
   * - 기존 행은 rowStatus를 "D"로 변경
   */
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

      const newData = rowData
        .map((row) => {
          if (!selectedIds.has(row[idField])) return row;

          const rowWithStatus = row as TData & { rowStatus?: "C" | "U" | "D" };
          // 신규 추가된 행은 완전히 제거
          if (rowWithStatus.rowStatus === "C") return null;
          // 기존 행은 삭제 상태로 변경
          return { ...row, rowStatus: "D" as const } as TData;
        })
        .filter((row): row is TData => row !== null);

      setRowData(newData);
      gridApi?.deselectAll();
      gridApi?.refreshCells();
      showSuccess("선택된 행이 삭제되었습니다.");
    }
  };

  /**
   * 엑셀 다운로드 핸들러
   */
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
              obj[col.headerName || col.field] = (
                row as Record<string, unknown>
              )[col.field];
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

  /**
   * 엑셀 업로드 핸들러
   */
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

  /**
   * 그리드 리프레시 핸들러
   * 모든 변경사항을 원래 상태로 복원
   */
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(gridApi);
    } else if (originalRowData && setRowData) {
      setRowData([...originalRowData]);
      gridApi?.deselectAll();
      gridApi?.refreshCells();
      showSuccess("모든 변경사항이 취소되었습니다.");
    } else {
      gridApi?.refreshCells();
      gridApi?.deselectAll();
      showSuccess("그리드가 새로고침되었습니다.");
    }
  };

  /**
   * 커스텀 버튼 렌더링 함수
   */
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
          <FormButton
            type="text"
            size="small"
            icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
            className="data-grid-panel__button data-grid-panel__button--more ghost"
          />
        </Dropdown>
      </>
    );
  };

  return (
    <StyledAgGridContainer
      className={clsx("ag-theme-quartz", className)}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width,
      }}
      $styleOptions={styleOptions}
    >
      {showToolbar && (
        <StyledGridToolbar>
          <div className="data-grid-panel__toolbar">
            <div className="data-grid-panel-left">
              <div className="data-grid-panel__count">
                전체{" "}
                <span className="data-grid-panel__count-number">
                  {rowData.length}
                </span>{" "}
                건
              </div>
              {renderCustomButtons()}
            </div>
            <div className="data-grid-panel-right">
              {buttonOptions.showAdd && (
                <Tooltip title="행 추가">
                  <FormButton
                    icon={
                      <i
                        className="ri-file-add-line"
                        style={{ fontSize: 20 }}
                      />
                    }
                    onClick={handleAddRow}
                    size="small"
                    objId="BTN_ADD_ROW"
                    disabled={!buttonOptions.enableAdd}
                  />
                </Tooltip>
              )}
              {buttonOptions.showCopy && (
                <Tooltip title="행 복사">
                  <FormButton
                    icon={
                      <i
                        className="ri-file-copy-line"
                        style={{ fontSize: 20 }}
                      />
                    }
                    onClick={handleCopyRow}
                    size="small"
                    objId="BTN_COPY_ROW"
                    disabled={!buttonOptions.enableCopy}
                  />
                </Tooltip>
              )}
              {buttonOptions.showDelete && (
                <Tooltip title="행 삭제">
                  <FormButton
                    icon={
                      <i
                        className="ri-delete-bin-line"
                        style={{ fontSize: 20 }}
                      />
                    }
                    onClick={handleDeleteRow}
                    size="small"
                    objId="BTN_DELETE_ROW"
                    disabled={!buttonOptions.enableDelete}
                  />
                </Tooltip>
              )}
              {buttonOptions.showExcelDownload && (
                <>
                  <div className="data-grid-panel__divider"></div>
                  <Tooltip title="엑셀 다운로드">
                    <FormButton
                      icon={
                        <i
                          className="ri-download-line"
                          style={{ fontSize: 20 }}
                        />
                      }
                      onClick={handleExcelDownload}
                      size="small"
                      objId="BTN_EXCEL_DOWNLOAD"
                      disabled={!buttonOptions.enableExcelDownload}
                    />
                  </Tooltip>
                </>
              )}
              {buttonOptions.showExcelUpload && (
                <Tooltip title="엑셀 업로드">
                  <Upload
                    accept=".xlsx,.xls"
                    showUploadList={false}
                    beforeUpload={handleExcelUpload}
                    disabled={!buttonOptions.enableExcelUpload}
                  >
                    <FormButton
                      icon={
                        <i
                          className="ri-upload-line"
                          style={{ fontSize: 20 }}
                        />
                      }
                      size="small"
                      objId="BTN_EXCEL_UPLOAD"
                      disabled={!buttonOptions.enableExcelUpload}
                    />
                  </Upload>
                </Tooltip>
              )}
              {buttonOptions.showRefresh && (
                <Tooltip title="그리드 새로고침">
                  <FormButton
                    icon={
                      <i className="ri-refresh-line" style={{ fontSize: 20 }} />
                    }
                    onClick={handleRefresh}
                    size="small"
                    objId="BTN_REFRESH"
                    disabled={!buttonOptions.enableRefresh}
                  />
                </Tooltip>
              )}
              {buttonOptions.showSave && (
                <>
                  <div className="data-grid-panel__divider"></div>
                  <Tooltip title="저장">
                    <FormButton
                      onClick={() => onSave?.(gridApi)}
                      size="small"
                      objId="BTN_SAVE"
                      className="navy"
                    >
                      저장
                    </FormButton>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </StyledGridToolbar>
      )}
      <AgGridReact<TData>
        theme="legacy"
        rowData={rowData}
        columnDefs={processedColumnDefs}
        onGridReady={handleGridReady}
        {...defaultGridOptions}
        {...gridOptions}
        rowClassRules={{
          // 선택된 행에 클래스 추가
          "ag-row-selected": (params) => !!params.node.isSelected(),
          // 클릭된 행에 클래스 추가 (선택 여부와 관계없이)
          "ag-row-clicked": (params) => {
            const data = params.data as TData | undefined;
            const rowId = data?.id;
            const currentClickedRowId = clickedRowIdRef.current; // ref에서 최신 값 가져오기
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
          const rowWithStatus = data as TData & { rowStatus?: "C" | "U" | "D" };

          // 삭제된 행 스타일 (최우선)
          if (rowWithStatus?.rowStatus === "D") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { backgroundColor, ...restCustomStyle } = customStyle || {};
            return {
              backgroundColor: "#fff1f0",
              opacity: 0.7,
              textDecoration: "line-through",
              ...restCustomStyle,
            } as RowStyle;
          }

          // 클릭된 행 스타일 확인
          const isClickedRow =
            rowId !== undefined &&
            rowId !== null &&
            currentClickedRowId !== null &&
            currentClickedRowId !== undefined &&
            (rowId === currentClickedRowId ||
              String(rowId) === String(currentClickedRowId) ||
              Number(rowId) === Number(currentClickedRowId));

          // 클릭된 행 스타일 (선택 여부와 관계없이 적용)
          if (isClickedRow) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { backgroundColor, color, ...restCustomStyle } =
              customStyle || {};
            return {
              ...restCustomStyle,
              backgroundColor: "#e6f7ff",
              color: "#1890ff",
            } as RowStyle;
          }

          // 선택된 행 스타일 (삭제되지 않은 행만, 클릭되지 않은 경우)
          if (params.node.isSelected()) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { backgroundColor, ...restCustomStyle } = customStyle || {};
            return {
              backgroundColor: "#e6f7ff",
              ...restCustomStyle,
            } as RowStyle;
          }

          // 선택 해제된 행: customStyle에서 backgroundColor를 제거하여 기본 스타일로 복원
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { backgroundColor, color, ...restCustomStyle } =
            customStyle || {};
          return restCustomStyle;
        }}
      />
    </StyledAgGridContainer>
  );
};

export default FormAgGrid;
