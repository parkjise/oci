// ============================================================================
// Import
// ============================================================================
import React, { Suspense } from "react";
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
  Tabs,
  Collapse,
} from "antd";
import { CodeOutlined, BulbOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { DataNode } from "antd/es/tree";
import { type ColDef, type GridApi } from "ag-grid-community";
import {
  createGridReadyHandlerRef,
  addNewRow,
  deleteSelectedRows,
  formatCurrency,
  formatNumber,
  formatDateKorean,
  createCheckboxColumn,
  createTextColumn,
  createSelectColumn,
  createDateColumn,
  createNumberColumn,
  createTextAreaColumn,
  createCheckboxColumnEditable,
} from "@utils/agGridUtils";
import {
  FormInput,
  FormSearchInput,
  FormTextArea,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormCheckbox,
  FormTree,
  FormButton,
  FormAgGrid,
  type AgGridStyleOptions,
} from "@components/ui/form";
import { MenuButtonProvider } from "@/components/providers";
import { LoadingSpinner, AppPageModal } from "@components/ui/feedback";
import { usePageModal } from "@hooks/usePageModal";
import {
  confirm,
  info,
  success,
  error,
  warning,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  show,
} from "@components/ui/feedback/Message";
import type {
  DemoFormType,
  DemoGridData,
  SummaryGridData,
  MultiEditGridData,
} from "@/types/sample.types";
import {
  INITIAL_GRID_DATA,
  INITIAL_MULTI_EDIT_GRID_DATA,
  SUMMARY_GRID_DATA,
  TREE_DATA,
} from "./sampleData";

const { Title, Paragraph, Text } = Typography;

// ============================================================================
// Lazy Imports
// ============================================================================
const Sample2 = React.lazy(() => import("../sample2/Sample2"));
const Sample3 = React.lazy(() => import("../sample3/Sample3"));
const Sample4 = React.lazy(() => import("../sample4/Sample4"));

// ============================================================================
// 컴포넌트
// ============================================================================
const Sample1: React.FC = () => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [form] = Form.useForm<DemoFormType>();
  const [loading, setLoading] = React.useState(false);

  // ModalPopup에서 User 타입 import
  type User = import("@pages/sample/pageModal/ModalPopup").User;
  const [user, setUser] = React.useState<User | null>(null);

  // 모달 훅 사용
  const userModal = usePageModal<{ initialId?: string }, User>(
    React.lazy(() => import("@pages/sample/pageModal/ModalPopup")),
    {
      title: "사용자 선택",
      centered: true,
      onReturn: (value) => {
        setUser(value);
        form.setFieldsValue({
          search: value.id,
          userName2: value.name,
        });
      },
    }
  );
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
  const [summaryGridData] =
    React.useState<SummaryGridData[]>(SUMMARY_GRID_DATA);

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
  const treeData: DataNode[] = TREE_DATA;

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
      valueFormatter: formatCurrency,
    },
  ];

  const editableGridColumnDefs: ColDef<DemoGridData>[] = [
    createCheckboxColumn<DemoGridData>("id", "ID", 80),
    { headerName: "이름", field: "name", flex: 1 },
    { headerName: "카테고리", field: "category", flex: 1 },
    {
      headerName: "금액",
      field: "amount",
      flex: 1,
      valueFormatter: formatCurrency,
    },
  ];

  const multiEditGridColumnDefs: ColDef<MultiEditGridData>[] = [
    createCheckboxColumn<MultiEditGridData>("id", "ID", 80),
    createTextColumn<MultiEditGridData>("name", "이름", undefined, 1),
    createSelectColumn<MultiEditGridData>(
      "category",
      "카테고리",
      ["개발", "디자인", "기획", "마케팅", "운영"],
      150
    ),
    createSelectColumn<MultiEditGridData>(
      "status",
      "상태",
      ["대기", "진행중", "완료", "취소"],
      120
    ),
    createDateColumn<MultiEditGridData>(
      "startDate",
      "시작일",
      150,
      new Date(2020, 0, 1),
      new Date(2030, 11, 31),
      formatDateKorean
    ),
    createNumberColumn<MultiEditGridData>(
      "amount",
      "금액",
      150,
      0,
      undefined,
      formatCurrency
    ),
    {
      ...createTextAreaColumn<MultiEditGridData>(
        "description",
        "설명",
        undefined,
        200
      ),
      flex: 1,
      cellEditorParams: {
        maxLength: 200,
        rows: 3,
      },
    },
    createCheckboxColumnEditable<MultiEditGridData>("isActive", "활성화", 120),
    createCheckboxColumnEditable<MultiEditGridData>(
      "isApproved",
      "승인됨",
      120
    ),
    createCheckboxColumnEditable<MultiEditGridData>(
      "isPublished",
      "발행됨",
      120
    ),
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
      valueFormatter: formatNumber,
    },
    {
      headerName: "단가",
      field: "unitPrice",
      width: 120,
      aggFunc: "avg",
      valueFormatter: formatCurrency,
    },
    {
      headerName: "합계",
      field: "total",
      width: 150,
      aggFunc: "sum",
      valueFormatter: formatCurrency,
    },
  ];

  // --------------------------------------------------------------------------
  // 핸들러 함수
  // --------------------------------------------------------------------------
  const onFinish: FormProps<DemoFormType>["onFinish"] = (values) => {
    if (import.meta.env.DEV) {
      console.log("Form values:", values);
    }
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

  const onGridReady = createGridReadyHandlerRef<DemoGridData>(gridApiRef);

  const handleAddRow = () => {
    addNewRow(
      editableGridData,
      (newId) => ({
        id: newId as number,
        name: `새 항목 ${newId}`,
        category: "카테고리 A",
        amount: 0,
      }),
      setEditableGridData,
      gridApiRef.current,
      "name"
    );
  };

  const handleDeleteRows = () => {
    deleteSelectedRows(
      gridApiRef.current,
      editableGridData,
      setEditableGridData,
      (row) => row.id,
      () => {
        if (import.meta.env.DEV) {
          console.log("삭제할 행을 선택해주세요.");
        }
      }
    );
  };

  // --------------------------------------------------------------------------
  // Render - Sample1 Content
  // --------------------------------------------------------------------------
  const renderSample1Content = () => (
    <div style={{ padding: "24px", width: "100%", maxWidth: "100%" }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={1}>
          <CodeOutlined /> Components 개발자 가이드
        </Title>
        <Paragraph style={{ marginTop: "16px", fontSize: "16px" }}>
          프로젝트에서 사용하는 Form 컴포넌트와 공통 컴포넌트의 사용법을
          안내합니다. 각 컴포넌트의 Props와 사용 예제를 확인할 수 있습니다.
        </Paragraph>
      </div>

      {/* Form 컴포넌트 섹션 */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>📝 Form 컴포넌트</Title>
        <Divider />

        <Collapse
          defaultActiveKey={[]}
          items={[
            {
              key: "form-input",
              label: (
                <Space>
                  <Tag color="blue">FormInput</Tag>
                  <Text type="secondary">일반 입력 필드</Text>
                </Space>
              ),
              children: (
                <div id="form-input">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용 방법
                      </Title>
                      <Paragraph>
                        <Text strong>필수 Props:</Text>
                        <ul>
                          <li>
                            <Text code>name</Text>: 폼 필드 이름
                          </li>
                          <li>
                            <Text code>label</Text>: 레이블 텍스트
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          주요 Props:
                        </Text>
                        <ul>
                          <li>
                            <Text code>type</Text>: "text" | "number" |
                            "password" | "email" (기본값: "text")
                          </li>
                          <li>
                            <Text code>placeholder</Text>: 안내 문구
                          </li>
                          <li>
                            <Text code>rules</Text>: 검증 규칙 배열
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 모달 메시지 사용
                            여부 (기본값: true)
                          </li>
                          <li>
                            <Text code>addonAfter</Text>: 입력 필드 뒤 텍스트
                            (예: "원", "개")
                          </li>
                          <li>
                            <Text code>max</Text>: 최대값/최대 글자 수
                          </li>
                          <li>
                            <Text code>min</Text>: 최소값 (type="number"일 때)
                          </li>
                          <li>
                            <Text code>step</Text>: 증감 간격 (type="number"일
                            때)
                          </li>
                        </ul>

                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "16px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            💡 type="number" 사용 시:
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>InputNumber 컴포넌트가 자동으로 사용됩니다</li>
                            <li>천 단위 구분자(쉼표)가 자동 적용됩니다</li>
                            <li>증감 버튼이 표시됩니다</li>
                          </ul>
                        </div>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 예제</Title>
                      <Form form={form} layout="vertical" onFinish={onFinish}>
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 1: 기본 텍스트 입력
                          </Text>
                          <FormInput
                            name="userName"
                            label="사용자명"
                            placeholder="사용자명을 입력하세요"
                            rules={[
                              {
                                required: true,
                                message: "사용자명을 입력해주세요!",
                              },
                            ]}
                          />
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 2: 이메일 입력
                          </Text>
                          <FormInput
                            name="email"
                            label="이메일"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            rules={[
                              {
                                required: true,
                                message: "이메일을 입력해주세요!",
                              },
                              {
                                type: "email",
                                message: "올바른 이메일 형식이 아닙니다!",
                              },
                            ]}
                          />
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 3: 비밀번호 입력
                          </Text>
                          <FormInput
                            name="password"
                            label="비밀번호"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            layout="horizontal"
                            rules={[
                              {
                                required: true,
                                message: "비밀번호를 입력해주세요!",
                              },
                            ]}
                            max={10}
                          />
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 4: 숫자 입력
                          </Text>
                          <FormInput
                            name="amount"
                            label="금액"
                            type="number"
                            placeholder="금액을 입력하세요"
                            addonAfter="원"
                            min={0}
                            max={100000000}
                            step={1000}
                            rules={[
                              {
                                required: true,
                                message: "금액을 입력해주세요!",
                              },
                            ]}
                          />
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#8b5cf6" }}
                          >
                            예제 5: 모달 메시지 vs 인라인 메시지
                          </Text>
                          <FormInput
                            name="modalExample"
                            label="모달 메시지 (기본값)"
                            placeholder="비워두고 제출해보세요"
                            rules={[
                              { required: true, message: "값을 입력해주세요!" },
                            ]}
                            useModalMessage={true}
                          />
                          <FormInput
                            name="inlineExample"
                            label="인라인 메시지"
                            placeholder="비워두고 제출해보세요"
                            rules={[
                              { required: true, message: "값을 입력해주세요!" },
                            ]}
                            useModalMessage={false}
                          />
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 6: 여러 필수값 검증
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            모든 필드를 비워두고 제출하면 첫 번째 오류만 모달로
                            표시되고, 나머지는 인라인으로 표시됩니다
                          </Text>
                          <FormInput
                            name="field1"
                            label="필드 1 (필수)"
                            placeholder="비워두고 제출해보세요"
                            rules={[
                              {
                                required: true,
                                message: "필드 1을 입력해주세요!",
                              },
                            ]}
                          />
                          <FormInput
                            name="field2"
                            label="필드 2 (필수)"
                            placeholder="비워두고 제출해보세요"
                            rules={[
                              {
                                required: true,
                                message: "필드 2를 입력해주세요!",
                              },
                            ]}
                          />
                          <FormSelect
                            name="field3"
                            label="필드 3 (필수)"
                            placeholder="선택해주세요"
                            options={[
                              { value: "option1", label: "옵션 1" },
                              { value: "option2", label: "옵션 2" },
                            ]}
                            rules={[
                              {
                                required: true,
                                message: "필드 3을 선택해주세요!",
                              },
                            ]}
                          />
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-search-input",
              label: (
                <Space>
                  <Tag color="blue">FormSearchInput</Tag>
                  <Text type="secondary">검색 입력 필드</Text>
                </Space>
              ),
              children: (
                <div id="form-search-input">
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
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>onSearch</Text>: 검색 버튼 클릭 시
                            실행되는 함수
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
                          Ant Design의 Input.Search 컴포넌트의 모든 props를
                          지원합니다.
                        </Text>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>예제</Title>
                      <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Space>
                          <FormSearchInput
                            name="search"
                            label="검색"
                            placeholder="검색어를 입력하세요"
                            layout="horizontal"
                            onSearch={(value) => {
                              userModal.openModal({
                                initialId: value || undefined,
                              });
                            }}
                            rules={[
                              {
                                required: true,
                                message: "검색어를 입력해주세요!",
                              },
                            ]}
                          />
                          <FormInput
                            name="userName2"
                            label=""
                            readOnly={true}
                            rules={[{ required: false }]}
                          />
                        </Space>
                        <FormSearchInput
                          name="searchWithButton"
                          label="검색 (커스텀 버튼)"
                          placeholder="검색어를 입력하세요"
                          enterButton="검색"
                          onSearch={(value) => {
                            if (import.meta.env.DEV) {
                              console.log("검색:", value);
                            }
                          }}
                        />
                        <FormSearchInput
                          name="searchWithIcon"
                          label="검색 (아이콘 버튼)"
                          placeholder="검색어를 입력하세요"
                          enterButton
                          onSearch={(value) => {
                            if (import.meta.env.DEV) {
                              console.log("검색:", value);
                            }
                          }}
                        />
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-textarea",
              label: (
                <Space>
                  <Tag color="blue">FormTextArea</Tag>
                  <Text type="secondary">텍스트 영역 입력 필드</Text>
                </Space>
              ),
              children: (
                <div id="form-textarea">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <div style={{ marginBottom: "16px" }}>
                        <Text strong style={{ fontSize: "15px" }}>
                          📌 이 컴포넌트는 무엇인가요?
                        </Text>
                        <Paragraph
                          style={{ marginTop: "8px", marginBottom: "12px" }}
                        >
                          여러 줄의 텍스트를 입력할 수 있는 넓은 입력
                          필드입니다. 긴 설명이나 댓글, 메모 등을 작성할 때
                          사용합니다. 글자 수 제한 기능을 지원하여 입력할 수
                          있는 글자 수를 제한할 수 있습니다.
                        </Paragraph>
                      </div>

                      <Title level={4}>
                        <BulbOutlined /> 사용 방법
                      </Title>
                      <Paragraph>
                        <Text strong>필수 항목:</Text>
                        <ul>
                          <li>
                            <Text code>name</Text>: 폼에서 이 필드를 구분하는
                            이름 (예: "description", "comment")
                          </li>
                          <li>
                            <Text code>label</Text>: 사용자에게 보여줄 레이블
                            텍스트 (예: "설명", "댓글")
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          선택 항목 (필요한 것만 사용):
                        </Text>
                        <ul>
                          <li>
                            <Text code>placeholder</Text>: 입력 필드 안에
                            표시되는 안내 문구 (예: "설명을 입력하세요")
                          </li>
                          <li>
                            <Text code>rows</Text>: 입력 필드의 높이(줄 수) 설정
                            (기본값: 4)
                          </li>
                          <li>
                            <Text code>max</Text>: 최대 입력 가능한 글자 수
                            (설정 시 자동으로 글자 수 카운터 표시)
                          </li>
                          <li>
                            <Text code>rules</Text>: 입력값 검증 규칙
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>required</Text>: 필수 입력 여부
                              </li>
                              <li>
                                <Text code>message</Text>: 오류 시 표시할 메시지
                              </li>
                              <li>
                                <Text code>max</Text>: 최대 글자 수 제한
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>disabled</Text>: 입력 불가능하게 만들기
                            (true/false)
                          </li>
                          <li>
                            <Text code>layout</Text>: 레이블과 입력 필드의 배치
                            방식
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>"vertical"</Text>: 레이블이 위에 배치
                                (기본값)
                              </li>
                              <li>
                                <Text code>"horizontal"</Text>: 레이블이 왼쪽에
                                배치
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Text code>autoSize</Text>: 입력 내용에 따라 높이
                            자동 조절 (true/false 또는 객체)
                          </li>
                        </ul>

                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "16px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            💡 참고 사항:
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>max</Text> prop을 설정하면 자동으로
                              글자 수 카운터가 표시됩니다.
                            </li>
                            <li>
                              이모지와 유니코드 문자도 정확하게 글자 수를
                              계산합니다.
                            </li>
                            <li>
                              Ant Design의 TextArea 컴포넌트의 모든 기능을
                              사용할 수 있습니다.
                            </li>
                          </ul>
                        </div>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 실제 동작 예제</Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        각 예제를 직접 입력해보고 확인하세요!
                      </Text>
                      <Form form={form} layout="vertical" onFinish={onFinish}>
                        {/* 예제 1: 기본 TextArea */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 1: 기본 텍스트 영역
                          </Text>
                          <FormTextArea
                            name="description"
                            label="설명"
                            placeholder="설명을 입력하세요"
                            rows={4}
                            rules={[
                              {
                                required: true,
                                message: "설명을 입력해주세요!",
                              },
                            ]}
                          />
                        </div>

                        {/* 예제 2: 글자 수 제한 포함 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 2: 글자 수 제한
                          </Text>
                          <FormTextArea
                            name="comment"
                            label="댓글"
                            placeholder="댓글을 입력하세요 (최대 200자)"
                            rows={4}
                            max={200}
                            rules={[
                              {
                                required: true,
                                message: "댓글을 입력해주세요!",
                              },
                              {
                                max: 200,
                                message: "200자 이하로 입력해주세요!",
                              },
                            ]}
                          />
                        </div>

                        {/* 예제 3: 자동 높이 조절 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#8b5cf6" }}
                          >
                            예제 3: 자동 높이 조절
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            입력 내용에 따라 높이가 자동으로 조절됩니다
                          </Text>
                          <FormTextArea
                            name="memo"
                            label="메모"
                            placeholder="메모를 입력하세요"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            max={500}
                          />
                        </div>

                        {/* 예제 4: 가로 배치 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#f59e0b" }}
                          >
                            예제 4: 가로 배치
                          </Text>
                          <FormTextArea
                            name="notes"
                            label="비고"
                            placeholder="비고를 입력하세요"
                            layout="horizontal"
                            rows={3}
                          />
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-select",
              label: (
                <Space>
                  <Tag color="blue">FormSelect</Tag>
                  <Text type="secondary">
                    선택 박스 (공통코드 API 연동 지원)
                  </Text>
                </Space>
              ),
              children: (
                <div id="form-select">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용 방법
                      </Title>
                      <Paragraph>
                        <Text strong>필수 항목:</Text>
                        <ul>
                          <li>
                            <Text code>name</Text>: 폼에서 이 필드를 구분하는
                            이름
                          </li>
                          <li>
                            <Text code>label</Text>: 사용자에게 보여줄 레이블
                            텍스트
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          옵션을 제공하는 방법 (둘 중 하나 선택):
                        </Text>

                        <div
                          style={{
                            background: "#eff6ff",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 1: 직접 옵션 배열 전달
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>options</Text>: 선택 옵션 배열 직접
                              작성
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                예:{" "}
                                <Text code>
                                  {`[{value: "A", label: "옵션 A"}, {value: "B", label: "옵션 B"}]`}
                                </Text>
                              </Text>
                            </li>
                          </ul>
                        </div>

                        <div
                          style={{
                            background: "#f0fdf4",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 2: 서버에서 자동으로 가져오기 (공통코드 API)
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>comCodeParams</Text>: 서버 API 파라미터
                              <ul style={{ marginTop: "4px" }}>
                                <li>
                                  <Text code>module</Text>: 모듈 코드
                                  <br />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "11px" }}
                                  >
                                    SYS:시스템, GL:회계, AR:매출, INV:재고
                                  </Text>
                                </li>
                                <li>
                                  <Text code>type</Text>: 부모 코드 타입
                                </li>
                                <li>
                                  <Text code>enabledFlag</Text>: 사용여부
                                  (Y:사용, N:미사용)
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </div>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          선택 항목:
                        </Text>
                        <ul>
                          <li>
                            <Text code>placeholder</Text>: 선택 전에 표시되는
                            안내 문구
                          </li>
                          <li>
                            <Text code>rules</Text>: 입력값 검증 규칙 (필수 선택
                            등)
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>allowClear</Text>: 선택값을 지울 수 있는
                            버튼 표시
                          </li>
                          <li>
                            <Text code>showSearch</Text>: 검색 기능 활성화
                            (옵션이 많을 때 유용)
                          </li>
                          <li>
                            <Text code>valueKey</Text>: 서버 데이터에서 value로
                            사용할 필드명 (기본값: "code")
                          </li>
                          <li>
                            <Text code>labelKey</Text>: 서버 데이터에서 label로
                            사용할 필드명 (기본값: "name1")
                          </li>
                          <li>
                            <Text code>showCodeInLabel</Text>: 코드와 이름을
                            함께 표시할지 여부 (기본값: false)
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: "코드 - 이름" 형식으로
                                표시 (예: "1130401 - 계정명")
                              </li>
                              <li>
                                <Text code>false</Text>: 이름만 표시 (기본값)
                              </li>
                            </ul>
                          </li>
                        </ul>

                        <div
                          style={{
                            background: "#fef3c7",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "16px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            💡 showCodeInLabel 사용 시:
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>showCodeInLabel={true}</Text>로
                              설정하면 옵션에 코드와 이름이 함께 표시됩니다.
                            </li>
                            <li>
                              공통코드 API를 사용할 때 유용합니다 (코드 식별이
                              필요한 경우).
                            </li>
                            <li>
                              표시 형식: "코드 - 이름" (예: "계정명 - 1130401")
                            </li>
                          </ul>
                        </div>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 실제 동작 예제</Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        각 예제를 클릭해서 동작을 확인해보세요!
                      </Text>
                      <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ module: "1130401" }}
                      >
                        {/* 예제 1: 직접 옵션 전달 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 1: 직접 옵션 배열 작성
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            옵션이 적고 고정된 경우 사용
                          </Text>
                          <FormSelect
                            name="category"
                            label="카테고리"
                            placeholder="카테고리를 선택하세요"
                            options={[
                              { value: "work", label: "업무" },
                              { value: "personal", label: "개인" },
                              { value: "study", label: "스터디" },
                            ]}
                            rules={[
                              {
                                required: true,
                                message: "카테고리를 선택해주세요!",
                              },
                            ]}
                          />
                        </div>

                        {/* 예제 2: 공통코드 API 사용 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 2: 공통코드 API 사용
                          </Text>
                          <FormSelect
                            name="module"
                            label="모듈"
                            placeholder="모듈을 선택하세요"
                            comCodeParams={{
                              module: "GL",
                              enabledFlag: "Y",
                              type: "ALWACC",
                            }}
                            rules={[
                              {
                                required: true,
                                message: "모듈을 선택해주세요!",
                              },
                            ]}
                            showSearch
                            onChange={(value: string) => {
                              if (import.meta.env.DEV) {
                                console.log("onChange", value);
                              }
                            }}
                          />
                        </div>

                        {/* 예제 3: 코드와 이름 함께 표시 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#f59e0b" }}
                          >
                            예제 3: 코드와 이름 표시
                          </Text>
                          <FormSelect
                            name="moduleWithCode"
                            label="모듈 (코드 포함)"
                            placeholder="모듈을 선택하세요"
                            comCodeParams={{
                              module: "GL",
                              enabledFlag: "Y",
                              type: "ALWACC",
                            }}
                            showCodeInLabel={true}
                            rules={[
                              {
                                required: true,
                                message: "모듈을 선택해주세요!",
                              },
                            ]}
                            showSearch
                          />
                        </div>

                        {/* 예제 4: 검색 기능 포함 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#8b5cf6" }}
                          >
                            예제 4: 검색 기능
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            옵션이 많을 때 검색해서 찾기
                          </Text>
                          <FormSelect
                            name="status"
                            label="상태"
                            placeholder="상태를 선택하세요"
                            options={[
                              { value: "active", label: "활성" },
                              { value: "inactive", label: "비활성" },
                            ]}
                            layout="horizontal"
                            allowClear
                            showSearch
                          />
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-datepicker",
              label: (
                <Space>
                  <Tag color="blue">FormDatePicker</Tag>
                  <Text type="secondary">
                    날짜 선택기 (단일/범위/연동 기능 지원)
                  </Text>
                </Space>
              ),
              children: (
                <div id="form-datepicker">
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
                            <Text code>isRange</Text>: 범위 선택 모드 (기본값:
                            false)
                          </li>
                          <li>
                            <Text code>linkType</Text>: "start" 또는 "end" (연동
                            타입)
                          </li>
                          <li>
                            <Text code>linkedTo</Text>: 연동할 다른 필드명
                          </li>
                          <li>
                            <Text code>placeholder</Text>: placeholder 텍스트
                            (단일) 또는 배열 (범위)
                          </li>
                          <li>
                            <Text code>rules</Text>: 유효성 검사 규칙
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>layout</Text>: 레이아웃 (vertical,
                            horizontal, inline)
                          </li>
                        </ul>
                        <Text type="secondary">
                          Ant Design의 DatePicker와 RangePicker의 모든 props를
                          지원합니다.
                        </Text>
                        <Text
                          strong
                          style={{ display: "block", marginTop: "8px" }}
                        >
                          참고:
                        </Text>
                        <ul>
                          <li>
                            <Text code>FormDatePicker</Text>: 단일/범위/연동
                            날짜 선택 지원
                          </li>
                        </ul>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>예제</Title>
                      <Form form={form} layout="vertical">
                        <Title level={5}>1. 단일 날짜 선택</Title>
                        <FormDatePicker
                          name="singleDate"
                          label="날짜"
                          placeholder="날짜를 선택하세요"
                          size="small"
                        />
                        <Title level={5} style={{ marginTop: "16px" }}>
                          2. 범위 날짜 선택 (FormDatePicker)
                        </Title>
                        <FormDatePicker
                          name="dateRange"
                          label="기간"
                          isRange={true}
                          placeholder={["시작일", "종료일"]}
                          rules={[
                            { required: true, message: "기간을 선택해주세요!" },
                          ]}
                        />
                        <Title level={5} style={{ marginTop: "16px" }}>
                          4. 연동 날짜 선택
                        </Title>
                        <FormDatePicker
                          name="startDate"
                          label="시작일"
                          linkType="start"
                          linkedTo="endDate"
                          placeholder="시작일을 선택하세요"
                        />
                        <FormDatePicker
                          name="endDate"
                          label="종료일"
                          linkType="end"
                          linkedTo="startDate"
                          placeholder="종료일을 선택하세요"
                          rules={[
                            {
                              required: true,
                              message: "종료일을 선택해주세요!",
                            },
                          ]}
                        />
                        <Title level={5} style={{ marginTop: "16px" }}>
                          5. 추가 옵션 예제
                        </Title>
                        <FormDatePicker
                          name="dateWithFormat"
                          label="날짜 (형식 지정)"
                          placeholder="날짜를 선택하세요"
                          format="YYYY-MM-DD"
                        />
                        <FormDatePicker
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
                </div>
              ),
            },
            {
              key: "form-radiogroup",
              label: (
                <Space>
                  <Tag color="blue">FormRadioGroup</Tag>
                  <Text type="secondary">
                    라디오 버튼 그룹 (공통코드 API 연동 지원)
                  </Text>
                </Space>
              ),
              children: (
                <div id="form-radiogroup">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용 방법
                      </Title>
                      <Paragraph>
                        <Text strong>필수 항목:</Text>
                        <ul>
                          <li>
                            <Text code>name</Text>: 폼에서 이 필드를 구분하는
                            이름
                          </li>
                          <li>
                            <Text code>label</Text>: 사용자에게 보여줄 레이블
                            텍스트
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          옵션을 제공하는 방법 (둘 중 하나 선택):
                        </Text>

                        <div
                          style={{
                            background: "#eff6ff",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 1: 직접 옵션 배열 전달
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>options</Text>: 선택 옵션 배열 직접
                              작성
                            </li>
                          </ul>
                        </div>

                        <div
                          style={{
                            background: "#f0fdf4",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 2: 서버에서 자동으로 가져오기 (공통코드 API)
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>comCodeParams</Text>: 서버 API 파라미터
                              <ul style={{ marginTop: "4px" }}>
                                <li>
                                  <Text code>module</Text>: 모듈 코드 (SYS, GL,
                                  AR, INV 등)
                                </li>
                                <li>
                                  <Text code>type</Text>: 부모 코드 타입
                                </li>
                                <li>
                                  <Text code>enabledFlag</Text>: 사용여부 (Y/N)
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </div>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          선택 항목:
                        </Text>
                        <ul>
                          <li>
                            <Text code>layout</Text>: 버튼 배치 방식
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>"horizontal"</Text>: 가로로 배치
                                (기본값)
                              </li>
                              <li>
                                <Text code>"vertical"</Text>: 세로로 배치
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Text code>rules</Text>: 입력값 검증 규칙 (필수 선택
                            등)
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>valueKey</Text>: 서버 데이터에서 value로
                            사용할 필드명 (기본값: "code")
                          </li>
                          <li>
                            <Text code>labelKey</Text>: 서버 데이터에서 label로
                            사용할 필드명 (기본값: "name1")
                          </li>
                        </ul>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 실제 동작 예제</Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        각 예제를 클릭해서 동작을 확인해보세요!
                      </Text>
                      <Form form={form} layout="vertical">
                        {/* 예제 1: 직접 옵션 전달 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 1: 직접 옵션 배열 작성
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            가로로 배치된 라디오 버튼
                          </Text>
                          <FormRadioGroup
                            name="priority"
                            label="우선순위"
                            options={[
                              { value: "high", label: "높음" },
                              { value: "medium", label: "중간" },
                              { value: "low", label: "낮음" },
                            ]}
                            layout="horizontal"
                            rules={[
                              {
                                required: true,
                                message: "우선순위를 선택해주세요!",
                              },
                            ]}
                          />
                        </div>

                        {/* 예제 2: 공통코드 API 사용 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 2: 공통코드 API 사용
                          </Text>
                          <FormRadioGroup
                            name="moduleRadio"
                            label="모듈 (공통코드)"
                            comCodeParams={{
                              module: "GL",
                              type: "ALWACC",
                              enabledFlag: "Y",
                            }}
                            layout="horizontal"
                            rules={[
                              {
                                required: true,
                                message: "모듈을 선택해주세요!",
                              },
                            ]}
                          />
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-checkbox",
              label: (
                <Space>
                  <Tag color="blue">FormCheckbox</Tag>
                  <Text type="secondary">
                    체크박스 (단일 및 그룹, 공통코드 API 연동 지원)
                  </Text>
                </Space>
              ),
              children: (
                <div id="form-checkbox">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용 방법
                      </Title>
                      <Paragraph>
                        <Text strong>1. 단일 체크박스 (하나만):</Text>
                        <ul>
                          <li>
                            <Text code>label</Text>: 체크박스 옆에 표시할 텍스트
                          </li>
                          <li>
                            <Text code>onChange</Text>: 체크 상태가 변경될 때
                            실행되는 함수
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          2. 체크박스 그룹 (여러 개 선택):
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <Text code>FormCheckbox.Group</Text> 컴포넌트 사용
                        </Text>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "12px" }}
                        >
                          옵션을 제공하는 방법 (둘 중 하나 선택):
                        </Text>

                        <div
                          style={{
                            background: "#eff6ff",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 1: 직접 옵션 배열 전달
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>options</Text>: 선택 옵션 배열 직접
                              작성
                            </li>
                          </ul>
                        </div>

                        <div
                          style={{
                            background: "#f0fdf4",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "12px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            방법 2: 서버에서 자동으로 가져오기 (공통코드 API)
                          </Text>
                          <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>comCodeParams</Text>: 서버 API 파라미터
                              <ul style={{ marginTop: "4px" }}>
                                <li>
                                  <Text code>module</Text>: 모듈 코드 (SYS, GL,
                                  AR, INV 등)
                                </li>
                                <li>
                                  <Text code>type</Text>: 부모 코드 타입
                                </li>
                                <li>
                                  <Text code>enabledFlag</Text>: 사용여부 (Y/N)
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </div>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          체크박스 그룹 선택 항목:
                        </Text>
                        <ul>
                          <li>
                            <Text code>enableSelectAll</Text>: "전체 선택" 버튼
                            표시 (true/false)
                          </li>
                          <li>
                            <Text code>selectAllLabel</Text>: 전체 선택 버튼에
                            표시할 텍스트 (기본값: "전체 선택")
                          </li>
                          <li>
                            <Text code>maxSelect</Text>: 최대 선택 가능 개수
                            (예: 3개까지만)
                          </li>
                          <li>
                            <Text code>columns</Text>: 그리드로 배치할 컬럼 수
                            (예: 2열, 3열)
                          </li>
                          <li>
                            <Text code>valueKey</Text>: 서버 데이터에서 value로
                            사용할 필드명 (기본값: "code")
                          </li>
                          <li>
                            <Text code>labelKey</Text>: 서버 데이터에서 label로
                            사용할 필드명 (기본값: "name1")
                          </li>
                          <li>
                            <Text code>rules</Text>: 입력값 검증 규칙 (필수 선택
                            등)
                          </li>
                          <li>
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 실제 동작 예제</Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        각 예제를 클릭해서 동작을 확인해보세요!
                      </Text>
                      <Form form={form} layout="vertical">
                        {/* 예제 1: 단일 체크박스 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 1: 단일 체크박스
                          </Text>
                          <Form.Item name="agree" valuePropName="checked">
                            <FormCheckbox
                              label="이용약관에 동의합니다"
                              onChange={(checked) => {
                                if (import.meta.env.DEV) {
                                  console.log("동의:", checked);
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 예제 2: 체크박스 그룹 - 직접 옵션 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#1890ff" }}
                          >
                            예제 2: 체크박스 그룹
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            전체 선택, 최대 3개 제한, 2열 배치
                          </Text>
                          <Form.Item
                            name="hobbies"
                            label="취미"
                            rules={[
                              {
                                required: true,
                                message: "취미를 선택해주세요!",
                              },
                            ]}
                          >
                            <FormCheckbox.Group
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
                        </div>

                        {/* 예제 3: 공통코드 API 사용 */}
                        <div style={{ marginTop: "16px" }}>
                          <Text
                            strong
                            style={{ fontSize: "13px", color: "#10b981" }}
                          >
                            예제 3: 공통코드 API 사용
                          </Text>
                          <Form.Item
                            name="modules"
                            label="모듈 (공통코드)"
                            rules={[
                              {
                                required: true,
                                message: "모듈을 선택해주세요!",
                              },
                            ]}
                          >
                            <FormCheckbox.Group
                              comCodeParams={{
                                module: "GL",
                                type: "ALWACC",
                                enabledFlag: "Y",
                              }}
                              enableSelectAll
                              columns={2}
                            />
                          </Form.Item>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-tree",
              label: (
                <Space>
                  <Tag color="blue">FormTree</Tag>
                  <Text type="secondary">트리 컴포넌트 (계층 구조 선택)</Text>
                </Space>
              ),
              children: (
                <div id="form-tree">
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
                            <Text code>useModalMessage</Text>: 필수 입력 검증
                            실패 시 모달 메시지 사용 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 모달 메시지 표시
                                (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 인라인 메시지 표시
                              </li>
                            </ul>
                            <div
                              style={{
                                background: "#eff6ff",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "8px",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                💡 여러 필수값이 동시에 검증 실패해도 첫 번째
                                오류만 모달로 표시되고, 나머지는 인라인으로
                                표시됩니다.
                              </Text>
                            </div>
                          </li>
                          <li>
                            <Text code>checkable</Text>: 체크박스 모드 활성화
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>false</Text>: 체크박스 없이 +
                                아이콘으로 표시 (확장 시 - 아이콘) - 기본값
                              </li>
                              <li>
                                <Text code>true</Text>: 체크박스 표시 (다중 선택
                                가능)
                              </li>
                            </ul>
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
                            <Text code>defaultExpandAll</Text>: 기본적으로 모든
                            노드 펼치기
                          </li>
                          <li>
                            <Text code>showLine</Text>: 노드 간 연결선 표시 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 연결선 표시 (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 연결선 숨김
                              </li>
                            </ul>
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
                        <Title level={5} style={{ marginTop: "0" }}>
                          1. 기본 모드 (+ 아이콘, checkable=false)
                        </Title>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "11px",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          체크박스 없이 + 아이콘으로 표시됩니다 (확장 시 -
                          아이콘). 기본 동작입니다.
                        </Text>
                        <FormTree
                          name="treeNoCheck" // 필드명(필수)
                          label="부서/프로젝트 선택" // 레이블(필수)
                          treeData={treeData} // 트리 데이터(필수)
                          defaultExpandAll // 기본적으로 모든 노드 펼치기
                        />

                        <Title level={5} style={{ marginTop: "16px" }}>
                          2. 체크박스 모드 (checkable=true)
                        </Title>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "11px",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          체크박스가 표시되어 다중 선택이 가능합니다.
                        </Text>
                        <FormTree
                          name="tree" // 필드명(필수)
                          label="부서/프로젝트 선택 (체크박스 모드)" // 레이블(필수)
                          treeData={treeData} // 트리 데이터(필수)
                          checkable={true} // 체크박스 모드 활성화
                          defaultExpandAll // 기본적으로 모든 노드 펼치기
                          rules={[
                            { required: true, message: "항목을 선택해주세요!" },
                          ]} // 유효성 검사 규칙
                        />
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-button",
              label: (
                <Space>
                  <Tag color="blue">FormButton</Tag>
                  <Text type="secondary">버튼 컴포넌트</Text>
                </Space>
              ),
              children: (
                <div id="form-button">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용법
                      </Title>
                      <Paragraph>
                        <Text strong>기본 Props:</Text>
                        <ul>
                          <li>
                            <Text code>name</Text>: Form.Item 필드명 (name이
                            있으면 자동으로 Form.Item으로 감쌈)
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
                            <Text code>wrapFormItem</Text>: Form.Item으로 감쌀지
                            여부
                          </li>
                          <li>
                            <Text code>type</Text>: 버튼 타입 (primary, default,
                            dashed, text, link)
                          </li>
                          <li>
                            <Text code>htmlType</Text>: 버튼 HTML 타입 (button,
                            submit, reset)
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
                            <Text code>size</Text>: 버튼 크기 (large, middle,
                            small)
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          권한 관련 Props:
                        </Text>
                        <ul>
                          <li>
                            <Text code>objId</Text>: 버튼 식별 ID (권한 체크용)
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>objId</Text>가 설정되면 자동으로 권한
                                체크를 수행합니다.
                              </li>
                              <li>
                                권한이 없으면 버튼이 숨겨지거나 비활성화됩니다.
                              </li>
                              <li>
                                예: <Text code>objId="btn_add"</Text>,{" "}
                                <Text code>objId="btn_delete"</Text>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Text code>hideIfNoPermission</Text>: 권한이 없을 때
                            버튼을 숨길지 여부
                            <ul style={{ marginTop: "4px" }}>
                              <li>
                                <Text code>true</Text>: 권한이 없으면 버튼을
                                숨김 (기본값)
                              </li>
                              <li>
                                <Text code>false</Text>: 권한이 없으면 버튼을
                                비활성화 (disabled)
                              </li>
                            </ul>
                          </li>
                        </ul>

                        <div
                          style={{
                            background: "#eff6ff",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "16px",
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            💡 버튼 권한 사용 방법:
                          </Text>
                          <ol style={{ marginTop: "8px", marginBottom: 0 }}>
                            <li>
                              <Text code>MenuButtonProvider</Text>로 버튼 영역을
                              감싸기
                            </li>
                            <li>
                              <Text code>FormButton</Text>에{" "}
                              <Text code>objId</Text> prop 설정
                            </li>
                            <li>
                              권한이 없으면 자동으로 버튼이 숨겨지거나
                              비활성화됨
                            </li>
                          </ol>
                        </div>

                        <Text
                          type="secondary"
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          Ant Design의 Button 컴포넌트의 모든 props를
                          지원합니다.
                        </Text>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>예제</Title>
                      <Form form={form} layout="vertical">
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Title level={5}>1. 일반 버튼 (Form.Item 없이)</Title>
                          <Space wrap>
                            <FormButton
                              type="primary"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  console.log("Primary 버튼 클릭");
                                }
                              }}
                            >
                              Primary
                            </FormButton>
                            <FormButton
                              type="default"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  console.log("Default 버튼 클릭");
                                }
                              }}
                            >
                              Default
                            </FormButton>
                            <FormButton
                              type="dashed"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  console.log("Dashed 버튼 클릭");
                                }
                              }}
                            >
                              Dashed
                            </FormButton>
                            <FormButton
                              type="text"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  console.log("Text 버튼 클릭");
                                }
                              }}
                            >
                              Text
                            </FormButton>
                            <FormButton
                              type="link"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  console.log("Link 버튼 클릭");
                                }
                              }}
                            >
                              Link
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            2. Form 내부에서 사용
                          </Title>
                          <Form.Item>
                            <FormButton type="primary" htmlType="submit" block>
                              제출
                            </FormButton>
                          </Form.Item>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            3. Form.Item으로 자동 감싸기
                          </Title>
                          <FormButton
                            name="submitButton"
                            label="제출 버튼"
                            type="primary"
                            htmlType="submit"
                          >
                            제출
                          </FormButton>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            4. 아이콘 버튼
                          </Title>
                          <Space wrap>
                            <FormButton type="primary" icon={<CodeOutlined />}>
                              코드
                            </FormButton>
                            <FormButton
                              type="default"
                              icon={<BulbOutlined />}
                              loading={loading}
                              onClick={handleLoadingDemo}
                            >
                              로딩 버튼
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            5. 버튼 그룹
                          </Title>
                          <Space wrap>
                            <FormButton type="primary">저장</FormButton>
                            <FormButton type="default">취소</FormButton>
                            <FormButton type="default" danger>
                              삭제
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            6. 버튼 크기
                          </Title>
                          <Space wrap>
                            <FormButton type="primary" size="large">
                              Large
                            </FormButton>
                            <FormButton type="primary" size="middle">
                              Middle
                            </FormButton>
                            <FormButton type="primary" size="small">
                              Small
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            7. 고스트 버튼
                          </Title>
                          <Space wrap>
                            <FormButton type="primary" ghost>
                              Primary Ghost
                            </FormButton>
                            <FormButton type="default" ghost>
                              Default Ghost
                            </FormButton>
                            <FormButton type="dashed" ghost>
                              Dashed Ghost
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            8. 비활성화 버튼
                          </Title>
                          <Space wrap>
                            <FormButton type="primary" disabled>
                              Disabled Primary
                            </FormButton>
                            <FormButton type="default" disabled>
                              Disabled Default
                            </FormButton>
                            <FormButton type="link" disabled>
                              Disabled Link
                            </FormButton>
                          </Space>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            9. 버튼 권한 체크 (objId 사용)
                          </Title>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "8px",
                            }}
                          >
                            💡 권한이 없으면 버튼이 자동으로 숨겨집니다. (기본
                            동작)
                          </Text>
                          <MenuButtonProvider>
                            <Space wrap>
                              <FormButton type="primary" objId="btn_add">
                                추가 (권한 체크)
                              </FormButton>
                              <FormButton type="default" objId="btn_edit">
                                수정 (권한 체크)
                              </FormButton>
                              <FormButton
                                type="default"
                                danger
                                objId="btn_delete"
                              >
                                삭제 (권한 체크)
                              </FormButton>
                            </Space>
                          </MenuButtonProvider>

                          <Title level={5} style={{ marginTop: "16px" }}>
                            10. 권한 없을 때 비활성화 (hideIfNoPermission=false)
                          </Title>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginBottom: "8px",
                            }}
                          >
                            💡 권한이 없어도 버튼을 보이되 비활성화합니다.
                          </Text>
                          <MenuButtonProvider>
                            <Space wrap>
                              <FormButton
                                type="primary"
                                objId="btn_add"
                                hideIfNoPermission={false}
                              >
                                추가 (비활성화 모드)
                              </FormButton>
                              <FormButton
                                type="default"
                                objId="btn_edit"
                                hideIfNoPermission={false}
                              >
                                수정 (비활성화 모드)
                              </FormButton>
                            </Space>
                          </MenuButtonProvider>
                        </Space>
                      </Form>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "button-permission",
              label: (
                <Space>
                  <Tag color="purple">버튼 권한</Tag>
                  <Text type="secondary">MenuButtonProvider 사용법</Text>
                </Space>
              ),
              children: (
                <div id="button-permission">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 개요
                      </Title>
                      <Paragraph>
                        <Text>
                          화면별 버튼 권한을 관리하는 시스템입니다.{" "}
                          <Text code>MenuButtonProvider</Text>를 사용하여 현재
                          화면의 버튼 권한을 자동으로 가져오고,{" "}
                          <Text code>FormButton</Text>의 <Text code>objId</Text>{" "}
                          prop을 통해 권한을 체크합니다.
                        </Text>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          주요 특징:
                        </Text>
                        <ul>
                          <li>
                            화면의 <Text code>pgmNo</Text>를 자동으로 감지하여
                            권한을 가져옵니다.
                          </li>
                          <li>
                            여러 버튼이 있어도 API를 한 번만 호출합니다 (Context
                            사용).
                          </li>
                          <li>
                            권한이 없으면 버튼을 숨기거나 비활성화할 수
                            있습니다.
                          </li>
                          <li>
                            권한 체크는 <Text code>visibleYn</Text>만 확인합니다
                            (<Text code>visibleYn === "Y"</Text>일 때만 표시).
                          </li>
                        </ul>

                        <Text
                          strong
                          style={{ display: "block", marginTop: "16px" }}
                        >
                          사용 방법:
                        </Text>
                        <ol>
                          <li>
                            버튼이 있는 영역을{" "}
                            <Text code>MenuButtonProvider</Text>로 감싸기
                          </li>
                          <li>
                            <Text code>FormButton</Text>에{" "}
                            <Text code>objId</Text> prop 설정
                          </li>
                          <li>
                            <Text code>hideIfNoPermission</Text>으로 동작 방식
                            선택 (기본: 숨김)
                          </li>
                        </ol>
                      </Paragraph>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Title level={4}>📋 사용 예제</Title>
                      <pre
                        style={{
                          background: "#f5f5f5",
                          padding: "16px",
                          borderRadius: "6px",
                          overflow: "auto",
                          fontSize: "12px",
                          lineHeight: "1.6",
                        }}
                      >
                        {`import { MenuButtonProvider } from "@/components/providers";
import { FormButton } from "@components/ui/form";

// 1. 버튼 영역을 MenuButtonProvider로 감싸기
<MenuButtonProvider>
  <Space>
    {/* 2. objId를 설정하여 권한 체크 */}
    <FormButton 
      type="primary" 
      objId="btn_add"
    >
      추가
    </FormButton>
    
    <FormButton 
      type="default" 
      objId="btn_edit"
    >
      수정
    </FormButton>
    
    {/* 3. 권한이 없어도 버튼을 보이되 비활성화 */
    <FormButton 
      type="default" 
      danger
      objId="btn_delete"
      hideIfNoPermission={false}
    >
      삭제
    </FormButton>
  </Space>
</MenuButtonProvider>

// pgmNo를 직접 지정할 수도 있습니다
<MenuButtonProvider pgmNo="PGM001">
  {/* 버튼들 */}
</MenuButtonProvider>`}
                      </pre>

                      <div
                        style={{
                          background: "#fef3c7",
                          padding: "12px",
                          borderRadius: "6px",
                          marginTop: "16px",
                        }}
                      >
                        <Text strong style={{ fontSize: "13px" }}>
                          ⚠️ 주의사항:
                        </Text>
                        <ul style={{ marginTop: "8px", marginBottom: 0 }}>
                          <li>
                            <Text code>MenuButtonProvider</Text>는 현재 화면의{" "}
                            <Text code>pgmNo</Text>를 자동으로 감지합니다.
                          </li>
                          <li>
                            <Text code>objId</Text>는 백엔드에서 제공하는 버튼
                            식별 ID와 일치해야 합니다.
                          </li>
                          <li>
                            권한이 없으면 기본적으로 버튼이 숨겨집니다 (
                            <Text code>hideIfNoPermission=true</Text>).
                          </li>
                          <li>
                            권한 체크 중에는 버튼이 로딩 상태로 표시됩니다.
                          </li>
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "form-aggrid",
              label: (
                <Space>
                  <Tag color="blue">FormAgGrid</Tag>
                  <Text type="secondary">AG-Grid 엔터프라이즈 그리드</Text>
                </Space>
              ),
              children: (
                <div id="form-aggrid">
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
                      <FormAgGrid<DemoGridData>
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

                  {/* FormAgGrid - 다양한 편집 모드 (Input, Select, Date, Checkbox) */}
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <Tag color="blue">FormAgGrid</Tag>
                        <Text type="secondary">
                          다양한 편집 모드 (Input, Select, Date, Checkbox)
                        </Text>
                      </Space>
                    }
                    style={{ marginBottom: "16px", marginTop: "16px" }}
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
                              <Text code>cellEditor: "agTextCellEditor"</Text>:
                              기본 텍스트 편집기
                            </li>
                            <li>
                              <Text code>
                                cellEditor: "agLargeTextCellEditor"
                              </Text>
                              : 긴 텍스트 편집기 (여러 줄)
                            </li>
                            <li>
                              <Text code>cellEditor: "agNumberCellEditor"</Text>
                              : 숫자 편집기
                            </li>
                          </ul>
                          <Text strong>SelectBox (선택 박스):</Text>
                          <ul>
                            <li>
                              <Text code>cellEditor: "agSelectCellEditor"</Text>
                              : 셀렉트 편집기
                            </li>
                            <li>
                              <Text code>
                                cellEditorParams: {"{ values: [...] }"}
                              </Text>
                              : 선택 옵션 배열
                            </li>
                          </ul>
                          <Text strong>Calendar (날짜 선택):</Text>
                          <ul>
                            <li>
                              <Text code>cellEditor: "agDateCellEditor"</Text>:
                              날짜 편집기
                            </li>
                            <li>
                              <Text code>
                                cellEditorParams: {"{ min, max }"}
                              </Text>
                              : 날짜 범위 제한
                            </li>
                            <li>
                              <Text code>valueFormatter</Text>: 날짜 포맷팅
                            </li>
                          </ul>
                          <Text strong>Checkbox (체크박스):</Text>
                          <ul>
                            <li>
                              <Text code>editable: true</Text>: 셀 편집 가능하게
                              설정
                            </li>
                            <li>
                              <Text code>
                                cellEditor: "agCheckboxCellEditor"
                              </Text>
                              : 체크박스 편집기 사용
                            </li>
                            <li>
                              <Text code>
                                cellRenderer: "agCheckboxCellRenderer"
                              </Text>
                              : 체크박스 렌더러 사용
                            </li>
                            <li>
                              <Text code>checkboxSelection: true</Text>: 행
                              선택용 체크박스 (첫 번째 컬럼에 설정)
                            </li>
                            <li>
                              <Text code>headerCheckboxSelection: true</Text>:
                              헤더 전체 선택 체크박스
                            </li>
                          </ul>
                          <Text strong>Row 수정 상태 추적:</Text>
                          <ul>
                            <li>
                              <Text code>onCellValueChanged</Text>: 셀 값 변경
                              시 호출되는 이벤트 핸들러
                            </li>
                            <li>
                              <Text code>params.oldValue</Text>: 변경 전 값
                            </li>
                            <li>
                              <Text code>params.newValue</Text>: 변경 후 값
                            </li>
                            <li>
                              <Text code>params.data</Text>: 변경된 행의 전체
                              데이터
                            </li>
                            <li>
                              <Text code>params.colDef.field</Text>: 변경된
                              필드명
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
                                if (import.meta.env.DEV) {
                                  console.log(
                                    "전체 데이터:",
                                    multiEditGridData
                                  );
                                }
                              }}
                            >
                              전체 데이터 확인
                            </Button>
                            <Button
                              onClick={() => {
                                const changedData = multiEditGridData.filter(
                                  (row) => row.status === "진행중"
                                );
                                if (import.meta.env.DEV) {
                                  console.log(
                                    "진행중인 프로젝트:",
                                    changedData
                                  );
                                }
                              }}
                            >
                              진행중인 프로젝트 확인
                            </Button>
                            <Button
                              onClick={() => {
                                const activeRows = multiEditGridData.filter(
                                  (row) => row.isActive
                                );
                                if (import.meta.env.DEV) {
                                  console.log("활성화된 항목:", activeRows);
                                }
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
                                  if (import.meta.env.DEV) {
                                    console.log("수정된 행이 없습니다.");
                                  }
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
                                if (import.meta.env.DEV) {
                                  console.log("=== 수정된 행 목록 ===");
                                  console.log(
                                    "수정된 행 개수:",
                                    modifiedRows.size
                                  );
                                  console.log(
                                    "수정된 행 상세:",
                                    modifiedRowsArray
                                  );
                                  modifiedRowsArray.forEach((item) => {
                                    console.log(`\n행 ID ${item.id}:`);
                                    console.log(
                                      "  원본 데이터:",
                                      item.originalRow
                                    );
                                    console.log(
                                      "  현재 데이터:",
                                      item.currentRow
                                    );
                                    console.log("  변경 사항:", item.changes);
                                  });
                                }
                              }}
                            >
                              수정된 행 확인 ({modifiedRows.size})
                            </Button>
                            <Button
                              onClick={() => {
                                if (changeHistory.length === 0) {
                                  if (import.meta.env.DEV) {
                                    console.log("변경 이력이 없습니다.");
                                  }
                                  return;
                                }
                                if (import.meta.env.DEV) {
                                  console.log("=== 변경 이력 ===");
                                  console.log(
                                    "총 변경 횟수:",
                                    changeHistory.length
                                  );
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
                                }
                              }}
                            >
                              변경 이력 확인 ({changeHistory.length})
                            </Button>
                            <Button
                              danger
                              onClick={() => {
                                setModifiedRows(new Map());
                                setChangeHistory([]);
                                setMultiEditGridData([
                                  ...originalMultiEditGridData,
                                ]);
                                if (import.meta.env.DEV) {
                                  console.log("데이터가 초기화되었습니다.");
                                }
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
                        <FormAgGrid<MultiEditGridData>
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
                              const originalRow =
                                originalMultiEditGridData.find(
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
                                  originalRow[
                                    field as keyof MultiEditGridData
                                  ] !== newValue
                                ) {
                                  newMap.set(rowId, {
                                    ...existingChanges,
                                    [field]: {
                                      oldValue:
                                        originalRow[
                                          field as keyof MultiEditGridData
                                        ],
                                      newValue,
                                    },
                                  });
                                } else if (
                                  originalRow &&
                                  originalRow[
                                    field as keyof MultiEditGridData
                                  ] === newValue
                                ) {
                                  // 원본 값으로 되돌린 경우 해당 필드 제거
                                  const updatedChanges = { ...existingChanges };
                                  delete updatedChanges[
                                    field as keyof MultiEditGridData
                                  ];
                                  if (
                                    Object.keys(updatedChanges).length === 0
                                  ) {
                                    newMap.delete(rowId);
                                  } else {
                                    newMap.set(rowId, updatedChanges);
                                  }
                                }

                                return newMap;
                              });

                              // 데이터 업데이트
                              const updatedData = multiEditGridData.map((row) =>
                                row.id === rowId
                                  ? { ...row, [field]: newValue }
                                  : row
                              );
                              setMultiEditGridData(updatedData);

                              // 콘솔 로그
                              if (import.meta.env.DEV) {
                                console.log("=== 셀 값 변경 ===");
                                console.log(`행 ID: ${rowId}`);
                                console.log(`필드: ${field}`);
                                console.log(`이전 값:`, oldValue);
                                console.log(`새 값:`, newValue);
                                console.log(`전체 행 데이터:`, params.data);
                                console.log("==================");
                              }
                            },
                            onSelectionChanged: (params) => {
                              // 선택된 행 변경 시
                              const selectedRows = params.api.getSelectedRows();
                              if (import.meta.env.DEV) {
                                console.log("선택된 행:", selectedRows);
                              }
                            },
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>

                  {/* FormAgGrid - 소계/합계 */}
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <Tag color="blue">FormAgGrid</Tag>
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
                              <Text code>rowGroup: true</Text>: 그룹화할 컬럼
                              설정
                            </li>
                            <li>
                              <Text code>aggFunc</Text>: 집계 함수 (sum, avg,
                              min, max, count 등)
                            </li>
                            <li>
                              <Text code>groupDisplayType</Text>: 그룹 표시 방식
                              (groupRows, singleColumn 등)
                            </li>
                            <li>
                              <Text code>groupTotalRow</Text>: 합계 행 위치
                              (top, bottom)
                            </li>
                            <li>
                              <Text code>autoGroupColumnDef</Text>: 그룹 컬럼
                              커스터마이징
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
                        <FormAgGrid<SummaryGridData>
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

                  {/* FormAgGrid - 스타일 커스터마이징 */}
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <Tag color="blue">FormAgGrid</Tag>
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
                              <Text code>headerBackgroundColor</Text>: 헤더
                              배경색
                            </li>
                            <li>
                              <Text code>headerColor</Text>: 헤더 텍스트 색상
                            </li>
                            <li>
                              <Text code>headerFontWeight</Text>: 헤더 폰트 굵기
                            </li>
                            <li>
                              <Text code>oddRowBackgroundColor</Text>: 홀수 행
                              배경색
                            </li>
                            <li>
                              <Text code>evenRowBackgroundColor</Text>: 짝수 행
                              배경색
                            </li>
                            <li>
                              <Text code>hoverRowBackgroundColor</Text>: 호버 행
                              배경색
                            </li>
                            <li>
                              <Text code>selectedRowBackgroundColor</Text>: 선택
                              행 배경색
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
                        <FormAgGrid<DemoGridData>
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

                  {/* FormAgGrid - 행 추가/삭제 */}
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <Tag color="blue">FormAgGrid</Tag>
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
                              <Text code>onGridReady</Text>: 그리드 API 참조
                              저장
                            </li>
                            <li>
                              <Text code>gridApiRef.current</Text>: 그리드 API
                              접근
                            </li>
                            <li>새 행 데이터를 state에 추가</li>
                            <li>
                              <Text code>setFocusedCell</Text>: 새 행에 포커스
                              이동
                            </li>
                            <li>
                              <Text code>startEditingCell</Text>: 셀 편집 모드
                              시작
                            </li>
                          </ul>
                          <Text strong>행 삭제:</Text>
                          <ul>
                            <li>
                              <Text code>getSelectedRows()</Text>: 선택된 행
                              가져오기
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
                              <Text code>rowSelection: "multiple"</Text> 설정
                              필요
                            </li>
                            <li>
                              그리드 API는 <Text code>onGridReady</Text>에서
                              접근 가능
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
                                if (import.meta.env.DEV) {
                                  console.log("전체 데이터:", editableGridData);
                                }
                              }}
                            >
                              데이터 확인
                            </Button>
                          </Space>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            체크박스를 선택한 후 "선택 행 삭제" 버튼을
                            클릭하세요.
                          </Text>
                        </Space>
                        <FormAgGrid<DemoGridData>
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
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 공통 컴포넌트 섹션 */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>🔄 공통 컴포넌트</Title>
        <Divider />

        <Collapse
          defaultActiveKey={[]}
          items={[
            {
              key: "loading-spinner",
              label: (
                <Space>
                  <Tag color="green">LoadingSpinner</Tag>
                  <Text type="secondary">로딩 스피너</Text>
                </Space>
              ),
              children: (
                <div id="loading-spinner">
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
                        <Button onClick={handleLoadingDemo}>
                          로딩 데모 (2초)
                        </Button>
                        {loading && <LoadingSpinner size="large" fullScreen />}
                        <LoadingSpinner size="default" />
                      </Space>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "app-page-modal",
              label: (
                <Space>
                  <Tag color="green">AppPageModal</Tag>
                  <Text type="secondary">페이지 모달 (값 반환 지원)</Text>
                </Space>
              ),
              children: (
                <div id="app-page-modal">
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
                            <Text code>page</Text>: 모달 내부에 렌더링할
                            컴포넌트
                          </li>
                          <li>
                            <Text code>pageProps</Text>: 페이지 컴포넌트에
                            전달할 props
                          </li>
                        </ul>
                        <Text type="warning">
                          페이지 컴포넌트는 <Text code>InjectedProps</Text>를
                          받아야 합니다.
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
                            userModal.openModal({
                              initialId: searchValue || undefined,
                            });
                          }}
                        >
                          모달 열기
                        </Button>
                        {user && (
                          <Text>
                            선택된 사용자: {user.name} (ID: {user.id})
                          </Text>
                        )}
                        <AppPageModal {...userModal.modalProps} />
                      </Space>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "app-message-modal",
              label: (
                <Space>
                  <Tag color="green">AppMessageModal</Tag>
                  <Text type="secondary">메시지 모달 (Confirm, Alert)</Text>
                </Space>
              ),
              children: (
                <div id="app-message-modal">
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
                            <Text code>
                              info/success/error/warning(options)
                            </Text>
                            : 정보/성공/에러/경고 모달
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
                </div>
              ),
            },
            {
              key: "app-message",
              label: (
                <Space>
                  <Tag color="green">AppMessage</Tag>
                  <Text type="secondary">토스트 메시지 (Toast Message)</Text>
                </Space>
              ),
              children: (
                <div id="app-message">
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Title level={4}>
                        <BulbOutlined /> 사용법
                      </Title>
                      <Paragraph>
                        <Text strong>함수:</Text>
                        <ul>
                          <li>
                            <Text code>showSuccess(content, duration)</Text>:
                            성공 메시지
                          </li>
                          <li>
                            <Text code>showError(content, duration)</Text>: 에러
                            메시지
                          </li>
                          <li>
                            <Text code>showInfo(content, duration)</Text>: 정보
                            메시지
                          </li>
                          <li>
                            <Text code>showWarning(content, duration)</Text>:
                            경고 메시지
                          </li>
                          <li>
                            <Text code>showLoading(content)</Text>: 로딩 메시지
                          </li>
                          <li>
                            <Text code>show(content, type, duration)</Text>:
                            일반 메시지
                          </li>
                        </ul>
                        <Text strong>Parameters:</Text>
                        <ul>
                          <li>
                            <Text code>content</Text>: 메시지 내용 (필수)
                          </li>
                          <li>
                            <Text code>duration</Text>: 표시 시간 (초, 기본값:
                            2)
                          </li>
                          <li>
                            <Text code>type</Text>: 메시지 타입 (success, error,
                            info, warning, loading)
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
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Import 가이드 */}
      <Card>
        <Title level={2}>📦 Import 가이드</Title>
        <Divider />

        <Collapse
          defaultActiveKey={[]}
          items={[
            {
              key: "import-form",
              label: (
                <Space>
                  <Tag color="purple">Form 컴포넌트</Tag>
                  <Text type="secondary">Form 컴포넌트 Import</Text>
                </Space>
              ),
              children: (
                <div id="import-form">
                  <Paragraph>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      모든 Form 컴포넌트는 <Text code>@components/ui/form</Text>
                      에서 import합니다.
                    </Text>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "16px",
                        borderRadius: "6px",
                        overflow: "auto",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {`import {
  FormInput,
  FormSearchInput,
  FormTextArea,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormCheckbox,
  FormTree,
  FormButton,
  FormAgGrid,
  type AgGridStyleOptions,
} from "@components/ui/form";`}
                    </pre>
                  </Paragraph>
                </div>
              ),
            },
            {
              key: "import-common",
              label: (
                <Space>
                  <Tag color="purple">공통 컴포넌트</Tag>
                  <Text type="secondary">공통 컴포넌트 Import</Text>
                </Space>
              ),
              children: (
                <div id="import-common">
                  <Paragraph>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      로딩, 모달, 메시지 등의 공통 컴포넌트는 아래와 같이
                      import합니다.
                    </Text>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "16px",
                        borderRadius: "6px",
                        overflow: "auto",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {`// 로딩 및 모달
import { LoadingSpinner, AppPageModal } from "@components/ui/feedback";

// 메시지 (Toast 알림)
import {
  confirm,
  info,
  success,
  error,
  warning,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  show,
} from "@components/ui/feedback/Message";`}
                    </pre>
                  </Paragraph>
                </div>
              ),
            },
            {
              key: "import-hook",
              label: (
                <Space>
                  <Tag color="purple">페이지 모달 훅</Tag>
                  <Text type="secondary">usePageModal 훅</Text>
                </Space>
              ),
              children: (
                <div id="import-hook">
                  <Paragraph>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      페이지 모달을 사용할 때는 <Text code>usePageModal</Text>{" "}
                      훅을 사용합니다.
                    </Text>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "16px",
                        borderRadius: "6px",
                        overflow: "auto",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {`import { usePageModal } from "@hooks/usePageModal";

// 사용 예시
const userModal = usePageModal<{ initialId?: string }, User>(
  React.lazy(() => import("@pages/sample/pageModal/ModalPopup")),
  {
    title: "사용자 선택",
    centered: true,
    onReturn: (value) => {
      // 모달에서 반환된 값 처리
      console.log(value);
    },
  }
);

// 모달 열기
userModal.openModal({ initialId: "123" });`}
                    </pre>
                  </Paragraph>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  // --------------------------------------------------------------------------
  // Render - Main Component with Tabs
  // --------------------------------------------------------------------------
  return (
    <Tabs
      defaultActiveKey="sample1"
      items={[
        {
          key: "sample1",
          label: "Sample 1",
          children: renderSample1Content(),
        },
        {
          key: "sample2",
          label: "Sample 2",
          children: (
            <Suspense fallback={null}>
              <Sample2 />
            </Suspense>
          ),
        },
        {
          key: "sample3",
          label: "Sample 3",
          children: (
            <Suspense fallback={null}>
              <Sample3 />
            </Suspense>
          ),
        },
        {
          key: "sample4",
          label: "Sample 4",
          children: (
            <Suspense fallback={null}>
              <Sample4 />
            </Suspense>
          ),
        },
      ]}
    />
  );
};

export default Sample1;
