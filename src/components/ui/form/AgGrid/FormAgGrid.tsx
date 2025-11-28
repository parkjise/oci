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
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

// React
import { useState } from "react";

// Ant Design
import { Upload, Space, Tooltip } from "antd";
import {
  PlusOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

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
 * FormAgGrid 컴포넌트 Props
 */
interface FormAgGridProps<TData> extends AgGridReactProps {
  /** 그리드 데이터 */
  rowData: TData[];
  /** 컬럼 정의 */
  columnDefs: ColDef<TData>[];
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
  /** 원본 데이터 (리프레시 시 복원용) */
  originalRowData?: TData[];
  /** 새 행 생성 함수 */
  createNewRow?: (newId: number | string) => TData;
  /** 데이터 업데이트 함수 */
  setRowData?: (data: TData[]) => void;
  /** ID 필드명 (기본값: "id") */
  idField?: keyof TData;
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
    /** 그리드 새로고침 버튼 표시 여부 (기본값: true) */
    showRefresh?: boolean;
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
    originalRowData,
    createNewRow,
    setRowData,
    idField = "id" as keyof TData,
    toolbarButtons,
    onGridReady,
    ...rest
  } = props;

  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);

  /**
   * 툴바 버튼 옵션 기본값 설정
   */
  const buttonOptions = {
    showAdd: toolbarButtons?.showAdd ?? true,
    showCopy: toolbarButtons?.showCopy ?? true,
    showDelete: toolbarButtons?.showDelete ?? true,
    showExcelDownload: toolbarButtons?.showExcelDownload ?? true,
    showExcelUpload: toolbarButtons?.showExcelUpload ?? true,
    showRefresh: toolbarButtons?.showRefresh ?? true,
    enableAdd: toolbarButtons?.enableAdd ?? true,
    enableCopy: toolbarButtons?.enableCopy ?? true,
    enableDelete: toolbarButtons?.enableDelete ?? true,
    enableExcelDownload: toolbarButtons?.enableExcelDownload ?? true,
    enableExcelUpload: toolbarButtons?.enableExcelUpload ?? true,
    enableRefresh: toolbarButtons?.enableRefresh ?? true,
  };

  /**
   * 그리드 기본 옵션
   */
  const defaultGridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    },
    rowSelection: "single",
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
    animateRows: true,
  };

  /**
   * 그리드 준비 완료 핸들러
   */
  const handleGridReady = (params: GridReadyEvent<TData>) => {
    setGridApi(params.api);
    onGridReady?.(params);
  };

  /**
   * 새 ID 생성 (기존 데이터의 최대 ID + 1)
   */
  const generateNewId = (): number => {
    if (rowData.length === 0) return 1;
    return (
      Math.max(
        ...rowData.map((row) => {
          const id = row[idField];
          return typeof id === "number" ? id : parseInt(String(id)) || 0;
        })
      ) + 1
    );
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

    // 선택된 행을 복사하여 새 ID로 생성
    let copiedRow: TData;
    if (createNewRow) {
      copiedRow = createNewRow(newId);
      // 원본 행의 데이터를 새 행에 복사 (ID 제외)
      Object.keys(rowToCopy).forEach((key) => {
        if (key !== String(idField)) {
          (copiedRow as Record<string, unknown>)[key] = (
            rowToCopy as Record<string, unknown>
          )[key];
        }
      });
    } else {
      copiedRow = { ...rowToCopy, [idField]: newId } as TData;
    }

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

      if (setRowData) {
        const selectedIds = selectedRows.map((row) => row[idField]);

        // 신규 추가된 행(rowStatus: "C")은 실제 삭제
        // 기존 행은 rowStatus를 "D"로 변경
        const newData = rowData
          .map((row) => {
            if (selectedIds.includes(row[idField])) {
              const rowWithStatus = row as TData & {
                rowStatus?: "C" | "U" | "D";
              };
              // 신규 추가된 행(rowStatus: "C")은 필터링하여 실제 삭제
              if (rowWithStatus.rowStatus === "C") {
                return null; // 필터링을 위해 null 반환
              }
              // 기존 행은 rowStatus를 "D"로 변경
              return { ...row, rowStatus: "D" as const } as TData;
            }
            return row;
          })
          .filter((row) => row !== null) as TData[];

        setRowData(newData);
        gridApi?.deselectAll();

        // 그리드 리프레시
        if (gridApi) {
          gridApi.refreshCells();
        }

        showSuccess("선택된 행이 삭제되었습니다.");
      }
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

        // 데이터 변환
        const excelData = rowData.map((row) => {
          const obj: Record<string, unknown> = {};
          columnDefs.forEach((col) => {
            if (col.field) {
              obj[col.headerName || col.field] = (
                row as Record<string, unknown>
              )[col.field];
            }
          });
          return obj;
        });

        // 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // 파일 다운로드
        const fileName = `grid_data_${new Date().getTime()}.xlsx`;
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
        const uploadedData = await parseExcelFile<TData>(file, {
          hasHeader: true,
        });
        setRowData([...uploadedData, ...rowData]);
        showSuccess(`${uploadedData.length}건의 데이터가 업로드되었습니다.`);
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "엑셀 업로드 중 오류가 발생했습니다."
        );
      }
    }
    return false; // Upload 컴포넌트의 자동 업로드 방지
  };

  /**
   * 그리드 리프레시 핸들러
   * 모든 변경사항을 원래 상태로 복원
   */
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(gridApi);
    } else if (originalRowData && setRowData) {
      // 원본 데이터로 복원
      setRowData([...originalRowData]);
      if (gridApi) {
        gridApi.deselectAll();
        gridApi.refreshCells();
      }
      showSuccess("모든 변경사항이 취소되었습니다.");
    } else {
      // 기본 동작: 그리드 리프레시
      if (gridApi) {
        gridApi.refreshCells();
        gridApi.deselectAll();
      }
      showSuccess("그리드가 새로고침되었습니다.");
    }
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
          <Space size="small">
            {buttonOptions.showAdd && (
              <Tooltip title="행 추가">
                <FormButton
                  type="text"
                  icon={<PlusOutlined />}
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
                  type="text"
                  icon={<CopyOutlined />}
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
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteRow}
                  size="small"
                  danger
                  objId="BTN_DELETE_ROW"
                  disabled={!buttonOptions.enableDelete}
                />
              </Tooltip>
            )}
            {buttonOptions.showExcelDownload && (
              <Tooltip title="엑셀 다운로드">
                <FormButton
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={handleExcelDownload}
                  size="small"
                  objId="BTN_EXCEL_DOWNLOAD"
                  disabled={!buttonOptions.enableExcelDownload}
                />
              </Tooltip>
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
                    type="text"
                    icon={<UploadOutlined />}
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
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  size="small"
                  objId="BTN_REFRESH"
                  disabled={!buttonOptions.enableRefresh}
                />
              </Tooltip>
            )}
          </Space>
        </StyledGridToolbar>
      )}
      <AgGridReact<TData>
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={handleGridReady}
        {...defaultGridOptions}
        {...gridOptions}
        {...rest}
      />
    </StyledAgGridContainer>
  );
};

export default FormAgGrid;
