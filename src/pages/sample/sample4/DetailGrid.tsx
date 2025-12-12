import React, { useState } from "react";
import FormAgGrid, {
  type ExtendedColDef,
} from "@/components/ui/form/AgGrid/FormAgGrid";
import FormButton from "@/components/ui/form/Button/FormButton";
import { showSuccess } from "@/components/ui/feedback/Message";

// 샘플 데이터 타입 정의
interface UserData {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  joinDate: string;
  rowStatus?: "C" | "U" | "D"; // C: 생성, U: 수정, D: 삭제
}

// 샘플 데이터
const userData: UserData[] = [
  {
    id: 1,
    name: "김철수",
    email: "kim@example.com",
    department: "개발팀",
    status: "활성",
    joinDate: "2023-01-15",
  },
  {
    id: 2,
    name: "이영희",
    email: "lee@example.com",
    department: "디자인팀",
    status: "활성",
    joinDate: "2023-02-20",
  },
  {
    id: 3,
    name: "박민수",
    email: "park@example.com",
    department: "마케팅팀",
    status: "비활성",
    joinDate: "2022-11-10",
  },
  {
    id: 4,
    name: "정수진",
    email: "jung@example.com",
    department: "개발팀",
    status: "활성",
    joinDate: "2023-03-05",
  },
  {
    id: 5,
    name: "한지민",
    email: "han@example.com",
    department: "인사팀",
    status: "활성",
    joinDate: "2022-12-01",
  },
];

// 컬럼 정의
const columnDefs: ExtendedColDef<UserData>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    sortable: true,
    filter: true,
    headerAlign: "left",
    bodyAlign: "center", // ID는 가운데 정렬 (간편 설정!)
    headerClass: "required-header",
  },
  {
    field: "name",
    headerName: "이름",
    width: 120,
    sortable: true,
    filter: true,
    editable: true,
    headerAlign: "left", // 왼쪽 정렬
  },
  {
    field: "email",
    headerName: "이메일",
    width: 200,
    sortable: true,
    filter: true,
    editable: true,
    headerAlign: "left", // 왼쪽 정렬
  },
  {
    field: "department",
    headerName: "부서",
    width: 120,
    sortable: true,
    filter: true,
    editable: true,
    headerAlign: "right", // 헤더 오른쪽 정렬
    bodyAlign: "left", // 바디 값 오른쪽 정렬 (간편 설정!)
  },
  {
    field: "status",
    headerName: "상태",
    width: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerAlign: "right", // 오른쪽 정렬
    cellRenderer: (params: { value: string }) => (
      <span
        style={{
          color: params.value === "활성" ? "green" : "red",
          fontWeight: "bold",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "joinDate",
    headerName: "입사일",
    width: 120,
    sortable: true,
    filter: true,
    editable: true,
  },
];

const DetailGrid: React.FC<{ className?: string }> = ({ className }) => {
  const [rowData, setRowData] = useState<UserData[]>(userData);

  // 내부 행 추가용 함수
  const createNewRow = (newId: number | string) => ({
    id: typeof newId === "number" ? newId : parseInt(String(newId)) || 0,
    name: `새 사용자 ${newId}`,
    email: `user${newId}@example.com`,
    department: "개발팀",
    status: "활성",
    joinDate: new Date().toISOString().split("T")[0],
    rowStatus: "C" as const,
  });

  const handleSelectionChanged = (event: {
    api: { getSelectedRows: () => UserData[] };
  }) => {
    const selected = event.api.getSelectedRows();
    if (selected.length > 0) {
      console.log("선택된 행:", selected[0]);
    }
  };

  return (
    <FormAgGrid<UserData>
      rowData={rowData}
      columnDefs={columnDefs}
      enableFilter={true}
      showToolbar={true}
      createNewRow={createNewRow}
      setRowData={setRowData}
      toolbarButtons={{
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showExcelDownload: true,
        showExcelUpload: true,
        showRefresh: true,
        showSave: true,
      }}
      gridOptions={{
        pagination: true,
        paginationPageSize: 10,
        rowSelection: "multiple",
      }}
      className={className}
      onSelectionChanged={handleSelectionChanged}
      customButtons={[
        <FormButton
          key="search"
          size="small"
          className="data-grid-panel__button"
          onClick={() => {
            showSuccess("커스텀 버튼 클릭됨");
          }}
        >
          Button
        </FormButton>,
        <FormButton
          key="custom1"
          size="small"
          className="data-grid-panel__button"
          onClick={() => {
            showSuccess("커스텀 버튼 1 클릭됨");
          }}
        >
          Button 1
        </FormButton>,
        <FormButton
          key="custom2"
          size="small"
          className="data-grid-panel__button "
          onClick={() => {
            showSuccess("커스텀 버튼 2 클릭됨");
          }}
        >
          Button 2
        </FormButton>,
      ]}
      showAllCustomButtons={false}
      maxVisibleCustomButtons={2}
      headerTextAlign="center" // 헤더 텍스트 가운데 정렬
    />
  );
};

export default DetailGrid;
