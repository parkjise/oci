// ============================================================================
// 사용자 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post, put, del } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 사용자 DTO
 */
export interface UserDto {
  officeId?: string; // ORG_ID
  empCode: string; // EMP_CODE
  empName: string; // EMP_NAME
  deptCode?: string; // DEPT_CODE
  deptName?: string; // DEPT_NME
  password?: string; // PASSWORD
  useYn?: string; // USE_YN
  emailId?: string; // EMAIL_ID
  empAbbName?: string; // EMP_ABB_NAME
  acpayRole?: string; // ACPAY_ROLE
  purreqRole?: string; // PURREQ_ROLE
  purkpoRole?: string; // PURKPO_ROLE
  applUseYn?: string; // APPL_USE_YN
  buyerYn?: string; // BUYER_YN
  lockYn?: string; // LOCK_YN
  passwordDate?: string; // PASSWORD_DATE
  pstnCode?: string; // PSTN_CDE
  emailReceiveYn?: string; // EMAIL_RECEIVE_YN
  startDate?: string; // START_DATE
  endDate?: string; // END_DATE
  empyId?: string; // EMPY_ID
  ySale?: string; // YSALE
  divisionRole?: string; // DIVISION_ROLE
  insaDeptChgYn?: string; // INSA_DEPT_CHG_YN
  orgId?: string; // ORG_ID (소속사업장, 실제 DB: WORK_PLACE)
  workPlace?: string; // WORK_PLACE
  subOrgId?: string; // SUB_ORG_ID
  empImgId?: string; // EMP_IMG_ID
  rowStatus?: string; // 행 상태 (C: 추가, U: 수정, D: 삭제)
}

/**
 * 사용자 검색 요청
 */
export interface UserSearchRequest {
  asType?: string; // 검색 타입 (1: 부서, 2: 성명, 3: 사번)
  asName?: string; // 검색어
  asUseYn?: string; // 사용여부 (Y, N, %)
  empName?: string; // 사용자 이름
  department?: string; // 부서 코드 또는 명칭
  empCode?: string; // 사용자 코드
  useYn?: string; // 사용 여부 (ALL, Y, N)
  pageNum?: number; // 페이지 번호
  pageSize?: number; // 페이지 크기
}

/**
 * 사용자 저장 요청
 */
export interface UserSaveRequest {
  users: UserSaveItem[];
}

/**
 * 사용자 저장 요청 항목
 */
export interface UserSaveItem {
  rowStatus: string; // C: 추가, U: 수정, D: 삭제
  officeId?: string;
  empCode: string;
  empName: string;
  deptCode?: string;
  deptName?: string;
  password?: string;
  useYn?: string;
  emailId?: string;
  empAbbName?: string;
  acpayRole?: string;
  purreqRole?: string;
  purkpoRole?: string;
  applUseYn?: string;
  buyerYn?: string;
  lockYn?: string;
  passwordDate?: string;
  pstnCode?: string;
  emailReceiveYn?: string;
  startDate?: string;
  endDate?: string;
  empyId?: string;
  ySale?: string;
  divisionRole?: string;
  insaDeptChgYn?: string;
  orgId?: string; // 소속사업장 ID (프론트엔드용, 실제 DB는 workPlace)
  workPlace?: string;
  subOrgId?: string;
  empImgId?: string;
}

/**
 * 저장 응답
 */
export interface SaveResponse {
  result: string; // S: 성공, F: 실패
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 사용자 목록 조회 (페이징)
 */
export const getUserListApi = async (
  params?: UserSearchRequest
): Promise<ApiResponse<{ list: UserDto[]; total: number; pageNum: number; pageSize: number }>> => {
  return get<{ list: UserDto[]; total: number; pageNum: number; pageSize: number }>(
    "/system/org/user",
    {
      params: {
        empName: params?.empName,
        department: params?.department,
        empCode: params?.empCode,
        useYn: params?.useYn || "ALL",
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 50,
      },
    }
  );
};

/**
 * 사용자 전체 목록 조회 (페이징 없음)
 */
export const getAllUsersApi = async (
  params?: UserSearchRequest
): Promise<ApiResponse<UserDto[]>> => {
  return get<UserDto[]>("/system/org/user/all", {
    params: {
      empName: params?.empName,
      department: params?.department,
      empCode: params?.empCode,
      useYn: params?.useYn || "ALL",
    },
  });
};

/**
 * 사용자 상세 조회
 */
export const getUserApi = async (empCode: string): Promise<ApiResponse<UserDto>> => {
  return get<UserDto>(`/system/org/user/${empCode}`);
};

/**
 * 사용자 생성
 */
export const createUserApi = async (user: UserSaveItem): Promise<ApiResponse<UserDto>> => {
  return post<UserDto>("/system/org/user", user);
};

/**
 * 사용자 수정
 */
export const updateUserApi = async (
  empCode: string,
  user: UserSaveItem
): Promise<ApiResponse<UserDto>> => {
  return put<UserDto>(`/system/org/user/${empCode}`, user);
};

/**
 * 사용자 삭제
 */
export const deleteUserApi = async (empCode: string): Promise<ApiResponse<void>> => {
  return del<void>(`/system/org/user/${empCode}`);
};

/**
 * 전자결재 사용 여부 토글
 */
export interface ToggleApplUseYnRequest {
  officeId: string;
  empCode: string;
  applUseYn: string; // YES 또는 NO
}

export const toggleApplUseYnApi = async (
  request: ToggleApplUseYnRequest
): Promise<ApiResponse<void>> => {
  return post<void>("/system/org/user/toggleApplUseYn", request);
};


