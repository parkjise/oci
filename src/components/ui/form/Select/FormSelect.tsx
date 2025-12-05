// src/components/form/FormSelect.tsx
import React, { useEffect, useState } from "react";
import { Form, Select, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import type { SelectProps } from "antd/es/select";
import {
  getCodeDetailApi,
  type CodeDetailParams,
  type CodeDetail,
} from "@apis/comCode";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";

const { Option } = Select;
const { Text } = Typography;

interface SelectOption {
  value: string | number;
  label: string;
  layout?: "vertical" | "horizontal" | "inline";
}

interface FormSelectProps
  extends Omit<SelectProps, "options" | "loading" | "mode"> {
  name: string;
  label: string;
  rules?: Rule[];
  placeholder?: string;
  options?: SelectOption[];
  comCodeParams?: CodeDetailParams;
  layout?: "vertical" | "horizontal" | "inline";
  valueKey?: keyof CodeDetail; // 옵션의 value로 사용할 필드 (기본값: code)
  labelKey?: keyof CodeDetail; // 옵션의 label로 사용할 필드 (기본값: name1)
  showCodeInLabel?: boolean; // 코드와 이름을 함께 표시할지 여부 (기본값: false)
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  rules,
  placeholder,
  options: propOptions,
  comCodeParams,
  layout,
  valueKey = "code",
  labelKey = "name1",
  showCodeInLabel = false,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  ...rest
}) => {
  const [options, setOptions] = useState<SelectOption[]>(propOptions || []);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectRef = React.useRef<any>(null);

  // 모든 hooks를 early return 이전에 호출
  useEffect(() => {
    // comCodeParams가 제공된 경우 API를 호출하여 옵션을 가져옵니다
    if (comCodeParams) {
      const fetchOptions = async () => {
        setLoading(true);
        try {
          const response = await getCodeDetailApi(comCodeParams);
          if (response.success && response.data) {
            // 응답이 배열인 경우
            if (Array.isArray(response.data)) {
              const transformedOptions: SelectOption[] = response.data
                .filter((item) => item[valueKey] && item[labelKey]) // 필수 필드가 있는 경우만 포함
                .map((item) => {
                  const codeValue = item.code || item[valueKey];
                  const labelValue = (item[labelKey] as string) || "";
                  const displayLabel =
                    showCodeInLabel && codeValue
                      ? `${labelValue} - ${codeValue}`
                      : labelValue;
                  return {
                    value: item[valueKey] as string | number,
                    label: displayLabel,
                  };
                });
              setOptions(transformedOptions);
            } else {
              // 단일 객체인 경우
              const item = response.data as CodeDetail;
              if (item[valueKey] && item[labelKey]) {
                const codeValue = item.code || item[valueKey];
                const labelValue = (item[labelKey] as string) || "";
                const displayLabel =
                  showCodeInLabel && codeValue
                    ? `${labelValue} - ${codeValue}`
                    : labelValue;
                setOptions([
                  {
                    value: item[valueKey] as string | number,
                    label: displayLabel,
                  },
                ]);
              }
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to fetch code options:", error);
          }
          setOptions([]);
        } finally {
          setLoading(false);
        }
      };

      fetchOptions();
    } else if (propOptions) {
      // comCodeParams가 없고 propOptions가 제공된 경우
      setOptions(propOptions);
    }
  }, [comCodeParams, propOptions, valueKey, labelKey, showCodeInLabel]);

  // showSearch가 활성화되어 있고 filterOption이 제공되지 않은 경우 기본 필터링 함수 사용
  const defaultFilterOption =
    rest.showSearch && rest.filterOption === undefined
      ? (input: string, option: { label?: React.ReactNode } | undefined) => {
          if (!option) return false;
          const optionLabel =
            typeof option.label === "string"
              ? option.label
              : String(option.label || "");
          return optionLabel.toLowerCase().includes(input.toLowerCase());
        }
      : undefined;

  const selectProps = {
    ...rest,
    filterOption:
      rest.filterOption !== undefined ? rest.filterOption : defaultFilterOption,
  };

  // useModalMessage가 true일 때만 required 규칙을 모달로 변환
  const processedRules = React.useMemo(() => {
    if (!rules || !useModalMessage) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        return {
          ...rule,
          validator: (
            _: unknown,
            value: string | number | (string | number)[] | undefined
          ) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 Select로 포커스 이동
                    setTimeout(() => {
                      selectRef.current?.focus();
                    }, 500);
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            return Promise.resolve();
          },
        } as Rule;
      }
      return rule;
    });
  }, [rules, label, useModalMessage]);

  // View 모드일 때 (모든 hooks 호출 후)
  if (mode === "view") {
    return (
      <Form.Item
        name={name}
        label={label}
        layout={layout as FormItemLayout}
        colon={false}
        noStyle
      >
        <Form.Item
          help={null}
          shouldUpdate={(prev, curr) => prev[name] !== curr[name]}
        >
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const selectedOption = options.find((opt) => opt.value === value);
            const displayValue = selectedOption
              ? selectedOption.label
              : value !== undefined && value !== null
              ? String(value)
              : emptyText;
            return (
              <Form.Item
                name={name}
                label={label}
                layout={layout as FormItemLayout}
                colon={false}
                help={null}
              >
                <Text>{displayValue}</Text>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name={name}
      label={label}
      layout={layout as FormItemLayout}
      colon={false}
      rules={processedRules}
      {...(useModalMessage ? { validateStatus: "", help: "" } : { help: "" })}
    >
      <Select
        ref={selectRef}
        placeholder={placeholder}
        loading={loading}
        {...selectProps}
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value} label={option.label}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default FormSelect;
