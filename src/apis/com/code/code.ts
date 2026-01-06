// ============================================================================
// 공통코드 관련 API
// ============================================================================
import { get } from "../../common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type { CodeDetail, CodeDetailParams } from "@/types/com/api/api.types";

// 타입 re-export (다른 파일에서 사용할 수 있도록)
export type { CodeDetail, CodeDetailParams };

// --------------------------------------------------------------------------
// 캐시 관리
// --------------------------------------------------------------------------
// 메모리 캐시 Map (파라미터 조합을 키로 사용)
const codeCache = new Map<string, ApiResponse<CodeDetail>>();

/**
 * 파라미터를 캐시 키로 변환
 * @param params - 코드 상세 조회 파라미터
 * @returns 캐시 키 문자열
 * @remarks
 * - 속성을 정렬하여 일관된 키를 생성합니다.
 * - 속성 순서와 무관하게 같은 파라미터는 같은 키를 반환합니다.
 * - 빈 객체나 undefined는 모두 "default"로 처리합니다.
 */
const getCacheKey = (params?: CodeDetailParams): string => {
  if (!params || Object.keys(params).length === 0) {
    return "default";
  }

  // 속성을 정렬하여 일관된 키 생성
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key as keyof CodeDetailParams];
      // undefined 값을 가진 속성은 제외
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

  // 정렬 후에도 빈 객체가 되면 "default" 반환
  if (Object.keys(sortedParams).length === 0) {
    return "default";
  }

  return JSON.stringify(sortedParams);
};

/**
 * 코드 상세 조회 API
 * @param params - 코드 상세 조회 파라미터 (module, type, enabledFlag 등)
 * @returns 코드 상세 정보
 * @remarks
 * - GET 방식으로 /system/pgm/code/detail 엔드포인트에 요청합니다.
 * - 인증 토큰이 필요합니다.
 * - 같은 파라미터로 호출 시 캐시된 데이터를 반환합니다.
 */
export const getCodeDetailApi = async (
  params?: CodeDetailParams
): Promise<ApiResponse<CodeDetail>> => {
  const cacheKey = getCacheKey(params);

  // 캐시에 존재하면 캐시된 데이터 반환
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey)!;
  }

  // 캐시에 없으면 API 조회
  const response = await get<CodeDetail>("/system/pgm/code/detail", {
    params,
  });

  // 조회한 데이터를 캐시에 저장
  codeCache.set(cacheKey, response);

  return response;
};

/**
 * 캐시 무효화
 * @param params - 무효화할 캐시의 파라미터 (없으면 전체 캐시 무효화)
 * @example
 * ```typescript
 * // 특정 파라미터의 캐시만 무효화
 * clearCodeCache({ module: "GL", type: "CUSTYP" });
 *
 * // 전체 캐시 무효화
 * clearCodeCache();
 * ```
 */
export const clearCodeCache = (params?: CodeDetailParams): void => {
  if (params) {
    const cacheKey = getCacheKey(params);
    codeCache.delete(cacheKey);
  } else {
    codeCache.clear();
  }
};
