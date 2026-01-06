import React, { useMemo, useState } from "react";
import { Form, Tooltip } from "antd";
import type { ButtonProps } from "antd/es/button";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import { useTranslation } from "react-i18next";
import { FormButton } from "@components/ui/form";

import { useMenuButtonPermission } from "@/components/providers";

/**
 * 액션 버튼 타입
 */
export type ActionButtonType =
  | "edit"
  | "create"
  | "copy"
  | "delete"
  | "save"
  | "expand";

/**
 * 액션 버튼 Props
 * FormButton의 구조를 따르며, 액션 타입에 따라 자동으로 아이콘과 스타일을 설정합니다.
 */
export interface ActionButtonProps extends Omit<
  ButtonProps,
  "type" | "danger"
> {
  /** 액션 버튼 타입 */
  actionType: ActionButtonType;
  /** 버튼 텍스트 (기본값: 타입에 따라 자동 설정) */
  label?: string;
  /** 툴팁 텍스트 (기본값: 타입에 따라 자동 설정) */
  tooltip?: string;
  /** 툴팁 표시 여부 (기본값: true) */
  showTooltip?: boolean;
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
  tooltip,
  showTooltip = true,
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
  const { t } = useTranslation();
  const { hasPermission, loading: permissionLoading } =
    useMenuButtonPermission();

  // expand 타입에서만 사용하는 내부 상태
  const [internalExpanded, setInternalExpanded] = useState(false);

  // 스타일 없이 커스텀 필요시 주석 해제제
  // 액션 타입별 기본 설정
  const actionConfig = useMemo(() => {
    const configs: Record<
      ActionButtonType,
      {
        // icon: React.ReactNode;
        defaultLabel: string;
        defaultTooltip: string;
        labelKey: string;
        tooltipKey?: string;
        className?: string;
      }
    > = {
      edit: {
        defaultLabel: "수정",
        defaultTooltip: "",
        labelKey: "수정",
        tooltipKey: "",
      },
      create: {
        defaultLabel: "신규",
        defaultTooltip: "",
        labelKey: "신규규",
        tooltipKey: "",
      },
      copy: {
        defaultLabel: "복사",
        defaultTooltip: "",
        labelKey: "복사",
        tooltipKey: "",
      },
      delete: {
        defaultLabel: "삭제",
        defaultTooltip: "",
        labelKey: "삭제",
        tooltipKey: "",
      },
      save: {
        defaultLabel: "저장",
        defaultTooltip: "",
        labelKey: "저장",
        tooltipKey: "",
        className: "navy",
      },
      expand: {
        defaultLabel: "",
        defaultTooltip: internalExpanded ? "접기" : "펼치기",
        labelKey: "",
        tooltipKey: internalExpanded ? "접기" : "펼치기",
      },
    };

    return configs[actionType];
  }, [actionType, internalExpanded]);

  // 다국어 처리된 라벨과 툴팁
  const translatedLabel = useMemo(() => {
    if (label) return label;
    if (actionConfig.labelKey) {
      return t(actionConfig.labelKey, actionConfig.defaultLabel);
    }
    return actionConfig.defaultLabel;
  }, [label, actionConfig.labelKey, actionConfig.defaultLabel, t]);

  const translatedTooltip = useMemo(() => {
    if (tooltip) return tooltip;
    if (actionConfig.tooltipKey && actionConfig.tooltipKey !== "") {
      return t(actionConfig.tooltipKey, actionConfig.defaultTooltip);
    }
    return actionConfig.defaultTooltip;
  }, [tooltip, actionConfig.tooltipKey, actionConfig.defaultTooltip, t]);

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
    <FormButton
      disabled={isDisabled}
      className={actionConfig.className}
      loading={permissionLoading}
      size="small"
      {...rest}
      onClick={
        actionType === "expand"
          ? (e) => {
              setInternalExpanded(!internalExpanded);
              if (rest.onClick) rest.onClick(e);
            }
          : rest.onClick
      }
    >
      {children || translatedLabel}
    </FormButton>
  );

  // 툴팁 적용
  const wrappedButton = showTooltip ? (
    <Tooltip title={translatedTooltip}>{buttonElement}</Tooltip>
  ) : (
    buttonElement
  );

  if (name || wrapFormItem) {
    return (
      <Form.Item
        name={name}
        label={formLabel || translatedLabel}
        rules={rules}
        layout={layout as FormItemLayout}
        colon={false}
      >
        {wrappedButton}
      </Form.Item>
    );
  }

  return wrappedButton;
};

export default ActionButton;
