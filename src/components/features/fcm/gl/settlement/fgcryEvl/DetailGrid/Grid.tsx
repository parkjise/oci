import React, { useState } from "react";
import { Tag, Tooltip } from "antd";
import type { ColDef } from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import { FormButton } from "@components/ui/form";
// 그리드 데이터 타입 정의
interface UserData {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  joinDate: string;
}

const Sample3: React.FC = () => {
  // 샘플 데이터
  const [rowData] = useState<UserData[]>([
    {
      id: 1,
      name: "홍길동",
      email: "hong@example.com",
      department: "개발팀",
      position: "시니어 개발자",
      status: "활성",
      joinDate: "2020-01-15",
    },
    {
      id: 2,
      name: "김철수",
      email: "kim@example.com",
      department: "디자인팀",
      position: "UI/UX 디자이너",
      status: "활성",
      joinDate: "2021-03-20",
    },
    {
      id: 3,
      name: "이영희",
      email: "lee@example.com",
      department: "개발팀",
      position: "주니어 개발자",
      status: "활성",
      joinDate: "2022-06-10",
    },
    {
      id: 4,
      name: "박민수",
      email: "park@example.com",
      department: "기획팀",
      position: "프로덕트 매니저",
      status: "비활성",
      joinDate: "2019-11-05",
    },
    {
      id: 5,
      name: "정수진",
      email: "jung@example.com",
      department: "개발팀",
      position: "테크리드",
      status: "활성",
      joinDate: "2018-09-12",
    },
    {
      id: 6,
      name: "최동욱",
      email: "choi@example.com",
      department: "디자인팀",
      position: "시니어 디자이너",
      status: "활성",
      joinDate: "2020-07-22",
    },
    {
      id: 7,
      name: "강미영",
      email: "kang@example.com",
      department: "기획팀",
      position: "비즈니스 분석가",
      status: "활성",
      joinDate: "2021-12-01",
    },
    {
      id: 8,
      name: "윤태호",
      email: "yoon@example.com",
      department: "개발팀",
      position: "주니어 개발자",
      status: "활성",
      joinDate: "2023-02-14",
    },
  ]);

  // 컬럼 정의
  const columnDefs: ColDef<UserData>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      pinned: "left",
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      field: "name",
      headerName: "이름",
      width: 120,
      filter: "agTextColumnFilter",
    },
    {
      field: "email",
      headerName: "이메일",
      width: 200,
      filter: "agTextColumnFilter",
    },
    {
      field: "department",
      headerName: "부서",
      width: 120,
      filter: "agSetColumnFilter",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["개발팀", "디자인팀", "기획팀", "마케팅팀"],
      },
      editable: true,
    },
    {
      field: "position",
      headerName: "직책",
      width: 150,
      filter: "agTextColumnFilter",
      editable: true,
    },
    {
      field: "status",
      headerName: "상태",
      width: 100,
      filter: "agSetColumnFilter",
      cellRenderer: (params: { value: string }) => {
        const color = params.value === "활성" ? "green" : "red";
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {params.value}
          </Tag>
        );
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["활성", "비활성"],
      },
      editable: true,
    },
    {
      field: "joinDate",
      headerName: "입사일",
      width: 120,
      filter: "agDateColumnFilter",
      cellEditor: "agDateCellEditor",
      editable: true,
    },
  ];

  // 그리드 준비 완료 이벤트

  return (
    <DataGridStyles className="data-grid-panel">
      <div className="data-grid-panel__toolbar">
        <div className="data-grid-panel-left">
          <div className="data-grid-panel__count">
            전체 <span className="data-grid-panel__count-number">5</span> 건
          </div>
          <div className="data-grid-panel__divider"></div>
          <FormButton
            size="small"
            className="data-grid-panel__button data-grid-panel__button--search"
          >
            구매요청 검색
          </FormButton>
          <FormButton
            size="small"
            className="data-grid-panel__button data-grid-panel__button--search"
          >
            Button
          </FormButton>
          <Tooltip title="더보기">
            <FormButton
              icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
              size="small"
              className="data-grid-panel__button  data-grid-panel__button--more ghost"
            />
          </Tooltip>
        </div>
        <div className="data-grid-panel-right">
          <Tooltip title="행추가">
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
          </Tooltip>
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
