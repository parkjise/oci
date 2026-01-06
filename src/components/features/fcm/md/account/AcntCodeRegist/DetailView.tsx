import React, { useCallback, useMemo, useEffect, useRef } from "react";
import { useAcntCodeRegistStore } from "@/store/fcm/md/account/AcntCodeRegistStore";
import { Form, message } from "antd";
import {
  DataForm,
  FormInput,
  FormSelect,
  FormRadioGroup,
  FormCheckbox,
} from "@components/ui/form";
import type {
  TableField,
  SupportedActionButtonType
} from "@components/ui/form";
import type { AcntCodeSaveRequest } from "@/types/fcm/md/account/AcntCodeRegist.types";

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
}

// 옵션 상수 정의
const accountLevelOptions = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
];

const costTypeOptions = [
  { value: "VARIABLE", label: "변동비" },
  { value: "FIXED", label: "고정비" },
];

const commonYNOptOptions = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
  { value: "O", label: "Opt." },
];

interface SelectInputProps extends InputProps {
  options?: Array<{ value: string; label: string }>;
  comCodeParams?: {
    module: string;
    type: string;
    enabledFlag?: string;
  };
}

interface SearchInputProps extends InputProps {
  onSearch?: (value: string) => void;
  showReadOnlyBoxName?: string;
}

// DataForm의 inputComponent가 받는 props 타입 정의
type InputComponentProps = {
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  options?: Array<{ value: string; label: string }>;
  onSearch?: (value: string) => void;
  showReadOnlyBoxName?: string;
  [key: string]: unknown;
};

type InputComponentType = NonNullable<TableField["inputComponent"]>;

const TextInput: InputComponentType = (props) => {
  const { value: _v, onChange: _o, ...rest } = props as InputComponentProps;
  return (
    <FormInput
      {...(rest as React.ComponentProps<typeof FormInput>)}
      label=""
    />
  );
};

// 검색 입력 컴포넌트
const SearchInput: InputComponentType = (props) => {
  const {
    name,
    placeholder,
    mode,
    onSearch,
    showReadOnlyBoxName,
    value,
    onChange,
    options,
    ...restProps
  } = props as SearchInputProps & InputComponentProps;

  if (mode === "view") {
    if (showReadOnlyBoxName) {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              name={name}
              label=""
              mode={mode}
              {...(restProps as Omit<
                React.ComponentProps<typeof FormInput>,
                "name" | "mode" | "type"
              >)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              name={showReadOnlyBoxName}
              label=""
              mode={mode}
              {...(restProps as Omit<
                React.ComponentProps<typeof FormInput>,
                "name" | "mode" | "type"
              >)}
            />
          </div>
        </div>
      );
    }
    return (
      <FormInput
        name={name}
        label=""
        mode={mode}
        {...(restProps as Omit<
          React.ComponentProps<typeof FormInput>,
          "name" | "mode" | "type"
        >)}
      />
    );
  }

  return (
    <FormInput
      type="search"
      name={name}
      label=""
      placeholder={placeholder || "검색어를 입력하세요"}
      layout="horizontal"
      size="small"
      mode={mode}
      showReadOnlyBoxName={showReadOnlyBoxName}
      onSearch={onSearch}
      {...(restProps as Omit<
        React.ComponentProps<typeof FormInput>,
        | "name"
        | "placeholder"
        | "mode"
        | "onSearch"
        | "showReadOnlyBoxName"
        | "type"
      >)}
    />
  );
};

const SelectInput: InputComponentType = (props) => {
  const {
    name,
    placeholder,
    options,
    mode = "edit",
    comCodeParams,
    value: _v,
    onChange: _o,
    ...restProps
  } = props as SelectInputProps & InputComponentProps;
  return (
    <FormSelect
      name={name}
      label=""
      placeholder={placeholder}
      options={options}
      mode={mode as "view" | "edit"}
      comCodeParams={comCodeParams}
      {...restProps}
    />
  );
};

// 라디오 버튼 입력 컴포넌트
const RadioInput: InputComponentType = (props) => {
  const { name, mode, options, value: _v, onChange: _o, ...restProps } = props as SelectInputProps &
    InputComponentProps;

  return (
    <FormRadioGroup
      name={name}
      label=""
      mode={mode}
      options={options}
      layout="horizontal"
      {...(restProps as Omit<
        React.ComponentProps<typeof FormRadioGroup>,
        "name" | "label" | "mode" | "options" | "layout"
      >)}
    />
  );
};

// 필드 설정 인터페이스
interface FieldConfig {
  key?: string;
  label?: string;
  inputComponent?: InputComponentType;
  labelKey?: string;
  options?:
  | Array<{ value: string; label: string }>
  | ReadonlyArray<{ value: string; label: string }>;
  inputProps?: Partial<InputComponentProps>;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
  render?: (props: {
    field: TableField;
    value: string;
    onChange: (value: string) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
}

// 필드 설정 헬퍼
const createField = ({
  key = "",
  label = "",
  inputComponent,
  labelKey,
  options,
  inputProps,
  render,
  ...restOptions
}: FieldConfig = {}) => {
  let wrappedComponent: InputComponentType | undefined = inputComponent;

  if ((inputProps || options) && inputComponent) {
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(inputComponent, {
        ...(options
          ? { options: options as Array<{ value: string; label: string }> }
          : {}),
        ...inputProps,
        ...props,
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: labelKey || label,
    inputComponent: wrappedComponent,
    render,
    ...restOptions,
  };
};


type DetailViewProps = {
  className?: string;
  mode?: "view" | "edit";
};


// 체크박스 입력 컴포넌트
const CheckboxInput: InputComponentType = (props) => {
  const { name, mode, value: _v, onChange: _o, ...rest } = props as InputComponentProps;

  return (
    <Form.Item
      name={name}
      valuePropName="checked"
      colon={false}
      style={{ marginBottom: 0 }}
      getValueProps={(val) => ({ checked: val === "Y" })}
      normalize={(val: any) => (val ? "Y" : "N")}
    >
      <FormCheckbox
        mode={mode as "view" | "edit"}
        {...(rest as any)}
      />
    </Form.Item>
  );
};

const DetailView: React.FC<DetailViewProps> = ({
  className,
}) => {
  const [form] = Form.useForm();
  const { selectedData, mode, updateData, save } = useAcntCodeRegistStore();

  const lastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (selectedData) {
      // 1: Yes(Y), 2: No(N), 3: Optional(O) 매핑 처리
      const data = { ...selectedData } as any;
      const selectionFields = [
        "accMgmtNbr1Opt", "accMgmtNbr2Opt", "refOpt", "exchgRateOpt",
        "unitOpt", "etcOpt", "occurDateOpt", "maturDateOpt",
        "cstCdeOpt", "finGdsGrpOpt"
      ];

      selectionFields.forEach(field => {
        const val = String(data[field] ?? "");
        if (val === "1") data[field] = "Y";
        else if (val === "2") data[field] = "N";
        else if (val === "3") data[field] = "O";
      });

      // 계정관리수준 문자열 변환
      if (data.accMgmtLvl !== undefined && data.accMgmtLvl !== null) {
        data.accMgmtLvl = String(data.accMgmtLvl);
      }

      console.log('🔍 [Debug] DetailView Data:', {
        accCode: data.accCode,
        accMgmtNbr1Type: data.accMgmtNbr1Type,
        accMgmtNbr2Type: data.accMgmtNbr2Type,
        refType: data.refType,
        accMgmtLvl: data.accMgmtLvl,
        allData: data
      });



      const currentId = selectedData._rowId || selectedData.accCode;

      if (lastIdRef.current !== currentId) {
        // 레코드가 바뀐 경우에만 폼 초기화
        form.resetFields();
        lastIdRef.current = currentId;
      }

      // 항상 최신 값으로 업데이트 (스토어와 Form 동기화)
      form.setFieldsValue(data);
    } else {
      form.resetFields();
      lastIdRef.current = undefined;
    }
  }, [selectedData, form]);





  // 테이블 행 설정
  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "ifrsOrderSeq",
            label: "IFRS 순번",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "accCode",
            label: "계정코드",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "accName",
            label: "계정과목명",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "accEngName",
            label: "계정과목영문명",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "accAbb",
            label: "계정코드 약어",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "accLvl",
            label: "계정 LVL",
            inputComponent: SelectInput,
            options: accountLevelOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "actAccYn",
            label: "실계정여부",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
          createField({
            key: "acctType",
            label: "계정타입",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCTYP", enabledFlag: "Y" },
              placeholder: "-선택-",
            },
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "highAccCode1",
            label: "상위계정코드 1",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "highAccCode2",
            label: "상위계정코드 2",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "highAccCode3",
            label: "상위계정코드 3",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "highAccCode4",
            label: "상위계정코드 4",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "highAccCode5",
            label: "상위계정코드 5",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({ dataColspan: 6 }),
        ],
      },
      {
        fields: [
          createField({
            key: "accOutName1",
            label: "출력명 1",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "accOutName2",
            label: "출력명 2",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "accOutName3",
            label: "출력명 3",
            inputComponent: TextInput,
            dataColspan: 6
          }),
          createField({
            key: "accOutName4",
            label: "출력명 4",
            inputComponent: TextInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "cdtDbtYn",
            label: "지출결의직접입력",
            inputComponent: CheckboxInput,
            dataColspan: 6,
          }),
          createField({
            key: "cstPayYn",
            label: "지출결의 표시",
            inputComponent: CheckboxInput,
            dataColspan: 6,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "tbOutYn",
            label: "시산표 표시",
            inputComponent: CheckboxInput,
            dataColspan: 6,
          }),
          createField({
            key: "bsOutYn",
            label: "재무상태표 표시",
            inputComponent: CheckboxInput,
            dataColspan: 6,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "isOutYn",
            label: "손익계산서 표시",
            inputComponent: CheckboxInput,
            dataColspan: 6,
          }),
          createField({ dataColspan: 6 }),
        ],
      },
      {
        fields: [
          createField({
            key: "prdExpnYn",
            label: "선급비용 여부",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ],
            dataColspan: 6
          }),
          createField({
            key: "prepayAmtYn",
            label: "선급금 여부",
            inputComponent: RadioInput,
            options: [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ],
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "dlyTbOutYn",
            label: "T/B 출력구분",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6
          }),
          createField({
            key: "evidenceYn",
            label: "증빙관리 사용",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "fundIcmExpnYn",
            label: "고정자산구분",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
          createField({
            key: "entItemYn",
            label: "접대비구분",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "useYn",
            label: "사용",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
          createField({
            key: "newYn",
            label: "신규",
            inputComponent: CheckboxInput,
            dataColspan: 6
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "accMgmtNbr1Opt",
            label: "관리항목(1)선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "accMgmtNbr1Type",
            label: "관리항목(1)유형",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "CUST", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "accMgmtNbr2Opt",
            label: "관리항목(2)선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "accMgmtNbr2Type",
            label: "관리항목(2)유형",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "MNG", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "refOpt",
            label: "REF 선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "refType",
            label: "REF 타입",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "REF", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "exchgRateOpt",
            label: "금액선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "exchgRateType",
            label: "환율등 타입",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "EXCH", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "unitOpt",
            label: "단위선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "unitType",
            label: "단위등 타입",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "UNIT", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "etcOpt",
            label: "기타선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "etcType",
            label: "기타 타입",
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: { module: "GL", type: "ACCMNG", attribute4: "ETC", enabledFlag: "Y" },
              valueKey: "segment5",
              labelKey: "name1",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "occurDateOpt",
            label: "발생일자선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "maturDateOpt",
            label: "만기일자선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "cstCdeOpt",
            label: "공정코드선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
          createField({
            key: "finGdsGrpOpt",
            label: "제품코드선택",
            inputComponent: RadioInput,
            options: commonYNOptOptions,
            dataColspan: 6,
          }),
        ],
      },
      // 다섯 번째 섹션: 원가/손익 분류
      {
        fields: [
          createField({
            key: "coType",
            label: "원가요소구분",
            inputComponent: SearchInput,
            inputProps: {
              onSearch: () => {
                message.info("준비중입니다.");
              },
            },
            dataColspan: 6,
          }),
          createField({
            key: "vfType",
            label: "변동비/고정비",
            inputComponent: SelectInput,
            options: costTypeOptions,
            inputProps: {
              placeholder: "-선택-",
            },
            dataColspan: 4,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "plType",
            label: "손익요소 구분",
            inputComponent: SearchInput,
            inputProps: {
              onSearch: () => {
                message.info("준비중입니다.");
              },
            },
            dataColspan: 6,
          }),
          createField({
            key: "accMgmtLvl",
            label: "계정관리수준",
            inputComponent: SelectInput,
            options: [
              { value: "0", label: "계정코드" },
              { value: "1", label: "계정코드>관리번호1" },
              { value: "2", label: "계정코드>관리번호1>관리번호2" },
              { value: "3", label: "계정코드>관리번호2" },
              { value: "4", label: "계정코드>관리번호2>관리번호1" },
            ],
            dataColspan: 6,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "lagacyCode",
            label: "과거코드",
            inputComponent: TextInput,
            dataColspan: 6,
          }),
          createField({ dataColspan: 6 }),
        ],
      },
    ],
    [selectedData]
  );

  /** CRUD 액션 이벤트 핸들러 */
  const handleSave = useCallback(() => {
    form.submit();
  }, [form]);

  const handleFinish = useCallback(async (values: Record<string, unknown>) => {
    if (!selectedData) return;

    const saveData = {
      ...selectedData,
      ...values,
      officeId: selectedData.officeId || "OSE", // values에 undefined로 포함되어 삭제되는 것을 방지, 없을 시 기본값
    } as any;

    // Y, N, O -> 1, 2, 3 변환
    const selectionFields = [
      "accMgmtNbr1Opt", "accMgmtNbr2Opt", "refOpt", "exchgRateOpt",
      "unitOpt", "etcOpt", "occurDateOpt", "maturDateOpt",
      "cstCdeOpt", "finGdsGrpOpt"
    ];

    selectionFields.forEach(field => {
      if (saveData[field] === "Y") saveData[field] = "1";
      else if (saveData[field] === "N") saveData[field] = "2";
      else if (saveData[field] === "O") saveData[field] = "3";
    });

    // rowStatus가 없거나 'C'가 아니면 'U'로 설정
    if (!saveData.rowStatus) {
      saveData.rowStatus = "U";
    }

    // 공통코드 값 정제 (예: 'CUST01' -> '01')
    // DB 컬럼 길이가 2자리이므로, 뒤에서 2자리만 추출하여 저장
    const codeFields = [
      "accMgmtNbr1Type", "accMgmtNbr2Type", "refType",
      "exchgRateType", "unitType", "etcType"
    ];

    codeFields.forEach(field => {
      const value = saveData[field];
      if (typeof value === "string" && value.length > 2) {
        saveData[field] = value.slice(-2);
      }
    });

    const request: AcntCodeSaveRequest = {
      list: [saveData],
    };

    await save(request);
  }, [selectedData, save]);

  // 입력값 변경 시 스토어 동기화
  const handleValuesChange = useCallback(
    (_changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
      console.log('📝 Form values changed:', _changedValues, 'All values:', allValues);

      if (!selectedData) return;

      const updatedData = {
        ...selectedData,
        ...allValues,
        officeId: selectedData.officeId,
        _rowId: selectedData._rowId,
      } as any;

      // Y, N, O -> 1, 2, 3 역변환 처리
      const selectionFields = [
        "accMgmtNbr1Opt", "accMgmtNbr2Opt", "refOpt", "exchgRateOpt",
        "unitOpt", "etcOpt", "occurDateOpt", "maturDateOpt",
        "cstCdeOpt", "finGdsGrpOpt"
      ];

      selectionFields.forEach(field => {
        if (updatedData[field] === "Y") updatedData[field] = "1";
        else if (updatedData[field] === "N") updatedData[field] = "2";
        else if (updatedData[field] === "O") updatedData[field] = "3";
      });

      // 상태가 'C'(신규)가 아니면 'U'(수정)로 변경
      if (updatedData.rowStatus !== "C") {
        updatedData.rowStatus = "U";
      }


      // 스토어 업데이트 (그리드에 즉시 반영)
      updateData(updatedData);
    },
    [selectedData, updateData]
  );

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        save: handleSave, // 저장 버튼
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: ["create", "edit", "copy", "delete", "expand"] as SupportedActionButtonType[],
    }),
    [
      handleSave,
    ]
  );

  return (
    <DataForm
      form={form}
      tableData={(selectedData as unknown as Record<string, unknown>) || {}}
      className={className}
      actionButtonGroup={actionButtonGroup}
      tableRows={tableRows}
      mode={mode} // 스토어의 모드 사용
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
    // _rowId 보존을 위해 selectedData가 변경될 때마다 폼 값 재설정은 useEffect에서 처리됨
    />
  );
};

export default DetailView;