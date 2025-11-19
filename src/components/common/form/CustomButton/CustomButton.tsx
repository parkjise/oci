import React from "react";
import { Button, Form } from "antd";
import type { ButtonProps } from "antd/es/button";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";

// CustomButton Props 정의
export interface CustomButtonProps extends ButtonProps {
  // Form.Item과 함께 사용할 때를 위한 props (선택적)
  name?: string;
  label?: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  // Form.Item으로 감쌀지 여부 (name이 있으면 자동으로 true)
  wrapFormItem?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  name,
  label,
  rules,
  layout,
  wrapFormItem,
  children,
  ...rest
}) => {
  const buttonElement = <Button {...rest}>{children}</Button>;

  // name이 있거나 wrapFormItem이 true이면 Form.Item으로 감싸서 반환
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

export default CustomButton;

