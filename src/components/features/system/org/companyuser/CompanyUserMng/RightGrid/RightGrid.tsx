// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback, useEffect, useState } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { RightGridStyles } from "./RightGrid.styles";
import { useTranslation } from "react-i18next";
import type { CompanyUserDetailDto } from "@apis/system/org/companyUserApi";
import { getCompanyListApi } from "@apis/system/org/companyUserApi";
import { message } from "antd";
import { useAuthStore } from "@store/authStore";

// ============================================================================
// Types
// ============================================================================
type RightGridProps = {
  className?: string;
  rowData?: CompanyUserDetailDto[];
  officeId?: string;
  empyId?: string;
  onDataChange?: (data: CompanyUserDetailDto[]) => void;
  onSave?: (dataToSave?: CompanyUserDetailDto[]) => Promise<void>;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 회사사용자관리 오른쪽 그리드 컴포넌트 (회사 권한 목록)
 * - 변경이력: 2025.11.25 : ckkim (최초작성)
 */
const RightGrid: React.FC<RightGridProps> = ({
  className,
  rowData = [],
  officeId,
  empyId,
  onDataChange,
  onSave,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const gridRef = useRef<GridApi | null>(null);
  const [companyOptions, setCompanyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 다국어 처리된 선택 라벨
  const chooseLabel = t("-선택-");

  // 회사 목록 조회 (ASIS의 selectCommonList 대체)
  useEffect(() => {
    const loadCompanyOptions = async () => {
      if (!user?.officeId) return;

      try {
        // 회사 목록 조회 API 사용
        const response = await getCompanyListApi({
          officeId: user.officeId,
        });

        if (response.success && response.data) {
          const options = response.data.map((item: any) => ({
            value: item.code || "",
            label: item.name || item.code || "",
          }));
          // AS-IS "-choose-" 대응: 맨 앞에 선택 옵션 추가
          options.unshift({ value: "", label: chooseLabel });
          setCompanyOptions(options);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("회사 목록 조회 실패:", error);
        }
      }
    };

    loadCompanyOptions();
  }, [user?.officeId]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
  }, []);

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      if (!gridRef.current || !onDataChange) return;

      const allRows: CompanyUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as CompanyUserDetailDto);
        }
      });

      // Primary 변경 시 다른 행의 Primary 해제 (ASIS: Primary 회사는 반드시 하나 존재)
      if (params.colDef.field === "primeYn" && params.newValue === "Y") {
        allRows.forEach((row, index) => {
          if (index !== params.rowIndex && row.primeYn === "Y") {
            row.primeYn = "N";
            gridRef.current
              ?.getRowNode(index.toString())
              ?.setDataValue("primeYn", "N");
          }
        });
      }

      onDataChange(allRows);
    },
    [onDataChange]
  );

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    if (!gridRef.current || !officeId || !empyId) {
      message.warning(t("MSG_CM_0477")); // 선택된 데이터가 없습니다.
      return;
    }

    const newRow: CompanyUserDetailDto = {
      officeId,
      empCode: empyId,
      authOfficeId: "",
      oriOrgId: "",
      primeYn: "Y",
      rowStatus: "C",
    };

    gridRef.current.applyTransaction({ add: [newRow] });

    // 포커스 이동
    setTimeout(() => {
      const rowCount = gridRef.current?.getDisplayedRowCount() || 0;
      if (rowCount > 0) {
        gridRef.current?.setFocusedCell(rowCount - 1, "authOfficeId");
        gridRef.current?.startEditingCell({
          rowIndex: rowCount - 1,
          colKey: "authOfficeId",
        });
      }
    }, 100);
  }, [officeId, empyId, t]);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      message.warning(t("MSG_CM_0477")); // 삭제할 행을 선택하세요!
      return;
    }

    // 삭제할 행에 신규/수정 데이터가 있는지 확인
    const hasNewOrModified = selectedRows.some(
      (row) =>
        (row as CompanyUserDetailDto).rowStatus === "C" ||
        (row as CompanyUserDetailDto).rowStatus === "U"
    );

    if (hasNewOrModified) {
      message.warning(t("MSG_SY_0082")); // 신규, 수정 데이터를 저장 후 진행 바랍니다.
      return;
    }

    // 삭제 처리
    selectedRows.forEach((row) => {
      const detailRow = row as CompanyUserDetailDto;
      if (detailRow.rowStatus === "C") {
        // 신규 행은 바로 삭제
        gridRef.current?.applyTransaction({ remove: [row] });
      } else {
        // 기존 행은 rowStatus를 D로 변경
        detailRow.rowStatus = "D";
        gridRef.current
          ?.getRowNode(detailRow.authOfficeId || "")
          ?.setDataValue("rowStatus", "D");
      }
    });

    if (onDataChange && gridRef.current) {
      const allRows: CompanyUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as CompanyUserDetailDto);
        }
      });
      onDataChange(allRows);
    }
  }, [t, onDataChange]);

  // 회사 셀렉트 컬럼 정의
  const createCompanySelectColumn = (): ColDef<CompanyUserDetailDto> => {
    return {
      field: "authOfficeId",
      headerName: t("회사명"),
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: companyOptions.map((opt) => {
          if (opt.value === "") return chooseLabel;
          return `${opt.value} - ${opt.label}`;
        }),
      },
      valueGetter: (params) => {
        // 값이 없으면 "-선택-" 표시 (AS-IS)
        if (!params.data?.authOfficeId) return chooseLabel;
        const authOfficeId = params.data.authOfficeId;
        const option = companyOptions.find((opt) => opt.value === authOfficeId);
        return option ? `${option.value} - ${option.label}` : authOfficeId;
      },
      valueSetter: (params) => {
        const newValue = params.newValue;
        if (!newValue || newValue === chooseLabel) {
          params.data.authOfficeId = "";
          return true;
        }
        // "코드 - 명칭" 형식인 경우 코드만 추출
        const codeMatch = newValue.match(/^([^-]+)/);
        const code = codeMatch ? codeMatch[1].trim() : newValue;
        params.data.authOfficeId = code;
        // rowStatus 업데이트
        if (params.data.rowStatus !== "C") {
          params.data.rowStatus = "U";
        }
        return true;
      },
      valueFormatter: (params) => {
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        // 기존 코드인 경우 옵션에서 찾기
        const option = companyOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        // 기존 코드인 경우 옵션에서 찾기
        const option = companyOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
    };
  };

  // 컬럼 정의 (ASIS: 회사명, Primary)
  const columnDefs: ColDef<CompanyUserDetailDto>[] = [
    {
      headerName: "No.",
      width: 60,
      valueGetter: "node.rowIndex + 1",
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 80,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: (params: { value: string }) => {
        return params.value === "C" ? "New" : params.value === "U" ? "Mod" : params.value === "D" ? "Del" : "";
      },
    },
    createCompanySelectColumn(),
    {
      field: "primeYn",
      headerName: t("Primary"),
      width: 100,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: "agCheckboxCellRenderer",
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      valueGetter: (params) => {
        return params.data?.primeYn === "Y";
      },
      valueSetter: (params) => {
        params.data.primeYn = params.newValue ? "Y" : "N";
        if (params.data.rowStatus !== "C") {
          params.data.rowStatus = "U";
        }
        return true;
      },
    },
  ];

  return (
    <RightGridStyles className={className}>
      <div className="data-grid-panel">
        <FormAgGrid<CompanyUserDetailDto & { id?: string }>
          rowData={rowData.map((row, index) => ({
            ...row,
            id: `${row.authOfficeId || ""}_${row.empCode || ""}_${index}`,
          }))}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName={t("회사사용자관리_회사권한목록")}
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
          gridOptions={{
            defaultColDef: {
              flex: undefined,
            },
            getRowId: (params) => {
              // authOfficeId와 empCode를 조합하여 rowId로 사용
              return `${params.data?.authOfficeId || ""}_${params.data?.empCode || ""
                }_${Math.random()}`;
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: true,
            onGridReady: handleGridReady,
            onCellValueChanged: handleCellValueChanged,
          }}
          toolbarButtons={{
            showDelete: true,
            showCopy: false,
            showAdd: true,
            enableExcelDownload: true,
            showSave: true,
          }}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          onSave={
            onSave
              ? async () => {
                if (!gridRef.current || !onSave) return;
                const allRows: CompanyUserDetailDto[] = [];
                gridRef.current.forEachNode((node) => {
                  if (node.data) {
                    allRows.push(node.data as CompanyUserDetailDto);
                  }
                });
                await onSave(allRows);
              }
              : undefined
          }
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;
