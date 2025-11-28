import React from "react";
import { Form, Tree } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import type { Rule } from "antd/es/form";
import type { DataNode, TreeProps, AntTreeNodeProps } from "antd/es/tree";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";

type FormTreeProps = TreeProps & {
  name: string;
  label?: string;
  rules?: Rule[];
  treeData: DataNode[];
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
};

const FormTree: React.FC<FormTreeProps> = ({
  name,
  label,
  rules,
  treeData,
  useModalMessage = true,
  checkable = false,
  showLine = true,
  ...rest
}) => {
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
          validator: (_: unknown, value: React.Key[] | undefined) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              const errorMessage =
                ruleWithRequired.message ||
                `${label || "항목"}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
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

  // checkable이 false일 때 + 아이콘 표시, true일 때는 기본 체크박스
  const switcherIcon = React.useMemo(() => {
    if (checkable === false) {
      return (props: AntTreeNodeProps) =>
        props.expanded ? <MinusOutlined /> : <PlusOutlined />;
    }
    return undefined; // checkable이 true이거나 undefined일 때는 기본 아이콘 사용
  }, [checkable]);

  return (
    <Form.Item
      name={name}
      label={label}
      rules={processedRules}
      {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
    >
      <Tree
        treeData={treeData}
        checkable={checkable}
        switcherIcon={switcherIcon}
        showLine={showLine}
        {...rest}
      />
    </Form.Item>
  );
};

export default FormTree;
