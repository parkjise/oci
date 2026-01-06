import React, { useState, useCallback } from "react";
import FormAgGrid, {
  type ExtendedColDef,
} from "@/components/ui/form/AgGrid/FormAgGrid";
import FormButton from "@/components/ui/form/Button/FormButton";
import { showSuccess } from "@/components/ui/feedback/Message";
import { createAttachmentColumn } from "@/components/ui/form/AgGrid/columns";
import { useAttachment } from "@/hooks/useAttachment";
import { AttachmentDrawer } from "@/components/ui/feedback";

// 샘플 데이터 타입 정의
interface UserData {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  joinDate: string;
  eatKey?: number; // 첨부파일 그룹 키
  fileCount?: number; // 첨부파일 개수
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
    eatKey: 101,
    //fileCount: 3,
  },
  {
    id: 2,
    name: "이영희",
    email: "lee@example.com",
    department: "디자인팀",
    status: "활성",
    joinDate: "2023-02-20",
    eatKey: 102,
    //fileCount: 5,
  },
  {
    id: 3,
    name: "박민수",
    email: "park@example.com",
    department: "마케팅팀",
    status: "비활성",
    joinDate: "2022-11-10",
    eatKey: 103,
    //fileCount: 0,
  },
  {
    id: 4,
    name: "정수진",
    email: "jung@example.com",
    department: "개발팀",
    status: "활성",
    joinDate: "2023-03-05",
    eatKey: 104,
    //fileCount: 2,
  },
  {
    id: 5,
    name: "한지민",
    email: "han@example.com",
    department: "인사팀",
    status: "활성",
    joinDate: "2022-12-01",
    eatKey: 105,
    //fileCount: 1,
  },
];

const DetailGrid: React.FC<{ className?: string }> = ({ className }) => {
  const [rowData, setRowData] = useState<UserData[]>(userData);
  const [selectedRow, setSelectedRow] = useState<UserData | null>(null);

  // 선택된 행의 첨부파일 훅
  const attachmentHook = useAttachment({
    eatKey: selectedRow?.eatKey,
    onClose: (newEatKey) => {
      if (newEatKey && selectedRow) {
        // 생성된 eatKey를 행 데이터에 반영
        setRowData((prev) =>
          prev.map((row) =>
            row.id === selectedRow.id ? { ...row, eatKey: newEatKey } : row
          )
        );
      }
    },
  });

  // 첨부파일 버튼 클릭 핸들러
  const handleAttachmentClick = useCallback(
    (data: UserData) => {
      setSelectedRow(data);
      // eatKey가 없으면 자동 생성
      attachmentHook.openDrawer();
    },
    [attachmentHook]
  );

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

    createAttachmentColumn<UserData>({
      field: "attachment",
      headerName: "첨부파일",
      width: 100,
      eatKeyField: "eatKey",
      countField: "fileCount",
      onClick: handleAttachmentClick,
      hide: true, // 컬럼 숨김
    }) as ExtendedColDef<UserData>,
  ];

  // 내부 행 추가용 함수
  const createNewRow = (newId: number | string) => ({
    id: typeof newId === "number" ? newId : parseInt(String(newId)) || 0,
    name: `새 사용자 ${newId}`,
    email: `user${newId}@example.com`,
    department: "개발팀",
    status: "활성",
    joinDate: new Date().toISOString().split("T")[0],
    rowStatus: "C" as const,
    fileCount: 0,
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
    <>
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
          defaultColDef: {
            suppressHeaderMenuButton: true, // 헤더 메뉴 버튼 제거 * 개별적용은 field 부분에 설정 가능
            suppressHeaderFilterButton: true, // 헤더 필터 버튼 제거 * 개별적용은 field 부분에 설정 가능
          },
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

      {/* 선택된 행의 첨부파일 Drawer */}
      {selectedRow && (
        <AttachmentDrawer
          {...attachmentHook.drawerProps}
          title={`${selectedRow.name}의 첨부파일`}
          width={500}
          autoUpload={true}
        />
      )}
    </>
  );
};

export default DetailGrid;
