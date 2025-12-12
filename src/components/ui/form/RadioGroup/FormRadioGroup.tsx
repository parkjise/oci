// src/components/form/FormRadioGroup.tsx
import React, { useEffect, useState } from "react";
import { Form, Radio, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import type { RadioGroupProps } from "antd/es/radio";
import {
  getCodeDetailApi,
  type CodeDetailParams,
  type CodeDetail,
} from "@apis/comCode";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";

const { Text } = Typography;

interface RadioOption {
  value: string | number;
  label: string;
}

interface FormRadioGroupProps extends Omit<RadioGroupProps, "options"> {
  name: string;
  label: string;
  rules?: Rule[];
  options?: RadioOption[];
  comCodeParams?: CodeDetailParams;
  layout?: "vertical" | "horizontal" | "inline";
  valueKey?: keyof CodeDetail; // 옵션의 value로 사용할 필드 (기본값: code)
  labelKey?: keyof CodeDetail; // 옵션의 label로 사용할 필드 (기본값: name1)
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
  filterValues?: (string | number)[]; // 필터링하여 숨길 값들의 배열
}

const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  label,
  rules,
  layout,
  options: propOptions,
  comCodeParams,
  valueKey = "code",
  labelKey = "name1",
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  filterValues,
  ...rest
}) => {
  const [options, setOptions] = useState<RadioOption[]>(propOptions || []);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const radioGroupRef = React.useRef<any>(null);

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
              const transformedOptions: RadioOption[] = response.data
                .filter((item) => item[valueKey] && item[labelKey]) // 필수 필드가 있는 경우만 포함
                .map((item) => ({
                  value: item[valueKey] as string | number,
                  label: (item[labelKey] as string) || "",
                }));
              setOptions(transformedOptions);
            } else {
              // 단일 객체인 경우
              const item = response.data as CodeDetail;
              if (item[valueKey] && item[labelKey]) {
                setOptions([
                  {
                    value: item[valueKey] as string | number,
                    label: (item[labelKey] as string) || "",
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
  }, [comCodeParams, propOptions, valueKey, labelKey]);

  // filterValues에 따라 옵션 필터링
  const filteredOptions = React.useMemo(() => {
    if (!filterValues || filterValues.length === 0) {
      return options;
    }
    return options.filter((option) => !filterValues.includes(option.value));
  }, [options, filterValues]);

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
          validator: (_: unknown, value: string | number | undefined) => {
            if (!value) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 RadioGroup의 첫 번째 Radio로 포커스 이동
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        if (radioGroupRef.current) {
                          const firstRadio =
                            radioGroupRef.current.querySelector(
                              'input[type="radio"]:not([disabled])'
                            ) as HTMLInputElement;

                          if (firstRadio) {
                            // 스크롤하여 요소가 보이도록 함
                            firstRadio.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });

                            // 포커스 이동
                            requestAnimationFrame(() => {
                              firstRadio.focus();
                            });
                          }
                        }
                      }, 500);
                    });
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
        style={{ marginBottom: 0 }}
      >
        <Form.Item noStyle shouldUpdate style={{ marginBottom: 0 }}>
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const selectedOption = filteredOptions.find(
              (opt) => opt.value === value
            );
            const displayValue = selectedOption
              ? selectedOption.label
              : value !== undefined && value !== null
              ? String(value)
              : emptyText;
            return <Text>{displayValue}</Text>;
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
      style={{ marginBottom: 0 }}
      {...(useModalMessage ? { validateStatus: "", help: "" } : { help: "" })}
    >
      <Radio.Group
        ref={radioGroupRef}
        {...rest}
        disabled={loading || rest.disabled}
      >
        {filteredOptions.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
};

export default FormRadioGroup;
