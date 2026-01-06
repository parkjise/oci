// ============================================================================
// 다국어 메시지 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import axiosInstance from "@apis/common/axiosInstance";
import type { ApiResponse } from "@/types/com/api/axios.types";

// ============================================================================
// Types
// ============================================================================
export interface MessageDto {
  lang: string;
  msgKey: string;
  msgContents: string;
  msgIconType?: string;
  msgButtonType?: string;
  isUse?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdateDate?: string;
  programId?: string;
  terminalId?: string;
  oriLang?: string;
  oriMsgKey?: string;
  rowStatus?: "C" | "U" | "D";
}

export interface MessageSearchRequest {
  lang?: string;
  msgKey?: string;
  msgContents?: string;
}

export interface MessageSaveItem {
  rowStatus: "C" | "U" | "D";
  lang: string;
  msgKey: string;
  msgContents: string;
  msgIconType?: string;
  msgButtonType?: string;
  oriLang?: string;
  oriMsgKey?: string;
}

export interface MessageSaveRequest {
  messages: MessageSaveItem[];
}

// ============================================================================
// API Functions
// ============================================================================
/**
 * 메시지 목록 조회
 */
export const getMessageListApi = async (
  params: MessageSearchRequest
): Promise<ApiResponse<MessageDto[]>> => {
  const response = await axiosInstance.get("/system/pgm/lang/message", { params });
  return response.data;
};

/**
 * 메시지 상세 조회
 */
export const getMessageByKeyApi = async (
  lang: string,
  msgKey: string
): Promise<ApiResponse<MessageDto>> => {
  const response = await axiosInstance.get(`/system/pgm/lang/message/${lang}/${msgKey}`);
  return response.data;
};

/**
 * 메시지 저장 (추가/수정/삭제)
 */
export const saveMessageApi = async (
  request: MessageSaveRequest
): Promise<ApiResponse<{ result: string; insertCount: number; updateCount: number; deleteCount: number; message: string }>> => {
  const response = await axiosInstance.post("/system/pgm/lang/message", request);
  return response.data;
};

