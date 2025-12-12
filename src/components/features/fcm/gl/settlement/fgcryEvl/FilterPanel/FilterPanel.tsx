import { useEffect, useImperativeHandle, forwardRef } from "react";
import { Form, Tooltip } from "antd";
import { FormDatePicker, FormButton, FormRadioGroup } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  onSearch?: (searchParams: any) => void | Promise<void>;
};

export type FilterPanelRef = {
  getCurrentDvs: () => string;
  getCurrentDate: () => string;
};

const FilterPanel = forwardRef<FilterPanelRef, FilterPanelProps>(({ className, onSearch }, ref) => {
  const [form] = Form.useForm();
  
  // ref를 통해 부모 컴포넌트에서 현재 구분 값을 가져올 수 있도록
  useImperativeHandle(ref, () => ({
    getCurrentDvs: () => {
      const radioValue = form.getFieldValue("radio-group") || "1";
      const dvsMap: Record<string, string> = {
        "1": "AP",
        "2": "AR",
        "3": "GL",
      };
      return dvsMap[radioValue] || "AP";
    },
    getCurrentDate: () => {
      const dateValue = form.getFieldValue("FgcryDate");
      if (!dateValue) return "";
      return dayjs(dateValue).format("YYYYMMDD");
    },
  }));

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    form.setFieldsValue({
      FgcryDate: dayjs(),
      "radio-group": "1",
    });
  }, [form]);

  const handleFinish = (values: any) => {
    if (!onSearch) return;

    const searchParams = {
      FgcryDate: values.FgcryDate,
      dvs: values["radio-group"],
      reverseDate: values["Reverse일자"],
    };

    onSearch(searchParams);
  };

  // 구분값 변경 시 자동 조회
  const handleRadioChange = (e: any) => {
    // Radio.Group의 onChange 이벤트
    const values = form.getFieldsValue();
    if (!onSearch) return;

    const searchParams = {
      FgcryDate: values.FgcryDate,
      dvs: e.target.value, // 변경된 라디오 값
      reverseDate: values["Reverse일자"],
    };

    // 자동 조회 실행
    onSearch(searchParams);
  };

  return (
    <FilterPanelStyles className={className}>
      <Form form={form} name="FgcrySearch" onFinish={handleFinish} style={{}} className="filter-panel__form">
        <FormDatePicker
          name="FgcryDate"
          label="회계일자"
          placeholder=""
          className="filter-panel__field"
        />
        <FormRadioGroup
          name="radio-group"
          label="구분"
          options={[
            { value: "1", label: "AP" },
            { value: "2", label: "AR" },
            { value: "3", label: "GL" },
          ]}
          className="filter-panel__field"
          onChange={handleRadioChange}
        />
        {/* <FormDatePicker
          name="Reverse일자"
          label="Reverse일자"
          placeholder=""
          className="filter-panel__field"
        /> */}
      </Form>
      <div className="filter-panel__actions">
        <Tooltip title="조회">
          <FormButton
            htmlType="submit"
            icon={<i className="ri-search-line" style={{ fontSize: 18 }} />}
            className="filter-panel__actions-button"
            onClick={() => form.submit()}
          />
        </Tooltip>
        <Tooltip title="펼치기">
          <FormButton
            icon={
              <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
            }
            className="filter-panel__actions-button"
          />
        </Tooltip>
      </div>
    </FilterPanelStyles>
  );
});

FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
