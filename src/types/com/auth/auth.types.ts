/**
 * 인증 관련 타입 정의
 */

/**
 * 인증된 사용자 정보
 */
export interface AuthUser {
  /** 사무소 ID */
  officeId: string;
  /** 사원 코드 */
  empCode: string;
  /** 사원명 */
  empName: string;
  /** 부서 코드 */
  deptCode: string;
  /** 사용 여부 */
  useYn: string;
  /** 이메일 ID */
  emailId: string;
  /** 부서명 */
  deptName: string;
  /** 사원 약칭명 */
  empAbbName: string;
  /** 회계 결재 역할 */
  acpayRole: string;
  /** 구매 요청 역할 */
  purreqRole: string;
  /** 구매 발주 역할 */
  purkpoRole: string;
  /** 승인 사용 여부 */
  applUseYn: string;
  /** 구매자 여부 */
  buyerYn: string;
  /** 잠금 여부 */
  lockYn: string;
  /** 비밀번호 변경일 */
  passwordDate: string;
  /** 직위 코드 */
  pstnCode: string;
  /** 이메일 수신 여부 */
  emailReceiveYn: string;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
  /** 사원 ID */
  empyId: string;
  /** 부서 역할 */
  divisionRole: string;
  /** 인사 부서 변경 여부 */
  insaDeptChgYn: string;
  /** 조직 ID */
  orgId: string;
  /** 근무지 */
  workPlace: string;
  /** 하위 조직 ID */
  subOrgId: string;
  /** 사원 이미지 ID */
  empImgId: string;
  /** 연매출 여부 */
  ySale: string;
  /** 언어 타입 */
  langType?: string;
  /** 메인 타입 */
  mainType?: string;
  /** 테마 타입 */
  themeType?: string;
}

/**
 * 비밀번호 변경 요청 타입
 */
export interface ChangePasswordRequest {
  /** 사원 코드 */
  empCode: string;
  /** 현재 비밀번호 */
  currentPassword: string;
  /** 새로운 비밀번호 */
  newPassword: string;
  /** 비밀번호 확인 */
  confirmPassword: string;
}

/**
 * 비밀번호 변경 결과 타입
 */
export interface ChangePasswordResult {
  /** 성공 여부 */
  success: boolean;
  /** 메시지 */
  message?: string;
}

/**
 * 권한별 메뉴 객체(버튼) DTO
 */
export interface RoleMenuWinObjDto {
  /** 시스템 ID */
  systemId: string;
  /** 권한 번호 */
  roleNo: string;
  /** 프로그램 번호 */
  pgmNo: string;
  /** 객체 ID */
  objectId: string;
  /** 객체 타입 */
  objectType: string;
  /** 객체명 */
  objName: string;
  /** 권한 유무 */
  roleEnabled: string;
  /** 조회 권한 */
  retrieveEnabled: string;
  /** 생성 권한 */
  createEnabled: string;
  /** 수정 권한 */
  updateEnabled: string;
  /** 삭제 권한 */
  deleteEnabled: string;
  /** 생성자 */
  createdBy?: string;
  /** 생성일시 */
  creationDate?: string;
  /** 수정자 */
  lastUpdatedBy?: string;
  /** 수정일시 */
  lastUpdateDate?: string;
  /** 프로그램 ID */
  programId?: string;
  /** 터미널 ID */
  terminalId?: string;
  /** 내부 사용 ID (objectId와 동일한 값) */
  id?: string;
}

/**
 * 사용자 기본 설정 타입
 */
export interface UserDefaultSettings {
  /** 테마 타입 */
  themeType: "light" | "dark";
  /** 이메일 ID */
  emailId: string;
  /** 이메일 수신 여부 */
  emailReceiveYn: "Y" | "N";
  /** 언어 타입 */
  langType: "ko" | "en";
  /** 메인 타입 */
  mainType: string;
}

/**
 * 사용자 환경 설정 업데이트 요청 타입
 */
export interface UpdateEnvRequest {
  /** 이메일 ID */
  emailId?: string;
  /** 테마 타입 */
  themeType?: "light" | "dark";
  /** 언어 타입 */
  langType?: "ko" | "en";
  /** 메인 타입 */
  mainType?: string;
  /** 이메일 수신 여부 */
  emailReceiveYn?: "Y" | "N";
}
