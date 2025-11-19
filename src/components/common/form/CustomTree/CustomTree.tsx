import React from "react";
import { Form, Tree } from "antd";
import type { Rule } from "antd/es/form";
import type { DataNode, TreeProps } from "antd/es/tree";

type CustomTreeProps = TreeProps & {
  name: string;
  label?: string;
  rules?: Rule[];
  treeData: DataNode[];
};

const CustomTree: React.FC<CustomTreeProps> = ({
  name,
  label,
  rules,
  treeData,
  ...rest
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <Tree treeData={treeData} {...rest} />
    </Form.Item>
  );
};

export default CustomTree;
