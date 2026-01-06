import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { Select } from "antd";
import type { ICellEditorParams } from "ag-grid-community";
import {
  getCodeDetailApi,
  clearCodeCache,
  type CodeDetailParams,
  type CodeDetail,
} from "@apis/com/code";
import { ComboBoxContainer, StyledSelect } from "./ComboBoxCellEditor.styles";

const { Option } = Select;

interface SelectOption {
  value?: string | number;
  label: string;
  code?: string | number;
}

interface ComboBoxCellEditorParams<TData = unknown>
  extends ICellEditorParams<TData> {
  /** 외부에서 제공하는 옵션 배열 */
  options?: SelectOption[];
  /** 공통코드 조회 파라미터 (options가 없을 때 사용) */
  comCodeParams?: CodeDetailParams;
  /** 값 필드 키 (기본값: "code") */
  valueKey?: keyof CodeDetail;
  /** 라벨 필드 키 (기본값: "name1") */
  labelKey?: keyof CodeDetail;
  /** 라벨에 코드 표시 여부 (기본값: false) */
  showCodeInLabel?: boolean;
  /** 캐시 무효화 여부 (기본값: false) */
  clearCacheBeforeFetch?: boolean;
  /** 맨 상단에 추가할 옵션 라벨 (예: "전체", "선택") */
  allOptionLabel?: string;
  /** 검색 기능 활성화 여부 (기본값: true) */
  showSearch?: boolean;
}

// 타입 가드 헬퍼 함수
const normalizeValue = (value: unknown): string | number | undefined => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return "";
};

/**
 * AG-Grid 콤보 박스 셀 에디터
 * 외부 옵션 또는 공통코드 API를 사용하여 드롭다운 선택 제공
 *
 * @example
 * ```typescript
 * {
 *   field: 'status',
 *   cellEditor: ComboBoxCellEditor,
 *   cellEditorParams: {
 *     options: [
 *       { value: 'Y', label: '활성' },
 *       { value: 'N', label: '비활성' }
 *     ]
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * {
 *   field: 'codeType',
 *   cellEditor: ComboBoxCellEditor,
 *   cellEditorParams: {
 *     comCodeParams: {
 *       module: 'GL',
 *       type: 'CUSTYP'
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 공통코드 API와 전체 옵션 함께 사용
 * {
 *   field: 'codeType',
 *   cellEditor: ComboBoxCellEditor,
 *   cellEditorParams: {
 *     comCodeParams: {
 *       module: 'GL',
 *       type: 'CUSTYP'
 *     },
 *     allOptionLabel: '전체'
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // 검색 기능 비활성화
 * {
 *   field: 'status',
 *   cellEditor: ComboBoxCellEditor,
 *   cellEditorParams: {
 *     options: [
 *       { value: 'Y', label: '활성' },
 *       { value: 'N', label: '비활성' }
 *     ],
 *     showSearch: false
 *   }
 * }
 * ```
 */
export const ComboBoxCellEditor = forwardRef<
  { getValue: () => string | number | undefined },
  ComboBoxCellEditorParams
>((params, ref) => {
  const {
    value: initialValue,
    options: propOptions,
    comCodeParams,
    valueKey = "code",
    labelKey = "name1",
    showCodeInLabel = false,
    clearCacheBeforeFetch = false,
    allOptionLabel,
    showSearch = true,
  } = params;

  const [options, setOptions] = useState<SelectOption[]>(propOptions || []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // allOptionLabel이 있고 초기값이 undefined/null이면 빈 문자열로 설정
  const initialValueMemo = useMemo(() => {
    if (
      allOptionLabel &&
      (initialValue === undefined || initialValue === null)
    ) {
      return "";
    }
    return initialValue;
  }, [allOptionLabel, initialValue]);

  const [currentValue, setCurrentValue] = useState<string | number | undefined>(
    initialValueMemo
  );
  const selectRef = useRef<React.ComponentRef<typeof Select>>(null);
  const cancelledRef = useRef(false);
  const valueRef = useRef<string | number | undefined>(initialValueMemo);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isEditingStoppedRef = useRef(false); // 편집 종료 여부 추적 (중복 호출 방지)

  // timeout 정리 헬퍼 함수
  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 편집 종료 헬퍼 함수
  const stopEditing = useCallback(
    (delay: number = 0) => {
      // 이미 편집이 종료된 경우 중복 호출 방지
      if (isEditingStoppedRef.current) {
        return;
      }

      isEditingStoppedRef.current = true;
      setOpen(false);
      
      clearTimeoutRef();
      timeoutRef.current = setTimeout(() => {
        if (params.api) {
          params.api.stopEditing(false);
        }
        timeoutRef.current = null;
      }, delay);
    },
    [clearTimeoutRef, params.api]
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
        code: item.code || (item[valueKey] as string | number),
      };
    },
    [valueKey, labelKey, showCodeInLabel]
  );

  // 코드 옵션 로드
  const fetchCodeOptions = useCallback(
    async (codeParams: CodeDetailParams) => {
      setLoading(true);
      cancelledRef.current = false;

      try {
        if (clearCacheBeforeFetch) {
          clearCodeCache(codeParams);
        }

        const response = await getCodeDetailApi(codeParams);
        if (cancelledRef.current) return;

        if (!response.success || !response.data) {
          if (!cancelledRef.current) {
            setOptions([]);
          }
          return;
        }

        const data = response.data;
        const transformedOptions: SelectOption[] = Array.isArray(data)
          ? data
              .filter((item) => item[valueKey] && item[labelKey])
              .map(transformCodeDetailToOption)
          : (() => {
              const item = data as CodeDetail;
              return item[valueKey] && item[labelKey]
                ? [transformCodeDetailToOption(item)]
                : [];
            })();

        if (!cancelledRef.current) {
          setOptions(transformedOptions);
        }
      } catch (error) {
        if (cancelledRef.current) return;
        if (import.meta.env.DEV) {
          console.error("Failed to fetch code options:", error);
        }
        if (!cancelledRef.current) {
          setOptions([]);
        }
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    },
    [transformCodeDetailToOption, valueKey, labelKey, clearCacheBeforeFetch]
  );

  // 컴포넌트 마운트 시 편집 종료 플래그 초기화
  useEffect(() => {
    isEditingStoppedRef.current = false;
  }, []);

  // propOptions로 로컬 options 설정
  useEffect(() => {
    if (!comCodeParams && propOptions) {
      setOptions(propOptions);
    }
  }, [propOptions, comCodeParams]);

  // initialValue가 변경되면 currentValue 업데이트
  useEffect(() => {
    const newValue = initialValueMemo;
    // currentValue를 직접 체크하지 않고 ref를 통해 비교하여 무한 루프 방지
    if (newValue !== valueRef.current) {
      setCurrentValue(newValue);
      valueRef.current = newValue;
    }
  }, [initialValueMemo]);

  // comCodeParams가 있으면 API 호출
  useEffect(() => {
    if (!comCodeParams) return;

    fetchCodeOptions(comCodeParams);

    return () => {
      cancelledRef.current = true;
    };
  }, [comCodeParams, fetchCodeOptions]);

  // 옵션 로드 후 현재 값 유효성 검사
  // allOptionLabel이 있을 때 현재 값이 옵션 목록에 없으면 빈 문자열("")로 초기화
  useEffect(() => {
    if (!allOptionLabel || !options.length) return;

    const hasValue =
      currentValue !== undefined &&
      currentValue !== null &&
      currentValue !== "";

    if (hasValue) {
      const existsInOptions = options.some((opt) => opt.value === currentValue);
      if (!existsInOptions) {
        valueRef.current = "";
        setCurrentValue("");
      }
    }
  }, [options, currentValue, allOptionLabel]);

  // AgGrid ICellEditor 인터페이스 구현
  useImperativeHandle(ref, () => ({
    getValue: () => valueRef.current,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
  }));

  // 편집 시작 시 포커스 및 드롭다운 열기
  useEffect(() => {
    // 편집이 이미 종료된 경우 드롭다운을 열지 않음
    if (isEditingStoppedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      // 편집이 종료되지 않은 경우에만 드롭다운 열기
      // open 상태는 체크하지 않음 (handleChange에서 이미 닫았을 수 있으므로)
      if (!isEditingStoppedRef.current) {
        selectRef.current?.focus();
        setOpen(true);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      clearTimeoutRef();
    };
  }, [clearTimeoutRef]);

  // 렌더링할 옵션 목록 생성 (allOptionLabel이 있으면 맨 앞에 추가)
  const renderedOptions = useMemo(() => {
    if (allOptionLabel) {
      return [
        {
          value: "",
          label: allOptionLabel,
        },
        ...options,
      ];
    }
    return options;
  }, [options, allOptionLabel]);

  // 현재 값에 해당하는 옵션이 있는지 확인하고, 없으면 현재 값을 옵션으로 추가
  const optionsWithCurrentValue = useMemo(() => {
    if (!currentValue || currentValue === "") {
      return renderedOptions;
    }

    const exists = renderedOptions.some(
      (opt) => String(opt.value) === String(currentValue)
    );

    if (!exists) {
      return [
        ...renderedOptions,
        {
          value: currentValue,
          label: String(currentValue),
        },
      ];
    }

    return renderedOptions;
  }, [renderedOptions, currentValue]);

  const handleChange = useCallback(
    (value: unknown) => {
      const typedValue = normalizeValue(value);

      // 값 설정
      valueRef.current = typedValue;
      setCurrentValue(typedValue);

      if (params.api && params.node && params.column) {
        const field = params.column.getColId();
        
        // 편집 종료 플래그 먼저 설정 (setDataValue 호출 전에 설정하여 리렌더링 시 드롭다운이 다시 열리지 않도록)
        isEditingStoppedRef.current = true;
        
        // 드롭다운 닫기
        setOpen(false);
        
        // 그리드 데이터 업데이트
        params.node.setDataValue(field, typedValue);

        // 편집 종료 (AG-Grid가 자동으로 셀을 리렌더링하므로 refreshCells 불필요)
        stopEditing(0);
      }
    },
    [params.api, params.node, params.column, stopEditing]
  );

  const handleFilterOption = useCallback(
    (input: string, option?: { label?: React.ReactNode } | undefined) => {
      const label = option?.label;
      if (typeof label === "string") {
        return label.toLowerCase().includes(input.toLowerCase());
      }
      if (label !== null && label !== undefined) {
        return String(label).toLowerCase().includes(input.toLowerCase());
      }
      return false;
    },
    []
  );

  // Select에 표시할 value (빈 문자열일 때는 undefined로 변환하여 placeholder 표시)
  const displayValue = useMemo(() => {
    if (currentValue === "" && allOptionLabel) {
      return undefined; // placeholder 표시를 위해 undefined로 변환
    }
    return currentValue;
  }, [currentValue, allOptionLabel]);

  return (
    <ComboBoxContainer>
      <StyledSelect
        ref={selectRef}
        value={displayValue}
        loading={loading}
        onChange={handleChange}
        open={open}
        placeholder={allOptionLabel || "선택하세요"}
        onDropdownVisibleChange={(visible) => {
          // 편집이 이미 종료된 경우 드롭다운 상태 변경 무시
          if (isEditingStoppedRef.current) {
            // 편집 종료 상태에서는 드롭다운을 강제로 닫음
            if (visible) {
              setOpen(false);
            }
            return;
          }

          // 드롭다운 상태 업데이트
          if (open !== visible) {
            setOpen(visible);
          }

          // 드롭다운이 닫힐 때 (ESC 키 등으로 닫힌 경우) 편집 종료
          if (!visible && params.api && !isEditingStoppedRef.current) {
            stopEditing(100);
          }
        }}
        showSearch={showSearch}
        getPopupContainer={() => document.body}
        autoFocus
        filterOption={
          handleFilterOption as (input: string, option?: unknown) => boolean
        }
      >
        {optionsWithCurrentValue.map((option, index) => {
          const optionKey =
            option.value !== undefined
              ? `${String(option.value)}_${index}`
              : `option_${index}`;
          return (
            <Option key={optionKey} value={option.value} label={option.label}>
              {option.label}
            </Option>
          );
        })}
      </StyledSelect>
    </ComboBoxContainer>
  );
});

ComboBoxCellEditor.displayName = "ComboBoxCellEditor";

export default ComboBoxCellEditor;
