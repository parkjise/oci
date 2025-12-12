// ============================================================================
// Import
// ============================================================================
import React, { useState, useCallback } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";
import { FormSelect, FormSearchInput, FormRadioGroup, SearchForm } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<{ type?: string; name?: string; useYn?: string }> }) => void;
  onSearch?: (values: { type?: string; name?: string; useYn?: string }) => Promise<void>;
  loading?: boolean;
};

// Internal component to capture Form instance from SearchForm
const FormWatcher: React.FC<{
  onFormInstanceReady: (instance: FormInstance) => void;
}> = ({ onFormInstanceReady }) => {
  const form = Form.useFormInstance();
  React.useEffect(() => {
    if (form) {
      onFormInstanceReady(form);
    }
  }, [form, onFormInstanceReady]);
  return null;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 사업장사용자관리 필터 패널 컴포넌트
 * - 변경이력: 2025.11.25 : ckkim (최초작성)
 */
const FilterPanel: React.FC<FilterPanelProps> = ({ className, onRefReady, onSearch, loading = false }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormInstance | null>(null);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (!form) return;
    form.setFieldsValue({
      type: "2", // 기본값: 성명
      name: "",
      useYn: "%", // 기본값: 전체
    });
    // 초기화 후 자동 조회
    if (onSearch) {
      onSearch({ type: "2", name: "", useYn: "%" });
    }
  }, [form, onSearch]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!form) {
      return { type: "2", name: "", useYn: "%" };
    }

    try {
      const values = await form.validateFields();
      const searchParams = {
        type: values.type || "2",
        name: values.name || "",
        useYn: values.useYn !== undefined && values.useYn !== null ? values.useYn : "%",
      };
      
      // 부모 컴포넌트의 onSearch 호출
      if (onSearch) {
        await onSearch(searchParams);
      }
      
      return searchParams;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("조회 실패:", error);
      }
      return { type: "2", name: "", useYn: "%" };
    }
  }, [form, onSearch]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  React.useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  // 초기값 설정 (한 번만 실행)
  const [isFormInitialized, setIsFormInitialized] = React.useState(false);
  React.useEffect(() => {
    if (form && !isFormInitialized) {
      const currentValues = form.getFieldsValue();
      // 값이 없을 때만 기본값 설정
      if (currentValues.type === undefined && currentValues.useYn === undefined) {
        form.setFieldsValue({
          type: "2", // 기본값: 성명
          name: "",
          useYn: "%", // 기본값: 전체
        });
      }
      setIsFormInitialized(true);
    }
  }, [form, isFormInitialized]);

  // 타입 옵션
  const typeOptions = [
    { value: "1", label: t("부서") },
    { value: "2", label: t("성명") },
    { value: "3", label: t("사번") },
  ];

  // 사용여부 옵션
  const useYnOptions = [
    { value: "Y", label: t("Yes") },
    { value: "N", label: t("No") },
    { value: "%", label: t("전체") },
  ];

  return (
    <FilterPanelStyles className={className}>
      <SearchForm
        onSearch={handleSearch}
        onReset={handleReset}
        showReset={true}
        visibleRows={1}
        columnsPerRow={4}
        loading={loading}
      >
        <FormWatcher onFormInstanceReady={setForm} />
        <FormSelect
          name="type"
          label={t("타입")}
          options={typeOptions}
          placeholder={t("타입")}
        />
        <FormSearchInput
          name="name"
          label={t("검색어")}
          placeholder={t("검색어를 입력하세요")}
          onPressEnter={handleSearch}
        />
        <FormRadioGroup
          name="useYn"
          label={t("사용여부")}
          options={useYnOptions}
          layout="horizontal"
        />
      </SearchForm>
    </FilterPanelStyles>
  );
};

export default FilterPanel;

