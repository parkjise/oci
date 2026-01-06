// ============================================================================
// 파일 관리 API
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { get, post, del } from "@apis/common/api";
import { upload as uploadFile, download as downloadFile } from "@apis/com/file/fileApi";
import axiosInstance from "@apis/common/axiosInstance";
import type { ApiResponse } from "@/types/com/api/axios.types";
import { getDefaultFilePath } from "@/utils/fileUtils";

// ============================================================================
// Types
// ============================================================================

/**
 * 파일 아이템
 */
export interface FileItem {
  uid?: string;
  name?: string;
  status?: string;
  url?: string;
  eatIdx?: string;
  eatKey?: number;
  fileName?: string;
  remoteFile?: string;
  remotePath?: string;
  fileSize?: number;
  fileSeq?: number; // EAT_KEY (백엔드에서 반환)
  dataSeq?: number; // EAT_KEY (백엔드에서 반환)
}

/**
 * 파일 업로드 요청
 */
export interface FileUploadRequest {
  eatKey: number;
  edmsCode?: string;
  deptcode?: string;
  // subDir 제거: 서버에서 자동으로 날짜/EAT_KEY 형식으로 경로 생성
}

/**
 * EAT_KEY 생성 요청
 */
export interface EatKeyRequest {
  eatPath: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * 파일 목록 조회
 */
export const getFileListApi = async (
  eatKey: number,
  eatIdx?: string
): Promise<ApiResponse<FileItem[]>> => {
  return get<FileItem[]>(`/system/files/list/${eatKey}`, {
    params: { eatIdx },
  });
};

/**
 * 파일 업로드 (단일 파일)
 */
export const uploadFileApi = async (
  file: File,
  request: FileUploadRequest
): Promise<ApiResponse<FileItem[]>> => {
  const formData = new FormData();
  // 단일 파일도 files 배열로 전송
  formData.append("files", file);
  formData.append("eatKey", request.eatKey.toString());
  if (request.edmsCode) formData.append("edmsCode", request.edmsCode);
  if (request.deptcode) formData.append("deptcode", request.deptcode);
  // subDir 제거: 서버에서 자동으로 날짜/EAT_KEY 형식으로 경로 생성

  const response = await uploadFile<FileItem[]>("/system/files/upload", formData);
  return response;
};

/**
 * 여러 파일을 한 번에 업로드 (배치 업로드)
 */
export const uploadFilesBatchApi = async (
  files: File[],
  request: FileUploadRequest
): Promise<ApiResponse<FileItem[]>> => {
  if (files.length === 0) {
    throw new Error("업로드할 파일이 없습니다.");
  }

  const formData = new FormData();
  // 여러 파일을 files 필드에 배열로 추가
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("eatKey", request.eatKey.toString());
  if (request.edmsCode) formData.append("edmsCode", request.edmsCode);
  if (request.deptcode) formData.append("deptcode", request.deptcode);
  // subDir 제거: 서버에서 자동으로 날짜/EAT_KEY 형식으로 경로 생성

  return uploadFile<FileItem[]>("/system/files/upload", formData);
};

/**
 * 파일 다운로드
 */
export const downloadFileApi = async (
  eatKey: number,
  eatIdx: string,
  filename?: string
): Promise<void> => {
  return downloadFile(`/system/files/download/${eatKey}/${eatIdx}`, filename);
};

/**
 * EAT_KEY 생성
 */
export const createEatKeyApi = async (
  eatPath: string
): Promise<ApiResponse<number>> => {
  return post<number>("/system/files/createEatKey", {
    eatPath: eatPath || getDefaultFilePath(),
  });
};

/**
 * EAT_KEY 조회
 */
export const getEatKeyApi = async (): Promise<ApiResponse<number>> => {
  return get<number>("/system/files/getEatKey");
};

/**
 * 파일 삭제
 */
export const deleteFileApi = async (
  eatKey: number,
  eatIdx: string
): Promise<ApiResponse<void>> => {
  return del<void>(`/system/files/${eatKey}/${eatIdx}`);
};

/**
 * 전체 파일 다운로드 (ZIP)
 */
export const downloadAllFilesApi = async (
  eatKey: number
): Promise<void> => {
  // 백엔드에서 Content-Disposition 헤더로 파일명을 설정하므로 filename 파라미터 불필요
  return downloadFile(`/system/files/downloadAll/${eatKey}`);
};

/**
 * 이미지 파일을 Blob으로 가져오기 (인증 포함)
 * 인증이 필요한 이미지를 안전하게 로드하기 위해 사용
 */
export const getImageBlobApi = async (
  eatKey: number,
  eatIdx: string
): Promise<Blob> => {
  // axiosInstance를 사용하여 baseURL(/api)과 Authorization 헤더가 자동으로 추가됨
  const response = await axiosInstance.get(
    `/system/files/preview/${eatKey}/${eatIdx}`,
    {
      responseType: "blob",
      // skipAuth가 false이므로 자동으로 Authorization 헤더가 추가됨
    }
  );
  return response.data;
};
