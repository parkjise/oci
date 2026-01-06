/**
 * 재무회계 > 기준정보 > 계정코드관리 > 표준재무제표 등록 관련 타입 정의
 */

/**
 * 목록 검색 요청
 *
 * @asOfficeId: 사무소ID
 * @asRepType: 표준재무제표유형
 */
export interface StdFnnrTblatRegistSrchRequest {
  asOfficeId: string;
  asRepType: string;
}

/**
 * 계정코드(Header) 목록 조회 결과
 *
 * @willUpdate: 저장 직전 기존 항목의 수정인지 구분용.
 * @uuid: 화면에서의 데이터 구분용. 기존 항목은 PK를 사용하고, 새로운 항목은 new_로 시작하는 UUID를 사용.
 *
 * @repType: 재무제표타입(양식코드)
 * @repCde: 코드
 * @accCdeN: 표준계정코드
 * @accNmeN: 표준계정코드명
 * @accOutNme: 출력명
 * @useYn: 사용여부
 * @newYn: 신규여부
 */
export interface StdFnnrTblatRegistMainListResponse {
  willUpdate: boolean;
  uuid: string;
  // ----------
  repType: string;
  repCde: string;
  accCdeN?: string;
  accNmeN?: string;
  accOutNme?: string;
  useYn?: 'Y' | 'N';
  newYn?: 'Y' | 'N';
  // ----------
  [key: string]: unknown;
}

/**
 * 계정코드매핑(Detail) 목록 조회 결과
 *
 * @uuid: 화면에서의 데이터 구분용. 기존 항목은 PK를 사용하고, 새로운 항목은 new_로 시작하는 UUID를 사용.
 * @willUpdate: 저장 직전 기존 항목의 수정인지 구분용.
 * @willDelete: 저장 직전 기존 항목의 삭제인지 구분용.
 *
 * @id: ID. 기존 항목은 PK(Sequence Number)를 사용하고, 새로운 항목은 new_로 시작하는 UUID를 사용.
 * @repType: 재무제표타입(양식코드)
 * @repCde: 코드
 * @accCdeN: 표준계정코드
 * @accNmeN: 표준계정코드명
 * @accOutNme: 출력명
 * @useYn: 사용여부
 * @newYn: 신규여부
 *
 * @onerpAccCdeF: 계정 From
 * @onerpAccNmeF: 계정명 From
 * @onerpAccCdeT: 계정 To
 * @onerpAccNmeT: 계정명 To
 */
export interface StdFnnrTblatRegistDetailListResponse {
  uuid: string;
  willUpdate: boolean;
  willDelete: boolean;
  // ----------
  id?: number;
  repType: string;
  repCde: string;
  accCdeN?: string;
  accNmeN?: string;
  accOutNme?: string;
  useYn?: 'Y' | 'N';
  newYn?: 'Y' | 'N';
  // ----------
  onerpAccCdeF?: string;
  onerpAccNmeF?: string;
  onerpAccCdeT?: string;
  onerpAccNmeT?: string;
  // ----------
  [key: string]: unknown;
}

/**
 * 저장될 메인 항목
 *
 * @rowStatus: 데이터 변경 구분 - C: 생성 / U: 수정 / D: 삭제
 *
 * @repType: 표준재무제표유형(PK 요소) (필수)
 * @repCde: 코드(PK 요소) (필수)
 * @accCdeN: 표준계정코드
 * @accNmeN: 표준계정코드명
 * @accOutNme: 출력명
 * @useYn: 사용여부
 */
export interface StdFnnrTblatRegistMainData {
  rowStatus: string;
  // ----------
  repType: string;
  repCde: string;
  accCdeN?: string;
  accNmeN?: string;
  accOutNme?: string;
  useYn?: 'Y' | 'N';
}

/**
 * 저장될 상세 항목
 *
 * @rowStatus: 데이터 변경 구분 - C: 생성 / U: 수정 / D: 삭제
 *
 * @id: ID. (수정/삭제만 필수)
 * @repType: 표준재무제표유형(메인 PK 요소) (생성만 필수)
 * @repCde: 코드(메인 PK 요소) (생성만 필수)
 * @onerpAccCdeF: 계정 From
 * @onerpAccCdeT: 계정 To
 */
export interface StdFnnrTblatRegistDetailData {
  rowStatus: string;
  // ----------
  id?: number;
  repType?: string;
  repCde?: string;
  onerpAccCdeF?: string;
  onerpAccCdeT?: string;
}

/**
 * 메인 항목 저장 요청
 */
export interface StdFnnrTblatRegistMainSaveRequest {
  list: StdFnnrTblatRegistMainData[];
}

/**
 * 상세 항목 저장 요청
 */
export interface StdFnnrTblatRegistDetailSaveRequest {
  list: StdFnnrTblatRegistDetailData[];
}
