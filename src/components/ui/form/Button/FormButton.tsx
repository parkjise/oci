import React, { useMemo } from "react";
import { Form } from "antd";
import type { ButtonProps } from "antd/es/button";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import { useMenuButtonPermission } from "@/components/providers";
import { ButtonStyles } from "@/components/ui/form/Button/FormButton.styles";
export interface FormButtonProps extends ButtonProps {
  name?: string;
  label?: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  wrapFormItem?: boolean;
  /** 객체 ID (버튼 식별용, 권한 체크 시 사용) */
  objId?: string;
  /** 권한이 없을 때 버튼을 숨길지 여부 (기본값: true) */
  hideIfNoPermission?: boolean;
}

const FormButton: React.FC<FormButtonProps> = ({
  name,
  label,
  rules,
  layout,
  wrapFormItem,
  children,
  objId,
  hideIfNoPermission = true,
  disabled,
  ...rest
}) => {
  const { hasPermission, loading: permissionLoading } =
    useMenuButtonPermission();

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
    <ButtonStyles {...rest} disabled={isDisabled} loading={permissionLoading}>
      {children}
    </ButtonStyles>
  );

  if (name || wrapFormItem) {
    return (
      <Form.Item
        name={name}
        label={label}
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

export default FormButton;
