import React, { useRef, useCallback, useMemo } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  IRowNode,
} from "ag-grid-community";
import { createStatusRenderer } from "@utils/agGridUtils";
import { FormAgGrid } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { message, Modal } from "antd";

export type LeftGridData = {
  id?: string;
  rowStatus?: "C" | "U" | "D";
  status?: string; // 상태
  closingYearMonth?: string; // 마감년월
  profitLossClosing?: string; // 손익마감
  closingStatus?: string; // 마감상태
  firstClosingYn?: string; // 최초마감여부
  lastRegUser?: string; // 최종등록자
  lastRegDate?: string; // 최종등록일자
  creator?: string; // 생성자
  createDate?: string; // 생성일자
  cnt?: number; // 미전기 전표 수
};

type LeftGridProps = {
  className?: string;
};

const LeftGrid: React.FC<LeftGridProps> = ({ className }) => {
  const gridRef = useRef<GridApi | null>(null);
  const isEditingRef = useRef(false); // 편집 중인지 추적
  const {
    leftGridData,
    setLeftGridApi,
    selectLeftRow,
    validateLeftRowChange,
    closeAllRightGridRows,
    save,
  } = useClosTagManageStore();

  // 그리드 데이터를 useMemo로 관리 (store와 분리하여 편집 중 리렌더링 방지)
  // 조회 완료 시점에만 갱신되도록 leftGridData 전체를 의존성으로 설정
  // 편집 중에는 store가 업데이트되지 않으므로 리렌더링이 발생하지 않음
  const gridRowData = useMemo(() => {
    return leftGridData.map((item, index) => ({
      ...item,
      id: item.id ?? undefined, // id 정규화
      _rowIndex: index, // fallback용 인덱스 저장
    }));
  }, [leftGridData]); // leftGridData가 변경될 때만 갱신 (조회 완료 시)

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
    if (selectedRows.length === 0) return;

    const selectedRow = selectedRows[0];
    const rowIndex =
      gridRef.current.getRowNode(selectedRow.id || "")?.rowIndex ?? -1;

    // 변경사항이 있는지 확인 (XML의 com.data.isModified 체크)
    // 그리드에서 직접 변경사항 확인
    const { leftGridApi, selectedLeftRow: currentSelectedLeftRow } =
      useClosTagManageStore.getState();

    // 그리드 데이터에서 변경사항 확인 (모든 행 확인 - 스크롤 밖 행 포함)
    let hasChanges = false;
    if (gridRef.current) {
      gridRef.current.forEachNode((node) => {
        const row = node.data as LeftGridData;
        if (row && (row.rowStatus === "U" || row.rowStatus === "C")) {
          hasChanges = true;
        }
      });
    }

    // 같은 행을 다시 선택한 경우 무시
    if (currentSelectedLeftRow?.id === selectedRow.id) {
      return;
    }

    // 변경사항이 있는 경우 확인
    if (hasChanges) {
      // 그리드에서 직접 이전 행 데이터 가져오기 (store가 아닌 실제 그리드 데이터)
      const prevRowIndex = leftGridApi?.getFocusedCell()?.rowIndex ?? -1;
      if (prevRowIndex >= 0 && gridRef.current) {
        // 모든 행을 순회하며 이전 행 찾기
        const allNodes: IRowNode<LeftGridData>[] = [];
        gridRef.current.forEachNode((node) => {
          allNodes.push(node as IRowNode<LeftGridData>);
        });

        const prevNode = allNodes.find(
          (node) => node.rowIndex === prevRowIndex
        );
        const prevRow = prevNode?.data as LeftGridData | undefined;

        if (
          prevRow &&
          (prevRow.rowStatus === "U" || prevRow.rowStatus === "C")
        ) {
          message.warning("저장 후 진행하세요!");
          // 이전 행으로 선택 복원
          if (prevNode) {
            prevNode.setSelected(true);
            if (leftGridApi) {
              leftGridApi.setFocusedCell(prevRowIndex, "closingStatus");
            }
          }
          return;
        }
      }
    }

    await selectLeftRow(selectedRow, rowIndex);
  }, [selectLeftRow]);

  // 셀 값 변경 핸들러 (XML의 onviewchange)
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (!event.data || !event.colDef.field) return;

      const row = event.data as LeftGridData;
      const field = event.colDef.field;

      if (field === "closingStatus") {
        const newValue = event.newValue as string;
        const oldValue = event.oldValue as string;

        // 그리드 데이터에서 원본 데이터 확인 (oldValue가 없을 경우 대비)
        const actualOldValue = oldValue || row.closingStatus || "Open";

        const validationResult = await validateLeftRowChange(
          row,
          newValue,
          actualOldValue
        );

        if (!validationResult.isValid && event.api) {
          // 변경 거부 시 이전 값으로 복원
          const node = event.node;
          if (node && node.data) {
            node.data.closingStatus = actualOldValue;
            // 특정 셀만 refresh하여 깜빡거림 최소화
            event.api.refreshCells({
              rowNodes: [node],
              columns: ["closingStatus"],
              force: true,
            });
          }
          return;
        }

        // 확인 다이얼로그가 필요한 경우
        if (validationResult.needsConfirmation) {
          Modal.confirm({
            title: "확인",
            content: "전 서브모듈 마감Tag를 Open 하시겠습니까?",
            onOk: async () => {
              // 확인 시 그리드 데이터만 직접 수정 (store 업데이트 없음)
              if (row.rowStatus === undefined) {
                row.rowStatus = "U";
              }
              // ALL_FLAG, SUB_MODULE 등 추가 필드 설정 필요
              // store 업데이트는 저장 시점에만 수행

              // rowStatus 컬럼만 refresh하여 시각적으로 반영 (깜빡거림 최소화)
              if (event.api) {
                event.api.refreshCells({
                  rowNodes: [event.node],
                  columns: ["rowStatus"],
                  force: true,
                });
              }

              // 서브모듈도 Open으로 변경 (wf_all_flag 로직)
              // TODO: RightGrid의 모든 행을 Open으로 변경하는 로직 추가
            },
            onCancel: () => {
              // 취소 시 이전 값으로 복원
              if (event.api) {
                const node = event.api.getRowNode(row.id || "");
                if (node && node.data) {
                  node.data.closingStatus = actualOldValue;
                  // 특정 셀만 refresh하여 깜빡거림 최소화
                  event.api.refreshCells({
                    rowNodes: [node],
                    columns: ["closingStatus"],
                    force: true,
                  });
                }
              }
            },
          });
          return;
        }

        // 즉시 업데이트 가능한 경우
        if (validationResult.shouldUpdate !== false) {
          // 그리드 데이터는 이미 event.data에 반영되어 있음
          // rowStatus만 업데이트 (store 업데이트는 저장 시점에만 수행하여 깜빡거림 완전 제거)
          if (row.rowStatus === undefined) {
            row.rowStatus = "U";
          }

          // 추가 필드 설정 (validationResult.updateFields가 있는 경우)
          if (validationResult.updateFields) {
            Object.assign(row, validationResult.updateFields);
          }

          // rowStatus 컬럼만 refresh하여 시각적으로 반영 (깜빡거림 최소화)
          if (event.api) {
            event.api.refreshCells({
              rowNodes: [event.node],
              columns: ["rowStatus"],
              force: true,
            });
          }

          // store 업데이트는 하지 않음 (저장 시점에 그리드에서 직접 가져옴)
          // 이렇게 하면 편집 중 리렌더링이 발생하지 않아 깜빡거림이 완전히 사라짐

          // Close로 변경 시 서브모듈도 Close로 변경 (wf_all_flag 로직)
          if (newValue === "Close") {
            // Validation 통과 후 오른쪽 그리드의 모든 행을 Close로 변경
            closeAllRightGridRows();
          }
        }
      }
    },
    [validateLeftRowChange, closeAllRightGridRows]
  );

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    // 그리드에서 직접 모든 행 데이터 가져오기 (모든 행 확인 - 스크롤 밖 행 포함)
    const allRows: LeftGridData[] = [];
    gridRef.current.forEachNode((node) => {
      if (node.data) {
        allRows.push(node.data as LeftGridData);
      }
    });

    // 변경된 행만 필터링 (rowStatus가 "U" 또는 "C"인 행)
    const changedRows = allRows.filter(
      (row) => row.rowStatus === "U" || row.rowStatus === "C"
    );

    if (changedRows.length === 0) {
      message.warning("변경된 항목이 없습니다.");
      return;
    }

    // 저장 전에 store 동기화 (저장 시점에만 store 업데이트)
    const { updateLeftGridData: updateStore } =
      useClosTagManageStore.getState();
    updateStore(allRows);

    await save(changedRows, []);
  }, [save]);

  // 컬럼 정의
  const columnDefs: ColDef<LeftGridData>[] = [
    {
      field: "rowStatus",
      headerName: "상태",
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
      headerName: "마감년월",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "profitLossClosing",
      headerName: "손익마감",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "closingStatus",
      headerName: "마감상태",
      width: 120,
      headerClass: "ag-header-cell-center",
      cellStyle: { textAlign: "center" },
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Open", "Close"],
      },
      cellRenderer: createStatusRenderer("green", "red", "Open"),
    },
    {
      field: "firstClosingYn",
      headerName: "최초마감여부",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "lastRegUser",
      headerName: "최종등록자",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "lastRegDate",
      headerName: "최종등록일자",
      width: 130,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "creator",
      headerName: "생성자",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
    {
      field: "createDate",
      headerName: "생성일자",
      width: 130,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
    },
  ];

  return (
    <LeftGridStyles className={className}>
      <div className="data-grid-panel">
        {/* 그리드 */}
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
            showSave: true,
          }}
          onSave={handleSave}
        />
      </div>
    </LeftGridStyles>
  );
};

export default LeftGrid;
