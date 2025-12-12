import React, { useState, useCallback } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";
import { FormDatePicker, SearchForm } from "@components/ui/form";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
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

const FilterPanel: React.FC<FilterPanelProps> = ({ className, onRefReady }) => {
  const [form, setForm] = useState<FormInstance | null>(null);
  const { search, loading } = useClosTagManageStore();

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (!form) return;
    form.setFieldsValue({
      year: dayjs(),
    });
  }, [form]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!form) return;

    try {
      const values = await form.validateFields();
      const searchParams = {
        year: values.year ? values.year.format("YYYY") : dayjs().format("YYYY"),
      };

      await search(searchParams);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("조회 실패:", error);
      }
    }
  }, [form, search]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  React.useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  // 초기값 설정
  React.useEffect(() => {
    if (form) {
      form.setFieldsValue({
        year: dayjs(),
      });
    }
  }, [form]);

  return (
    <SearchForm
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={1}
      columnsPerRow={4}
      className={className}
    >
      <FormWatcher onFormInstanceReady={setForm} />
      <FormDatePicker
        name="year"
        label="년도"
        picker="year"
        format="YYYY"
        allowClear={false}
      />
    </SearchForm>
  );
};

export default FilterPanel;
