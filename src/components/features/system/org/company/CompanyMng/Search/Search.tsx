import React, { useEffect } from "react";
import { Form } from "antd";
import { SearchActions } from "@components/ui/form";
import { useCompanyMngStore } from "@store/system/org/company/companyMngStore";
import { FilterPanelWrapper } from "./Search.styles";

const Search: React.FC = () => {
  const [form] = Form.useForm();
  const { loading, fetchCompanyList } = useCompanyMngStore();

  useEffect(() => {
    // 초기 로드 시 검색 실행
    fetchCompanyList();
  }, [fetchCompanyList]);

  const handleSearch = () => {
    fetchCompanyList(form.getFieldsValue());
  };

  const handleReset = () => {
    form.resetFields();
    fetchCompanyList();
  };

  return (
    <FilterPanelWrapper>
      <Form form={form} layout="inline" className="filter-panel__form">
        {/* 추가 검색 조건이 필요하면 여기에 작성 */}
      </Form>
      <div className="filter-panel__actions">
        <SearchActions
          loading={loading}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </div>
    </FilterPanelWrapper>
  );
};

export default Search;
