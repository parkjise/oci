import React from "react";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { FormLabelStyles } from "./FormLabel.styles";

export interface FormLabelProps {
  /** 다국어 키 */
  labelKey: string;
  /** 다국어 키가 없을 경우 표시할 레이블 */
  label?: string;
  /** 필수 표시 여부 */
  required?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 인라인 스타일 */
  style?: React.CSSProperties;
}

const FormLabel: React.FC<FormLabelProps> = ({
  labelKey,
  label,
  required = false,
  className,
  style,
}) => {
  const { t } = useTranslation();

  // 다국어 텍스트 가져오기
  const labelText = t(labelKey, label ?? labelKey);

  // 설명 텍스트 가져오기 (_desc 접미사)
  const descKey = `${labelKey}_desc`;
  const descText = t(descKey, "");

  // 설명이 있고 키와 다른 경우에만 표시 (키가 없으면 t()가 키를 반환하므로)
  const hasDescription = descText && descText !== descKey && descText !== "";

  const renderHelpText = () => {
    const helpElements = [];

    if (required) {
      helpElements.push(
        <span key="required" className="helptext asterisk">
          <i className="ri-asterisk"></i>
        </span>
      );
    }

    if (hasDescription) {
      helpElements.push(
        <Tooltip key="description" title={descText}>
          <span className="helptext question">
            <i className="ri-question-line"></i>
          </span>
        </Tooltip>
      );
    }

    return helpElements.length > 0 ? <>{helpElements}</> : null;
  };

  return (
    <FormLabelStyles className={className} style={style}>
      {labelText}
      {renderHelpText()}
    </FormLabelStyles>
  );
};

export default FormLabel;
