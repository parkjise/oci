/**
 * ============================================================================
 * FCM 공통 목록 조회 API
 * ============================================================================
 *
 * FCM 서비스의 공통 목록 조회 API 호출 함수 정의
 * 백엔드: fcm-service/src/main/java/com/ocic/onerp/com/list/controller/ListController.java
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";

// 공통 응답 타입 (백엔드의 ListResponse와 매핑)
export interface ListResponse {
  code?: string;
  name?: string;
  value?: string;
  label?: string;
  [key: string]: unknown;
}

// ========== 회계 관련 ==========

/**
 * 회계 지급은행번호 조회
 */
export const selectAccPayBnkNbrList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/account/payment-bank-number", request);
};

/**
 * 회계 비용센터 코드 조회
 */
export const selectAccCstCdeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/account/cost-center", request);
};

/**
 * 회계 계좌번호 조회
 */
export const selectAccNbrTrList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/account/account-number", request);
};

/**
 * 계정 유형 조회
 */
export const selectAccountTypeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/account/account-type", request);
};

/**
 * 회계 계정코드(재고) 조회
 */
export const selectAcctAcaccdeInvList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/account/account-code-inventory", request);
};

// ========== QA 관련 ==========

/**
 * QA 조회 코드 조회 (QM 모듈)
 */
export const selectQaLookupDCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/qa/lookup-code", request);
};

/**
 * QA 계획 조회 (QM 모듈)
 */
export const selectQaPlanList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/qa/plan", request);
};

// ========== 재고 관련 ==========

/**
 * 재고 자재 종류 조회
 */
export const selectInvMatkindList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/material-kind", request);
};

/**
 * 재고 자재 코드 조회
 */
export const selectInvMatlcodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/material-code", request);
};

/**
 * 재고 위치 조회
 */
export const selectInvLocationList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/location", request);
};

/**
 * 재고 BL 번호 조회
 */
export const selectInvBlNbrList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/bl-number", request);
};

/**
 * 재고 창고 조회
 */
export const selectSubinvList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/subinventory", request);
};

/**
 * 재고 재고량(FGI) 조회
 */
export const selectOnhandFgiList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/onhand-fgi", request);
};

/**
 * 재고 재고량(LOT) 조회
 */
export const selectOnhandLotList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/onhand-lot", request);
};

/**
 * 재고 비용센터 코드 조회
 */
export const selectInvCstCdeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/cost-center", request);
};

/**
 * 재고 조직 조회
 */
export const selectInvOrgList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/org", request);
};

/**
 * 재고 카테고리1 조회
 */
export const selectInvCateg1List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category1", request);
};

/**
 * 재고 카테고리2 조회
 */
export const selectInvCateg2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category2", request);
};

/**
 * 재고 카테고리3 조회
 */
export const selectInvCateg3List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category3", request);
};

/**
 * 재고 카테고리4 조회
 */
export const selectInvCateg4List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category4", request);
};

/**
 * 재고 카테고리5 조회
 */
export const selectInvCateg5List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category5", request);
};

/**
 * 재고 카테고리 배열1 조회
 */
export const selectInvCategArr1List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category-array1", request);
};

/**
 * 재고 카테고리 배열2 조회
 */
export const selectInvCategArr2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/category-array2", request);
};

/**
 * 재고 조직 카테고리1 조회
 */
export const selectInvOrgCateg1List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/org-category1", request);
};

/**
 * 재고 조직 카테고리2 조회
 */
export const selectInvOrgCateg2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/org-category2", request);
};

/**
 * 재고 품목 그룹 조회
 */
export const selectItemGroupList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/item-group", request);
};

/**
 * 재고 품목 대분류 조회
 */
export const selectItmgrp1List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/item-group1", request);
};

/**
 * 재고 품목 중분류 조회
 */
export const selectItmgrp2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/item-group2", request);
};

/**
 * 재고 품목 소분류 조회
 */
export const selectItmgrp3List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/inventory/item-group3", request);
};

// ========== 부가세/세금 관련 ==========

/**
 * 부가세 종류 조회
 */
export const selectTaxKindList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/tax/kind", request);
};

/**
 * 부가세 코드 조회
 */
export const selectTaxCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/tax/code", request);
};

/**
 * 부가세 카테고리1 조회
 */
export const selectTaxCate1List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/tax/category1", request);
};

/**
 * 부가세 카테고리2 조회
 */
export const selectTaxCate2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/tax/category2", request);
};

/**
 * 부가세 코드3 조회
 */
export const selectTaxCode3List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/tax/code3", request);
};

// ========== 공통 코드 조회 관련 ==========

/**
 * TR 조회 코드 조회
 */
export const selectTrLookupList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/tr", request);
};

/**
 * COM 조회 코드 조회
 */
export const selectComLookupCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/com", request);
};

/**
 * CTD 조회 코드 조회
 */
export const selectCtdLookupCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/ctd", request);
};

/**
 * DTI 상태 코드 조회
 */
export const selectdtiStatusCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/dti-status", request);
};

/**
 * 공통 코드 조회
 */
export const selectCacLookupsList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/cac", request);
};

/**
 * 원가 공통 코드 조회
 */
export const selectCostLookupsList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/lookup/cost", request);
};

// ========== CMMS 관련 ==========

/**
 * CMMS 조회 코드1 조회
 */
export const selectCmmLookupCodeList1 = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cmms/lookup1", request);
};

/**
 * CMMS 조회 코드2 조회
 */
export const selectCmmLookupCodeList2 = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cmms/lookup2", request);
};

/**
 * CMMS 조회 코드3 조회
 */
export const selectCmmLookupCodeList3 = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cmms/lookup3", request);
};

/**
 * CMMS 조회 동기화 코드 조회
 */
export const selectCmmLookupSyncCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cmms/lookup-sync", request);
};

// ========== 생산(WIP) 관련 ==========

/**
 * 생산 기준정보 조회
 */
export const selectWipLookups = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/wip/lookups", request);
};

/**
 * 생산 트랜잭션 유형 조회
 */
export const selectWipTType = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/wip/transaction-type", request);
};

/**
 * 생산 관련 부서 조회
 */
export const selectCmdeptcdWip = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/wip/dept", request);
};

// ========== 프로젝트 관련 ==========

/**
 * 공정 라인 코드 조회
 */
export const selectProcLineCdeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/project/process-line", request);
};

/**
 * 프로젝트 코드 조회
 */
export const selectProjectCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/project", request);
};

/**
 * 프로젝트 코드2 조회
 */
export const selectProjectCode2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/project2", request);
};

/**
 * 프로젝트 코드3 조회
 */
export const selectProjectCode3List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/project3", request);
};

// ========== 은행 관련 ==========

/**
 * 은행 계좌 조회
 */
export const selectBankAccountList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/bank/account", request);
};

/**
 * 은행 코드 조회
 */
export const selectBankCdeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/bank", request);
};

/**
 * 은행 코드(거래) 조회
 */
export const selectBankCdeTrList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/bank/transaction", request);
};

/**
 * 은행만 조회
 */
export const selectBankOnlyList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/bank/only", request);
};

/**
 * 은행 지역 조회
 */
export const selectBankRgnList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/bank/region", request);
};

// ========== 지급조건 관련 ==========

/**
 * 지급조건 조회
 */
export const selectTermsCodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/payment-terms", request);
};

/**
 * 지급조건 조회
 */
export const selectPaymentTermsList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/payment-terms/list", request);
};

/**
 * 지급조건2 조회
 */
export const selectPaymentTerms2List = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/payment-terms/list2", request);
};

// ========== 원가 관련 ==========

/**
 * 원가 코드 조회
 */
export const selectCdCostcodeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cost/code", request);
};

/**
 * 원가 코드(WIP) 조회
 */
export const selectCdCostcodeWip = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cost/code-wip", request);
};

/**
 * 원가 코드 원가(WIP) 조회
 */
export const selectCdCostcodeCostWip = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cost/code-cost-wip", request);
};

/**
 * 원가 부문 조회
 */
export const selectCostPartList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/cost/part", request);
};

// ========== 거래 유형 관련 ==========

/**
 * 거래 유형 조회
 */
export const selectTransactionTypeList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/transaction/type", request);
};

/**
 * 거래 유형(AR) 조회
 */
export const selectTransactionTypeArList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/transaction/type-ar", request);
};

/**
 * 거래 유형(OM) 조회
 */
export const selectTransactionTypeOmList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/transaction/type-om", request);
};

// ========== SCM 관련 ==========

/**
 * 품목 그룹(SCM) 조회
 */
export const selectItemGroupSCMList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/scm/item-group", request);
};

/**
 * 품목 군(SCM) 조회
 */
export const selectItemGunSCMList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/scm/item-gun", request);
};

// ========== 기타 ==========

/**
 * 국가 조회
 */
export const selectNationList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/nation", request);
};

/**
 * 중요도 기준 조회
 */
export const selectImportanceStdList = async (
  request: Record<string, unknown>
): Promise<ApiResponse<ListResponse[]>> => {
  return await post<ListResponse[]>("/com/list/importance-std", request);
};

