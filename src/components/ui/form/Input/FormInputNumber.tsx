import React, { useMemo, useRef } from "react";
import { Form, Space, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { InputNumberProps } from "antd/es/input-number";
import type { FormItemLayout } from "antd/es/form/Form";
import { addonAfterStyle } from "./AddonAfter.styles";
import { InputNumberStyles } from "./FormInputNumber.styles";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import {
  formatNumberWithCommas,
  removeCommasFromNumber,
} from "@/utils/stringUtils";

const { Text } = Typography;

export type FormInputNumberProps = Omit<
  InputNumberProps,
  "addonAfter" | "mode"
> & {
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

/**
 * 기본 천 단위 구분자 포맷터
 */
const defaultFormatter = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "object") return "";
  return formatNumberWithCommas(value);
};

/**
 * 기본 천 단위 구분자 파서
 * InputNumber의 parser는 숫자 또는 null을 반환해야 함
 */
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
  const inputNumberRef = useRef<any>(null);

  // InputNumber props 구성 (useMemo를 early return 전에 호출)
  const inputNumberProps: Omit<InputNumberProps, "addonAfter"> = useMemo(
    () => ({
      ...rest,
      ...(max && max > 0 ? { max } : {}),
      formatter: formatter || defaultFormatter,
      parser: (parser || defaultParser) as InputNumberProps["parser"],
    }),
    [rest, max, formatter, parser]
  );

  // Validation 규칙 처리
  const processedRules = useMemo(() => {
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
                    setTimeout(() => {
                      // styled component의 ref는 내부 InputNumber 인스턴스를 포함
                      if (inputNumberRef.current) {
                        const inputElement =
                          inputNumberRef.current.input ||
                          inputNumberRef.current;
                        if (
                          inputElement &&
                          typeof inputElement.focus === "function"
                        ) {
                          inputElement.focus();
                        }
                      }
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

  // View 모드 렌더링
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
            const displayValue =
              value !== undefined && value !== null
                ? formatter
                  ? formatter(value, {
                      userTyping: false,
                      input: String(value),
                    })
                  : formatNumberWithCommas(value)
                : emptyText;
            return <Text>{displayValue}</Text>;
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  // InputNumber 엘리먼트 생성
  const inputNumberElement = (
    <InputNumberStyles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={inputNumberRef as any}
      {...inputNumberProps}
      style={FULL_WIDTH_STYLE}
      onChange={rest.onChange}
    />
  );

  return (
    <Form.Item
      name={name}
      label={label}
      rules={processedRules}
      layout={layout as FormItemLayout}
      colon={false}
      style={{ marginBottom: 0 }}
      {...(useModalMessage ? { validateStatus: "", help: "" } : { help: "" })}
    >
      {propAddonAfter ? (
        <Space.Compact style={FULL_WIDTH_STYLE}>
          {inputNumberElement}
          <span style={addonAfterStyle}>{propAddonAfter}</span>
        </Space.Compact>
      ) : (
        inputNumberElement
      )}
    </Form.Item>
  );
};

export default FormInputNumber;
