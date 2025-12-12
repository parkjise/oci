import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { createTextColumn } from "@utils/agGridUtils";
import { FormAgGrid } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import type { FgcryEvlListResponse } from "@/types/fcm/gl/settlement/fgcryEvl.types";


// 초기 데이터 (빈 배열)
const initialLeftGridData: FgcryEvlListResponse[] = [];

type LeftGridProps = {
  className?: string;
  rowData?: FgcryEvlListResponse[];
};

const LeftGrid: React.FC<LeftGridProps> = ({
  className,
  rowData: propRowData,
}) => {
  // DetailGrid와 동일한 구조: useRef 사용
  const gridRef = useRef<GridApi | null>(null);

  // SlipPost 패턴: rowData를 useMemo로 최적화하고 id 필드 명시적으로 추가
  const rowData = useMemo<(FgcryEvlListResponse & { id?: string })[]>(() => {
    const rawRowData = propRowData || initialLeftGridData;
    return rawRowData.map((item, index) => ({
      ...item,
      id: item.id ? String(item.id) : String(index),
    }));
  }, [propRowData]);

  // 그리드 준비 핸들러 (DetailGrid와 동일)
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      // TODO: store가 생기면 setGridApi(params.api) 추가
    },
    []
  );

  // 컬럼 정의 (RecordList.tsx에서 가져옴)
  const columnDefs: ColDef<FgcryEvlListResponse>[] = useMemo(() => [
    {
      ...createTextColumn<FgcryEvlListResponse>("slpHeaderId", "ID", 120),
      hide: true,
      suppressHeaderMenuButton: true,
      editable: false,
      suppressColumnsToolPanel: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: "No.",
      width: 80,
      pinned: "left",
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("evalType", "구분", 100),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("slipNo", "전표번호", 200),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("revSlipNo", "Reverse 전표", 200),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("slipNoPosted", "전기여부", 100),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
  ], []);

  // handleSave 함수 정의 (onSave prop에 사용)
  const handleSave = useCallback(async () => {
    // TODO: 저장 로직 구현
  }, []);

return (
  <LeftGridStyles className={className}>
    <div className="data-grid-panel">
      {/* 그리드 */}
      <FormAgGrid<FgcryEvlListResponse & { id?: string }>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs as any}
        height={600}
        excelFileName="외화평가_목록"
        idField="id"
        showToolbar={true}
        styleOptions={{
          fontSize: "12px",
          headerFontSize: "12px",
          rowHeight: "32px",
          headerHeight: "32px",
          cellPadding: "6px",
          headerPadding: "8px",
          selectedRowBackgroundColor: "#e6f7ff", // 선택된 행 배경색
          hoverRowBackgroundColor: "#bae7ff", // hover 시 배경색
        }}
        gridOptions={{
          defaultColDef: {
            flex: undefined, // flex 제거하여 width가 적용되도록 함
          },
          rowSelection: "multiple",
          animateRows: true,
          pagination: false,
          paginationPageSize: 10,
          rowHeight: 32,
          paginationPageSizeSelector: [10, 20, 50, 100],
          suppressRowClickSelection: true,
          onSelectionChanged: (params) => {
            // 선택 상태 변경 처리
            if (import.meta.env.DEV) {
              console.log("선택 변경:", params.api.getSelectedRows());
            }
          },
          onGridReady: handleGridReady,
          // gridApi가 변경되면 store에 동기화
          onFirstDataRendered: () => {
            if (gridRef.current) {
              // TODO: store가 생기면 setGridApi(gridRef.current) 추가
            }
          },
          onCellValueChanged: (params) => {
            if (import.meta.env.DEV) {
              console.log("셀 값 변경:", {
                field: params.colDef.field,
                oldValue: params.oldValue,
                newValue: params.newValue,
                data: params.data,
              });
            }
          },
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
