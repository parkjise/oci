// ============================================================================
// 권한관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post, del } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 권한 정보
 */
export interface RoleDto {
  systemId?: string;
  parentRoleNo?: string;
  roleNo?: string;
  roleName?: string;
  roleType?: string;
  sort?: number;
  level?: number;
  childChk?: string;
  defaultRoleYn?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  rowStatus?: string;
}

/**
 * 권한 사용자 정보
 */
export interface RoleUserDto {
  systemId?: string;
  roleNo?: string;
  typeId?: string;
  roleType?: string;
  typeName?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  rowStatus?: string;
}

/**
 * 권한 메뉴 정보
 */
export interface RoleMenuDto {
  systemId?: string;
  roleNo?: string;
  pgmNo?: string;
  parentPgmNo?: string;
  pgmName?: string;
  level?: number;
  programPath?: string;
  isLeaf?: string;
  rowStatus?: string;
}

/**
 * 권한 조회 요청
 */
export interface RoleListRequest {
  systemId?: string;
  topRoleNo?: string;
}

/**
 * 권한 사용자 조회 요청
 */
export interface RoleUserListRequest {
  systemId?: string;
  roleNo?: string;
}

/**
 * 권한 메뉴 조회 요청
 */
export interface RoleMenuListRequest {
  systemId?: string;
  roleNo?: string;
  pgmNo?: string;
}

/**
 * 권한 추가 요청
 */
export interface RoleInsertRequest {
  systemId: string;
  roleType: string;
  parentRoleNo?: string;
  roleName: string;
  sort?: number;
  defaultRoleYn?: string;
  levelType?: string; // D: 하위, E: 동일 레벨
}

/**
 * 권한 삭제 요청
 */
export interface RoleDeleteRequest {
  systemId?: string;
  roleNo?: string;
}

/**
 * 권한 복사 요청
 */
export interface RoleCopyRequest {
  systemId?: string;
  roleNo?: string;
  userId?: string;
}

/**
 * 권한명 변경 요청
 */
export interface RoleNameUpdateRequest {
  roleName: string;
}

/**
 * 권한 사용자 저장 요청
 */
export interface RoleUserSaveRequest {
  roleType: string;
  description?: string;
  insertUsers?: RoleUserDto[];
  deleteUsers?: RoleUserDto[];
}

/**
 * 권한 메뉴 저장 요청
 */
export interface RoleMenuSaveRequest {
  description?: string;
  insertMenuNos?: string[];
  deleteMenuNos?: string[];
  restoreMenuNos?: string[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 권한 목록 조회
 */
export const getRoleListApi = async (
  topRoleNo?: string
): Promise<ApiResponse<RoleDto[]>> => {
  return get<RoleDto[]>("/system/pgm/access/permission/roles", {
    params: topRoleNo ? { topRoleNo } : undefined,
  });
};

/**
 * 권한 사용자 목록 조회
 */
export const getRoleUserListApi = async (
  roleNo: string
): Promise<ApiResponse<RoleUserDto[]>> => {
  return get<RoleUserDto[]>(`/system/pgm/access/permission/roles/${roleNo}/users`);
};

/**
 * 권한 메뉴 목록 조회
 */
export const getRoleMenuListApi = async (
  roleNo: string,
  pgmNo?: string
): Promise<ApiResponse<RoleMenuDto[]>> => {
  return get<RoleMenuDto[]>(`/system/pgm/access/permission/roles/${roleNo}/menus`, {
    params: pgmNo ? { pgmNo } : undefined,
  });
};

/**
 * 권한 추가
 */
export const insertRoleApi = async (
  request: RoleInsertRequest
): Promise<ApiResponse<{ roleNo?: string }>> => {
  return post<{ roleNo?: string }>("/system/pgm/access/permission/roles", request);
};

/**
 * 권한 삭제
 */
export const deleteRoleApi = async (
  roleNo: string
): Promise<ApiResponse<{ result?: string }>> => {
  return del<{ result?: string }>(`/system/pgm/access/permission/roles/${roleNo}`);
};

/**
 * 권한 복사
 */
export const copyRoleApi = async (
  roleNo: string,
  request?: RoleCopyRequest
): Promise<ApiResponse<{ result?: string }>> => {
  return post<{ result?: string }>(`/system/pgm/access/permission/roles/${roleNo}/copy`, request);
};

/**
 * 권한명 변경
 */
export const updateRoleNameApi = async (
  roleNo: string,
  request: RoleNameUpdateRequest
): Promise<ApiResponse<{ result?: string }>> => {
  return post<{ result?: string }>(
    `/system/pgm/access/permission/roles/${roleNo}/name`,
    request
  );
};

/**
 * 권한 사용자 저장 (추가/삭제)
 */
export const saveRoleUserApi = async (
  roleNo: string,
  request: RoleUserSaveRequest
): Promise<ApiResponse<{ result?: string }>> => {
  return post<{ result?: string }>(
    `/system/pgm/access/permission/roles/${roleNo}/users`,
    request
  );
};

/**
 * 권한 메뉴 저장
 */
export const saveRoleMenuApi = async (
  roleNo: string,
  request: RoleMenuSaveRequest
): Promise<ApiResponse<{ result?: string }>> => {
  return post<{ result?: string }>(
    `/system/pgm/access/permission/roles/${roleNo}/menus`,
    request
  );
};

