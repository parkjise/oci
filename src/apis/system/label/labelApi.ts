// ============================================================================
// 다국어 라벨 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post } from "@apis/common/api";
import type { ApiResponse } from "@/types/axios.types";

// ============================================================================
// Types
// ============================================================================

/**
 * 다국어 라벨 DTO
 */
export interface LabelDto {
  locale: string; // LOCABLE
  key: string; // L_KEY
  label: string; // LABLE
  desc?: string; // LABLE_DESC
  createdBy?: string; // CREATED_BY
  creationDate?: string; // CREATION_DATE
  lastUpdatedBy?: string; // LAST_UPDATED_BY
  lastUpdateDate?: string; // LAST_UPDATE_DATE
  programId?: string; // PROGRAM_ID
  terminalId?: string; // TERMINAL_ID
  oriLocable?: string; // ORI_LOCABLE (수정 시 사용)
  oriLKey?: string; // ORI_L_KEY (수정 시 사용)
  rowStatus?: string; // 행 상태 (C: 추가, U: 수정, D: 삭제)
}

/**
 * 다국어 라벨 검색 요청
 */
export interface LabelSearchRequest {
  asLang?: string; // 언어 코드
  asKey?: string; // 레이블 키
  asWord?: string; // 레이블 단어
}

/**
 * 다국어 라벨 저장 요청 항목
 */
export interface LabelSaveItem {
  rowStatus: string; // C: 추가, U: 수정, D: 삭제
  locable: string; // 언어 코드
  lKey: string; // 레이블 키
  lable?: string; // 레이블 내용
  lableDesc?: string; // 레이블 설명
  oriLocable?: string; // 원본 언어 코드 (수정 시 사용)
  oriLKey?: string; // 원본 레이블 키 (수정 시 사용)
}

/**
 * 다국어 라벨 저장 요청
 */
export interface LabelSaveRequest {
  labels: LabelSaveItem[];
}

/**
 * 저장 응답
 */
export interface SaveResponse {
  result: string; // S: 성공, F: 실패
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 다국어 라벨 목록 조회
 */
export const getLabelListApi = async (
  params?: LabelSearchRequest
): Promise<ApiResponse<LabelDto[]>> => {
  return get<LabelDto[]>("/system/pgm/lang/label", {
    params: {
      asLang: params?.asLang,
      asKey: params?.asKey,
      asWord: params?.asWord,
    },
  });
};

/**
 * 다국어 라벨 저장 (추가/수정/삭제)
 */
export const saveLabelApi = async (
  request: LabelSaveRequest
): Promise<ApiResponse<SaveResponse>> => {
  return post<SaveResponse>("/system/pgm/lang/label", request);
};


