import React, { useState, useEffect, useCallback } from "react";
import { Checkbox, Row, Col, Form } from "antd";
import type { CheckboxProps, CheckboxGroupProps } from "antd/es/checkbox";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";

// 체크박스 옵션 타입
export interface CustomCheckboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 체크박스 크기 타입
export type CustomCheckboxSize = "small" | "middle" | "large";

// 체크박스 상태 타입
export type CustomCheckboxStatus = "error" | "warning";

// 단일 체크박스 Props
export interface CustomCheckboxProps extends Omit<CheckboxProps, "onChange"> {
  label?: string;
  onChange?: (checked: boolean) => void;
  // Form.Item과 함께 사용할 때를 위한 props
  name?: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
}

// 체크박스 그룹 Props
export interface CustomCheckboxGroupProps
  extends Omit<CheckboxGroupProps, "options" | "onChange"> {
  options: CustomCheckboxOption[];
  enableSelectAll?: boolean;
  selectAllLabel?: string;
  maxSelect?: number;
  columns?: number;
  onChange?: (checkedValue: Array<string | number>) => void;
  // Form.Item과 함께 사용할 때를 위한 props
  name?: string;
  label?: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
}

// 단일 체크박스 컴포넌트
const CustomCheckboxBase: React.FC<CustomCheckboxProps> = ({
  label,
  onChange,
  name,
  rules,
  layout,
  children,
  ...rest
}) => {
  const handleChange = (e: { target: { checked: boolean } }) => {
    onChange?.(e.target.checked);
  };

  const checkboxElement = (
    <Checkbox {...rest} onChange={handleChange}>
      {label || children}
    </Checkbox>
  );

  // name이 있으면 Form.Item으로 감싸서 반환
  if (name) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={rules}
        layout={layout as FormItemLayout}
        colon={false}
        valuePropName="checked"
      >
        <Checkbox {...rest} onChange={handleChange}>
          {children}
        </Checkbox>
      </Form.Item>
    );
  }

  return checkboxElement;
};

// 체크박스 그룹 컴포넌트
const CustomCheckboxGroup: React.FC<CustomCheckboxGroupProps> = ({
  options,
  enableSelectAll = false,
  selectAllLabel = "전체 선택",
  maxSelect,
  columns,
  onChange,
  name,
  label,
  rules,
  layout,
  value: controlledValue,
  defaultValue,
  ...rest
}) => {
  const [checkedValues, setCheckedValues] = useState<Array<string | number>>(
    controlledValue || defaultValue || []
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  // 전체 선택 상태 업데이트
  const updateSelectAllState = useCallback(
    (values: Array<string | number>) => {
      const allValues = options.map((opt) => opt.value);
      const allChecked =
        allValues.length > 0 && allValues.every((val) => values.includes(val));
      const someChecked = values.length > 0 && !allChecked;

      setCheckAll(allChecked);
      setIndeterminate(someChecked);
    },
    [options]
  );

  // controlled value가 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (controlledValue !== undefined) {
      setCheckedValues(controlledValue);
      updateSelectAllState(controlledValue);
    }
  }, [controlledValue, updateSelectAllState]);

  // 체크박스 변경 핸들러
  const handleChange = (values: Array<string | number>) => {
    // 최대 선택 개수 제한
    if (maxSelect && values.length > maxSelect) {
      return;
    }

    const newValues = values;
    setCheckedValues(newValues);
    updateSelectAllState(newValues);
    onChange?.(newValues);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    const allValues = options.map((opt) => opt.value);
    const newValues = e.target.checked ? allValues : [];
    setCheckedValues(newValues);
    setCheckAll(e.target.checked);
    setIndeterminate(false);
    onChange?.(newValues);
  };

  // 그리드 레이아웃으로 렌더링
  const renderCheckboxes = () => {
    const checkboxElements = options.map((option) => (
      <Checkbox
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </Checkbox>
    ));

    if (columns && columns > 0) {
      const itemsPerColumn = Math.ceil(options.length / columns);
      const columnsArray = Array.from({ length: columns }, (_, colIndex) => {
        const startIndex = colIndex * itemsPerColumn;
        const endIndex = Math.min(startIndex + itemsPerColumn, options.length);
        return options.slice(startIndex, endIndex);
      });

      return (
        <Row gutter={[16, 8]}>
          {columnsArray.map((columnOptions, colIndex) => (
            <Col key={colIndex} span={24 / columns}>
              {columnOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </Checkbox>
              ))}
            </Col>
          ))}
        </Row>
      );
    }

    return checkboxElements;
  };

  const groupElement = (
    <div>
      {enableSelectAll && (
        <Checkbox
          indeterminate={indeterminate}
          onChange={handleSelectAll}
          checked={checkAll}
          style={{ marginBottom: 8 }}
        >
          {selectAllLabel}
        </Checkbox>
      )}
      <Checkbox.Group
        {...rest}
        value={checkedValues}
        onChange={handleChange}
        style={columns ? { width: "100%" } : undefined}
      >
        {renderCheckboxes()}
      </Checkbox.Group>
    </div>
  );

  // name이 있으면 Form.Item으로 감싸서 반환
  if (name) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={rules}
        layout={layout as FormItemLayout}
        colon={false}
      >
        {groupElement}
      </Form.Item>
    );
  }

  return groupElement;
};

// Group 컴포넌트를 CustomCheckbox에 연결
const CustomCheckbox = CustomCheckboxBase as typeof CustomCheckboxBase & {
  Group: React.FC<CustomCheckboxGroupProps>;
};

CustomCheckbox.Group = CustomCheckboxGroup;

export default CustomCheckbox;
