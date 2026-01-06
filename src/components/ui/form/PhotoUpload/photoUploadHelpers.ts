import React from "react";
import type { UploadFile, UploadProps } from "antd";
import { getFileListApi, getImageBlobApi, type FileItem } from "@apis/system/file/fileApi";

/**
 * 파일 업로드 핸들러 옵션
 */
export interface CreateFileUploadHandlerOptions {
  /** fileList 상태 설정 함수 */
  setFileList: (fileList: UploadFile[]) => void;
  /** 파일 변경 핸들러 (Upload의 onChange) */
  onFileChange?: (info: { fileList: UploadFile[]; file: UploadFile }) => void;
  /** 추가 처리 로직 (예: pending 정보 설정) */
  onBeforeSuccess?: (file: File) => void;
  /** 성공 후 처리 로직 */
  onAfterSuccess?: () => void;
}

/**
 * 파일 업로드 핸들러 생성
 * 
 * @param options - 핸들러 옵션
 * @returns Upload customRequest 핸들러
 * 
 * @example
 * ```tsx
 * const handleFileUpload = createFileUploadHandler({
 *   setFileList,
 *   onBeforeSuccess: (file) => {
 *     setPendingFileInfo({ file, ... });
 *   },
 *   onAfterSuccess: () => {
 *     syncGridFromDetailPanel(form.getFieldsValue());
 *   },
 * });
 * ```
 */
export const createFileUploadHandler = ({
  setFileList,
  onFileChange,
  onBeforeSuccess,
  onAfterSuccess,
}: CreateFileUploadHandlerOptions): Required<UploadProps>["customRequest"] => {
  return ({ file, onSuccess, onError }) => {
    try {
      const fileObj = typeof file === "string" ? null : (file as File);
      if (!fileObj) {
        onError?.(new Error("Invalid file"));
        return;
      }

      // Blob URL 생성 (PhotoUpload 컴포넌트가 autoManageBlobUrls로 자동 관리)
      const previewUrl = URL.createObjectURL(fileObj);

      // 추가 처리 로직 실행 (예: pending 정보 설정)
      onBeforeSuccess?.(fileObj);

      // fileList 업데이트를 위한 UploadFile 객체 생성
      const uploadFile: UploadFile = {
        uid: `local_${Date.now()}`,
        name: fileObj.name,
        status: "done",
        url: previewUrl,
        thumbUrl: previewUrl,
      };
      const newFileList = [uploadFile];
      
      // setFileList를 먼저 호출하여 상태 업데이트 (즉시 반영)
      setFileList(newFileList);
      
      // onFileChange도 호출하여 추가 처리 (예: 삭제 로직 등)
      if (onFileChange) {
        onFileChange({
          fileList: newFileList,
          file: uploadFile,
        });
      }

      onSuccess?.(previewUrl);

      // 성공 후 처리 로직 실행
      onAfterSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };
};

/**
 * 파일 삭제 핸들러 옵션
 */
export interface CreateFileRemoveHandlerOptions {
  /** fileList 상태 */
  fileList: UploadFile[];
  /** fileList 상태 설정 함수 */
  setFileList: (fileList: UploadFile[]) => void;
  /** 서버 파일 삭제 처리 로직 (로컬 파일이 아닌 경우에만 호출) */
  onRemoveServerFile?: (file: UploadFile) => void;
  /** 삭제 후 처리 로직 */
  onAfterRemove?: () => void;
}

/**
 * 파일 삭제 핸들러 생성
 * 
 * @param options - 핸들러 옵션
 * @returns 파일 삭제 핸들러
 * 
 * @example
 * ```tsx
 * const handleFileRemove = createFileRemoveHandler({
 *   fileList,
 *   setFileList,
 *   onRemoveServerFile: (file) => {
 *     if (!file.uid.startsWith("local_")) {
 *       setPendingDeleteInfo({ eatKey, eatIdx: file.uid, ... });
 *     }
 *   },
 *   onAfterRemove: () => {
 *     setPendingFileInfo(null);
 *     syncGridFromDetailPanel(form.getFieldsValue());
 *   },
 * });
 * ```
 */
export const createFileRemoveHandler = ({
  fileList,
  setFileList,
  onRemoveServerFile,
  onAfterRemove,
}: CreateFileRemoveHandlerOptions): (() => void) => {
  return () => {
    const targetFile = fileList[0];
    
    // 서버 파일인 경우 삭제 정보 설정 (로컬 파일이 아닌 경우)
    if (targetFile && targetFile.uid && !targetFile.uid.startsWith("local_")) {
      onRemoveServerFile?.(targetFile);
    }

    // fileList 초기화
    setFileList([]);

    // 삭제 후 처리 로직 실행
    onAfterRemove?.();
  };
};

/**
 * 서버 이미지 로딩 옵션
 */
export interface LoadServerImageFilesOptions {
  /** 이미지 키 (eatKey) */
  imgKey: number | string | null | undefined;
  /** 기본 파일명 (이미지가 없을 때) */
  defaultFileName?: string;
  /** Blob URL 추적을 위한 ref (서버 이미지의 Blob URL 관리용) */
  serverBlobUrlsRef?: React.MutableRefObject<string[]>;
  /** 로드 완료 후 호출될 콜백 */
  onLoadComplete?: (fileList: UploadFile[]) => void;
}

/**
 * 서버에서 이미지 파일 목록을 로드하여 UploadFile[]로 변환
 * 
 * @param options - 로딩 옵션
 * @returns Promise<UploadFile[]> - 변환된 파일 목록
 * 
 * @example
 * ```tsx
 * const serverBlobUrlsRef = useRef<string[]>([]);
 * 
 * if (selectedUser.empImgId && selectedUser.empImgId !== "PENDING") {
 *   const imgKey = parseInt(selectedUser.empImgId as string, 10);
 *   loadServerImageFiles({
 *     imgKey,
 *     defaultFileName: "photo",
 *     serverBlobUrlsRef,
 *     onLoadComplete: setFileList,
 *   });
 * }
 * ```
 */
export const loadServerImageFiles = async ({
  imgKey,
  defaultFileName = "photo",
  serverBlobUrlsRef,
  onLoadComplete,
}: LoadServerImageFilesOptions): Promise<UploadFile[]> => {
  if (!imgKey) {
    onLoadComplete?.([]);
    return [];
  }

  const numericImgKey = typeof imgKey === "string" ? parseInt(imgKey, 10) : imgKey;
  if (isNaN(numericImgKey)) {
    onLoadComplete?.([]);
    return [];
  }

  try {
    const res = await getFileListApi(numericImgKey);
    if (!res.success || !res.data || res.data.length === 0) {
      onLoadComplete?.([]);
      return [];
    }

    const files = await Promise.all(
      res.data.map(async (f: FileItem) => {
        const uid = String(f.eatIdx || f.uid || "");
        const name = f.fileName || f.name || defaultFileName;
        const fileItem = f as FileItem & { fileUrl?: string };
        let url = f.url || fileItem.fileUrl;

        // 이미지 파일인 경우 Blob으로 가져와서 Preview 생성
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name);
        if (uid && isImage) {
          try {
            const blob = await getImageBlobApi(numericImgKey, uid);
            const blobUrl = URL.createObjectURL(blob);
            
            // 서버 Blob URL 추적 (선택사항)
            if (serverBlobUrlsRef) {
              serverBlobUrlsRef.current.push(blobUrl);
            }
            
            url = blobUrl;
          } catch {
            console.error("이미지 로드 실패");
          }
        }

        return {
          uid,
          name,
          status: "done" as const,
          url: url,
          thumbUrl: url,
        };
      })
    );

    onLoadComplete?.(files);
    return files;
  } catch {
    onLoadComplete?.([]);
    return [];
  }
};

