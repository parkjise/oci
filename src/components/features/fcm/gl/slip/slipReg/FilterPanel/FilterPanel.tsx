import React, { useState, useEffect } from "react";
import { Form, Tooltip } from "antd";
import { FormButton, FormSelect, FormDatePicker, FormSearchInput, FormInput } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";
import type { SlipSrchRequest } from "@/types/fcm/gl/slip/slipRegist.types";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  onSearch?: (searchParams: SlipSrchRequest) => void | Promise<void>;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className, onSearch }) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  // 회계일자 기본값을 이번 달 1일부터 오늘까지로 설정
  useEffect(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");
    
    form.setFieldsValue({
      dateRange: [firstDay, today],
    });
  }, [form]);

  const handleFinish = (values: any) => {
    if (!onSearch) return;

    // 회계일자를 dateRange에서 dateFr, dateTr로 변환
    const dateRange = values["dateRange"] as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    const dateFr = dateRange && dateRange[0] ? dateRange[0].format("YYYYMMDD") : "";
    const dateTr = dateRange && dateRange[1] ? dateRange[1].format("YYYYMMDD") : "";

    const searchParams: SlipSrchRequest = {
      asRpsnOffice: values["asRpsnOffice"] || "",
      dvs: values["dvs"] || "",
      dateFr,
      dateTr,
      slpHeaderId: values["slpHeaderId"] || "",
      makeDept: values["makeDept"] || "",
      makeDeptName: values["makeDeptName"] || "",
      makeUser: values["makeUser"] || "",
      makeUserName: values["makeUserName"] || "",
      pageNum: 1,
      pageSize: 100,
    };

    onSearch(searchParams);
  };

  return (
    <FilterPanelStyles className={className}>
      <Form form={form} name="slipSearch" onFinish={handleFinish} className="filter-panel__form">
        <div className="filter-panel__fields">
          <FormSelect
            name="dvs"
            label="사업부"
            placeholder="전체"
            className="filter-panel__field"
          />
          <FormDatePicker
            name="dateRange"
            label="회계일자"
            isRange={true}
            className="filter-panel__field"
          />
          <div className="filter-panel__field filter-panel__field--inline">
            <FormSearchInput
              name="makeDept"
              label="작성부서"
              placeholder="작성부서를 검색하세요"
            />
            <FormInput
              name="makeDeptName"
              label=""
              placeholder="작성부서명"
              readOnly
            />
          </div>
          <div className="filter-panel__field filter-panel__field--inline">
            <FormSearchInput
              name="makeUser"
              label="작성자"
              placeholder="작성자를 검색하세요"
            />
            <FormInput
              name="makeUserName"
              label=""
              placeholder="작성자명"
              readOnly
            />
          </div>
        </div>
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
        <Tooltip title={expanded ? "접기" : "펼치기"}>
          <FormButton
            icon={
              <i className={expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{ fontSize: 18 }} />
            }
            className="filter-panel__actions-button"
            onClick={() => setExpanded(!expanded)}
          />
        </Tooltip>
      </div>
    </FilterPanelStyles>
  );
};

export default FilterPanel;
