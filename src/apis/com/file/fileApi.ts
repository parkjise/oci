/**
 * ============================================================================
 * 파일 업로드/다운로드 공통 API
 * ============================================================================
 */

import axiosInstance from "../../common/axiosInstance";
import type {
  ApiResponse,
  ApiRequestConfig,
} from "@/types/com/api/axios.types";

// --------------------------------------------------------------------------
// 유틸리티 함수
// --------------------------------------------------------------------------

/**
 * Content-Disposition 헤더에서 파일명을 추출하고 디코딩합니다.
 * @param contentDisposition - Content-Disposition 헤더 값
 * @returns 추출된 파일명 또는 null
 */
const extractFilenameFromHeader = (
  contentDisposition: string | undefined
): string | null => {
  if (!contentDisposition) {
    return null;
  }

  // filename*=UTF-8''... 형식 (RFC 5987) 우선 처리
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // 디코딩 실패 시 원본 반환
      return utf8Match[1];
    }
  }

  // filename="..." 또는 filename=... 형식 처리
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  );

  if (!filenameMatch || !filenameMatch[1]) {
    return null;
  }

  const extractedFilename = filenameMatch[1].replace(/['"]/g, "");

  // ISO-8859-1로 인코딩된 파일명 디코딩 시도
  // (백엔드에서 ISO-8859-1로 인코딩했을 수 있음)
  try {
    // escape/decodeURIComponent 조합으로 ISO-8859-1 디코딩
    return decodeURIComponent(escape(extractedFilename));
  } catch {
    // 디코딩 실패 시 원본 반환
    return extractedFilename;
  }
};

/**
 * Blob을 파일로 다운로드합니다.
 * @param blob - 다운로드할 Blob 객체
 * @param filename - 파일명
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // 정리 작업
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }, 100);
};

// --------------------------------------------------------------------------
// API 함수
// --------------------------------------------------------------------------

/**
 * 파일 업로드 (FormData)
 * @param url - 업로드할 API 엔드포인트 경로
 * @param formData - 업로드할 파일과 데이터가 포함된 FormData
 * @param config - 추가 Axios 설정 옵션
 * @returns API 응답 데이터
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append("files", file);
 * formData.append("eatKey", "123");
 * const response = await upload<FileItem[]>("/system/files/upload", formData);
 * ```
 */
export const upload = async <T>(
  url: string,
  formData: FormData,
  config?: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  const response = await axiosInstance.post<ApiResponse<T>>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * 파일 다운로드
 * @param url - 다운로드할 API 엔드포인트 경로
 * @param filename - 다운로드할 파일명 (선택사항, 없으면 Content-Disposition 헤더에서 추출)
 * @param config - 추가 Axios 설정 옵션
 * @returns Promise<void>
 * @example
 * ```typescript
 * // 파일명 자동 추출
 * await download("/system/files/download/123/abc");
 *
 * // 파일명 직접 지정
 * await download("/system/files/download/123/abc", "myfile.pdf");
 * ```
 */
export const download = async (
  url: string,
  filename?: string,
  config?: ApiRequestConfig
): Promise<void> => {
  const response = await axiosInstance.get(url, {
    ...config,
    responseType: "blob",
  });

  // 파일명 결정: 파라미터 > Content-Disposition 헤더 > 기본값
  let downloadFilename = filename;

  if (!downloadFilename) {
    const contentDisposition =
      response.headers["content-disposition"] ||
      response.headers["Content-Disposition"];
    downloadFilename =
      extractFilenameFromHeader(contentDisposition) || "download";
  }

  // Blob 생성 및 다운로드
  const blob = new Blob([response.data]);
  downloadBlob(blob, downloadFilename);
};
