/**
 * 거래처 등록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 거래처 등록 검색 요청 타입
 */
export interface BcncSrchRequest {
  /** 사무소ID */
  asOfficeId?: string;
  /** 거래처구분 (A:매출, B:매입, C:매출+매입) */
  asType?: string;
  /** 거래처명 */
  asCustname?: string;
  /** 거래처코드 */
  asCustno?: string;
  /** 상세조회용 사무소ID */
  asDOfficeId?: string;
  /** 사용여부 (Y/N/O) */
  asUseYno?: string;
}

/**
 * 거래처 등록 목록 응답 타입
 */
export interface BcncListResponse {
  /** 회사코드 */
  officeId?: string;
  /** 거래처코드 */
  custno?: string;
  /** 거래처명 */
  custname?: string;
  /** 거래처대외명 */
  custename?: string;
  /** 거래처타입 */
  custType?: string;
  /** 국내/해외 */
  custArea?: string;
  /** 거래처유형 */
  custClass?: string;
  /** 대표자 */
  pname?: string;
  /** 사업자번호 */
  regtno?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 주소 */
  addr?: string;
  /** 팩스 */
  fax?: string;
  /** 업태 */
  uptae?: string;
  /** 종목 */
  jong?: string;
  /** 계약일 */
  sdate?: string;
  /** 영업사원 */
  salesMan?: string;
  /** 모대리점명 */
  pcustname?: string;
  /** 지급은행 */
  bank?: string;
  /** 지급은행명 */
  bankName?: string;
  /** 수금은행 */
  receiptBank?: string;
  /** 수금은행지점 */
  receiptBankBranch?: string;
  /** 수금은행명 */
  receiptBankName?: string;
  /** 전화번호 */
  tel?: string;
  /** 거래처구분 */
  custnoGb?: string;
  /** 지역 */
  ntnlCde?: string;
  /** 지급조건 */
  stlmTerm?: string;
  /** 수금조건 */
  stlmTermAr?: string;
  /** 거래처 계좌번호 */
  acctNbr?: string;
  /** 수금업체계좌번호 */
  receiptBankAccount?: string;
  /** 매입부가세타입 */
  vatType?: string;
  /** 사용여부 */
  useYno?: string;
  /** 예금주 */
  depositor?: string;
  /** 미지급금계정 */
  acctNum1?: string;
  /** 미지급금계정명 */
  acctName1?: string;
  /** 선지급금계정 */
  acctNum2?: string;
  /** 선지급금계정명 */
  acctName2?: string;
  /** 국가코드 */
  nationalCde?: string;
  /** 쇼핑몰ID */
  cikNo?: string;
  /** 화폐단위 */
  currency?: string;
  /** 담당자명 */
  empyNme?: string;
  /** 개인여부 */
  personYn?: string;
  /** 매출부가세타입 */
  vatType2?: string;
  /** 매입부가세명 */
  vatNmeAp?: string;
  /** 매출부가세명 */
  vatNmeAr?: string;
  /** BILL_TO */
  billToCust?: string;
  /** PAY_TO */
  payToCust?: string;
  /** SHIP_TO */
  shipToCust?: string;
  /** 영업관리프로그램 구분 */
  prmShopcd?: string;
  /** 전자세금계산서 e-Mail */
  mail?: string;
  /** Bill To 명 */
  billToName?: string;
  /** Pay To 명 */
  payToName?: string;
  /** 종사업장번호 */
  regtnoNo?: string;
  /** 여신한도 */
  creditLimit?: string;
  /** 채널1 */
  channel?: string;
  /** 채널2 */
  channel2?: string;
  /** 채널3 */
  channel3?: string;
  /** Territory1(가상계좌 은행) */
  category1?: string;
  /** Territory2(가상계좌 계좌번호) */
  category2?: string;
  /** Territory3 */
  category3?: string;
  /** Territory4(관계사여부) */
  category4?: string;
  /** 구매거래처코드 */
  oldCustno?: string;
  /** 담보설정액 */
  collateralAmount?: string;
  /** 공정위보고 관련 거래처여부 */
  outsourcingYn?: string;
  /** 거래처상태 */
  custStatus?: string;
  /** ICONS_CODE */
  iconsCode?: string;
  /** 생성일시 */
  creationDate?: string;
  /** 생성자명 */
  createdName?: string;
  /** 최종수정자명 */
  lastUpdatedName?: string;
  /** 최종수정일시 */
  lastUpdateDate?: string;
}

/**
 * 거래처 등록 상세 응답 타입
 */
export interface BcncDetailResponse {
  /** 사무소ID */
  officeId?: string;
  /** 거래처코드 */
  custno?: string;
  /** 거래처명 */
  custname?: string;
  /** 거래처대외명 */
  custename?: string;
  /** 거래처약명 */
  custAbbrv?: string;
  /** 대륙코드 */
  rArea?: string;
  /** 대표자 */
  pname?: string;
  /** 법인번호 */
  pidno?: string;
  /** 사업자번호 */
  regtno?: string;
  /** 운송사코드 */
  carno?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 주소(매출거래처) */
  addr?: string;
  /** 주소(매입거래처) */
  paddr?: string;
  /** 팩스 */
  fax?: string;
  /** 업태 */
  uptae?: string;
  /** 종목 */
  jong?: string;
  /** 종목명 */
  jongName?: string;
  /** 사업장개업일 */
  odate?: string;
  /** 계약일(거래개시일자) */
  sdate?: string;
  /** ENGAGE */
  engage?: string;
  /** CDATE */
  cdate?: string;
  /** DISCOUNT */
  discount?: string;
  /** 점장 or 거래처담당자 */
  charger?: string;
  /** BUSINESS */
  business?: string;
  /** 주소(매입거래처) */
  baddr?: string;
  /** 모대리점코드 */
  pcustno?: string;
  /** 모대리점명 */
  pcustname?: string;
  /** EIDATE */
  eidate?: string;
  /** 은행코드 */
  bank?: string;
  /** DMAN */
  dman?: string;
  /** YSALE */
  ysale?: string;
  /** 대리점구분 */
  handle?: string;
  /** OTHER */
  other?: string;
  /** MSALE */
  msale?: string;
  /** CREDIT */
  credit?: string;
  /** MPOWER */
  mpower?: string;
  /** 거래처 계좌번호 */
  acctNbr?: string;
  /** CAR */
  car?: string;
  /** NOA 매출채권 보험가입여부 */
  etc?: string;
  /** OPENSTN */
  openstn?: string;
  /** 신용카드사 */
  dscr1?: string;
  /** 유형 */
  dscr2?: string;
  /** 은행, 계좌번호 */
  dscr3?: string;
  /** DSCR4 */
  dscr4?: string;
  /** 사업장전화번호 */
  tel?: string;
  /** PAY GROUP */
  method?: string;
  /** PAY GROUP명 */
  mthdName?: string;
  /** 거래처구분 */
  custnoGb?: string;
  /** 거래처구분명 */
  custnoGbName?: string;
  /** REGTNO_GB */
  regtnoGb?: string;
  /** END_GB */
  endGb?: string;
  /** DEMD_TYPE */
  demdType?: string;
  /** 지역 */
  ntnlCde?: string;
  /** CURR_UNIT */
  currUnit?: string;
  /** 지급조건 */
  stlmTerm?: string;
  /** 매입부가세타입 */
  vatType?: string;
  /** 사용여부 */
  useYno?: string;
  /** GBOCEXPN_YNO */
  gbocexpnYno?: string;
  /** SALE_GB */
  saleGb?: string;
  /** 예금주 */
  depositor?: string;
  /** SHIP_TO */
  shipToCust?: string;
  /** TUK */
  tuk?: string;
  /** 방면코드 */
  dpart?: string;
  /** DNAME */
  dname?: string;
  /** DTITLE */
  dtitle?: string;
  /** PUR_GB */
  purGb?: string;
  /** 미지급금계정 */
  acctNum1?: string;
  /** 미지급금계정명 */
  acctName1?: string;
  /** 선지급금계정 */
  acctNum2?: string;
  /** 선지급금계정명 */
  acctName2?: string;
  /** 사업장(Default : MHD) */
  orgId?: string;
  /** 국가코드 */
  nationalCde?: string;
  /** GST No. */
  binNo?: string;
  /** 쇼핑몰ID */
  cikNo?: string;
  /** 고객사 로그인 패스워드 */
  rnnNo?: string;
  /** 화폐단위 */
  currency?: string;
  /** 담당자명 */
  empyNme?: string;
  /** TAX_REG_NO */
  taxRegNo?: string;
  /** 개인여부 */
  personYn?: string;
  /** 매출부가세타입 */
  vatType2?: string;
  /** 매입부가세명 */
  vatNmeAp?: string;
  /** 매출부가세명 */
  vatNmeAr?: string;
  /** BILL_TO */
  billToCust?: string;
  /** PAY_TO */
  payToCust?: string;
  /** 영업관리프로그램 구분 */
  prmShopcd?: string;
  /** 전자세금계산서 e-Mail */
  emailId?: string;
  /** BILL_TO명 */
  billToName?: string;
  /** PAY_TO명 */
  payToName?: string;
  /** SHIP_TO명 */
  shipToName?: string;
  /** 구매입처코드 */
  oldVendor?: string;
  /** 구매출처코드 */
  oldCustno?: string;
  /** 구매입처Site코드 */
  oldVendorSite?: string;
  /** 구매출처Site코드 */
  oldCustSite?: string;
  /** 채널1 */
  channel?: string;
  /** 매출 담당자, 연락처 */
  phoneMobile1?: string;
  /** 매입 담당자, 연락처 */
  phoneMobile2?: string;
  /** 영업사원 */
  salesMan?: string;
  /** 영업사원명 */
  salesManName?: string;
  /** 수금은행코드 */
  receiptBank?: string;
  /** 수금은행 */
  receiptBankBranch?: string;
  /** 수금조건 */
  stlmTermAr?: string;
  /** 수금업체계좌번호 */
  receiptBankAccount?: string;
  /** 종사업장번호 */
  regtnoNo?: string;
  /** 보험한도 */
  creditSurety?: string;
  /** 여신한도 */
  creditLimit?: string;
  /** DUMMY */
  dummy?: string;
  /** Swift Code */
  swiftCode?: string;
  /** 채널2 */
  channel2?: string;
  /** 채널3 */
  channel3?: string;
  /** Territory1 */
  category1?: string;
  /** 은행명 */
  bankName?: string;
  /** Territory2 */
  category2?: string;
  /** Territory3 */
  category3?: string;
  /** Territory4 */
  category4?: string;
  /** 담보설정액 */
  collateralAmount?: string;
  /** 공정위보고 관련 거래처여부 */
  outsourcingYn?: string;
  /** 여신관리월수 */
  creditLimitMonths?: string;
  /** Priority */
  priority?: string;
  /** 거래처타입 */
  custType?: string;
  /** 국내/해외 */
  custArea?: string;
  /** 거래처유형 */
  custClass?: string;
  /** CUST_SPECIAL_REL */
  custSpecialRel?: string;
  /** 거래처상태 */
  custStatus?: string;
  /** ICONS_CODE */
  iconsCode?: string;
  /** 생성자 */
  createdBy?: string;
  /** 생성일시 */
  creationDate?: string;
  /** 최종수정자 */
  lastUpdatedBy?: string;
  /** 최종수정일시 */
  lastUpdateDate?: string;
  /** 프로그램ID */
  programId?: string;
  /** 터미널ID */
  terminalId?: string;
  /** 국가명 */
  nationName?: string;
  /** CO_UPLOAD */
  coUpload?: string;
  /** 대기업/중소기업구분 */
  smallBusinessFlag?: string;
  /** ATTRIBUTE1 */
  attribute1?: string;
}

/**
 * 거래처 등록 배송지 응답 타입
 */
export interface BcncShipResponse {
  /** 배송지ID */
  shipId?: string;
  /** 배송지거래처코드 */
  shipCustno?: string;
  /** 배송지명 */
  shipName?: string;
  /** 주요배송지여부 */
  primaryChk?: string;
  /** 배송지주소 */
  shipAddr?: string;
  /** 영업사원 */
  salesMan?: string;
  /** 영업사원명 */
  salesName?: string;
  /** 사용여부 */
  useYn?: string;
  /** 채널1 */
  channel?: string;
  /** 채널2 */
  channel2?: string;
  /** 채널3 */
  channel3?: string;
  /** Territory1 */
  category1?: string;
  /** Territory2 */
  category2?: string;
  /** Territory3 */
  category3?: string;
  /** Territory4 */
  category4?: string;
  /** 국가 */
  country?: string;
  /** 사업장 */
  orgId?: string;
  /** 국가명 */
  nationName?: string;
  /** 화폐단위 */
  currency?: string;
  /** 담당자 */
  chargeMan?: string;
  /** 전화번호 */
  phoneNum?: string;
  /** 담당자번호 */
  chargeNumber?: string;
  /** 팩스번호 */
  siteFaxNo?: string;
  /** 계약일 */
  contractFrom?: string;
  /** 계약만료일 */
  contractTo?: string;
  /** 비고 */
  attribute1?: string;
  /** 메모 */
  attribute2?: string;
}

/**
 * 거래처 등록 입력 관련정보 응답 타입
 */
export interface BcncInsertInfoResponse {
  /** PAY_GROUP */
  lsPayGroup?: string;
  /** 미지급금계정 */
  lsLiability?: string;
  /** 선지급금계정 */
  lsPrepay?: string;
  /** 다음 거래처코드 */
  lsCustno?: string;
  /** 미지급금계정명 */
  lsLiaName?: string;
  /** 선지급금계정명 */
  lsPreName?: string;
}

/**
 * 거래처 등록 저장 데이터 타입
 */
export interface BcncSaveData {
  /** 사무소ID */
  officeId: string;
  /** 거래처코드 */
  custno?: string;
  /** 거래처명 */
  custname?: string;
  /** 거래처대외명 */
  custename?: string;
  /** 거래처약명 */
  custAbbrv?: string;
  /** 대륙코드 */
  rArea?: string;
  /** 대표자 */
  pname?: string;
  /** 법인번호 */
  pidno?: string;
  /** 사업자번호 */
  regtno?: string;
  /** 운송사코드(SNF는 납기시간) */
  carno?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 주소(매출거래처) */
  addr?: string;
  /** 주소(매입거래처) */
  paddr?: string;
  /** 팩스 */
  fax?: string;
  /** 업태 */
  uptae?: string;
  /** 종목 */
  jong?: string;
  /** 사업장개업일 (ISO-8601 형식: yyyy-MM-dd) */
  odate?: string;
  /** 계약일(거래개시일자) (ISO-8601 형식: yyyy-MM-dd) */
  sdate?: string;
  /** ENGAGE */
  engage?: string;
  /** CDATE (ISO-8601 형식: yyyy-MM-dd) */
  cdate?: string;
  /** DISCOUNT */
  discount?: string;
  /** 점장 or 거래처담당자 */
  charger?: string;
  /** 직원코드 */
  business?: string;
  /** 주소(매입거래처) */
  baddr?: string;
  /** 모대리점코드(End User) */
  pcustno?: string;
  /** EIDATE (ISO-8601 형식: yyyy-MM-dd) */
  eidate?: string;
  /** DMAN */
  dman?: string;
  /** 연세우유 사용 우유, 두유 대리점 구분 */
  ysale?: string;
  /** 대리점구분 */
  handle?: string;
  /** OTHER */
  other?: string;
  /** MSALE (숫자) */
  msale?: string;
  /** CREDIT */
  credit?: string;
  /** MPOWER (숫자) */
  mpower?: string;
  /** CAR (숫자) */
  car?: string;
  /** NOA 매출채권 보험가입여부(Y 가입, N 미가입) */
  etc?: string;
  /** OPENSTN */
  openstn?: string;
  /** 신용카드사 */
  dscr1?: string;
  /** 유형 */
  dscr2?: string;
  /** 은행, 계좌번호 */
  dscr3?: string;
  /** DSCR4 */
  dscr4?: string;
  /** 전화번호 */
  tel?: string;
  /** PAY GROUP */
  method?: string;
  /** 거래처구분 (A:매출, B:매입, C:매출+매입) */
  custnoGb?: string;
  /** REGTNO_GB */
  regtnoGb?: string;
  /** END_GB */
  endGb?: string;
  /** DEMD_TYPE */
  demdType?: string;
  /** 지역 */
  ntnlCde?: string;
  /** 사용안함 */
  currUnit?: string;
  /** 지급조건 */
  stlmTerm?: string;
  /** 지급계좌번호 */
  acctNbr?: string;
  /** 매입부가세타입 */
  vatType?: string;
  /** 사용여부 (Y/N/O) */
  useYno?: string;
  /** GBOCEXPN_YNO (Y/N/O) */
  gbocexpnYno?: string;
  /** SALE_GB */
  saleGb?: string;
  /** 예금주 */
  depositor?: string;
  /** SHIP_TO */
  shipToCust?: string;
  /** 여신기본정책 적용 여부 'Y' 'N' */
  tuk?: string;
  /** 방면코드 */
  dpart?: string;
  /** DNAME */
  dname?: string;
  /** DTITLE */
  dtitle?: string;
  /** PUR_GB */
  purGb?: string;
  /** 미지급금계정 */
  acctNum1?: string;
  /** 선지급금계정 */
  acctNum2?: string;
  /** 사업장(Default : HO) */
  orgId?: string;
  /** 국가코드 */
  nationalCde?: string;
  /** GST No. */
  binNo?: string;
  /** 쇼핑몰ID */
  cikNo?: string;
  /** 고객사 로그인 패스워드 */
  rnnNo?: string;
  /** 화폐단위 */
  currency?: string;
  /** TAX_REG_NO */
  taxRegNo?: string;
  /** 개인여부 (Y/N) */
  personYn?: string;
  /** 매출부가세타입 */
  vatType2?: string;
  /** BILL_TO */
  billToCust?: string;
  /** PAY_TO */
  payToCust?: string;
  /** 영업관리프로그램 구분, 연세 사용안함 */
  prmShopcd?: string;
  /** 이메일 */
  emailId?: string;
  /** 구매입처코드 */
  oldVendor?: string;
  /** 구매출처코드 */
  oldCustno?: string;
  /** 구매입처Site코드 */
  oldVendorSite?: string;
  /** 구매출처Site코드 */
  oldCustSite?: string;
  /** 채널1 */
  channel?: string;
  /** 매출 담당자, 연락처 */
  phoneMobile1?: string;
  /** 매입 담당자, 연락처 */
  phoneMobile2?: string;
  /** 영업사원 */
  salesMan?: string;
  /** 수금조건 */
  stlmTermAr?: string;
  /** 종사업장번호 (숫자) */
  regtnoNo?: string;
  /** 보험한도 (숫자) */
  creditSurety?: string;
  /** 여신한도 (숫자) */
  creditLimit?: string;
  /** 채널2 */
  channel2?: string;
  /** 채널3 */
  channel3?: string;
  /** Territory1 */
  category1?: string;
  /** Territory2 */
  category2?: string;
  /** Territory3 */
  category3?: string;
  /** Territory4 */
  category4?: string;
  /** 담보설정액 (숫자) */
  collateralAmount?: string;
  /** 공정위보고 관련 거래처여부 (Y/N) */
  outsourcingYn?: string;
  /** 여신관리월수 (숫자) */
  creditLimitMonths?: string;
  /** Priority */
  priority?: string;
  /** 거래처타입 */
  custType?: string;
  /** 국내/해외 */
  custArea?: string;
  /** 거래처유형 */
  custClass?: string;
  /** CUST_SPECIAL_REL */
  custSpecialRel?: string;
  /** 거래처상태 */
  custStatus?: string;
  /** ICONS_CODE */
  iconsCode?: string;
  /** 대기업/중소기업구분(Y중소기업) */
  smallBusinessFlag?: string;
  /** ATTRIBUTE1 */
  attribute1?: string;
}

/**
 * 거래처 등록 저장 요청 타입
 */
export interface BcncSaveRequest {
  /** 거래처 정보 */
  data: BcncSaveData;
  /** 행 상태 (C:생성, U:수정, D:삭제) */
  rowStatus: "C" | "U" | "D";
}

