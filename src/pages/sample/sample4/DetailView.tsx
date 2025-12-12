import React, { useCallback, useMemo, useState } from "react";
import {
  DataForm,
  FormButton,
  FormInput,
  FormInputNumber,
  FormDatePicker,
  FormSelect,
  FormTextArea,
} from "@components/ui/form";

// 상수 정의
const SLIP_TYPE_OPTIONS = [
  { value: "대체전표", label: "대체전표" },
  { value: "결산전표", label: "결산전표" },
  { value: "기초전표", label: "기초전표" },
];

const APPROVAL_OPTIONS = [
  { value: "승인", label: "승인" },
  { value: "미승인", label: "미승인" },
  { value: "진행중", label: "진행중" },
];

// 샘플 데이터
const SAMPLE_TABLE_DATA = {
  menuNumber: "A11 경영관리본부",
  makerName: "ADMIN 관리자",
  slipType: "대체전표",
  slipNumber: "1234556789",
  creationDate: "2025-10-20",
  reverseNo: "10",
  description: "상차도",
  remarks: "추가 비고 사항",
};

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
}

interface SelectInputProps extends InputProps {
  options?: Array<{ value: string; label: string }>;
}

interface TextAreaInputProps extends InputProps {
  rows?: number;
}

const TextInput = ({ name, placeholder, mode }: InputProps) => (
  <FormInput name={name} label="" placeholder={placeholder} mode={mode} />
);

const NumberInput = ({ name, placeholder, mode }: InputProps) => (
  <FormInputNumber name={name} label="" placeholder={placeholder} mode={mode} />
);

const DateInput = ({ name, placeholder, mode }: InputProps) => (
  <FormDatePicker name={name} label="" placeholder={placeholder} mode={mode} />
);

const SelectInput = ({
  name,
  placeholder,
  options,
  mode = "edit",
}: SelectInputProps) => (
  <FormSelect
    name={name}
    label=""
    placeholder={placeholder}
    options={options}
    mode={mode}
  />
);

const TextAreaInput = ({
  name,
  placeholder,
  rows = 3,
  mode = "edit",
}: TextAreaInputProps) => (
  <FormTextArea
    name={name}
    label=""
    placeholder={placeholder}
    rows={rows}
    mode={mode}
  />
);

// 필드 설정 인터페이스
interface FieldConfig {
  key: string;
  label?: string; // ← 옵셔널로 변경
  inputComponent: React.ComponentType<{
    name: string;
    placeholder?: string;
    mode?: "view" | "edit";
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  }>;
  labelKey?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  colspan?: number;
  rowspan?: number;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
}

// 필드 설정 헬퍼
const createField = ({
  key,
  label,
  inputComponent,
  labelKey,
  required,
  ...options
}: FieldConfig) => ({
  key,
  label: labelKey || label || key,
  labelKey,
  inputComponent,
  required,
  ...options,
});

/**
 * DetailView 컴포넌트
 * 전표 상세 정보 표시 및 CRUD 액션 제공
 */
interface DetailViewProps {
  className?: string;
  mode?: "view" | "edit"; // 표시 모드 (기본값: "view")
}

const DetailView: React.FC<DetailViewProps> = ({
  className,
  mode: initialMode = "view",
}) => {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [expanded, setExpanded] = useState(false);

  const handleExpandChange = useCallback((newExpanded: boolean) => {
    setExpanded(newExpanded);
  }, []);

  /** 테이블 데이터 */

  /** 테이블 행 설정 */
  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "menuNumber",
            inputComponent: TextInput,
            labelKey: "메뉴번호",
            required: true,
            // headerRowspan: 2,
            // dataRowspan: 2,
            rowspan: 2,
          }),
          createField({
            key: "makerName",
            label: "작성자",
            inputComponent: TextInput,
          }),
          createField({
            key: "slipType",
            label: "전표유형",
            inputComponent: SelectInput,
            options: SLIP_TYPE_OPTIONS,
          }),
          createField({
            key: "source",
            label: "원천",
            inputComponent: TextInput,
            dataColspan: 2,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "posting",
            label: "전기",
            inputComponent: TextInput,
          }),
          createField({
            key: "electronicApproval",
            label: "전자결재",
            inputComponent: SelectInput,
            options: APPROVAL_OPTIONS,
          }),
          createField({
            key: "creationDate",
            label: "작성일시",
            inputComponent: DateInput,
            dataColspan: 2,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "reverseNo",
            label: "Reverse No.",
            inputComponent: NumberInput,
          }),
          createField({
            key: "description",
            label: "대표적요",
            inputComponent: TextAreaInput,
            dataColspan: 6,
          }),
        ],
      },
    ],
    []
  );

  /** 왼쪽 액션 버튼 */
  const leftActions = useMemo(
    () => [{ type: "search" as const }, { type: "attachment" as const }],
    []
  );

  /** CRUD 액션 이벤트 핸들러 */
  const handleEdit = useCallback(() => {
    setMode("edit");
  }, []);

  // TODO: 실제 구현 필요
  const handleCreate = useCallback(() => {}, []);
  const handleCopy = useCallback(() => {}, []);
  const handleDelete = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);

  /** 왼쪽 액션 버튼 이벤트 핸들러 */
  const handleLeftAction = useCallback((actionType: string) => {
    // TODO: 실제 구현 필요 (검색, 첨부파일 관리 등)
    console.log("Left action:", actionType);
  }, []);

  // TODO: 실제 구현 필요
  const handleValuesChange = useCallback(() => {}, []);
  const handleFinish = useCallback(() => {}, []);
  const handleFinishFailed = useCallback(() => {}, []);

  /** 커스텀 액션 핸들러 */
  const handleCustomAction = useCallback((action: string) => {
    // TODO: 실제 구현 필요 (결제상신, 승인취소, 더보기 등)
    console.log("Custom action:", action);
  }, []);

  /** ActionButtonGroup 커스텀 버튼들 */
  const customButtons = useMemo(
    () => [
      <FormButton
        key="approve"
        size="small"
        onClick={() => handleCustomAction("approve")}
      >
        결제상신
      </FormButton>,
      <FormButton
        key="cancel-approve"
        size="small"
        onClick={() => handleCustomAction("cancel-approve")}
      >
        승인취소
      </FormButton>,
      <FormButton
        key="more"
        size="small"
        className="data-form__button data-form__button--more"
        onClick={() => handleCustomAction("more")}
      >
        더보기
      </FormButton>,
    ],
    [handleCustomAction]
  );

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        edit: handleEdit, // 수정 버튼
        create: handleCreate, // 신규 버튼
        copy: handleCopy, // 복사 버튼
        delete: handleDelete, // 삭제 버튼
        save: handleSave, // 저장 버튼
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: [],
      // 커스텀 버튼들 (결제 관련 버튼들)
      customButtons,
      // 확장 기능 활성화 (테이블 접기/펼치기)
      enableExpand: true,
      // 동적 확장 상태 (상태 연동)
      expanded,
      // 확장 상태 변경 핸들러
      onExpandChange: handleExpandChange,
      // 최대 표시 행 수
      maxVisibleRows: 2,
    }),
    [
      customButtons,
      handleEdit,
      handleCreate,
      handleCopy,
      handleDelete,
      handleSave,
      expanded, // 확장 상태 추가
      handleExpandChange, // 핸들러 추가
    ]
  );

  return (
    <DataForm
      className={className}
      leftActions={leftActions}
      actionButtonGroup={actionButtonGroup}
      tableRows={tableRows}
      tableData={SAMPLE_TABLE_DATA}
      department="경영관리본부"
      user="관리자"
      status="완료"
      statusClass="done"
      mode={mode}
      onLeftAction={handleLeftAction}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    />
  );
};

export default DetailView;
