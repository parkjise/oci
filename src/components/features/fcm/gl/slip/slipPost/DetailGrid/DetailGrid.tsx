import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import { Checkbox } from "antd";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  CellStyle,
  CellDoubleClickedEvent,
  IRowNode,
  IHeaderParams,
} from "ag-grid-community";
import {
  createTextColumn,
  createNumberColumn,
  createCheckboxColumn,
} from "@components/ui/form/AgGrid/columns";
import { FormAgGrid } from "@components/ui/form";
import { CheckboxCellRenderer } from "@components/ui/form/AgGrid/cells/CheckboxCellRenderer";
import { showWarning, showInfo } from "@/components/ui/feedback/Message";

import { useSlipPostStore } from "@store/fcm/gl/slip/SlipPost";
import type { SlipPostSearchResponse } from "@/types/fcm/gl/slip/slipPost.types";
import { useOpenTab } from "@utils/menuTabUtils";
import { formatCurrency } from "@utils/agGridUtils";
import { useTranslation } from "react-i18next";
type DetailGridProps = {
  className?: string;
  rowData?: SlipPostSearchResponse[];
};

type SlipDataWithStatus = SlipPostSearchResponse & {
  rowStatus?: "C" | "U" | "D";
};

// =============================================================================
// [중요] 컴포넌트 및 헬퍼 함수를 DetailGrid 외부로 이동
// =============================================================================

// 1. 체크 가능 여부 판단 함수 (순수 함수)
const isValidRow = (data: SlipDataWithStatus | undefined) => {
  if (!data) return false;
  // 마감 여부 체크
  if (data.magamTag === "Y") return false;
  // 결재 상신 여부 체크
  if (data.slipExptnSrc === "M01" && data.slipType === "M") {
    if (data.cdStatus !== "2" && data.cdStatus !== "3") {
      return false;
    }
  }
  return true;
};

// 2. 커스텀 헤더 체크박스 컴포넌트
const CustomHeaderCheckbox: React.FC<IHeaderParams<SlipDataWithStatus>> = (
  props
) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const refInput = useRef<HTMLInputElement>(null);
  const api = props.api;
  const displayName = props.displayName || "No.";

  useEffect(() => {
    if (!api) return;

    const onSelectionChanged = () => {
      let validCount = 0;
      let selectedValidCount = 0;

      api.forEachNode((node) => {
        if (node.data && isValidRow(node.data)) {
          validCount++;
          if (node.isSelected()) {
            selectedValidCount++;
          }
        }
      });

      if (validCount > 0 && validCount === selectedValidCount) {
        setIsChecked(true);
        setIsIndeterminate(false);
      } else if (selectedValidCount > 0) {
        setIsChecked(false);
        setIsIndeterminate(true);
      } else {
        setIsChecked(false);
        setIsIndeterminate(false);
      }
    };

    // 초기 상태 설정 및 이벤트 구독
    onSelectionChanged();
    api.addEventListener("selectionChanged", onSelectionChanged);
    return () => {
      api.removeEventListener("selectionChanged", onSelectionChanged);
    };
  }, [api]);

  useEffect(() => {
    if (refInput.current) {
      refInput.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const onClick = useCallback(() => {
    if (!api) return;

    if (isChecked || isIndeterminate) {
      api.deselectAll();
    } else {
      const nodesToSelect: IRowNode<SlipDataWithStatus>[] = [];
      api.forEachNode((node) => {
        if (node.data && isValidRow(node.data)) {
          nodesToSelect.push(node);
        }
      });
      api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
    }
  }, [api, isChecked, isIndeterminate]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        height: "100%",
      }}
    >
      <input
        type="checkbox"
        ref={refInput}
        checked={isChecked}
        onChange={onClick}
        style={{ cursor: "pointer" }}
      />
      <span style={{ userSelect: "none" }}>{displayName}</span>
    </div>
  );
};

// 3. 체크박스 + 번호 렌더러 컴포넌트
const CheckboxWithNumberRenderer: React.FC<
  ICellRendererParams<SlipDataWithStatus>
> = (params) => {
  const rowIndex = params.node?.rowIndex ?? 0;
  const rowNumber = rowIndex + 1;
  const [isSelected, setIsSelected] = useState(
    params.node?.isSelected() ?? false
  );

  const isValid = isValidRow(params.data);

  useEffect(() => {
    const updateSelection = () =>
      setIsSelected(params.node?.isSelected() ?? false);
    updateSelection();

    if (params.api) {
      params.api.addEventListener("selectionChanged", updateSelection);
      return () =>
        params.api?.removeEventListener("selectionChanged", updateSelection);
    }
  }, [params.node, params.api]);

  const handleValueChange = useCallback(
    (checked: boolean) => {
      if (!params.node) return;

      if (!isValid) {
        if (params.data?.magamTag === "Y") {
          showWarning("월마감 처리되었습니다.");
        } else {
          showWarning("결재 상신 바랍니다.");
        }
        params.node.setSelected(false, false);
        setIsSelected(false);
        return;
      }
      params.node.setSelected(checked, false);
      setIsSelected(checked);
    },
    [params.node, params.data, isValid]
  );

  // CheckboxCellRenderer에 넘겨줄 props
  const checkboxParams = {
    ...params,
    value: isSelected,
    convertYN: false,
    editable: true, // ✅ 체크박스 활성화 (필수)
    onValueChange: handleValueChange,
  } as unknown as Parameters<typeof CheckboxCellRenderer>[0];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        height: "100%",
        paddingLeft: "0px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "auto",
        }}
      >
        <CheckboxCellRenderer {...checkboxParams} />
      </div>
      <span style={{ userSelect: "none" }}>{rowNumber}</span>
    </div>
  );
};

// =============================================================================
// [Main Component] DetailGrid
// =============================================================================
const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  const { t } = useTranslation();
  const { searchData, setGridApi } = useSlipPostStore();
  const gridRef = useRef<GridApi | null>(null);
  const { openTabByPgmNo } = useOpenTab();

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

  // as-is: 조회 완료 후 마감 데이터 비활성화 처리
  // sbm_selectDetailList_submitdone과 동일한 로직
  useEffect(() => {
    if (rowData.length > 0 && gridRef.current) {
      // MAGAM_TAG == "Y"인 행은 이미 isRowSelectable에서 선택 불가능하게 처리됨
      // 하지만 as-is와 동일하게 하기 위해 그리드 리프레시
      gridRef.current.refreshCells({
        columns: ["rowNum"],
        force: true,
      });
    }
  }, [rowData]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setGridApi(params.api);
    },
    [setGridApi]
  );

  // 원천Key 더블클릭 핸들러
  // as-is: openSubModule 함수와 동일한 로직
  const handleSourceKeyDoubleClick = useCallback(
    (
      slipExptnSrc: string,
      sourceKey: string,
      rowData: SlipPostSearchResponse
    ) => {
      if (!slipExptnSrc || !sourceKey) {
        showWarning("원천Key 정보가 없습니다.");
        return;
      }

      let paramObj: Record<string, unknown> = {};

      // as-is: slipExptnSrc에 따라 다른 화면으로 이동
      if (slipExptnSrc === "P01") {
        // 지결결의 화면 이동
        // sourceKey를 '-'로 split하여 파라미터 구성
        const keyParts = sourceKey.split("-");
        if (keyParts.length >= 3) {
          paramObj = {
            deptPayCertf: keyParts[0],
            datePayCertf: keyParts[1],
            serPayCertf: keyParts[2],
          };
          openTabByPgmNo("90602", paramObj);
        } else {
          showWarning("지결결의 정보 형식이 올바르지 않습니다.");
        }
      } else if (slipExptnSrc === "P02") {
        // 지급처리 화면 이동
        paramObj = {
          paymentId: sourceKey,
        };
        openTabByPgmNo("90629", paramObj);
      } else if (slipExptnSrc === "R01") {
        // 매출입력 화면 이동
        // 전체 rowData 전달
        paramObj = rowData as Record<string, unknown>;
        openTabByPgmNo("91553", paramObj);
      } else if (slipExptnSrc === "R02") {
        // 매출수금(수금등록) 화면 이동
        paramObj = {
          receiptDate: rowData.bltDateAckSlp || "",
          receiptNo: sourceKey,
        };
        openTabByPgmNo("90643", paramObj);
      } else if (slipExptnSrc >= "T51" && slipExptnSrc <= "T55") {
        // 받을어음 화면 이동
        // as-is에서는 미구현이지만 PGM_NO는 제공됨
        showInfo("받을어음 화면 이동 기능은 추후 구현 예정입니다.");
        // openTabByPgmNo("90715", paramObj);
      } else if (slipExptnSrc >= "F01" && slipExptnSrc <= "F99") {
        // 고정자산 화면 이동
        paramObj = {
          assetHistId: sourceKey,
        };
        openTabByPgmNo("90691", paramObj);
      } else if (slipExptnSrc === "I52") {
        // 입고전표 화면 이동
        // as-is에서는 미구현이지만 PGM_NO는 제공됨
        showInfo("입고전표 화면 이동 기능은 추후 구현 예정입니다.");
        // openTabByPgmNo("91433", paramObj);
      } else if (slipExptnSrc === "T01") {
        // 자금전표 화면 이동
        paramObj = {
          trSlpHeaderId: sourceKey,
        };
        openTabByPgmNo("91638", paramObj);
      } else {
        showWarning(`지원하지 않는 원천소스입니다: ${slipExptnSrc}`);
      }
    },
    [openTabByPgmNo]
  );

  // 전표일자/번호 더블클릭 핸들러
  const handleSlipDateOrNoDoubleClick = useCallback(
    (rowData: SlipPostSearchResponse) => {
      // 전표일자나 번호가 비어있으면 return
      if (!rowData.bltDateAckSlp || !rowData.serAckSlp) {
        showWarning("전표일자 또는 번호가 없습니다.");
        return;
      }

      // PGM_NO: '90572' 화면으로 이동
      // 행의 전체 데이터를 파라미터로 전달 (as-is와 동일하게 전체 데이터 전달)
      openTabByPgmNo("90572", rowData as Record<string, unknown>);
    },
    [openTabByPgmNo]
  );

  // 행 선택 가능 여부 결정 함수
  // 모든 행을 선택 가능하게 설정 (비활성화하지 않음)
  // 실제 검증은 isValidRow 함수와 CheckboxWithNumberRenderer에서 처리
  const isRowSelectable = useCallback(() => {
    return true; // 모든 행이 선택 가능 (체크박스는 활성화 상태)
  }, []);

  // 컬럼 정의 (useMemo로 최적화 - 참조 동일성 유지)
  const columnDefs: ColDef<SlipDataWithStatus>[] = useMemo(
    () =>
      [
        {
          ...createCheckboxColumn<SlipDataWithStatus & Record<string, unknown>>(
            "No.",
            "rowNum",
            {
              width: 80,
              pinned: "left",
              headerCheckboxSelection: false, // 기본 헤더 체크박스 제거
            }
          ),
          editable: true, // ✅ 체크박스만 편집 가능 (defaultColDef의 false를 오버라이드)
          checkboxSelection: false, // 기본 체크박스 비활성화하고 커스텀 렌더러 사용
          headerComponent: CustomHeaderCheckbox, // 외부 컴포넌트 참조
          cellRenderer: CheckboxWithNumberRenderer, // 외부 컴포넌트 참조
          sortable: false,
          filter: false,
          resizable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>("blk", t("승인자"), 110),
          editable: false,
        },
        {
          field: "exptnTgt",
          headerName: t("전기"),
          width: 90,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          editable: false,
          cellRenderer: (
            params: ICellRendererParams<SlipPostSearchResponse>
          ) => {
            // Y/N 값을 체크박스로 표시 (읽기 전용이지만 일반 색상)
            const checked = params.value === "Y" || params.value === true;
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Checkbox
                  checked={checked}
                  disabled={false} // ✅ 시각적으로는 활성화 (회색 아님)
                  style={{ pointerEvents: "none" }} // ✅ 클릭 완전 차단
                />
              </div>
            );
          },
        },
        {
          field: "bltDateAckSlp",
          headerName: t("전표일자"),
          width: 130,
          editable: false,
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
          headerName: t("번호"),
          width: 100,
          editable: false,
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
          ...createTextColumn<SlipDataWithStatus>(
            "slipTypeName",
            t("이체원천"),
            110
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "slipExptnSrcNme",
            t("이체원천분류"),
            160
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>("cbname", t("생성자"), 110),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "description",
            t("대표적요"),
            350
          ),
          bodyAlign: "left", // 바디 값 오른쪽 정렬 (간편 설정!)
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "custname",
            t("대표거래처"),
            250
          ),
          cellStyle: { textAlign: "left" },
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "makeDept",
            t("작성부서"),
            89
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "mkDeptName",
            t("작성부서명"),
            110
          ),
          editable: false,
        },
        {
          ...createNumberColumn<SlipDataWithStatus>(
            "sumTotAmt",
            t("금액"),
            126
          ),
          valueFormatter: formatCurrency,
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "sourceTableName",
            t("원천테이블"),
            120
          ),
          editable: false,
        },
        {
          field: "sourceKey",
          headerName: t("원천Key명"),
          width: 158,
          editable: false,
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
          ...createTextColumn<SlipDataWithStatus>(
            "slpHeaderId",
            t("전표ID"),
            88
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "magamTag",
            t("현재 GL Closed 여부"),
            169
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "reference2",
            t("전기일자"),
            94
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "reference4",
            t("전기취소일자"),
            118
          ),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>("reverse", "Reverse", 200),
          editable: false,
        },
        {
          ...createTextColumn<SlipDataWithStatus>(
            "appStatusName",
            t("전자결재"),
            95
          ),
          editable: false,
        },
      ] as ColDef<SlipDataWithStatus>[],
    [t, handleSlipDateOrNoDoubleClick, handleSourceKeyDoubleClick]
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
              editable: false, // ✅ 기본값: 모든 컬럼 편집 불가 (AS-IS와 동일하게 readOnly)
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: true,
            isRowSelectable: isRowSelectable, // 행 선택 가능 여부 제어
            onSelectionChanged: (params) => {
              // 커스텀 헤더 체크박스에서 이미 전체 선택/해제를 처리하므로
              // 여기서는 선택 상태 변경 시 체크박스 컬럼 리프레시만 수행 (UI 갱신용)
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
          [handleGridReady, setGridApi, isRowSelectable]
        )}
        toolbarButtons={{
          showDelete: false,
          showCopy: false,
          showAdd: false,
          enableExcelDownload: true,
          showExcelUpload: false,
          // showSave: true,
        }}
        // onSave={handleSave}
      />
    </div>
  );
};

export default DetailGrid;
