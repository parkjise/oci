/**
 * 재무회계 > 기준정보 > 계정코드관리 > 표준재무제표 등록 - 검색 필터
 *
 * @description 표준재무제표 등록 - 검색 필터
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import type { StdFnnrTblatRegistSrchRequest } from "@/types/fcm/md/account/stdFnnrTblatRegist.types";
import { Form } from "antd";
import { FormSelect } from "@form";
import SearchForm from "@form/SearchForm";
import { useAuthStore } from "@store/com/auth";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@components/features/fcm/md/partner/BcncRegist/Constants/SelectOption.ts";

type FilterPanelProps = {
  className?: string;
  handleSelectList: (search?: StdFnnrTblatRegistSrchRequest) => void;
  filterOptions: SelectOption[];
}

const FilterPanel: React.FC<FilterPanelProps> = React.memo(({
  className,
  handleSelectList,
  filterOptions,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const menuName = useMemo(() => (
    t("LABEL_MENU_00773")
  ), [t])

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  const lastValuesRef = useRef<string>("");
  const [form] = Form.useForm();

  const handleSearch = useCallback(async (searchValues?: Record<string, unknown>) => {
    // 이미 이 값으로 검색 중이거나 검색했다면 중복 실행 방지
    const valuesStr = JSON.stringify(searchValues);
    if (isLoadingRef.current && lastValuesRef.current === valuesStr) return;

    isLoadingRef.current = true;
    lastValuesRef.current = valuesStr; // 동기적으로 즉시 값을 업데이트하여 중복 실행 방지
    setLoading(true);
    try {
      const request: StdFnnrTblatRegistSrchRequest = searchValues
        ? { ...(searchValues as unknown as StdFnnrTblatRegistSrchRequest), asOfficeId: userOfficeId }
        : { asOfficeId: userOfficeId, asRepType: filterOptions?.[0]?.value ?? '', };
      await handleSelectList(request);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, [userOfficeId, filterOptions, handleSelectList]);

  const initialValues = useMemo(() => ({
    asOfficeId: userOfficeId,
    asRepType: filterOptions?.[0]?.value ?? '',
  }), [filterOptions, userOfficeId]);

  return (
    <SearchForm
      form={form}
      className={className}
      loading={loading}
      showReset={false}
      initialValues={initialValues}
      onSearch={handleSearch}
    >
      <FormSelect
        name="asRepType"
        label={menuName}
        options={filterOptions}
      />
    </SearchForm>
  );
});

export default FilterPanel;
