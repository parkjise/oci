import React, { useState } from "react";
import { Card, Typography, Space, Button, Tag, Row, Col } from "antd";
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-community";
import CommonAgGrid from "@components/common/form/CustomAgGrid";

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
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

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
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // 선택된 행 가져오기
  const handleGetSelectedRows = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    console.log("선택된 행:", selectedRows);
    alert(`선택된 행: ${selectedRows.length}개`);
  };

  // 모든 행 선택
  const handleSelectAll = () => {
    if (!gridApi) return;
    gridApi.selectAll();
  };

  // 선택 해제
  const handleDeselectAll = () => {
    if (!gridApi) return;
    gridApi.deselectAll();
  };

  // 필터 초기화
  const handleClearFilters = () => {
    if (!gridApi) return;
    gridApi.setFilterModel(null);
  };

  // 활성 상태인 사용자만 필터링
  const handleFilterActive = () => {
    if (!gridApi) return;
    gridApi.setFilterModel({
      status: {
        type: "equals",
        filter: "활성",
      },
    });
  };

  return (
    <>
      <div>
        <Button onClick={handleSelectAll}>전체 선택</Button>
        <Button onClick={handleDeselectAll}>선택 해제</Button>
        <Button onClick={handleClearFilters}>필터 초기화</Button>
        <Button onClick={handleFilterActive}>활성 사용자만 보기</Button>
      </div>
      {/* 그리드 */}
      <CommonAgGrid<UserData>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height="100%"
        onGridReady={onGridReady}
        gridOptions={{
          rowSelection: "multiple",
          animateRows: true,
          pagination: false,
          paginationPageSize: 10,
          rowHeight: 32,
          paginationPageSizeSelector: [10, 20, 50, 100],
          suppressRowClickSelection: true,
          onCellValueChanged: (params) => {
            console.log("셀 값 변경:", {
              field: params.colDef.field,
              oldValue: params.oldValue,
              newValue: params.newValue,
              data: params.data,
            });
          },
        }}
      />
    </>
  );
};

export default Sample3;
