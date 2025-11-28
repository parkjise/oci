import React from "react";
import { Form, Button, Tooltip } from "antd";
import { FormInput, FormDatePicker } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  return (
    <FilterPanelStyles className={className}>
      <Form name="전표일자" style={{}} className="filter-panel__form">
        <FormDatePicker
          name="전표일자"
          label="전표일자"
          placeholder="전표일자"
          className="filter-panel__field"
        />
        <FormInput name="번호" label="번호" className="filter-panel__field" />
        <FormInput name="ID" label="ID" className="filter-panel__field" />
      </Form>
      <div className="filter-panel__actions">
        <Tooltip title="조회">
          <Button
            icon={<i className="ri-search-line" style={{ fontSize: 18 }} />}
            className="filter-panel__actions-button"
          />
        </Tooltip>
        <Tooltip title="펼치기">
          <Button
            icon={
              <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
            }
            className="filter-panel__actions-button"
          />
        </Tooltip>
      </div>
    </FilterPanelStyles>
  );
};

export default FilterPanel;

