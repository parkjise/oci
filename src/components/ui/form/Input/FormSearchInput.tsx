/**
 * @deprecated FormSearchInput은 FormInput으로 통합되었습니다.
 * FormInput을 type="search"로 사용해주세요.
 *
 * 예시:
 * <FormInput type="search" name="search" label="검색" onSearch={handleSearch} />
 *
 * 하위 호환성을 위해 FormSearchInput은 FormInput의 alias로 유지됩니다.
 */
import React from "react";
import { Form, Space } from "antd";
import type { SearchProps } from "antd/es/input/Search";
import type { Rule } from "antd/es/form";
import type { ColProps } from "antd/es/col";
import type { FormItemLayout } from "antd/es/form/Form";
import { InputSearchStyles } from "@/components/ui/form/Input/FormSearchInput.styles";
import { addonAfterStyle } from "./AddonAfter.styles";
import FormInput from "./FormInput";

const FULL_WIDTH_STYLE: React.CSSProperties = { width: "100%" };

type FormSearchInputProps = Omit<SearchProps, "addonAfter"> & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  addonAfter?: React.ReactNode;
  useModalMessage?: boolean;
  onPopupOpen?: (searchValue: string) => void; // 팝업 열기 콜백 (검색어 전달)
  showReadOnlyBoxName?: string; // readOnly 박스의 name (값이 있으면 활성화, 없으면 비활성화)
};

const FormSearchInput: React.FC<FormSearchInputProps> = ({
  labelCol: _labelCol,
  wrapperCol: _wrapperCol,
  max,
  showReadOnlyBoxName,
  onPopupOpen,
  onSearch,
  name,
  label,
  rules,
  layout,
  addonAfter: propAddonAfter,
  useModalMessage,
  ...props
}) => {
  // labelCol, wrapperCol은 FormInput에서 지원하지 않으므로 제외
  // max는 number로 변환 (SearchProps의 max는 string | number일 수 있음)
  void _labelCol;
  void _wrapperCol;

  const formInputProps = {
    ...props,
    ...(max !== undefined && {
      max: typeof max === "number" ? max : Number(max),
    }),
    type: "search" as const,
  };

  // onSearch 핸들러: 검색 버튼 클릭 시 팝업 열기
  const handleSearch = React.useCallback(
    (value: string) => {
      if (onPopupOpen) {
        // 팝업 열기 (검색어 전달)
        onPopupOpen(value);
      }
      // 기존 onSearch도 호출 (필요한 경우)
      onSearch?.(value);
    },
    [onPopupOpen, onSearch]
  );

  // 기본 검색 박스
  const searchElement = (
    <InputSearchStyles {...formInputProps} onSearch={handleSearch} />
  );

  // readOnly 표시 박스 (showReadOnlyBoxName이 있으면 활성화)
  const readOnlyDisplayElement = showReadOnlyBoxName ? (
    <Form.Item name={showReadOnlyBoxName}>
      <FormInput type="text" readOnly name={showReadOnlyBoxName} />
    </Form.Item>
  ) : null;

  // readOnly 박스가 있으면 두 개를 나란히 배치
  const inputContent =
    showReadOnlyBoxName && readOnlyDisplayElement ? (
      <Space.Compact style={FULL_WIDTH_STYLE}>
        <Form.Item name={name}>{searchElement}</Form.Item>
        {readOnlyDisplayElement}
      </Space.Compact>
    ) : (
      searchElement
    );

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      layout={layout as FormItemLayout}
      colon={false}
      {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
      style={{ marginBottom: 0 }}
    >
      {propAddonAfter ? (
        <Space.Compact style={FULL_WIDTH_STYLE}>
          {inputContent}
          <span style={addonAfterStyle}>{propAddonAfter}</span>
        </Space.Compact>
      ) : (
        inputContent
      )}
    </Form.Item>
  );
};

export default FormSearchInput;
