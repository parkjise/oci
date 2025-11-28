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
import FormInput from "./FormInput";
import type { SearchProps } from "antd/es/input/Search";
import type { Rule } from "antd/es/form";
import type { ColProps } from "antd/es/col";

type FormSearchInputProps = Omit<SearchProps, "addonAfter"> & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  addonAfter?: React.ReactNode;
  useModalMessage?: boolean;
};

const FormSearchInput: React.FC<FormSearchInputProps> = ({
  labelCol: _labelCol,
  wrapperCol: _wrapperCol,
  max,
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
  return <FormInput {...formInputProps} />;
};

export default FormSearchInput;
