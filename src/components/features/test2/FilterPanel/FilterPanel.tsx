import React from "react";
import { Form, Button, Tooltip, Radio } from "antd";
import { FormDatePicker } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  return (
    <FilterPanelStyles className={className}>
      <Form name="회계일자" style={{}} className="filter-panel__form">
        <FormDatePicker
          name="회계일자"
          label="회계일자"
          placeholder=""
          className="filter-panel__field"
        />
        <Form.Item label="구분">
          <Radio.Group name="radio-group" className="filter-panel__field" defaultValue="1">
            <Radio value="1">AP</Radio>
            <Radio value="2">AR</Radio>
            <Radio value="3">GL</Radio>
          </Radio.Group>
          </Form.Item>
          <FormDatePicker
          name="Reverse일자"
          label="Reverse일자"
          placeholder=""
          className="filter-panel__field"
        />  
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

