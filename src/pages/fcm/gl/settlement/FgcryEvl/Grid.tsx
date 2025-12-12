import React, { useState, useEffect, useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { FormAgGrid, FormButton } from "@components/ui/form";
import type { FgcryEvlDetailResponse } from "@/components/features/fcm/gl/settlement/fgcryEvl/mockData";

// 그리드 데이터 타입 정의
interface UserData {
  // 외화평가 그리드 필드 추가
  id: number;
  status: string;
  invNo: string;
  currency: string;
  account: string;
  accountName: string;
  customer: string;
  customerName: string;
  manageNo2: string;
  exchangeRate: number;
  foreignAmount: number;
  localAmount: number;
  evaluationRate: number;
  evaluationAmount: number;
  evaluationProfit: number;
  businessUnit: string;
  slipHeaderId: string;
  slipNo: string;
}

type GridProps = {
  rowData?: FgcryEvlDetailResponse[];
  onCreate?: () => void;
  onDelete?: () => void;
  onReverse?: () => void;
  onSave?: () => void;
  createDisabled?: boolean; // Create 버튼 비활성화 여부
};

const Sample3: React.FC<GridProps> = ({ 
  rowData: propRowData = [], 
  onCreate, 
  onDelete,
  onReverse,
  onSave,
  createDisabled = false 
}) => {
  // props로 받은 데이터를 상태로 관리
  const [rowData, setRowData] = useState<UserData[]>([]);

  // propRowData가 변경될 때마다 rowData 업데이트
  useEffect(() => {
    const convertedData: UserData[] = propRowData.map((item, index) => ({
      id: item.id ?? index + 1,
      status: item.status ?? "",
      invNo: item.invNo ?? "",
      currency: item.currency ?? "",
      account: item.account ?? "",
      accountName: item.accountName ?? "",
      customer: item.customer ?? "",
      customerName: item.customerName ?? "",
      manageNo2: item.manageNo2 ?? "",
      exchangeRate: item.exchangeRate ?? 0,
      foreignAmount: item.foreignAmount ?? 0,
      localAmount: item.localAmount ?? 0,
      evaluationRate: item.evaluationRate ?? 0,
      evaluationAmount: item.evaluationAmount ?? 0,
      evaluationProfit: item.evaluationProfit ?? 0,
      businessUnit: item.businessUnit ?? "",
      slipHeaderId: item.slipHeaderId ?? "",
      slipNo: item.slipNo ?? "",
    }));
    setRowData(convertedData);
  }, [propRowData]);

  // 컬럼 정의
  const columnDefs: ColDef<UserData>[] = [
    {
      // field: "rowIndex",  // 이 줄 제거
      headerName: "No.",
      width: 80,
      pinned: "left",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
    },    
    {
      field: "status",
      headerName: "상태",
      width: 80,
      pinned: "left",
      filter: "agTextColumnFilter",
    },
    {
      field: "invNo",
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
      field: "account",
      headerName: "계정",
      width: 150,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "accountName",
      headerName: "계정명",
      width: 250,
      filter: "agSetColumnFilter",
      editable: true,
    },
    {
      field: "customer",
      headerName: "거래처",
      width: 120,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "customerName",
      headerName: "거래처명",
      width: 120,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "manageNo2",
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
      field: "foreignAmount",
      headerName: "외화금액",
      width: 120,
      filter: "agNumberColumnFilter",
      editable: true,
    },
    {
      field: "localAmount",
      headerName: "원화금액",
      width: 120,
      filter: "agNumberColumnFilter",
      editable: true,
    },
    {
      field: "evaluationRate",
      headerName: "평가환율",
      width: 120,
      filter: "agNumberColumnFilter",
      editable: true,
    },
    {
      field: "evaluationAmount",
      headerName: "환산금액",
      width: 120,
      filter: "agNumberColumnFilter",
      editable: true,
    },
    {
      field: "evaluationProfit",
      headerName: "환산 평가 손익",
      width: 120,
      filter: "agNumberColumnFilter",
      editable: true,
    },
    {
      field: "businessUnit",
      headerName: "사업부",
      width: 120,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "slipHeaderId",
      headerName: "Slp Header Id",
      width: 120,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "slipNo",
      headerName: "전표번호",
      width: 120,
      filter: "agTextColumnFilter",
      editable: true,
    }
  ];

  // 커스텀 버튼들 (Create, Delete, Reverse)
  const customButtons = useMemo(() => [
    <FormButton
      key="create"
      size="small"
      onClick={onCreate}
      disabled={createDisabled}
    >
      Create
    </FormButton>,
    <FormButton
      key="delete"
      size="small"
      onClick={onDelete}
    >
      Delete
    </FormButton>,
    <FormButton
      key="reverse"
      size="small"
      onClick={onReverse}
    >
      Reverse
    </FormButton>,
  ], [onCreate, onDelete, onReverse, createDisabled]);

  return (
    <FormAgGrid<UserData>
      rowData={rowData}
      headerHeight={32}
      columnDefs={columnDefs}
      height={400}
      showToolbar={true}
      customButtons={customButtons}
      showCustomButtonsDivider={true}
      onSave={onSave ? () => onSave() : undefined}
      toolbarButtons={{
        showAdd: false,
        showCopy: false,
        showDelete: false,
        showExcelDownload: true,
        showExcelUpload: true,
        showSave: true,
      }}
      gridOptions={{
        rowSelection: "multiple",
        animateRows: true,
        pagination: false,
        paginationPageSize: 10,
        rowHeight: 32,
        paginationPageSizeSelector: [10, 20, 50, 100],
        suppressRowClickSelection: true,
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
    />
  );
};

export default Sample3;
