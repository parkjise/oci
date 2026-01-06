import React, { useRef, useCallback, useMemo } from "react";
import type { GridApi, GridReadyEvent, CellStyle, ColDef, IHeaderParams, RowClickedEvent } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { createCheckboxColumn, formatNumber } from "@utils/agGridUtils";
import { parseExcelFile } from "@utils/excelUtils";
import type { AdvpayCtDtaCreatSearchResponse } from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";
import { message, Tag, type FormInstance } from "antd";
import { FormAgGridLayoutStyles } from "@components/ui/form/AgGrid/FormAgGridLayout.style";
type DetailGridProps = {
  className?: string;
  rowData?: AdvpayCtDtaCreatSearchResponse[];
  formRef?: React.RefObject<FormInstance | null>;
};

type AdvpayCtDtaCreatDataWithStatus = AdvpayCtDtaCreatSearchResponse & {
  rowStatus?: "C" | "U" | "D";
};

const DetailGrid: React.FC<DetailGridProps> = ({
   rowData: propRowData,
   className,
   //formRef: propFormRef
  }) => {
  // store에서 필요한 값들만 selector로 가져오기
  const searchData = useAdvpayCtDtaCreatStore((state) => state.searchData);
  const setSearchData = useAdvpayCtDtaCreatStore((state) => state.setSearchData);
  const setGridApi = useAdvpayCtDtaCreatStore((state) => state.setGridApi);
  const isCall = useAdvpayCtDtaCreatStore((state) => state.isCall);
  
  const gridRef = useRef<GridApi | null>(null);
  //const internalFormRef = useRef<FormInstance | null>(null);
  
  // propFormRef가 있으면 사용, 없으면 internalFormRef 사용
  //const formRef = propFormRef || internalFormRef;

  // propRowData가 있으면 propRowData 사용, 없으면 store의 searchData 사용
  // searchData가 없거나 빈 배열이면 빈 배열 반환 (조회 결과 없음)
  // rowData를 id 필드와 함께 매핑 (useMemo로 최적화)
  const rowData = useMemo(() => {
    const rowRowData = propRowData || searchData || [];
    return rowRowData.map((item) => ({
      ...item,
      id: item.invoiceId ?? undefined,
    }));
  }, [propRowData, searchData]); // searchData를 dependency에 추가



  //그리드 준비 핸들러
  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridRef.current = params.api;
    setGridApi(params.api); // store에 gridApi 저장
  }, [setGridApi]);

  // 행 클릭 시 전체 행 선택 및 포커스 설정 핸들러
  const handleRowClicked = useCallback((params: RowClickedEvent<AdvpayCtDtaCreatDataWithStatus>) => {
    if (!gridRef.current || !params.node) return;

    const clickedNode = params.node;
    // 행 선택 (전체 행 선택)
    clickedNode.setSelected(true);
    // 행이 보이도록 스크롤
    gridRef.current.ensureNodeVisible(clickedNode, "middle");
    // 전체 행이 선택된 상태로 표시되도록 포커스 제거 (행 선택 상태만 유지)
  }, []);

  // 엑셀 업로드 핸들러
  const handleExcelUpload = useCallback(async (file: File) => {
    try {
      const uploadedData = await parseExcelFile<AdvpayCtDtaCreatSearchResponse>(file);
      if (uploadedData && uploadedData.length > 0) {
        // 업로드된 데이터를 그리드 형식에 맞게 변환
        const newRows = uploadedData.map((item) => ({
          ...item,
          id: item.invoiceId ?? undefined,
          chk: item.chk || "N",
          rowStatus: "C" as const, // 신규 상태
        }));

        // 그리드에 추가
        gridRef.current?.applyTransaction({ add: newRows });

        // store의 searchData에도 추가
        const currentData = useAdvpayCtDtaCreatStore.getState().searchData;
        const updatedData = [...currentData, ...newRows];
        setSearchData(updatedData);

        message.success(`${newRows.length}건이 업로드되었습니다.`);
      } else {
        message.warning("업로드할 데이터가 없습니다.");
      }
    } catch (e) {
      console.error("엑셀 업로드 오류:", e);
      message.error("엑셀 업로드에 실패했습니다.");
    }
    return false;
  }, [setSearchData]);

  


  // 체크박스 헤더 컴포넌트
  const CheckboxHeaderRenderer = React.memo((params: IHeaderParams) => {
    const [isChecked, setIsChecked] = React.useState(false);
    const [isIndeterminate, setIsIndeterminate] = React.useState(false);

    // 모든 행의 체크 상태 확인
    const updateHeaderCheckboxState = React.useCallback(() => {
      if (!params.api) return;

      const rowNodes: AdvpayCtDtaCreatDataWithStatus[] = [];
      params.api.forEachNode((node) => {
        if (node.data) {
          rowNodes.push(node.data);
        }
      });

      if (rowNodes.length === 0) {
        setIsChecked(false);
        setIsIndeterminate(false);
        return;
      }

      // 편집 가능한 행만 필터링 (이관여부가 Y가 아닌 행)
      const editableRows = rowNodes.filter((row) => row.modified !== "Y");
      
      if (editableRows.length === 0) {
        setIsChecked(false);
        setIsIndeterminate(false);
        return;
      }

      const checkedCount = editableRows.filter((row) => row.chk === "Y").length;
      const allChecked = checkedCount === editableRows.length;
      const someChecked = checkedCount > 0 && checkedCount < editableRows.length;

      setIsChecked(allChecked);
      setIsIndeterminate(someChecked);
    }, [params.api]);

    // 헤더 체크박스 클릭 핸들러
    const handleHeaderCheckboxChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!params.api) return;

        const checked = e.target.checked;
        const rowNodes: any[] = [];
        const isCall = useAdvpayCtDtaCreatStore.getState().isCall;
        const setSearchData = useAdvpayCtDtaCreatStore.getState().setSearchData;
        const currentData = useAdvpayCtDtaCreatStore.getState().searchData;
        
        params.api.forEachNode((node) => {
          if (node.data && node.data.modified !== "Y") {
            // 이관여부가 Y가 아닌 행만 업데이트
            const newChkValue = checked ? "Y" : "N";
            node.data.chk = newChkValue;
            
            // isCall이 "Y"일 때 CREATION_YN 설정
            // 웹스퀘어 로직: creation_yn == "N" && modified == "N"일 때만 CREATION_YN을 "Y"로 설정
            if (isCall === "Y") {
              const currentCreationYn = node.data.creationYn || "N";
              if (checked && currentCreationYn === "N" && node.data.modified !== "Y") {
                node.data.creationYn = "Y";
              } else if (!checked) {
                node.data.creationYn = "N";
              }
            }
            
            rowNodes.push(node);
          }
        });

        // 그리드 업데이트
        if (rowNodes.length > 0) {
          params.api.refreshCells({
            rowNodes: rowNodes,
            columns: ["chk"],
            force: true,
          });
          
          // searchData도 업데이트
          const updatedData = currentData.map((item) => {
            const node = rowNodes.find((n) => n.data?.invoiceLineId === item.invoiceLineId);
            if (node && node.data.modified !== "Y") {
              const newCreationYn = isCall === "Y" 
                ? (checked && (item.creationYn === "N" || !item.creationYn) ? "Y" : (checked ? item.creationYn : "N"))
                : item.creationYn;
              return {
                ...item,
                chk: checked ? "Y" : "N",
                creationYn: isCall === "Y" ? newCreationYn : item.creationYn,
              };
            }
            return item;
          });
          setSearchData(updatedData);
        }

        setIsChecked(checked);
        setIsIndeterminate(false);
      },
      [params.api]
      
    );

    // 초기 상태 설정 및 변경 감지
    React.useEffect(() => {
      updateHeaderCheckboxState();
      
      // 그리드 이벤트 리스너 등록
      const onModelUpdated = () => {
        updateHeaderCheckboxState();
      };
      
      params.api?.addEventListener("modelUpdated", onModelUpdated);
      params.api?.addEventListener("cellValueChanged", onModelUpdated);

      return () => {
        params.api?.removeEventListener("modelUpdated", onModelUpdated);
        params.api?.removeEventListener("cellValueChanged", onModelUpdated);
      };
    }, [params.api, updateHeaderCheckboxState]);

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
        <input
          type="checkbox"
          checked={isChecked}
          ref={(input) => {
            if (input) {
              input.indeterminate = isIndeterminate;
            }
          }}
          onChange={handleHeaderCheckboxChange}
          style={{
            cursor: "pointer",
            margin: 0,
            width: "16px",
            height: "16px",
          }}
        />
      </div>
    );
  });

  const columnDefs: ColDef<AdvpayCtDtaCreatDataWithStatus>[] = useMemo(
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
          resizable: false,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "rowStatus",
          headerName: "상태",
          width: 80,
          minWidth: 80,
          maxWidth: 80,
          pinned: "left",
          suppressHeaderMenuButton: true,
          suppressMenu: true,
          sortable: false,
          filter: false,
          resizable: false,
          editable: false,
          cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
            if (!params.value) return null;
            const statusMap = {
              C: { text: "추가", color: "blue" },
              U: { text: "수정", color: "orange" },
              D: { text: "삭제", color: "red" },
            };
            const statusInfo = statusMap[params.value];
            if (!statusInfo) return null;
            return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
        },        
        {
          ...createCheckboxColumn<AdvpayCtDtaCreatDataWithStatus & Record<string, unknown>>(
            "",
            "chk",
            {
              width: 50,
            }
          ),
          checkboxSelection: false, // 기본 체크박스 비활성화하고 커스텀 렌더러 사용
          headerComponent: CheckboxHeaderRenderer,
          cellRenderer: "agCheckboxCellRenderer",
          cellEditor: "agCheckboxCellEditor",
          editable: (params) => {
            return params.data?.modified !== "Y";
          },
          valueGetter: (params) => {
            if (params.data?.modified === "Y") {
              return true;
            }
            return params.data?.chk === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              if (params.data.modified === "Y") {
                message.warning("이관된 자료는 삭제 할 수 없습니다.");
                return false;
              }
              
              const newChkValue = params.newValue ? "Y" : "N";
              params.data.chk = newChkValue;
              
              // isCall이 "Y"일 때 CREATION_YN 설정
              if (isCall === "Y") {
                params.data.creationYn = newChkValue;
              }
              
              // 그리드 데이터 업데이트를 위해 searchData도 업데이트
              const currentData = useAdvpayCtDtaCreatStore.getState().searchData;
              const updatedData = currentData.map((item) => {
                if (item.invoiceLineId === params.data?.invoiceLineId) {
                  return {
                    ...item,
                    chk: newChkValue,
                    creationYn: isCall === "Y" ? newChkValue : item.creationYn,
                  };
                }
                return item;
              });
              setSearchData(updatedData);
              
              return true;
            }
            return false;
          },
          cellClass: "ag-checkbox-cell-center",
          cellStyle: (params) => {
            const baseStyle: CellStyle = {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            };
            if (params.data?.modified === "Y") {
              return {
                ...baseStyle,
                opacity: 0.6,
                cursor: "not-allowed",
              };
            }
            return baseStyle;
          },
          headerClass: "ag-header-cell-center",
        },
        {
          field: "modified",
          headerName: "이관여부",
          width: 80,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "orgId",
          headerName: "사업장ID",
          width: 100,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "invoiceLineId",
          headerName: "인보이스라인ID",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "maturDate",
          headerName: "종료일자",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "creationYn",
          headerName: "생성여부",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "oDate",
          headerName: "발생일자(표시용)",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "mkDate",
          headerName: "작성일자",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toAccount",
          headerName: "비용계정",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toAcctNme",
          headerName: "비용계정명",
          width: 150,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fromDept",
          headerName: "FROM 귀속부서",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fromDeptName",
          headerName: "FROM 귀속부서명",
          width: 180,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toDept",
          headerName: "TO 귀속부서",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "toDeptName",
          headerName: "TO 귀속부서명",
          width: 180,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "currency",
          headerName: "화폐",
          width: 80,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "occurAmt",
          headerName: "발생금액",
          width: 150,
          cellStyle: { textAlign: "right" } as CellStyle,
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "frgnCurrAmt",
          headerName: "외화금액",
          width: 150,
          cellStyle: { textAlign: "right" } as CellStyle,
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "occurDate",
          headerName: "발생일자",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "applyAmount",
          headerName: "정산금액",
          width: 150,
          cellStyle: { textAlign: "right" } as CellStyle,
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "fromAccount",
          headerName: "선급비용계정",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fromAcctNme",
          headerName: "선급비용계정명",
          width: 180,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "costCenter",
          headerName: "공정코드",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "costCenterName",
          headerName: "공정코드명",
          width: 150,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "numberTimes",
          headerName: "횟수",
          width: 80,
          cellStyle: { textAlign: "right" } as CellStyle,
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "supplier",
          headerName: "거래처코드",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "custname",
          headerName: "거래처명",
          width: 200,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "attribute1",
          headerName: "비고",
          width: 200,
          cellStyle: { textAlign: "left" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "invoiceNo",
          headerName: "지출결의번호",
          width: 150,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "seqPayCertf",
          headerName: "라인번호",
          width: 100,
          cellStyle: { textAlign: "right" } as CellStyle,
          headerClass: "ag-header-cell-center",
          valueFormatter: formatNumber,
        },
        {
          field: "invoiceId",
          headerName: "인보이스ID",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "carNum",
          headerName: "차량번호",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "attribute3",
          headerName: "월할여부",
          width: 100,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "dvs",
          headerName: "사업부",
          width: 100,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
        {
          field: "toDeptOrg",
          headerName: "TO 사업장",
          width: 120,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
          hide: true,
        },
      ] as ColDef<AdvpayCtDtaCreatDataWithStatus>[],
    []
  );

  return (
    
    <FormAgGridLayoutStyles className={className}>
        <div className="data-grid-panel">
          <FormAgGrid<AdvpayCtDtaCreatDataWithStatus & { id?: string }>
            rowData={rowData}
            columnDefs={columnDefs}
            headerHeight={32}
            // height={600}
            excelFileName="선급비용자료생성"
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
                  flex: undefined, // flex 제거하여 width가 적용되도록 함
                },
                animateRows: true,
                pagination: false,
                rowHeight: 32,
                rowSelection: "single", // 단일 행 선택 모드 활성화
                suppressRowClickSelection: true, // 체크박스 선택을 위해 true 유지
                onGridReady: handleGridReady,
                onRowClicked: handleRowClicked,
              }),
              [handleGridReady, handleRowClicked]
            )}
            onGridReady={handleGridReady}
            onExcelUpload={handleExcelUpload}
            toolbarButtons={{
              showCopy: false,
              showAdd: false,
              enableExcelDownload: true,
              enableExcelUpload: true,
              showExcelDownload: true,
              showExcelUpload: true,
              showDelete: false,
              //showSave: true
            }}
            />
        </div>
      </FormAgGridLayoutStyles>
  );
};

export default DetailGrid;