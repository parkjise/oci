/**
 * 계정조회 팝업 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 계정조회 팝업 검색 요청 타입
 */
export interface AcntInqirePopupSrchRequest {
  /** 대표사무소 */
  asOfficeId?: string;
  /** 계정코드 */
  asAccCde?: string;
  /** 활성계정여부 */
  asAccActYn?: string;
  /** 원가지급여부 */
  asCstPayYn?: string;
  /** 사용여부 */
  asUseYn?: string;
  /** 계정레벨 */
  asAccLvl?: string;
}

/**
 * 계정조회 팝업 목록 응답 타입
 */
export interface AcntInqirePopupListResponse {
  /** 대표사무소 */
  officeId?: string;
  /** 계정코드 */
  accCode?: string;
  /** 계정명 */
  accName?: string;
  /** 계정영문명 */
  accEngName?: string;
  /** 계정약어 */
  accAbb?: string;
  /** 활성계정여부 */
  actAccYn?: string;
  /** 계정레벨 */
  accLvl?: string;

  // 관리항목 관련 추가 필드
  accMgmtNbr1Opt?: string;
  accMgmtNbr1Type?: string;
  accMgmtNbr2Opt?: string;
  accMgmtNbr2Type?: string;
  accMgmtNbr3Opt?: string;
  accMgmtNbr3Type?: string;
  mgmtNbr1TypeNme?: string;
  mgmtNbr2TypeNme?: string;
  mgmtNbr3TypeNme?: string;
  refOpt?: string;
  refType?: string;
  exchgRateOpt?: string;
  exchgRateType?: string;
  unitOpt?: string;
  unitType?: string;
  occurDateOpt?: string;
  maturDateOpt?: string;
  cstCdeOpt?: string;
  finGdsGrpOpt?: string;
  entItemYn?: string;
  pssnDeptYn?: string;
}

/**
 * 반환할 계정 데이터 타입
 */
export type SelectedAccount = AcntInqirePopupListResponse;
