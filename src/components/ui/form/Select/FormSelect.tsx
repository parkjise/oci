import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { Form, Select, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { FormItemLayout } from "antd/es/form/Form";
import type { SelectProps } from "antd/es/select";
import {
  getCodeDetailApi,
  clearCodeCache,
  type CodeDetailParams,
  type CodeDetail,
} from "@apis/com/code";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import { SelectStyles } from "@/components/ui/form/Select/FormSelet.Styles";
const { Option } = Select;
const { Text } = Typography;

// 모듈 레벨 캐시 (컴포넌트가 언마운트되어도 데이터 유지)
const optionsCache = new Map<string, SelectOption[]>();

const getCacheKey = (params: CodeDetailParams) => JSON.stringify(params);

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
  clearCacheBeforeFetch?: boolean; // API 호출 전 캐시 무효화 여부 (기본값: false)
}

const FormSelectComponent: React.FC<FormSelectProps> = ({
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
  clearCacheBeforeFetch = false,
  ...rest
}) => {
  // 메인(우측) select의 현재 옵션
  // 캐시가 있으면 캐시된 값으로 초기화
  const [options, setOptions] = useState<SelectOption[]>(() => {
    if (propOptions) return propOptions;
    if (comCodeParams) {
      const key = getCacheKey(comCodeParams);
      const cached = optionsCache.get(key);
      if (cached) return cached;
    }
    return [];
  });
  // 메인 select 로딩 상태 (캐시가 있으면 로딩 안 함)
  const [loading, setLoading] = useState(() => {
    if (comCodeParams) {
      const key = getCacheKey(comCodeParams);
      return !optionsCache.has(key);
    }
    return false;
  });

  // 필터(왼쪽) select의 현재 옵션
  const [filterOptions, setFilterOptions] = useState<SelectOption[]>(() => {
    if (filterComCodeParams) {
      const key = getCacheKey(filterComCodeParams);
      return optionsCache.get(key) || [];
    }
    return [];
  });
  // 필터 select 로딩 상태
  const [filterLoading, setFilterLoading] = useState(() => {
    if (filterComCodeParams) {
      const key = getCacheKey(filterComCodeParams);
      return !optionsCache.has(key);
    }
    return false;
  });
  const selectRef = React.useRef<React.ComponentRef<typeof Select>>(null);
  const prevFilterValueRef = React.useRef<string | number | undefined>(
    undefined
  );
  const [allOptions, setAllOptions] = useState<SelectOption[]>(() => {
    if (propOptions) return propOptions;
    // filterComCodeParams가 있고 filteredComCodeParams(서버필터링)가 없는 경우
    // 즉, 클라이언트 필터링 모드일 때 filterComCodeParams로 데이터를 미리 가져왔을 수 있음
    if (filterComCodeParams) {
      const key = getCacheKey(filterComCodeParams);
      return optionsCache.get(key) || [];
    }
    return [];
  });
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
  const filterWatchField = filterComCodeParams ? name : "";
  const watchedFilterValue = Form.useWatch(filterWatchField, form);
  const filterSelectValue =
    watchedFilterValue !== undefined
      ? watchedFilterValue
      : filterWatchField
        ? form.getFieldValue(filterWatchField)
        : undefined;

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

      // 캐시 확인
      if (!clearCacheBeforeFetch) {
        const cached = optionsCache.get(getCacheKey(params));
        if (cached) {
          setOptionsState(cached);
          setLoadingState(false);
          return;
        }
      }

      try {
        // 캐시 무효화 옵션이 활성화된 경우 캐시를 먼저 무효화
        if (clearCacheBeforeFetch) {
          clearCodeCache(params);
        }

        const response = await getCodeDetailApi(params);
        if (cancelledRef.current) return;

        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            const transformedOptions: SelectOption[] = response.data
              .filter((item) => item[valueKey] && item[labelKey])
              .map(transformCodeDetailToOption);

            // 캐시에 저장
            optionsCache.set(getCacheKey(params), transformedOptions);

            if (!cancelledRef.current) {
              setOptionsState(transformedOptions);
            }
          } else {
            const item = response.data as CodeDetail;
            if (item[valueKey] && item[labelKey]) {
              const transformedOption = transformCodeDetailToOption(item);
              // 단일 항목도 배열로 캐시 저장
              optionsCache.set(getCacheKey(params), [transformedOption]);

              if (!cancelledRef.current) {
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
    [transformCodeDetailToOption, valueKey, labelKey, clearCacheBeforeFetch]
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

  // 필터 옵션 로드
  useEffect(() => {
    if (!filterComCodeParams) {
      setFilterOptions((prev) => {
        if (prev.length === 0) return prev;
        return [];
      });
      return;
    }

    const cancelledRef = { current: false };

    if (comCodeParams) {
      fetchCodeOptions(
        comCodeParams,
        setFilterLoading,
        (options) => {
          setFilterOptions((prev) => {
            // 이전 값과 같으면 업데이트하지 않음
            if (prev.length === options.length) {
              const isEqual = prev.every((p, idx) => {
                const o = options[idx];
                return p.value === o.value && p.label === o.label;
              });
              if (isEqual) return prev;
            }
            return options;
          });
        },
        cancelledRef
      );
    } else {
      setFilterOptions((prev) => {
        if (prev.length === 0) return prev;
        return [];
      });
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
      setAllOptions((prev) => {
        // 이전 값과 같으면 업데이트하지 않음
        if (prev.length === propOptions.length) {
          const isEqual = prev.every((p, idx) => {
            const o = propOptions[idx];
            return p.value === o.value && p.label === o.label;
          });
          if (isEqual) return prev;
        }
        return propOptions;
      });
      return () => {
        cancelledRef.current = true;
      };
    }

    if (filterComCodeParams) {
      fetchCodeOptions(
        filterComCodeParams,
        setLoading,
        (opts) => {
          if (cancelledRef.current) return;
          setAllOptions((prev) => {
            // 이전 값과 같으면 업데이트하지 않음
            if (prev.length === opts.length) {
              const isEqual = prev.every((p, idx) => {
                const o = opts[idx];
                return p.value === o.value && p.label === o.label;
              });
              if (isEqual) return prev;
            }
            return opts;
          });
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
  const prevFilterSelectValueRef = useRef<string | number | undefined>(
    filterSelectValue
  );
  const prevAllOptionsRef = useRef<SelectOption[]>(allOptions);
  useEffect(() => {
    if (!filterComCodeParams) return;

    // 필터 값과 allOptions가 모두 변경되지 않았으면 스킵
    const filterValueChanged =
      prevFilterSelectValueRef.current !== filterSelectValue;
    const allOptionsChanged = prevAllOptionsRef.current !== allOptions;

    if (!filterValueChanged && !allOptionsChanged) return;

    prevFilterSelectValueRef.current = filterSelectValue;
    prevAllOptionsRef.current = allOptions;

    // undefined나 null인 경우만 초기화
    if (filterSelectValue === undefined || filterSelectValue === null) {
      setOptions((prev) => {
        if (prev.length === 0) return prev;
        return [];
      });
      setLoading(false);
      return;
    }

    // 빈 문자열("")인 경우: "-선택-"만 표시 (필터링된 옵션이 없으므로)
    if (filterSelectValue === "") {
      setOptions((prev) => {
        if (prev.length === 0) return prev;
        return [];
      });
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

    setOptions((prev) => {
      // 길이와 내용이 같으면 업데이트하지 않음
      if (prev.length === filtered.length) {
        const isEqual = prev.every((p, idx) => {
          const f = filtered[idx];
          return p.value === f.value && p.label === f.label;
        });
        if (isEqual) return prev;
      }
      return filtered;
    });
  }, [filterSelectValue, allOptions, filterComCodeParams]);

  // 기존 동작 유지: filterComCodeParams가 없고 filteredComCodeParams가 있을 때 서버에서 로드
  useEffect(() => {
    if (filterComCodeParams) return;
    if (filteredComCodeParams) {
      const cancelledRef = { current: false };
      fetchCodeOptions(
        filteredComCodeParams,
        setLoading,
        (options) => {
          setOptions((prev) => {
            // 이전 값과 같으면 업데이트하지 않음
            if (prev.length === options.length) {
              const isEqual = prev.every((p, idx) => {
                const o = options[idx];
                return p.value === o.value && p.label === o.label;
              });
              if (isEqual) return prev;
            }
            return options;
          });
        },
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

  // 옵션 리스트 계산 (메인/필터 공통 로직)
  const computeDisplayOptions = useCallback(
    (
      currentOpts: SelectOption[],
      val: string | number | undefined,
      isLoading: boolean,
      isFilter: boolean
    ) => {
      let result = currentOpts;

      // 메인 옵션이고 filterValues가 있는 경우 필터링
      if (!isFilter && filterValues?.length) {
        result = result.filter(
          (option) =>
            option.value !== undefined && !filterValues.includes(option.value)
        );
      }

      // 현재 값이 옵션에 없으면 임시 옵션 추가
      const hasValueInOptions =
        val === undefined ||
        val === null ||
        val === "" ||
        result.some((opt) => opt.value === val);

      if (
        !hasValueInOptions &&
        val !== undefined &&
        val !== null &&
        val !== ""
      ) {
        const isDataEmpty =
          currentOpts.length === 0 &&
          (isFilter
            ? !!comCodeParams // 필터: comCodeParams로 로드
            : !!comCodeParams || !!filterComCodeParams || !!filteredComCodeParams); // 메인: 여러 소스로 로드

        // 로딩 중이거나 데이터를 받아와야 하는데 아직 옵션이 없는 경우(초기 상태)에는 빈 문자열을 보여줌
        const tempLabel =
          isLoading || isDataEmpty ? " " : emptyText;

        result = [
          {
            value: val,
            label: tempLabel,
          },
          ...result,
        ];
      }

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
    },
    [
      filterValues,
      allOptionLabel,
      emptyText,
      comCodeParams,
      filterComCodeParams,
      filteredComCodeParams,
    ]
  );

  // 현재 선택된 값 가져오기
  const watchedValue = Form.useWatch(name, form);
  const currentValue =
    watchedValue !== undefined ? watchedValue : form.getFieldValue(name);

  // 메인 옵션 계산
  const filteredOptions = useMemo(
    () => computeDisplayOptions(options, currentValue, loading, false),
    [computeDisplayOptions, options, currentValue, loading]
  );

  // 필터(왼쪽) select의 현재 값 가져오기
  const watchedFilterCurrentValue = Form.useWatch(name, form);
  const filterCurrentValue =
    watchedFilterCurrentValue !== undefined
      ? watchedFilterCurrentValue
      : form.getFieldValue(name);

  // 필터 옵션 계산
  const filterRenderedOptions = useMemo(
    () =>
      computeDisplayOptions(filterOptions, filterCurrentValue, filterLoading, true),
    [
      computeDisplayOptions,
      filterOptions,
      filterCurrentValue,
      filterLoading,
    ]
  );

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
            // 옵션이 로드 중이거나 선택된 옵션을 찾을 수 없으면 emptyText 표시
            const displayValue =
              loading ||
                (!selectedOption &&
                  value !== undefined &&
                  value !== null &&
                  value !== "")
                ? emptyText
                : selectedOption
                  ? selectedOption.label
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

// props 비교 함수: 얕은 비교로 불필요한 리렌더링 방지
const arePropsEqual = (
  prevProps: FormSelectProps,
  nextProps: FormSelectProps
) => {
  // 기본 props 비교
  if (
    prevProps.name !== nextProps.name ||
    prevProps.label !== nextProps.label ||
    prevProps.placeholder !== nextProps.placeholder ||
    prevProps.layout !== nextProps.layout ||
    prevProps.valueKey !== nextProps.valueKey ||
    prevProps.labelKey !== nextProps.labelKey ||
    prevProps.showCodeInLabel !== nextProps.showCodeInLabel ||
    prevProps.useModalMessage !== nextProps.useModalMessage ||
    prevProps.mode !== nextProps.mode ||
    prevProps.emptyText !== nextProps.emptyText ||
    prevProps.allOptionLabel !== nextProps.allOptionLabel ||
    prevProps.filterFieldName !== nextProps.filterFieldName ||
    prevProps.clearCacheBeforeFetch !== nextProps.clearCacheBeforeFetch
  ) {
    return false;
  }

  // 배열/객체 props 비교
  if (prevProps.options !== nextProps.options) {
    if (!prevProps.options || !nextProps.options) return false;
    if (prevProps.options.length !== nextProps.options.length) return false;
    const isEqual = prevProps.options.every((p, idx) => {
      const n = nextProps.options![idx];
      return p.value === n.value && p.label === n.label;
    });
    if (!isEqual) return false;
  }

  if (prevProps.filterValues !== nextProps.filterValues) {
    if (!prevProps.filterValues || !nextProps.filterValues) return false;
    if (prevProps.filterValues.length !== nextProps.filterValues.length)
      return false;
    const isEqual = prevProps.filterValues.every(
      (v, idx) => v === nextProps.filterValues![idx]
    );
    if (!isEqual) return false;
  }

  if (prevProps.rules !== nextProps.rules) {
    if (!prevProps.rules || !nextProps.rules) return false;
    if (prevProps.rules.length !== nextProps.rules.length) return false;
  }

  // comCodeParams 비교
  if (prevProps.comCodeParams !== nextProps.comCodeParams) {
    if (!prevProps.comCodeParams || !nextProps.comCodeParams) return false;
    if (
      JSON.stringify(prevProps.comCodeParams) !==
      JSON.stringify(nextProps.comCodeParams)
    ) {
      return false;
    }
  }

  // filterComCodeParams 비교
  if (prevProps.filterComCodeParams !== nextProps.filterComCodeParams) {
    if (!prevProps.filterComCodeParams || !nextProps.filterComCodeParams)
      return false;
    if (
      JSON.stringify(prevProps.filterComCodeParams) !==
      JSON.stringify(nextProps.filterComCodeParams)
    ) {
      return false;
    }
  }

  // rest props 비교 (SelectProps)
  const prevRestKeys = Object.keys(prevProps).filter(
    (key) =>
      ![
        "name",
        "label",
        "rules",
        "placeholder",
        "options",
        "comCodeParams",
        "layout",
        "valueKey",
        "labelKey",
        "showCodeInLabel",
        "useModalMessage",
        "mode",
        "emptyText",
        "filterValues",
        "allOptionLabel",
        "filterComCodeParams",
        "filterFieldName",
        "clearCacheBeforeFetch",
      ].includes(key)
  );
  const nextRestKeys = Object.keys(nextProps).filter(
    (key) =>
      ![
        "name",
        "label",
        "rules",
        "placeholder",
        "options",
        "comCodeParams",
        "layout",
        "valueKey",
        "labelKey",
        "showCodeInLabel",
        "useModalMessage",
        "mode",
        "emptyText",
        "filterValues",
        "allOptionLabel",
        "filterComCodeParams",
        "filterFieldName",
        "clearCacheBeforeFetch",
      ].includes(key)
  );

  if (prevRestKeys.length !== nextRestKeys.length) return false;

  for (const key of prevRestKeys) {
    const prevValue = (prevProps as unknown as Record<string, unknown>)[key];
    const nextValue = (nextProps as unknown as Record<string, unknown>)[key];
    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
};

const FormSelect = memo(FormSelectComponent, arePropsEqual);

export default FormSelect;
