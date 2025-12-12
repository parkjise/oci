import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Form, Select, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import type { SelectProps } from "antd/es/select";
import {
  getCodeDetailApi,
  type CodeDetailParams,
  type CodeDetail,
} from "@apis/comCode";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import { SelectStyles } from "@/components/ui/form/Select/FormSelet.Styles";
const { Option } = Select;
const { Text } = Typography;

interface SelectOption {
  value?: string | number;
  label: string;
  code?: string | number;
}

interface FormSelectProps
  extends Omit<SelectProps, "options" | "loading" | "mode"> {
  name: string;
  label: string;
  rules?: Rule[];
  placeholder?: string;
  options?: SelectOption[];
  comCodeParams?: CodeDetailParams;
  layout?: "vertical" | "horizontal" | "inline";
  valueKey?: keyof CodeDetail;
  labelKey?: keyof CodeDetail;
  showCodeInLabel?: boolean;
  useModalMessage?: boolean;
  mode?: "view" | "edit";
  emptyText?: string;
  filterValues?: (string | number)[];
  allOptionLabel?: string;
  filterComCodeParams?: CodeDetailParams;
  filterFieldName?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  rules,
  placeholder,
  options: propOptions,
  comCodeParams,
  layout,
  valueKey = "code",
  labelKey = "name1",
  showCodeInLabel = false,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  filterValues,
  allOptionLabel,
  filterComCodeParams,
  filterFieldName,
  ...rest
}) => {
  // 메인(우측) select의 현재 옵션
  const [options, setOptions] = useState<SelectOption[]>(propOptions || []);
  // 메인 select 로딩 상태
  const [loading, setLoading] = useState(false);
  // 필터(왼쪽) select의 현재 옵션
  const [filterOptions, setFilterOptions] = useState<SelectOption[]>([]);
  // 필터 select 로딩 상태
  const [filterLoading, setFilterLoading] = useState(false);
  const selectRef = React.useRef<React.ComponentRef<typeof Select>>(null);
  const prevFilterValueRef = React.useRef<string | number | undefined>(
    undefined
  );
  const [allOptions, setAllOptions] = useState<SelectOption[]>([]);
  const form = Form.useFormInstance();

  // propOptions로 로컬 options 설정
  useEffect(() => {
    if (!comCodeParams && propOptions) {
      setOptions(propOptions);
    }
  }, [propOptions, comCodeParams]);

  // 필터 필드명 결정
  const actualFilterFieldName = useMemo(() => {
    if (filterFieldName) {
      return filterFieldName === name ? `${name}_filter` : filterFieldName;
    }
    return `${name}_filter`;
  }, [filterFieldName, name]);

  // allOptionLabel 초기화
  const initialAllOptionSetRef = useRef(false);
  useEffect(() => {
    if (initialAllOptionSetRef.current) return;
    if (!allOptionLabel) return;

    try {
      const current = form.getFieldValue(name);
      if (current === undefined || current === null) {
        form.setFieldsValue({ [name]: "" });
      }

      if (filterComCodeParams) {
        const filterCurrent = form.getFieldValue(actualFilterFieldName);
        if (filterCurrent === undefined || filterCurrent === null) {
          form.setFieldsValue({ [actualFilterFieldName]: "" });
        }
      }
    } catch {
      // form 인스턴스가 아직 준비되지 않았을 수 있음 — 무시하고 다음 이펙트에 맡김
    }

    initialAllOptionSetRef.current = true;
  }, [allOptionLabel, form, name, filterComCodeParams, actualFilterFieldName]);

  // 필터 필드 값 감지
  // filterComCodeParams가 있을 때는 왼쪽 select (name)의 값을 감지해야 함
  const filterSelectValue = Form.useWatch(
    filterComCodeParams ? name : "",
    form
  );

  // CodeDetail을 SelectOption으로 변환
  const transformCodeDetailToOption = useCallback(
    (item: CodeDetail): SelectOption => {
      const codeValue = item.code || item[valueKey];
      const labelValue = (item[labelKey] as string) || "";
      const displayLabel =
        showCodeInLabel && codeValue
          ? `${labelValue} - ${codeValue}`
          : labelValue;
      return {
        value: item[valueKey] as string | number,
        label: displayLabel,
        code: item.code || (item[valueKey] as string | number), // 코드 필드 저장
      };
    },
    [valueKey, labelKey, showCodeInLabel]
  );

  // 코드 옵션 로드
  const fetchCodeOptions = useCallback(
    async (
      params: CodeDetailParams,
      setLoadingState: (loading: boolean) => void,
      setOptionsState: (options: SelectOption[]) => void,
      cancelledRef: { current: boolean }
    ) => {
      setLoadingState(true);
      try {
        const response = await getCodeDetailApi(params);
        if (cancelledRef.current) return;

        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            const transformedOptions: SelectOption[] = response.data
              .filter((item) => item[valueKey] && item[labelKey])
              .map(transformCodeDetailToOption);
            if (!cancelledRef.current) {
              // 개발 모드에서 특정 파라미터와 일치하면 디버그할 수 있는 분기
              if (import.meta.env.DEV) {
                const isFilterOptions =
                  filterComCodeParams &&
                  JSON.stringify(filterComCodeParams) ===
                    JSON.stringify(params);
                if (isFilterOptions) {
                  // (DEV) 필요한 경우 콘솔 출력 추가 가능
                }
              }
              setOptionsState(transformedOptions);
            }
          } else {
            const item = response.data as CodeDetail;
            if (item[valueKey] && item[labelKey]) {
              const transformedOption = transformCodeDetailToOption(item);
              if (!cancelledRef.current) {
                if (import.meta.env.DEV) {
                  const isFilterOptions =
                    filterComCodeParams &&
                    JSON.stringify(filterComCodeParams) ===
                      JSON.stringify(params);
                  if (isFilterOptions) {
                    // (DEV) single option loaded
                  }
                }
                setOptionsState([transformedOption]);
              }
            }
          }
        } else {
          if (!cancelledRef.current) {
            setOptionsState([]);
          }
        }
      } catch (error) {
        if (cancelledRef.current) return;
        if (import.meta.env.DEV) {
          console.error("Failed to fetch code options:", error);
        }
        if (!cancelledRef.current) {
          setOptionsState([]);
        }
      } finally {
        if (!cancelledRef.current) {
          setLoadingState(false);
        }
      }
    },
    [transformCodeDetailToOption, valueKey, labelKey, filterComCodeParams]
  );

  // 필터 값으로 메인 옵션 필터링
  const filteredComCodeParams = useMemo(() => {
    if (!comCodeParams || !filterComCodeParams) return comCodeParams;

    // 필터 값 유효성 검사: undefined, null, 빈 문자열 체크
    const hasValidFilterValue =
      filterSelectValue !== undefined &&
      filterSelectValue !== null &&
      filterSelectValue !== "";

    if (!hasValidFilterValue) {
      return null;
    }

    // 필터 select에서 선택한 값을 type 필드로 사용하여 필터링
    return {
      ...comCodeParams,
      type: String(filterSelectValue),
    };
  }, [comCodeParams, filterComCodeParams, filterSelectValue]);

  // 필터 필드 데이터 로그
  useEffect(() => {
    if (filterComCodeParams && import.meta.env.DEV) {
      // dev: filter field data available (logging removed)
    }
  }, [
    filterComCodeParams,
    actualFilterFieldName,
    filterSelectValue,
    filterOptions,
    filteredComCodeParams,
    options,
  ]);

  // 필터 옵션 로드
  useEffect(() => {
    if (!filterComCodeParams) {
      setFilterOptions([]);
      return;
    }

    const cancelledRef = { current: false };

    if (import.meta.env.DEV) {
      // dev: starting to load filter (left) options
    }

    if (comCodeParams) {
      fetchCodeOptions(
        comCodeParams,
        setFilterLoading,
        setFilterOptions,
        cancelledRef
      );
    } else {
      setFilterOptions([]);
      setFilterLoading(false);
    }

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterComCodeParams, fetchCodeOptions]);

  // 메인 옵션 로드 (클라이언트 필터링)
  useEffect(() => {
    if (!filterComCodeParams) return;

    const cancelledRef = { current: false };

    if (propOptions) {
      setAllOptions(propOptions);
      return () => {
        cancelledRef.current = true;
      };
    }

    if (filterComCodeParams) {
      if (import.meta.env.DEV) {
        // dev: starting to load all (main) options
      }
      fetchCodeOptions(
        filterComCodeParams,
        setLoading,
        (opts) => {
          if (cancelledRef.current) return;
          setAllOptions(opts);
          setLoading(false);
        },
        cancelledRef
      );
    }

    return () => {
      cancelledRef.current = true;
    };
  }, [filterComCodeParams, propOptions, fetchCodeOptions]);

  // 2) 필터 값 또는 allOptions 변경 시 클라이언트에서 필터링하여 `options`를 갱신
  useEffect(() => {
    if (!filterComCodeParams) return;

    // undefined나 null인 경우만 초기화
    if (filterSelectValue === undefined || filterSelectValue === null) {
      setOptions([]);
      setLoading(false);
      return;
    }

    // 빈 문자열("")인 경우: "-선택-"만 표시 (필터링된 옵션이 없으므로)
    if (filterSelectValue === "") {
      setOptions([]);
      setLoading(false);
      return;
    }

    // 값이 있을 때: 코드값으로 시작하는 옵션만 필터링
    const filterStr = String(filterSelectValue);
    const filtered = allOptions.filter((option) => {
      if (option.value === undefined) return false;
      const compareValue =
        option.code !== undefined ? String(option.code) : String(option.value);
      return compareValue.startsWith(filterStr);
    });
    setOptions(filtered);
  }, [filterSelectValue, allOptions, filterComCodeParams]);

  // 기존 동작 유지: filterComCodeParams가 없고 filteredComCodeParams가 있을 때 서버에서 로드
  useEffect(() => {
    if (filterComCodeParams) return;
    if (filteredComCodeParams) {
      const cancelledRef = { current: false };
      fetchCodeOptions(
        filteredComCodeParams,
        setLoading,
        setOptions,
        cancelledRef
      );

      return () => {
        cancelledRef.current = true;
      };
    }
  }, [filteredComCodeParams, filterComCodeParams, fetchCodeOptions]);

  // 필터 값 변경 시 오른쪽 select (actualFilterFieldName) 값 즉시 초기화
  // 왼쪽 select (name)의 값이 변경되면 오른쪽 select는 "-선택-"("")으로 초기화
  useEffect(() => {
    if (!filterComCodeParams) {
      prevFilterValueRef.current = undefined;
      return;
    }

    // 필터 값이 실제로 변경되었을 때만 초기화
    if (prevFilterValueRef.current !== filterSelectValue) {
      prevFilterValueRef.current = filterSelectValue;

      const currentValue = form.getFieldValue(actualFilterFieldName);
      const hasValue =
        currentValue !== undefined &&
        currentValue !== null &&
        currentValue !== "";

      if (hasValue) {
        // 왼쪽 값이 변경되면 오른쪽은 "-선택-"("")으로 초기화
        form.setFieldsValue({
          [actualFilterFieldName]: allOptionLabel ? "" : undefined,
        });
      }
    }
  }, [
    filterComCodeParams,
    filterSelectValue,
    actualFilterFieldName,
    form,
    allOptionLabel,
  ]);

  // 옵션 로드 후 현재 값 유효성 검사
  // 첫 번째 옵션부터 비교하여 같은 값이 있는지 확인
  useEffect(() => {
    if (!filterComCodeParams || !options.length) return;

    const currentValue = form.getFieldValue(name);
    const hasValue =
      currentValue !== undefined &&
      currentValue !== null &&
      currentValue !== "";

    if (hasValue) {
      // 첫 번째 옵션부터 비교
      const existsInOptions =
        options.findIndex((opt) => opt.value === currentValue) !== -1;
      if (!existsInOptions) {
        form.setFieldsValue({ [name]: allOptionLabel ? "" : undefined });
      }
    }
  }, [filterComCodeParams, options, name, form, allOptionLabel]);

  // 옵션 필터링
  const filteredOptions = useMemo(() => {
    let result = options;

    if (filterValues?.length) {
      result = result.filter(
        (option) =>
          option.value !== undefined && !filterValues.includes(option.value)
      );
    }

    // allOptionLabel이 있으면 최상단에 "-선택-"("") 옵션 추가
    if (allOptionLabel) {
      return [
        {
          value: "",
          label: allOptionLabel,
        },
        ...result,
      ];
    }

    return result;
  }, [options, filterValues, allOptionLabel]);

  // 필터(왼쪽) select에 대해 allOptionLabel이 주어지면 맨 앞에 추가
  const filterRenderedOptions = useMemo(() => {
    if (!filterComCodeParams) return filterOptions;
    if (allOptionLabel) {
      return [
        {
          value: "",
          label: allOptionLabel,
        },
        ...filterOptions,
      ];
    }
    return filterOptions;
  }, [filterComCodeParams, filterOptions, allOptionLabel]);

  // 기본 필터링 함수
  const defaultFilterOption = useMemo(() => {
    if (!rest.showSearch || rest.filterOption !== undefined) {
      return undefined;
    }
    return (input: string, option: { label?: React.ReactNode } | undefined) => {
      if (!option) return false;
      const optionLabel =
        typeof option.label === "string"
          ? option.label
          : String(option.label || "");
      return optionLabel.toLowerCase().includes(input.toLowerCase());
    };
  }, [rest.showSearch, rest.filterOption]);

  const selectProps = useMemo(() => {
    if (rest.filterOption !== undefined) {
      return rest;
    }
    return {
      ...rest,
      filterOption: defaultFilterOption,
    };
  }, [rest, defaultFilterOption]);

  // validator 함수 생성
  const createValidator = useCallback(
    (errorMessage: string) =>
      (
        _: unknown,
        value: string | number | (string | number)[] | undefined
      ): Promise<void> => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          if (canShowModal()) {
            MessageModal.error({
              title: "선택 오류",
              content: errorMessage,
              onOk: () => {
                resetModalFlag();
                setTimeout(() => {
                  selectRef.current?.focus();
                }, 500);
              },
            });
          }
          return Promise.reject(new Error(errorMessage));
        }
        return Promise.resolve();
      },
    []
  );

  // required 규칙을 모달 validator로 변환
  const processedRules = useMemo(() => {
    if (!rules || !useModalMessage) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        const errorMessage =
          ruleWithRequired.message || `${label}을(를) 선택해주세요.`;

        return {
          ...rule,
          validator: createValidator(errorMessage),
        } as Rule;
      }
      return rule;
    });
  }, [rules, label, useModalMessage, createValidator]);

  // Form.Item props 메모이제이션
  const formItemProps = useMemo(
    () => ({
      name,
      label: filterComCodeParams ? undefined : label, // filterComCodeParams가 있으면 라벨 숨김
      layout: layout as FormItemLayout,
      colon: false,
      rules: processedRules,
      ...(allOptionLabel ? { initialValue: undefined } : {}),
      ...(useModalMessage
        ? { validateStatus: undefined, help: "" }
        : { help: "" }),
      style: { marginBottom: 0 },
    }),
    [
      name,
      label,
      layout,
      processedRules,
      allOptionLabel,
      useModalMessage,
      filterComCodeParams,
    ]
  );

  // 옵션 렌더링 최적화
  const renderOptions = useCallback(
    (optionsList: SelectOption[], prefix: string) =>
      optionsList.map((option, index) => {
        const optionKey =
          option.value !== undefined
            ? `${prefix}_${String(option.value)}`
            : `${prefix}_${index}`;
        return (
          <Option key={optionKey} value={option.value} label={option.label}>
            {option.label}
          </Option>
        );
      }),
    []
  );

  // View 모드 렌더링
  if (mode === "view") {
    return (
      <Form.Item
        name={name}
        label={label}
        layout={layout as FormItemLayout}
        colon={false}
        style={{ marginBottom: 0 }}
      >
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const selectedOption = filteredOptions.find(
              (opt) => opt.value === value
            );
            const displayValue = selectedOption
              ? selectedOption.label
              : value !== undefined && value !== null
              ? String(value)
              : emptyText;
            return <Text>{displayValue}</Text>;
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  // 필터 select 렌더링
  if (filterComCodeParams) {
    return (
      <div className="form-select">
        {/* 필터 select (왼쪽) */}
        <Form.Item
          name={name}
          label={label}
          layout={layout as FormItemLayout}
          colon={false}
          style={{ width: "60%", display: "inline-block" }}
          rules={processedRules}
          {...(useModalMessage
            ? { validateStatus: undefined, help: "" }
            : { help: "" })}
        >
          <SelectStyles
            placeholder={placeholder}
            loading={filterLoading}
            {...selectProps}
          >
            {filterOptions.length === 0 && import.meta.env.DEV && (
              <Option disabled value="__empty__">
                옵션이 없습니다 (filterOptions: {filterOptions.length})
              </Option>
            )}
            {renderOptions(filterRenderedOptions, "filter")}
          </SelectStyles>
        </Form.Item>
        {/* 메인 select (오른쪽) */}
        <Form.Item
          name={actualFilterFieldName}
          style={{ width: "40%", display: "inline-block" }}
        >
          <SelectStyles
            ref={selectRef}
            placeholder={placeholder}
            loading={loading}
            {...selectProps}
          >
            {renderOptions(filteredOptions, "main")}
          </SelectStyles>
        </Form.Item>
      </div>
    );
  }

  // 일반 select 렌더링
  return (
    <Form.Item {...formItemProps}>
      <SelectStyles
        ref={selectRef}
        placeholder={placeholder}
        loading={loading}
        {...selectProps}
      >
        {renderOptions(filteredOptions, "main")}
      </SelectStyles>
    </Form.Item>
  );
};

export default FormSelect;
