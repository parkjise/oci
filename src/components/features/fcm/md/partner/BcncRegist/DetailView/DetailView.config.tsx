/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Checkbox, Typography, Form } from "antd";
import type { FormInstance } from "antd/es/form";
import type { TFunction } from "i18next";
import { info } from "@components/ui/feedback/Message/MessageModal";
import {
  FormInput,
  FormInputNumber,
  FormSelect,
  FormRadioGroup,
  FormButton,
  FormDatePicker,
  type TableField,
} from "@components/ui/form";
import {
  CUSTNO_GB_OPTIONS,
  STLM_TERM_OPTIONS,
  STLM_TERM_AR_OPTIONS,
  CREDIT_OPTIONS,
} from "../Constants/SelectOption";

/* eslint-disable react-refresh/only-export-components */

/* =============================================================================
   1. 타입 정의 (Types)
   ============================================================================= */

export type InputComponentProps = {
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
  [key: string]: any;
};

export type InputComponentType = NonNullable<TableField["inputComponent"]>;

export interface FieldConfig {
  key?: string;
  label?: string | React.ReactNode;
  inputComponent?: InputComponentType;
  labelKey?: string;
  required?: boolean;
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
    value: any;
    onChange: (value: any) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
}

/* =============================================================================
   2. 내부 전용 하위 컴포넌트 및 래퍼 (Internal Components)
   ============================================================================= */

const TextInput: InputComponentType = (props) => (
  <FormInput {...(props as any)} label="" />
);

const NumberInput: InputComponentType = (props) => (
  <FormInputNumber {...(props as any)} label="" />
);

const DateInput: InputComponentType = (props) => (
  <FormDatePicker {...(props as any)} label="" />
);

const SelectInput: InputComponentType = (props) => (
  <FormSelect {...(props as any)} label="" />
);

const RadioInput: InputComponentType = (props) => (
  <FormRadioGroup {...(props as any)} label="" layout="horizontal" />
);

/**
 * 검색 기능을 포함하는 입력 필드
 */
const SearchInput: InputComponentType = (props: any) => {
  const {
    name,
    placeholder,
    mode,
    onSearch,
    showReadOnlyBoxName,
    ...restProps
  } = props;

  if (mode === "view") {
    if (showReadOnlyBoxName) {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <FormInput
              name={name}
              label=""
              mode={mode}
              {...(restProps as Record<string, any>)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormInput
              name={showReadOnlyBoxName}
              label=""
              mode={mode}
              {...(restProps as Record<string, any>)}
            />
          </div>
        </div>
      );
    }
    return (
      <FormInput name={name} label="" mode={mode} {...(restProps as any)} />
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
      {...(restProps as any)}
    />
  );
};

/**
 * 총여신한도 계산 및 표시 필드
 */
const TotalCreditLimitField: React.FC<{
  name: string;
  mode: "view" | "edit";
  form: FormInstance;
}> = ({ name, mode, form }) => {
  const collateral = Form.useWatch("collateralAmount", form) ?? 0;
  const surety = Form.useWatch("creditSurety", form) ?? 0;
  const limit = Form.useWatch("creditLimit", form) ?? 0;

  const total = Number(collateral) + Number(surety) + Number(limit);

  if (mode === "view") {
    return <Typography.Text>{total.toLocaleString()}</Typography.Text>;
  }

  return (
    <FormInputNumber
      name={name}
      label=""
      mode={mode}
      disabled={true}
      value={total}
    />
  );
};

/* =============================================================================
   3. 유틸리티 및 헬퍼 (Utilities & Helpers)
   ============================================================================= */

/**
 * 필드 설정 헬퍼
 */
export const createField = ({
  key = "",
  label = "",
  inputComponent,
  labelKey,
  required,
  options,
  inputProps,
  render,
  ...restOptions
}: FieldConfig = {}): TableField => {
  let wrappedComponent: InputComponentType | undefined = inputComponent;

  const finalInputProps = { ...inputProps };
  if (required) {
    const rules = Array.isArray(finalInputProps.rules)
      ? [...finalInputProps.rules]
      : [];
    finalInputProps.rules = [
      ...rules,
      {
        required: true,
        message: `${
          typeof label === "string" ? label : labelKey || "필수 항목"
        }을(를) 입력하세요.`,
      },
    ];
  }

  if ((inputProps || options || required) && inputComponent) {
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(inputComponent, {
        ...(options
          ? { options: options as Array<{ value: string; label: string }> }
          : {}),
        ...finalInputProps,
        ...props,
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: (labelKey || label) as any,
    inputComponent: wrappedComponent,
    render,
    required,
    ...restOptions,
  } as TableField;
};

/**
 * 입력 필드와 버튼을 함께 렌더링하는 헬퍼 함수
 */
const createFieldWithButton = ({
  key,
  label,
  inputName,
  inputType = "input",
  buttonText,
  buttonOnClick,
  dataColspan,
  inputProps,
}: {
  key: string;
  label: string;
  inputName?: string;
  inputType?: "input" | "select";
  buttonText: string;
  buttonOnClick?: () => void;
  dataColspan?: number;
  inputProps?: Partial<InputComponentProps>;
}) => {
  return createField({
    key,
    label,
    render: ({ mode }) => {
      const showButton = mode === "edit";
      const button = showButton ? (
        <FormButton
          size="small"
          onClick={buttonOnClick}
          style={{ whiteSpace: "nowrap" }}
        >
          {buttonText}
        </FormButton>
      ) : null;

      if (!inputName) return button;

      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            {inputType === "input" ? (
              <FormInput
                name={inputName}
                label=""
                mode={mode}
                {...(inputProps as any)}
              />
            ) : (
              <FormSelect
                name={inputName}
                label=""
                mode={mode}
                {...(inputProps as any)}
              />
            )}
          </div>
          {button}
        </div>
      );
    },
    dataColspan,
  });
};

/**
 * 두 개의 필드를 나란히 배치하는 헬퍼 함수
 */
const createDualField = ({
  key,
  label,
  firstField,
  secondField,
  gap = "8px",
  dataColspan = 2,
}: {
  key: string;
  label: string;
  firstField: {
    name: string;
    component?: string;
    disabled?: boolean;
    props?: any;
  };
  secondField: {
    name: string;
    component?: string;
    disabled?: boolean;
    props?: any;
  };
  gap?: string;
  dataColspan?: number;
}) => {
  const renderUnit = (cfg: any, mode: any) => {
    const Component = cfg.component === "select" ? FormSelect : FormInput;
    return (
      <Component
        name={cfg.name}
        label=""
        mode={mode}
        disabled={cfg.disabled}
        {...cfg.props}
      />
    );
  };

  return createField({
    key,
    label,
    render: ({ mode }) => (
      <div style={{ display: "flex", gap, alignItems: "center" }}>
        <div style={{ flex: 1 }}>{renderUnit(firstField, mode)}</div>
        <div style={{ flex: 1 }}>{renderUnit(secondField, mode)}</div>
      </div>
    ),
    dataColspan,
  });
};

/* =============================================================================
   4. 메인 테이블 행 설정 (Main Configuration)
   ============================================================================= */

interface ConfigOptions {
  t: TFunction; // i18n 번역 함수
  detailData?: any; // ⚡ [최적화] optional로 변경, 구조 설정에 불필요
  personYn?: string;
  custnoGb?: string;
  nationalCde?: string;
  handleSearchInputClick: (
    val: string,
    params: {
      targetField1: string;
      targetField2?: string;
      field1Label: string;
      field2Label?: string;
    }
  ) => void;
  form: FormInstance;
  mode?: "view" | "edit";
  onCheckBusRegNo?: () => void;
  onBcncAcnutRegistClick?: () => void;
  onCurrencyClick?: (value: string) => void;
  onWriterClick?: (value: string) => void;
  onAccount1Click?: (value: string) => void;
  onAccount2Click?: (value: string) => void;
  onPayToClick?: (value: string) => void;
  onBillToClick?: (value: string) => void;
  onZipCodeClick?: (value: string) => void;
  onNationalCodeClick?: (value: string) => void;
  onPaymentMethodClick?: (value: string) => void;
  onVatTypeApClick?: (value: string) => void;
  onVatTypeArClick?: (value: string) => void;
  onBankClick?: (value: string) => void;
  stlmTermOptions?: Array<{ value: string; label: string }>;
  stlmTermArOptions?: Array<{ value: string; label: string }>;
}

/**
 * 테이블 행 설정을 생성하는 함수 (모든 필드 복구)
 */
export const getTableRows = (options: ConfigOptions) => {
  const {
    t,
    // detailData: ⚡ [최적화] 사용하지 않으므로 제거
    personYn,
    custnoGb,
    nationalCde,
    handleSearchInputClick,
    form,
    // mode,
    onCheckBusRegNo,
    onBcncAcnutRegistClick,
    // onCurrencyClick,
    onWriterClick,
    onAccount1Click,
    onAccount2Click,
    onPayToClick,
    onBillToClick,
    onZipCodeClick,
    onNationalCodeClick,
    onPaymentMethodClick,
    onVatTypeApClick,
    onVatTypeArClick,
    onBankClick,
    stlmTermOptions,
    stlmTermArOptions,
  } = options;

  // 거래처 구분에 따른 필수값 로직
  // 매출+매입 (C): 지급방법, 지급조건, 미지급금계정, 선급금계정, 수금조건
  // 매출 (A): 수금조건
  // 매입 (B): 지급방법, 지급조건, 미지급금계정, 선급금계정
  const isMethodRequired = custnoGb === "C" || custnoGb === "B"; // 매출+매입 또는 매입
  const isStlmTermRequired = custnoGb === "C" || custnoGb === "B"; // 매출+매입 또는 매입
  const isAcctNum1Required = custnoGb === "C" || custnoGb === "B"; // 매출+매입 또는 매입
  const isAcctNum2Required = custnoGb === "C" || custnoGb === "B"; // 매출+매입 또는 매입
  const isStlmTermArRequired = custnoGb === "C" || custnoGb === "A"; // 매출+매입 또는 매출

  // nationalCde_chk 로직: KOR이 아니면 사업자번호/법인번호 비활성화
  const isForeign = nationalCde && nationalCde !== "KOR";

  return [
    // [기본 정보]
    {
      fields: [
        createField({
          key: "custno",
          label: t("거래처"),
          inputComponent: TextInput,
          inputProps: {
            placeholder: "",
          },
          required: true,
          // ✅ [최적화] detailData 직접 참조 제거, Form 상태를 통해 동적으로 disabled 결정
          render: ({ field, value, onChange, mode }) => {
            const formInstance = form as any;
            const custno = formInstance?.getFieldValue("custno");
            const rowStatus = formInstance?.getFieldValue("rowStatus");
            const isDisabled = !!custno && rowStatus !== "C";

            return (
              <TextInput
                name={field.key}
                value={value}
                onChange={(e: any) => onChange(e.target.value)}
                placeholder=""
                disabled={mode === "view" || isDisabled}
              />
            );
          },
        }),
        createField({
          key: "useYno",
          label: t("사용구분"),
          inputComponent: RadioInput,
          options: [
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ],
        }),
        createField({
          key: "custname",
          label: t("거래처명"),
          inputComponent: TextInput,
          dataColspan: 5,
          required: true,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "custnoGb",
          label: t("거래처구분"),
          inputComponent: SelectInput,
          options: [{ value: "", label: " " }, ...CUSTNO_GB_OPTIONS],
          required: true,
        }),
        createField({
          key: "custType",
          label: t("거래처타입"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CUSTYP", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
          required: true,
        }),
        createField({
          key: "custename",
          label: t("거래처대외명"),
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({}),
        createField({
          key: "currency",
          label: t("통화"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "FRNCUR", enabledFlag: "Y" },
            labelKey: "code",
            allOptionLabel: " ",
          },
          required: true,
        }),
        createField({
          key: "dscr1",
          label: t("비고"),
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "spacer_top",
          label: "",
          render: () => (
            <span style={{ display: "block", minHeight: "32px" }}>&nbsp;</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    // [개인/직원 정보]
    {
      fields: [
        createField({
          key: "personYn",
          label: t("개인"),
          render: ({ field, value, mode }) => {
            if (mode === "view") {
              return (
                <Typography.Text>{value === "Y" ? "Y" : "N"}</Typography.Text>
              );
            }
            return (
              <Form.Item
                name={field.key}
                valuePropName="checked"
                normalize={(v) => (v === true ? "Y" : "N")}
                getValueProps={(v) => ({ checked: v === "Y" })}
                noStyle
              >
                <Checkbox />
              </Form.Item>
            );
          },
        }),
        createField({
          key: "business",
          label: t("직원"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "empyNme",
            onSearch: (v: string) => {
              if (onWriterClick) {
                onWriterClick(v);
              } else {
                handleSearchInputClick(v, {
                  targetField1: "business",
                  targetField2: "empyNme",
                  field1Label: "직원 코드",
                  field2Label: "직원명",
                });
              }
            },
          },
          dataColspan: 3,
        }),
        createField({
          key: "smallBusinessFlag",
          label: t("기업규모"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CUSSIZ", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
        }),
        createField({
          key: "custStatus",
          label: t("상태"),
          inputComponent: TextInput,
          inputProps: { disabled: true },
        }),
      ],
    },
    // [사업자 정보]
    {
      fields: [
        createFieldWithButton({
          key: "regtno",
          label: personYn === "Y" ? t("주민등록번호") : t("사업자등록번호"),
          inputName: "regtno",
          buttonText: "Check Bus. Regist. No.",
          buttonOnClick: onCheckBusRegNo,
          dataColspan: 3,
          inputProps: { disabled: isForeign },
        }),
        createField({
          key: "regtnoNo",
          label: t("종사업장"),
          inputComponent: TextInput,
        }),
        createField({
          key: "pname",
          label: t("대표자명"),
          inputComponent: TextInput,
        }),
        createField({
          key: "fax",
          label: t("FAX번호"),
          inputComponent: TextInput,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "pidno",
          label: t("법인번호"),
          inputComponent: TextInput,
          dataColspan: 3,
          inputProps: { disabled: isForeign },
        }),
        createField({
          key: "orgId",
          label: t("주거래사업장"),
          inputComponent: SelectInput,
          options: [
            { value: "", label: " " },
            { value: "HO", label: "본사" },
            { value: "%", label: "전체" },
          ],
          dataColspan: 3,
        }),
        createField({
          key: "tel",
          label: t("전화번호") + "1",
          inputComponent: TextInput,
        }),
      ],
    },
    // [업태/업종]
    {
      fields: [
        createField({
          key: "uptae",
          label: t("업태"),
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "charger",
          label: t("업체담당자"),
          inputComponent: TextInput,
        }),
        createDualField({
          key: "pcustno",
          label: "End User",
          firstField: { name: "pcustno" },
          secondField: { name: "pcustname", disabled: true },
          dataColspan: 3,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "jong",
          label: t("종목"),
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "zipcode",
          label: t("우편번호"),
          inputComponent: SearchInput,
          inputProps: {
            onSearch: (v: string) => {
              if (onZipCodeClick) {
                onZipCodeClick(v);
              } else {
                info({
                  title: "우편번호",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
        }),
        createField({
          key: "attribute1",
          label: t("존속_신설"),
          inputComponent: SelectInput,
          options: [
            { value: "", label: " " },
            { value: "존속", label: "존속" },
            { value: "신설", label: "신설" },
          ],
        }),
        createField({
          key: "ntnlCde",
          label: t("지역구분"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "DMRGCD", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
        }),
      ],
    },
    // [지역/국가 정보]
    {
      fields: [
        createField({
          key: "custArea",
          label: t("국내_해외"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "WAGARE", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
        }),
        createField({
          key: "rarea",
          label: t("대륙코드"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "CONTNT", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
        }),
        createField({
          key: "addr",
          label: t("주소"),
          inputComponent: TextInput,
          dataColspan: 5,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "nationalCde",
          label: t("국가코드"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "nationName",
            onSearch: (v: string) => {
              if (onNationalCodeClick) {
                onNationalCodeClick(v);
              } else {
                info({
                  title: "국가코드",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
          dataColspan: 3,
        }),
        createField({
          key: "category4",
          label: t("관계사여부"),
          inputComponent: SelectInput,
          options: [
            { value: "", label: " " },
            { value: "Y", label: "Y" },
            { value: "N", label: "N" },
          ],
        }),
        createField({
          key: "custSpecialRel",
          label: t("특수관계자여부"),
          inputComponent: SelectInput,
          options: [
            { value: "", label: " " },
            { value: "Y", label: "Y" },
            { value: "N", label: "N" },
          ],
        }),
        createField({
          key: "iconsCode",
          label: "I-CONS CD",
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "GL", type: "ICONCD", enabledFlag: "Y" },
            allOptionLabel: " ",
          },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "sdate",
          label: t("거래개시일자"),
          inputComponent: DateInput,
        }),
        createField({
          key: "odate",
          label: t("창업일자"),
          inputComponent: DateInput,
        }),
        createDualField({
          key: "oldVendor",
          label: t("(구)Vendor_Vendor_Site"),
          firstField: { name: "oldVendor", disabled: true },
          secondField: { name: "oldVendorSite", disabled: true },
          dataColspan: 2,
        }),
        createDualField({
          key: "oldCustno",
          label: t("(구)Customer_Cust_Site"),
          firstField: { name: "oldCustno", disabled: true },
          secondField: { name: "oldCustSite", disabled: true },
          dataColspan: 2,
        }),
      ],
    },
    // [매입 섹션]
    {
      fields: [
        createField({
          key: "purchase_label",
          label: (
            <span style={{ color: "#1890ff", fontSize: "15px" }}>[매입]</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "method",
          label: t("지급방법"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "mthdName",
            onSearch: (v: string) => {
              if (onPaymentMethodClick) {
                onPaymentMethodClick(v);
              } else {
                info({
                  title: "지급방법",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
          dataColspan: 3,
          required: isMethodRequired,
        }),
        createField({
          key: "stlmTerm",
          label: t("지급조건"),
          inputComponent: SelectInput,
          options: stlmTermOptions
            ? [{ value: "", label: " " }, ...stlmTermOptions]
            : [{ value: "", label: " " }, ...STLM_TERM_OPTIONS],
          dataColspan: 3,
          required: isStlmTermRequired,
        }),
        createFieldWithButton({
          key: "custAcct",
          label: t("거래처계좌"),
          buttonText: t("거래처계좌_조회"),
          buttonOnClick: onBcncAcnutRegistClick,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "acctNum1",
          label: t("미지급금계정"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "acctName1",
            onSearch: (v: string) => {
              if (onAccount1Click) {
                onAccount1Click(v);
              } else {
                handleSearchInputClick(v, {
                  targetField1: "acctNum1",
                  targetField2: "acctName1",
                  field1Label: "계정코드",
                  field2Label: "계정명",
                });
              }
            },
          },
          dataColspan: 3,
          required: isAcctNum1Required,
        }),
        createField({
          key: "acctNum2",
          label: t("선급금계정"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "acctName2",
            onSearch: (v: string) => {
              if (onAccount2Click) {
                onAccount2Click(v);
              } else {
                handleSearchInputClick(v, {
                  targetField1: "acctNum2",
                  targetField2: "acctName2",
                  field1Label: "계정코드",
                  field2Label: "계정명",
                });
              }
            },
          },
          dataColspan: 3,
          required: isAcctNum2Required,
        }),
        createField({
          key: "coUpload",
          label: t("전방대등록여부"),
          inputComponent: TextInput,
          inputProps: { disabled: true },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "vatType",
          label: t("VAT(매입)"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "vatNmeAp",
            onSearch: (v: string) => {
              if (onVatTypeApClick) {
                onVatTypeApClick(v);
              } else {
                info({
                  title: "VAT(매입)",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
          dataColspan: 3,
        }),
        createField({
          key: "payToCust",
          label: "Pay To",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "payToName",
            onSearch: (v: string) => {
              if (onPayToClick) {
                onPayToClick(v);
              } else {
                handleSearchInputClick(v, {
                  targetField1: "payToCust",
                  targetField2: "payToName",
                  field1Label: "Pay To 코드",
                  field2Label: "Pay To명",
                });
              }
            },
          },
          dataColspan: 5,
        }),
      ],
    },
    // [매출 섹션]
    {
      fields: [
        createField({
          key: "sales_label",
          label: (
            <span style={{ color: "#1890ff", fontSize: "15px" }}>[매출]</span>
          ),
          headerColspan: 1,
          dataColspan: 9,
        }),
      ],
    },
    {
      fields: [
        createField({}),
        createField({
          key: "salesMan",
          label: t("영업사원"),
          inputComponent: SearchInput,
          inputProps: {
            onSearch: () => {
              info({
                title: "영업사원",
                content: "팝업 준비중입니다.",
              });
            },
          },
        }),
        createField({
          key: "phoneMobile1",
          label: t("핸드폰") + "1",
          inputComponent: TextInput,
        }),
        createField({
          key: "emailId",
          label: t("전자세금계산서_수신_E-mail"),
          inputComponent: TextInput,
          dataColspan: 3,
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "vatType2",
          label: t("VAT(매출)"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "vatNmeAr",
            onSearch: (v: string) => {
              if (onVatTypeArClick) {
                onVatTypeArClick(v);
              } else {
                info({
                  title: "VAT(매출)",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
          dataColspan: 3,
        }),
        createField({
          key: "category1",
          label: t("가상계좌(은행)"),
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "bankName",
            onSearch: (v: string) => {
              if (onBankClick) {
                onBankClick(v);
              } else {
                info({
                  title: "가상계좌(은행)",
                  content: "팝업 준비중입니다.",
                });
              }
            },
          },
          dataColspan: 3,
        }),
        createField({
          key: "channel",
          label: t("채널"),
          inputComponent: SelectInput,
          inputProps: {
            comCodeParams: { module: "AR", type: "CHANEL", enabledFlag: "Y" },
            allOptionLabel: "-선택-",
          },
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "stlmTermAr",
          label: t("수금조건"),
          inputComponent: SelectInput,
          options: stlmTermArOptions
            ? [{ value: "", label: " " }, ...stlmTermArOptions]
            : [{ value: "", label: "--" }, ...STLM_TERM_AR_OPTIONS],
          dataColspan: 3,
          required: isStlmTermArRequired,
        }),
        createField({
          key: "category2",
          label: t("가상계좌번호"),
          inputComponent: TextInput,
          dataColspan: 3,
        }),
        createField({
          key: "credit",
          label: t("신용등급"),
          inputComponent: SelectInput,
          options: [{ value: "", label: "-선택-" }, ...CREDIT_OPTIONS],
        }),
      ],
    },
    {
      fields: [
        createField({
          key: "billToCust",
          label: "Bill To",
          inputComponent: SearchInput,
          inputProps: {
            showReadOnlyBoxName: "billToName",
            onSearch: (v: string) => {
              if (onBillToClick) {
                onBillToClick(v);
              } else {
                handleSearchInputClick(v, {
                  targetField1: "billToCust",
                  targetField2: "billToName",
                  field1Label: "Bill To 코드",
                  field2Label: "Bill To명",
                });
              }
            },
          },
          dataColspan: 7,
        }),
        createField({
          key: "cdate",
          label: t("신용평가일자"),
          inputComponent: DateInput,
        }),
      ],
    },
    // 마지막 총여신한도 섹션
    {
      fields: [
        createField({
          key: "collateralAmount",
          label: t("담보한도금액"),
          inputComponent: NumberInput,
        }),
        createField({
          key: "creditSurety",
          label: t("보험한도금액"),
          inputComponent: NumberInput,
        }),
        createField({
          key: "creditLimit",
          label: t("신용한도금액"),
          inputComponent: NumberInput,
        }),
        createField({
          key: "totalCreditLimit",
          label: t("총여신한도"),
          render: ({ field, mode }) => (
            <TotalCreditLimitField name={field.key} mode={mode} form={form} />
          ),
        }),
        createField({
          key: "creditLimitMonths",
          label: t("신용한도월수"),
          inputComponent: NumberInput,
        }),
      ],
    },
  ];
};
