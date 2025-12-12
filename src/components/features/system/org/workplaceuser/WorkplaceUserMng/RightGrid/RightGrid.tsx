// ============================================================================
// Import
// ============================================================================
import React, { useRef, useCallback, useEffect, useState } from "react";
import type { GridApi, ColDef, GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { RightGridStyles } from "./RightGrid.styles";
import { useTranslation } from "react-i18next";
import type { WorkplaceUserDetailDto } from "@apis/system/org/workplaceUserApi";
import { getInOrgListApi } from "@apis/system/common/listApi";
import { message } from "antd";
import { useAuthStore } from "@store/authStore";

// ============================================================================
// Types
// ============================================================================
type RightGridProps = {
  className?: string;
  rowData?: WorkplaceUserDetailDto[];
  officeId?: string;
  empyId?: string;
  onDataChange?: (data: WorkplaceUserDetailDto[]) => void;
  onSave?: (dataToSave?: WorkplaceUserDetailDto[]) => Promise<void>;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 사업장사용자관리 오른쪽 그리드 컴포넌트 (사업장 목록)
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
  const [workplaceOptions, setWorkplaceOptions] = useState<Array<{ value: string; label: string }>>([]);

  // 다국어 처리된 선택 라벨
  const chooseLabel = t("-선택-");

  // 사업장 목록 조회 (AS-IS selectCommonList의 IN_ORG_ID 사용)
  useEffect(() => {
    const loadWorkplaceOptions = async () => {
      if (!user?.officeId) return;

      try {
        // 공통 목록 조회 API를 사용하여 입고 사업장 목록 조회
        const response = await getInOrgListApi({
          officeId: user.officeId,
        });

        if (response.success && response.data) {
          const options = response.data.map((item) => ({
            value: item.code || "",
            label: item.name || item.code || "",
          }));
          // AS-IS "-choose-" 대응: 맨 앞에 선택 옵션 추가
          options.unshift({ value: "", label: chooseLabel });
          setWorkplaceOptions(options);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("사업장 목록 조회 실패:", error);
        }
      }
    };

    loadWorkplaceOptions();
  }, [user?.officeId]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
    },
    []
  );

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      if (!gridRef.current || !onDataChange) return;

      const allRows: WorkplaceUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as WorkplaceUserDetailDto);
        }
      });

      // Primary 변경 시 다른 행의 Primary 해제
      if (params.colDef.field === "primary" && params.newValue === "Y") {
        allRows.forEach((row, index) => {
          if (index !== params.rowIndex && row.primary === "Y") {
            row.primary = "N";
            gridRef.current?.getRowNode(index.toString())?.setDataValue("primary", "N");
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
      message.warning(t("MSG_SY_0111")); // 선택된 데이터가 없습니다.
      return;
    }

    const newRow: WorkplaceUserDetailDto = {
      officeId,
      empyId,
      orgId: "",
      oriOrgId: "",
      primary: "N", // AS-IS 기본값 N
      multiOrgYno: "",
      rowStatus: "C",
    };

    gridRef.current.applyTransaction({ add: [newRow] });

    // 포커스 이동
    setTimeout(() => {
      const rowCount = gridRef.current?.getDisplayedRowCount() || 0;
      if (rowCount > 0) {
        gridRef.current?.setFocusedCell(rowCount - 1, "orgId");
        gridRef.current?.startEditingCell({
          rowIndex: rowCount - 1,
          colKey: "orgId",
        });
      }
    }, 100);
  }, [officeId, empyId, t]);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0102")); // 삭제할 행을 선택하세요!
      return;
    }

    // 삭제할 행에 신규/수정 데이터가 있는지 확인
    const hasNewOrModified = selectedRows.some(
      (row) => (row as WorkplaceUserDetailDto).rowStatus === "C" || (row as WorkplaceUserDetailDto).rowStatus === "U"
    );

    if (hasNewOrModified) {
      message.warning(t("MSG_SY_0103")); // 신규, 수정 데이터를 저장 후 진행 바랍니다.
      return;
    }

    // 삭제 처리
    selectedRows.forEach((row) => {
      const detailRow = row as WorkplaceUserDetailDto;
      if (detailRow.rowStatus === "C") {
        // 신규 행은 바로 삭제
        gridRef.current?.applyTransaction({ remove: [row] });
      } else {
        // 기존 행은 rowStatus를 D로 변경
        detailRow.rowStatus = "D";
        gridRef.current?.getRowNode(detailRow.orgId || "")?.setDataValue("rowStatus", "D");
      }
    });

    if (onDataChange && gridRef.current) {
      const allRows: WorkplaceUserDetailDto[] = [];
      gridRef.current.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data as WorkplaceUserDetailDto);
        }
      });
      onDataChange(allRows);
    }
  }, [t, onDataChange]);

  // 사업장 셀렉트 컬럼 정의
  const createWorkplaceSelectColumn = (): ColDef<WorkplaceUserDetailDto> => {
    // 편집 모드에서 "코드 - 명칭" 형식으로 표시하기 위해 valueGetter 사용
    return {
      field: "orgId",
      headerName: t("사업장"),
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: "left" },
      headerClass: "ag-header-cell-center",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        // values에 "코드 - 명칭" 형식으로 넣어서 드롭다운에서 명칭이 보이도록 함
        values: workplaceOptions.map((opt) => {
          if (opt.value === "") return chooseLabel;
          return `${opt.value} - ${opt.label}`;
        }),
      },
      valueGetter: (params) => {
        // 편집 모드에서 "코드 - 명칭" 형식으로 표시하기 위해 변환
        if (!params.data?.orgId) return chooseLabel;
        const orgId = params.data.orgId;
        const option = workplaceOptions.find((opt) => opt.value === orgId);
        return option ? `${option.value} - ${option.label}` : orgId;
      },
      valueSetter: (params) => {
        // "코드 - 명칭" 형식에서 코드만 추출
        const newValue = params.newValue;
        if (!newValue || newValue === chooseLabel) {
          params.data.orgId = "";
          return true;
        }
        // "코드 - 명칭" 형식인 경우 코드만 추출
        const codeMatch = newValue.match(/^([^-]+)/);
        const code = codeMatch ? codeMatch[1].trim() : newValue;
        params.data.orgId = code;
        if (!params.data.oriOrgId) {
          params.data.oriOrgId = code;
        }
        // rowStatus 업데이트
        if (params.data.rowStatus !== "C") {
          params.data.rowStatus = "U";
        }
        return true;
      },
      valueFormatter: (params) => {
        // valueGetter로 인해 "코드 - 명칭" 형식이므로 명칭만 추출
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        // 기존 코드인 경우 옵션에서 찾기
        const option = workplaceOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
      cellRenderer: (params: { value: string }) => {
        // valueGetter로 인해 "코드 - 명칭" 형식이므로 명칭만 추출
        if (!params.value) return "-";
        if (params.value.includes(" - ")) {
          const labelMatch = params.value.match(/ - (.+)$/);
          return labelMatch ? labelMatch[1] : params.value;
        }
        // 기존 코드인 경우 옵션에서 찾기
        const option = workplaceOptions.find((opt) => opt.value === params.value);
        return option ? option.label : params.value;
      },
    };
  };

  // 컬럼 정의
  const columnDefs: ColDef<WorkplaceUserDetailDto>[] = [
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
    createWorkplaceSelectColumn(),
    {
      field: "primary",
      headerName: t("소속사업장"),
      width: 100,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: "agCheckboxCellRenderer",
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      valueGetter: (params) => {
        return params.data?.primary === "Y";
      },
      valueSetter: (params) => {
        params.data.primary = params.newValue ? "Y" : "N";
        // Primary가 Y로 설정될 때만 다른 행 체크 해제 로직은 handleCellValueChanged에서 처리됨
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
        <FormAgGrid<WorkplaceUserDetailDto & { id?: string }>
          rowData={rowData.map((row, index) => ({ ...row, id: `${row.orgId || ''}_${row.empyId || ''}_${index}` }))}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName={t("사업장사용자관리_사업장목록")}
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
              // orgId와 empyId를 조합하여 rowId로 사용
              return `${params.data?.orgId || ''}_${params.data?.empyId || ''}_${Math.random()}`;
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
          onSave={onSave ? async () => {
            if (!gridRef.current || !onSave) return;
            const allRows: WorkplaceUserDetailDto[] = [];
            gridRef.current.forEachNode((node) => {
              if (node.data) {
                allRows.push(node.data as WorkplaceUserDetailDto);
              }
            });
            await onSave(allRows);
          } : undefined}
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;

