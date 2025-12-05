// ============================================================================
// 사업장 관리 API
// ============================================================================
// 변경이력:
// - 2025.12.04 : ckkim (최초작성)

import { get } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 사업장 DTO
 */
export interface WorkplaceDto {
  officeId?: string; // OFFICE_ID
  orgId?: string; // ORG_ID
  orgNme?: string; // ORG_NME
  orgEngNme?: string; // ORG_ENG_NME
  enabledFlag?: string; // 사용여부
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 사업장 목록 조회
 */
export const getWorkplaceListApi = async (
  officeId?: string
): Promise<ApiResponse<WorkplaceDto[]>> => {
  return get<WorkplaceDto[]>("/system/org/workplace", {
    params: {
      officeId,
    },
  });
};

