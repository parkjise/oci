import React, { useRef, useCallback, useMemo } from "react";
import { message } from "antd";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  CellStyle,
  CellDoubleClickedEvent,
} from "ag-grid-community";
import { formatNumber, createCheckboxColumn } from "@utils/agGridUtils";
import { FormAgGrid } from "@components/ui/form";

import { useSlipPostStore } from "@store/slipPostStore";
import type { SlipPostSearchResponse } from "@/types/fcm/gl/slip/slipPost.types";

type DetailGridProps = {
  className?: string;
  rowData?: SlipPostSearchResponse[];
};

type SlipDataWithStatus = SlipPostSearchResponse & {
  rowStatus?: "C" | "U" | "D";
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  const { searchData, setGridApi, save } = useSlipPostStore();
  const gridRef = useRef<GridApi | null>(null);

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData가 없거나 빈 배열이면 빈 배열 반환 (조회 결과 없음)
  // rowData를 id 필드와 함께 매핑 (useMemo로 최적화)
  const rowData = useMemo(() => {
    const rawRowData = propRowData || searchData || [];
    return rawRowData.map((item) => ({
      ...item,
      id: item.slpHeaderId ?? undefined,
    }));
  }, [propRowData, searchData]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setGridApi(params.api);
    },
    [setGridApi]
  );

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    // 선택된 행 가져오기
    const selectedRows =
      gridRef.current.getSelectedRows() as SlipPostSearchResponse[];

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    // store의 save 함수 호출 (내부에서 refresh도 처리됨)
    await save(selectedRows);
  }, [save]);

  // 원천Key 더블클릭 핸들러
  const handleSourceKeyDoubleClick = useCallback(
    (
      slipExptnSrc: string,
      sourceKey: string,
      rowData: SlipPostSearchResponse
    ) => {
      // TODO: 화면 이동 로직 구현 예정
      // slipExptnSrc에 따라 다른 화면으로 이동
      // 예시:
      // - P01: 지결결의 화면
      // - P02: 지급처리 화면
      // - R01: 매출입력 화면
      // - R02: 매출수금(수금등록) 화면
      // - T51~T55: 받을어음 화면
      // - F01~F99: 고정자산 화면
      // - I52: 입고전표 화면
      // - T01: 자금전표 화면

      if (!slipExptnSrc || !sourceKey) {
        alert("slipExptnSrc 또는 sourceKey가 없습니다.");
        return;
      }

      const alertMessage = `원천Key 더블클릭\n\nslipExptnSrc: ${slipExptnSrc}\nsourceKey: ${sourceKey}\n전표ID: ${
        rowData.slpHeaderId || "없음"
      }\n\n화면 이동 로직은 추후 구현 예정입니다.`;
      alert(alertMessage);

      // 화면 이동 로직은 추후 구현
      // switch (slipExptnSrc) {
      //   case "P01":
      //     // 지결결의 화면 이동
      //     break;
      //   case "P02":
      //     // 지급처리 화면 이동
      //     break;
      //   case "R01":
      //     // 매출입력 화면 이동
      //     break;
      //   case "R02":
      //     // 매출수금 화면 이동
      //     break;
      //   // ... 기타 케이스들
      //   default:
      //     alert("해당하는 화면이 없습니다.");
      // }
    },
    []
  );

  // 전표일자/번호 더블클릭 핸들러
  const handleSlipDateOrNoDoubleClick = useCallback(
    (rowData: SlipPostSearchResponse) => {
      // 전표일자나 번호가 비어있으면 return
      if (!rowData.bltDateAckSlp || !rowData.serAckSlp) {
        alert("전표일자 또는 번호가 없습니다.");
        return;
      }

      const alertMessage = `전표일자/번호 더블클릭\n\n전표일자: ${rowData.bltDateAckSlp}\n번호: ${rowData.serAckSlp}\n\nPGM_NO: '00572' 화면으로 이동 로직은 추후 구현 예정입니다.`;
      alert(alertMessage);

      // TODO: 화면 이동 로직 구현 예정
      // PGM_NO: '00572' 화면으로 이동
      // paramObj: 행의 전체 데이터 (rowData)
      // option: { openAction: "existWindow" }

      // 예시:
      // const menuInfo = getMenuInfoByPgmNo('00572');
      // const paramObj = rowData; // 행의 전체 데이터
      // const option = { openAction: "existWindow" };
      // openMenu(menuInfo[0].PGM_NAME, menuInfo[0].PATH, menuInfo[0].PGM_NO, paramObj, option);
    },
    []
  );

  // 체크박스와 번호를 함께 표시하는 커스텀 렌더러
  const checkboxWithNumberRenderer = (
    params: ICellRendererParams<SlipDataWithStatus>
  ) => {
    const rowIndex = params.node?.rowIndex ?? 0;
    const rowNumber = rowIndex + 1;
    const isSelected = params.node?.isSelected() ?? false;
    const isSelectable = params.data?.magamTag !== "Y"; // magamTag가 "Y"가 아니면 선택 가능

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (params.node && isSelectable && params.api) {
        const newSelectedState = e.target.checked;
        params.node.setSelected(newSelectedState);
        // 선택 상태 변경 후 즉시 셀 리프레시
        setTimeout(() => {
          params.api?.refreshCells({
            rowNodes: [params.node!],
            columns: ["rowNum"],
            force: true,
          });
        }, 0);
      }
    };

    return React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          height: "100%",
          paddingLeft: "4px",
        },
      },
      [
        React.createElement("input", {
          key: "checkbox",
          type: "checkbox",
          checked: isSelected,
          disabled: !isSelectable,
          onChange: handleCheckboxChange,
          onClick: (e: React.MouseEvent<HTMLInputElement>) => {
            e.stopPropagation();
          },
          style: {
            cursor: isSelectable ? "pointer" : "not-allowed",
            margin: 0,
            opacity: isSelectable ? 1 : 0.5,
          },
        }),
        React.createElement(
          "span",
          {
            key: "number",
            style: { userSelect: "none" },
          },
          rowNumber
        ),
      ]
    );
  };

  // 컬럼 정의 (useMemo로 최적화 - 참조 동일성 유지)
  const columnDefs: ColDef<SlipDataWithStatus>[] = useMemo(
    () =>
      [
        {
          ...createCheckboxColumn<SlipDataWithStatus>(
            "rowNum",
            "No.",
            80,
            "left"
          ),
          checkboxSelection: false, // 기본 체크박스 비활성화하고 커스텀 렌더러 사용
          cellRenderer: checkboxWithNumberRenderer,
          sortable: false,
          filter: false,
          resizable: false,
        },
        {
          field: "blk",
          headerName: "승인자",
          width: 110,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "magamTag",
          headerName: "전기",
          width: 90,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          cellRenderer: (params: {
            value: string | null | undefined;
            data?: SlipPostSearchResponse;
          }) => {
            // exptnTgt이 "Y"이면 체크박스 체크 및 활성화
            const checked = params.data?.exptnTgt === "Y";
            const isEnabled = params.data?.exptnTgt === "Y";
            return React.createElement("input", {
              type: "checkbox",
              checked: checked,
              disabled: !isEnabled,
              style: {
                cursor: isEnabled ? "pointer" : "not-allowed",
                opacity: isEnabled ? 1 : 0.5,
                transform: "scale(1.2)",
              },
            });
          },
        },
        {
          field: "bltDateAckSlp",
          headerName: "전표일자",
          width: 130,
          cellStyle: {
            textAlign: "center",
            color: "#c90000",
            cursor: "pointer",
            fontWeight: "bold",
          },
          headerClass: "ag-header-cell-center",
          cellRenderer: (params: { value: string | null | undefined }) => {
            if (!params.value) return "";
            // YYYYMMDD 형식을 YYYY.MM.DD로 변환
            const dateStr = params.value.toString();
            if (dateStr.length === 8) {
              return `${dateStr.substring(0, 4)}.${dateStr.substring(
                4,
                6
              )}.${dateStr.substring(6, 8)}`;
            }
            return params.value;
          },
          onCellDoubleClicked: (
            params: CellDoubleClickedEvent<SlipDataWithStatus>
          ) => {
            if (!params.data) return;
            const rowData = params.data as SlipPostSearchResponse;
            handleSlipDateOrNoDoubleClick(rowData);
          },
        },
        {
          field: "serAckSlp",
          headerName: "번호",
          width: 100,
          cellStyle: {
            textAlign: "center",
            color: "#c90000",
            cursor: "pointer",
            fontWeight: "bold",
          },
          headerClass: "ag-header-cell-center",
          onCellDoubleClicked: (
            params: CellDoubleClickedEvent<SlipDataWithStatus>
          ) => {
            if (!params.data) return;
            const rowData = params.data as SlipPostSearchResponse;
            handleSlipDateOrNoDoubleClick(rowData);
          },
        },
        {
          field: "slipTypeName",
          headerName: "이체원천",
          width: 110,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "slipExptnSrcNme",
          headerName: "이체원천분류",
          width: 160,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "cbname",
          headerName: "작성자",
          width: 110,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "description",
          headerName: "적요",
          width: 350,
          cellStyle: { textAlign: "left" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "custname",
          headerName: "대표거래처",
          width: 250,
          cellStyle: { textAlign: "left" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "makeDept",
          headerName: "작성부서",
          width: 89,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "mkDeptName",
          headerName: "작성부서명",
          width: 110,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "sumTotAmt",
          headerName: "금액",
          width: 126,
          cellStyle: { textAlign: "right" },
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "sourceTableName",
          headerName: "원천테이블",
          width: 120,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "sourceKey",
          headerName: "원천Key명",
          width: 158,
          cellStyle: {
            textAlign: "left",
            color: "#000080",
            cursor: "pointer",
            fontWeight: "bold",
          },
          headerClass: "ag-header-cell-center",
          onCellDoubleClicked: (params) => {
            if (!params.data) return;

            const rowData = params.data as SlipPostSearchResponse;
            const slipExptnSrc = rowData.slipExptnSrc || "";
            const sourceKey = rowData.sourceKey || "";

            // 원천Key 더블클릭 이벤트 핸들러
            handleSourceKeyDoubleClick(slipExptnSrc, sourceKey, rowData);
          },
        },
        {
          field: "slpHeaderId",
          headerName: "전표ID",
          width: 88,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "magamTag",
          headerName: "현재 GL Closed 여부",
          width: 169,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
          cellRenderer: (params: { value: string | null | undefined }) => {
            if (params.value === "Y") return "Y";
            if (params.value === "N") return "N";
            return params.value || "";
          },
        },
        {
          field: "reference2",
          headerName: "전기일자",
          width: 94,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
          cellRenderer: (params: { value: string | null | undefined }) => {
            if (!params.value) return "";
            return params.value;
          },
        },
        {
          field: "reference4",
          headerName: "전기취소일자",
          width: 118,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "reverse",
          headerName: "Reverse",
          width: 200,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "appStatusName",
          headerName: "전자결재",
          width: 95,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
      ] as ColDef<SlipDataWithStatus>[],
    [handleSlipDateOrNoDoubleClick, handleSourceKeyDoubleClick]
  );

  return (
    <div className="data-grid-panel">
      {/* 그리드 */}
      <FormAgGrid<SlipDataWithStatus & { id?: string }>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height={600}
        excelFileName="전기 전표" // 엑셀 다운로드 파일명
        idField="slpHeaderId"
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
        gridOptions={useMemo(
          () => ({
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
            // isRowSelectable 제거 - 모든 행에 체크박스 표시하되 비활성화 처리
            onSelectionChanged: (params) => {
              // 선택 상태 변경 시 체크박스 컬럼 리프레시
              if (params.api) {
                params.api.refreshCells({
                  columns: ["rowNum"],
                  force: true,
                });
              }
            },
            onGridReady: handleGridReady,
            // gridApi가 변경되면 store에 동기화
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
          }),
          [handleGridReady, setGridApi]
        )}
        toolbarButtons={{
          showDelete: false,
          showCopy: false,
          showAdd: false,
          enableExcelDownload: true,
          showSave: true,
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default DetailGrid;
