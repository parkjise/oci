import React from "react";
import { Form } from "antd";
import { SearchActions } from "@components/ui/form";
import { useWorkplaceMngStore } from "@store/system/org/workplace/workplaceMngStore";
import { FilterPanelWrapper } from "./Search.styles";

const Search: React.FC = () => {
  const [form] = Form.useForm();
  
  const search = useWorkplaceMngStore((state) => state.search);
  const reset = useWorkplaceMngStore((state) => state.reset);
  const loading = useWorkplaceMngStore((state) => state.loading);
  const setSearchParams = useWorkplaceMngStore((state) => state.setSearchParams);

  const handleSearch = async (values: any) => {
    setSearchParams(values);
    await search();
  };

  const handleReset = async () => {
    form.resetFields();
    reset(); // Reset store state
    setSearchParams({});
    await search();
  };

  return (
    <FilterPanelWrapper>
      <Form
        form={form}
        layout="inline"
        className="filter-panel__form"
        onFinish={handleSearch}
      >
        {/* Add Search Fields here if needed in future */}
      </Form>
      <div className="filter-panel__actions">
        <SearchActions
          loading={loading}
          onSearch={() => form.submit()}
          onReset={handleReset}
        />
      </div>
    </FilterPanelWrapper>
  );
};

export default Search;
