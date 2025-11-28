import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ColDef, GridReadyEvent, GridApi, IHeaderParams, ICellRendererParams } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { FormButton } from "@components/ui/form";
import { DetailGridStyles } from "./DetailGrid.styles";
import { showError } from "@components/ui/feedback/Message";

import type { SlipDetail } from "../mockData";

// 필수 표시가 있는 헤더 컴포넌트
const RequiredHeader: React.FC<IHeaderParams> = (params) => {
  const displayName = params.displayName || "";
  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
      <span style={{ color: "#ff4d4f", marginRight: "4px" }}>*</span>
      <span>{displayName}</span>
    </div>
  );
};

// 상태 컬럼 렌더러 (편집 모드일 때 아이콘 표시)
const StatusCellRenderer: React.FC<ICellRendererParams<SlipDetail> & { isEditMode: boolean }> = ({ value, isEditMode }) => {
  const status = value || "";
  
  if (!isEditMode) {
    // 편집 모드가 아닐 때 I, U 텍스트는 표시하지 않음
    if (status === "I" || status === "U") {
      return <span></span>;
    }
    return <span>{status || ""}</span>;
  }

  // 편집 모드일 때 I (추가), U (수정) 상태일 때만 아이콘 표시
  let icon = null;
  let backgroundColor = "";
  let iconColor = "";
  let iconClass = "";
  let tooltip = "";

  switch (status) {
    case "I": // Insert (추가)
      iconClass = "ri-add-circle-fill";
      backgroundColor = "#e6f7ff";
      iconColor = "#1890ff";
      tooltip = "추가";
      break;
    case "U": // Update (수정)
      iconClass = "ri-edit-circle-fill";
      backgroundColor = "#f6ffed";
      iconColor = "#52c41a";
      tooltip = "수정";
      break;
    default:
      // D (삭제) 또는 기타 상태는 텍스트로 표시
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <span>{status || ""}</span>
        </div>
      );
  }

  icon = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: backgroundColor,
        transition: "all 0.2s ease",
      }}
      title={tooltip}
    >
      <i 
        className={iconClass} 
        style={{ 
          color: iconColor, 
          fontSize: "14px",
          lineHeight: "1",
        }} 
      />
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      {icon}
    </div>
  );
};

type DetailGridProps = {
  className?: string;
  rowData: SlipDetail[];
  description?: string;
  isEditMode?: boolean;
  onModify?: (modified: boolean) => void;
  onDataChange?: (data: SlipDetail[]) => void;
};

const DetailGrid: React.FC<DetailGridProps> = ({ className, rowData, description, isEditMode = false, onModify, onDataChange }) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<SlipDetail[]>([]);
  const onDataChangeRef = useRef(onDataChange);
  const skipNextEffectRef = useRef(false);
  const isInternalUpdateRef = useRef(false);

  // onDataChange 최신 참조 유지
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // rowData가 변경될 때만 gridData 업데이트 (외부에서 온 경우만)
  useEffect(() => {
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }

    // 배열의 길이와 내용을 비교하여 실제로 변경되었을 때만 업데이트
    setGridData((prevGridData) => {
      const isEqual = 
        rowData.length === prevGridData.length &&
        rowData.every((item, index) => {
          const existing = prevGridData[index];
          return existing && 
                 existing.seq === item.seq &&
                 existing.accountCode === item.accountCode &&
                 existing.debitAmount === item.debitAmount &&
                 existing.creditAmount === item.creditAmount;
        });
      
      return isEqual ? prevGridData : rowData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]); // gridData를 dependency에서 제거하여 무한 루프 방지

  const columnDefs: ColDef<SlipDetail>[] = useMemo(() => [
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
      field: "status", 
      headerName: "상태", 
      width: 80, 
      editable: false,
      cellRenderer: (params: ICellRendererParams<SlipDetail>) => (
        <StatusCellRenderer {...params} isEditMode={isEditMode} />
      ),
    },
    { field: "seq", headerName: "번호", width: 60, editable: false },
    { field: "accountCode", headerName: "계정", width: 100, editable: true, headerComponent: RequiredHeader },
    { field: "accountName", headerName: "계정명", width: 150, editable: true },
    { field: "currency", headerName: "화폐", width: 80, editable: true, headerComponent: RequiredHeader },
    { field: "exchangeRateType", headerName: "환율타입", width: 100, editable: true, headerComponent: RequiredHeader },
    { field: "exchangeRate", headerName: "환율", width: 80, valueFormatter: (params) => params.value ? params.value.toLocaleString() : "", editable: true, headerComponent: RequiredHeader },
    { field: "debitAmount", headerName: "차변금액", width: 120, valueFormatter: (params) => params.value ? params.value.toLocaleString() : "0", editable: true, headerComponent: RequiredHeader },
    { field: "creditAmount", headerName: "대변금액", width: 120, valueFormatter: (params) => params.value ? params.value.toLocaleString() : "0", editable: true, headerComponent: RequiredHeader },
    { field: "debitAmountConverted", headerName: "차변금액(환산)", width: 120, valueFormatter: (params) => params.value ? params.value.toLocaleString() : "0", editable: true },
    { field: "creditAmountConverted", headerName: "대변금액(환산)", width: 120, valueFormatter: (params) => params.value ? params.value.toLocaleString() : "0", editable: true },
    { field: "description", headerName: "적요", width: 200, editable: true, headerComponent: RequiredHeader },
    { field: "dept", headerName: "부서", width: 100, editable: true, headerComponent: RequiredHeader },
    { field: "deptName", headerName: "부서명", width: 150, editable: true },
    { field: "partner", headerName: "거래처", width: 100, editable: true, headerComponent: RequiredHeader },
    { field: "partnerName", headerName: "거래처명", width: 150, editable: true },
    { field: "manage1Name", headerName: "관리(1)명", width: 100, editable: true },
    { field: "manage2Name", headerName: "관리(2)명", width: 100, editable: true },
    { field: "trialBizArea", headerName: "시산사업장", width: 100, editable: true },
    { field: "bizArea", headerName: "사업장", width: 100, editable: true },
    { field: "processCode", headerName: "공정코드", width: 100, editable: true },
    { field: "processName", headerName: "공정명", width: 150, editable: true },
    { field: "itemGroup", headerName: "품목군", width: 100, editable: true },
    { field: "itemGroupName", headerName: "품목군명", width: 150, editable: true },
    { field: "itemCode", headerName: "품목코드", width: 100, editable: true },
    { field: "itemName", headerName: "품목명", width: 150, editable: true },
    { field: "project", headerName: "프로젝트", width: 100, editable: true },
    { field: "projectName", headerName: "프로젝트명", width: 150, editable: true },
    { field: "subModuleSource", headerName: "서브모듈원천", width: 120, editable: true },
    { field: "subModuleKey", headerName: "서브모튤KEY", width: 120, editable: true },
    { field: "apVat", headerName: "AP부가세", width: 100, editable: true },
    { field: "detail", headerName: "상세", width: 80, editable: true },
    { field: "paymentTarget", headerName: "지급대상", width: 100, editable: true },
    { field: "channel1", headerName: "Channel1", width: 100, editable: true },
    { field: "channel2", headerName: "Channel2", width: 100, editable: true },
    { field: "channel3", headerName: "Channel3", width: 100, editable: true },
    { field: "itemType", headerName: "품목구분", width: 100, editable: true },
    { field: "itemLargeClass", headerName: "품목대분류", width: 100, editable: true },
    { field: "itemMiddleClass", headerName: "품목중분류", width: 100, editable: true },
    { field: "itemSmallClass", headerName: "품목소분류", width: 100, editable: true },
    { field: "fixedAsset", headerName: "고정자산", width: 100, editable: true },
    { field: "regFix", headerName: "Reg Fix", width: 100, editable: true },
  ], [isEditMode]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // gridData 변경 시 부모에게 알림 (useRef를 통해 최신 함수 호출)
  const notifyDataChange = useCallback((data: SlipDetail[]) => {
    if (onDataChangeRef.current) {
      isInternalUpdateRef.current = true;
      skipNextEffectRef.current = true;
      onDataChangeRef.current(data);
      isInternalUpdateRef.current = false;
    }
  }, []);

  const handleAddRow = () => {
    // 편집 모드 체크
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 입력, 수정 버튼을 클릭해주세요.");
      return;
    }

    // 대표적요 필수값 체크
    if (!description || description.trim() === "") {
      showError("대표적요를 입력하세요!");
      return;
    }

    // 현재 최대 seq 번호 찾기
    const maxSeq = gridData.length > 0 
      ? Math.max(...gridData.map(row => row.seq || 0))
      : 0;
    
    const newRow: SlipDetail = {
      status: "I",
      seq: maxSeq + 1,
      accountCode: "",
      accountName: "",
      currency: "KRW",
      exchangeRateType: "",
      exchangeRate: 1,
      debitAmount: 0,
      creditAmount: 0,
      debitAmountConverted: 0,
      creditAmountConverted: 0,
      description: description || "",
    };
    const newGridData = [...gridData, newRow];
    setGridData(newGridData);
    
    // 그리드에 새 행 추가
    if (gridApi) {
      gridApi.applyTransaction({ add: [newRow] });
    }
    
    notifyDataChange(newGridData);
    if (onModify) onModify(true);
  };

  const handleCopyRow = () => {
    // 편집 모드 체크
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 입력, 수정 버튼을 클릭해주세요.");
      return;
    }

    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    // 현재 최대 seq 번호 찾기
    const maxSeq = gridData.length > 0 
      ? Math.max(...gridData.map(row => row.seq || 0))
      : 0;

    const newRows = selectedRows.map((row, index) => ({
      ...row,
      status: "I",
      seq: maxSeq + index + 1,
    }));

    const newGridData = [...gridData, ...newRows];
    setGridData(newGridData);
    
    // 그리드에 새 행 추가
    if (gridApi) {
      gridApi.applyTransaction({ add: newRows });
    }
    
    notifyDataChange(newGridData);
    if (onModify) onModify(true);
  };

  const handleDeleteRow = () => {
    // 편집 모드 체크
    if (!isEditMode) {
      showError("편집 모드에서만 사용할 수 있습니다. 입력, 수정 버튼을 클릭해주세요.");
      return;
    }

    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    const selectedSeqs = selectedRows.map(row => row.seq);
    const newGridData = gridData.filter(row => !selectedSeqs.includes(row.seq));

    // Re-sequence
    const reSequencedData = newGridData.map((row, index) => ({
      ...row,
      seq: index + 1
    }));

    setGridData(reSequencedData);
    
    // 그리드에서 행 제거 및 seq 업데이트
    if (gridApi) {
      gridApi.applyTransaction({ remove: selectedRows });
      // 모든 노드의 seq 번호 업데이트
      gridApi.forEachNode((node, index) => {
        if (node.data) {
          node.setData({ ...node.data, seq: index + 1 });
        }
      });
    }
    
    notifyDataChange(reSequencedData);
    if (onModify) onModify(true);
  };

  return (
    <DetailGridStyles className={className}>
      <div className="detail-grid__header">
        <div className="detail-grid__actions">
          <FormButton icon={<i className="ri-add-line" />} size="small" onClick={handleAddRow} />
          <FormButton icon={<i className="ri-file-copy-line" />} size="small" onClick={handleCopyRow} />
          <FormButton icon={<i className="ri-delete-bin-line" />} size="small" onClick={handleDeleteRow} />
          <div className="divider" />
          <FormButton icon={<i className="ri-download-line" />} size="small" />
          <FormButton icon={<i className="ri-upload-line" />} size="small" />
        </div>
      </div>
      <div className="detail-grid__content">
        <AgGrid<SlipDetail & { id?: number }>
          rowData={gridData as (SlipDetail & { id?: number })[]}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          idField="seq"
          headerHeight={32}
          rowHeight={32}
          defaultColDef={{
            sortable: false,
            filter: false,
            suppressHeaderMenuButton: true,
            resizable: true,
            editable: true,
          }}
          gridOptions={{
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            pagination: false,
            onCellValueChanged: (params) => {
              if (!params.data || !params.colDef.field) return;

              const field = params.colDef.field;
              const rowData = params.data as SlipDetail;
              
              // status 필드가 아닌 다른 필드가 변경된 경우, 기존 행이면 status를 "U"로 설정
              if (field !== "status" && rowData.status !== "I") {
                // 새로 추가된 행("I")이 아닌 경우에만 "U"로 설정
                const currentStatus = rowData.status || "";
                // status가 "I"가 아니고, 빈 문자열이거나 다른 상태인 경우 "U"로 변경
                if (currentStatus !== "I") {
                  rowData.status = "U";
                  // status 컬럼도 새로고침하여 아이콘이 즉시 업데이트되도록 함
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["status"],
                    force: true 
                  });
                }
              }
              
              const currency = rowData.currency || "KRW";
              const exchangeRate = rowData.exchangeRate || 1;

              // 원화인 경우 환산금액을 입력금액과 동일하게 설정
              if (currency === "KRW") {
                if (field === "debitAmount") {
                  rowData.debitAmountConverted = rowData.debitAmount || 0;
                  // 그리드 새로고침
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["debitAmountConverted"],
                    force: true 
                  });
                } else if (field === "creditAmount") {
                  rowData.creditAmountConverted = rowData.creditAmount || 0;
                  // 그리드 새로고침
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["creditAmountConverted"],
                    force: true 
                  });
                } else if (field === "currency" && params.newValue === "KRW") {
                  // 화폐를 원화로 변경한 경우
                  rowData.debitAmountConverted = rowData.debitAmount || 0;
                  rowData.creditAmountConverted = rowData.creditAmount || 0;
                  rowData.exchangeRate = 1;
                  // 그리드 새로고침
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["debitAmountConverted", "creditAmountConverted", "exchangeRate"],
                    force: true 
                  });
                }
              } else {
                // 원화가 아닌 경우 환율에 따라 환산금액 계산
                if (field === "debitAmount" || field === "exchangeRate") {
                  rowData.debitAmountConverted = (rowData.debitAmount || 0) * exchangeRate;
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["debitAmountConverted"],
                    force: true 
                  });
                }
                if (field === "creditAmount" || field === "exchangeRate") {
                  rowData.creditAmountConverted = (rowData.creditAmount || 0) * exchangeRate;
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["creditAmountConverted"],
                    force: true 
                  });
                }
                if (field === "currency") {
                  // 화폐가 변경된 경우 환산금액 재계산
                  rowData.debitAmountConverted = (rowData.debitAmount || 0) * exchangeRate;
                  rowData.creditAmountConverted = (rowData.creditAmount || 0) * exchangeRate;
                  params.api.refreshCells({ 
                    rowNodes: [params.node!], 
                    columns: ["debitAmountConverted", "creditAmountConverted"],
                    force: true 
                  });
                }
              }

              // 현재 그리드 데이터를 가져와서 부모에게 알림
              if (gridApi) {
                const allRowData: SlipDetail[] = [];
                gridApi.forEachNode((node) => {
                  if (node.data) {
                    allRowData.push(node.data);
                  }
                });
                setGridData(allRowData);
                notifyDataChange(allRowData);
                // 셀 값이 변경되었을 때 onModify 호출하여 변경 사항 알림
                if (onModify) {
                  onModify(true);
                }
              }
            },
          }}
        />
      </div>
    </DetailGridStyles>
  );
};

export default DetailGrid;
