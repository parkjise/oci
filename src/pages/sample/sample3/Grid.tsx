import React, { useState } from "react";
import { Tooltip } from "antd";
import {
  createCheckboxColumn,
  createStatusRenderer,
  createDateColumn,
} from "@utils/agGridUtils";
import { FormAgGrid, FormButton } from "@/components/ui/form";
import { createComboBoxColumn } from "@components/ui/form/AgGrid/columns";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";

interface UserData {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  joinDate: string;
}

const Grid: React.FC = () => {
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

  const columnDefs: ExtendedColDef<UserData>[] = [
    {
      filter: false,
      ...createCheckboxColumn<UserData & Record<string, unknown>>("ID", "id", {
        width: 80,
        pinned: "left",
        rowSelection: true,
        headerCheckboxSelection: true,
        filter: false,
      }),
      excludeFromExcel: true,
    } as ExtendedColDef<UserData>,
    {
      field: "name",
      headerName: "이름",
      width: 120,
      filter: false,
    },
    {
      field: "email",
      headerName: "이메일",
      width: 200,
      filter: false,
    },
    {
      ...createComboBoxColumn<UserData>(
        "department",
        "부서",
        {
          comCodeParams: {
            module: "SYS",
            type: "DEPT", // 부서 공통코드 타입 (실제 공통코드에 맞게 수정 필요)
            enabledFlag: "Y",
          },
        },
        120
      ),
      filter: false,
    },
    {
      field: "position",
      headerName: "직책",
      width: 150,
      filter: false,
      editable: true,
    },
    {
      filter: false,
      ...createComboBoxColumn<UserData>(
        "status",
        "상태",
        {
          comCodeParams: {
            module: "SYS",
            type: "STATUS", // 상태 공통코드 타입 (실제 공통코드에 맞게 수정 필요)
            enabledFlag: "Y",
          },
        },
        100
      ),
      cellRenderer: createStatusRenderer("green", "red", "활성"),
    },
    { filter: false, ...createDateColumn<UserData>("joinDate", "입사일", 120) },
  ];

  return (
    <DataGridStyles className="data-grid-panel">
      <div className="data-grid-panel__toolbar">
        <div className="data-grid-panel-left">
          <div className="data-grid-panel__count">
            전체{" "}
            <span className="data-grid-panel__count-number">
              {rowData.length}
            </span>{" "}
            건
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
              icon={
                <i className="ri-more-2-line data-grid-panel__icon--small" />
              }
              size="small"
              className="data-grid-panel__button  data-grid-panel__button--more ghost"
            />
          </Tooltip>
        </div>
        <div className="data-grid-panel-right">
          <Tooltip title="행추가">
            <FormButton
              icon={<i className="ri-file-add-line data-grid-panel__icon" />}
              className="data-grid-panel__button  data-grid-panel__button--add-row ghost"
            />
          </Tooltip>
          <Tooltip title="행복사">
            <FormButton
              icon={<i className="ri-file-copy-line data-grid-panel__icon" />}
              className="data-grid-panel__button data-grid-panel__button--copy-row ghost"
            />
          </Tooltip>
          <Tooltip title="행삭제">
            <FormButton
              icon={<i className="ri-delete-bin-line data-grid-panel__icon" />}
              className="data-grid-panel__button data-grid-panel__button--delete-row ghost"
            />
          </Tooltip>
          <div className="data-grid-panel__divider"></div>
          <Tooltip title="엑셀다운로드">
            <FormButton
              icon={<i className="ri-download-line data-grid-panel__icon" />}
              className="data-grid-panel__button  data-grid-panel__button--excel-download ghost"
            />
          </Tooltip>
          <Tooltip title="엑셀업로드">
            <FormButton
              icon={<i className="ri-upload-line data-grid-panel__icon" />}
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
      <FormAgGrid<UserData>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        // height={400}
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

export default Grid;
