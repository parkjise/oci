/**
 * 인증 관련 타입 정의
 */

/**
 * 인증된 사용자 정보
 */
export interface AuthUser {
  officeId: string; //회사코드
  empCode: string; //사원 코드
  empName?: string; //사원 이름
  deptCode?: string; //부서 코드
  password?: string; //비밀번호
  useYn?: string | "Y"; //사용 여부 (Y/N)
  emailId?: string | null; //이메일 ID
}

