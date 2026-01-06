import React, { useEffect, useCallback } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { SearchForm, FormInput, FormSelect } from "@components/ui/form";
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { SearchStyles } from "./Search.styles";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { loading, searchParams, search, reset } = useUserMngStore();

  const handleSearch = useCallback(async () => {
    const values = await form.validateFields();
    search({
      asType: values.asType,
      asName: values.asName,
      asUseYn: values.asUseYn,
    });
  }, [form, search]);

  const handleReset = useCallback(() => {
    form.resetFields();
    reset();
  }, [form, reset]);

  useEffect(() => {
    form.setFieldsValue(searchParams);
  }, [form, searchParams]);

  const typeOptions = [
    { value: "2", label: t("성명") },
    { value: "1", label: t("부서") },
    { value: "3", label: t("사번") },
  ];

  const useYnOptions = [
    { value: "%", label: t("전체") },
    { value: "Y", label: t("사용") },
    { value: "N", label: t("미사용") },
  ];

  return (
    <SearchStyles>
      <SearchForm
        form={form}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
        columnsPerRow={4} // 컬럼 수를 4로 늘려 여유 공간 확보 (필드 3개 + 버튼 영역)
        showExpand={false}
        className="page-layout__filter-panel" // 레이아웃 클래스 복구
      >
        <FormSelect
          name="asType"
          label={t("조회구분")}
          options={typeOptions}
        />
        <FormInput
          name="asName"
          label=""
          onPressEnter={handleSearch}
        />
        <FormSelect
          name="asUseYn"
          label={t("사용여부")}
          options={useYnOptions}
        />
      </SearchForm>
    </SearchStyles>
  );
};

export default Search;
