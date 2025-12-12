/**
 * 전표 등록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 * 백엔드 DTO 경로: com.ocic.onerp.fcm.gl.slip.dto.request / com.ocic.onerp.fcm.gl.slip.dto.response
 */

/**
 * 전표 등록 검색 요청 타입
 * 백엔드: SlipRegistSrchRequest.java
 */
export interface SlipRegistSrchRequest {
  asRpsnOffice?: string;
  slpHeaderId?: string;
  dvs?: string;
  dateFr?: string;
  dateTr?: string;
  asBltDate?: string;
  slipType?: string;
  slipExptnSrc?: string;
  currency?: string;
  currencyNme?: string;
  makeDept?: string;
  makeDeptName?: string;
  posted?: string;
  description?: string;
  makeUser?: string;
  makeUserName?: string;
  asGCurr?: string;
  asGCurrDeci?: string;
  asGCurrFormat?: string;
}

/**
 * 전표 등록 목록 응답 타입
 * 백엔드: SlipRegistListResponse.java
 */
export interface SlipRegistListResponse {
  exptnTgt?: string;
  glNumber?: string;
  description?: string;
  slipTypeName?: string;
  slipExptnSrcName?: string;
  sumTotAmt?: number;
  crDbCnt?: number;
  makeDept?: string;
  makeDeptName?: string;
  curUnit?: string;
  exchgRateType?: string;
  exchgRate?: number;
  slpHeaderId?: string;
  slipType?: string;
  slipExptnSrc?: string;
  gCurr?: string;
  gCurrDeci?: string;
  gCurrFormat?: string;
  custname?: string;
  sourceTable?: string;
  sourceKeyName?: string;
  sourceKey?: string;
  dSourceId?: string;
  dvsName?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  createdByName?: string;
  creationDate?: string;
  lastUpdatedByName?: string;
  lastUpdateDate?: string;
  terminalId?: string;
  programId?: string;
  ackPerName?: string;
  ackDate?: string;
  eatKey?: string;
  docId?: string;
  edimStatus?: string;
  edimStatusName?: string;
  statusClass?: string;
  appSeq?: number;
  attribute8?: string;
  attribute10?: string;
  reference2?: string;
}

/**
 * 전표 등록 헤더 응답 타입
 * 백엔드: SlipRegistHderResponse.java
 */
export interface SlipRegistHderResponse {
  bltOfficeId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  makeDept?: string;
  slipType?: string;
  slipName?: string;
  sumTotAmt?: string;
  firstInput?: string;
  crDbCnt?: string;
  udateFrq?: string;
  ackPer?: string;
  ackDate?: string;
  exptnTgt?: string;
  slipExptnSrc?: string;
  slipExptnName?: string;
  mkOfficeId?: string;
  mkDeptActCertf?: string;
  mkDateActCertf?: string;
  serActCertf?: string;
  orgId?: string;
  userId?: string;
  wrkDate?: string;
  deptNme?: string;
  deptAbrrv?: string;
  ackSeq?: string;
  slpHeaderId?: string;
  keyFieldNames?: string;
  keyDataType?: string;
  keyValue?: string;
  curUnit?: string;
  exchgRateType?: string;
  exchgRate?: string;
  bankCode?: string;
  bankAccount?: string;
  reference3?: string;
  reference4?: string;
  reference5?: string;
  reference2?: string;
  custName?: string;
  bankName?: string;
  reference1?: string;
  cashFlowCode?: string;
  dvs?: string;
  description?: string;
  reference10?: string;
  sourceTable?: string;
  makerName?: string;
  makerDeptName?: string;
  srcTblNme?: string;
  sourceKey?: string;
  magamTag?: string;
  magamGlTag?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  eatKey?: string;
  docId?: string;
  edimStatus?: string;
  edimStatusName?: string;
  appSeq?: string;
  glSlipNo?: string;
  pOrg?: string;
  attribute10?: string;
  attribute8?: string;
  segment6?: string;
}

/**
 * 전표 등록 상세 응답 타입
 * 백엔드: SlipRegistDetailResponse.java
 */
export interface SlipRegistDetailResponse {
  bltOfficeId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  seqAckSlp?: string;
  drCrType?: string;
  makeDept?: string;
  slipType?: string;
  accCode?: string;
  bdgtCode?: string;
  occurAmt?: string;
  rem?: string;
  dvs?: string;
  pssnDept?: string;
  deptName?: string;
  exptnTgt?: string;
  slipExptnSrc?: string;
  accMgmtNbr1Type?: string;
  accMgmtNbr1?: string;
  accMgmtNbr2Type?: string;
  accMgmtNbr2?: string;
  accMgmtNbr3Type?: string;
  accMgmtNbr3?: string;
  fundIcmExpnCde?: string;
  occurDate?: string;
  maturDate?: string;
  unit?: string;
  exchgRate?: string;
  accRelAmt?: string;
  taxType?: string;
  vatWthTaxType?: string;
  entExpnYn?: string;
  cstInclsYn?: string;
  costCode?: string;
  finGdsGrpCode?: string;
  grpName?: string;
  cashFlowCode?: string;
  trReDept?: string;
  trReType?: string;
  sendYn?: string;
  bltOfficeIdTrr?: string;
  bltDeptTrrSlp?: string;
  bltDateTrrSlp?: string;
  serTrrSlp?: string;
  seqTrrSlp?: string;
  mkOfficeId?: string;
  mkDeptActCertf?: string;
  mkDateActCertf?: string;
  serActCertf?: string;
  seqActCertf?: string;
  fixAssRgstYn?: string;
  orgId?: string;
  userId?: string;
  wrkDate?: string;
  projectCode?: string;
  projectName?: string;
  drAmt?: string;
  crAmt?: string;
  drRelAmt?: string;
  crRelAmt?: string;
  accCodeDetail?: string;
  accName?: string;
  accAbb?: string;
  actAccYn?: string;
  accMgmtNbr1Opt?: string;
  accMgmtNbr2Opt?: string;
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
  exRateType?: string;
  drCrBltVndr?: string;
  pssnDeptYn?: string;
  cashFlowCodeDetail?: string;
  bdgtCntlType?: string;
  bdgtMainDept?: string;
  fundIcmExpnYn?: string;
  protectYn?: string;
  fixYn?: string;
  taxYn?: string;
  entYn?: string;
  accDtlYn?: string;
  vatYn?: string;
  wonYn?: string;
  trsVatYn?: string;
  mgmt1Nme?: string;
  costCodeName?: string;
  payMkOfficeId?: string;
  payMkDeptPayCertf?: string;
  payMkDatePayCertf?: string;
  paySerPayCertf?: string;
  slpHeaderId?: string;
  paymentApplySeq?: string;
  ackSeq?: string;
  mgmtNbr1TypeNme?: string;
  accMgmtNbr1Nme?: string;
  mgmtNbr2TypeNme?: string;
  accMgmtNbr2Nme?: string;
  custname?: string;
  fromSource?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  curr?: string;
  occurAmtFr?: string;
  intRate?: string;
  caseValue?: string;
  subModuleKey?: string;
  srcTblNme?: string;
  eCurrFormat?: string;
  eCurrDeci?: string;
  eCurrConvRate?: string;
  gCurr?: string;
  gCurrDeci?: string;
  gCurrFormat?: string;
  channel1?: string;
  channel2?: string;
  channel3?: string;
  itemSegment1?: string;
  itemSegment2?: string;
  itemSegment3?: string;
  itemCode?: string;
  itemName?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  pOrg?: string;
}

/**
 * 전표 등록 헤더 요청 타입
 * 백엔드: SlipRegistHderRequest.java
 */
export interface SlipRegistHderRequest {
  slpHeaderId?: string;
  bltOfficeId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  makeDept?: string;
  slipType?: string;
  sumTotAmt?: string;
  firstInput?: string;
  crDbCnt?: string;
  udateFrq?: string;
  ackPer?: string;
  ackDate?: string;
  ackSeq?: string;
  exptnTgt?: string;
  slipExptnSrc?: string;
  mkOfficeId?: string;
  mkDeptActCertf?: string;
  mkDateActCertf?: string;
  serActCertf?: string;
  orgId?: string;
  userId?: string;
  wrkDate?: string;
  description?: string;
  curUnit?: string;
  exchgRateType?: string;
  exchgRate?: string;
  bankCode?: string;
  bankAccount?: string;
  accMgmtNbr2?: string;
  accMgmtNbr2Type?: string;
  reference3?: string;
  reference4?: string;
  reference5?: string;
  reference2?: string;
  reference1?: string;
  cashFlowCode?: string;
  dvs?: string;
  reference6?: string;
  reference7?: string;
  reference8?: string;
  reference9?: string;
  reference10?: string;
  sourceTable?: string;
  keyFieldNames?: string;
  keyDataType?: string;
  keyValue?: string;
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
  eatKey?: string;
  docId?: string;
  appSeq?: string;
  rowStatus?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  programId?: string;
  terminalId?: string;
}

/**
 * 전표 등록 상세 요청 타입
 * 백엔드: SlipRegistDetailRequest.java
 */
export interface SlipRegistDetailRequest {
  slpHeaderId?: string;
  bltOfficeId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  seqAckSlp?: string;
  drCrType?: string;
  makeDept?: string;
  slipType?: string;
  accCode?: string;
  bdgtCode?: string;
  occurAmt?: string;
  rem?: string;
  dvs?: string;
  pssnDept?: string;
  exptnTgt?: string;
  slipExptnSrc?: string;
  accMgmtNbr1Opt?: string;
  accMgmtNbr1Type?: string;
  accMgmtNbr1?: string;
  accMgmtNbr2Opt?: string;
  accMgmtNbr2Type?: string;
  accMgmtNbr2?: string;
  accMgmtNbr3Type?: string;
  accMgmtNbr3?: string;
  fundIcmExpnCde?: string;
  occurDate?: string;
  maturDate?: string;
  unit?: string;
  exchgRate?: string;
  accRelAmt?: string;
  taxType?: string;
  vatWthTaxType?: string;
  entExpnYn?: string;
  cstInclsYn?: string;
  costCode?: string;
  finGdsGrpCode?: string;
  cashFlowCode?: string;
  trReDept?: string;
  trReType?: string;
  sendYn?: string;
  bltOfficeIdTrr?: string;
  bltDeptTrrSlp?: string;
  bltDateTrrSlp?: string;
  serTrrSlp?: string;
  seqTrrSlp?: string;
  mkOfficeId?: string;
  mkDeptActCertf?: string;
  mkDateActCertf?: string;
  serActCertf?: string;
  seqActCertf?: string;
  fixAssRgstYn?: string;
  orgId?: string;
  userId?: string;
  wrkDate?: string;
  ackSeq?: string;
  paymentApplySeq?: string;
  fromSource?: string;
  projectCode?: string;
  itemCode?: string;
  channel1?: string;
  channel2?: string;
  channel3?: string;
  itemSegment1?: string;
  itemSegment2?: string;
  itemSegment3?: string;
  curr?: string;
  occurAmtFr?: string;
  exRateType?: string;
  intRate?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  rowStatus?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  programId?: string;
  terminalId?: string;
}

/**
 * 전표 등록 저장 요청 타입
 * 백엔드: SlipRegistSaveRequest.java
 */
export interface SlipRegistSaveRequest {
  header?: SlipRegistHderRequest;
  detailList?: SlipRegistDetailRequest[];
}

/**
 * 전표 등록 승인 요청 타입
 * 백엔드: SlipRegistConfmRequest.java
 */
export interface SlipRegistConfmRequest {
  asRpsnOffice?: string;
  slpHeaderId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
}

/**
 * 전표 등록 승인 응답 타입
 * 백엔드: SlipRegistConfmResponse.java
 */
export interface SlipRegistConfmResponse {
  appSeq?: number;
  ackPer?: string;
  ackPerName?: string;
  ackDate?: string;
  status?: string;
}
