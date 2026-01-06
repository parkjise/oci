/**
 * 거래처등록 화면에서 사용하는 Select 옵션 상수
 * TODO: 추후 DB 조회로 변경 예정
 */

/**
 * Select 옵션 타입 정의
 */
export type SelectOption = {
  value: string;
  label: string;
};

// 거래처구분 옵션 (dlt_resCustomerCode)
export const CUSTNO_GB_OPTIONS: SelectOption[] = [
  { value: "C", label: "매출+매입" },
  { value: "B", label: "매입" },
  { value: "A", label: "매출" },
] as SelectOption[];

// 주거래사업장 옵션 (dlt_resAllOrgId)
export const ORG_ID_OPTIONS: SelectOption[] = [
  { value: "HO", label: "본사" },
  { value: "%", label: "전체" },
] as SelectOption[];

// 타입 정의 (옵션 값 타입 추출)
export type CustnoGbValue = "A" | "B" | "C" | "";
export type OrgIdValue = "HO" | "%" | "";

// 신용도 옵션
export const CREDIT_OPTIONS: SelectOption[] = [
  { value: "1", label: "High" },
  { value: "2", label: "Middle" },
  { value: "3", label: "Low" },
] as SelectOption[];

// 지급조건 옵션 (기본값, 실제로는 API에서 가져옴)
export const STLM_TERM_OPTIONS: SelectOption[] = [];

// 수금조건 옵션 (기본값, 실제로는 API에서 가져옴)
export const STLM_TERM_AR_OPTIONS: SelectOption[] = [];
