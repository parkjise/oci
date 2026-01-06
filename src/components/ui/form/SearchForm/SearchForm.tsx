import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { Space, Tooltip, Form } from "antd";
import type { FormProps, FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import FormButton from "../Button/FormButton";
import LoadingSpinner from "@/components/ui/feedback/Loading/LoadingSpinner";
import { SearchFormStyles } from "./SearchForm.style";

export interface SearchFormProps {
  loading?: boolean;
  searchExpanded?: boolean;
  /**
   * 검색 실행 콜백
   * @modified 2025-12-16 이상찬 Form 값을 부모에게 전달하기 위해 values 인자 추가
   */
  onSearch?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  onToggleExpand?: () => void;
  showSearch?: boolean; // 조회 버튼 표시 여부 (기본값: true)
  showReset?: boolean; // 초기화 버튼 표시 여부 (기본값: true)
  showExpand?: boolean; // 확장 버튼 표시 여부 (기본값: true)
  children?: React.ReactNode; // 입력 필드들을 children으로 받음
  defaultExpanded?: boolean; // 기본 확장 상태 (기본값: false)
  visibleRows?: number; // 보여줄 줄 수 (기본값: 2)
  columnsPerRow?: number; // 한 줄에 표시할 컬럼 수 (기본값: 4)
  resetFields?: string[]; // 초기화할 특정 필드명 배열 (없으면 전체 초기화)
  resetExpandOnReset?: boolean; // 초기화 시 확장 상태도 초기화할지 여부 (기본값: false)
  formName?: string; // Form name 속성
  initialValues?: FormProps["initialValues"]; // Form 초기값
  form?: FormInstance; // 외부 Form 인스턴스 (제공되면 내부 Form 대신 사용)
  className?: string; // 외부에서 전달하는 className
}

const SearchFormComponent: React.FC<SearchFormProps> = ({
  loading = false,
  searchExpanded: controlledExpanded,
  onSearch,
  onReset,
  onToggleExpand: controlledToggleExpand,
  showSearch = true,
  showReset = true,
  showExpand = true,
  children,
  defaultExpanded = false,
  visibleRows = 2,
  columnsPerRow = 4,
  resetFields,
  resetExpandOnReset = false,
  formName = "search-form",
  initialValues,
  form: externalForm,
  className,
}) => {
  const { t } = useTranslation();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // 외부 form이 제공되면 사용하고, 없으면 내부 form 인스턴스 생성
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  // initialValues가 변경될 때 form 값 업데이트 (외부 form인 경우에만)
  useEffect(() => {
    if (initialValues !== undefined && externalForm) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form, externalForm]);

  // controlled/uncontrolled 모드 지원
  const isControlled =
    controlledExpanded !== undefined && controlledToggleExpand !== undefined;
  const searchExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggleExpand = useCallback(() => {
    if (isControlled) {
      controlledToggleExpand?.();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, controlledToggleExpand]);

  // 초기화 핸들러 최적화
  const handleReset = useCallback(() => {
    if (onReset) {
      // 외부에서 제공된 핸들러가 있으면 우선 실행
      onReset();
    } else if (form) {
      // form 인스턴스가 있으면 자동으로 초기화
      if (resetFields && resetFields.length > 0) {
        // 특정 필드만 초기화
        form.resetFields(resetFields);
      } else {
        // 전체 필드 초기화
        form.resetFields();
      }
    }

    // 확장 상태도 초기화할지 확인
    if (resetExpandOnReset && !isControlled) {
      setInternalExpanded(defaultExpanded);
    } else if (resetExpandOnReset && isControlled) {
      // controlled 모드에서는 외부에서 처리해야 함
      controlledToggleExpand?.();
    }
  }, [
    onReset,
    form,
    resetFields,
    resetExpandOnReset,
    defaultExpanded,
    isControlled,
    controlledToggleExpand,
  ]);

  // children을 배열로 변환
  const fields = useMemo(() => {
    if (!children) return [];
    return Children.toArray(children).filter(isValidElement);
  }, [children]);

  // 보여줄 필드 수 계산
  const visibleFieldCount = useMemo(
    () => visibleRows * columnsPerRow,
    [visibleRows, columnsPerRow]
  );
  const hasMoreFields = useMemo(
    () => fields.length > visibleFieldCount,
    [fields.length, visibleFieldCount]
  );
  const visibleFields = useMemo(
    () => (searchExpanded ? fields : fields.slice(0, visibleFieldCount)),
    [searchExpanded, fields, visibleFieldCount]
  );

  // 검색 핸들러 (form 값 가져오기)
  // @modified 2025-12-16 이상찬 SearchForm 내부에서 값을 추출하여 상위로 전달하도록 수정
  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    if (onSearch) {
      onSearch(values);
    }
  }, [onSearch, form]);

  // 다국어 처리된 툴팁 텍스트
  const searchTooltip = useMemo(() => t("label000", "조회"), [t]);
  const resetTooltip = "초기화";
  const expandTooltip = searchExpanded ? "접기" : "펼치기";

  // Form 안에 들어갈 필드들
  const formContent = useMemo(
    () => (
      <>
        {children &&
          fields.length > 0 &&
          visibleFields.map((field, index) => {
            if (isValidElement(field)) {
              const existingClassName =
                (field.props as { className?: string })?.className || "";
              return cloneElement(field, {
                key: field.key || `field-${index}`,
                className: `filter-panel__field ${existingClassName}`,
              } as Partial<unknown>);
            }
            return field;
          })}
      </>
    ),
    [children, fields.length, visibleFields]
  );

  // Form 밖에 나올 액션 버튼들
  const actionsContent = useMemo(
    () => (
      <div className="filter-panel__actions">
        <Space>
          {showSearch && (
            <FormButton
              objId="BTN_SEARCH"
              size="small"
              onClick={handleSearch}
              className="filter-panel__button filter-panel__button--submit"
            >
              {searchTooltip}
            </FormButton>
          )}
          {showReset && (
            <Tooltip title={resetTooltip}>
              <FormButton
                size="small"
                onClick={handleReset}
                className="filter-panel__button filter-panel__button--reset"
                icon={
                  <i className="ri-refresh-line" style={{ fontSize: 18 }} />
                }
              />
            </Tooltip>
          )}
          {showExpand && hasMoreFields && (
            <Tooltip title={expandTooltip}>
              <FormButton
                size="small"
                icon={
                  <i
                    className={
                      searchExpanded
                        ? "ri-arrow-up-s-line"
                        : "ri-arrow-down-s-line"
                    }
                    style={{ fontSize: 18 }}
                  />
                }
                onClick={handleToggleExpand}
                className="filter-panel__button filter-panel__button--toggle"
              />
            </Tooltip>
          )}
        </Space>
      </div>
    ),
    [
      showSearch,
      showReset,
      showExpand,
      hasMoreFields,
      handleSearch,
      handleReset,
      handleToggleExpand,
      searchTooltip,
      expandTooltip,
      searchExpanded,
    ]
  );

  // 항상 내부에서 Form으로 감싸기
  return (
    <SearchFormStyles className={className} $columnsPerRow={columnsPerRow}>
      <Form
        form={form}
        name={formName}
        className="filter-panel__form"
        initialValues={initialValues}
      >
        {formContent}
      </Form>
      {actionsContent}
      {loading && <LoadingSpinner tip={t("조회_중")} />}
    </SearchFormStyles>
  );
};

// React.memo로 감싸서 props가 변경되지 않으면 재렌더링 방지
export const SearchForm = React.memo(SearchFormComponent);

export default SearchForm;
