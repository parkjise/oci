import React from "react";
import { Form } from "antd";
import {
  FormInput,
  FormDatePicker,
  FormSelect,
  FormRadioGroup,
  FormCheckbox,
  SearchActions,
} from "@components/ui/form";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    console.log("검색:", values);
    // 여기에 검색 로직 추가
  };

  return (
    <SearchActions
      onSearch={handleSearch}
      visibleRows={2}
      columnsPerRow={4}
      resetExpandOnReset={true}
      className={className}
    >
      {/* 날짜 필드 */}
      <FormDatePicker
        name="startDate"
        label="시작일"
        isRange={true}
        rules={[{ required: true, message: "시작일을 선택해주세요" }]}
      />
      <FormDatePicker
        name="endDate"
        label="입사일"
        rules={[{ required: true, message: "종료일을 선택해주세요" }]}
      />

      {/* 일반 텍스트 */}
      <FormInput name="code" label="코드" />
      <FormInput name="name" label="이름" />

      {/* 숫자 입력 */}
      <FormInput
        type="number"
        name="amount"
        label="금액"
        min={0}
        max={10000000}
      />
      <FormInput type="number" name="quantity" label="수량" max={10000000} />

      {/* 이메일 */}
      <FormInput type="email" name="email" label="이메일" />

      {/* 전화번호 */}
      <FormInput type="tel" name="phone" label="전화번호" />

      {/* 셀렉트 박스 */}
      <FormSelect
        name="status"
        label="상태"
        options={[
          { value: "active", label: "활성" },
          { value: "inactive", label: "비활성" },
          { value: "pending", label: "대기중" },
        ]}
      />

      {/* 라디오 그룹 */}
      <FormRadioGroup
        name="userType"
        label="사용자 유형"
        options={[
          { value: "admin", label: "관리자" },
          { value: "user", label: "일반사용자" },
          { value: "guest", label: "게스트" },
        ]}
      />

      {/* 알림 설정 그룹 */}
      <FormCheckbox.Group
        name="notifications"
        label="알림 설정"
        options={[
          { value: "email", label: "이메일" },
          { value: "sms", label: "SMS" },
          { value: "push", label: "푸시" },
        ]}
      />

      {/* 사업자번호 */}
      <FormInput
        type="businessNumber"
        name="businessNumber"
        label="사업자번호"
      />

      {/* 주민등록번호 */}
      <FormInput
        type="residentNumber"
        name="residentNumber"
        label="주민등록번호"
      />

      {/* 법인번호 */}
      <FormInput
        type="corporateNumber"
        name="corporateNumber"
        label="법인번호"
      />

      {/* 검색 입력 */}
      <FormInput
        type="search"
        name="searchText"
        label="검색어"
        placeholder="검색어를 입력하세요"
      />

      {/* 읽기 전용 박스 표시 옵션 */}
      <FormInput
        name="readOnlyExample"
        type="search"
        label="읽기 전용 박스"
        showReadOnlyBoxName="readonly-box"
        placeholder="읽기 전용 박스 예시"
      />

      {/* 기타 필드 */}
      <FormInput name="department" label="부서" />
      <FormInput name="remark" label="비고" />
    </SearchActions>
  );
};

export default FilterPanel;
