import React, { useRef, useCallback, useMemo, useEffect } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { createStatusRenderer } from "@utils/agGridUtils";
import { FormAgGrid } from "@components/ui/form";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import type { RightGridData } from "@/types/fcm/gl/closing/closTagManage.types";
import { formatDateTime } from "@utils/dateUtils";
import { useRightGridLogic } from "./useRightGridLogic";
import { useTranslation } from "react-i18next";

type RightGridProps = {
  className?: string;
};

const RightGrid: React.FC<RightGridProps> = () => {
  const { t } = useTranslation();
  const gridRef = useRef<GridApi | null>(null);
  const rightGridData = useClosTagManageStore((state) => state.rightGridData);
  const setRightGridApi = useClosTagManageStore(
    (state) => state.setRightGridApi
  );
  const selectedLeftRow = useClosTagManageStore(
    (state) => state.selectedLeftRow
  );

  // 비즈니스 로직 Hook 사용
  const { handleCellValueChanged } = useRightGridLogic();

  // 그리드 데이터를 useMemo로 관리 (store와 분리하여 편집 중 리렌더링 방지)
  // 조회 완료 시점에만 갱신되도록 rightGridData 전체를 의존성으로 설정
  // 편집 중에는 store가 업데이트되지 않으므로 리렌더링이 발생하지 않음
  const gridRowData = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log("RightGrid gridRowData 업데이트:", rightGridData);
    }
    return rightGridData.map((item, index) => ({
      ...item,
      id:
        item.id ??
        `${item.YEAR || ""}-${item.mth || ""}-${
          item.SUB_MODULE || ""
        }-${index}`, // id 정규화
      _rowIndex: index, // fallback용 인덱스 저장 (LeftGrid와 동일)
    }));
  }, [rightGridData]); // rightGridData가 변경될 때만 갱신 (조회 완료 시)

  // selectedLeftRow가 변경될 때만 그리드 데이터를 새로 설정
  // rightGridData 변경 시에는 setGridOption을 호출하지 않아야 node.data의 변경사항이 유지됨
  const prevSelectedLeftRowRef = useRef(selectedLeftRow);
  useEffect(() => {
    // selectedLeftRow가 변경된 경우에만 그리드 데이터를 새로 설정
    const selectedLeftRowChanged =
      prevSelectedLeftRowRef.current?.closingYearMonth !==
      selectedLeftRow?.closingYearMonth;
    prevSelectedLeftRowRef.current = selectedLeftRow;

    if (gridRef.current && selectedLeftRowChanged) {
      if (import.meta.env.DEV) {
        console.log("RightGrid 데이터 업데이트 - 그리드 새로고침:", {
          gridRowDataLength: gridRowData.length,
          rightGridDataLength: rightGridData.length,
          selectedLeftRow: selectedLeftRow?.closingYearMonth,
        });
      }
      // 그리드에 데이터 설정 (selectedLeftRow 변경 시에만)
      gridRef.current.setGridOption("rowData", gridRowData);
    }
  }, [gridRowData, selectedLeftRow]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setRightGridApi(params.api);
    },
    [setRightGridApi]
  );

  // 셀 값 변경 핸들러와 저장 핸들러는 useRightGridLogic Hook에서 가져옴
  // (비즈니스 로직 분리를 위해 Hook으로 이동)

  // 컬럼 정의
  const columnDefs: ColDef<RightGridData>[] = useMemo(() => [
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
      field: "moduleType",
      headerName: t("모듈구분"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.SUB_MODULE || params.data?.moduleType;
      },
    },
    {
      field: "closingStatus",
      headerName: t("마감상태"),
      width: 120,
      headerClass: "ag-header-cell-center",
      cellStyle: { textAlign: "center" },
      editable: () => {
        return selectedLeftRow?.tag !== "Y"; // LeftGrid가 "Y" (Close)면 편집 불가
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
      headerName: t("최종등록자"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.LAST_UPDATED_BY_USER || params.data?.lastRegUser;
      },
    },
    {
      field: "creator",
      headerName: t("생성자"),
      width: 120,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        return params.data?.CREATED_BY_USER || params.data?.creator;
      },
    },
    {
      field: "createDate",
      headerName: t("생성일자"),
      width: 180,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-cell-center",
      valueGetter: (params) => {
        const creationDate =
          params.data?.CREATION_DATE || params.data?.createDate;
        return formatDateTime(creationDate);
      },
    },
  ], [t, selectedLeftRow]);

  // getRowStyle 제거: AG Grid의 기본 선택 스타일(.ag-row-selected) 사용
  // 필요시 CSS에서 .ag-row-selected { background-color: #e6f7ff; } 로 처리

  return (
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
        showExcelUpload: false,
        showSave: false,
      }}
    />
  );
};

export default RightGrid;
