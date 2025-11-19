import { Form, Button, Tooltip } from "antd";
import Input from "@form/CustomInput";
import DatePicker from "@form/CustomDatePicker";
import { FilterPanelStyles } from "@/pages/sample/sample2/FelterPanel/FelterPanel.styles";
type FilterPanelProps = {
  className?: string;
};
const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  return (
    <FilterPanelStyles className={className}>
      <Form name="전표일자" style={{}} className="filter-panel__form">
        <Form.Item
          label="전표일자"
          name=""
          rules={[{ required: true, message: "Please input your username!" }]}
          className="filter-panel__field"
        >
          <DatePicker />
        </Form.Item>
        <Form.Item label="번호" name="" className="filter-panel__field">
          <Input />
        </Form.Item>
        <Form.Item label="ID" name="" className="filter-panel__field">
          <Input />
        </Form.Item>
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
