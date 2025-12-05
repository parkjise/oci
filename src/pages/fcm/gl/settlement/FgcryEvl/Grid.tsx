import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import type { ColDef } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import { FormButton } from "@components/ui/form";
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
  createDisabled?: boolean; // Create 버튼 비활성화 여부
};

const Sample3: React.FC<GridProps> = ({ 
  rowData: propRowData = [], 
  onCreate, 
  onDelete,
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

  // 그리드 준비 완료 이벤트

  return (
    <DataGridStyles className="data-grid-panel">
      <div className="data-grid-panel__toolbar">
        <div className="data-grid-panel-left">
          <div className="data-grid-panel__count">
            전체 <span className="data-grid-panel__count-number">{rowData.length}</span> 건
          </div>
          <div className="data-grid-panel__divider"></div>
          <FormButton
            size="small"
            className="data-grid-panel__button data-grid-panel__button--search"
            onClick={onCreate}
            disabled={createDisabled} // 비활성화 prop 추가
          >
            Create
          </FormButton>
          <FormButton
            size="small"
            className="data-grid-panel__button data-grid-panel__button--search"
            onClick={onDelete}
          >
            Delete
          </FormButton>
          <FormButton
            size="small"
            className="data-grid-panel__button data-grid-panel__button--search"
          >
            Reverse
          </FormButton>
{/*           <Tooltip title="더보기">
            <FormButton
              icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
              size="small"
              className="data-grid-panel__button  data-grid-panel__button--more ghost"
            />
          </Tooltip> */}
        </div>
        <div className="data-grid-panel-right">
          {/* <Tooltip title="행추가">
            <FormButton
              icon={<i className="ri-file-add-line" style={{ fontSize: 20 }} />}
              className="data-grid-panel__button  data-grid-panel__button--add-row ghost"
            />
          </Tooltip>
          <Tooltip title="행복사">
            <FormButton
              icon={
                <i className="ri-file-copy-line" style={{ fontSize: 20 }} />
              }
              className="data-grid-panel__button data-grid-panel__button--copy-row ghost"
            />
          </Tooltip>
          <Tooltip title="행삭제">
            <FormButton
              icon={
                <i className="ri-delete-bin-line" style={{ fontSize: 20 }} />
              }
              className="data-grid-panel__button data-grid-panel__button--delete-row ghost"
            />
          </Tooltip> */}
          <div className="data-grid-panel__divider"></div>
          <Tooltip title="엑셀다운로드">
            <FormButton
              icon={<i className="ri-download-line" style={{ fontSize: 20 }} />}
              className="data-grid-panel__button  data-grid-panel__button--excel-download ghost"
            />
          </Tooltip>
          <Tooltip title="엑셀업로드">
            <FormButton
              icon={<i className="ri-upload-line" style={{ fontSize: 20 }} />}
              className="data-grid-panel__button  data-grid-panel__button--excel-upload ghost"
            />
          </Tooltip>
          <div className="data-grid-panel__divider"></div>
          <FormButton
            size="small"
            type="primary"
            className="data-grid-panel__button data-grid-panel__button--save navy"
          >
            저장
          </FormButton>
        </div>
      </div>
      {/* 그리드 */}
      <FormAgGrid<UserData>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height={400}
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
    </DataGridStyles>
  );
};

export default Sample3;
