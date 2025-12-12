import React from "react";
import { Form, Tooltip } from "antd";
import {
  FormButton,
  FormInput,
  FormDatePicker,
  FormSelect,
} from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";

type FilterPanelProps = {
  className?: string;
};
const DEPARTMENT_OPTIONS = [
  { value: "개발팀", label: "개발팀" },
  { value: "디자인팀", label: "디자인팀" },
  { value: "기획팀", label: "기획팀" },
  { value: "마케팅팀", label: "마케팅팀" },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  return (
    <FilterPanelStyles className={className}>
      <Form name="전표일자" className="filter-panel__form">
        <FormDatePicker
          name="전표일자"
          label="전표일자"
          placeholder="전표일자"
          className="filter-panel__field"
        />
        <FormInput name="번호" label="번호" className="filter-panel__field" />
        {/* <FormSelect
          name="department"
          label="부서"
          placeholder="부서를 선택하세요"
          allowClear
          showSearch
          size="small"
          options={DEPARTMENT_OPTIONS}
          comCodeParams={{
            module: "GL",
            enabledFlag: "Y",
            type: "ALWACC",
          }}
          filterComCodeParams={{
            module: "GL",
            enabledFlag: "Y",
            type: "ALWACC",
          }}
        /> */}

        {/* <FormInput name="ID" label="ID" className="filter-panel__field" /> */}
        <FormSelect
          name="department"
          label="부서"
          placeholder="부서를 선택하세요"
          allowClear
          showSearch
          options={DEPARTMENT_OPTIONS}
        />
        <FormInput
          type="search"
          name="search"
          label="검색"
          className="filter-panel__field"
          showReadOnlyBoxName="selectedValue"
          width={150}
        />
      </Form>
      <div className="filter-panel__actions">
        <FormButton
          // icon={<i className="ri-search-line" style={{ fontSize: 14 }} />}
          className="filter-panel__button filter-panel__button--submit"
        >
          조회
        </FormButton>
        <Tooltip title="펼치기">
          <FormButton
            icon={
              <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
            }
            className="filter-panel__button filter-panel__button--toggle"
          />
        </Tooltip>
      </div>
    </FilterPanelStyles>
  );
};

export default FilterPanel;
