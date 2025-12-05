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
 * 숫자 문자열에서 콤마를 제거합니다.
 * @param value 숫자 문자열 (예: "1,000" -> "1000")
 * @returns 콤마가 제거된 문자열
 */
export const removeCommasFromNumber = (value: string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return value.replace(/,/g, "").trim();
};

/**
 * 숫자 값을 정규화합니다. (Form.Item의 normalize에 사용)
 * 숫자형이면 그대로 반환하고, 문자열이면 콤마 제거 후 숫자로 변환합니다.
 * @param value 숫자 또는 숫자형 문자열
 * @returns 정규화된 숫자 값, 변환 불가능하면 undefined
 */
export const normalizeNumberValue = (
  value: number | string | undefined
): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;

  // 이미 숫자인 경우 그대로 반환
  if (typeof value === "number") {
    return isNaN(value) ? undefined : value;
  }

  // 문자열인 경우 콤마 제거 후 숫자로 변환
  if (typeof value === "string") {
    const cleaned = removeCommasFromNumber(value);
    if (cleaned === "") return undefined;
    const numValue = Number(cleaned);
    return isNaN(numValue) ? undefined : numValue;
  }

  return undefined;
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
 * 한국 전화번호 형식으로 자동 하이픈을 추가합니다.
 * 01012345678 -> 010-1234-5678
 * 0212345678 -> 02-1234-5678
 * 15881234 -> 1588-1234
 * @param phone 전화번호 문자열
 * @returns 하이픈이 추가된 번호
 */
export const formatPhoneNumber = (phone: string): string => {
  if (isEmpty(phone)) return "";
  const digitsOnly = getDigitsOnly(phone);

  // 휴대폰 번호 (11자리): 010-1234-5678
  if (digitsOnly.length === 11 && digitsOnly.startsWith("010")) {
    return digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  // 휴대폰 번호 (10자리 구형): 010-123-4567
  if (digitsOnly.length === 10 && digitsOnly.startsWith("010")) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  // 서울 지역번호 (10자리): 02-1234-5678
  if (digitsOnly.length === 10 && digitsOnly.startsWith("02")) {
    return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  // 기타 지역번호 (10자리): 031-123-4567, 051-123-4567 등
  if (digitsOnly.length === 10) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  // 1588, 1544 등 (8자리): 1588-1234
  if (digitsOnly.length === 8) {
    return digitsOnly.replace(/(\d{4})(\d{4})/, "$1-$2");
  }

  // 입력 중인 경우 (11자리 미만) - 부분 포맷팅
  if (digitsOnly.length < 11 && digitsOnly.length > 0) {
    // 3자리 이상이면 부분 포맷팅 시도
    if (digitsOnly.length >= 3) {
      // 휴대폰 번호 시작 (010)
      if (digitsOnly.startsWith("010")) {
        if (digitsOnly.length <= 3) {
          return digitsOnly;
        } else if (digitsOnly.length <= 7) {
          return digitsOnly.replace(/(\d{3})(\d+)/, "$1-$2");
        } else {
          return digitsOnly.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
        }
      }
      // 서울 지역번호 시작 (02)
      else if (digitsOnly.startsWith("02")) {
        if (digitsOnly.length <= 2) {
          return digitsOnly;
        } else if (digitsOnly.length <= 6) {
          return digitsOnly.replace(/(\d{2})(\d+)/, "$1-$2");
        } else {
          return digitsOnly.replace(/(\d{2})(\d{4})(\d+)/, "$1-$2-$3");
        }
      }
      // 기타 지역번호
      else if (digitsOnly.length >= 3) {
        if (digitsOnly.length <= 3) {
          return digitsOnly;
        } else if (digitsOnly.length <= 6) {
          return digitsOnly.replace(/(\d{3})(\d+)/, "$1-$2");
        } else {
          return digitsOnly.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
        }
      }
    }
    return digitsOnly;
  }

  // 11자리 초과 시 11자리까지만 사용
  if (digitsOnly.length > 11) {
    const trimmed = digitsOnly.slice(0, 11);
    if (trimmed.startsWith("010")) {
      return trimmed.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
  }

  // 그 외의 경우는 그대로 반환
  return digitsOnly;
};

/**
 * 한국 사업자 번호 형식으로 자동 하이픈을 추가합니다.
 * 1234567890 -> 123-45-67890
 * @param businessNumber 사업자 번호 문자열
 * @returns 하이픈이 추가된 번호
 */
export const formatBusinessNumber = (businessNumber: string): string => {
  if (isEmpty(businessNumber)) return "";
  const digitsOnly = getDigitsOnly(businessNumber);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }
  if (digitsOnly.length <= 5) {
    return digitsOnly.replace(/(\d{3})(\d{1,2})/, "$1-$2");
  }
  if (digitsOnly.length <= 10) {
    return digitsOnly.replace(/(\d{3})(\d{2})(\d{1,5})/, "$1-$2-$3");
  }
  // 10자리 초과 시 10자리까지만 사용
  return digitsOnly.slice(0, 10).replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
};

/**
 * 한국 주민번호 형식으로 자동 하이픈을 추가합니다.
 * 1234561234567 -> 123456-1234567
 * @param residentNumber 주민번호 문자열
 * @returns 하이픈이 추가된 번호
 */
export const formatResidentNumber = (residentNumber: string): string => {
  if (isEmpty(residentNumber)) return "";
  const digitsOnly = getDigitsOnly(residentNumber);

  if (digitsOnly.length <= 6) {
    return digitsOnly;
  }
  if (digitsOnly.length <= 13) {
    return digitsOnly.replace(/(\d{6})(\d{1,7})/, "$1-$2");
  }
  // 13자리 초과 시 13자리까지만 사용
  return digitsOnly.slice(0, 13).replace(/(\d{6})(\d{7})/, "$1-$2");
};

/**
 * 한국 법인번호 형식으로 자동 하이픈을 추가합니다.
 * 1234567890123 -> 123456-7890123
 * @param corporateNumber 법인번호 문자열
 * @returns 하이픈이 추가된 번호
 */
export const formatCorporateNumber = (corporateNumber: string): string => {
  if (isEmpty(corporateNumber)) return "";
  const digitsOnly = getDigitsOnly(corporateNumber);

  if (digitsOnly.length <= 6) {
    return digitsOnly;
  }
  if (digitsOnly.length <= 13) {
    return digitsOnly.replace(/(\d{6})(\d{1,7})/, "$1-$2");
  }
  // 13자리 초과 시 13자리까지만 사용
  return digitsOnly.slice(0, 13).replace(/(\d{6})(\d{7})/, "$1-$2");
};

/**
 * 이메일 형식 유효성을 검사합니다. (정규식 기반)
 * @param email 검사할 이메일 문자열
 * @returns 유효하면 true, 아니면 false
 */
export const isValidEmail = (email: string): boolean => {
  if (isEmpty(email)) return false;
  
  // 공백 제거 후 검증
  const trimmedEmail = email.trim();
  if (trimmedEmail !== email) return false; // 앞뒤 공백이 있으면 유효하지 않음
  
  // 더 정확한 이메일 정규식
  // - 로컬 부분: 영문, 숫자, 특수문자(._+-) 허용
  // - @ 기호 필수
  // - 도메인 부분: 영문, 숫자, 하이픈, 점 허용
  // - 최소 2자 이상의 TLD 필수
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // 추가 검증: 로컬 부분과 도메인 부분의 길이 제한
  const [localPart, domainPart] = trimmedEmail.split('@');
  if (!localPart || !domainPart) return false;
  
  // 로컬 부분: 1~64자 (RFC 5321)
  if (localPart.length === 0 || localPart.length > 64) return false;
  
  // 도메인 부분: 1~255자 (RFC 5321)
  if (domainPart.length === 0 || domainPart.length > 255) return false;
  
  // 연속된 점이나 하이픈 체크
  if (localPart.includes('..') || domainPart.includes('..')) return false;
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) return false;
  
  return emailRegex.test(trimmedEmail);
};
