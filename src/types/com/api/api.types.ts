/**
 * API 관련 타입 정의
 */

import type { AuthUser } from "../auth/auth.types";

/**
 * 메뉴 정보
 */
export interface MenuItem {
  lvl: number;
  systemId: string;
  pgmNo: string;
  parentPgmNo: string;
  pgmType?: string;
  windowId?: string;
  pgmName: string;
  sort?: number;
  useMenu?: string;
  useYn?: string;
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  hidden?: string;
  exUserUseYn?: string;
  initParam?: string;
  createdBy?: string;
  creationDate?: Date;
  lastUpdatedBy?: string;
  lastUpdateDate?: Date;
  logYn?: string;
  helpUrl?: string;
  path?: string;
  lKey?: string; // 다국어 키
  icon?: string; // 아이콘 이름 (예: "UserOutlined", "DashboardOutlined")
  oldWindowId?: string;
  programId?: string;
  terminalId?: string;
  rowStatus?: string;
  children?: MenuItem[]; // 자식 메뉴
}

/**
 * 사용자 기본 정보
 */
export interface UserInfo {
  empCode: string;
  empName: string;
  isAdmin: string;
}

/**
 * 초기 데이터 응답
 */
export interface MainInitResponse {
  menus: MenuItem[];
  userInfo: UserInfo;
}

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  empCode: string;
  password: string;
  remember?: boolean;
  locale?: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponse extends AuthUser {
  accessToken: string;
  // refreshToken은 HttpOnly 쿠키로 전송되므로 응답 본문에 포함되지 않음
  user: AuthUser;
}

/**
 * Refresh API 응답 타입 (백엔드 LoginResponse와 일치)
 */
export interface RefreshTokenResponse {
  accessToken: string;
  // refreshToken은 쿠키로만 전송되므로 응답 본문에 포함되지 않음
}

/**
 * 코드 상세 조회 요청 파라미터
 */
export interface CodeDetailParams {
  officeId?: string; //회사코드
  module?: string; //모듈(SYS:시스템, GL:회계, AR:매출, INV:재고)
  type?: string; //타입, 부모코드
  enabledFlag?: string | "Y" | "N"; //사용여부(Y:사용, N:미사용)
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  attribute6?: string;
  attribute7?: string;
  attribute8?: string;
  attribute9?: string;
  attribute10?: string;
}

/**
 * 코드 상세 정보
 */
export interface CodeDetail {
  code?: string; //코드
  officeId?: string; //회사코드드
  module?: string; //모듈(SYS:시스템, GL:회계, AR:매출, INV:재고)
  type?: string; //타입, 부모코드
  name1?: string; //코드명1
  name2?: string; //코드명2
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  attribute6?: string;
  attribute7?: string;
  attribute8?: string;
  attribute9?: string;
  attribute10?: string;
  segment1?: string;
  segment2?: string;
  segment3?: string;
  segment4?: string;
  segment5?: string;
  segment6?: string;
  segment7?: string;
  segment8?: string;
  segment9?: string;
  segment10?: string;
  segment11?: string;
  segment12?: string;
  segment13?: string;
  segment14?: string;
  segment15?: string;
}

