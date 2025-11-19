/**
 * 값이 비어있는지 (null, undefined, '') 확인합니다.
 * @param value 확인할 값
 * @returns 비어있으면 true, 아니면 false
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === "";
};

/**
 * 문자열의 첫 글자를 대문자로 변환합니다.
 * @param str 변환할 문자열
 * @returns 첫 글자가 대문자로 변환된 문자열
 */
export const capitalize = (str: string): string => {
  if (isEmpty(str)) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 숫자에 3자리마다 콤마를 추가하여 포맷팅합니다.
 * @param num 포맷팅할 숫자 또는 숫자형 문자열
 * @returns 콤마가 추가된 문자열 (예: 1000 -> "1,000")
 */
export const formatNumberWithCommas = (num: number | string): string => {
  const numberValue = Number(num);
  if (isNaN(numberValue)) return String(num); // 숫자가 아니면 그대로 반환
  return numberValue.toLocaleString();
};

/**
 * 문자열이 최대 길이를 초과하면 자르고 "..."을 붙입니다.
 * @param str 자를 문자열
 * @param maxLength 최대 길이
 * @returns 변환된 문자열
 */
export const truncate = (str: string, maxLength: number): string => {
  if (isEmpty(str) || str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
};

/**
 * camelCase 문자열을 snake_case로 변환합니다.
 * @param str camelCase 문자열
 * @returns snake_case 문자열
 */
export const camelToSnake = (str: string): string => {
  if (isEmpty(str)) return "";
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * snake_case 문자열을 camelCase로 변환합니다.
 * @param str snake_case 문자열
 * @returns camelCase 문자열
 */
export const snakeToCamel = (str: string): string => {
  if (isEmpty(str)) return "";
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * 문자열에서 숫자만 추출합니다.
 * @param str 원본 문자열
 * @returns 숫자만 포함된 문자열
 */
export const getDigitsOnly = (str: string): string => {
  if (isEmpty(str)) return "";
  return str.replace(/\D/g, "");
};

/**
 * 한국 휴대폰 번호 형식으로 자동 하이픈을 추가합니다.
 * 01012345678 -> 010-1234-5678
 * @param phone 휴대폰 번호 문자열
 * @returns 하이픈이 추가된 번호
 */
export const formatPhoneNumber = (phone: string): string => {
  if (isEmpty(phone)) return "";
  const digitsOnly = getDigitsOnly(phone);

  if (digitsOnly.length === 11) {
    return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (digitsOnly.length === 10) {
    // 서울 지역번호 등
    return digitsOnly.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  }
  // 그 외의 경우는 그대로 반환
  return phone;
};

/**
 * 간단한 이메일 형식 유효성을 검사합니다. (정규식 기반)
 * @param email 검사할 이메일 문자열
 * @returns 유효하면 true, 아니면 false
 */
export const isValidEmail = (email: string): boolean => {
  if (isEmpty(email)) return false;
  // 간단한 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
