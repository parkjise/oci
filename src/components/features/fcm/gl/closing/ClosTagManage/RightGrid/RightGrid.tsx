import React, { useRef, useCallback, useMemo } from "react";
import type {
  GridApi,
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  IRowNode,
} from "ag-grid-community";
import { createStatusRenderer } from "@utils/agGridUtils";
import { FormAgGrid, FormButton } from "@components/ui/form";
import { RightGridStyles } from "./RightGrid.styles";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { usePageModal } from "@hooks/usePageModal";
import { AppPageModal } from "@components/ui/feedback/Modal";
import MtClos from "@/pages/fcm/gl/closing/MtClos/MtClos";
import type { MtClosResult } from "@/pages/fcm/gl/closing/MtClos/MtClos";
import YyCyfd from "@/pages/fcm/gl/closing/YyCyfd/YyCyfd";
import type { YyCyfdResult } from "@/pages/fcm/gl/closing/YyCyfd/YyCyfd";
export type RightGridData = {
  id?: string;
  rowStatus?: "C" | "U" | "D";
  status?: string; // 상태
  moduleType?: string; // 모듈구분
  closingStatus?: string; // 마감상태
  lastRegUser?: string; // 최종등록자
  creator?: string; // 생성자
  createDate?: string; // 생성일자
  lastRegDate?: string; // 최종등록일자
  mth?: string; // 월
  // 원본 필드들
  CREATED_BY?: string;
  LAST_UPDATED_BY?: string;
  CREATION_DATE?: string;
  LAST_UPDATE_DATE?: string;
  SUB_MODULE?: string;
  CREATED_BY_USER?: string;
  YEAR?: string;
  OFFICE_ID?: string;
  TAG?: string; // "Y" | "N"
  LAST_UPDATED_BY_USER?: string;
};

type RightGridProps = {
  className?: string;
};

const RightGrid: React.FC<RightGridProps> = ({ className }) => {
  const gridRef = useRef<GridApi | null>(null);
  const rightGridData = useClosTagManageStore((state) => state.rightGridData);
  const setRightGridApi = useClosTagManageStore(
    (state) => state.setRightGridApi
  );
  const save = useClosTagManageStore((state) => state.save);
  const leftGridData = useClosTagManageStore((state) => state.leftGridData);
  const validateRightRowChange = useClosTagManageStore(
    (state) => state.validateRightRowChange
  );
  const selectedLeftRow = useClosTagManageStore(
    (state) => state.selectedLeftRow
  );
  const originalRightGridData = useClosTagManageStore(
    (state) => state.originalRightGridData
  );

  // 그리드 데이터를 useMemo로 관리 (store와 분리하여 편집 중 리렌더링 방지)
  // 조회 완료 시점에만 갱신되도록 rightGridData 전체를 의존성으로 설정
  // 편집 중에는 store가 업데이트되지 않으므로 리렌더링이 발생하지 않음
  const gridRowData = useMemo(() => {
    return rightGridData.map((item, index) => ({
      ...item,
      id: item.id ?? undefined, // id 정규화
      _rowIndex: index, // fallback용 인덱스 저장 (LeftGrid와 동일)
    }));
  }, [rightGridData]); // rightGridData가 변경될 때만 갱신 (조회 완료 시)

  // 월마감 모달 훅
  const mtClosModal = usePageModal<
    { initialYear?: string; initialMonth?: string },
    MtClosResult
  >(MtClos, {
    title: "월마감 처리",
    centered: true,
    width: 550,
    height: 400,
    destroyOnHidden: true,
    onReturn: (value) => {
      console.log("월마감 처리 결과:", value);
      // TODO: 모달 결과에 따른 후속 처리 로직 구현
      // 예: 그리드 데이터 갱신, 상태 업데이트 등
    },
  });

  // 연이월 모달 훅
  const yyCyfdModal = usePageModal<{ initialYear?: string }, YyCyfdResult>(
    YyCyfd,
    {
      title: "연이월 처리",
      centered: true,
      width: 500,
      height: 300,
      destroyOnHidden: true,
      onReturn: (value) => {
        console.log("연이월 처리 결과:", value);
        // TODO: 모달 결과에 따른 후속 처리 로직 구현
        // 예: 그리드 데이터 갱신, 상태 업데이트 등
      },
    }
  );

  // 원본 데이터 Map 생성 (getChangedRows와 handleCellValueChanged에서 공통 사용)
  const originalRightMap = useMemo(() => {
    const map = new Map<string, RightGridData>();
    originalRightGridData.forEach((item) => {
      if (item.id) {
        map.set(item.id, item);
      }
    });
    return map;
  }, [originalRightGridData]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setRightGridApi(params.api);
    },
    [setRightGridApi]
  );

  // 변경된 행 추출 (모든 행 확인 - 스크롤 밖 행 포함)
  const getChangedRows = useCallback((): RightGridData[] => {
    if (!gridRef.current) return [];
    const changedRows: RightGridData[] = [];

    // 그리드에서 모든 행 데이터 가져오기 (forEachNode 사용)
    gridRef.current.forEachNode((node: IRowNode<RightGridData>) => {
      const item = node.data as RightGridData;
      if (!item) return;

      const original = item.id ? originalRightMap.get(item.id) : undefined;

      if (original) {
        // TAG 필드 비교
        if (original.TAG !== item.TAG) {
          changedRows.push({ ...item });
        }
      } else {
        // 원본에 없는 경우 (새로 추가된 경우)
        if (item.rowStatus === "C") {
          changedRows.push({ ...item });
        }
      }
    });
    return changedRows;
  }, [originalRightMap]); // originalRightMap을 의존성으로 사용

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      return;
    }

    // 변경된 행만 추출
    const changedRows = getChangedRows();
    if (changedRows.length === 0) {
      return;
    }

    // 변경된 LeftGrid 데이터도 함께 전달
    const changedLeftRows = leftGridData.filter(
      (row) => row.rowStatus === "U" || row.rowStatus === "C"
    );

    await save(changedLeftRows, changedRows);
  }, [save, leftGridData, getChangedRows]);

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<RightGridData>) => {
      if (params.colDef.field !== "closingStatus" || !params.data) {
        return;
      }

      const row = params.data as RightGridData;
      const newClosingStatus = params.newValue as string;
      const oldClosingStatus =
        (params.oldValue as string | undefined) || row.closingStatus || "Open";

      // 1) 검증
      const isValid = validateRightRowChange(row, newClosingStatus);
      if (!isValid) {
        // 검증 실패 시 원래 값으로 복구
        row.closingStatus = oldClosingStatus;
        row.TAG = oldClosingStatus === "Close" ? "Y" : "N";
        // 특정 셀만 refresh하여 깜빡거림 최소화
        params.api.refreshCells({
          rowNodes: [params.node],
          columns: ["closingStatus"],
          force: true,
        });
        return;
      }

      // 2) 데이터 일관성 보장 (valueSetter가 해주긴 하지만, 한 번 더 확실히)
      row.closingStatus = newClosingStatus;
      row.TAG = newClosingStatus === "Close" ? "Y" : "N";

      // 3) 원본과 비교하여 rowStatus 설정
      const original = row.id ? originalRightMap.get(row.id) : undefined;
      if (original) {
        // 원본과 비교: TAG가 다르면 수정 상태
        if (original.TAG !== row.TAG) {
          row.rowStatus = "U";
        } else {
          // 원본과 같으면 변경사항 없음
          row.rowStatus = undefined;
        }
      } else {
        // 원본이 없는 신규 행이라면, 수정으로 본다 (또는 추가로 처리)
        if (row.rowStatus !== "C") {
          row.rowStatus = "U"; // 기존 행인데 원본이 없는 경우 수정으로 처리
        }
      }

      // rowStatus와 closingStatus 컬럼 refresh하여 시각적으로 반영 (깜빡거림 최소화)
      params.api.refreshCells({
        rowNodes: [params.node],
        columns: ["closingStatus", "rowStatus"],
        force: true,
      });

      // store 업데이트는 하지 않음 (저장 시점에 그리드에서 직접 가져옴)
      // 이렇게 하면 편집 중 리렌더링이 발생하지 않아 깜빡거림이 완전히 사라짐
    },
    [validateRightRowChange, originalRightMap]
  );

  // 컬럼 정의
  const columnDefs: ColDef<RightGridData>[] = [
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
      field: "moduleType",
      headerName: "모듈구분",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.SUB_MODULE || params.data?.moduleType;
      },
    },
    {
      field: "closingStatus",
      headerName: "마감상태",
      width: 120,
      headerClass: "ag-header-cell-center",
      cellStyle: { textAlign: "center" },
      editable: () => {
        return selectedLeftRow?.closingStatus !== "Close"; // LeftGrid가 Close면 편집 불가
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Open", "Close"],
      },
      valueGetter: (params) => {
        const tag = params.data?.TAG;
        return tag === "Y" ? "Close" : tag === "N" ? "Open" : "Open";
      },
      valueSetter: (params) => {
        if (params.data) {
          params.data.TAG = params.newValue === "Close" ? "Y" : "N";
          params.data.closingStatus = params.newValue;
        }
        return true;
      },
      cellRenderer: createStatusRenderer("green", "red", "Open"),
    },
    {
      field: "lastRegUser",
      headerName: "최종등록자",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.LAST_UPDATED_BY_USER || params.data?.lastRegUser;
      },
    },
    {
      field: "creator",
      headerName: "생성자",
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.CREATED_BY_USER || params.data?.creator;
      },
    },
    {
      field: "createDate",
      headerName: "생성일자",
      width: 130,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        const creationDate = params.data?.CREATION_DATE;
        if (creationDate && creationDate.length >= 8) {
          return `${creationDate.substring(0, 4)}-${creationDate.substring(
            4,
            6
          )}-${creationDate.substring(6, 8)}`;
        }
        return params.data?.createDate || "";
      },
    },
  ];

  // getRowStyle 제거: AG Grid의 기본 선택 스타일(.ag-row-selected) 사용
  // 필요시 CSS에서 .ag-row-selected { background-color: #e6f7ff; } 로 처리

  return (
    <RightGridStyles className={className}>
      <AppPageModal {...mtClosModal.modalProps} />
      <AppPageModal {...yyCyfdModal.modalProps} />
      <div className="data-grid-panel">
        <FormAgGrid<RightGridData & { id?: string }>
          rowData={gridRowData}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName="마감태그관리_오른쪽"
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
            // getRowId 설정: row id 매칭 안정화 (LeftGrid와 동일)
            getRowId: (params) => {
              if (params.data?.id) {
                return String(params.data.id);
              }
              // id가 없는 경우 fallback: mth와 저장된 인덱스 조합
              const data = params.data as RightGridData & {
                _rowIndex?: number;
              };
              return `row-right-${data?.mth ?? "unknown"}-${
                data?._rowIndex ?? "unknown"
              }`;
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false, // 행 클릭으로 선택 가능하도록 변경
            singleClickEdit: false,
            onGridReady: handleGridReady,
            onCellValueChanged: handleCellValueChanged,
            // getRowStyle 제거: AG Grid의 기본 선택 스타일(.ag-row-selected) 사용
          }}
          toolbarButtons={{
            showDelete: false,
            showCopy: false,
            showAdd: false,
            enableExcelDownload: true,
            showSave: true,
          }}
          onSave={handleSave}
          customButtons={[
            <FormButton
              key="search"
              size="small"
              className="data-grid-panel__button data-grid-panel__button--search"
              onClick={() => {
                // 선택된 LeftGrid 행에서 연도와 월 추출
                const year = selectedLeftRow?.closingYearMonth?.substring(0, 4);
                const month = selectedLeftRow?.closingYearMonth?.substring(
                  4,
                  6
                );

                mtClosModal.openModal({
                  initialYear: year,
                  initialMonth: month,
                });
              }}
            >
              월마감
            </FormButton>,
            <FormButton
              key="custom1"
              size="small"
              className="data-grid-panel__button data-grid-panel__button--search"
              onClick={() => {
                yyCyfdModal.openModal({});
              }}
            >
              연이월
            </FormButton>,
          ]}
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;
