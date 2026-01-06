import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, GridReadyEvent, CellStyle, ColDef } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
//import type { AdvpayCtDtaCreatSearchResponse } from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import type { AccnutMngCodeListResponse } from "@/types/fcm/md/account/AccnutMngCodeRegist.types";
import { useAccnutMngCodeRegistStore } from "@/store/fcm/md/account/AccnutMngCodeRegistStore";



type DetailGridProps = {
  className?: string;
  rowData?: AccnutMngCodeListResponse[];
};

type AccnutMngCodeListDataWithStatus = AccnutMngCodeListResponse & {
  rowStatus?: "C" | "U" | "D";
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  // store에서 searchData 구독 추가
  const { searchData, setGridApi } = useAccnutMngCodeRegistStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData가 없거나 빈 배열이면 빈 배열 반환 (조회 결과 없음)
  // rowData를 id 필드와 함께 매핑 (useMemo로 최적화)
  const rowData = useMemo(() => {
    const rowRowData = propRowData || searchData || [];
    return rowRowData.map((item) => ({
      ...item,
      id: item.code ?? undefined,
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
    setGridApi(params.api);
  }, [setGridApi]);

  const columnDefs: ColDef<AccnutMngCodeListResponse>[] = useMemo(
    () =>
      [
        {
          headerName: "No.",
          width: 60,
          pinned: "left",
          valueGetter: (params) => {
            return (params.node?.rowIndex ?? 0) + 1;
          },
          sortable: false,
          filter: false,
          flex: 0.5,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "code",
          headerName: "관리코드",
          flex: 1,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "name1",
          headerName: "관리코드약명", 
          flex: 1,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "nameDesc",
          headerName: "관리코드명",
          flex: 1,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
      ] as ColDef<AccnutMngCodeListResponse>[],
    []
  );

  return (
    <div className="data-grid-panel">
      <FormAgGrid<AccnutMngCodeListDataWithStatus & { id?: string }>
        rowData={rowData}
        columnDefs={columnDefs}
        headerHeight={32}
        height={600}
        excelFileName="회계관리코드등록"
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
        gridOptions={useMemo(
          () => ({
            defaultColDef: {
              
            },
            animateRows: true,
            pagination: false,
            rowHeight: 32,
            suppressRowClickSelection: true,
            onGridReady: handleGridReady,
          }),
          [handleGridReady]
        )}
        onGridReady={handleGridReady}
        toolbarButtons={{
          showCopy: true,
          showAdd: true,
          showDelete: true,
          showSave: true,
          showExcelUpload: false,
          enableExcelDownload: true,
        }}
      />
    </div>
  );
};

export default DetailGrid;