import React from "react";
import { Form, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { TextAreaProps } from "antd/es/input";
import type { FormItemLayout } from "antd/es/form/Form";
import { runes } from "runes2";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import { TextStyles } from "@/components/ui/form/Input/FormTextArea.styles";
// const { TextArea } = Input;
const { Text } = Typography;

// FormTextArea Props 정의
type FormTextAreaProps = TextAreaProps & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  max?: number;
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
};

const FormTextArea: React.FC<FormTextAreaProps> = ({
  name,
  label,
  rules,
  layout,
  max,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  ...rest
}) => {
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
          validator: (_: unknown, value: string | undefined) => {
            if (!value || (typeof value === "string" && value.trim() === "")) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 입력해주세요.`;

              if (canShowModal()) {
                MessageModal.error({
                  title: "입력 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
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
        <Form.Item shouldUpdate style={{ marginBottom: 0 }}>
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const displayValue =
              value !== undefined && value !== null && value !== ""
                ? String(value)
                : emptyText;
            return (
              <Text style={{ whiteSpace: "pre-wrap" }}>{displayValue}</Text>
            );
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  const textAreaProps: TextAreaProps = {
    ...rest,
    ...(max &&
      max > 0 && {
        count: {
          show: true,
          max,
          strategy: (txt) => runes(txt).length,
          exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join(""),
        },
      }),
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={processedRules}
      layout={layout as FormItemLayout}
      colon={false}
      style={{ marginBottom: 0 }}
      {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
    >
      <TextStyles {...textAreaProps} />
    </Form.Item>
  );
};

export default FormTextArea;
