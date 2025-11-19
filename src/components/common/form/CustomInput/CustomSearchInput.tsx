import React from "react";
import { Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import type { SearchProps } from "antd/es/input/Search";
import type { ColProps } from "antd/es/col";
import type { FormItemLayout } from "antd/es/form/Form";

const { Search } = Input;

// CustomSearchInput Props 정의
type CustomSearchInputProps = SearchProps & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  labelCol?: ColProps;
  wrapperCol?: ColProps;
};

const CustomSearchInput: React.FC<CustomSearchInputProps> = ({
  name,
  label,
  rules,
  layout,
  ...rest
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      layout={layout as FormItemLayout}
      colon={false}
    >
      <Search {...rest} />
    </Form.Item>
  );
};

export default CustomSearchInput;
