/*
 * 프로젝트 명  : ONERP
 * 파일 명     : permissionApi.ts
 * 설명        : 권한 관리 API 클라이언트
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성 - 복구 및 공통 API 적용)
 */
import { get, post, del } from "@apis/common/api";
import type { RoleMenuWinObjDto } from "@/types/com/auth/auth.types";

// 공통 타입 re-export
export type { RoleMenuWinObjDto } from "@/types/com/auth/auth.types";

/**
 * 권한 DTO
 */
export interface RoleDto {
  roleNo: string;
  roleName: string;
  roleType: string;
  roleTypeName?: string;
  level: number;
  parentRoleNo?: string;
  sort?: number;
}

/**
 * 권한별 사용자 DTO
 */
export interface RoleUserDto {
  roleNo: string;
  typeId: string; // 사용자ID
  typeName: string; // 사용자명
  roleType: string;
  roleTypeName?: string;
}

/**
 * 권한별 메뉴 DTO
 */
export interface RoleMenuDto {
  roleNo: string;
  pgmNo: string;
  pgmName: string;
  level: number;
  parentPgmNo?: string;
  authI: string; // 입력권한
  authU: string; // 수정권한
  authD: string; // 삭제권한
  authP: string; // 출력권한
  authS: string; // 조회권한
}

/**
 * 전체 권한 목록 조회
 */
export const getRolesApi = (topRoleNo?: string) => {
  return get("/system/pgm/access/permission/roles", { params: { topRoleNo } });
};

/**
 * 권한별 사용자 목록 조회
 */
export const getRoleUsersApi = (roleNo: string) => {
  return get(`/system/pgm/access/permission/roles/${roleNo}/users`);
};

/**
 * 권한별 메뉴 목록 조회
 */
export const getRoleMenusApi = (roleNo: string) => {
  return get(`/system/pgm/access/permission/roles/${roleNo}/menus`);
};

/**
 * 공통 코드 조회 (권한타입 등)
 */
export const getAuthTypesApi = (groupCode: string, enabledFlag?: string) => {
  return get("/system/pgm/code/detail", {
    params: { module: "SYS", type: groupCode, enabledFlag },
  });
};

/**
 * 권한명 변경
 */
export const updateRoleNameApi = (roleNo: string, roleName: string) => {
  return post(`/system/pgm/access/permission/roles/${roleNo}/name`, {
    roleName,
  });
};

/**
 * 권한 삭제
 */
export const deleteRoleApi = (roleNo: string) => {
  return del(`/system/pgm/access/permission/roles/${roleNo}`);
};

/**
 * 권한 복사
 */
export const copyRoleApi = (roleNo: string) => {
  return post(`/system/pgm/access/permission/roles/${roleNo}/copy`);
};

/**
 * 권한별 사용자 저장
 */
export const saveRoleUsersApi = (
  roleNo: string,
  data: {
    roleType: string;
    description: string;
    insertUsers: RoleUserDto[];
    deleteUsers: RoleUserDto[];
  }
) => {
  return post(`/system/pgm/access/permission/roles/${roleNo}/users`, data);
};

/**
 * 권한별 메뉴 저장
 */
export const saveRoleMenusApi = (
  roleNo: string,
  data: { reason: string; type: string; menus: any[] }
) => {
  return post(`/system/pgm/access/permission/roles/${roleNo}/menus`, data);
};

/**
 * 권한 생성
 */
export const createRoleApi = (
  data: Partial<RoleDto> & { levelType: "D" | "E" }
) => {
  return post("/system/pgm/access/permission/roles", data);
};

/**
 * 메뉴 설정을 위한 전체 메뉴 목록 조회
 */
export const getRoleMenuPickApi = (roleNo: string, pgmNo: string) => {
  return get(`/system/pgm/access/permission/roles/${roleNo}/menu-pick`, {
    params: { pgmNo },
  });
};

/**
 * 사용자 추가를 위한 사용자 목록 조회
 */
export const getUserPickApi = (params: {
  roleType: string;
  searchText?: string;
}) => {
  return get("/system/pgm/access/permission/roles/user-pick", { params });
};

/**
 * 권한 변경 이력 조회 (사용자/메뉴 분리)
 */
export const getRoleHistoryApi = (
  roleNo: string,
  historyType: "USER" | "MENU",
  params?: any
) => {
  const subPath = historyType === "USER" ? "users" : "menus";
  return get(
    `/system/pgm/access/permission/roles/${roleNo}/${subPath}/history`,
    { params }
  );
};

/**
 * 버튼 권한 목록 조회
 */
export const getRoleMenuButtonsApi = (roleNo: string, pgmNo: string) => {
  return get(
    `/system/pgm/access/permission/roles/${roleNo}/menus/${pgmNo}/buttons`
  );
};

/**
 * 현재 사용자의 권한 기반 메뉴 버튼 목록 조회
 * @param pgmNo - 프로그램 번호
 * @returns 현재 사용자의 권한에 따른 버튼 목록
 * @remarks
 * - 현재 로그인한 사용자의 권한을 기반으로 버튼 목록을 조회합니다.
 * - 서버에서 사용자의 권한을 자동으로 확인합니다.
 */
export const getRoleMenuButtonsByPgmNoApi = (pgmNo: string) => {
  return get<RoleMenuWinObjDto[]>(
    `/system/pgm/access/permission/role-menu-buttons/${pgmNo}`
  );
};

/**
 * 버튼 권한 저장
 */
export const saveRoleMenuButtonsApi = (
  roleNo: string,
  pgmNo: string,
  data: { description: string; buttons: RoleMenuWinObjDto[] }
) => {
  return post(
    `/system/pgm/access/permission/roles/${roleNo}/menus/${pgmNo}/buttons`,
    data
  );
};

/**
 * 버튼 권한 이력 DTO
 */
export interface RoleMenuWinObjHistDto extends RoleMenuWinObjDto {
  hisDate: string;
  hisType: string;
  hisUser: string;
  description: string;
}

/**
 * 버튼 권한 이력 조회
 */
export const getRoleMenuButtonsHistoryApi = (
  roleNo: string,
  pgmNo: string,
  params?: any
) => {
  return get(
    `/system/pgm/access/permission/roles/${roleNo}/menus/${pgmNo}/buttons/history`,
    { params }
  );
};
