// ============================================================================
// 공통코드 관련 API
// ============================================================================
import { get } from "../common/api";
import type { ApiResponse } from "@/types/axios.types";
import type { CodeDetail, CodeDetailParams } from "@/types/api.types";

// 타입 re-export (다른 파일에서 사용할 수 있도록)
export type { CodeDetail, CodeDetailParams };

/**
 * 코드 상세 조회 API
 * @param params - 코드 상세 조회 파라미터 (codeId, code 등)
 * @returns 코드 상세 정보
 * @remarks
 * - GET 방식으로 /system/pgm/code/detail 엔드포인트에 요청합니다.
 * - 인증 토큰이 필요합니다.
 */
export const getCodeDetailApi = async (
  params?: CodeDetailParams
): Promise<ApiResponse<CodeDetail>> => {
  return get<CodeDetail>("/system/pgm/code/detail", {
    params,
  });
};
