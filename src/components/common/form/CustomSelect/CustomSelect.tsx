// src/components/form/CustomSelect.tsx
import React from "react";
import { Form, Select } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";

const { Option } = Select;

interface SelectOption {
  value: string | number;
  label: string;
  layout?: "vertical" | "horizontal" | "inline";
}

interface CustomSelectProps {
  name: string;
  label: string;
  rules?: Rule[];
  placeholder?: string;
  options: SelectOption[];
  layout?: "vertical" | "horizontal" | "inline";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  label,
  rules,
  placeholder,
  options,
  layout,
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
      <Select placeholder={placeholder} {...rest}>
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default CustomSelect;
