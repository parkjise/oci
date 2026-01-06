import React, { useRef, useCallback, useMemo, useEffect } from "react";
import type { GridApi, ColDef, GridReadyEvent, CellStyle } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { LeftGridStyles } from "./LeftGrid.styles";
import type { FgcryEvlHderListResponse } from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { useFgcryEvlStore } from "@/store/fcm/gl/settlement/FgcryEvlStore";

// 초기 데이터 (빈 배열)
const initialLeftGridData: FgcryEvlHderListResponse[] = [];

type LeftGridProps = {
  className?: string;
  rowData?: FgcryEvlHderListResponse[];
};

const LeftGrid: React.FC<LeftGridProps> = ({
  className,
  rowData: propRowData,
}) => {
  // store에서 searchData 구독 추가
  const { searchData, setGridApi, selectHeader } = useFgcryEvlStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData를 dependency에 추가하여 store 업데이트 시 자동 반영
  const rowData = useMemo<(FgcryEvlHderListResponse & { id?: string })[]>(() => {
    const rawRowData = propRowData || searchData || initialLeftGridData;
    return rawRowData.map((item, index) => ({
      ...item,
      id: item.slpHeaderId || item.frExEvalId || String(index),
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가

  // 첫 번째 행 자동 포커스 및 상세 조회 (요구사항 3)
  useEffect(() => {
    if (gridRef.current && rowData.length > 0) {
      // 그리드가 준비되고 데이터가 있을 때 첫 번째 행 선택 및 포커스
      const firstRow = rowData[0];
      
      if (firstRow) {
        // 첫 번째 행 노드 가져오기
        const firstRowNode = gridRef.current.getDisplayedRowAtIndex(0);
        
        if (firstRowNode) {
          // 첫 번째 행 선택
          firstRowNode.setSelected(true, true);
          
          // 첫 번째 행으로 스크롤
          gridRef.current.ensureIndexVisible(0, "middle");
          
          // 첫 번째 행의 상세 조회 (이미 Store의 search에서 처리되지만, 확실히 하기 위해)
          const headerId = firstRow.frExEvalId || firstRow.slpHeaderId || firstRow.slipNo;
          if (headerId) {
            // 약간의 지연을 두어 그리드 렌더링 완료 후 실행
            setTimeout(() => {
              selectHeader(headerId);
            }, 200);
          }
        }
      }
    }
  }, [rowData, selectHeader]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setGridApi(params.api); // store에 gridApi 저장
    },
    [setGridApi]
  );

  // 컬럼 정의
  const columnDefs: ColDef<FgcryEvlHderListResponse & { id?: string }>[] = useMemo(
    () => [
      {
        headerName: "No.",
        width: 60,
        pinned: "left",
        valueGetter: (params) => {
          return (params.node?.rowIndex ?? 0) + 1;
        },
        sortable: false,
        filter: false,
        resizable: false,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "evalType",
        headerName: "평가구분",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "slipNo",
        headerName: "전표번호",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "revSlipNo",
        headerName: "Reverse 전표번호",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "evaluationType",
        headerName: "평가구분코드",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "slpHeaderId",
        headerName: "전표헤더ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "revSlpHeaderId",
        headerName: "Reverse 전표헤더ID",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "stdDate",
        headerName: "기준일자",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "frExEvalId",
        headerName: "외화평가ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "slipNoPosted",
        headerName: "전표전기여부",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "revSlipNoPosted",
        headerName: "Reverse 전표전기여부",
        width: 150,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
      },
      {
        field: "createdBy",
        headerName: "생성자",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "creationDate",
        headerName: "생성일시",
        width: 160,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "lastUpdatedBy",
        headerName: "최종수정자",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일시",
        width: 160,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "programId",
        headerName: "프로그램ID",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
      {
        field: "terminalId",
        headerName: "터미널ID",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        hide: true,
      },
    ] as ColDef<FgcryEvlHderListResponse & { id?: string }>[],
    []
  );


  return (
    <LeftGridStyles className={className}>
      <div className="data-grid-panel">
        {/* 그리드 */}
        <FormAgGrid<FgcryEvlHderListResponse & { id?: string }>
          rowData={rowData}
          headerHeight={32}
          columnDefs={columnDefs}
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
            selectedRowBackgroundColor: "#e6f7ff",
            hoverRowBackgroundColor: "#bae7ff",
          }}
          gridOptions={{
            defaultColDef: {
              flex: undefined,
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: true,
            onSelectionChanged: (params) => {
              if (import.meta.env.DEV) {
                console.log("선택 변경:", params.api.getSelectedRows());
              }
            },
            onRowClicked: (params) => {
              // 행 클릭 시 상세 조회
              const rowData = params.data as FgcryEvlHderListResponse;
              const headerId = rowData.frExEvalId || rowData.slpHeaderId || rowData.slipNo;
              if (headerId) {
                selectHeader(headerId);
              }
            },
            onGridReady: handleGridReady,
            onFirstDataRendered: () => {
              if (gridRef.current) {
                setGridApi(gridRef.current);
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
            showDelete: false,
            showCopy: false,
            showAdd: false,
            enableExcelDownload: true,
            showSave: false,
            showExcelUpload: false
          }}

        />
      </div>
    </LeftGridStyles>
  );
};

export default LeftGrid;
