import React from "react";
import { Form } from "antd";
import { SearchForm, FormInput } from "@/components/ui/form";
import { useBcncAcnutRegistStore } from "@/store/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegistStore";
import { useTranslation } from "react-i18next";
// Import type for safety (optional in component but good for refactoring)
import type { BcncAcnutSrchRequest } from "@/types/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegist.types";

interface FilterPanelProps {
  className?: string;
  initialParams?: Record<string, unknown>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  initialParams,
}) => {
  const { t } = useTranslation();
  const fetchData = useBcncAcnutRegistStore((state) => state.fetchData);
  const reset = useBcncAcnutRegistStore((state) => state.reset);
  const loading = useBcncAcnutRegistStore((state) => state.loading);

  const [form] = Form.useForm();

  const handleSearch = React.useCallback(
    (values: Record<string, unknown>) => {
      fetchData(values as unknown as BcncAcnutSrchRequest);
    },
    [fetchData]
  );

  const serializedParams = React.useMemo(
    () => JSON.stringify(initialParams),
    [initialParams]
  );

  const lastSearchedParamsRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (initialParams) {
      // Map params if necessary, e.g. if passed as selectedUserId -> asCustno
      // But assuming keys match for now or specific mapping logic
      const mappedParams = { ...initialParams };

      form.setFieldsValue(mappedParams);

      // Auto search if required fields are present
      if (mappedParams.asCustno) {
        // Prevent duplicate search if params haven't changed
        if (lastSearchedParamsRef.current !== serializedParams) {
          handleSearch(mappedParams);
          lastSearchedParamsRef.current = serializedParams;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedParams, form, handleSearch]);

  const handleReset = () => {
    form.resetFields();
    reset();
  };

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={2}
      columnsPerRow={4}
      className={className}
    >
      <FormInput
        type="search"
        name="asCustno"
        label={t("거래처")}
        width="250px"
        layout="horizontal"
        showReadOnlyBoxName="asCustName"
        readOnly={true}
      />
    </SearchForm>
  );
};

export default FilterPanel;
