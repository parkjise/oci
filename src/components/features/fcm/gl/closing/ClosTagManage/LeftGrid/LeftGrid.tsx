import React, { useRef, useCallback, useMemo, useEffect } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { createStatusRenderer } from "@utils/agGridUtils";
import { FormAgGrid } from "@components/ui/form";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { useAuthStore } from "@store/com/auth/authStore";
import { warning } from "@/components/ui/feedback/Message";
import type { LeftGridData } from "@/types/fcm/gl/closing/closTagManage.types";
import { formatDateTime, extractMonth } from "@utils/dateUtils";
import { useLeftGridLogic } from "./useLeftGridLogic";
import { useTranslation } from "react-i18next";

type LeftGridProps = {
  className?: string;
};

const LeftGrid: React.FC<LeftGridProps> = () => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);
  const isEditingRef = useRef(false); // 편집 중인지 추적
  const prevSelectedRowIndexRef = useRef<number | null>(null); // 이전 선택된 행 인덱스 추적
  const prevDataLengthRef = useRef<number>(0); // 이전 데이터 길이 추적 (조회 완료 감지용)
  const { user } = useAuthStore();
  const { leftGridData, setLeftGridApi, selectLeftRow } =
    useClosTagManageStore();

  // 비즈니스 로직 Hook 사용
  const { handleCellValueChanged } = useLeftGridLogic();

  // 그리드 데이터를 useMemo로 관리 (store와 분리하여 편집 중 리렌더링 방지)
  // 조회 완료 시점에만 갱신되도록 leftGridData 전체를 의존성으로 설정
  // 편집 중에는 store가 업데이트되지 않으므로 리렌더링이 발생하지 않음
  const gridRowData = useMemo(() => {
    return leftGridData.map((item, index) => {
      // rowStatus가 "U", "C", "D"인 경우에만 포함 (편집 시 상태 유지)
      // rowStatus가 undefined이거나 없는 경우는 포함하지 않음 (저장 후 재조회 시 상태 초기화)
      const result: LeftGridData & { _rowIndex: number } = {
        ...item,
        id: item.id ?? undefined, // id 정규화
        _rowIndex: index, // fallback용 인덱스 저장
      };
      // rowStatus가 "U", "C", "D"가 아닌 경우 제거
      if (
        result.rowStatus !== "U" &&
        result.rowStatus !== "C" &&
        result.rowStatus !== "D"
      ) {
        delete result.rowStatus;
      }
      return result;
    });
  }, [leftGridData]); // leftGridData가 변경될 때만 갱신 (조회 완료 시)

  // leftGridData가 변경되면 (조회 완료 시) 선택 상태 초기화 및 포커스 설정
  // 단, 데이터 길이가 변경되었을 때만 실행 (조회 완료 시) - 마감상태 변경 시에는 실행하지 않음
  useEffect(() => {
    const currentDataLength = leftGridData.length;
    const prevDataLength = prevDataLengthRef.current;

    // 데이터 길이가 변경되었을 때만 실행 (조회 완료 시)
    const isDataRefresh = currentDataLength !== prevDataLength;

    if (gridRef.current && currentDataLength > 0 && isDataRefresh) {
      // 선택 해제
      gridRef.current.deselectAll();
      // 이전 선택 인덱스 초기화
      prevSelectedRowIndexRef.current = null;

      // 조회 후 첫 번째 행 선택 및 포커스 설정 (as-is 로직)
      // 그리드가 완전히 렌더링된 후 행 선택 및 포커스 설정
      setTimeout(() => {
        if (gridRef.current) {
          try {
            // 먼저 첫 번째 행이 보이도록 스크롤
            gridRef.current.ensureIndexVisible(0, "middle");

            // 첫 번째 행의 노드 찾기 및 선택
            gridRef.current.forEachNode((node) => {
              if (node.rowIndex === 0) {
                // 행 선택
                node.setSelected(true);
                // 포커스 설정
                gridRef.current?.setFocusedCell(0, "tag");

                if (import.meta.env.DEV) {
                  console.log(
                    "LeftGrid 조회 후 첫 번째 행 선택 및 포커스 설정 완료"
                  );
                }
              }
            });
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("LeftGrid 행 선택 및 포커스 설정 실패:", error);
            }
          }
        }
      }, 200); // 그리드 렌더링 완료 대기
    }

    // 현재 데이터 길이를 저장
    prevDataLengthRef.current = currentDataLength;
  }, [leftGridData]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setLeftGridApi(params.api);
    },
    [setLeftGridApi]
  );

  // 행 선택 변경 핸들러 (XML의 onrowindexchange)
  // onSelectionChanged를 사용하여 행 선택이 완료된 후에만 처리
  const handleSelectionChanged = useCallback(async () => {
    if (!gridRef.current) return;

    // 편집 중이면 무시
    if (isEditingRef.current || gridRef.current.getEditingCells().length > 0) {
      return;
    }

    const selectedRows = gridRef.current.getSelectedRows() as LeftGridData[];
    if (selectedRows.length === 0) {
      // 선택 해제된 경우
      prevSelectedRowIndexRef.current = null;
      return;
    }

    const selectedRow = selectedRows[0];
    const rowIndex =
      gridRef.current.getRowNode(selectedRow.id || "")?.rowIndex ?? -1;

    // 같은 행을 다시 선택한 경우 무시
    const { selectedLeftRow: currentSelectedLeftRow } =
      useClosTagManageStore.getState();
    if (currentSelectedLeftRow?.id === selectedRow.id) {
      prevSelectedRowIndexRef.current = rowIndex;
      return;
    }

    // 변경사항이 있는지 확인 (XML의 com.data.isModified 체크)
    // 그리드에서 직접 변경사항 확인
    let hasChanges = false;
    if (gridRef.current) {
      gridRef.current.forEachNode((node) => {
        const row = node.data as LeftGridData;
        if (row && (row.rowStatus === "U" || row.rowStatus === "C")) {
          hasChanges = true;
        }
      });
    }

    // 변경사항이 있고 이전 행이 있는 경우 확인
    if (hasChanges && prevSelectedRowIndexRef.current !== null) {
      const prevRowIndex = prevSelectedRowIndexRef.current;
      let prevRow: LeftGridData | undefined;

      // 이전 행 찾기
      gridRef.current.forEachNode((node) => {
        if (node.rowIndex === prevRowIndex) {
          prevRow = node.data as LeftGridData;
        }
      });

      if (prevRow && (prevRow.rowStatus === "U" || prevRow.rowStatus === "C")) {
        warning({
          content: "저장 후 진행하세요!",
        });
        // 이전 행으로 선택 복원
        gridRef.current.forEachNode((node) => {
          if (node.rowIndex === prevRowIndex) {
            node.setSelected(true);
            gridRef.current?.setFocusedCell(prevRowIndex, "tag");
          } else {
            node.setSelected(false);
          }
        });
        return;
      }
    }

    // 선택 성공 시 이전 행 인덱스 업데이트
    prevSelectedRowIndexRef.current = rowIndex;
    await selectLeftRow(selectedRow, prevSelectedRowIndexRef.current, {
      officeId: user?.officeId,
    });
  }, [selectLeftRow, user?.officeId]);

  // 셀 값 변경 핸들러는 useLeftGridLogic Hook에서 가져옴
  // (비즈니스 로직 분리를 위해 Hook으로 이동)

  // 컬럼 정의
  const columnDefs: ColDef<LeftGridData>[] = useMemo(() => [
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 80,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
        if (!params.value) return null;
        const statusMap = {
          C: { text: "추가", color: "blue" },
          U: { text: "수정", color: "orange" },
          D: { text: "삭제", color: "red" },
        };
        const statusInfo = statusMap[params.value];
        if (!statusInfo) return null;
        return (
          <span style={{ color: statusInfo.color, fontWeight: "bold" }}>
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      field: "closingYearMonth",
      headerName: t("마감년월"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return extractMonth(params.data?.closingYearMonth);
      },
    },
    {
      field: "profitLossClosing",
      headerName: t("손익마감"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "tag",
      headerName: t("마감상태"),
      width: 120,
      headerClass: "ag-header-cell-center",
      cellStyle: { textAlign: "center" },
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Open", "Close"], // 편집 시 "Open", "Close"로 표시
      },
      valueGetter: (params) => {
        const tag = params.data?.tag;
        return tag === "Y" ? "Close" : tag === "N" ? "Open" : "Open";
      },
      valueSetter: (params) => {
        if (params.data) {
          // "Open"/"Close"를 "N"/"Y"로 변환
          params.data.tag = params.newValue === "Close" ? "Y" : "N";
        }
        return true;
      },
      cellRenderer: createStatusRenderer("green", "red", "Open"),
    },
    {
      field: "firstClosingYn",
      headerName: t("최초마감여부"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "lastRegUser",
      headerName: t("최종등록자"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "lastRegDate",
      headerName: t("최종등록일자"),
      width: 180,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return formatDateTime(params.data?.lastRegDate);
      },
    },
    {
      field: "creator",
      headerName: t("생성자"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "createDate",
      headerName: t("생성일자"),
      width: 180,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return formatDateTime(params.data?.createDate);
      },
    },
  ], [t]);

  return (
    <FormAgGrid<LeftGridData & { id?: string }>
      rowData={gridRowData}
      headerHeight={32}
      columnDefs={columnDefs}
      height={600}
      excelFileName="마감태그관리_왼쪽"
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
      gridOptions={{
        defaultColDef: {
          flex: undefined,
        },
        // getRowId 설정: row id 매칭 안정화
        getRowId: (params) => {
          if (params.data?.id) {
            return String(params.data.id);
          }
          // id가 없는 경우 fallback: closingYearMonth와 저장된 인덱스 조합
          const data = params.data as LeftGridData & { _rowIndex?: number };
          return `row-${data?.closingYearMonth ?? "unknown"}-${
            data?._rowIndex ?? "unknown"
          }`;
        },
        rowSelection: "single",
        animateRows: true,
        pagination: false,
        paginationPageSize: 10,
        rowHeight: 32,
        paginationPageSizeSelector: [10, 20, 50, 100],
        suppressRowClickSelection: false,
        singleClickEdit: false, // 더블클릭으로 편집 시작 (기존과 동일)
        stopEditingWhenCellsLoseFocus: true, // 포커스 잃으면 편집 종료
        suppressClickEdit: false, // 클릭 편집 허용
        suppressMovableColumns: true, // 컬럼 이동 방지
        enterNavigatesVertically: false, // Enter 키로 수직 이동 방지
        enterNavigatesVerticallyAfterEdit: false, // 편집 후 Enter 키로 수직 이동 방지
        onGridReady: handleGridReady,
        onSelectionChanged: handleSelectionChanged,
        onCellEditingStarted: () => {
          isEditingRef.current = true;
        },
        onCellEditingStopped: () => {
          isEditingRef.current = false;
        },
        onCellValueChanged: handleCellValueChanged,
        isRowSelectable: (rowNode) => {
          return rowNode.data !== undefined;
        },
        // getRowStyle 제거: AG Grid의 기본 선택 스타일(.ag-row-selected) 사용
        // 필요시 CSS에서 .ag-row-selected { background-color: #e6f7ff; } 로 처리
      }}
      toolbarButtons={{
        // 조건부 활성화: 선택된 행이 있을 때만 복사/삭제 버튼 활성화
        showDelete: false,
        showCopy: false,
        showAdd: false,
        enableExcelDownload: true,
        showExcelUpload: false,
        showSave: false,
      }}
    />
  );
};

export default LeftGrid;
