/**
 * 전표 등록 관련 TypeScript 타입 정의
 * 백엔드 DTO를 기반으로 작성됨
 */

/**
 * 전표 검색 요청 타입
 */
export interface SlipSrchRequest {
  asRpsnOffice?: string;
  slpHeaderId?: string;
  dvs?: string;
  dateFr?: string;
  dateTr?: string;
  asBltDate?: string;
  pageNum?: number;
  pageSize?: number;
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
 * 전표 목록 응답 타입
 */
export interface SlipListResponse {
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
  appSeq?: number;
  attribute8?: string;
  attribute10?: string;
  reference2?: string;
}

/**
 * 전표 헤더 응답 타입
 */
export interface SlipHderResponse {
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
  reference6?: string;
  reference7?: string;
  reference8?: string;
  reference9?: string;
  reference10?: string;
  sourceTable?: string;
  keyFieldNames?: string;
  keyDataType?: string;
  keyValue?: string;
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
  accMgmtNbr2?: string;
  accMgmtNbr2Type?: string;
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
  segment6?: string;
}

/**
 * 전표 상세 응답 타입
 */
export interface SlipDetailResponse {
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
 * 전표 헤더 요청 타입
 */
export interface SlipHderRequest {
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
  accMgmtNbr2?: string;
  accMgmtNbr2Type?: string;
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
 * 전표 상세 요청 타입
 */
export interface SlipDetailRequest {
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
 * 전표 저장 요청 타입
 */
export interface SlipSaveRequest {
  header?: SlipHderRequest;
  detailList?: SlipDetailRequest[];
}

/**
 * 승인 요청 타입
 */
export interface ConfmRequest {
  slpHeaderId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
}

/**
 * 승인 응답 타입
 */
export interface ConfmResponse {
  appSeq?: number;
  ackPer?: string;
  ackPerName?: string;
  ackDate?: string;
  status?: string;
}

/**
 * 승인 상세 응답 타입
 */
export interface ConfmDetailResponse {
  bltOfficeId?: string;
  bltDeptAckSlp?: string;
  bltDateAckSlp?: string;
  serAckSlp?: string;
  seqAckSlp?: string;
  drCrType?: string;
  creationDate?: string;
  deptName?: string;
  crtUser?: string;
  glDate?: string;
  voucherNum?: string;
  custname?: string;
  payMthd?: string;
  slpNumber?: string;
  remH?: string;
  totalAmtFr?: string;
  totalAmt?: string;
  coa?: string;
  exchgRate?: string;
  drAmt?: string;
  crAmt?: string;
  drAmtFr?: string;
  crAmtFr?: string;
  custName?: string;
  glDate1?: string;
  remD?: string;
  itemCode?: string;
  itemName?: string;
  itemSpec1?: string;
  accMgmtNbr1Nme?: string;
  accMgmtNbr2Nme?: string;
  bankName?: string;
  bankAcctNbr?: string;
  finGdsGrpCde?: string;
  finGdsGrpName?: string;
  itemDistType?: string;
  intRate?: string;
  slipExptnSrcName?: string;
  sourceKey?: string;
  curr?: string;
  blank?: string;
}

