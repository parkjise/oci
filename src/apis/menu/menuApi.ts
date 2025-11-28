// ============================================================================
// 메뉴 관련 API
// ============================================================================
import { get } from "../common/api";
import type { ApiResponse } from "@/types/axios.types";
import type { MenuButton } from "@/types/menuButton.type";

/**
 * 메뉴 버튼 목록 조회 API
 * @param pgmNo - 프로그램 번호
 * @returns 메뉴 버튼 목록
 * @remarks
 * - GET 방식으로 /system/pgm/access/menu/{pgmNo}/buttons 엔드포인트에 요청합니다.
 * - 인증 토큰이 필요합니다.
 */
export const getMenuButtonsApi = async (
  pgmNo: string
): Promise<ApiResponse<MenuButton[]>> => {
  return get<MenuButton[]>(`/system/pgm/access/menu/${pgmNo}/buttons`);
};
