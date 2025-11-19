// src/components/form/CustomRadioGroup.tsx
import React from "react";
import { Form, Radio } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";

interface RadioOption {
  value: string | number;
  label: string;
}

interface CustomRadioGroupProps {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  options: RadioOption[];
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  name,
  label,
  rules,
  layout,
  options,
  ...rest
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      layout={layout as FormItemLayout}
      colon={false}
      rules={rules}
    >
      <Radio.Group {...rest}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
};

export default CustomRadioGroup;
