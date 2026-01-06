import React, { useCallback } from "react";
import {
  FormInput,
  FormSelect,
  SearchForm,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { useLabelMngStore } from "@store/system/pgm/lang/label/labelMngStore";

const FilterPanel: React.FC = () => {
  const { t } = useTranslation();
  
  // Store에서 상태와 액션 가져오기
  const { langTypeList, loading, search } = useLabelMngStore();

  // 조회 버튼 핸들러
  const handleSearch = useCallback(
    (values: Record<string, any>) => {
      // Store의 search 함수 호출
      search({
        asLang: values.langType || undefined,
        asKey: values.searchKey || undefined,
        asWord: values.searchWord || undefined,
      });
    },
    [search]
  );

  // 언어 타입 옵션
  const langTypeOptions = langTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  return (
    <SearchForm
      onSearch={handleSearch}
      loading={loading}
      showReset={true}
      showExpand={false}
      visibleRows={1}
      columnsPerRow={4}
      className="page-layout__filter-panel"
      initialValues={{
        langType: undefined,
        searchKey: undefined,
        searchWord: undefined,
      }}
    >
      <FormSelect
        name="langType"
        label={t("언어")}
        options={langTypeOptions}
        allowClear
        useModalMessage={false}
        placeholder={t("전체")}
      />
      <FormInput
        name="searchKey"
        label={t("레이블 키")}
        placeholder={t("레이블 키")}
        useModalMessage={false}
      />
      <FormInput
        name="searchWord"
        label={t("레이블 내용")}
        placeholder={t("레이블 내용")}
        useModalMessage={false}
      />
    </SearchForm>
  );
};

export default FilterPanel;
