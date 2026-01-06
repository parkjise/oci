import type { ValueFormatterParams } from "ag-grid-community";
import dayjs from "dayjs";
import { getCodeDetailApi, type CodeDetailParams } from "@apis/com/code";

/**
 * 통화 포맷터 (원화)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 통화 문자열 (₩1,000) 또는 빈 문자열
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "amount",
 *   valueFormatter: formatCurrency,
 * };
 * ```
 */
export const formatCurrency = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return `₩${params.value.toLocaleString()}`;
  }
  return "";
};

/**
 * 통화 포맷터 (원)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 통화 문자열 (1,000원) 또는 빈 문자열
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "amount",
 *   valueFormatter: formatCurrencyWon,
 * };
 * ```
 */
export const formatCurrencyWon = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return `${params.value.toLocaleString()}원`;
  }
  return "";
};

/**
 * 날짜 포맷터 (한국어 형식)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 날짜 문자열 (YYYY. M. D.) 또는 빈 문자열
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "date",
 *   valueFormatter: formatDateKorean,
 * };
 * ```
 */
export const formatDateKorean = (params: ValueFormatterParams): string => {
  if (!params.value) return "";

  if (params.value instanceof Date) {
    return params.value.toLocaleDateString("ko-KR");
  }

  if (typeof params.value === "string") {
    return dayjs(params.value).format("YYYY. M. D.");
  }

  return "";
};

/**
 * 숫자 포맷터 (천 단위 구분)
 *
 * @param params - ValueFormatterParams
 * @returns 포맷된 숫자 문자열 (1,000) 또는 빈 문자열
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "count",
 *   valueFormatter: formatNumber,
 * };
 * ```
 */
export const formatNumber = (params: ValueFormatterParams): string => {
  if (typeof params.value === "number") {
    return params.value.toLocaleString();
  }
  return "";
};

/**
 * 옵션 배열을 기반으로 valueFormatter 생성
 *
 * 코드(value)를 라벨(label)로 변환하여 표시합니다.
 *
 * @param options - 옵션 배열 { value: string; label: string }[]
 * @param emptyLabel - 빈 값일 때 표시할 라벨 (기본값: "전체")
 * @returns valueFormatter 함수
 *
 * @example
 * ```typescript
 * const bankOptions = [
 *   { value: "001", label: "KB국민은행" },
 *   { value: "002", label: "신한은행" },
 * ];
 *
 * const columnDef = {
 *   field: "bankName",
 *   valueFormatter: createValueFormatter(bankOptions, "전체"),
 * };
 * ```
 */
export const createValueFormatter = <TData = unknown>(
  options: { value: string; label: string }[],
  emptyLabel?: string
) => {
  return (params: ValueFormatterParams<TData, string>): string => {
    const val =
      params.value === undefined || params.value === null
        ? ""
        : String(params.value);
    if (val === "") return emptyLabel || "";
    const option = options.find(
      (opt: { value: string; label: string }) => opt.value === val
    );
    return option ? option.label : val;
  };
};

/**
 * cellEditorParams의 comCodeParams를 자동으로 사용하는 valueFormatter 생성
 * cellEditorParams에 comCodeParams가 있으면 자동으로 사용하여 API로부터 데이터를 가져옵니다.
 *
 * 주의: valueFormatter는 동기 함수이므로, 캐시된 데이터를 사용합니다.
 * ComboBoxCellEditor가 이미 같은 API를 호출했다면 캐시에서 데이터를 가져옵니다.
 *
 * @param emptyLabel - 빈 값일 때 표시할 라벨 (기본값: "전체")
 * @returns valueFormatter 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "bankName",
 *   cellEditor: ComboBoxCellEditor,
 *   cellEditorParams: {
 *     comCodeParams: {
 *       module: "GL",
 *       type: "BNKCDE",
 *       enabledFlag: "Y",
 *     },
 *   },
 *   valueFormatter: createComCodeFormatter("전체"),
 * };
 * ```
 */
export const createComCodeFormatter = <TData = unknown>(
  emptyLabel?: string
) => {
  // 옵션 캐시 (모듈 레벨에서 공유)
  const optionsCache = new Map<string, { value: string; label: string }[]>();

  return (params: ValueFormatterParams<TData, string>): string => {
    const val =
      params.value === undefined || params.value === null
        ? ""
        : String(params.value);
    if (val === "") return emptyLabel || "";

    // cellEditorParams에서 comCodeParams 가져오기
    const colDef = params.column.getColDef();
    const cellEditorParams = colDef.cellEditorParams as
      | {
          comCodeParams?: CodeDetailParams;
        }
      | undefined;

    if (!cellEditorParams?.comCodeParams) {
      // comCodeParams가 없으면 원본 값 반환
      return val;
    }

    const comCodeParams = cellEditorParams.comCodeParams;
    const cacheKey = JSON.stringify(comCodeParams);

    // 캐시에 없으면 백그라운드에서 로드
    if (!optionsCache.has(cacheKey)) {
      getCodeDetailApi(comCodeParams)
        .then((response) => {
          if (response.success && Array.isArray(response.data)) {
            const options = response.data.map((item) => ({
              value: String(item.code || ""),
              label: item.name1 || "",
            }));
            optionsCache.set(cacheKey, options);
            // 데이터 로드 후 해당 셀만 새로고침
            if (params.api && params.node && params.column) {
              params.api.refreshCells({
                rowNodes: [params.node],
                columns: [params.column.getColId()],
                force: true,
              });
            }
          }
        })
        .catch((error) => {
          console.error("Failed to fetch code options for formatter:", error);
        });
    }

    const cachedOptions = optionsCache.get(cacheKey);

    if (!cachedOptions) {
      // 캐시가 없으면 원본 값 반환 (데이터 로딩 중)
      return val;
    }

    const option = cachedOptions.find(
      (opt: { value: string; label: string }) => opt.value === val
    );
    return option ? option.label : val;
  };
};
