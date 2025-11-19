import React from "react";
import { Form, Input, Space } from "antd";
import type { Rule } from "antd/es/form";
import type { InputProps } from "antd";
import type { FormItemLayout } from "antd/es/form/Form";
import { InputStyles } from "./CustomInput.styles";
// CustomInput Props 정의
type CustomInputProps = InputProps & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
};

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  label,
  rules,
  addonAfter: propAddonAfter,
  layout,
  ...rest
}) => {
  const inputElement = <InputStyles {...rest} />;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      layout={layout as FormItemLayout}
      colon={false}
    >
      {propAddonAfter ? (
        <Space.Compact style={{ width: "100%" }}>
          {inputElement}
          {propAddonAfter}
        </Space.Compact>
      ) : (
        inputElement
      )}
    </Form.Item>
  );
};

export default CustomInput;
