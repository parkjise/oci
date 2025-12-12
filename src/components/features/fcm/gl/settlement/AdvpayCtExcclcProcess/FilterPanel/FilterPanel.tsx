import React from "react";
import {
  FormDatePicker,
  FormSelect,
  SearchForm,
  FormSearchInput,
  FormRadioGroup,
} from "@components/ui/form";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  // onPostYnChange?: (sPostYn: string) => void;
  //onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  
  // 초기값 설정
  const initialValues = {
    dateRange: [dayjs().startOf("month"), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs],
    glDate: dayjs() as dayjs.Dayjs,
    slipType: "CREATE",
    glProcess: "CREATE",
  };

  return (
    <SearchForm
      className={className}
      initialValues={initialValues}
      showReset={true}
      visibleRows={2}
      columnsPerRow={4} >
      <FormSelect
        name="asRpsnOffice"
        label="사업장"
        comCodeParams={{
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        }}
        filterValues={["##"]}
        allOptionLabel="전체"
      />
      <FormDatePicker
        name="dateRange"
        label="작성일자"
        isRange={true}
      />
      <FormSearchInput
        name="asDept"
        label="귀속부서"
        placeholder=""
        showReadOnlyBoxName="asDeptDisplay"
      />
      <FormRadioGroup
        name="slipType"
        label=""
        options={[
          { label: "전표생성", value: "CREATE" },
          { label: "전표취소", value: "CANCEL" },
        ]}
      />
      <FormDatePicker
        name="glDate"
        label="GL DATE"
        isRange={false}
      />
      <FormSearchInput
        name="asCust"
        label="거래처"
        showReadOnlyBoxName="asCustDisplay"
      />
      <FormRadioGroup
        name="glProcess"
        label="GL 처리"
        options={[
          { label: "GL처리 대상", value: "CREATE" },
          { label: "GL처리 대상취소", value: "CANCEL" },
        ]}
      />
    </SearchForm>
  );
};

export default FilterPanel;