import { useState, useEffect } from "react";
import { Form } from "antd";
import { getDigitsOnly, isValidEmail } from "@/utils/stringUtils";

export type InputType =
  | "residentNumber"
  | "businessNumber"
  | "corporateNumber"
  | "email";

/**
 * 13자리 체크섬 검증 (주민번호, 법인번호 공통)
 */
const validate13DigitChecksum = (digits: string): boolean => {
  if (digits.length !== 13) return false;

  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === parseInt(digits[12]);
};

export const validateResidentNumber = (value: string): string => {
  if (!value) return "";
  const digitsOnly = getDigitsOnly(value);
  if (digitsOnly.length === 0) return "";
  if (digitsOnly.length !== 13) {
    return "주민번호는 13자리 숫자여야 합니다.";
  }
  if (!validate13DigitChecksum(digitsOnly)) {
    return "올바른 주민번호 형식이 아닙니다.";
  }
  return "";
};

/**
 * 사업자번호 체크섬 검증
 */
const validateBusinessNumberChecksum = (digits: string): boolean => {
  if (digits.length !== 10) return false;

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }

  sum += Math.floor((parseInt(digits[8]) * 5) / 10);
  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === parseInt(digits[9]);
};

export const validateBusinessNumber = (value: string): string => {
  if (!value) return "";
  const digitsOnly = getDigitsOnly(value);
  if (digitsOnly.length === 0) return "";
  if (digitsOnly.length !== 10) {
    return "사업자번호는 10자리 숫자여야 합니다.";
  }
  if (!validateBusinessNumberChecksum(digitsOnly)) {
    return "올바른 사업자번호 형식이 아닙니다.";
  }
  return "";
};


export const validateCorporateNumber = (value: string): string => {
  if (!value) return "";
  const digitsOnly = getDigitsOnly(value);
  if (digitsOnly.length === 0) return "";
  if (digitsOnly.length !== 13) {
    return "법인번호는 13자리 숫자여야 합니다.";
  }
  if (!validate13DigitChecksum(digitsOnly)) {
    return "올바른 법인번호 형식이 아닙니다.";
  }
  return "";
};

export const validateEmail = (value: string): string => {
  if (!value) return "";
  
  // 공백 제거 후 검증
  const trimmedValue = value.trim();
  if (trimmedValue !== value) {
    return "이메일에는 앞뒤 공백을 사용할 수 없습니다.";
  }
  
  if (!isValidEmail(trimmedValue)) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  return "";
};

export const getValidator = (
  type: InputType
): ((value: string) => string) | null => {
  switch (type) {
    case "residentNumber":
      return validateResidentNumber;
    case "businessNumber":
      return validateBusinessNumber;
    case "corporateNumber":
      return validateCorporateNumber;
    case "email":
      return validateEmail;
    default:
      return null;
  }
};
export const useInputValidation = (
  name: string,
  type: InputType | undefined,
  mode: "view" | "edit"
): string => {
  const form = Form.useFormInstance();
  const inputValue = Form.useWatch(name, form);
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (mode === "view") {
      setValidationError("");
      return;
    }

    if (!type || !inputValue) {
      setValidationError("");
      return;
    }

    const validator = getValidator(type);
    if (!validator) {
      setValidationError("");
      return;
    }

    const error = validator(inputValue);
    setValidationError(error);
  }, [inputValue, type, mode]);

  return validationError;
};
