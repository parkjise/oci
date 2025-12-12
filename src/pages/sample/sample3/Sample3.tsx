import React, { useState, useEffect } from "react";
import { Space, Tag, Row, Col, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import type { GridApi, IRowNode } from "ag-grid-community";
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
  SearchActions,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { AppPageModal } from "@components/ui/feedback";
import { usePageModal } from "@hooks/usePageModal";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import { MenuButtonProvider } from "@/components/providers";
import { initialUserData, type UserData } from "./sample3Data";
import SaveDataModal from "./SaveDataModal";
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
  StyledSearchResultBox,
  StyledResultLabel,
  StyledResultCount,
  StyledResultDivider,
  StyledResultTotal,
  StyledActionButtonContainer,
  StyledDivider,
  StyledCardTitle,
} from "./Sample3.styles";
import Mdi from "@/components/features/mdi/Mdi";

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

const FORM_COLLAPSED_HEIGHT = "180px";

const Sample3: React.FC = () => {
  const [form] = Form.useForm<SearchFormType>();
  const [addForm] = Form.useForm<AddFormType>();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
  const [formExpanded, setFormExpanded] = useState(false);
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
        const statusKey = status || defaultStatus;
        const statusInfo = statusMap[statusKey];
        if (!statusInfo) return null;
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

  const columnDefs: ExtendedColDef<UserDataWithStatus>[] = [
    {
      field: "rowStatus",
      headerName: "상태",
      width: 80,
      pinned: "left",
      excludeFromExcel: true, // 엑셀 다운로드에서 제외
      cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
        if (!params.value) return null;
        const statusMap = {
          C: { text: "추가", color: "blue" },
          U: { text: "수정", color: "orange" },
          D: { text: "삭제", color: "red" },
        };
        const statusInfo = statusMap[params.value];
        if (!statusInfo) return null;
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
    {
      ...createCheckboxColumn<UserDataWithStatus>("id", "ID", 80, "left"),
      excludeFromExcel: true, // 엑셀 다운로드에서 제외
    },
    {
      headerClass: "required-header",
      field: "name",
      headerName: "이름",
      width: 120,
      filter: true,
      cellRenderer: createLinkRenderer<UserDataWithStatus>((data) =>
        handleRowClick({ data })
      ),
    },
    {
      field: "email",
      headerName: "이메일",
      width: 200,
      filter: true,
      headerClass: "required-header",
    },
    {
      field: "phone",
      headerName: "연락처",
      width: 150,
      filter: true,
      headerClass: "required-header",
    },
    {
      ...createSelectColumn<UserDataWithStatus>(
        "department",
        "부서",
        DEPARTMENT_OPTIONS.map((opt) => opt.value),
        120
      ),
      headerClass: "required-header",
    },
    {
      field: "position",
      headerName: "직책",
      width: 150,
      filter: true,
      headerClass: "required-header",
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
      headerClass: "required-header",
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
    {
      ...createNumberColumn<UserDataWithStatus>(
        "salary",
        "급여",
        150,
        undefined,
        undefined,
        formatCurrencyWon
      ),
      headerClass: "required-header",
    },
    {
      ...createDateColumn<UserDataWithStatus>("joinDate", "입사일", 120),
      headerClass: "required-header",
    },
    createTextAreaColumn<UserDataWithStatus>("memo", "메모", 200),
  ];

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
      (!item.salary || item.salary < Math.floor(searchValues.salaryMin))
    ) {
      return false;
    }
    if (
      searchValues.salaryMax !== undefined &&
      searchValues.salaryMax !== null &&
      (!item.salary || item.salary > Math.floor(searchValues.salaryMax))
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

    setTimeout(() => {
      try {
        const filtered = allData.filter((item) =>
          checkSearchFilter(item, values)
        );

        setFilteredData(filtered);
        setLoading(false);

        if (filtered.length === 0) {
          showError("검색 결과가 없습니다.");
        } else {
          showSuccess(`검색 완료: ${filtered.length}건의 결과를 찾았습니다.`);
        }

        gridApi?.setFilterModel(null);
      } catch (error) {
        setLoading(false);
        showError("검색 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("Search error:", error);
        }
      }
    }, 500);
  };

  const handleReset = () => {
    form.resetFields();
    setFilteredData(allData);
    setSearchExpanded(false);

    if (gridApi) {
      gridApi.setFilterModel(null);
      gridApi.deselectAll();
      gridApi.paginationGoToPage(0);
      gridApi.refreshCells();
    }

    showSuccess("검색 조건이 초기화되었습니다.");
  };

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

  const generateNewId = (): number => {
    if (allData.length === 0) return 1;
    return Math.max(...allData.map((r) => r.id)) + 1;
  };

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

  const onGridReady = createGridReadyHandler<UserDataWithStatus>((api) => {
    setGridApi(api);
    if (api && filteredData.length > 0) {
      setTimeout(() => {
        const firstNode = api.getDisplayedRowAtIndex(0);
        if (firstNode) {
          firstNode.setSelected(true);
          api.ensureNodeVisible(firstNode, "top");
          setSelectedRowCount(api.getSelectedRows().length);
        }
      }, 100);
    }
  });

  const handleRowClick = (params: { data: UserDataWithStatus }) => {
    const userData = params.data;

    if (userData.rowStatus === "D") {
      showError("삭제된 행은 수정할 수 없습니다.");
      return;
    }

    // 폼에 데이터 설정
    addForm.setFieldsValue({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      department: userData.department,
      position: userData.position,
      status: userData.status,
      joinDate: dayjs(userData.joinDate),
      salary: userData.salary ?? undefined,
      memo: userData.memo || "",
      gender: userData.gender || undefined,
      hobby: userData.hobby || [],
    });

    setEditMode(true);
    setEditingId(userData.id);
  };

  const handleCellClick = (params: {
    colDef: { field?: string };
    data: UserDataWithStatus;
  }) => {
    if (params.colDef.field === "name" && params.data) {
      handleRowClick({ data: params.data });
    }
  };

  const handleAddSubmit = async (
    values: AddFormType,
    openModalAfterSubmit = false
  ) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editMode && editingId !== null) {
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
          salary: values.salary ? Math.floor(values.salary) : 0,
          memo: values.memo || "",
          gender: values.gender || undefined,
          hobby: values.hobby || [],
          rowStatus: existingItem?.rowStatus === "C" ? "C" : "U",
        };

        const updateDataInArray = <T extends { id: number }>(
          array: T[],
          updatedItem: T
        ): T[] =>
          array.map((item) => (item.id === editingId ? updatedItem : item));

        setAllData(updateDataInArray(allData, updatedUser));
        setFilteredData(updateDataInArray(filteredData, updatedUser));
        setChangedData((prev) => {
          const filtered = prev.filter((item) => item.id !== editingId);
          return [...filtered, updatedUser];
        });

        setEditMode(false);
        setEditingId(null);
        addForm.resetFields();

        showSuccess(
          `사용자 정보가 수정되었습니다. (ID: ${editingId}, 이름: ${values.name})`
        );

        focusGridRow(editingId, "middle");
      } else {
        const newId = generateNewId();

        const newUser: UserDataWithStatus = {
          id: newId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          position: values.position,
          status: values.status,
          joinDate: values.joinDate.format("YYYY-MM-DD"),
          salary: values.salary ? Math.floor(values.salary) : 0,
          memo: values.memo || "",
          gender: values.gender || undefined,
          hobby: values.hobby || [],
          rowStatus: "C",
        };

        setAllData([newUser, ...allData]);
        setChangedData((prev) => [...prev, newUser]);

        const searchValues = form.getFieldsValue();
        const shouldAddToFiltered = checkSearchFilter(newUser, searchValues);
        if (shouldAddToFiltered) {
          setFilteredData([newUser, ...filteredData]);
          focusGridRow(newId, "top");
        }

        setEditMode(false);
        setEditingId(null);
        addForm.resetFields();
        showSuccess(
          `새 사용자가 추가되었습니다. (ID: ${newId}, 이름: ${values.name})`
        );
      }

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

  const handleDeleteRows = () => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() as UserDataWithStatus[];
    if (selectedRows.length === 0) {
      showError("삭제할 행을 선택해주세요.");
      return;
    }

    const selectedIds = new Set(selectedRows.map((row) => row.id));

    setDeletedData((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const newDeleted = selectedRows
        .filter((row) => !existingIds.has(row.id))
        .map((row) => ({ ...row, rowStatus: "D" as const }));
      return [...prev, ...newDeleted];
    });

    // 데이터 업데이트 헬퍼 함수
    const markAsDeleted = <T extends UserDataWithStatus>(item: T): T =>
      selectedIds.has(item.id)
        ? ({ ...item, rowStatus: "D" as const } as T)
        : item;

    setAllData((prev) => prev.map(markAsDeleted));
    setFilteredData((prev) => prev.map(markAsDeleted));
    setChangedData((prev) => prev.filter((item) => !selectedIds.has(item.id)));

    gridApi.refreshCells();
    gridApi.deselectAll();
    showSuccess(
      `선택된 ${selectedRows.length}건의 행이 삭제 상태로 표시되었습니다. 저장 시 반영됩니다.`
    );
  };

  const onFinish = async (values: AddFormType) => {
    await handleAddSubmit(values, true);
  };

  return (
    <MenuButtonProvider>
      <StyledPageContainer>
        <StyledHeaderContainer>
          <StyledTitle level={2}>사용자 관리 샘플</StyledTitle>
        </StyledHeaderContainer>

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
            <SearchActions
              loading={loading}
              searchExpanded={searchExpanded}
              onSearch={() => form.submit()}
              onReset={handleReset}
              onToggleExpand={() => setSearchExpanded(!searchExpanded)}
            />
          }
        >
          <Form
            form={form}
            layout="horizontal"
            onFinish={handleSearch}
            autoComplete="off"
            id="search-form"
          >
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
                    showReadOnlyBoxName="id"
                    onSearch={(value) => {
                      searchModal.openModal({ initialId: value || undefined });
                    }}
                    rules={[
                      { required: true, message: "검색어를 입력해주세요!" },
                    ]}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <FormInput
                  name="searchEmail"
                  label="이메일"
                  placeholder="이메일을 입력하세요"
                  size="small"
                  type="email"
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
                      step={1}
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
                      step={1}
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

        <StyledActionCard>
          <StyledActionButtonContainer>
            <ActionButtonGroup
              enableExpand={true}
              expanded={formExpanded}
              onExpandChange={setFormExpanded}
              onButtonClick={{
                create: () => {
                  setFormMode("edit");
                  setEditMode(false);
                  setEditingId(null);
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
                    setSaveModalOpen(true);
                  }
                },
              }}
              customButtons={[
                <FormButton
                  key="custom-1"
                  size="small"
                  onClick={() => {
                    showSuccess("커스텀 버튼 1 클릭됨");
                  }}
                >
                  커스텀 버튼 1
                </FormButton>,
                <FormButton
                  key="custom-2"
                  size="small"
                  onClick={() => {
                    showSuccess("커스텀 버튼 2 클릭됨");
                  }}
                >
                  커스텀 버튼 2
                </FormButton>,
                <FormButton
                  key="custom-3"
                  size="small"
                  onClick={() => {
                    showSuccess("커스텀 버튼 3 클릭됨");
                  }}
                >
                  커스텀 버튼 3
                </FormButton>,
                <FormButton
                  key="custom-4"
                  size="small"
                  onClick={() => {
                    showSuccess("커스텀 버튼 4 클릭됨");
                  }}
                >
                  커스텀 버튼 4
                </FormButton>,
                <FormButton
                  key="custom-5"
                  size="small"
                  onClick={() => {
                    showSuccess("커스텀 버튼 5 클릭됨");
                  }}
                >
                  커스텀 버튼 5
                </FormButton>,
              ]}
            />
          </StyledActionButtonContainer>
        </StyledActionCard>

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
              <div
                style={{
                  maxHeight: formExpanded ? "none" : FORM_COLLAPSED_HEIGHT,
                  overflow: formExpanded ? "visible" : "hidden",
                  transition: "max-height 0.3s ease",
                }}
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
                      min={0}
                      step={1}
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
                      columns={1}
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
              </div>
            </Form>
          </StyledFormCard>
        )}

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
            excelFileName="사용자목록"
            enableFilter={true}
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
              enableCopy: selectedRowCount > 0,
              enableDelete: selectedRowCount > 0,
              enableExcelDownload: filteredData.length > 0,
              showSave: true,
            }}
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
                className="data-grid-panel__button data-grid-panel__button--search"
                onClick={() => {
                  showSuccess("커스텀 버튼 1 클릭됨");
                }}
              >
                Button 1
              </FormButton>,
              <FormButton
                key="custom2"
                size="small"
                className="data-grid-panel__button data-grid-panel__button--search"
                onClick={() => {
                  showSuccess("커스텀 버튼 2 클릭됨");
                }}
              >
                Button 2
              </FormButton>,
            ]}
            showAllCustomButtons={false}
            maxVisibleCustomButtons={2}
            onSave={(gridApi: GridApi<UserDataWithStatus> | null) => {
              console.log("저장되었습니다.", gridApi);
              showSuccess("데이터가 저장되었습니다.");
            }}
            gridOptions={{
              rowSelection: "single",
              animateRows: true,
              pagination: true,
              paginationPageSize: 10,
              paginationPageSizeSelector: [10, 20, 50, 100],
              suppressRowClickSelection: false, // 행 클릭 선택 비활성화
              onCellClicked: handleCellClick,
              onSelectionChanged: (params) => {
                if (params.api) {
                  const selectedRows = params.api.getSelectedRows();
                  setSelectedRowCount(selectedRows.length);
                  if (selectedRows.length > 0) {
                    console.log("선택된 행:", selectedRows[0]);
                  }
                }
              },
              onCellValueChanged: (params) => {
                if (params.data) {
                  const updatedUser = params.data as UserDataWithStatus;

                  if (updatedUser.rowStatus === "D") {
                    showError("삭제된 행은 편집할 수 없습니다.");
                    if (gridApi) {
                      gridApi.refreshCells({ rowNodes: [params.node] });
                    }
                    return;
                  }

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

                showSuccess(
                  `${params.colDef.headerName}이(가) "${params.newValue}"(으)로 변경되었습니다.`
                );
              },
            }}
          />
        </StyledGridCard>
        <div>
          <Mdi />
        </div>
        <SaveDataModal
          open={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          changedData={changedData}
          deletedData={deletedData}
          onSave={() => {
            setChangedData([]);
            setDeletedData([]);
          }}
          getTableColumns={getTableColumns}
        />

        <AppPageModal {...searchModal.modalProps} />
      </StyledPageContainer>
    </MenuButtonProvider>
  );
};

export default Sample3;
