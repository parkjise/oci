import React, { useState, useEffect, useCallback } from "react";
import { Checkbox, Row, Col, Form, Typography } from "antd";
import type { CheckboxProps, CheckboxGroupProps } from "antd/es/checkbox";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import { getCodeDetailApi } from "@apis/comCode";
import type { CodeDetail, CodeDetailParams } from "@/types/api.types";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";

const { Text } = Typography;

// 체크박스 옵션 타입
export interface FormCheckboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 단일 체크박스 Props
export interface FormCheckboxProps extends Omit<CheckboxProps, "onChange"> {
  label?: string;
  onChange?: (checked: boolean) => void;
  // Form.Item과 함께 사용할 때를 위한 props
  name?: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
}

// 체크박스 그룹 Props
export interface FormCheckboxGroupProps
  extends Omit<CheckboxGroupProps, "options" | "onChange"> {
  options?: FormCheckboxOption[];
  comCodeParams?: CodeDetailParams;
  valueKey?: keyof CodeDetail; // 옵션의 value로 사용할 필드 (기본값: code)
  labelKey?: keyof CodeDetail; // 옵션의 label로 사용할 필드 (기본값: name1)
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
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
  filterValues?: (string | number)[]; // 필터링하여 숨길 값들의 배열
}

// 단일 체크박스 컴포넌트
const FormCheckboxBase: React.FC<FormCheckboxProps> = ({
  label,
  onChange,
  name,
  rules,
  layout,
  useModalMessage = true,
  children,
  ...rest
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkboxRef = React.useRef<any>(null);

  const handleChange = (e: { target: { checked: boolean } }) => {
    onChange?.(e.target.checked);
  };

  // useModalMessage가 true일 때만 required 규칙을 모달로 변환
  const processedRules = React.useMemo(() => {
    if (!rules || !useModalMessage || !name) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        return {
          ...rule,
          validator: (_: unknown, value: boolean | undefined) => {
            if (!value) {
              const errorMessage =
                ruleWithRequired.message ||
                `${label || "체크박스"}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 Checkbox로 포커스 이동
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        if (checkboxRef.current) {
                          const checkboxInput =
                            checkboxRef.current.querySelector(
                              'input[type="checkbox"]:not([disabled])'
                            ) as HTMLInputElement;

                          if (checkboxInput) {
                            // 스크롤하여 요소가 보이도록 함
                            checkboxInput.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });

                            // 포커스 이동
                            requestAnimationFrame(() => {
                              checkboxInput.focus();
                            });
                          } else {
                            // querySelector가 실패하면 직접 focus 시도
                            checkboxRef.current?.focus();
                          }
                        }
                      }, 100);
                    });
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            return Promise.resolve();
          },
        } as Rule;
      }
      return rule;
    });
  }, [rules, label, useModalMessage, name]);

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
        rules={processedRules}
        layout={layout as FormItemLayout}
        colon={false}
        valuePropName="checked"
        {...(useModalMessage
          ? { validateStatus: "", help: null }
          : { help: null })}
      >
        <Checkbox ref={checkboxRef} {...rest} onChange={handleChange}>
          {children}
        </Checkbox>
      </Form.Item>
    );
  }

  return checkboxElement;
};

// 체크박스 그룹 컴포넌트
const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({
  options: propOptions,
  comCodeParams,
  valueKey = "code",
  labelKey = "name1",
  enableSelectAll = false,
  selectAllLabel = "전체 선택",
  maxSelect,
  columns,
  onChange,
  name,
  label,
  rules,
  layout,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  value: controlledValue,
  defaultValue,
  filterValues,
  ...rest
}) => {
  const [options, setOptions] = useState<FormCheckboxOption[]>(
    propOptions || []
  );
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkboxGroupRef = React.useRef<any>(null);

  // name이 없을 때만 사용하는 내부 상태
  const [checkedValues, setCheckedValues] = useState<Array<string | number>>(
    name ? [] : controlledValue || defaultValue || []
  );
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  // comCodeParams가 제공된 경우 API를 호출하여 옵션을 가져옵니다
  useEffect(() => {
    if (comCodeParams) {
      const fetchOptions = async () => {
        setLoading(true);
        try {
          const response = await getCodeDetailApi(comCodeParams);
          if (response.success && response.data) {
            // 응답이 배열인 경우
            if (Array.isArray(response.data)) {
              const transformedOptions: FormCheckboxOption[] = response.data
                .filter((item) => item[valueKey] && item[labelKey]) // 필수 필드가 있는 경우만 포함
                .map((item) => ({
                  value: item[valueKey] as string | number,
                  label: (item[labelKey] as string) || "",
                }));
              setOptions(transformedOptions);
            } else {
              // 단일 객체인 경우
              const item = response.data as CodeDetail;
              if (item[valueKey] && item[labelKey]) {
                setOptions([
                  {
                    value: item[valueKey] as string | number,
                    label: (item[labelKey] as string) || "",
                  },
                ]);
              }
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to fetch code options:", error);
          }
          setOptions([]);
        } finally {
          setLoading(false);
        }
      };

      fetchOptions();
    } else if (propOptions) {
      // comCodeParams가 없고 propOptions가 제공된 경우
      setOptions(propOptions);
    }
  }, [comCodeParams, propOptions, valueKey, labelKey]);

  // filterValues에 따라 옵션 필터링
  const filteredOptions = React.useMemo(() => {
    if (!filterValues || filterValues.length === 0) {
      return options;
    }
    return options.filter((option) => !filterValues.includes(option.value));
  }, [options, filterValues]);

  // useModalMessage가 true일 때만 required 규칙을 모달로 변환
  const processedRules = React.useMemo(() => {
    if (!rules || !useModalMessage || !name) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        return {
          ...rule,
          validator: (_: unknown, value: (string | number)[] | undefined) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              const errorMessage =
                ruleWithRequired.message ||
                `${label || "항목"}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 CheckboxGroup의 첫 번째 Checkbox로 포커스 이동
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        if (checkboxGroupRef.current) {
                          const firstCheckbox =
                            checkboxGroupRef.current.querySelector(
                              'input[type="checkbox"]:not([disabled])'
                            ) as HTMLInputElement;

                          if (firstCheckbox) {
                            // 스크롤하여 요소가 보이도록 함
                            firstCheckbox.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });

                            // 포커스 이동
                            requestAnimationFrame(() => {
                              firstCheckbox.focus();
                            });
                          }
                        }
                      }, 100);
                    });
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            return Promise.resolve();
          },
        } as Rule;
      }
      return rule;
    });
  }, [rules, label, useModalMessage, name]);

  // 전체 선택 상태 업데이트 (name이 없을 때만 사용)
  const updateSelectAllState = useCallback(
    (values: Array<string | number>) => {
      if (name) return; // name이 있으면 Form.Item이 관리하므로 불필요

      const allValues = filteredOptions.map((opt) => opt.value);
      const allChecked =
        allValues.length > 0 && allValues.every((val) => values.includes(val));
      const someChecked = values.length > 0 && !allChecked;

      setCheckAll(allChecked);
      setIndeterminate(someChecked);
    },
    [filteredOptions, name]
  );

  // controlled value가 변경되면 내부 상태 업데이트 (name이 없을 때만)
  useEffect(() => {
    if (name) return; // name이 있으면 Form.Item이 관리하므로 불필요

    if (controlledValue !== undefined) {
      setCheckedValues(controlledValue);
      updateSelectAllState(controlledValue);
    }
  }, [controlledValue, updateSelectAllState, name]);

  // View 모드일 때 (name이 있는 경우만, 모든 hooks 호출 후)
  if (mode === "view" && name) {
    return (
      <Form.Item
        name={name}
        label={label}
        layout={layout as FormItemLayout}
        colon={false}
        noStyle
      >
        <Form.Item shouldUpdate={(prev, curr) => prev[name] !== curr[name]}>
          {({ getFieldValue }) => {
            const value = getFieldValue(name) || [];
            const selectedOptions = filteredOptions.filter((opt) =>
              value.includes(opt.value)
            );
            const displayValue =
              selectedOptions.length > 0
                ? selectedOptions.map((opt) => opt.label).join(", ")
                : emptyText;
            return (
              <Form.Item
                name={name}
                label={label}
                layout={layout as FormItemLayout}
                colon={false}
              >
                <Text>{displayValue}</Text>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  // 체크박스 변경 핸들러 (name이 없을 때만 사용)
  const handleChange = (values: Array<string | number>) => {
    // 최대 선택 개수 제한
    if (maxSelect && values.length > maxSelect) {
      return;
    }

    const newValues = values;
    if (!name) {
      // name이 없을 때만 내부 상태 업데이트
      setCheckedValues(newValues);
      updateSelectAllState(newValues);
    }
    onChange?.(newValues);
  };

  // 전체 선택/해제 핸들러 (name이 없을 때만 사용)
  const handleSelectAll = (e: { target: { checked: boolean } }) => {
    const allValues = filteredOptions.map((opt) => opt.value);
    const newValues = e.target.checked ? allValues : [];
    if (!name) {
      // name이 없을 때만 내부 상태 업데이트
      setCheckedValues(newValues);
      setCheckAll(e.target.checked);
      setIndeterminate(false);
    }
    onChange?.(newValues);
  };

  // 그리드 레이아웃으로 렌더링
  const renderCheckboxes = () => {
    const checkboxElements = filteredOptions.map((option) => (
      <Checkbox
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </Checkbox>
    ));

    if (columns && columns > 0) {
      const itemsPerColumn = Math.ceil(filteredOptions.length / columns);
      const columnsArray = Array.from({ length: columns }, (_, colIndex) => {
        const startIndex = colIndex * itemsPerColumn;
        const endIndex = Math.min(
          startIndex + itemsPerColumn,
          filteredOptions.length
        );
        return filteredOptions.slice(startIndex, endIndex);
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

  // name이 없을 때 사용하는 그룹 요소
  const groupElement = !name ? (
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
        disabled={loading || rest.disabled}
        style={columns ? { width: "100%" } : undefined}
      >
        {renderCheckboxes()}
      </Checkbox.Group>
    </div>
  ) : null;

  // name이 있으면 Form.Item으로 감싸서 반환
  if (name) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={processedRules}
        layout={layout as FormItemLayout}
        colon={false}
        {...(useModalMessage
          ? { validateStatus: "", help: null }
          : { help: null })}
      >
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues[name] !== currentValues[name]
          }
        >
          {({ getFieldValue, setFieldValue }) => {
            const fieldValue = getFieldValue(name) || [];

            const allValues = filteredOptions.map((opt) => opt.value);
            const allChecked =
              allValues.length > 0 &&
              allValues.every((val) => fieldValue.includes(val));
            const someChecked = fieldValue.length > 0 && !allChecked;

            const handleFormChange = (values: Array<string | number>) => {
              // 최대 선택 개수 제한
              if (maxSelect && values.length > maxSelect) {
                return;
              }

              const newValues = values;
              // Form에 직접 값 설정
              setFieldValue(name, newValues);
              onChange?.(newValues);
            };

            const handleFormSelectAll = (e: {
              target: { checked: boolean };
            }) => {
              const newValues = e.target.checked ? allValues : [];
              // Form에 직접 값 설정
              setFieldValue(name, newValues);
              onChange?.(newValues);
            };

            return (
              <div ref={checkboxGroupRef}>
                {enableSelectAll && (
                  <Checkbox
                    indeterminate={someChecked}
                    onChange={handleFormSelectAll}
                    checked={allChecked}
                    style={{ marginBottom: 8 }}
                  >
                    {selectAllLabel}
                  </Checkbox>
                )}
                <Checkbox.Group
                  {...rest}
                  value={fieldValue}
                  onChange={handleFormChange}
                  disabled={loading || rest.disabled}
                  style={columns ? { width: "100%" } : undefined}
                >
                  {renderCheckboxes()}
                </Checkbox.Group>
              </div>
            );
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  return groupElement;
};

// Group 컴포넌트를 FormCheckbox에 연결
const FormCheckbox = FormCheckboxBase as typeof FormCheckboxBase & {
  Group: React.FC<FormCheckboxGroupProps>;
};

FormCheckbox.Group = FormCheckboxGroup;

export default FormCheckbox;
