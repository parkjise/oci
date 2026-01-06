/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { 
  FormInput, 
  FormButton, 
  FormSelect, 
  FormRadioGroup, 
  FormDatePicker, 
  type TableField 
} from "@components/ui/form";
import {
  DeptSearchContainer,
} from "./UserDetailPanel.styles";

/* =============================================================================
   타입 정의 (Types)
   ============================================================================= */

export type InputComponentProps = {
  name: string;
  placeholder?: string;
  value?: any;
  onChange?: (val: any) => void;
  options?: Array<{ value: string; label: string }>;
  [key: string]: any;
};

export type InputComponentType = NonNullable<TableField["inputComponent"]>;

export interface FieldConfig {
  key?: string;
  label?: string | React.ReactNode;
  inputComponent?: InputComponentType;
  type?: "text" | "select" | "radio" | "date";
  labelKey?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
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
   유틸리티 및 헬퍼 (Utilities & Helpers)
   ============================================================================= */

/**
 * 필드 설정 헬퍼
 */
export const createField = ({
  key = "",
  label = "",
  inputComponent,
  type = "text",
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

  // 기본 컴포넌트 자동 할당
  if (!wrappedComponent && !render) {
    if (type === "select") wrappedComponent = FormSelect as any;
    else if (type === "radio") wrappedComponent = FormRadioGroup as any;
    else if (type === "date") wrappedComponent = FormDatePicker as any;
    else wrappedComponent = FormInput as any;
  }

  if (wrappedComponent && !render) {
    const Component = wrappedComponent;
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(Component as any, {
        ...(options ? { options } : {}),
        layout: type === "radio" ? "horizontal" : undefined,
        ...finalInputProps,
        ...props,
        label: "", // DataForm handles labels
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: (labelKey || label) as any,
    inputComponent: wrappedComponent,
    render,
    required, // DataForm uses this to show red asterisk
    ...restOptions,
  } as TableField;
};

/**
 * 부서 조회 필드 생성
 */
export const createDeptField = ({
  onDeptSearchClick,
  mode: _mode,
}: {
  onDeptSearchClick?: () => void;
  mode?: "view" | "edit";
}) => {
  return createField({
    key: "deptName",
    label: "부서",
    required: true,
    render: ({ mode: renderMode }) => {
      const showButton = renderMode === "edit";
      const deptRules = [{ required: true, message: "부서를 선택하세요." }];
      
      return (
        <>
          <Form.Item name="deptCode" rules={deptRules} noStyle>
            <input type="hidden" />
          </Form.Item>
          <DeptSearchContainer>
            <div className="dept-search__input">
              <FormInput
                name="deptName"
                label=""
                readOnly
                mode={renderMode}
                rules={deptRules}
              />
            </div>
            {showButton && onDeptSearchClick && (
              <FormButton
                icon={<SearchOutlined />}
                onClick={onDeptSearchClick}
              />
            )}
          </DeptSearchContainer>
        </>
      );
    },
  });
};

