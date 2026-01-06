import type { ColDef, ICellRendererParams, SuppressKeyboardEventParams } from "ag-grid-community";
import { CheckboxCellRenderer } from "../cells/CheckboxCellRenderer";
import { toFieldType } from "./utils";

/**
 * 체크박스 컬럼 옵션
 */
interface CheckboxColumnOptions<TData extends Record<string, unknown>> {
  /** 컬럼 너비 (기본값: 100) */
  width?: number;
  /** 편집 가능 여부 (기본값: false, rowSelection 모드에서는 무시됨) */
  editable?: boolean;
  /** 체크박스 변경 핸들러 (rowSelection 모드에서는 사용되지 않음) */
  onValueChange?: (
    checked: boolean,
    params: ICellRendererParams<TData>
  ) => void;
  /** 필터 가능 여부 (기본값: true) */
  filter?: boolean;
  /** 행 선택 모드 여부 (기본값: false) - true면 AG-Grid의 기본 행 선택 체크박스 사용 */
  rowSelection?: boolean;
  /** 컬럼 고정 위치 (rowSelection 모드에서 사용) */
  pinned?: "left" | "right";
  /** 헤더 체크박스 선택 여부 (rowSelection 모드에서 사용, 기본값: true) */
  headerCheckboxSelection?: boolean;
}

/**
 * 체크박스 컬럼 정의 생성 헬퍼 (통합 버전)
 *
 * 두 가지 모드를 지원합니다:
 * 1. 데이터 체크박스 모드 (기본값): Y/N 값을 체크박스로 표시하고 클릭으로 토글
 * 2. 행 선택 모드 (rowSelection: true): AG-Grid의 기본 행 선택 체크박스 사용
 *
 * @param headerName - 컬럼 헤더명
 * @param field - 데이터 필드명
 * @param options - 컬럼 옵션
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * // 데이터 체크박스 모드 (기본)
 * const columnDefs = [
 *   createCheckboxColumn<MyData>(
 *     "활성화",
 *     "isActive",
 *     {
 *       width: 100,
 *       onValueChange: (checked, params) => {
 *         console.log("체크박스 변경:", checked, params.data);
 *       }
 *     }
 *   )
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // 행 선택 모드
 * const columnDefs = [
 *   createCheckboxColumn<MyData>(
 *     "ID",
 *     "id",
 *     {
 *       width: 80,
 *       rowSelection: true,
 *       pinned: "left",
 *       headerCheckboxSelection: true
 *     }
 *   )
 * ];
 * ```
 */
export const createCheckboxColumn = <TData extends Record<string, unknown>>(
  headerName: string,
  field: keyof TData,
  options?: CheckboxColumnOptions<TData>
): ColDef<TData> => {
  const {
    width = 100,
    editable = false,
    onValueChange,
    filter = true,
    rowSelection = false,
    pinned,
    headerCheckboxSelection = true,
  } = options || {};
  const fieldName = String(field);

  // 행 선택 모드
  if (rowSelection) {
    return {
      headerName,
      field: toFieldType(fieldName),
      width,
      pinned,
      checkboxSelection: true,
      headerCheckboxSelection,
      editable: false,
    };
  }

  // 데이터 체크박스 모드 (기본)
  return {
    headerName,
    field: toFieldType(fieldName),
    width,
    // 컬럼 자체는 편집 불가로 설정하여 더블 클릭 시 에디터 진입 방지
    // (체크박스 토글은 렌더러 내에서 처리함)
    editable: false,
    cellRenderer: CheckboxCellRenderer,
    cellRendererParams: {
      // Y/N 변환 활성화 (기본값)
      convertYN: true,
      // 커스텀 변경 핸들러 전달
      ...(onValueChange && {
        onValueChange: (
          checked: boolean,
          params: ICellRendererParams<TData>
        ) => {
          onValueChange(checked, params);
        },
      }),
      // 체크박스 클릭 가능 여부는 렌더러에 별도로 전달
      editable,
    },
    // 더블 클릭 시의 기본 동작 방지
    onCellDoubleClicked: (params) => {
      params.event?.preventDefault();
      params.event?.stopPropagation();
    },
    // 키보드 엔터 입력 시 토글 처리
    suppressKeyboardEvent: (params: SuppressKeyboardEventParams<TData>) => {
      const { node, api, column, data } = params;
      const event = params.event as KeyboardEvent;
      if (!event) return false;

      if (event.code === "Enter") {
        if (data && column && node && api && editable) {
          const field = column.getColId();
          const originFieldValue: unknown = data[field];
          const originBooleanValue: boolean = (() => {
            return originFieldValue === 'Y' || originFieldValue === true;
          })();
          const newBooleanValue: boolean = !originBooleanValue;
          const newFieldValue = (() => {
            if (typeof originFieldValue === 'boolean') {
              return newBooleanValue;
            }
            return originFieldValue === 'Y' ? 'N' : 'Y';
          })();
          node.setDataValue(field, newFieldValue);

          // 커스텀 핸들러가 있으면 실행 (데이터 업데이트 후)
          if (onValueChange) {
            onValueChange(newBooleanValue, params as unknown as ICellRendererParams<TData>);
          }

          event.preventDefault();
          return true;
        }
      }
      return false;
    },
    cellClass: "ag-checkbox-cell-center",
    headerClass: "ag-header-cell-center",
    filter,
  };
};
