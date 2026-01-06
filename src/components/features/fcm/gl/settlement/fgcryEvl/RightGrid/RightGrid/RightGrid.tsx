import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { RightGridStyles } from "./RightGrid.styles";
import { message } from "antd";
import type { FgcryEvlDetailListResponse } from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { useFgcryEvlStore } from "@/store/fcm/gl/settlement/FgcryEvlStore";

// 초기 데이터 (빈 배열)
const initialRightGridData: FgcryEvlDetailListResponse[] = [];

type RightGridProps = {
  className?: string;
  rowData?: FgcryEvlDetailListResponse[];
};

const RightGrid: React.FC<RightGridProps> = ({
  className,
  rowData: propRowData,
}) => {
  // store에서 detailData 구독 추가
  const { detailData, setDetailGridApi } = useFgcryEvlStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 detailData 사용
  // detailData를 dependency에 추가하여 store 업데이트 시 자동 반영
  const rowData = useMemo<(FgcryEvlDetailListResponse & { id?: string })[]>(() => {
    const rawRowData = propRowData || detailData || initialRightGridData;
    return rawRowData.map((item, index) => ({
      ...item,
      id: item.invoiceId ?? undefined,
      _rowIndex: index, // fallback용 인덱스 저장
    }));
  }, [propRowData, detailData]); // detailData를 dependency에 추가

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setDetailGridApi(params.api); // store에 detailGridApi 저장
    },
    [setDetailGridApi]
  );

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    // 선택된 행 가져오기
    const selectedRows =
      gridRef.current.getSelectedRows() as FgcryEvlDetailListResponse[];

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    // TODO: store의 save 함수 호출 (현재는 메시지만 표시)
    console.log("저장할 데이터:", selectedRows);
    message.success(`${selectedRows.length}건의 항목이 저장되었습니다.`);
  }, []);

  // 컬럼 정의 - 타입을 FormAgGrid와 일치시킴
  const columnDefs: ColDef<FgcryEvlDetailListResponse & { id?: string }>[] = useMemo(
    () => [
      {
        headerName: "No.",
        width: 80,
        pinned: "left",
        checkboxSelection: false,
        headerCheckboxSelection: false,
        valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
      },
      {
        field: "invoiceNumber",
        headerName: "Invoice No.",
        width: 200,
        filter: "agTextColumnFilter",
      },
      {
        field: "currency",
        headerName: "통화",
        width: 100,
        filter: "agSetColumnFilter",
        editable: true,
      },
      {
        field: "accCde",
        headerName: "계정코드",
        width: 150,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "accName",
        headerName: "계정명",
        width: 250,
        filter: "agSetColumnFilter",
        editable: true,
      },
      {
        field: "accMgmtNbr1",
        headerName: "관리번호1",
        width: 120,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "accMgmtNbr1Name",
        headerName: "관리번호1명",
        width: 150,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "accMgmtNbr2",
        headerName: "관리번호2",
        width: 120,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "exchangeRate",
        headerName: "환율",
        width: 120,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "occurAmtFr",
        headerName: "외화금액",
        width: 120,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "occurAmt",
        headerName: "원화금액",
        width: 120,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "evaluExRate",
        headerName: "평가환율",
        width: 120,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "exchangeAmt",
        headerName: "환산금액",
        width: 120,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "gainLossAmt",
        headerName: "환산평가손익",
        width: 150,
        filter: "agNumberColumnFilter",
        editable: true,
      },
      {
        field: "dvs",
        headerName: "사업부",
        width: 120,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "slpHeaderId",
        headerName: "전표헤더ID",
        width: 150,
        filter: "agTextColumnFilter",
        editable: true,
      },
      {
        field: "slipNo",
        headerName: "전표번호",
        width: 120,
        filter: "agTextColumnFilter",
        editable: true,
      },
    ],
    []
  );

  return (
    <RightGridStyles className={className}>
      <div className="data-grid-panel">
        {/* 그리드 */}
        <FormAgGrid<FgcryEvlDetailListResponse & { id?: string }>
          rowData={rowData}
          headerHeight={32}
          columnDefs={columnDefs}
          height={600}
          excelFileName="외화평가_상세"
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
            // getRowId 설정: row id 매칭 안정화
            getRowId: (params) => {
              if (params.data?.id) {
                return String(params.data.id);
              }
              // id가 없는 경우 fallback:invoiceId, 인덱스 조합
              const data = params.data as FgcryEvlDetailListResponse & {
                _rowIndex?: number;
              };
              return `row-right-${data?.invoiceId ?? "unknown"}-${
                data?._rowIndex ?? "unknown"
              }`;
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
            showSave: false,
            showExcelUpload: false,
            showExcelDownload: true
          }}
          onSave={handleSave}
        />
      </div>
    </RightGridStyles>
  );
};

export default RightGrid;
