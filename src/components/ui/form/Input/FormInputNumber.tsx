import React from "react";
import { Form, InputNumber, Space, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { InputNumberProps } from "antd/es/input-number";
import type { FormItemLayout } from "antd/es/form/Form";
import { addonAfterStyle } from "./AddonAfter.styles";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import {
  formatNumberWithCommas,
  removeCommasFromNumber,
} from "@/utils/stringUtils";

const { Text } = Typography;

export type FormInputNumberProps = Omit<InputNumberProps, "addonAfter" | "mode"> & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  max?: number;
  addonAfter?: React.ReactNode;
  useModalMessage?: boolean;
  mode?: "view" | "edit";
  emptyText?: string;
};

const FULL_WIDTH_STYLE: React.CSSProperties = { width: "100%" };

// 기본 천 단위 구분자 포맷터
const defaultFormatter = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return formatNumberWithCommas(value);
};

// 기본 천 단위 구분자 파서 (InputNumber의 parser는 숫자 또는 null을 반환해야 함)
const defaultParser = (value: string | undefined): number | null => {
  if (!value || value === "") return null;
  const parsed = removeCommasFromNumber(value);
  if (parsed === "") return null;
  const numValue = Number(parsed);
  return isNaN(numValue) ? null : numValue;
};

const FormInputNumber: React.FC<FormInputNumberProps> = ({
  name,
  label,
  rules,
  addonAfter: propAddonAfter,
  layout,
  max,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  formatter,
  parser,
  ...rest
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputNumberRef = React.useRef<any>(null);

  // 모든 hooks를 early return 이전에 호출
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
          validator: (_: unknown, value: number | undefined) => {
            if (value === undefined || value === null) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 입력해주세요.`;

              if (canShowModal()) {
                MessageModal.error({
                  title: "입력 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 InputNumber로 포커스 이동
                    setTimeout(() => {
                      inputNumberRef.current?.focus();
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
        <Form.Item shouldUpdate={(prev, curr) => prev[name] !== curr[name]}>
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const displayValue =
              value !== undefined && value !== null
                ? formatter
                  ? formatter(value, {
                      userTyping: false,
                      input: String(value),
                    })
                  : formatNumberWithCommas(value)
                : emptyText;
            return (
              <Form.Item
                name={name}
                label={label}
                layout={layout as FormItemLayout}
                colon={false}
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
      rules={processedRules}
      layout={layout as FormItemLayout}
      colon={false}
      getValueFromEvent={(value) => {
        return value ?? undefined;
      }}
      {...(useModalMessage ? { validateStatus: "", help: "" } : { help: "" })}
    >
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues[name] !== currentValues[name]
        }
      >
        {({ getFieldValue, setFieldValue }) => {
          const fieldValue = getFieldValue(name);

          const inputNumberProps: Omit<InputNumberProps, "addonAfter"> = {
            ...rest,
            ...(max && max > 0 ? { max } : {}),
            formatter: formatter || defaultFormatter,
            parser: (parser || defaultParser) as InputNumberProps["parser"],
            value: fieldValue ?? null,
            onChange: (value) => {
              setFieldValue(name, value ?? undefined);
              rest.onChange?.(value);
            },
          };

          const inputNumberElement = (
            <InputNumber
              ref={inputNumberRef}
              {...inputNumberProps}
              style={FULL_WIDTH_STYLE}
            />
          );

          return propAddonAfter ? (
            <Space.Compact style={FULL_WIDTH_STYLE}>
              {inputNumberElement}
              <span style={addonAfterStyle}>{propAddonAfter}</span>
            </Space.Compact>
          ) : (
            inputNumberElement
          );
        }}
      </Form.Item>
    </Form.Item>
  );
};

export default FormInputNumber;
