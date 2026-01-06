export interface BcncAcnutSrchRequest {
  /** 사무소ID */
  asOfficeId?: string;
  /** 거래처코드 */
  asCustno: string;
  /** 은행코드 */
  asBnkCde?: string;
}

export interface BcncAcnutListResponse {
  id?: string | number; // Added for Grid compatibility
  rowStatus?: "C" | "U" | "D" | "R" | ""; // Added for Grid status tracking (C:Create, U:Update, D:Delete, R:Read, "":Unchanged)
  /** 사무소ID */
  officeId: string;
  /** 거래처코드 */
  custno: string;
  /** 순번 */
  seq: number;
  /** 계좌번호 */
  acctNbr: string;
  /** 은행코드 */
  bankCode: string;
  /** 은행명 */
  bankName: string;
  /** Default 여부 */
  defaultYn: string;
  /** 가상계좌 여부 */
  virtualAcctYn: string;
  /** 예금주 */
  depositor: string;
  /** 입출금 구분 (1:입금, 2:출금) */
  inoutType: string;
  /** 비고 */
  remark: string;
  /** Swift Code */
  swiftCode: string;
  /** 화폐단위 */
  curr: string;
  /** DOC ID */
  docId: string;
  /** EAT KEY */
  eatKey: string;
  [key: string]: unknown;
}
