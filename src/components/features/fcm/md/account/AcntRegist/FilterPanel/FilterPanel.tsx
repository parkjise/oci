import React from "react";
//import { Modal, Form } from "antd";
import {
  SearchForm,
  FormSearchInput,
  FormSelect
} from "@components/ui/form";


type FilterPanelProps = {
  className?: string;
 // onPostYnChange?: (sPostYn: string) => void;
//onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  //const [form] = Form.useForm();
  /*TODO: 귀속부서,거래처 모달 추가*/
  //const [deptModalVisible, setDeptModalVisible] = useState(false);

  // 초기값 설정: 현재 월의 첫째날 ~ 오늘
  const initialValues = {
    useYn: "##",
  };

  return (
    <SearchForm 
      className={className}
      initialValues={initialValues}
      showSearch = { true }
      showReset = { true }  
    >  
      <FormSearchInput
        name="acntCd"
        label="계정코드"
        placeholder=""
        showReadOnlyBoxName="acntCdDisplay"
        onPopupOpen={(value) => {
          console.log("value", value);
        }}
        />
      <FormSelect 
        name="useYn"
        label="사용여부"
        placeholder=""
        options={[
          { value: "##", label: "전체" },
          { value: "Y", label: "사용" },
          { value: "N", label: "사용안함" },
        ]}
        />
    </SearchForm>
  );
};

export default FilterPanel;