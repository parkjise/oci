/**
 * 재무회계 > 기준정보 > 기타관리 > 지급조건 등록 - 검색 필터
 *
 * @description 지급조건 등록 - 검색 필터
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Form } from "antd";
import SearchForm from "@form/SearchForm";
import { FormSelect } from "@form";
import type { PymntCndRegistSrchRequest } from "@/types/fcm/md/other/pymntCndRegist.types";
import { useAuthStore } from "@store/com/auth";
import { useTranslation } from "react-i18next";

type FilterPanelProps = {
  className?: string;
  handleSelectList: (data?: PymntCndRegistSrchRequest) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  handleSelectList,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  const initialValues = useMemo(() => ({
    asOfficeId: userOfficeId,
    asType: '',
    asUseYn: 'Y',
  }), [userOfficeId]);

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
      const request: PymntCndRegistSrchRequest = searchValues
        ? { ...(searchValues as unknown as PymntCndRegistSrchRequest), asOfficeId: userOfficeId }
        : { asOfficeId: userOfficeId, asType: '', asUseYn: 'Y' };

      await handleSelectList(request);
    } finally {
      setLoading(false);
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    }
  }, [userOfficeId, handleSelectList]);

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
        name="asType"
        label="Type(구분)"
        options={[
          { label: t("전체"), value: '' },
          { label: 'AR', value: 'A' },
          { label: 'AP', value: 'B' },
          { label: 'CM', value: 'C' },
        ]}
      />
      <FormSelect
        name="asUseYn"
        label={t("사용여부")}
        options={[
          { label: 'Yes', value: 'Y' },
          { label: 'No', value: 'N' },
        ]}
      />
    </SearchForm>
  )
}

export default FilterPanel;
