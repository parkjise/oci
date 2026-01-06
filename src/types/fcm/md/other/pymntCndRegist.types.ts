/**
 * 재무회계 > 기준정보 > 기타관리 > 지급조건 등록 관련 타입 정의
 */

// 지급 조건 구분 상수
export const TERMS_TYPE___AR = 'A';
export const TERMS_TYPE___AP = 'B';
export const TERMS_TYPE___CM = 'C';

// 지급 조건 공휴일지급구분 상수
export const HOLIDAY_PAY_TYPE___SAMEDAY = 'S'; // 당일
export const HOLIDAY_PAY_TYPE___NEXTDAY = 'N'; // 익일
export const HOLIDAY_PAY_TYPE___PREVDAY = 'P'; // 이전

export type RowStatus = 'C' | 'U' | 'D';

/**
 * 목록 검색 요청
 *
 * @asOfficeId: 사무소ID
 * @asType: 구분 (A: AR, B: AP, C: CM)
 * @asUseYn: 사용여부
 */
export interface PymntCndRegistSrchRequest {
  asOfficeId: string;
  asType?: string;
  asUseYn?: 'Y' | 'N';
}

/**
 * 목록 조회 결과
 *
 * @willUpdate: 저장 직전 기존 항목의 수정인지 구분용.
 * @willDelete: 저장 직전 기존 항목의 삭제인지 구분용.
 * @uuid: 화면에서의 데이터 구분용. 기존 항목은 PK를 사용하고, 새로운 항목은 new_로 시작하는 UUID를 사용.
 *
 * @officeId: 사무소ID
 * @termsCode: Terms코드
 * @termsName: Terms명
 * @termsType: 구분
 * @cutOfDate: 기준일자
 * @monthOfLast: 말일여부
 * @holidayPayType: 공휴일지급구분
 * @monthForward: +월수
 * @dayOfMonth: +일수(+월수후)
 * @dateForward: 특정일
 * @days: +일수
 * @noteDueDays: 어음만기일수
 * @useYn: 사용여부
 * @attribute5: Terms Desc.
 * @attribute7: Curr Type
 * @attribute10: Old Code ID
 * @oldTermsCode: Old Terms Code
 */
export interface PymntCndRegistListResponse {
  willUpdate: boolean;
  willDelete: boolean;
  uuid: string;
  // ----------
  officeId: string;
  termsCode: string;
  termsName: string;
  termsType?: string;
  cutOfDate?: number;
  monthOfLast?: 'Y' | 'N';
  holidayPayType?: string;
  monthForword?: number;
  dayOfMonth?: number;
  dateForword?: number;
  days?: number;
  noteDueDays?: number;
  useYn?: 'Y' | 'N';
  attribute5?: string;
  attribute7?: string;
  attribute10?: string;
  oldTermsCode?: string;
  // ----------
  [key: string]: unknown;
}

/**
 * 저장될 항목
 *
 * @rowStatus: 데이터 변경 구분 - C: 생성 / U: 수정 / D: 삭제
 *
 * @officeId: 사무소ID
 * @termsCode: Terms코드
 * @termsName: Terms명
 * @termsType: 구분
 * @cutOfDate: 기준일자
 * @monthOfLast: 말일여부
 * @holidayPayType: 공휴일지급구분
 * @monthForward: +월수
 * @dayOfMonth: +일수(+월수후)
 * @dateForward: 특정일
 * @days: +일수
 * @noteDueDays: 어음만기일수
 * @useYn: 사용여부
 * @attribute5: Terms Desc.
 * @attribute7: Curr Type
 * @attribute10: Old Code ID
 * @oldTermsCode: Old Terms Code
 */
export interface PymntCndRegistData {
  rowStatus: RowStatus;
  // ----------
  officeId: string;
  termsCode: string;
  termsName: string;
  termsType?: string;
  cutOfDate?: number;
  monthOfLast?: 'Y' | 'N';
  holidayPayType?: string;
  monthForword?: number;
  dayOfMonth?: number;
  dateForword?: number;
  days?: number;
  noteDueDays?: number;
  useYn?: 'Y' | 'N';
  attribute5?: string;
  attribute7?: string;
  attribute10?: string;
  oldTermsCode?: string;
}

/**
 * 항목 저장 요청
 */
export interface PymntCndRegistSaveRequest {
  list: PymntCndRegistData[];
}
