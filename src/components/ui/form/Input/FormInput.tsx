import React from "react";
import { Form, Space, Typography, Tooltip } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import type { Rule } from "antd/es/form";
import type { InputProps, InputRef } from "antd";
import type { SearchProps } from "antd/es/input/Search";
import type { FormItemLayout } from "antd/es/form/Form";
import { runes } from "runes2";
import { InputStyles } from "./FormInput.styles";
import { addonAfterStyle } from "./AddonAfter.styles";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import FormInputNumber from "./FormInputNumber";
import FormSearchInput from "./FormSearchInput";
import {
  formatBusinessNumber,
  formatPhoneNumber,
  formatResidentNumber,
  formatCorporateNumber,
  getDigitsOnly,
} from "@/utils/stringUtils";
import { useInputValidation, type InputType } from "./FormInputValidation";

const { Text } = Typography;

type FormInputProps = Omit<InputProps, "addonAfter"> & {
  name: string;
  label?: string | "";
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  max?: number;
  type?: string;
  addonAfter?: React.ReactNode;
  useModalMessage?: boolean;
  onSearch?: SearchProps["onSearch"];
  mode?: "view" | "edit";
  emptyText?: string;
  onPopupOpen?: (searchValue: string) => void; // 팝업 열기 콜백 (type="search"일 때 사용)
  showReadOnlyBoxName?: string; // readOnly 박스의 name (값이 있으면 활성화, 없으면 비활성화)
};

const FULL_WIDTH_STYLE: React.CSSProperties = { width: "100%" };

const FormInput: React.FC<FormInputProps> = ({
  name,
  label = "",
  rules,
  addonAfter: propAddonAfter,
  layout,
  max,
  type,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  width,
  ...rest
}) => {
  const isBusinessNumber = type === "businessNumber";
  const isPhoneNumber = type === "tel" || type === "phone";
  const isResidentNumber = type === "residentNumber";
  const isCorporateNumber = type === "corporateNumber";
  const isEmail = type === "email";

  const validationType: InputType | undefined = isResidentNumber
    ? "residentNumber"
    : isBusinessNumber
    ? "businessNumber"
    : isCorporateNumber
    ? "corporateNumber"
    : isEmail
    ? "email"
    : undefined;

  const validationError = useInputValidation(name, validationType, mode);
  const inputRef = React.useRef<InputRef>(null);
  const previousValidationErrorRef = React.useRef<string>("");
  const wasFocusedRef = React.useRef(false);
  const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const {
    onChange: restOnChange,
    suffix: restSuffix,
    ...restWithoutSuffix
  } = rest;

  React.useEffect(() => {
    if (validationError !== previousValidationErrorRef.current) {
      previousValidationErrorRef.current = validationError;

      // validationError가 변경될 때 포커스가 있으면 유지
      if (wasFocusedRef.current && inputRef.current?.input) {
        requestAnimationFrame(() => {
          const input = inputRef.current?.input;
          if (input && wasFocusedRef.current) {
            // 현재 포커스가 input에 있으면 유지, 없으면 다시 설정
            if (document.activeElement !== input) {
              input.focus();
            }
          }
        });
      }
    }
  }, [validationError]);

  const errorSuffix = React.useMemo(
    () =>
      validationError ? (
        <Tooltip title={validationError} placement="topRight">
          <CloseCircleOutlined style={{ color: "#ff4d4f", cursor: "help" }} />
        </Tooltip>
      ) : null,
    [validationError]
  );

  const suffix = React.useMemo(
    () =>
      restSuffix ? (
        <Space size={4}>
          {errorSuffix}
          {restSuffix}
        </Space>
      ) : (
        errorSuffix
      ),
    [errorSuffix, restSuffix]
  );

  const processedRules = React.useMemo(() => {
    if (!rules) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        return {
          ...rule,
          validator: (_: unknown, value: string | number | undefined) => {
            if (!value || (typeof value === "string" && value.trim() === "")) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 입력해주세요.`;

              if (useModalMessage && canShowModal()) {
                MessageModal.error({
                  title: "입력 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 입력 필드로 포커스 이동
                    setTimeout(() => {
                      inputRef.current?.input?.focus();
                    }, 500);
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            return Promise.resolve();
          },
        } as Rule;
      }

      return rule;
    });
  }, [rules, label, useModalMessage]);

  const handleFocus = React.useCallback(() => {
    wasFocusedRef.current = true;
  }, []);

  const handleBlur = React.useCallback(() => {
    // 이전 timeout이 있으면 정리
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = setTimeout(() => {
      if (document.activeElement !== inputRef.current?.input) {
        wasFocusedRef.current = false;
      }
      blurTimeoutRef.current = null;
    }, 100);
  }, []);

  // 컴포넌트 언마운트 시 timeout 정리
  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digitsOnly = getDigitsOnly(e.target.value);
      const maxLength = isBusinessNumber
        ? 10
        : isResidentNumber || isCorporateNumber
        ? 13
        : isPhoneNumber
        ? 11
        : undefined;

      if (maxLength && digitsOnly.length > maxLength) {
        return;
      }

      restOnChange?.(e);
    },
    [
      isBusinessNumber,
      isResidentNumber,
      isCorporateNumber,
      isPhoneNumber,
      restOnChange,
    ]
  );

  const getValueFromEvent = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const digitsOnly = getDigitsOnly(value);

      if (isBusinessNumber) {
        return formatBusinessNumber(digitsOnly);
      }
      if (isResidentNumber) {
        return formatResidentNumber(digitsOnly);
      }
      if (isCorporateNumber) {
        return formatCorporateNumber(digitsOnly);
      }
      if (isPhoneNumber) {
        return formatPhoneNumber(digitsOnly);
      }
      return value;
    },
    [isBusinessNumber, isResidentNumber, isCorporateNumber, isPhoneNumber]
  );

  if (mode === "view" && type !== "number" && type !== "search") {
    return (
      <Form.Item name={name} colon={false} noStyle>
        <Form.Item
          shouldUpdate={(prev, curr) => prev[name] !== curr[name]}
          noStyle
        >
          {({ getFieldValue }) => {
            const value = getFieldValue(name);
            const displayValue =
              value !== undefined && value !== null && value !== ""
                ? String(value)
                : emptyText;
            return <Text>{displayValue}</Text>;
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  if (type === "number") {
    const {
      placeholder,
      disabled,
      readOnly,
      className,
      style,
      id,
      autoFocus,
      min,
      step,
    } = rest;
    return (
      <FormInputNumber
        name={name}
        label={label}
        rules={rules}
        layout={layout}
        max={max}
        addonAfter={propAddonAfter}
        useModalMessage={useModalMessage}
        mode={mode}
        emptyText={emptyText}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
        style={style}
        id={id}
        autoFocus={autoFocus}
        min={min}
        step={step}
      />
    );
  }

  if (type === "search") {
    // FormSearchInput이 Form.Item과 addonAfter 처리를 포함하므로 직접 반환
    return (
      <FormSearchInput
        name={name}
        label={label}
        rules={processedRules}
        layout={layout}
        useModalMessage={useModalMessage}
        addonAfter={propAddonAfter}
        showReadOnlyBoxName={rest.showReadOnlyBoxName}
        style={
          rest.showReadOnlyBoxName !== undefined
            ? { width: width, paddingRight: 10 }
            : undefined
        }
        onPopupOpen={rest.onPopupOpen}
        {...rest}
      />
    );
  }

  const hasMaxLength =
    max &&
    max > 0 &&
    !isBusinessNumber &&
    !isPhoneNumber &&
    !isResidentNumber &&
    !isCorporateNumber;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { value: _, ...inputPropsWithoutValue } = restWithoutSuffix;

  const inputProps: Omit<InputProps, "addonAfter" | "value"> = {
    ...inputPropsWithoutValue,
    type:
      isBusinessNumber || isPhoneNumber || isResidentNumber || isCorporateNumber
        ? "text"
        : type,
    maxLength: isBusinessNumber
      ? 12
      : isResidentNumber
      ? 14
      : isCorporateNumber
      ? 14
      : isPhoneNumber
      ? 13
      : restWithoutSuffix.maxLength,
    onChange: handleInputChange,
    onFocus: (e) => {
      handleFocus();
      restWithoutSuffix.onFocus?.(e);
    },
    onBlur: (e) => {
      handleBlur();
      restWithoutSuffix.onBlur?.(e);
    },
    suffix,
    status: validationError ? "error" : restWithoutSuffix.status,
    ...(hasMaxLength && {
      count: {
        show: true,
        max,
        strategy: (txt) => runes(txt).length,
        exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join(""),
      },
    }),
  };

  const inputElement = <InputStyles {...inputProps} ref={inputRef} />;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={processedRules}
      layout={layout as FormItemLayout}
      colon={false}
      {...(isBusinessNumber ||
      isPhoneNumber ||
      isResidentNumber ||
      isCorporateNumber
        ? {
            getValueFromEvent,
          }
        : {})}
      {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
      validateStatus={validationError ? "error" : ""}
      help=""
      hasFeedback={false}
      style={{ marginBottom: 0 }}
    >
      {propAddonAfter ? (
        <Space.Compact style={FULL_WIDTH_STYLE}>
          {inputElement}
          <span style={addonAfterStyle}>{propAddonAfter}</span>
        </Space.Compact>
      ) : (
        inputElement
      )}
    </Form.Item>
  );
};

export default FormInput;
