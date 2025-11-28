// ============================================================================
// Import
// ============================================================================
import React, { useState, useEffect } from "react";
import { Typography, Space, Tag, Row, Col, Form, Modal, Table } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { FormProps } from "antd";
import type {
  ColDef,
  GridApi,
  RowClassParams,
  RowStyle,
  IRowNode,
} from "ag-grid-community";
import {
  createGridReadyHandler,
  getSelectedRows,
  formatCurrencyWon,
  createCheckboxColumn,
  createSelectColumn,
  createNumberColumn,
  createDateColumn,
  createTextAreaColumn,
  createLinkRenderer,
  createStatusRenderer,
  createTagArrayRenderer,
} from "@utils/agGridUtils";
import dayjs, { type Dayjs } from "dayjs";
import {
  FormInput,
  FormTextArea,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormCheckbox,
  FormButton,
  FormAgGrid,
  ActionButtonGroup,
} from "@components/ui/form";
import { AppPageModal } from "@components/ui/feedback";
import { usePageModal } from "@hooks/usePageModal";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import { MenuButtonProvider } from "@/components/providers";
import { initialUserData, type UserData } from "./sample3Data";
import {
  StyledPageContainer,
  StyledHeaderContainer,
  StyledTitle,
  StyledSearchCard,
  StyledActionCard,
  StyledFormCard,
  StyledGridCard,
  StyledSearchTitle,
  StyledSearchIcon,
  StyledLinkButton,
  StyledSearchResultBox,
  StyledResultLabel,
  StyledResultCount,
  StyledResultDivider,
  StyledResultTotal,
  StyledActionButtonContainer,
  StyledDivider,
  StyledCardTitle,
  StyledModalIcon,
  StyledModalTitle,
  StyledModalContent,
  StyledModalLabel,
  StyledModalCount,
  StyledModalEmpty,
  StyledModalSectionTitle,
  StyledModalDivider,
  StyledJsonPreview,
  StyledJsonBox,
  StyledJsonPre,
  modalStyles,
  tableStyles,
} from "./Sample3.styles";

const { Text } = Typography;

// ============================================================================
// 타입 정의
// ============================================================================

interface SearchFormType {
  name?: string;
  id?: string;
  searchEmail?: string;
  phone?: string;
  department?: string;
  status?: string;
  position?: string;
  joinDateRange?: [Dayjs, Dayjs];
  salaryMin?: number;
  salaryMax?: number;
  gender?: string;
}

interface AddFormType {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  joinDate: Dayjs;
  salary: number;
  memo?: string;
  gender?: string;
  hobby?: string[];
  ownerType?: "사업자" | "개인" | "법인";
  businessNumber?: string;
  residentNumber?: string;
  corporateNumber?: string;
}

type UserDataWithStatus = UserData & { rowStatus?: "C" | "U" | "D" };

// ============================================================================
// 상수 정의
// ============================================================================

const DEPARTMENT_OPTIONS = [
  { value: "개발팀", label: "개발팀" },
  { value: "디자인팀", label: "디자인팀" },
  { value: "기획팀", label: "기획팀" },
  { value: "마케팅팀", label: "마케팅팀" },
];

const STATUS_OPTIONS = [
  { value: "활성", label: "활성" },
  { value: "비활성", label: "비활성" },
];

const GENDER_OPTIONS = [
  { value: "남성", label: "남성" },
  { value: "여성", label: "여성" },
];

const HOBBY_OPTIONS = [
  { value: "독서", label: "독서" },
  { value: "영화감상", label: "영화감상" },
  { value: "게임", label: "게임" },
  { value: "운동", label: "운동" },
  { value: "여행", label: "여행" },
  { value: "요리", label: "요리" },
  { value: "사진", label: "사진" },
  { value: "드로잉", label: "드로잉" },
  { value: "코딩", label: "코딩" },
];

const OWNER_TYPE_OPTIONS = [
  { value: "사업자", label: "사업자" },
  { value: "개인", label: "개인" },
  { value: "법인", label: "법인" },
];

// ============================================================================
// 컴포넌트
// ============================================================================
const Sample3: React.FC = () => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [form] = Form.useForm<SearchFormType>();
  const [addForm] = Form.useForm<AddFormType>();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clickedRowId, setClickedRowId] = useState<number | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [showForm] = useState(true);
  const [formMode, setFormMode] = useState<"view" | "edit">("edit");
  const [selectedRowCount, setSelectedRowCount] = useState(0);

  type ModalUser = import("@pages/sample/pageModal/ModalPopup").User;

  const searchModal = usePageModal<{ initialId?: string }, ModalUser>(
    React.lazy(() => import("@pages/sample/pageModal/ModalPopup")),
    {
      title: "이름 검색",
      centered: true,
      width: 500,
      height: 300,
      destroyOnHidden: true,
      onReturn: (value) => {
        form.setFieldsValue({
          name: value.name,
          id: value.id,
        });
      },
    }
  );

  const [changedData, setChangedData] = useState<UserDataWithStatus[]>([]);
  const [deletedData, setDeletedData] = useState<UserDataWithStatus[]>([]);
  const [allData, setAllData] = useState<UserDataWithStatus[]>(
    initialUserData as UserDataWithStatus[]
  );
  const [filteredData, setFilteredData] =
    useState<UserDataWithStatus[]>(allData);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    if (isInitialLoad && allData.length > 0 && !editMode && !editingId) {
      const firstUser = allData[0];
      addForm.setFieldsValue({
        name: firstUser.name,
        email: firstUser.email,
        phone: firstUser.phone || "",
        department: firstUser.department,
        position: firstUser.position,
        status: firstUser.status,
        joinDate: dayjs(firstUser.joinDate),
        salary: firstUser.salary ?? undefined,
        memo: firstUser.memo || "",
        gender: firstUser.gender || undefined,
        hobby: firstUser.hobby || [],
      });
      setEditMode(true);
      setEditingId(firstUser.id);
      setClickedRowId(firstUser.id);
      setIsInitialLoad(false);
    }
  }, [allData, addForm, editMode, editingId, isInitialLoad]);

  const getTableColumns = (defaultStatus: "C" | "U" | "D" = "U") => [
    {
      title: "상태",
      dataIndex: "rowStatus",
      key: "rowStatus",
      width: 80,
      fixed: "left" as const,
      render: (status: "C" | "U" | "D") => {
        const statusMap = {
          C: { text: "추가", color: "blue" },
          U: { text: "수정", color: "orange" },
          D: { text: "삭제", color: "red" },
        };
        const statusInfo = statusMap[status || defaultStatus];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "연락처",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "부서",
      dataIndex: "department",
      key: "department",
      width: 120,
    },
    {
      title: "직책",
      dataIndex: "position",
      key: "position",
      width: 150,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "활성" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "급여",
      dataIndex: "salary",
      key: "salary",
      width: 150,
      render: (salary: number) =>
        salary ? `${salary.toLocaleString()}원` : "-",
    },
    {
      title: "입사일",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 120,
    },
    {
      title: "메모",
      dataIndex: "memo",
      key: "memo",
      width: 200,
      ellipsis: true,
    },
  ];

  // --------------------------------------------------------------------------
  // 그리드 컬럼 정의
  // --------------------------------------------------------------------------
  const columnDefs: ColDef<UserDataWithStatus>[] = [
    {
      field: "rowStatus",
      headerName: "상태",
      width: 80,
      pinned: "left",
      cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
        if (!params.value) return null;
        const statusMap = {
          C: { text: "추가", color: "blue" },
          U: { text: "수정", color: "orange" },
          D: { text: "삭제", color: "red" },
        };
        const statusInfo = statusMap[params.value];
        return (
          <Tag color={statusInfo.color} style={{ margin: 0 }}>
            {statusInfo.text}
          </Tag>
        );
      },
      cellStyle: (params) => {
        if (params.value === "D") {
          return { backgroundColor: "#fff1f0" };
        }
        return null;
      },
    },
    createCheckboxColumn<UserDataWithStatus>("id", "ID", 80, "left"),
    {
      field: "name",
      headerName: "이름",
      width: 120,
      filter: "agTextColumnFilter",
      cellRenderer: createLinkRenderer<UserDataWithStatus>((data) =>
        handleRowClick({ data })
      ),
    },
    {
      field: "email",
      headerName: "이메일",
      width: 200,
      filter: "agTextColumnFilter",
    },
    {
      field: "phone",
      headerName: "연락처",
      width: 150,
      filter: "agTextColumnFilter",
    },
    createSelectColumn<UserDataWithStatus>(
      "department",
      "부서",
      DEPARTMENT_OPTIONS.map((opt) => opt.value),
      120
    ),
    {
      field: "position",
      headerName: "직책",
      width: 150,
      filter: "agTextColumnFilter",
      editable: (params) => {
        const data = params.data as UserDataWithStatus | undefined;
        return data?.rowStatus !== "D";
      },
    },
    {
      ...createSelectColumn<UserDataWithStatus>(
        "status",
        "상태",
        STATUS_OPTIONS.map((opt) => opt.value),
        100
      ),
      cellRenderer: createStatusRenderer("green", "red", "활성"),
    },
    {
      ...createSelectColumn<UserDataWithStatus>(
        "gender",
        "성별",
        GENDER_OPTIONS.map((opt) => opt.value),
        100
      ),
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return "-";
        return <span>{params.value}</span>;
      },
    },
    {
      field: "hobby",
      headerName: "취미",
      width: 200,
      filter: "agSetColumnFilter",
      cellRenderer: (params: { value: string[] | undefined }) => {
        if (
          !params.value ||
          !Array.isArray(params.value) ||
          params.value.length === 0
        ) {
          return "-";
        }
        return createTagArrayRenderer("blue")({ value: params.value });
      },
    },
    createNumberColumn<UserDataWithStatus>(
      "salary",
      "급여",
      150,
      undefined,
      undefined,
      formatCurrencyWon
    ),
    createDateColumn<UserDataWithStatus>("joinDate", "입사일", 120),
    createTextAreaColumn<UserDataWithStatus>("memo", "메모", 200),
  ];

  // --------------------------------------------------------------------------
  // 검색 기능
  // --------------------------------------------------------------------------

  /**
   * 검색 필터 조건 확인 (새 데이터 추가 시 필터링된 데이터에 포함할지 여부)
   */
  const checkSearchFilter = (
    item: UserDataWithStatus,
    searchValues: SearchFormType
  ): boolean => {
    if (searchValues.name && !item.name.includes(searchValues.name)) {
      return false;
    }
    if (
      searchValues.searchEmail &&
      !item.email.toLowerCase().includes(searchValues.searchEmail.toLowerCase())
    ) {
      return false;
    }
    if (searchValues.phone && !item.phone?.includes(searchValues.phone)) {
      return false;
    }
    if (
      searchValues.department &&
      item.department !== searchValues.department
    ) {
      return false;
    }
    if (searchValues.status && item.status !== searchValues.status) {
      return false;
    }
    if (
      searchValues.position &&
      !item.position.includes(searchValues.position)
    ) {
      return false;
    }
    if (
      searchValues.salaryMin !== undefined &&
      searchValues.salaryMin !== null &&
      (!item.salary || item.salary < searchValues.salaryMin)
    ) {
      return false;
    }
    if (
      searchValues.salaryMax !== undefined &&
      searchValues.salaryMax !== null &&
      (!item.salary || item.salary > searchValues.salaryMax)
    ) {
      return false;
    }
    if (searchValues.joinDateRange && searchValues.joinDateRange.length === 2) {
      const [startDate, endDate] = searchValues.joinDateRange;
      const itemDate = dayjs(item.joinDate);
      if (
        !itemDate.isAfter(startDate.subtract(1, "day")) ||
        !itemDate.isBefore(endDate.add(1, "day"))
      ) {
        return false;
      }
    }
    return true;
  };

  const handleSearch: FormProps<SearchFormType>["onFinish"] = (values) => {
    setLoading(true);

    // 시뮬레이션을 위한 약간의 지연
    setTimeout(() => {
      try {
        let filtered = [...allData];

        // 이름 검색 (부분 일치)
        if (values.name) {
          filtered = filtered.filter((item) =>
            item.name.includes(values.name!)
          );
        }

        // 이메일 검색 (부분 일치)
        if (values.searchEmail) {
          filtered = filtered.filter((item) =>
            item.email.toLowerCase().includes(values.searchEmail!.toLowerCase())
          );
        }

        // 연락처 검색 (부분 일치)
        if (values.phone) {
          filtered = filtered.filter((item) =>
            item.phone?.includes(values.phone!)
          );
        }

        // 부서 필터
        if (values.department) {
          filtered = filtered.filter(
            (item) => item.department === values.department
          );
        }

        // 상태 필터
        if (values.status) {
          filtered = filtered.filter((item) => item.status === values.status);
        }

        // 성별 필터
        if (values.gender) {
          filtered = filtered.filter((item) => item.gender === values.gender);
        }

        // 직책 필터
        if (values.position) {
          filtered = filtered.filter((item) =>
            item.position.includes(values.position!)
          );
        }

        // 급여 범위 필터
        if (values.salaryMin !== undefined && values.salaryMin !== null) {
          filtered = filtered.filter(
            (item) => item.salary && item.salary >= values.salaryMin!
          );
        }
        if (values.salaryMax !== undefined && values.salaryMax !== null) {
          filtered = filtered.filter(
            (item) => item.salary && item.salary <= values.salaryMax!
          );
        }

        // 입사일 범위 필터
        if (values.joinDateRange && values.joinDateRange.length === 2) {
          const [startDate, endDate] = values.joinDateRange;
          filtered = filtered.filter((item) => {
            const itemDate = dayjs(item.joinDate);
            return (
              itemDate.isAfter(startDate.subtract(1, "day")) &&
              itemDate.isBefore(endDate.add(1, "day"))
            );
          });
        }

        setFilteredData(filtered);
        setLoading(false);

        if (filtered.length === 0) {
          showError("검색 결과가 없습니다.");
        } else {
          showSuccess(`검색 완료: ${filtered.length}건의 결과를 찾았습니다.`);
        }

        // 그리드 필터 초기화
        if (gridApi) {
          gridApi.setFilterModel(null);
        }
      } catch (error) {
        setLoading(false);
        showError("검색 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("Search error:", error);
        }
      }
    }, 500);
  };

  // 검색 초기화
  const handleReset = () => {
    form.resetFields();
    setFilteredData(allData);
    setSearchExpanded(false);
    setClickedRowId(null);

    if (gridApi) {
      gridApi.setFilterModel(null);
      gridApi.deselectAll();
      gridApi.paginationGoToPage(0);
      gridApi.refreshCells();
    }

    showSuccess("검색 조건이 초기화되었습니다.");
  };

  // --------------------------------------------------------------------------
  // 유틸리티 함수
  // --------------------------------------------------------------------------

  /**
   * 그리드에서 특정 행으로 포커스 이동
   */
  const focusGridRow = (
    targetId: number,
    position: "top" | "middle" = "top"
  ) => {
    if (!gridApi) return;

    setTimeout(() => {
      let targetNode: IRowNode<UserDataWithStatus> | null = null;
      gridApi.forEachNode((node: IRowNode<UserDataWithStatus>) => {
        const nodeData = node.data as UserDataWithStatus | undefined;
        if (nodeData && nodeData.id === targetId) {
          targetNode = node;
        }
      });

      if (targetNode) {
        const node = targetNode as IRowNode<UserDataWithStatus>;
        gridApi.paginationGoToPage(0);
        node.setSelected(true);
        gridApi.ensureNodeVisible(node, position);
        const rowIndex = node.rowIndex ?? 0;
        if (typeof rowIndex === "number") {
          gridApi.setFocusedCell(rowIndex, "name");
        }
      }
    }, 100);
  };

  /**
   * 새 ID 생성
   */
  const generateNewId = (): number => {
    if (allData.length === 0) return 1;
    return Math.max(...allData.map((r) => r.id)) + 1;
  };

  /**
   * 변경사항 추적 로직
   */
  const trackDataChanges = (data: UserDataWithStatus[]) => {
    const prevData = allData;

    // 삭제된 행 처리
    const deletedRows = data.filter((item) => item.rowStatus === "D");
    const prevDeletedIds = new Set(
      prevData.filter((item) => item.rowStatus === "D").map((item) => item.id)
    );
    const newDeletedRows = deletedRows.filter(
      (item) => !prevDeletedIds.has(item.id)
    );

    if (newDeletedRows.length > 0) {
      setDeletedData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const toAdd = newDeletedRows.filter(
          (item) => !existingIds.has(item.id)
        );
        return [...prev, ...toAdd];
      });
    }

    // changedData에서 삭제된 행 제거
    setChangedData((prev) =>
      prev.filter((item) => {
        const currentItem = data.find((d) => d.id === item.id);
        return currentItem?.rowStatus !== "D";
      })
    );

    // 수정된 행 처리
    const updatedRows = data.filter((item) => {
      const prevItem = prevData.find((existing) => existing.id === item.id);
      return (
        prevItem &&
        item.rowStatus === "U" &&
        prevItem.rowStatus !== "U" &&
        prevItem.rowStatus !== "C"
      );
    });

    if (updatedRows.length > 0) {
      setChangedData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const toAdd = updatedRows.filter((item) => !existingIds.has(item.id));
        const toUpdate = updatedRows.filter((item) => existingIds.has(item.id));
        const updated = prev.map((item) => {
          const updateItem = toUpdate.find((u) => u.id === item.id);
          return updateItem ? { ...updateItem, rowStatus: "U" as const } : item;
        });
        return [...updated, ...toAdd];
      });
    }

    // 새로 추가된 행 처리
    const newRows = data.filter(
      (item) =>
        !prevData.find((existing) => existing.id === item.id) &&
        item.rowStatus === "C"
    );

    if (newRows.length > 0) {
      setChangedData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const toAdd = newRows.filter((item) => !existingIds.has(item.id));
        return [...prev, ...toAdd];
      });
    }

    setAllData(data);
    setFilteredData(data);
  };

  // --------------------------------------------------------------------------
  // 이벤트 핸들러
  // --------------------------------------------------------------------------

  // 그리드 준비 완료 이벤트
  const onGridReady = createGridReadyHandler<UserDataWithStatus>((api) => {
    setGridApi(api);
    // 그리드 준비 후 첫 번째 행 자동 선택 (테스트용)
    if (api && filteredData.length > 0) {
      setTimeout(() => {
        const firstNode = api.getDisplayedRowAtIndex(0);
        if (firstNode) {
          firstNode.setSelected(true);
          api.ensureNodeVisible(firstNode, "top");
          // 선택된 행 수 업데이트
          setSelectedRowCount(api.getSelectedRows().length);
        }
      }, 100);
    }
  });

  // 그리드 행 클릭 - 수정 모달 열기
  const handleRowClick = (params: { data: UserDataWithStatus }) => {
    const userData = params.data;

    // 삭제된 행은 수정할 수 없음
    if (userData.rowStatus === "D") {
      showError("삭제된 행은 수정할 수 없습니다.");
      return;
    }

    // 클릭된 행 ID 설정 (링크 색으로 표시하기 위함)
    setClickedRowId(userData.id);

    // 폼에 데이터 설정
    addForm.setFieldsValue({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      department: userData.department,
      position: userData.position,
      status: userData.status,
      joinDate: dayjs(userData.joinDate),
      salary: userData.salary ?? undefined, // 0도 유효한 값이므로 || 대신 ?? 사용
      memo: userData.memo || "",
      gender: userData.gender || undefined,
      hobby: userData.hobby || [],
    });

    setEditMode(true);
    setEditingId(userData.id);
  };

  // 셀 클릭 핸들러 - 이름 컬럼 클릭 시에만 수정 모달 열기
  const handleCellClick = (params: {
    colDef: { field?: string };
    data: UserDataWithStatus;
  }) => {
    // 이름 컬럼을 클릭한 경우에만 처리
    if (params.colDef.field === "name" && params.data) {
      handleRowClick({ data: params.data });
    }
  };

  // 행 스타일 함수 - 클릭된 행과 삭제된 행을 시각적으로 구분
  const getRowStyle = (
    params: RowClassParams<UserDataWithStatus>
  ): RowStyle | undefined => {
    const data = params.data as UserDataWithStatus | undefined;
    if (!data) return undefined;

    // 삭제된 행 스타일
    if (data.rowStatus === "D") {
      return {
        backgroundColor: "#fff1f0", // 연한 빨간색 배경
        opacity: 0.6, // 투명도 적용
        textDecoration: "line-through", // 취소선
      };
    }

    // 클릭된 행 스타일
    if (data.id === clickedRowId) {
      return {
        backgroundColor: "#e6f7ff", // 링크 색 배경
        color: "#1890ff", // 링크 색 텍스트
      };
    }

    return undefined;
  };

  // 추가/수정 폼 제출
  const handleAddSubmit = async (
    values: AddFormType,
    openModalAfterSubmit = false
  ) => {
    try {
      // 시뮬레이션을 위한 약간의 지연
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editMode && editingId !== null) {
        // 수정 모드
        const existingItem = allData.find((item) => item.id === editingId);
        const updatedUser: UserDataWithStatus = {
          id: editingId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          position: values.position,
          status: values.status,
          joinDate: values.joinDate.format("YYYY-MM-DD"),
          salary: values.salary || 0,
          memo: values.memo || "",
          gender: values.gender || undefined,
          hobby: values.hobby || [],
          rowStatus: existingItem?.rowStatus === "C" ? "C" : "U", // 기존 상태 유지 (추가는 C, 수정은 U)
        };

        // allData에서 해당 ID의 데이터 찾아서 업데이트
        const updatedAllData = allData.map((item) =>
          item.id === editingId ? updatedUser : item
        );
        setAllData(updatedAllData);

        // filteredData에서도 업데이트
        const updatedFilteredData = filteredData.map((item) =>
          item.id === editingId ? updatedUser : item
        );
        setFilteredData(updatedFilteredData);

        // 수정된 데이터를 changedData에 추가 (이미 있으면 업데이트)
        setChangedData((prev) => {
          const filtered = prev.filter((item) => item.id !== editingId);
          return [...filtered, updatedUser]; // updatedUser에 이미 올바른 rowStatus가 설정되어 있음
        });

        setEditMode(false);
        setEditingId(null);
        setClickedRowId(null);
        addForm.resetFields();

        showSuccess(
          `사용자 정보가 수정되었습니다. (ID: ${editingId}, 이름: ${values.name})`
        );

        // 수정된 행으로 포커스 이동
        focusGridRow(editingId, "middle");
      } else {
        // 추가 모드
        const newId = generateNewId();

        // 새로운 데이터 생성
        const newUser: UserDataWithStatus = {
          id: newId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          position: values.position,
          status: values.status,
          joinDate: values.joinDate.format("YYYY-MM-DD"),
          salary: values.salary || 0,
          memo: values.memo || "",
          gender: values.gender || undefined,
          hobby: values.hobby || [],
          rowStatus: "C", // 추가는 C
        };

        // allData에 새 행을 맨 앞에 추가 (그리드 1번 행에 표시되도록)
        const updatedAllData = [newUser, ...allData];
        setAllData(updatedAllData);

        // 추가된 데이터를 changedData에 추가
        setChangedData((prev) => [...prev, newUser]); // newUser에 이미 rowStatus: "C"가 설정되어 있음

        // 필터링된 데이터에도 맨 앞에 추가
        const updatedFilteredData = [newUser, ...filteredData];

        // 현재 검색 조건이 있으면 필터링 적용
        const searchValues = form.getFieldsValue();
        const shouldAddToFiltered = checkSearchFilter(newUser, searchValues);

        if (shouldAddToFiltered) {
          setFilteredData(updatedFilteredData);
        } else {
          setFilteredData([...filteredData]);
        }

        setEditMode(false);
        setEditingId(null);
        setClickedRowId(null);
        addForm.resetFields();

        showSuccess(
          `새 사용자가 추가되었습니다. (ID: ${newId}, 이름: ${values.name})`
        );

        // 새로 추가된 행으로 포커스 이동
        if (shouldAddToFiltered) {
          focusGridRow(newId, "top");
        }
      }

      // 저장 모달 열기 플래그가 설정되어 있으면 모달 열기
      if (openModalAfterSubmit) {
        setSaveModalOpen(true);
      }
    } catch (error) {
      showError(
        editMode
          ? "사용자 수정 중 오류가 발생했습니다."
          : "사용자 추가 중 오류가 발생했습니다."
      );
      if (import.meta.env.DEV) {
        console.error("Submit error:", error);
      }
    }
  };

  // 선택된 행 삭제 (상태만 변경, 실제 삭제는 저장 시)
  const handleDeleteRows = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      showError("삭제할 행을 선택해주세요.");
      return;
    }

    // 삭제할 데이터를 deletedData에 추가
    const rowsToDelete = selectedRows as UserDataWithStatus[];
    const selectedIds = rowsToDelete.map((row) => row.id);

    setDeletedData((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const newDeleted = rowsToDelete
        .filter((row) => !existingIds.has(row.id))
        .map((row) => ({ ...row, rowStatus: "D" as const }));
      return [...prev, ...newDeleted];
    });

    // allData에서 rowStatus를 'D'로 설정 (제거하지 않음)
    const updatedAllData = allData.map((item) =>
      selectedIds.includes(item.id)
        ? { ...item, rowStatus: "D" as const }
        : item
    );
    setAllData(updatedAllData);

    // filteredData에서도 rowStatus를 'D'로 설정 (제거하지 않음)
    const updatedFilteredData = filteredData.map((item) =>
      selectedIds.includes(item.id)
        ? { ...item, rowStatus: "D" as const }
        : item
    );
    setFilteredData(updatedFilteredData);

    // changedData에서도 제거 (삭제된 데이터는 changedData에 포함되지 않음)
    setChangedData((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id))
    );

    // 그리드 새로고침
    if (gridApi) {
      gridApi.refreshCells();
    }

    gridApi.deselectAll();
    showSuccess(
      `선택된 ${selectedRows.length}건의 행이 삭제 상태로 표시되었습니다. 저장 시 반영됩니다.`
    );
  };

  const onFinish = async (values: AddFormType) => {
    // 폼 validation이 통과한 후 폼 제출 후 모달 열기
    await handleAddSubmit(values, true);
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <MenuButtonProvider>
      <StyledPageContainer>
        {/* 페이지 헤더 */}
        <StyledHeaderContainer>
          <StyledTitle level={2}>사용자 관리 샘플</StyledTitle>
        </StyledHeaderContainer>

        {/* 검색 영역 */}
        <StyledSearchCard
          title={
            <Space size="small">
              <StyledSearchIcon>
                <SearchOutlined />
              </StyledSearchIcon>
              <StyledSearchTitle>검색 조건</StyledSearchTitle>
            </Space>
          }
          extra={
            <Space>
              <FormButton
                type="link"
                size="small"
                onClick={() => setSearchExpanded(!searchExpanded)}
              >
                <StyledLinkButton>
                  {searchExpanded ? "간단 검색" : "상세 검색"}
                </StyledLinkButton>
              </FormButton>
              <FormButton
                type="primary"
                size="small"
                htmlType="button"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                style={{
                  minWidth: "80px",
                  height: "28px",
                  fontSize: "12px",
                }}
              >
                검색
              </FormButton>
              <FormButton
                size="small"
                htmlType="button"
                onClick={handleReset}
                icon={<ReloadOutlined />}
                style={{
                  minWidth: "80px",
                  height: "28px",
                  fontSize: "12px",
                }}
              >
                초기화
              </FormButton>
            </Space>
          }
        >
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSearch}
            autoComplete="off"
            id="search-form"
          >
            {/* 기본 검색 필드 */}
            <Row gutter={[8, 2]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space>
                  <FormInput
                    type="search"
                    name="name"
                    label="이름"
                    placeholder="검색어를 입력하세요"
                    layout="horizontal"
                    size="small"
                    onSearch={(value) => {
                      searchModal.openModal({ initialId: value || undefined });
                    }}
                    rules={[
                      { required: true, message: "검색어를 입력해주세요!" },
                    ]}
                  />
                  <FormInput name="id" label="" readOnly size="small" />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <FormInput
                  name="searchEmail"
                  label="이메일"
                  placeholder="이메일을 입력하세요"
                  size="small"
                  type="email"
                  useModalMessage={false}
                  rules={[
                    { required: true, message: "이메일을 입력해주세요!" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <FormSelect
                  name="department"
                  label="부서"
                  placeholder="부서를 선택하세요"
                  allowClear
                  showSearch
                  size="small"
                  options={DEPARTMENT_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <FormSelect
                  name="status"
                  label="상태"
                  placeholder="상태를 선택하세요"
                  allowClear
                  size="small"
                  options={STATUS_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <FormRadioGroup
                  name="gender"
                  label="성별"
                  size="small"
                  options={GENDER_OPTIONS}
                  layout="horizontal"
                />
              </Col>
            </Row>

            {/* 상세 검색 필드 (확장) */}
            {searchExpanded && (
              <>
                <StyledDivider />
                <Row gutter={[8, 2]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <FormInput
                      name="phone"
                      label="연락처"
                      placeholder="연락처를 입력하세요"
                      type="tel"
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <FormInput
                      name="position"
                      label="직책"
                      placeholder="직책을 입력하세요"
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <FormInput
                      type="number"
                      name="salaryMin"
                      label="최소 급여"
                      placeholder="최소 급여"
                      addonAfter="원"
                      min={0}
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <FormInput
                      type="number"
                      name="salaryMax"
                      label="최대 급여"
                      placeholder="최대 급여"
                      addonAfter="원"
                      min={0}
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={16} lg={12}>
                    <FormDatePicker
                      name="joinDateRange"
                      label="입사일 범위"
                      placeholder={["시작일", "종료일"]}
                      isRange={true}
                      size="small"
                    />
                  </Col>
                </Row>
              </>
            )}

            <StyledDivider />

            {/* 검색 결과 요약 */}
            <StyledSearchResultBox>
              <Space size="small">
                <StyledResultLabel strong>검색 결과:</StyledResultLabel>
                <StyledResultCount strong>
                  {filteredData.length}
                </StyledResultCount>
                <StyledResultDivider>/</StyledResultDivider>
                <StyledResultTotal strong>
                  전체: {allData.length}건
                </StyledResultTotal>
              </Space>
            </StyledSearchResultBox>
          </Form>
        </StyledSearchCard>

        {/* 액션 버튼 그룹 */}
        <StyledActionCard>
          <StyledActionButtonContainer>
            <ActionButtonGroup
              onButtonClick={{
                create: () => {
                  setFormMode("edit");
                  setEditMode(false);
                  setEditingId(null);
                  setClickedRowId(null);
                  addForm.resetFields();
                },
                edit: () => {
                  const selectedRows =
                    getSelectedRows<UserDataWithStatus>(gridApi);
                  if (selectedRows && selectedRows.length > 0) {
                    handleRowClick({ data: selectedRows[0] });
                  } else {
                    showError("수정할 행을 선택해주세요.");
                  }
                },
                copy: () => {
                  const selectedRows =
                    getSelectedRows<UserDataWithStatus>(gridApi);
                  if (selectedRows && selectedRows.length > 0) {
                    showSuccess(
                      `선택한 행을 복사합니다. (ID: ${selectedRows[0].id})`
                    );
                  } else {
                    showError("복사할 행을 선택해주세요.");
                  }
                },
                delete: handleDeleteRows,
                save: async () => {
                  // 폼이 열려있고 편집 모드일 때 validation 체크 후 제출
                  if (showForm && formMode === "edit") {
                    try {
                      // 폼 validation 체크
                      const values = await addForm.validateFields();
                      // validation 성공 시 폼 제출
                      await onFinish(values);
                    } catch (errorInfo) {
                      // validation 실패 시 첫 번째 에러 필드로 스크롤
                      if (
                        errorInfo &&
                        typeof errorInfo === "object" &&
                        "errorFields" in errorInfo
                      ) {
                        const errorFields = (
                          errorInfo as {
                            errorFields?: Array<{ name: string[] }>;
                          }
                        ).errorFields;
                        if (errorFields && errorFields.length > 0) {
                          const firstErrorField = errorFields[0].name?.[0];
                          if (firstErrorField) {
                            const element = document.querySelector(
                              `[name="${firstErrorField}"]`
                            ) as HTMLElement;
                            if (element) {
                              element.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              element.focus();
                            }
                          }
                        }
                      }
                    }
                  } else {
                    // 폼이 없거나 보기 모드일 때는 바로 모달 열기
                    setSaveModalOpen(true);
                  }
                },
              }}
            />
          </StyledActionButtonContainer>
        </StyledActionCard>

        {/* 사용자 추가/수정 폼 */}
        {showForm && (
          <StyledFormCard
            title={
              <Space
                size="small"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <StyledCardTitle>
                  {editMode ? "사용자 수정" : "사용자 추가"}
                </StyledCardTitle>
                <FormButton
                  size="small"
                  type={formMode === "view" ? "primary" : "default"}
                  onClick={() =>
                    setFormMode(formMode === "view" ? "edit" : "view")
                  }
                >
                  {formMode === "view" ? "수정 모드" : "보기 모드"}
                </FormButton>
              </Space>
            }
          >
            <Form
              form={addForm}
              layout="horizontal"
              onFinish={onFinish}
              autoComplete="off"
              id="add-edit-form"
            >
              <Row gutter={[8, 2]}>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormInput
                    name="name"
                    label="이름"
                    placeholder="이름"
                    layout="horizontal"
                    mode={formMode}
                    rules={[
                      { required: true, message: "이름을 입력해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormInput
                    name="email"
                    label="이메일"
                    type="email"
                    placeholder="이메일"
                    layout="horizontal"
                    mode={formMode}
                    useModalMessage={false}
                    rules={[
                      { required: true, message: "이메일을 입력해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormInput
                    name="phone"
                    label="연락처"
                    type="tel"
                    placeholder="연락처"
                    layout="horizontal"
                    mode={formMode}
                    rules={[
                      { required: true, message: "연락처를 입력해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormSelect
                    name="ownerType"
                    label="사업자/개인"
                    placeholder="선택하세요"
                    allowClear
                    layout="horizontal"
                    mode={formMode}
                    options={OWNER_TYPE_OPTIONS}
                    onChange={(value) => {
                      // 선택이 변경되면 관련 필드 초기화
                      if (value === "사업자") {
                        addForm.setFieldsValue({
                          residentNumber: undefined,
                          corporateNumber: undefined,
                        });
                      } else if (value === "개인") {
                        addForm.setFieldsValue({
                          businessNumber: undefined,
                          corporateNumber: undefined,
                        });
                      } else if (value === "법인") {
                        addForm.setFieldsValue({
                          businessNumber: undefined,
                          residentNumber: undefined,
                        });
                      }
                    }}
                  />
                </Col>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.ownerType !== currentValues.ownerType
                  }
                >
                  {({ getFieldValue }) => {
                    const ownerTypeValue = getFieldValue("ownerType");
                    if (ownerTypeValue === "사업자") {
                      return (
                        <Col xs={24} sm={12} md={6} lg={6}>
                          <FormInput
                            name="businessNumber"
                            label="사업자등록번호"
                            type="businessNumber"
                            placeholder="사업자등록번호"
                            layout="horizontal"
                            mode={formMode}
                            useModalMessage={false}
                            rules={[
                              {
                                required: true,
                                message: "사업자등록번호를 입력해주세요!",
                              },
                              {
                                pattern: /^\d{3}-\d{2}-\d{5}$/,
                                message:
                                  "올바른 사업자등록번호 형식이 아닙니다!",
                              },
                            ]}
                          />
                        </Col>
                      );
                    }
                    if (ownerTypeValue === "개인") {
                      return (
                        <Col xs={24} sm={12} md={6} lg={6}>
                          <FormInput
                            name="residentNumber"
                            label="주민번호"
                            type="residentNumber"
                            placeholder="주민번호"
                            layout="horizontal"
                            mode={formMode}
                            useModalMessage={false}
                            rules={[
                              {
                                required: true,
                                message: "주민번호를 입력해주세요!",
                              },
                              {
                                pattern: /^\d{6}-\d{7}$/,
                                message: "올바른 주민번호 형식이 아닙니다!",
                              },
                            ]}
                          />
                        </Col>
                      );
                    }
                    if (ownerTypeValue === "법인") {
                      return (
                        <Col xs={24} sm={12} md={6} lg={6}>
                          <FormInput
                            name="corporateNumber"
                            label="법인번호"
                            type="corporateNumber"
                            placeholder="법인번호"
                            layout="horizontal"
                            mode={formMode}
                            useModalMessage={false}
                            rules={[
                              {
                                required: true,
                                message: "법인번호를 입력해주세요!",
                              },
                              {
                                pattern: /^\d{6}-\d{7}$/,
                                message: "올바른 법인번호 형식이 아닙니다!",
                              },
                            ]}
                          />
                        </Col>
                      );
                    }
                    return null;
                  }}
                </Form.Item>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormSelect
                    name="department"
                    label="부서"
                    placeholder="부서"
                    allowClear
                    showSearch
                    layout="horizontal"
                    mode={formMode}
                    options={DEPARTMENT_OPTIONS}
                    rules={[
                      { required: true, message: "부서를 선택해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormInput
                    name="position"
                    label="직책"
                    placeholder="직책"
                    layout="horizontal"
                    mode={formMode}
                    rules={[
                      { required: true, message: "직책을 입력해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormSelect
                    name="status"
                    label="상태"
                    placeholder="상태"
                    allowClear
                    layout="horizontal"
                    mode={formMode}
                    options={STATUS_OPTIONS}
                    rules={[
                      { required: true, message: "상태를 선택해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormRadioGroup
                    name="gender"
                    label="성별"
                    mode={formMode}
                    options={GENDER_OPTIONS}
                    layout="horizontal"
                    rules={[
                      { required: true, message: "성별을 선택해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormDatePicker
                    name="joinDate"
                    label="입사일"
                    placeholder="입사일"
                    layout="horizontal"
                    mode={formMode}
                    rules={[
                      { required: true, message: "입사일을 선택해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormInput
                    type="number"
                    name="salary"
                    label="급여"
                    placeholder="급여"
                    addonAfter="원"
                    max={100000000}
                    layout="horizontal"
                    mode={formMode}
                    rules={[
                      { required: true, message: "급여를 입력해주세요!" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <FormCheckbox.Group
                    name="hobby"
                    label="취미"
                    mode={formMode}
                    options={HOBBY_OPTIONS}
                    columns={3}
                    layout="horizontal"
                  />
                </Col>
                <Col xs={24} sm={12} md={12} lg={12}>
                  <FormTextArea
                    name="memo"
                    label="메모"
                    placeholder="메모"
                    rows={2}
                    max={200}
                    layout="horizontal"
                    mode={formMode}
                  />
                </Col>
              </Row>
            </Form>
          </StyledFormCard>
        )}

        {/* 그리드 영역 */}
        <StyledGridCard
          title={
            <Space size="small">
              <StyledCardTitle>사용자 목록</StyledCardTitle>
            </Space>
          }
        >
          <FormAgGrid<UserDataWithStatus>
            rowData={filteredData}
            columnDefs={columnDefs}
            height={350}
            onGridReady={onGridReady}
            showToolbar={true}
            originalRowData={initialUserData as UserDataWithStatus[]}
            onRefresh={() => {
              const originalData = initialUserData as UserDataWithStatus[];
              setAllData(originalData);
              setFilteredData(originalData);
              setChangedData([]);
              setDeletedData([]);
              if (gridApi) {
                gridApi.deselectAll();
                gridApi.refreshCells();
              }
              showSuccess("모든 변경사항이 취소되었습니다.");
            }}
            createNewRow={(newId) => ({
              id:
                typeof newId === "number"
                  ? newId
                  : parseInt(String(newId)) || 0,
              name: "",
              email: "",
              phone: "",
              department: "",
              position: "",
              status: "활성",
              joinDate: dayjs().format("YYYY-MM-DD"),
              salary: 0,
              memo: "",
              rowStatus: "C" as const,
            })}
            setRowData={trackDataChanges}
            styleOptions={{
              fontSize: "12px",
              headerFontSize: "12px",
              rowHeight: "36px",
              headerHeight: "40px",
              cellPadding: "6px",
              headerPadding: "8px",
            }}
            toolbarButtons={{
              // 조건부 활성화: 선택된 행이 있을 때만 복사/삭제 버튼 활성화
              enableCopy: selectedRowCount > 0,
              enableDelete: selectedRowCount > 0,
              enableExcelDownload: filteredData.length > 0,
            }}
            gridOptions={{
              rowSelection: "multiple",
              animateRows: true,
              pagination: true,
              paginationPageSize: 10,
              paginationPageSizeSelector: [10, 20, 50, 100],
              suppressRowClickSelection: true,
              onCellClicked: handleCellClick,
              getRowStyle: getRowStyle,
              onSelectionChanged: (params) => {
                // 선택된 행 수 업데이트
                if (params.api) {
                  setSelectedRowCount(params.api.getSelectedRows().length);
                }
              },
              onCellValueChanged: (params) => {
                // 셀 편집으로 변경된 데이터를 changedData에 추가
                if (params.data) {
                  const updatedUser = params.data as UserDataWithStatus;

                  // 삭제된 행은 편집할 수 없음
                  if (updatedUser.rowStatus === "D") {
                    showError("삭제된 행은 편집할 수 없습니다.");
                    // 그리드 새로고침하여 원래 값으로 복원
                    if (gridApi) {
                      gridApi.refreshCells({ rowNodes: [params.node] });
                    }
                    return;
                  }

                  // allData 업데이트 (rowStatus 유지)
                  setAllData((prev) =>
                    prev.map((item) =>
                      item.id === updatedUser.id
                        ? {
                            ...updatedUser,
                            rowStatus:
                              item.rowStatus === "C"
                                ? ("C" as const)
                                : ("U" as const),
                          }
                        : item
                    )
                  );

                  // filteredData 업데이트 (rowStatus 유지)
                  setFilteredData((prev) =>
                    prev.map((item) =>
                      item.id === updatedUser.id
                        ? {
                            ...updatedUser,
                            rowStatus:
                              item.rowStatus === "C"
                                ? ("C" as const)
                                : ("U" as const),
                          }
                        : item
                    )
                  );

                  // changedData에 추가 (이미 있으면 업데이트)
                  setChangedData((prev) => {
                    const filtered = prev.filter(
                      (item) => item.id !== updatedUser.id
                    );
                    const existingItem = prev.find(
                      (item) => item.id === updatedUser.id
                    );
                    const rowStatus =
                      existingItem?.rowStatus === "C"
                        ? ("C" as const)
                        : ("U" as const);
                    return [...filtered, { ...updatedUser, rowStatus }];
                  });
                }

                // 실제 환경에서는 여기서 API 호출하여 데이터 업데이트
                showSuccess(
                  `${params.colDef.headerName}이(가) "${params.newValue}"(으)로 변경되었습니다.`
                );
              },
            }}
          />
        </StyledGridCard>

        {/* 저장 데이터 보기 모달 */}
        <Modal
          title={
            <Space>
              <StyledModalIcon>
                <SaveOutlined />
              </StyledModalIcon>
              <StyledModalTitle>저장할 데이터</StyledModalTitle>
            </Space>
          }
          open={saveModalOpen}
          onCancel={() => setSaveModalOpen(false)}
          footer={[
            <FormButton
              key="close"
              size="small"
              onClick={() => setSaveModalOpen(false)}
            >
              닫기
            </FormButton>,
            <FormButton
              key="save"
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => {
                const totalChanges = changedData.length + deletedData.length;
                const addedCount = changedData.filter(
                  (item) => item.rowStatus === "C"
                ).length;
                const updatedCount = changedData.filter(
                  (item) => item.rowStatus === "U"
                ).length;
                if (totalChanges === 0) {
                  showError("저장할 변경된 데이터가 없습니다.");
                  return;
                }
                showSuccess(
                  `총 ${totalChanges}건의 변경된 데이터가 저장되었습니다. (추가(C): ${addedCount}건, 수정(U): ${updatedCount}건, 삭제(D): ${deletedData.length}건)`
                );
                setChangedData([]);
                setDeletedData([]);
                setSaveModalOpen(false);
              }}
              disabled={changedData.length === 0 && deletedData.length === 0}
            >
              저장하기
            </FormButton>,
          ]}
          width={1200}
          style={modalStyles}
        >
          <StyledModalContent>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <StyledModalLabel strong>저장할 변경 데이터:</StyledModalLabel>
              <Space size="large">
                <Text>
                  추가(C):{" "}
                  <StyledModalCount color="#1890ff" strong>
                    {
                      changedData.filter((item) => item.rowStatus === "C")
                        .length
                    }
                  </StyledModalCount>
                  건
                </Text>
                <Text>
                  수정(U):{" "}
                  <StyledModalCount color="#fa8c16" strong>
                    {
                      changedData.filter((item) => item.rowStatus === "U")
                        .length
                    }
                  </StyledModalCount>
                  건
                </Text>
                <Text>
                  삭제(D):{" "}
                  <StyledModalCount color="#ff4d4f" strong>
                    {deletedData.length}
                  </StyledModalCount>
                  건
                </Text>
                <Text>
                  전체:{" "}
                  <StyledModalCount color="#52c41a" strong>
                    {changedData.length + deletedData.length}
                  </StyledModalCount>
                  건
                </Text>
              </Space>
              {changedData.length === 0 && deletedData.length === 0 && (
                <Text type="warning" style={{ marginTop: "4px" }}>
                  (변경된 데이터가 없습니다)
                </Text>
              )}
            </Space>
          </StyledModalContent>

          {changedData.length === 0 && deletedData.length === 0 ? (
            <StyledModalEmpty>
              <Text>변경된 데이터가 없습니다.</Text>
            </StyledModalEmpty>
          ) : (
            <>
              {/* 추가/수정된 데이터 */}
              {changedData.length > 0 && (
                <>
                  <StyledModalSectionTitle color="#1890ff">
                    추가/수정된 데이터 ({changedData.length}건) - 추가(C):{" "}
                    {
                      changedData.filter((item) => item.rowStatus === "C")
                        .length
                    }
                    건, 수정(U):{" "}
                    {
                      changedData.filter((item) => item.rowStatus === "U")
                        .length
                    }
                    건
                  </StyledModalSectionTitle>
                  <Table
                    dataSource={changedData}
                    columns={getTableColumns("U")}
                    rowKey="id"
                    scroll={tableStyles.scroll}
                    pagination={tableStyles.pagination}
                  />
                  {deletedData.length > 0 && <StyledModalDivider />}
                </>
              )}

              {/* 삭제된 데이터 */}
              {deletedData.length > 0 && (
                <>
                  <StyledModalSectionTitle color="#ff4d4f">
                    삭제된 데이터 ({deletedData.length}건)
                  </StyledModalSectionTitle>
                  <Table
                    dataSource={deletedData}
                    columns={getTableColumns("D")}
                    rowKey="id"
                    scroll={tableStyles.scroll}
                    pagination={tableStyles.pagination}
                    rowClassName={() => "deleted-row"}
                    style={{
                      marginBottom: changedData.length > 0 ? "20px" : "0",
                    }}
                  />
                </>
              )}

              <StyledModalDivider />

              <div>
                <StyledJsonPreview strong>
                  JSON 데이터 미리보기:
                </StyledJsonPreview>
                <StyledJsonBox>
                  <StyledJsonPre>
                    {JSON.stringify(
                      {
                        data: [...changedData, ...deletedData],
                      },
                      null,
                      2
                    )}
                  </StyledJsonPre>
                </StyledJsonBox>
              </div>
            </>
          )}
        </Modal>

        {/* 이름 검색 모달 */}
        <AppPageModal {...searchModal.modalProps} />
      </StyledPageContainer>
    </MenuButtonProvider>
  );
};

export default Sample3;
