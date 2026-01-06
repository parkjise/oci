// ============================================================================
// 메뉴관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post, del } from "@apis/common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";

// ============================================================================
// Types
// ============================================================================
export interface MenuDto {
  lvl?: number;
  systemId?: string;
  pgmNo?: string;
  parentPgmNo?: string;
  pgmType?: string;
  windowId?: string;
  pgmName?: string;
  sort?: number;
  useMenu?: string;
  useYn?: string;
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  hidden?: string;
  exUserUseYn?: string;
  initParam?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  logYn?: string;
  helpUrl?: string;
  path?: string;
  lKey?: string;
  oldWindowId?: string;
  programId?: string;
  terminalId?: string;
  rowStatus?: string;
}

export interface MenuButtonDto {
  systemId?: string;
  pgmNo?: string;
  objId?: string;
  objType?: string;
  useYn?: string;
  objName?: string;
  visibleYn?: string;
  rowStatus?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  programId?: string;
  terminalId?: string;
}

export interface MenuSaveRequest {
  menu: MenuDto;
  buttons?: MenuButtonDto[];
}

export interface MenuSaveResponse {
  pgmNo?: string;
  parentPgmNo?: string;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 메뉴 리스트 조회
 */
export const getMenuListApi = async (): Promise<ApiResponse<MenuDto[]>> => {
  return get<MenuDto[]>("/system/pgm/access/menu");
};

/**
 * 메뉴 버튼 리스트 조회
 */
export const getMenuButtonListApi = async (
  pgmNo: string
): Promise<ApiResponse<MenuButtonDto[]>> => {
  return get<MenuButtonDto[]>(`/system/pgm/access/menu/${pgmNo}/buttons`);
};

/**
 * 메뉴 저장 (등록/수정)
 */
export const saveMenuApi = async (
  request: MenuSaveRequest
): Promise<ApiResponse<MenuSaveResponse>> => {
  return post<MenuSaveResponse>("/system/pgm/access/menu", request);
};

/**
 * 메뉴 추가
 */
export const insertMenuApi = async (
  menu: MenuDto
): Promise<ApiResponse<MenuSaveResponse>> => {
  return post<MenuSaveResponse>("/system/pgm/access/menu/insert", menu);
};

/**
 * 메뉴 삭제
 */
export const deleteMenuApi = async (
  pgmNo: string
): Promise<ApiResponse<MenuSaveResponse>> => {
  return del<MenuSaveResponse>(`/system/pgm/access/menu/${pgmNo}`);
};
