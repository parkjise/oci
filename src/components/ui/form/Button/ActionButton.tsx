import React, { useMemo } from "react";
import { Button, Form } from "antd";
import type { ButtonProps } from "antd/es/button";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import {
  EditOutlined,
  PlusOutlined,
  CopyOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMenuButtonPermission } from "@/components/providers";

/**
 * 액션 버튼 타입
 */
export type ActionButtonType = "edit" | "create" | "copy" | "delete" | "save";

/**
 * 액션 버튼 Props
 * FormButton의 구조를 따르며, 액션 타입에 따라 자동으로 아이콘과 스타일을 설정합니다.
 */
export interface ActionButtonProps extends Omit<ButtonProps, "type" | "icon" | "danger"> {
  /** 액션 버튼 타입 */
  actionType: ActionButtonType;
  /** 버튼 텍스트 (기본값: 타입에 따라 자동 설정) */
  label?: string;
  /** 객체 ID (버튼 식별용, 권한 체크 시 사용) */
  objId?: string;
  /** 권한이 없을 때 버튼을 숨길지 여부 (기본값: true) */
  hideIfNoPermission?: boolean;
  /** Form.Item으로 감쌀지 여부 */
  wrapFormItem?: boolean;
  /** Form.Item name */
  name?: string;
  /** Form.Item label */
  formLabel?: string;
  /** Form.Item rules */
  rules?: Rule[];
  /** Form.Item layout */
  layout?: "vertical" | "horizontal" | "inline";
  /** 버튼 비활성화 여부 (기본값: false - 활성화 상태) */
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  actionType,
  label,
  objId,
  hideIfNoPermission = true,
  wrapFormItem,
  name,
  formLabel,
  rules,
  layout,
  disabled = false, // 기본값 false로 설정 (활성화 상태)
  children,
  ...rest
}) => {
  const { hasPermission, loading: permissionLoading } =
    useMenuButtonPermission();

  // 액션 타입별 기본 설정
  const actionConfig = useMemo(() => {
    const configs: Record<
      ActionButtonType,
      {
        icon: React.ReactNode;
        defaultLabel: string;
        buttonType: ButtonProps["type"];
        danger?: boolean;
      }
    > = {
      edit: {
        icon: <EditOutlined />,
        defaultLabel: "수정",
        buttonType: "default",
      },
      create: {
        icon: <PlusOutlined />,
        defaultLabel: "입력",
        buttonType: "primary",
      },
      copy: {
        icon: <CopyOutlined />,
        defaultLabel: "복사",
        buttonType: "default",
      },
      delete: {
        icon: <DeleteOutlined />,
        defaultLabel: "삭제",
        buttonType: "default",
        danger: true,
      },
      save: {
        icon: <SaveOutlined />,
        defaultLabel: "저장",
        buttonType: "primary",
      },
    };

    return configs[actionType];
  }, [actionType]);

  // 권한 체크
  const shouldShow = useMemo(() => {
    if (!objId) return true;
    if (permissionLoading) return false;
    return hasPermission(objId);
  }, [objId, permissionLoading, hasPermission]);

  const shouldHide = !shouldShow && hideIfNoPermission;
  const isDisabled =
    (objId && !shouldShow && !hideIfNoPermission) ||
    permissionLoading ||
    disabled;

  if (shouldHide) {
    return null;
  }

  const buttonElement = (
    <Button
      type={actionConfig.buttonType}
      icon={actionConfig.icon}
      danger={actionConfig.danger}
      disabled={isDisabled}
      loading={permissionLoading}
      size="small"
      {...rest}
    >
      {children || label || actionConfig.defaultLabel}
    </Button>
  );

  if (name || wrapFormItem) {
    return (
      <Form.Item
        name={name}
        label={formLabel || label}
        rules={rules}
        layout={layout as FormItemLayout}
        colon={false}
      >
        {buttonElement}
      </Form.Item>
    );
  }

  return buttonElement;
};

export default ActionButton;

