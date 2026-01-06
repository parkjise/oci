/**
 * 재무회계 > 고정자산 > 고정자산관리 > 고정자산 템플릿 관련 타입 정의
 */

/**
 * 목록 조회 결과
 *
 * @willUpdate: 저장 직전 기존 항목의 수정인지 구분용.
 * @willDelete: 저장 직전 기존 항목의 삭제인지 구분용.
 * @uuid: 화면에서의 데이터 구분용. 기존 항목은 PK를 사용하고, 새로운 항목은 new_로 시작하는 UUID를 사용.
 *
 * @interfaceId: 테이블PK
 * @officeId: 법인ID
 * @description: 자산명
 * @scode: 세분류코드
 * @scodeName: 세분류명
 * @orgCode: 사업장코드
 * @acquisitionDate: 취득일자(YYYYMMDD)
 * @deprnFlag: 상각여부
 * @assetsCost: 원시최득가액
 * @assetsUnits: 단위
 * @invoiceQty: 수량
 * @custNo: 거래처코드
 * @invoiceAccount: INVOICE 계정코드
 * @assetDeptCd: 부서코드
 * @cstCde: 공정코드
 * @projectCode: 프로젝트코드
 * @poNumber: PO번호
 * @lcode: 대분류코드
 * @costCodeChk: 공정여부
 * @expenseAccount: 비용계정코드
 * @governmentSubsidiesYn: 국가보조금 여부
 * @lifeTerm: 내용년수
 * @fixCategory: 자산구분카테고리
 * @ioChk: 자산등재여부
 */
export interface FdstTmplatListResponse {
  willUpdate: boolean;
  willDelete: boolean;
  uuid: string;
  // ----------
  interfaceId?: number;
  officeId?: string;
  description?: string;
  scode?: string;
  scodeName?: string;
  orgCode?: string;
  acquisitionDate?: string;
  deprnFlag?: string;
  assetsCost?: number;
  assetsUnits?: string;
  invoiceQty?: number;
  custNo?: string;
  invoiceAccount?: string;
  assetDeptCd?: string;
  cstCde?: string;
  projectCode?: string;
  poNumber?: string;
  lcode?: string;
  costCodeChk?: string;
  expenseAccount?: string;
  governmentSubsidiesYn?: string;
  lifeTerm?: number;
  fixCategory?: string;
  ioChk?: string;
  // ----------
  [key: string]: unknown;
}

/**
 * 분류 조회 검색 조건
 *
 * @asOfficeId: 사무소ID
 * @asScode: 고정자산 세부분류
 * @asScodeName: 고정자산 세부분류명
 */
export interface FdstLsCodeSrchRequest {
  asOfficeId?: string;
  asScode?: string;
  asScodeName?: string;
}

/**
 * 분류 조회 결과
 *
 * @lsLcode: 고정자산 대분류
 * @lsLcodeName: 고정자산 대분류명
 * @lsScode: 고정자산 세부분류
 * @lsScodeName: 고정자산 세부분류명
 * @lsDeprnFlag: 상각여부
 * @lsCostCodeChk: 제조공정여부
 * @lsExpenseAccount: 자산계정
 * @isGovernmentSubsidiesYn: 국고보조금 여부
 * @lsYear: 내용년수
 */
export interface FdstLsCodeListResponse {
  lsLcode: string;
  lsLcodeName?: string;
  lsScode: string;
  lsScodeName?: string;
  lsDeprnFlag?: string;
  lsCostCodeChk?: string;
  lsExpenseAccount?: string;
  isGovernmentSubsidiesYn?: string;
  lsYear?: number;
  // ----------
  [key: string]: unknown;
}
