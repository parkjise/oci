import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { DetailGridStyles } from "./DetailGrid.styles";  
import { showError, showSuccess } from "@components/ui/feedback/Message";
import { parseExcelFile } from "@utils/excelUtils";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import type { SlipRegistDetailResponse } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";

// 필수 표시가 있는 헤더 컴포넌트
// const RequiredHeader: React.FC<IHeaderParams> = (params) => {
//   const displayName = params.displayName || "";
//   return (
//     <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
//       <span style={{ color: "#ff4d4f", marginRight: "4px" }}>*</span>
//       <span>{displayName}</span>
//     </div>
//   );
// };

type DetailGridProps = {
  className?: string;
};

const DetailGrid: React.FC<DetailGridProps> = ({ className }) => {
  const {
    slipDetails: detailData,
    setSlipDetails: onDetailChange,
    editingSlipId,
    selectedSlipId,
    isNewSlip,
    slipHeader,
  } = useSlipRegist();
  
  // 편집 모드 여부 결정 - isNewSlip이 true이면 무조건 편집 모드
  const isEditMode = isNewSlip || (editingSlipId !== null && editingSlipId === selectedSlipId);
  const description = slipHeader?.description || "";
  
  // props로 받은 데이터 사용
  const [rowData, setRowData] = useState<SlipRegistDetailResponse[]>(detailData);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const onDetailChangeRef = useRef(onDetailChange);
  const skipNextEffectRef = useRef(false);

  // onDetailChange 최신 참조 유지
  useEffect(() => {
    onDetailChangeRef.current = onDetailChange;
  }, [onDetailChange]);

  // detailData가 변경되면 rowData 업데이트 (외부에서 온 경우만)
  useEffect(() => {
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }
    setRowData(detailData);
  }, [detailData]);

  // rowData 변경 시 부모에게 알림
  const notifyDataChange = useCallback((data: SlipRegistDetailResponse[]) => {
    if (onDetailChangeRef.current) {
      skipNextEffectRef.current = true;
      onDetailChangeRef.current(data);
    }
  }, []);

  // 컬럼 정의
  const columnDefs: ColDef<SlipRegistDetailResponse>[] = [
    {
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      resizable: false,
      suppressHeaderMenuButton: true,
      pinned: "left",
      editable: false,
    },
    { 
      field: "seqAckSlp", 
      headerName: "번호", 
      width: 80, 
      editable: false 
    },
    { 
      field: "accCode", 
      headerName: "계정", 
      width: 150, 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "accName", 
      headerName: "계정명", 
      width: 300, 
      editable: true 
    },
    { 
      field: "curr", 
      headerName: "화폐", 
      width: 100, 
      editable: true, 
      headerClass: "required-header"
    },
    { 
      field: "exchgRateType", 
      headerName: "환율타입", 
      width: 120, 
      editable: true, 
      headerClass: "required-header",
      valueGetter: (params) => {
        // exchgRateType 또는 exRateType 필드에서 값 가져오기
        return params.data?.exchgRateType || (params.data as any)?.exRateType || "";
      },
      valueSetter: (params) => {
        // 값 설정 시 exchgRateType에 저장
        if (params.data) {
          params.data.exchgRateType = params.newValue || "";
          // exRateType도 함께 업데이트 (백엔드 호환성)
          (params.data as any).exRateType = params.newValue || "";
        }
        return true;
      },
    },
    { 
      field: "exchgRate", 
      headerName: "환율", 
      width: 140, 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "", 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "drAmt", 
      headerName: "차변금액", 
      width: 180, 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "0", 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "crAmt", 
      headerName: "대변금액", 
      width: 180, 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "0", 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "drRelAmt", 
      headerName: "차변금액(환산)", 
      width: 180, 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "0", 
      editable: true 
    },
    { 
      field: "crRelAmt", 
      headerName: "대변금액(환산)", 
      width: 180, 
      valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "0", 
      editable: true 
    },
    { 
      field: "rem", 
      headerName: "적요", 
      flex: 1,
      minWidth: 250,
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "pssnDept", 
      headerName: "부서", 
      width: 150, 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "deptName", 
      headerName: "부서명", 
      width: 220, 
      editable: true 
    },
    { 
      field: "accMgmtNbr3", 
      headerName: "거래처", 
      width: 150, 
      editable: true, 
      headerClass: "required-header" 
    },
    { 
      field: "custname", 
      headerName: "거래처명", 
      width: 300, 
      editable: true, 
    },
    { 
      field: "accMgmtNbr1Nme", 
      headerName: "관리(1)명", 
      width: 180, 
      editable: true 
    },
    { 
      field: "accMgmtNbr2Nme", 
      headerName: "관리(2)명", 
      width: 180, 
      editable: true 
    },
    { 
      field: "projectCode", 
      headerName: "프로젝트", 
      width: 150, 
      editable: true 
    },
    { 
      field: "projectName", 
      headerName: "프로젝트명", 
      width: 220, 
      editable: true 
    },
    { 
      field: "itemCode", 
      headerName: "품목코드", 
      width: 150, 
      editable: true 
    },
    { 
      field: "itemName", 
      headerName: "품목명", 
      width: 220, 
      editable: true 
    },
    { 
      field: "channel1", 
      headerName: "Channel1", 
      width: 120, 
      editable: true 
    },
    { 
      field: "channel2", 
      headerName: "Channel2", 
      width: 120, 
      editable: true 
    },
    { 
      field: "channel3", 
      headerName: "Channel3", 
      width: 120, 
      editable: true 
    },
  ];

  // 그리드 준비 완료 이벤트
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // 행추가
  const handleAddRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 신규, 수정 버튼을 클릭해주세요.");
      return;
    }

    // 대표적요 필수값 체크
    if (!description || description.trim() === "") {
      showError("대표적요를 입력하세요!");
      return;
    }

    // 현재 최대 seqAckSlp 번호 찾기
    const maxSeq = rowData.length > 0 
      ? Math.max(...rowData.map(row => Number(row.seqAckSlp) || 0))
      : 0;
    
    const newRow: SlipRegistDetailResponse = {
      seqAckSlp: String(maxSeq + 1),
      accCode: "",
      accName: "",
      curr: "KRW",
      exchgRateType: "",
      exchgRate: "1",
      drAmt: "0",
      crAmt: "0",
      drRelAmt: "0",
      crRelAmt: "0",
      rem: description || "",
      pssnDept: "",
      deptName: "",
      accMgmtNbr3: "",
      custname: "",
    };
    
    const newGridData = [...rowData, newRow];
    setRowData(newGridData);
    
    // 그리드에 새 행 추가
    if (currentApi) {
      currentApi.applyTransaction({ add: [newRow] });
    }
    
    notifyDataChange(newGridData);
  }, [gridApi, isEditMode, description, rowData, notifyDataChange]);

  // 행복사
  const handleCopyRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 신규, 수정 버튼을 클릭해주세요.");
      return;
    }

    if (!currentApi) return;
    const selectedRows = currentApi.getSelectedRows();
    if (selectedRows.length === 0) {
      showError("복사할 행을 선택해주세요.");
      return;
    }

    // 현재 최대 seqAckSlp 번호 찾기
    const maxSeq = rowData.length > 0 
      ? Math.max(...rowData.map(row => Number(row.seqAckSlp) || 0))
      : 0;

    const newRows = selectedRows.map((row, index) => ({
      ...row,
      seqAckSlp: String(maxSeq + index + 1),
    }));

    const newGridData = [...rowData, ...newRows];
    setRowData(newGridData);
    
    // 그리드에 새 행 추가
    currentApi.applyTransaction({ add: newRows });
    
    notifyDataChange(newGridData);
  }, [gridApi, isEditMode, rowData, notifyDataChange]);

  // 행삭제
  const handleDeleteRow = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 신규, 수정 버튼을 클릭해주세요.");
      return;
    }

    if (!currentApi) return;
    const selectedRows = currentApi.getSelectedRows();
    if (selectedRows.length === 0) {
      showError("삭제할 행을 선택해주세요.");
      return;
    }

    const selectedSeqs = selectedRows.map(row => row.seqAckSlp);
    const newGridData = rowData.filter(row => !selectedSeqs.includes(row.seqAckSlp));

    // Re-sequence
    const reSequencedData = newGridData.map((row, index) => ({
      ...row,
      seqAckSlp: String(index + 1)
    }));

    setRowData(reSequencedData);
    
    // 그리드에서 행 제거 및 seqAckSlp 업데이트
    currentApi.applyTransaction({ remove: selectedRows });
    // 모든 노드의 seqAckSlp 번호 업데이트
    currentApi.forEachNode((node, index) => {
      if (node.data) {
        node.setData({ ...node.data, seqAckSlp: String(index + 1) });
      }
    });
    
    notifyDataChange(reSequencedData);
  }, [gridApi, isEditMode, rowData, notifyDataChange]);

  // 엑셀 다운로드
  const handleExcelDownload = useCallback((api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!currentApi) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    if (rowData.length === 0) {
      showError("다운로드할 데이터가 없습니다.");
      return;
    }

    try {
      currentApi.exportDataAsExcel({
        fileName: `전표상세_${new Date().getTime()}.xlsx`,
      });
      showSuccess("엑셀 파일이 다운로드되었습니다.");
    } catch (error) {
      showError("엑셀 다운로드 중 오류가 발생했습니다.");
      if (import.meta.env.DEV) {
        console.error("Excel download error:", error);
      }
    }
  }, [gridApi, rowData]);

  // 엑셀 업로드
  const handleExcelUpload = useCallback(async (file: File, api?: GridApi | null) => {
    const currentApi = api || gridApi;
    
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 신규, 수정 버튼을 클릭해주세요.");
      return false;
    }

    // 대표적요 필수값 체크
    if (!description || description.trim() === "") {
      showError("대표적요를 입력하세요!");
      return false;
    }

    try {
      // 컬럼 매핑 설정 (헤더명 -> 필드명)
      const columnMapping: Record<string, string> = {};
      columnDefs.forEach((col) => {
        if (col.field && col.headerName) {
          columnMapping[col.field] = col.headerName;
        }
      });

      // 엑셀 파일 파싱
      const uploadedData = await parseExcelFile<Partial<SlipRegistDetailResponse>>(file, {
        hasHeader: true,
        columnMapping: Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
        filterEmptyRows: true,
        validator: (row) => {
          // 최소한 계정코드나 적요가 있어야 유효한 행으로 간주
          return !!(row.accCode || row.rem);
        },
      });

      if (uploadedData.length === 0) {
        showError("업로드할 유효한 데이터가 없습니다.");
        return false;
      }

      // 현재 최대 seqAckSlp 번호 찾기
      const maxSeq = rowData.length > 0 
        ? Math.max(...rowData.map(row => Number(row.seqAckSlp) || 0))
        : 0;

      // 업로드된 데이터를 그리드 형식에 맞게 변환
      const newRows: SlipRegistDetailResponse[] = uploadedData.map((row, index) => {
        const seqAckSlp = String(maxSeq + index + 1);
        
        return {
          seqAckSlp,
          accCode: String(row.accCode || ""),
          accName: String(row.accName || ""),
          curr: String(row.curr || "KRW"),
          exchgRateType: String(row.exchgRateType || ""),
          exchgRate: String(row.exchgRate || "1"),
          drAmt: String(row.drAmt || "0"),
          crAmt: String(row.crAmt || "0"),
          drRelAmt: String(row.drRelAmt || "0"),
          crRelAmt: String(row.crRelAmt || "0"),
          rem: String(row.rem || description || ""),
          pssnDept: String(row.pssnDept || ""),
          deptName: String(row.deptName || ""),
          accMgmtNbr3: String(row.accMgmtNbr3 || ""),
          custname: String(row.custname || ""),
          accMgmtNbr1Nme: String(row.accMgmtNbr1Nme || ""),
          accMgmtNbr2Nme: String(row.accMgmtNbr2Nme || ""),
          projectCode: String(row.projectCode || ""),
          projectName: String(row.projectName || ""),
          itemCode: String(row.itemCode || ""),
          itemName: String(row.itemName || ""),
          channel1: String(row.channel1 || ""),
          channel2: String(row.channel2 || ""),
          channel3: String(row.channel3 || ""),
        };
      });

      // 그리드에 새 행 추가
      const newGridData = [...rowData, ...newRows];
      setRowData(newGridData);
      
      if (currentApi) {
        currentApi.applyTransaction({ add: newRows });
      }
      
      notifyDataChange(newGridData);
      showSuccess(`${uploadedData.length}건의 데이터가 업로드되었습니다.`);
      
      return false; // 파일 업로드 후 자동 업로드 방지
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "엑셀 업로드 중 오류가 발생했습니다."
      );
      if (import.meta.env.DEV) {
        console.error("Excel upload error:", error);
      }
      return false;
    }
  }, [gridApi, isEditMode, description, rowData, columnDefs, notifyDataChange]);

  return (
    <DetailGridStyles className={className}>
      
      {/* 그리드 */}
      <FormAgGrid<SlipRegistDetailResponse & { id?: string | number }>
        rowData={rowData as (SlipRegistDetailResponse & { id?: string | number })[]}
        headerHeight={32}
        columnDefs={columnDefs}
        height={400}
        idField="seqAckSlp"
        showToolbar={true}
        onGridReady={onGridReady}
        toolbarButtons={{
          showDelete: true,
          showCopy: true,
          showAdd: true,
          enableExcelDownload: true,
          enableExcelUpload: true,
          showSave: false,
        }}
        excelFileName="전표상세"
        onAddRow={handleAddRow}
        onCopyRow={handleCopyRow}
        onDeleteRow={handleDeleteRow}
        onExcelDownload={handleExcelDownload}
        onExcelUpload={handleExcelUpload}
        gridOptions={{
          rowSelection: "multiple",
          animateRows: true,
          pagination: false,
          paginationPageSize: 10,
          rowHeight: 32,
          paginationPageSizeSelector: [10, 20, 50, 100],
          suppressRowClickSelection: true,
          onCellValueChanged: (params) => {
            if (!params.data || !params.colDef.field) return;

            const field = params.colDef.field;
            const rowData = params.data as SlipRegistDetailResponse;
            
            const currency = rowData.curr || "KRW";
            const exchangeRate = Number(rowData.exchgRate) || 1;
            const debitAmount = Number(rowData.drAmt) || 0;
            const creditAmount = Number(rowData.crAmt) || 0;

            // drAmt 또는 crAmt 변경 시 drCrType 및 occurAmt 자동 업데이트
            if (field === "drAmt" || field === "crAmt") {
              const newDrAmt = field === "drAmt" ? Number(params.newValue) || 0 : debitAmount;
              const newCrAmt = field === "crAmt" ? Number(params.newValue) || 0 : creditAmount;
              rowData.drCrType = newDrAmt > 0 ? "D" : (newCrAmt > 0 ? "C" : "");
              // occurAmt 업데이트: 차변금액이 있으면 차변금액, 대변금액이 있으면 대변금액, 둘 다 없으면 0
              rowData.occurAmt = newDrAmt > 0 ? String(newDrAmt) : (newCrAmt > 0 ? String(newCrAmt) : "0");
              // occurAmtFr도 함께 업데이트 (없는 경우에만)
              if (!rowData.occurAmtFr || rowData.occurAmtFr === "0") {
                rowData.occurAmtFr = rowData.occurAmt;
              }
            }

            // 원화인 경우 환산금액을 입력금액과 동일하게 설정
            if (currency === "KRW") {
              if (field === "drAmt") {
                rowData.drRelAmt = String(debitAmount);
                // 그리드 새로고침
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["drRelAmt"],
                  force: true 
                });
              } else if (field === "crAmt") {
                rowData.crRelAmt = String(creditAmount);
                // 그리드 새로고침
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["crRelAmt"],
                  force: true 
                });
              } else if (field === "curr" && params.newValue === "KRW") {
                // 화폐를 원화로 변경한 경우
                rowData.drRelAmt = String(debitAmount);
                rowData.crRelAmt = String(creditAmount);
                rowData.exchgRate = "1";
                // 그리드 새로고침
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["drRelAmt", "crRelAmt", "exchgRate"],
                  force: true 
                });
              }
            } else {
              // 원화가 아닌 경우 환율에 따라 환산금액 계산
              if (field === "drAmt" || field === "exchgRate") {
                const calculatedAmount = debitAmount * exchangeRate;
                rowData.drRelAmt = String(calculatedAmount);
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["drRelAmt"],
                  force: true 
                });
              }
              if (field === "crAmt" || field === "exchgRate") {
                const calculatedAmount = creditAmount * exchangeRate;
                rowData.crRelAmt = String(calculatedAmount);
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["crRelAmt"],
                  force: true 
                });
              }
              if (field === "curr") {
                // 화폐가 변경된 경우 환산금액 재계산
                rowData.drRelAmt = String(debitAmount * exchangeRate);
                rowData.crRelAmt = String(creditAmount * exchangeRate);
                params.api.refreshCells({ 
                  rowNodes: [params.node!], 
                  columns: ["drRelAmt", "crRelAmt"],
                  force: true 
                });
              }
            }

            // 현재 그리드 데이터를 가져와서 부모에게 알림
            if (gridApi) {
              const allRowData: SlipRegistDetailResponse[] = [];
              gridApi.forEachNode((node) => {
                if (node.data) {
                  allRowData.push(node.data);
                }
              });
              setRowData(allRowData);
              notifyDataChange(allRowData);
            }

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
      />
    </DetailGridStyles>
  );
};

export default DetailGrid;
