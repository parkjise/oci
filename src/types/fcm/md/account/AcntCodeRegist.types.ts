/**
 * 계정코드 등록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 계정코드 등록 목록 응답 타입
 */
export interface AcntCodeListResponse {
  officeId?: string;                    // 회사코드
  accCode?: string;                     // 계정코드
  accName?: string;                     // 계정명
  accEngName?: string;                   // 계정영어명
  accAbb?: string;                       // 계정약명
  accOutName1?: string;                  // 계정명1(GL제무재표)
  accOutName2?: string;                  // 계정명2
  accOutName3?: string;                  // 계정명3(원가출력명)
  accOutName4?: string;                  // 계정명4(계정+계정명)
  highAccCode1?: string;                 // 계정대분류(상위계정코드1)
  highAccName1?: string;                 // 계정대분류명(상위계정코드1명)
  highAccCode2?: string;                 // 계정중분류(상위계정코드2)
  highAccName2?: string;                 // 계정중분류명(상위계정코드2명)
  highAccCode3?: string;                 // 계정소분류(상위계정코드3)
  highAccName3?: string;                 // 계정소분류명(상위계정코드3명)
  highAccCode4?: string;                 // 계정표시계정(상위계정코드4)
  highAccName4?: string;                 // 계정표시계정명(상위계정코드4명)
  highAccCode5?: string;                 // 상위계정코드5
  highAccName5?: string;                 // 상위계정코드5명
  dlyTbOutYn?: string;                   // 일계표출력여부
  glOutYn?: string;                      // GL사용여부
  mnfCstOutYn?: string;                  // 
  bsOutYn?: string;                      // 재무상태표 출력여부
  isOutYn?: string;                      // 손익계산서 출력여부
  prdExpnYn?: string;                    // 선급비용여부
  prepayAmtYn?: string;                  // Prepay YN(선급금여부)
  tbOutYn?: string;                      // 시산표 출력여부
  actAccYn?: string;                     // 실계정여부
  accMgmtNbr1Opt?: string;               // 관리번호1 사용여부
  accMgmtNbr1Type?: string;              // 관리번호1 타입
  accMgmtNbr2Opt?: string;               // 관리번호2 사용여부
  accMgmtNbr2Type?: string;              // 관리번호2 타입
  refOpt?: string;                       // REF 사용여부
  refType?: string;                      // REF 타입
  exchgRateOpt?: string;                 // 환율등 사용여부
  exchgRateType?: string;                 // 환율등 타입
  unitOpt?: string;                      // 단위등 사용여부
  unitType?: string;                     // 단위등 타입
  etcOpt?: string;                       // 기타 사용여부
  etcType?: string;                      // 기타 타입
  occurDateOpt?: string;                 // 발생일자 사용여부
  maturDateOpt?: string;                 // 만기일자 사용여부
  cstCdeOpt?: string;                    // 공정코드 사용여부
  finGdsGrpOpt?: string;                 // 품목군 사용여부
  accOutLvl?: string;                    // 계정관리레벨
  accMgmtLvl?: string;                   // 계정관리레벨
  bdgtCntlType?: string;                 // 
  tbBlncOutVndr?: string;                // 시산표 차대 출력구분
  bsPlOutType?: string;                  // 
  blncArgmYn?: string;                   // 
  entItemYn?: string;                    // 접대비여부
  zeroBlnc?: string;                     // 
  cdtDbtYn?: string;                     // 지결입력여부
  fundAckYn?: string;                    // 
  saleUseYn?: string;                    // 
  saleTrsfYn?: string;                   // 
  cashAccRap?: string;                   // 
  etcMftuExpnYn?: string;                // 
  facTbAccYn?: string;                   // 
  cstPayYn?: string;                     // 지출결의 표시여부
  cstDstYn?: string;                     // 품목별배부
  dstStndCode?: string;                  // 
  cbCode?: string;                       // 
  slgOutKnd?: string;                    // 
  alwcAccYn?: string;                    // 
  alwcAccCode?: string;                  // 
  mbltAltYn?: string;                    // 
  mbltAltAccCode?: string;               // 
  slgOutAccCode?: string;                // 
  drCrBltVndr?: string;                  // 
  ldgrMgmtVndr?: string;                 // 
  bsAccCode?: string;                    // 
  bsLineNo?: number;                     // 
  bsOutLoc?: string;                     // 
  bsAmtLoc?: string;                     // 
  bdgtMainDept?: string;                 // 
  domesAccCode?: string;                 // 
  tempDeptCode?: string;                 // 
  cipYn?: string;                        // CIP YN
  fundIcmExpnYn?: string;                // 출고시고정자산유형
  fundIcmExpnDr?: string;                // 
  incrDecrTypeDr?: string;                // 
  fundIcmExpnCr?: string;                // 
  incrDecrTypeCr?: string;                // 
  actSstmSeinYn?: string;                // 
  actSstmTbl?: string;                   // 고정자산 대분류 유형
  saleSstmSeinYn?: string;                // 실제원가배부계정여부
  saleSstmTbl?: string;                  // 실제원가배부상위계정
  pssnDeptYn?: string;                   // 귀속부서 여부
  cashFlowCode?: string;                 // 자금코드
  accountVfType?: string;                 // 
  plType?: string;                       // 손익분류항목
  plTypeName?: string;                   // 
  accLvl?: string;                       // 계정 LVL
  acctYearSeq?: number;                  // 
  useYn?: string;                        // 사용여부
  newYn?: string;                        // 신규여부
  saleItemCode?: string;                 // 
  lagacyCode?: string;                   // 과거코드
  ifrsRollType?: string;                 // 
  ifrsAcntType?: string;                 // 
  ifrsDescription?: string;              // 
  ifrsHierarchyCode?: string;            // 
  ifrsParentFlexValue?: string;          // 
  ifrsFlexValue?: string;                 // 
  ifrsSummaryFlag?: string;              // 
  ifrsLevelDetail?: number;               // 
  ifrsPath?: string;                     // 
  ifrsCategory?: string;                 // 
  ifrsOrderSeq?: number;                  // 
  ifrsSeq?: number;                       // IFRS 순번
  ifrsRevSign?: number;                  // 
  coType?: string;                       // 원가분류항목
  coTypeName?: string;                   // 
  acctType?: string;                     // 
  coHighCode?: string;                   // 관리원가집계항목
  effectiveDateFrom?: string;            // 사용시작일자 (yyyy-MM-dd)
  effectiveDateTo?: string;              // 사용종료일자 (yyyy-MM-dd)
  attribute1?: string;                   // 
  attribute2?: string;                   // 
  attribute3?: string;                   // 
  attribute4?: string;                   // 
  attribute5?: string;                   // 
  attribute6?: string;                   // 
  attribute7?: string;                   // 
  attribute8?: string;                   // 
  attribute9?: string;                   // 
  attribute10?: string;                  // 
  createdBy?: string;                    // 생성자ID
  createdByName?: string;                // 
  creationDate?: string;                  // 생성일시 (yyyy-MM-dd HH:mm:ss)
  lastUpdatedBy?: string;                // 최종변경자ID
  lastUpdatedByName?: string;            // 
  lastUpdateDate?: string;               // 최종수정일시 (yyyy-MM-dd HH:mm:ss)
  programId?: string;                    // 프로그램ID
  terminalId?: string;                   // 작업자IP
  vfType?: string;                       // 변동비/고정비 타입
  evidenceYn?: string;                   // 증빙관리 사용여부
  _rowId?: string;                       // 프론트엔드 식별용 ID (행 추적용)
}

/**
 * 계정코드 등록 검색 요청 타입
 */
export interface AcntCodeSrchRequest {
  asOfficeId?: string;                  // 회사코드
  asAccCode?: string;                   // 계정코드
  asUseYn?: string;                     // 사용여부
  asActAccYn?: string;                  // 실계정여부
  asAccLvl?: string;                    // 계정레벨
}

/**
 * 계정코드 등록 상위계정 응답 타입
 */
export interface AcntCodeHighResponse {
  highAccCode1?: string;
  highAccName1?: string;
  highAccCode2?: string;
  highAccName2?: string;
  highAccCode3?: string;
  highAccName3?: string;
  highAccCode4?: string;
  highAccName4?: string;
  highAccCode5?: string;
  highAccName5?: string;
  accLvl?: string;
}

/**
 * 계정코드 등록 저장 요청 타입
 */
export interface AcntCodeSaveRequest {
  list: AcntCodeListResponse[];
}
