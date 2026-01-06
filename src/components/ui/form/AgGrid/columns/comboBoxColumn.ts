import type { ColDef } from "ag-grid-community";
import type { CodeDetailParams, CodeDetail } from "@apis/com/code";
import { ComboBoxCellEditor } from "../cells/ComboBoxCellEditor";
import { createComCodeFormatter, createValueFormatter } from "./formatters";

interface SelectOption {
  value?: string | number;
  label: string;
  code?: string | number;
}

interface ComboBoxColumnParams {
  /** 외부에서 제공하는 옵션 배열 */
  options?: SelectOption[];
  /** 공통코드 조회 파라미터 (options가 없을 때 사용) */
  comCodeParams?: CodeDetailParams;
  /** 값 필드 키 (기본값: "code") */
  valueKey?: keyof CodeDetail;
  /** 라벨 필드 키 (기본값: "name1") */
  labelKey?: keyof CodeDetail;
  /** 라벨에 코드 표시 여부 (기본값: false) */
  showCodeInLabel?: boolean;
  /** 캐시 무효화 여부 (기본값: false) */
  clearCacheBeforeFetch?: boolean;
  /** 맨 상단에 추가할 옵션 라벨 (예: "전체", "선택") */
  allOptionLabel?: string;
  /** 검색 기능 활성화 여부 (기본값: true) */
  showSearch?: boolean;
  /** valueFormatter를 사용하지 않을지 여부 (기본값: false) */
  disableFormatter?: boolean;
  /** 편집 가능 여부 (기본값: true) */
  editable?: boolean;
}

/**
 * 콤보 박스 편집 가능한 컬럼 생성
 *
 * @param field - 컬럼 필드명
 * @param headerName - 헤더명
 * @param params - 콤보 박스 설정 파라미터
 * @param width - 컬럼 너비 (선택사항)
 * @returns ColDef<TData>
 *
 * @example
 * ```typescript
 * // 외부 옵션 사용
 * createComboBoxColumn('status', '상태', {
 *   options: [
 *     { value: 'Y', label: '활성' },
 *     { value: 'N', label: '비활성' }
 *   ],
 *   allOptionLabel: '전체' // 선택사항
 * })
 * ```
 *
 * @example
 * ```typescript
 * // 공통코드 API 사용
 * createComboBoxColumn('codeType', '코드타입', {
 *   comCodeParams: {
 *     module: 'GL',
 *     type: 'CUSTYP'
 *   },
 *   allOptionLabel: '전체' // 선택사항
 * })
 * ```
 */
export const createComboBoxColumn = <TData = unknown>(
  field: string,
  headerName: string,
  params: ComboBoxColumnParams,
  width?: number
): ColDef<TData> => {
  const {
    options,
    comCodeParams,
    allOptionLabel,
    disableFormatter = false,
    editable = true,
    ...restParams
  } = params;

  const columnDef: ColDef<TData> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: field as any,
    headerName,
    width,
    editable,
    cellEditor: ComboBoxCellEditor,
    cellEditorParams: {
      ...restParams,
      ...(options ? { options } : {}),
      ...(comCodeParams ? { comCodeParams } : {}),
      ...(allOptionLabel ? { allOptionLabel } : {}),
    },
    filter: "agSetColumnFilter",
  };

  // valueFormatter 자동 설정
  if (!disableFormatter) {
    if (comCodeParams) {
      // 공통코드 API 사용 시 createComCodeFormatter 사용
      // allOptionLabel이 명시적으로 전달된 경우에만 사용
      columnDef.valueFormatter = createComCodeFormatter<TData>(
        allOptionLabel || undefined
      );
    } else if (options && options.length > 0) {
      // 정적 옵션 사용 시 createValueFormatter 사용
      const formattedOptions = options.map((opt) => ({
        value: String(opt.value ?? opt.code ?? ""),
        label: opt.label,
      }));
      columnDef.valueFormatter = createValueFormatter<TData>(
        formattedOptions,
        allOptionLabel || undefined
      );
    }
  }

  return columnDef;
};
