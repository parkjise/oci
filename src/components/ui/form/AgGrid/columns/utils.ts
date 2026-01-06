import type { ColDef } from "ag-grid-community";

/**
 * AG-Grid ColDef의 field 타입 캐스팅 헬퍼
 *
 * AG-Grid의 ColDef 타입이 엄격하여 field를 any로 캐스팅해야 하는 경우가 있습니다.
 * 이 함수는 타입 캐스팅을 일관되게 처리합니다.
 *
 * @param field - 컬럼 필드명
 * @returns 타입 캐스팅된 field 값
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toFieldType = (field: string | number | keyof unknown): any => {
  return field as any;
};

/**
 * 기본 ColDef 옵션
 */
export interface BaseColumnOptions {
  /** 컬럼 필드명 */
  field: string;
  /** 헤더명 */
  headerName: string;
  /** 컬럼 너비 */
  width?: number;
  /** 편집 가능 여부 */
  editable?: boolean;
}

/**
 * 기본 ColDef 생성 헬퍼
 *
 * 모든 컬럼 타입에서 공통으로 사용되는 기본 ColDef 구조를 생성합니다.
 *
 * @param options - 기본 컬럼 옵션
 * @returns 기본 ColDef 객체
 */
export const createBaseColumnDef = <TData = unknown>(
  options: BaseColumnOptions
): Partial<ColDef<TData>> => {
  const { field, headerName, width, editable } = options;

  return {
    field: toFieldType(field),
    headerName,
    width,
    editable,
  };
};
