// ============================================================================
// Import
// ============================================================================
import React from "react";
import {
  Card,
  Divider,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Form,
  Button,
} from "antd";
import { CodeOutlined, BulbOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { DataNode } from "antd/es/tree";
import {
  type ColDef,
  type ValueFormatterParams,
  type GridReadyEvent,
  type GridApi,
} from "ag-grid-community";
import CustomInput, { CustomSearchInput } from "@form/CustomInput";
import CustomSelect from "@form/CustomSelect";
import CustomDatePicker from "@form/CustomDatePicker";
import CustomRadioGroup from "@form/CustomRadioGroup";
import CustomCheckbox from "@form/CustomCheckbox";
import CustomTree from "@form/CustomTree";
import CustomButton from "@form/CustomButton";
import CommonAgGrid, {
  type AgGridStyleOptions,
} from "@components/common/form/CustomAgGrid";
import LoadingSpinner from "@components/common/loadingSpinner";
import AppPageModal from "@components/common/pageModal";
import {
  confirm,
  info,
  success,
  error,
  warning,
} from "@/components/common/message";
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  show,
} from "@/components/common/message";
import ModalPopup from "../pageModal/ModalPopup";

const { Title, Paragraph, Text } = Typography;

// ============================================================================
// 타입 정의
// ============================================================================
interface DemoFormType {
  userName: string;
  userName2: string;
  email?: string;
  password?: string;
  amount?: number;
  search?: string;
  searchWithButton?: string;
  searchWithIcon?: string;
  category: string;
  priority: string;
  singleDate?: Dayjs;
  startDate?: Dayjs;
  endDate?: Dayjs;
  dateRange?: [Dayjs, Dayjs];
  hobbies: string[];
  agree: boolean;
  tag?: string;
  tree?: React.Key[];
}

interface DemoGridData {
  id: number;
  name: string;
  category: string;
  amount: number;
}

interface SummaryGridData {
  id: number;
  category: string;
  subCategory: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MultiEditGridData {
  id: number;
  name: string;
  category: string;
  status: string;
  startDate: Date | null;
  amount: number;
  description: string;
  isActive: boolean;
  isApproved: boolean;
  isPublished: boolean;
}

// ============================================================================
// 상수 데이터
// ============================================================================
const INITIAL_GRID_DATA: DemoGridData[] = [
  { id: 1, name: "항목 1", category: "카테고리 A", amount: 10000 },
  { id: 2, name: "항목 2", category: "카테고리 B", amount: 20000 },
  { id: 3, name: "항목 3", category: "카테고리 A", amount: 15000 },
];

const INITIAL_MULTI_EDIT_GRID_DATA: MultiEditGridData[] = [
  {
    id: 1,
    name: "프로젝트 A",
    category: "개발",
    status: "진행중",
    startDate: new Date(2024, 0, 15),
    amount: 1000000,
    description: "프로젝트 설명 1",
    isActive: true,
    isApproved: false,
    isPublished: false,
  },
  {
    id: 2,
    name: "프로젝트 B",
    category: "디자인",
    status: "대기",
    startDate: new Date(2024, 1, 20),
    amount: 500000,
    description: "프로젝트 설명 2",
    isActive: false,
    isApproved: true,
    isPublished: false,
  },
  {
    id: 3,
    name: "프로젝트 C",
    category: "기획",
    status: "완료",
    startDate: new Date(2024, 2, 10),
    amount: 2000000,
    description: "프로젝트 설명 3",
    isActive: true,
    isApproved: true,
    isPublished: true,
  },
  {
    id: 4,
    name: "프로젝트 D",
    category: "개발",
    status: "진행중",
    startDate: new Date(2024, 3, 5),
    amount: 1500000,
    description: "프로젝트 설명 4",
    isActive: true,
    isApproved: false,
    isPublished: true,
  },
];

// ============================================================================
// 컴포넌트
// ============================================================================
const Sample1: React.FC = () => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [form] = Form.useForm<DemoFormType>();
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  type User = { id: string; name: string };
  const [user, setUser] = React.useState<User | null>(null);
  const [modalInitialId, setModalInitialId] = React.useState<
    string | undefined
  >(undefined);
  const [gridStyleOptions, setGridStyleOptions] =
    React.useState<AgGridStyleOptions>({});
  const [gridData] = React.useState<DemoGridData[]>(INITIAL_GRID_DATA);
  const [editableGridData, setEditableGridData] =
    React.useState<DemoGridData[]>(INITIAL_GRID_DATA);
  const [originalMultiEditGridData] = React.useState<MultiEditGridData[]>(
    INITIAL_MULTI_EDIT_GRID_DATA
  );
  const [multiEditGridData, setMultiEditGridData] = React.useState<
    MultiEditGridData[]
  >(INITIAL_MULTI_EDIT_GRID_DATA);
  const [summaryGridData] = React.useState<SummaryGridData[]>([
    {
      id: 1,
      category: "전자제품",
      subCategory: "스마트폰",
      item: "아이폰 15",
      quantity: 5,
      unitPrice: 1200000,
      total: 6000000,
    },
    {
      id: 2,
      category: "전자제품",
      subCategory: "스마트폰",
      item: "갤럭시 S24",
      quantity: 3,
      unitPrice: 1100000,
      total: 3300000,
    },
    {
      id: 3,
      category: "전자제품",
      subCategory: "노트북",
      item: "맥북 프로",
      quantity: 2,
      unitPrice: 2500000,
      total: 5000000,
    },
    {
      id: 4,
      category: "전자제품",
      subCategory: "노트북",
      item: "LG 그램",
      quantity: 4,
      unitPrice: 1500000,
      total: 6000000,
    },
    {
      id: 5,
      category: "의류",
      subCategory: "상의",
      item: "티셔츠",
      quantity: 10,
      unitPrice: 30000,
      total: 300000,
    },
    {
      id: 6,
      category: "의류",
      subCategory: "상의",
      item: "셔츠",
      quantity: 8,
      unitPrice: 50000,
      total: 400000,
    },
    {
      id: 7,
      category: "의류",
      subCategory: "하의",
      item: "청바지",
      quantity: 6,
      unitPrice: 80000,
      total: 480000,
    },
    {
      id: 8,
      category: "의류",
      subCategory: "하의",
      item: "슬랙스",
      quantity: 5,
      unitPrice: 70000,
      total: 350000,
    },
  ]);

  const [modifiedRows, setModifiedRows] = React.useState<
    Map<number, Partial<MultiEditGridData>>
  >(new Map());
  const [changeHistory, setChangeHistory] = React.useState<
    Array<{
      id: number;
      field: string;
      oldValue: unknown;
      newValue: unknown;
      timestamp: Date;
    }>
  >([]);

  // --------------------------------------------------------------------------
  // Ref
  // --------------------------------------------------------------------------
  const gridApiRef = React.useRef<GridApi | null>(null);
  const loadingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // --------------------------------------------------------------------------
  // Effect
  // --------------------------------------------------------------------------
  React.useEffect(() => {
    setLoading(false);
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setLoading(false);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 상수 데이터
  // --------------------------------------------------------------------------
  const treeData: DataNode[] = [
    {
      title: "부서",
      key: "0-0",
      children: [
        {
          title: "개발팀",
          key: "0-0-0",
          children: [
            { title: "프론트엔드", key: "0-0-0-0" },
            { title: "백엔드", key: "0-0-0-1" },
            { title: "데브옵스", key: "0-0-0-2" },
          ],
        },
        {
          title: "디자인팀",
          key: "0-0-1",
          children: [
            { title: "UI/UX", key: "0-0-1-0" },
            { title: "그래픽", key: "0-0-1-1" },
          ],
        },
        {
          title: "기획팀",
          key: "0-0-2",
          children: [
            { title: "프로덕트", key: "0-0-2-0" },
            { title: "비즈니스", key: "0-0-2-1" },
          ],
        },
      ],
    },
    {
      title: "프로젝트",
      key: "0-1",
      children: [
        { title: "프로젝트 A", key: "0-1-0" },
        { title: "프로젝트 B", key: "0-1-1" },
        { title: "프로젝트 C", key: "0-1-2" },
      ],
    },
  ];

  // --------------------------------------------------------------------------
  // AG-Grid 컬럼 정의
  // --------------------------------------------------------------------------
  const gridColumnDefs: ColDef<DemoGridData>[] = [
    { headerName: "ID", field: "id", width: 80 },
    { headerName: "이름", field: "name", flex: 1 },
    { headerName: "카테고리", field: "category", flex: 1 },
    {
      headerName: "금액",
      field: "amount",
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return `₩${params.value.toLocaleString()}`;
        }
        return "";
      },
    },
  ];

  const editableGridColumnDefs: ColDef<DemoGridData>[] = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    { headerName: "이름", field: "name", flex: 1 },
    { headerName: "카테고리", field: "category", flex: 1 },
    {
      headerName: "금액",
      field: "amount",
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return `₩${params.value.toLocaleString()}`;
        }
        return "";
      },
    },
  ];

  const multiEditGridColumnDefs: ColDef<MultiEditGridData>[] = [
    {
      headerName: "ID",
      field: "id",
      width: 80,
      checkboxSelection: true, // 행 선택용 체크박스
      headerCheckboxSelection: true, // 헤더 전체 선택 체크박스
      editable: false,
    },
    {
      headerName: "이름",
      field: "name",
      flex: 1,
      editable: true, // InputBox - 기본 텍스트 편집
      cellEditor: "agTextCellEditor",
    },
    {
      headerName: "카테고리",
      field: "category",
      width: 150,
      editable: true, // SelectBox
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["개발", "디자인", "기획", "마케팅", "운영"],
      },
    },
    {
      headerName: "상태",
      field: "status",
      width: 120,
      editable: true, // SelectBox
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["대기", "진행중", "완료", "취소"],
      },
    },
    {
      headerName: "시작일",
      field: "startDate",
      width: 150,
      editable: true, // Calendar (Date Picker)
      cellEditor: "agDateCellEditor",
      cellEditorParams: {
        min: new Date(2020, 0, 1),
        max: new Date(2030, 11, 31),
      },
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value instanceof Date) {
          return params.value.toLocaleDateString("ko-KR");
        }
        return "";
      },
    },
    {
      headerName: "금액",
      field: "amount",
      width: 150,
      editable: true, // InputBox (숫자)
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 0,
        precision: 0,
      },
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return `₩${params.value.toLocaleString()}`;
        }
        return "";
      },
    },
    {
      headerName: "설명",
      field: "description",
      flex: 1,
      editable: true, // InputBox (긴 텍스트)
      cellEditor: "agLargeTextCellEditor",
      cellEditorParams: {
        maxLength: 200,
        rows: 3,
      },
    },
    {
      headerName: "활성화",
      field: "isActive",
      width: 120,
      editable: true, // 체크박스 편집 가능
      cellEditor: "agCheckboxCellEditor", // 체크박스 편집기
      cellRenderer: "agCheckboxCellRenderer", // 체크박스 렌더러
    },
    {
      headerName: "승인됨",
      field: "isApproved",
      width: 120,
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      cellRenderer: "agCheckboxCellRenderer",
    },
    {
      headerName: "발행됨",
      field: "isPublished",
      width: 120,
      editable: true,
      cellEditor: "agCheckboxCellEditor",
      cellRenderer: "agCheckboxCellRenderer",
    },
  ];

  const summaryGridColumnDefs: ColDef<SummaryGridData>[] = [
    {
      headerName: "카테고리",
      field: "category",
      rowGroup: true,
      hide: true,
      width: 150,
    },
    {
      headerName: "세부카테고리",
      field: "subCategory",
      rowGroup: true,
      hide: true,
      width: 150,
    },
    {
      headerName: "품목",
      field: "item",
      width: 150,
      flex: 1,
    },
    {
      headerName: "수량",
      field: "quantity",
      width: 100,
      aggFunc: "sum",
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return params.value.toLocaleString();
        }
        return "";
      },
    },
    {
      headerName: "단가",
      field: "unitPrice",
      width: 120,
      aggFunc: "avg",
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return `₩${params.value.toLocaleString()}`;
        }
        return "";
      },
    },
    {
      headerName: "합계",
      field: "total",
      width: 150,
      aggFunc: "sum",
      valueFormatter: (params: ValueFormatterParams) => {
        if (typeof params.value === "number") {
          return `₩${params.value.toLocaleString()}`;
        }
        return "";
      },
    },
  ];

  // --------------------------------------------------------------------------
  // 핸들러 함수
  // --------------------------------------------------------------------------
  const onFinish: FormProps<DemoFormType>["onFinish"] = (values) => {
    console.log("Form values:", values);
  };

  const handleLoadingDemo = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setLoading(false);
      loadingTimerRef.current = null;
    }, 2000);
  };

  const onGridReady = (params: GridReadyEvent<DemoGridData>) => {
    gridApiRef.current = params.api;
  };

  const handleAddRow = () => {
    const newId =
      editableGridData.length > 0
        ? Math.max(...editableGridData.map((row) => row.id)) + 1
        : 1;
    const newRow: DemoGridData = {
      id: newId,
      name: `새 항목 ${newId}`,
      category: "카테고리 A",
      amount: 0,
    };
    setEditableGridData([...editableGridData, newRow]);
    // 그리드에 포커스 이동
    setTimeout(() => {
      if (gridApiRef.current) {
        gridApiRef.current.setFocusedCell(editableGridData.length, "name");
        gridApiRef.current.startEditingCell({
          rowIndex: editableGridData.length,
          colKey: "name",
        });
      }
    }, 100);
  };

  const handleDeleteRows = () => {
    if (!gridApiRef.current) return;
    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      console.log("삭제할 행을 선택해주세요.");
      return;
    }
    const selectedIds = selectedRows.map((row: DemoGridData) => row.id);
    const newData = editableGridData.filter(
      (row) => !selectedIds.includes(row.id)
    );
    setEditableGridData(newData);
    gridApiRef.current.deselectAll();
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={1}>
          <CodeOutlined /> Components/Common 개발자 가이드
        </Title>
        <Paragraph>
          프로젝트에서 사용하는 공통 컴포넌트들의 사용법과 예제를 제공합니다.
        </Paragraph>
      </div>

      {/* Form 컴포넌트 섹션 */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>📝 Form 컴포넌트</Title>
        <Divider />

        {/* CustomInput */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomInput</Tag>
              <Text type="secondary">일반 입력 필드</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블 (필수)
                  </li>
                  <li>
                    <Text code>rules</Text>: 유효성 검사 규칙
                  </li>
                  <li>
                    <Text code>type</Text>: 입력 타입 (text, number, password
                    등)
                  </li>
                  <li>
                    <Text code>addonAfter</Text>: 입력 필드 뒤에 추가할 요소
                  </li>
                  <li>
                    <Text code>placeholder</Text>: placeholder 텍스트
                  </li>
                  <li>
                    <Text code>disabled</Text>: 비활성화 여부
                  </li>
                </ul>
                <Text type="secondary">
                  Ant Design의 Input 컴포넌트의 모든 props를 지원합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <CustomInput
                  name="userName"
                  label="사용자명"
                  placeholder="사용자명을 입력하세요"
                  rules={[
                    { required: true, message: "사용자명을 입력해주세요!" },
                  ]}
                />
                <CustomInput
                  name="email"
                  label="이메일"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  rules={[
                    { required: true, message: "이메일을 입력해주세요!" },
                    {
                      type: "email",
                      message: "올바른 이메일 형식이 아닙니다!",
                    },
                  ]}
                />
                <CustomInput
                  name="password"
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  layout="horizontal"
                  rules={[
                    { required: true, message: "비밀번호를 입력해주세요!" },
                  ]}
                />
                <CustomInput
                  name="amount"
                  label="금액"
                  type="number"
                  placeholder="금액을 입력하세요"
                  addonAfter="원"
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomSearchInput */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomSearchInput</Tag>
              <Text type="secondary">검색 입력 필드</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블 (필수)
                  </li>
                  <li>
                    <Text code>rules</Text>: 유효성 검사 규칙
                  </li>
                  <li>
                    <Text code>onSearch</Text>: 검색 버튼 클릭 시 실행되는 함수
                  </li>
                  <li>
                    <Text code>placeholder</Text>: placeholder 텍스트
                  </li>
                  <li>
                    <Text code>enterButton</Text>: 검색 버튼 텍스트 또는
                    ReactNode
                  </li>
                  <li>
                    <Text code>loading</Text>: 검색 중 로딩 상태
                  </li>
                </ul>
                <Text type="secondary">
                  Ant Design의 Input.Search 컴포넌트의 모든 props를 지원합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Space>
                  <CustomSearchInput
                    name="search"
                    label="검색"
                    placeholder="검색어를 입력하세요"
                    layout="horizontal"
                    onSearch={(value) => {
                      setModalInitialId(value || undefined);
                      setModalOpen(true);
                    }}
                    rules={[
                      { required: true, message: "검색어를 입력해주세요!" },
                    ]}
                  />
                  <CustomInput
                    name="userName2"
                    label=""
                    readOnly={true}
                    rules={[{ required: false }]}
                  />
                </Space>
                <CustomSearchInput
                  name="searchWithButton"
                  label="검색 (커스텀 버튼)"
                  placeholder="검색어를 입력하세요"
                  enterButton="검색"
                  onSearch={(value) => {
                    console.log("검색:", value);
                  }}
                />
                <CustomSearchInput
                  name="searchWithIcon"
                  label="검색 (아이콘 버튼)"
                  placeholder="검색어를 입력하세요"
                  enterButton
                  onSearch={(value) => {
                    console.log("검색:", value);
                  }}
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomSelect */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomSelect</Tag>
              <Text type="secondary">선택 박스</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블 (필수)
                  </li>
                  <li>
                    <Text code>options</Text>: 선택 옵션 배열 (필수)
                  </li>
                  <li>
                    <Text code>placeholder</Text>: placeholder 텍스트
                  </li>
                  <li>
                    <Text code>rules</Text>: 유효성 검사 규칙
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <CustomSelect
                  name="category"
                  label="카테고리"
                  placeholder="카테고리를 선택하세요"
                  options={[
                    { value: "work", label: "업무" },
                    { value: "personal", label: "개인" },
                    { value: "study", label: "스터디" },
                  ]}
                  rules={[
                    { required: true, message: "카테고리를 선택해주세요!" },
                  ]}
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomDatePicker */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomDatePicker</Tag>
              <Text type="secondary">
                날짜 선택기 (단일/범위/연동 기능 지원)
              </Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블 (필수)
                  </li>
                  <li>
                    <Text code>isRange</Text>: 범위 선택 모드 (기본값: false)
                  </li>
                  <li>
                    <Text code>linkType</Text>: "start" 또는 "end" (연동 타입)
                  </li>
                  <li>
                    <Text code>linkedTo</Text>: 연동할 다른 필드명
                  </li>
                  <li>
                    <Text code>placeholder</Text>: placeholder 텍스트 (단일)
                    또는 배열 (범위)
                  </li>
                  <li>
                    <Text code>rules</Text>: 유효성 검사 규칙
                  </li>
                  <li>
                    <Text code>layout</Text>: 레이아웃 (vertical, horizontal,
                    inline)
                  </li>
                </ul>
                <Text type="secondary">
                  Ant Design의 DatePicker와 RangePicker의 모든 props를
                  지원합니다.
                </Text>
                <Text strong style={{ display: "block", marginTop: "8px" }}>
                  참고:
                </Text>
                <ul>
                  <li>
                    <Text code>CustomDatePicker</Text>: 단일/범위/연동 날짜 선택
                    지원
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <Title level={5}>1. 단일 날짜 선택</Title>
                <CustomDatePicker
                  name="singleDate"
                  label="날짜"
                  placeholder="날짜를 선택하세요"
                  size="small"
                />
                <Title level={5} style={{ marginTop: "16px" }}>
                  2. 범위 날짜 선택 (CustomDatePicker)
                </Title>
                <CustomDatePicker
                  name="dateRange"
                  label="기간"
                  isRange={true}
                  placeholder={["시작일", "종료일"]}
                  rules={[{ required: true, message: "기간을 선택해주세요!" }]}
                />
                <Title level={5} style={{ marginTop: "16px" }}>
                  4. 연동 날짜 선택
                </Title>
                <CustomDatePicker
                  name="startDate"
                  label="시작일"
                  linkType="start"
                  linkedTo="endDate"
                  placeholder="시작일을 선택하세요"
                />
                <CustomDatePicker
                  name="endDate"
                  label="종료일"
                  linkType="end"
                  linkedTo="startDate"
                  placeholder="종료일을 선택하세요"
                  rules={[
                    { required: true, message: "종료일을 선택해주세요!" },
                  ]}
                />
                <Title level={5} style={{ marginTop: "16px" }}>
                  5. 추가 옵션 예제
                </Title>
                <CustomDatePicker
                  name="dateWithFormat"
                  label="날짜 (형식 지정)"
                  placeholder="날짜를 선택하세요"
                  format="YYYY-MM-DD"
                />
                <CustomDatePicker
                  name="dateWithDisabled"
                  label="날짜 (비활성화 날짜 포함)"
                  placeholder="날짜를 선택하세요"
                  disabledDate={(current: Dayjs) => {
                    // 오늘 이후 날짜 비활성화
                    return current && current > dayjs().endOf("day");
                  }}
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomRadioGroup */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomRadioGroup</Tag>
              <Text type="secondary">라디오 버튼 그룹</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블 (필수)
                  </li>
                  <li>
                    <Text code>options</Text>: 라디오 옵션 배열 (필수)
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <CustomRadioGroup
                  name="priority"
                  label="우선순위"
                  options={[
                    { value: "high", label: "높음" },
                    { value: "medium", label: "중간" },
                    { value: "low", label: "낮음" },
                  ]}
                  layout="horizontal"
                  rules={[
                    { required: true, message: "우선순위를 선택해주세요!" },
                  ]}
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomCheckbox */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomCheckbox</Tag>
              <Text type="secondary">체크박스 (단일 및 그룹)</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>단일 체크박스:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블
                  </li>
                  <li>
                    <Text code>onChange</Text>: 변경 핸들러 (checked: boolean)
                  </li>
                </ul>
                <Text strong>체크박스 그룹:</Text>
                <ul>
                  <li>
                    <Text code>CustomCheckbox.Group</Text> 컴포넌트 사용
                  </li>
                  <li>
                    <Text code>enableSelectAll</Text>: 전체 선택 기능
                  </li>
                  <li>
                    <Text code>maxSelect</Text>: 최대 선택 개수
                  </li>
                  <li>
                    <Text code>columns</Text>: 그리드 컬럼 수
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <Form.Item name="agree" valuePropName="checked">
                  <CustomCheckbox
                    label="이용약관에 동의합니다"
                    onChange={(checked) => {
                      console.log("동의:", checked);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="hobbies"
                  label="취미"
                  rules={[{ required: true, message: "취미를 선택해주세요!" }]}
                >
                  <CustomCheckbox.Group
                    options={[
                      { label: "독서", value: "reading" },
                      { label: "운동", value: "sports" },
                      { label: "영화", value: "movies" },
                      { label: "코딩", value: "coding" },
                    ]}
                    enableSelectAll
                    selectAllLabel="모두 선택"
                    maxSelect={3}
                    columns={2}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomTree */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomTree</Tag>
              <Text type="secondary">트리 컴포넌트 (계층 구조 선택)</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: 필드명 (필수)
                  </li>
                  <li>
                    <Text code>label</Text>: 레이블
                  </li>
                  <li>
                    <Text code>treeData</Text>: 트리 데이터 배열 (필수)
                  </li>
                  <li>
                    <Text code>rules</Text>: 유효성 검사 규칙
                  </li>
                  <li>
                    <Text code>checkable</Text>: 체크박스 모드 활성화
                  </li>
                  <li>
                    <Text code>multiple</Text>: 다중 선택 모드
                  </li>
                  <li>
                    <Text code>onSelect</Text>: 선택 이벤트 핸들러
                  </li>
                  <li>
                    <Text code>onCheck</Text>: 체크 이벤트 핸들러
                  </li>
                  <li>
                    <Text code>defaultExpandAll</Text>: 기본적으로 모든 노드
                    펼치기
                  </li>
                </ul>
                <Text type="secondary">
                  Tree의 모든 props (TreeProps)를 지원합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <CustomTree
                  name="tree" // 필드명(필수)
                  label="부서/프로젝트 선택" // 레이블(필수)
                  treeData={treeData} // 트리 데이터(필수)
                  checkable // 체크박스 모드 활성화(기본값: false)
                  defaultExpandAll // 기본적으로 모든 노드 펼치기(기본값: false)
                  rules={[{ required: true, message: "항목을 선택해주세요!" }]} // 유효성 검사 규칙(필수) (message: 에러 메시지)
                />
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomButton */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomButton</Tag>
              <Text type="secondary">버튼 컴포넌트</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>name</Text>: Form.Item 필드명 (name이 있으면
                    자동으로 Form.Item으로 감쌈)
                  </li>
                  <li>
                    <Text code>label</Text>: Form.Item 레이블
                  </li>
                  <li>
                    <Text code>rules</Text>: Form.Item 유효성 검사 규칙
                  </li>
                  <li>
                    <Text code>layout</Text>: Form.Item 레이아웃
                  </li>
                  <li>
                    <Text code>wrapFormItem</Text>: Form.Item으로 감쌀지 여부
                  </li>
                  <li>
                    <Text code>type</Text>: 버튼 타입 (primary, default, dashed,
                    text, link)
                  </li>
                  <li>
                    <Text code>htmlType</Text>: 버튼 HTML 타입 (button, submit,
                    reset)
                  </li>
                  <li>
                    <Text code>icon</Text>: 아이콘
                  </li>
                  <li>
                    <Text code>loading</Text>: 로딩 상태
                  </li>
                  <li>
                    <Text code>disabled</Text>: 비활성화 여부
                  </li>
                  <li>
                    <Text code>block</Text>: 블록 버튼 (전체 너비)
                  </li>
                  <li>
                    <Text code>danger</Text>: 위험 버튼 스타일
                  </li>
                  <li>
                    <Text code>ghost</Text>: 고스트 버튼 스타일
                  </li>
                  <li>
                    <Text code>size</Text>: 버튼 크기 (large, middle, small)
                  </li>
                </ul>
                <Text type="secondary">
                  Ant Design의 Button 컴포넌트의 모든 props를 지원합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Form form={form} layout="vertical">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Title level={5}>1. 일반 버튼 (Form.Item 없이)</Title>
                  <Space wrap>
                    <CustomButton
                      type="primary"
                      onClick={() => {
                        console.log("Primary 버튼 클릭");
                      }}
                    >
                      Primary
                    </CustomButton>
                    <CustomButton
                      type="default"
                      onClick={() => {
                        console.log("Default 버튼 클릭");
                      }}
                    >
                      Default
                    </CustomButton>
                    <CustomButton
                      type="dashed"
                      onClick={() => {
                        console.log("Dashed 버튼 클릭");
                      }}
                    >
                      Dashed
                    </CustomButton>
                    <CustomButton
                      type="text"
                      onClick={() => {
                        console.log("Text 버튼 클릭");
                      }}
                    >
                      Text
                    </CustomButton>
                    <CustomButton
                      type="link"
                      onClick={() => {
                        console.log("Link 버튼 클릭");
                      }}
                    >
                      Link
                    </CustomButton>
                  </Space>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    2. Form 내부에서 사용
                  </Title>
                  <Form.Item>
                    <CustomButton type="primary" htmlType="submit" block>
                      제출
                    </CustomButton>
                  </Form.Item>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    3. Form.Item으로 자동 감싸기
                  </Title>
                  <CustomButton
                    name="submitButton"
                    label="제출 버튼"
                    type="primary"
                    htmlType="submit"
                  >
                    제출
                  </CustomButton>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    4. 아이콘 버튼
                  </Title>
                  <Space wrap>
                    <CustomButton type="primary" icon={<CodeOutlined />}>
                      코드
                    </CustomButton>
                    <CustomButton
                      type="default"
                      icon={<BulbOutlined />}
                      loading={loading}
                      onClick={handleLoadingDemo}
                    >
                      로딩 버튼
                    </CustomButton>
                  </Space>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    5. 버튼 그룹
                  </Title>
                  <Space wrap>
                    <CustomButton type="primary">저장</CustomButton>
                    <CustomButton type="default">취소</CustomButton>
                    <CustomButton type="default" danger>
                      삭제
                    </CustomButton>
                  </Space>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    6. 버튼 크기
                  </Title>
                  <Space wrap>
                    <CustomButton type="primary" size="large">
                      Large
                    </CustomButton>
                    <CustomButton type="primary" size="middle">
                      Middle
                    </CustomButton>
                    <CustomButton type="primary" size="small">
                      Small
                    </CustomButton>
                  </Space>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    7. 고스트 버튼
                  </Title>
                  <Space wrap>
                    <CustomButton type="primary" ghost>
                      Primary Ghost
                    </CustomButton>
                    <CustomButton type="default" ghost>
                      Default Ghost
                    </CustomButton>
                    <CustomButton type="dashed" ghost>
                      Dashed Ghost
                    </CustomButton>
                  </Space>

                  <Title level={5} style={{ marginTop: "16px" }}>
                    8. 비활성화 버튼
                  </Title>
                  <Space wrap>
                    <CustomButton type="primary" disabled>
                      Disabled Primary
                    </CustomButton>
                    <CustomButton type="default" disabled>
                      Disabled Default
                    </CustomButton>
                    <CustomButton type="link" disabled>
                      Disabled Link
                    </CustomButton>
                  </Space>
                </Space>
              </Form>
            </Col>
          </Row>
        </Card>

        {/* CustomAgGrid */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomAgGrid</Tag>
              <Text type="secondary">AG-Grid 엔터프라이즈 그리드</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>rowData</Text>: 그리드 데이터 (필수)
                  </li>
                  <li>
                    <Text code>columnDefs</Text>: 컬럼 정의 (필수)
                  </li>
                  <li>
                    <Text code>height</Text>: 그리드 높이 (기본값: 400)
                  </li>
                  <li>
                    <Text code>gridOptions</Text>: AG-Grid 옵션
                  </li>
                </ul>
                <Text type="warning">
                  AG-Grid Enterprise 라이선스가 필요합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <CommonAgGrid<DemoGridData>
                rowData={gridData}
                columnDefs={gridColumnDefs}
                height={200}
                gridOptions={{
                  rowSelection: "multiple",
                  animateRows: true,
                  pagination: false,
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* CustomAgGrid - 다양한 편집 모드 (Input, Select, Date, Checkbox) */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomAgGrid</Tag>
              <Text type="secondary">
                다양한 편집 모드 (Input, Select, Date, Checkbox)
              </Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>InputBox (텍스트 입력):</Text>
                <ul>
                  <li>
                    <Text code>editable: true</Text>: 셀 편집 가능
                  </li>
                  <li>
                    <Text code>cellEditor: "agTextCellEditor"</Text>: 기본
                    텍스트 편집기
                  </li>
                  <li>
                    <Text code>cellEditor: "agLargeTextCellEditor"</Text>: 긴
                    텍스트 편집기 (여러 줄)
                  </li>
                  <li>
                    <Text code>cellEditor: "agNumberCellEditor"</Text>: 숫자
                    편집기
                  </li>
                </ul>
                <Text strong>SelectBox (선택 박스):</Text>
                <ul>
                  <li>
                    <Text code>cellEditor: "agSelectCellEditor"</Text>: 셀렉트
                    편집기
                  </li>
                  <li>
                    <Text code>cellEditorParams: {"{ values: [...] }"}</Text>:
                    선택 옵션 배열
                  </li>
                </ul>
                <Text strong>Calendar (날짜 선택):</Text>
                <ul>
                  <li>
                    <Text code>cellEditor: "agDateCellEditor"</Text>: 날짜
                    편집기
                  </li>
                  <li>
                    <Text code>cellEditorParams: {"{ min, max }"}</Text>: 날짜
                    범위 제한
                  </li>
                  <li>
                    <Text code>valueFormatter</Text>: 날짜 포맷팅
                  </li>
                </ul>
                <Text strong>Checkbox (체크박스):</Text>
                <ul>
                  <li>
                    <Text code>editable: true</Text>: 셀 편집 가능하게 설정
                  </li>
                  <li>
                    <Text code>cellEditor: "agCheckboxCellEditor"</Text>:
                    체크박스 편집기 사용
                  </li>
                  <li>
                    <Text code>cellRenderer: "agCheckboxCellRenderer"</Text>:
                    체크박스 렌더러 사용
                  </li>
                  <li>
                    <Text code>checkboxSelection: true</Text>: 행 선택용
                    체크박스 (첫 번째 컬럼에 설정)
                  </li>
                  <li>
                    <Text code>headerCheckboxSelection: true</Text>: 헤더 전체
                    선택 체크박스
                  </li>
                </ul>
                <Text strong>Row 수정 상태 추적:</Text>
                <ul>
                  <li>
                    <Text code>onCellValueChanged</Text>: 셀 값 변경 시 호출되는
                    이벤트 핸들러
                  </li>
                  <li>
                    <Text code>params.oldValue</Text>: 변경 전 값
                  </li>
                  <li>
                    <Text code>params.newValue</Text>: 변경 후 값
                  </li>
                  <li>
                    <Text code>params.data</Text>: 변경된 행의 전체 데이터
                  </li>
                  <li>
                    <Text code>params.colDef.field</Text>: 변경된 필드명
                  </li>
                  <li>수정된 행 추적 및 변경 이력 관리 가능</li>
                  <li>원본 데이터와 비교하여 변경 사항 확인 가능</li>
                </ul>
                <Text type="warning">
                  AG-Grid Enterprise 라이선스가 필요합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제 (다양한 편집 모드 그리드)</Title>
              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: "16px" }}
              >
                <Space wrap>
                  <Button
                    type="primary"
                    onClick={() => {
                      console.log("전체 데이터:", multiEditGridData);
                    }}
                  >
                    전체 데이터 확인
                  </Button>
                  <Button
                    onClick={() => {
                      const changedData = multiEditGridData.filter(
                        (row) => row.status === "진행중"
                      );
                      console.log("진행중인 프로젝트:", changedData);
                    }}
                  >
                    진행중인 프로젝트 확인
                  </Button>
                  <Button
                    onClick={() => {
                      const activeRows = multiEditGridData.filter(
                        (row) => row.isActive
                      );
                      console.log("활성화된 항목:", activeRows);
                    }}
                  >
                    활성화된 항목 확인
                  </Button>
                </Space>
                <Space wrap>
                  <Button
                    type="default"
                    onClick={() => {
                      if (modifiedRows.size === 0) {
                        console.log("수정된 행이 없습니다.");
                        return;
                      }
                      const modifiedRowsArray = Array.from(
                        modifiedRows.entries()
                      ).map(([id, changes]) => ({
                        id,
                        changes,
                        currentRow: multiEditGridData.find(
                          (row) => row.id === id
                        ),
                        originalRow: originalMultiEditGridData.find(
                          (row) => row.id === id
                        ),
                      }));
                      console.log("=== 수정된 행 목록 ===");
                      console.log("수정된 행 개수:", modifiedRows.size);
                      console.log("수정된 행 상세:", modifiedRowsArray);
                      modifiedRowsArray.forEach((item) => {
                        console.log(`\n행 ID ${item.id}:`);
                        console.log("  원본 데이터:", item.originalRow);
                        console.log("  현재 데이터:", item.currentRow);
                        console.log("  변경 사항:", item.changes);
                      });
                    }}
                  >
                    수정된 행 확인 ({modifiedRows.size})
                  </Button>
                  <Button
                    onClick={() => {
                      if (changeHistory.length === 0) {
                        console.log("변경 이력이 없습니다.");
                        return;
                      }
                      console.log("=== 변경 이력 ===");
                      console.log("총 변경 횟수:", changeHistory.length);
                      console.log("변경 이력 상세:", changeHistory);
                      changeHistory.forEach((change, index) => {
                        console.log(
                          `\n[${
                            index + 1
                          }] ${change.timestamp.toLocaleTimeString()}`
                        );
                        console.log(`  행 ID: ${change.id}`);
                        console.log(`  필드: ${change.field}`);
                        console.log(`  이전 값:`, change.oldValue);
                        console.log(`  새 값:`, change.newValue);
                      });
                    }}
                  >
                    변경 이력 확인 ({changeHistory.length})
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      setModifiedRows(new Map());
                      setChangeHistory([]);
                      setMultiEditGridData([...originalMultiEditGridData]);
                      console.log("데이터가 초기화되었습니다.");
                    }}
                  >
                    데이터 초기화
                  </Button>
                </Space>
                {modifiedRows.size > 0 && (
                  <div
                    style={{
                      padding: "8px",
                      background: "#fff7e6",
                      border: "1px solid #ffd591",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <Text strong>수정된 행: </Text>
                    {Array.from(modifiedRows.keys())
                      .map((id) => `ID ${id}`)
                      .join(", ")}
                  </div>
                )}
              </Space>
              <CommonAgGrid<MultiEditGridData>
                rowData={multiEditGridData}
                columnDefs={multiEditGridColumnDefs}
                height={400}
                gridOptions={{
                  rowSelection: "multiple",
                  animateRows: true,
                  pagination: false,
                  stopEditingWhenCellsLoseFocus: true,
                  onCellValueChanged: (params) => {
                    const field = params.colDef.field!;
                    const oldValue = params.oldValue;
                    const newValue = params.newValue;
                    const rowId = params.data.id;

                    // 원본 데이터에서 해당 행 찾기
                    const originalRow = originalMultiEditGridData.find(
                      (row) => row.id === rowId
                    );

                    // 변경 이력 추가
                    setChangeHistory((prev) => [
                      {
                        id: rowId,
                        field,
                        oldValue,
                        newValue,
                        timestamp: new Date(),
                      },
                      ...prev,
                    ]);

                    // 수정된 행 추적
                    setModifiedRows((prev) => {
                      const newMap = new Map(prev);
                      const existingChanges = newMap.get(rowId) || {};

                      // 원본 값과 비교하여 변경된 필드만 저장
                      if (
                        originalRow &&
                        originalRow[field as keyof MultiEditGridData] !==
                          newValue
                      ) {
                        newMap.set(rowId, {
                          ...existingChanges,
                          [field]: {
                            oldValue:
                              originalRow[field as keyof MultiEditGridData],
                            newValue,
                          },
                        });
                      } else if (
                        originalRow &&
                        originalRow[field as keyof MultiEditGridData] ===
                          newValue
                      ) {
                        // 원본 값으로 되돌린 경우 해당 필드 제거
                        const updatedChanges = { ...existingChanges };
                        delete updatedChanges[field as keyof MultiEditGridData];
                        if (Object.keys(updatedChanges).length === 0) {
                          newMap.delete(rowId);
                        } else {
                          newMap.set(rowId, updatedChanges);
                        }
                      }

                      return newMap;
                    });

                    // 데이터 업데이트
                    const updatedData = multiEditGridData.map((row) =>
                      row.id === rowId ? { ...row, [field]: newValue } : row
                    );
                    setMultiEditGridData(updatedData);

                    // 콘솔 로그
                    console.log("=== 셀 값 변경 ===");
                    console.log(`행 ID: ${rowId}`);
                    console.log(`필드: ${field}`);
                    console.log(`이전 값:`, oldValue);
                    console.log(`새 값:`, newValue);
                    console.log(`전체 행 데이터:`, params.data);
                    console.log("==================");
                  },
                  onSelectionChanged: (params) => {
                    // 선택된 행 변경 시
                    const selectedRows = params.api.getSelectedRows();
                    console.log("선택된 행:", selectedRows);
                  },
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* CustomAgGrid - 소계/합계 */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomAgGrid</Tag>
              <Text type="secondary">
                소계/합계 기능 (Grouping & Aggregation)
              </Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>소계/합계 설정:</Text>
                <ul>
                  <li>
                    <Text code>rowGroup: true</Text>: 그룹화할 컬럼 설정
                  </li>
                  <li>
                    <Text code>aggFunc</Text>: 집계 함수 (sum, avg, min, max,
                    count 등)
                  </li>
                  <li>
                    <Text code>groupDisplayType</Text>: 그룹 표시 방식
                    (groupRows, singleColumn 등)
                  </li>
                  <li>
                    <Text code>groupTotalRow</Text>: 합계 행 위치 (top, bottom)
                  </li>
                  <li>
                    <Text code>autoGroupColumnDef</Text>: 그룹 컬럼 커스터마이징
                  </li>
                </ul>
                <Text strong>주요 집계 함수:</Text>
                <ul>
                  <li>
                    <Text code>sum</Text>: 합계
                  </li>
                  <li>
                    <Text code>avg</Text>: 평균
                  </li>
                  <li>
                    <Text code>min</Text>: 최소값
                  </li>
                  <li>
                    <Text code>max</Text>: 최대값
                  </li>
                  <li>
                    <Text code>count</Text>: 개수
                  </li>
                </ul>
                <Text type="warning">
                  AG-Grid Enterprise 라이선스가 필요합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제 (카테고리별 소계/합계)</Title>
              <CommonAgGrid<SummaryGridData>
                rowData={summaryGridData}
                columnDefs={summaryGridColumnDefs}
                height={400}
                gridOptions={{
                  groupDisplayType: "groupRows",
                  groupDefaultExpanded: 1,
                  groupTotalRow: "bottom",
                  autoGroupColumnDef: {
                    headerName: "그룹",
                    minWidth: 200,
                    cellRenderer: "agGroupCellRenderer",
                    cellRendererParams: {
                      suppressCount: false,
                      checkbox: false,
                    },
                  },
                  animateRows: true,
                  pagination: false,
                  enableRangeSelection: true,
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* CustomAgGrid - 스타일 커스터마이징 */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomAgGrid</Tag>
              <Text type="secondary">
                스타일 커스터마이징 (Style Customization)
              </Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>styleOptions Props:</Text>
                <ul>
                  <li>
                    <Text code>backgroundColor</Text>: 그리드 배경색
                  </li>
                  <li>
                    <Text code>color</Text>: 텍스트 색상
                  </li>
                  <li>
                    <Text code>borderColor</Text>: 테두리 색상
                  </li>
                  <li>
                    <Text code>borderRadius</Text>: 테두리 둥글기
                  </li>
                  <li>
                    <Text code>headerBackgroundColor</Text>: 헤더 배경색
                  </li>
                  <li>
                    <Text code>headerColor</Text>: 헤더 텍스트 색상
                  </li>
                  <li>
                    <Text code>headerFontWeight</Text>: 헤더 폰트 굵기
                  </li>
                  <li>
                    <Text code>oddRowBackgroundColor</Text>: 홀수 행 배경색
                  </li>
                  <li>
                    <Text code>evenRowBackgroundColor</Text>: 짝수 행 배경색
                  </li>
                  <li>
                    <Text code>hoverRowBackgroundColor</Text>: 호버 행 배경색
                  </li>
                  <li>
                    <Text code>selectedRowBackgroundColor</Text>: 선택 행 배경색
                  </li>
                  <li>
                    <Text code>iconColor</Text>: 아이콘 색상
                  </li>
                  <li>
                    <Text code>rowHeight</Text>: 행 높이
                  </li>
                  <li>
                    <Text code>headerHeight</Text>: 헤더 높이
                  </li>
                </ul>
                <Text type="warning">
                  AG-Grid Enterprise 라이선스가 필요합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제 (스타일 커스터마이징)</Title>
              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: "16px" }}
              >
                <Space wrap>
                  <Button
                    type="primary"
                    onClick={() => {
                      setGridStyleOptions({
                        backgroundColor: "#ffffff",
                        borderColor: "#d0d5dd",
                        borderRadius: "8px",
                        headerBackgroundColor: "#f8f9fa",
                        headerColor: "#1a1a1a",
                        headerFontWeight: "600",
                        oddRowBackgroundColor: "#ffffff",
                        evenRowBackgroundColor: "#fafafa",
                        hoverRowBackgroundColor: "#f5f5f5",
                        selectedRowBackgroundColor: "#e3f2fd",
                        iconColor: "#6b7280",
                      });
                    }}
                  >
                    기본 스타일
                  </Button>
                  <Button
                    onClick={() => {
                      setGridStyleOptions({
                        backgroundColor: "#1a1a1a",
                        color: "#ffffff",
                        borderColor: "#404040",
                        borderRadius: "12px",
                        headerBackgroundColor: "#2d2d2d",
                        headerColor: "#ffffff",
                        headerFontWeight: "700",
                        oddRowBackgroundColor: "#1a1a1a",
                        evenRowBackgroundColor: "#252525",
                        hoverRowBackgroundColor: "#2d2d2d",
                        selectedRowBackgroundColor: "#3a3a3a",
                        iconColor: "#a0a0a0",
                      });
                    }}
                  >
                    다크 모드
                  </Button>
                  <Button
                    onClick={() => {
                      setGridStyleOptions({
                        backgroundColor: "#f0f9ff",
                        borderColor: "#0ea5e9",
                        borderRadius: "16px",
                        headerBackgroundColor: "#0ea5e9",
                        headerColor: "#ffffff",
                        headerFontWeight: "700",
                        oddRowBackgroundColor: "#ffffff",
                        evenRowBackgroundColor: "#f0f9ff",
                        hoverRowBackgroundColor: "#e0f2fe",
                        selectedRowBackgroundColor: "#bae6fd",
                        iconColor: "#0284c7",
                      });
                    }}
                  >
                    블루 테마
                  </Button>
                  <Button
                    onClick={() => {
                      setGridStyleOptions({
                        backgroundColor: "#fef3c7",
                        borderColor: "#f59e0b",
                        borderRadius: "20px",
                        headerBackgroundColor: "#f59e0b",
                        headerColor: "#ffffff",
                        headerFontWeight: "700",
                        oddRowBackgroundColor: "#ffffff",
                        evenRowBackgroundColor: "#fef3c7",
                        hoverRowBackgroundColor: "#fde68a",
                        selectedRowBackgroundColor: "#fcd34d",
                        iconColor: "#d97706",
                      });
                    }}
                  >
                    오렌지 테마
                  </Button>
                  <Button
                    onClick={() => {
                      setGridStyleOptions({
                        backgroundColor: "#f3e8ff",
                        borderColor: "#a855f7",
                        borderRadius: "8px",
                        headerBackgroundColor: "#a855f7",
                        headerColor: "#ffffff",
                        headerFontWeight: "700",
                        oddRowBackgroundColor: "#ffffff",
                        evenRowBackgroundColor: "#f3e8ff",
                        hoverRowBackgroundColor: "#e9d5ff",
                        selectedRowBackgroundColor: "#d8b4fe",
                        iconColor: "#9333ea",
                      });
                    }}
                  >
                    퍼플 테마
                  </Button>
                </Space>
              </Space>
              <CommonAgGrid<DemoGridData>
                rowData={gridData}
                columnDefs={gridColumnDefs}
                height={200}
                styleOptions={gridStyleOptions}
                gridOptions={{
                  rowSelection: "multiple",
                  animateRows: true,
                  pagination: false,
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* CustomAgGrid - 행 추가/삭제 */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="blue">CustomAgGrid</Tag>
              <Text type="secondary">행 추가/삭제 기능</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>행 추가:</Text>
                <ul>
                  <li>
                    <Text code>onGridReady</Text>: 그리드 API 참조 저장
                  </li>
                  <li>
                    <Text code>gridApiRef.current</Text>: 그리드 API 접근
                  </li>
                  <li>새 행 데이터를 state에 추가</li>
                  <li>
                    <Text code>setFocusedCell</Text>: 새 행에 포커스 이동
                  </li>
                  <li>
                    <Text code>startEditingCell</Text>: 셀 편집 모드 시작
                  </li>
                </ul>
                <Text strong>행 삭제:</Text>
                <ul>
                  <li>
                    <Text code>getSelectedRows()</Text>: 선택된 행 가져오기
                  </li>
                  <li>선택된 행의 ID로 필터링하여 삭제</li>
                  <li>
                    <Text code>deselectAll()</Text>: 선택 해제
                  </li>
                </ul>
                <Text strong>주의사항:</Text>
                <ul>
                  <li>행 선택 모드를 활성화해야 삭제 가능</li>
                  <li>
                    <Text code>checkboxSelection: true</Text> 또는{" "}
                    <Text code>rowSelection: "multiple"</Text> 설정 필요
                  </li>
                  <li>
                    그리드 API는 <Text code>onGridReady</Text>에서 접근 가능
                  </li>
                </ul>
                <Text type="warning">
                  AG-Grid Enterprise 라이선스가 필요합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제 (행 추가/삭제)</Title>
              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: "16px" }}
              >
                <Space wrap>
                  <Button type="primary" onClick={handleAddRow}>
                    행 추가
                  </Button>
                  <Button danger onClick={handleDeleteRows}>
                    선택 행 삭제
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("전체 데이터:", editableGridData);
                    }}
                  >
                    데이터 확인
                  </Button>
                </Space>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  체크박스를 선택한 후 "선택 행 삭제" 버튼을 클릭하세요.
                </Text>
              </Space>
              <CommonAgGrid<DemoGridData>
                rowData={editableGridData}
                columnDefs={editableGridColumnDefs}
                height={300}
                onGridReady={onGridReady}
                gridOptions={{
                  rowSelection: "multiple",
                  animateRows: true,
                  pagination: false,
                }}
              />
            </Col>
          </Row>
        </Card>
      </Card>

      {/* 공통 컴포넌트 섹션 */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>🔄 공통 컴포넌트</Title>
        <Divider />

        {/* LoadingSpinner */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="green">LoadingSpinner</Tag>
              <Text type="secondary">로딩 스피너</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>size</Text>: 크기 (small, default, large)
                  </li>
                  <li>
                    <Text code>tip</Text>: 로딩 메시지
                  </li>
                  <li>
                    <Text code>fullScreen</Text>: 전체 화면 모드
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button onClick={handleLoadingDemo}>로딩 데모 (2초)</Button>
                {loading && <LoadingSpinner size="large" fullScreen />}
                <LoadingSpinner size="default" />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* AppPageModal */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="green">AppPageModal</Tag>
              <Text type="secondary">페이지 모달 (값 반환 지원)</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>open</Text>: 모달 열림 상태
                  </li>
                  <li>
                    <Text code>onClose</Text>: 닫기 핸들러
                  </li>
                  <li>
                    <Text code>onReturn</Text>: 값 반환 핸들러
                  </li>
                  <li>
                    <Text code>page</Text>: 모달 내부에 렌더링할 컴포넌트
                  </li>
                  <li>
                    <Text code>pageProps</Text>: 페이지 컴포넌트에 전달할 props
                  </li>
                </ul>
                <Text type="warning">
                  페이지 컴포넌트는 <Text code>InjectedProps</Text>를 받아야
                  합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  onClick={() => {
                    const searchValue = form.getFieldValue("search");
                    setModalInitialId(searchValue || undefined);
                    setModalOpen(true);
                  }}
                >
                  모달 열기
                </Button>
                {user && (
                  <Text>
                    선택된 사용자: {user.name} (ID: {user.id})
                  </Text>
                )}
                <AppPageModal<{ initialId?: string }, User>
                  open={modalOpen}
                  onClose={() => {
                    setModalOpen(false);
                    setModalInitialId(undefined);
                  }}
                  onReturn={(value) => {
                    console.log("반환된 값:", value);
                    setUser(value);
                    form.setFieldsValue({ search: value.id });
                    form.setFieldsValue({ userName2: value.name });
                    setModalOpen(false);
                    setModalInitialId(undefined);
                  }}
                  title="사용자 선택"
                  page={ModalPopup}
                  pageProps={{
                    initialId: modalInitialId,
                  }}
                  modalProps={{ centered: true }}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* AppMessageModal */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="green">AppMessageModal</Tag>
              <Text type="secondary">메시지 모달 (Confirm, Alert)</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Confirm (확인 모달):</Text>
                <ul>
                  <li>
                    <Text code>confirm(options)</Text>: 확인/취소 모달
                  </li>
                  <li>
                    <Text code>title</Text>: 모달 제목
                  </li>
                  <li>
                    <Text code>content</Text>: 모달 내용
                  </li>
                  <li>
                    <Text code>okText</Text>: 확인 버튼 텍스트
                  </li>
                  <li>
                    <Text code>cancelText</Text>: 취소 버튼 텍스트
                  </li>
                  <li>
                    <Text code>onOk</Text>: 확인 버튼 클릭 핸들러
                  </li>
                  <li>
                    <Text code>onCancel</Text>: 취소 버튼 클릭 핸들러
                  </li>
                </ul>
                <Text strong>Alert (알림 모달):</Text>
                <ul>
                  <li>
                    <Text code>info/success/error/warning(options)</Text>:
                    정보/성공/에러/경고 모달
                  </li>
                  <li>
                    <Text code>title</Text>: 모달 제목
                  </li>
                  <li>
                    <Text code>content</Text>: 모달 내용
                  </li>
                  <li>
                    <Text code>okText</Text>: 확인 버튼 텍스트
                  </li>
                  <li>
                    <Text code>onOk</Text>: 확인 버튼 클릭 핸들러
                  </li>
                </ul>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5}>1. Confirm 모달</Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      confirm({
                        title: "삭제 확인",
                        content: "정말로 삭제하시겠습니까?",
                        okText: "삭제",
                        cancelText: "취소",
                        onOk: () => {
                          showSuccess("삭제되었습니다.");
                        },
                        onCancel: () => {
                          showInfo("취소되었습니다.");
                        },
                      });
                    }}
                  >
                    Confirm (삭제)
                  </Button>
                  <Button
                    onClick={() => {
                      confirm({
                        title: "저장 확인",
                        content: "변경사항을 저장하시겠습니까?",
                        onOk: async () => {
                          showLoading("저장 중...");
                          // 비동기 작업 시뮬레이션
                          await new Promise((resolve) =>
                            setTimeout(resolve, 1000)
                          );
                          showSuccess("저장되었습니다.");
                        },
                      });
                    }}
                  >
                    Confirm (비동기)
                  </Button>
                </Space>

                <Title level={5} style={{ marginTop: "16px" }}>
                  2. Alert 모달
                </Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      info({
                        title: "안내",
                        content: "이것은 정보 메시지입니다.",
                      });
                    }}
                  >
                    Info
                  </Button>
                  <Button
                    onClick={() => {
                      success({
                        title: "성공",
                        content: "작업이 성공적으로 완료되었습니다.",
                      });
                    }}
                  >
                    Success
                  </Button>
                  <Button
                    onClick={() => {
                      error({
                        title: "에러",
                        content: "오류가 발생했습니다.",
                      });
                    }}
                  >
                    Error
                  </Button>
                  <Button
                    onClick={() => {
                      warning({
                        title: "경고",
                        content: "주의가 필요합니다.",
                      });
                    }}
                  >
                    Warning
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* AppMessage */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="green">AppMessage</Tag>
              <Text type="secondary">토스트 메시지 (Toast Message)</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>함수:</Text>
                <ul>
                  <li>
                    <Text code>showSuccess(content, duration)</Text>: 성공
                    메시지
                  </li>
                  <li>
                    <Text code>showError(content, duration)</Text>: 에러 메시지
                  </li>
                  <li>
                    <Text code>showInfo(content, duration)</Text>: 정보 메시지
                  </li>
                  <li>
                    <Text code>showWarning(content, duration)</Text>: 경고
                    메시지
                  </li>
                  <li>
                    <Text code>showLoading(content)</Text>: 로딩 메시지
                  </li>
                  <li>
                    <Text code>show(content, type, duration)</Text>: 일반 메시지
                  </li>
                </ul>
                <Text strong>Parameters:</Text>
                <ul>
                  <li>
                    <Text code>content</Text>: 메시지 내용 (필수)
                  </li>
                  <li>
                    <Text code>duration</Text>: 표시 시간 (초, 기본값: 2)
                  </li>
                  <li>
                    <Text code>type</Text>: 메시지 타입 (success, error, info,
                    warning, loading)
                  </li>
                </ul>
                <Text type="secondary">
                  화면 우측 상단에 토스트 메시지가 표시됩니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5}>1. 기본 메시지</Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      showSuccess("작업이 성공적으로 완료되었습니다.");
                    }}
                  >
                    Success
                  </Button>
                  <Button
                    onClick={() => {
                      showError("오류가 발생했습니다.");
                    }}
                  >
                    Error
                  </Button>
                  <Button
                    onClick={() => {
                      showInfo("정보 메시지입니다.");
                    }}
                  >
                    Info
                  </Button>
                  <Button
                    onClick={() => {
                      showWarning("경고 메시지입니다.");
                    }}
                  >
                    Warning
                  </Button>
                </Space>

                <Title level={5} style={{ marginTop: "16px" }}>
                  2. 커스텀 Duration
                </Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      showSuccess("5초간 표시되는 메시지", 5);
                    }}
                  >
                    Success (5초)
                  </Button>
                  <Button
                    onClick={() => {
                      showError("3초간 표시되는 에러", 3);
                    }}
                  >
                    Error (3초)
                  </Button>
                </Space>

                <Title level={5} style={{ marginTop: "16px" }}>
                  3. 로딩 메시지
                </Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      const hide = showLoading("처리 중...");
                      setTimeout(() => {
                        hide();
                        showSuccess("처리가 완료되었습니다.");
                      }, 2000);
                    }}
                  >
                    Loading → Success
                  </Button>
                </Space>

                <Title level={5} style={{ marginTop: "16px" }}>
                  4. show 함수 사용
                </Title>
                <Space wrap>
                  <Button
                    onClick={() => {
                      show("성공 메시지", "success");
                    }}
                  >
                    show (success)
                  </Button>
                  <Button
                    onClick={() => {
                      show("에러 메시지", "error");
                    }}
                  >
                    show (error)
                  </Button>
                  <Button
                    onClick={() => {
                      show("정보 메시지", "info", 4);
                    }}
                  >
                    show (info, 4초)
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ErrorBoundary */}
        <Card
          type="inner"
          title={
            <Space>
              <Tag color="orange">ErrorBoundary</Tag>
              <Text type="secondary">에러 경계 컴포넌트</Text>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Title level={4}>
                <BulbOutlined /> 사용법
              </Title>
              <Paragraph>
                <Text strong>Props:</Text>
                <ul>
                  <li>
                    <Text code>children</Text>: 자식 컴포넌트 (필수)
                  </li>
                  <li>
                    <Text code>fallback</Text>: 커스텀 에러 UI (선택적)
                  </li>
                </ul>
                <Text strong>기능:</Text>
                <ul>
                  <li>React 컴포넌트 트리에서 발생하는 에러를 캐치</li>
                  <li>에러 발생 시 에러 UI를 표시</li>
                  <li>개발 모드에서 에러 정보를 콘솔에 출력</li>
                  <li>에러 발생 시 홈으로 이동 버튼 제공</li>
                </ul>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  주의: ErrorBoundary는 클래스 컴포넌트로 구현되어 있으며, 함수
                  컴포넌트의 에러는 캐치하지 못합니다. 비동기 에러나 이벤트
                  핸들러의 에러는 직접 처리해야 합니다.
                </Text>
              </Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <Title level={4}>예제</Title>
              <Paragraph>
                <Text strong>기본 사용법:</Text>
              </Paragraph>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {`// App.tsx에서 사용 예시
import ErrorBoundary from "@components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}`}
              </pre>
              <Paragraph style={{ marginTop: "16px" }}>
                <Text strong>커스텀 fallback 사용:</Text>
              </Paragraph>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {`<ErrorBoundary
  fallback={
    <div>
      <h1>에러가 발생했습니다</h1>
      <button onClick={() => window.location.reload()}>
        새로고침
      </button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>`}
              </pre>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Import 가이드 */}
      <Card>
        <Title level={2}>📦 Import 가이드</Title>
        <Divider />
        <Paragraph>
          <Title level={4}>Form 컴포넌트</Title>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {`import CustomInput, { CustomSearchInput } from "@form/CustomInput";
import CustomSelect from "@form/CustomSelect";
import CustomDatePicker from "@form/CustomDatePicker";
import CustomRadioGroup from "@form/CustomRadioGroup";
import CustomCheckbox from "@form/CustomCheckbox";
import CustomTree from "@form/CustomTree";
import CustomButton from "@form/CustomButton";
import CommonAgGrid from "@components/common/form/CustomAgGrid";`}
          </pre>
        </Paragraph>
        <Paragraph>
          <Title level={4}>공통 컴포넌트</Title>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {`import LoadingSpinner from "@components/common/LoadingSpinner";
import AppPageModal from "@components/common/pageModal";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { confirm, info, success, error, warning, showSuccess, showError, showInfo, showWarning, showLoading, show } from "@components/common/message";`}
          </pre>
        </Paragraph>
      </Card>
    </div>
  );
};

export default Sample1;
