import React, { useEffect, useRef } from "react";
import { Space, Upload } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { FormButton } from "@components/ui/form";
import { showError } from "@components/ui/feedback";
import { isFileSizeExceeded, formatBytes } from "@utils/fileUtils";
import {
  PhotoContainer,
  PhotoPreview,
  PhotoPlaceholder,
} from "./PhotoUpload.styles";

export interface PhotoUploadProps {
  /** 업로드된 파일 목록 */
  fileList?: UploadFile[];
  /** 파일 변경 핸들러 */
  onFileChange?: UploadProps["onChange"];
  /** 파일 업로드 핸들러 */
  onUpload?: UploadProps["customRequest"];
  /** 파일 삭제 핸들러 */
  onRemove?: () => void;
  /** 파일 다운로드 핸들러 */
  onDownload?: () => void;
  /** 표시 모드 (view/edit) */
  mode?: "view" | "edit";
  /** 이미지 미리보기 너비 (기본값: 200px) */
  previewWidth?: number;
  /** 이미지 미리보기 높이 (기본값: 200px) */
  previewHeight?: number;
  /** 업로드 버튼 텍스트 */
  uploadButtonText?: string;
  /** 삭제 버튼 텍스트 */
  removeButtonText?: string;
  /** 다운로드 버튼 텍스트 */
  downloadButtonText?: string;
  /** 사진 없음 텍스트 */
  noPhotoText?: string;
  /** 허용할 이미지 타입 (기본값: "image/*") */
  accept?: string;
  /** 최대 파일 개수 (기본값: 1) */
  maxCount?: number;
  /** 최대 파일 크기 (MB 단위, 기본값: 제한 없음) */
  maxSizeInMB?: number;
  /** 용량 초과 에러 메시지 (선택사항) */
  maxSizeErrorMessage?: string;
  /** Blob URL 자동 관리 여부 (기본값: true) */
  autoManageBlobUrls?: boolean;
  /** 번역 함수 */
  t?: (key: string) => string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  fileList = [],
  onFileChange,
  onUpload,
  onRemove,
  onDownload,
  mode = "view",
  previewWidth = 200,
  previewHeight = 200,
  uploadButtonText,
  removeButtonText,
  downloadButtonText,
  noPhotoText,
  accept = "image/*",
  maxCount = 1,
  maxSizeInMB,
  maxSizeErrorMessage,
  autoManageBlobUrls = true,
  t,
}) => {
  const blobUrlsRef = useRef<string[]>([]);

  // Blob URL 자동 관리
  useEffect(() => {
    if (!autoManageBlobUrls || !fileList) return;

    const currentBlobUrls = fileList
      .map((file) => file.url || file.thumbUrl)
      .filter((url): url is string => !!url && url.startsWith("blob:"));

    // 새로 추가된 blob URL 추적
    currentBlobUrls.forEach((url) => {
      if (!blobUrlsRef.current.includes(url)) {
        blobUrlsRef.current.push(url);
      }
    });

    // fileList에서 제거된 blob URL 정리
    const removedUrls = blobUrlsRef.current.filter(
      (url) => !currentBlobUrls.includes(url)
    );
    removedUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // 이미 해제된 URL인 경우 무시
      }
    });
    blobUrlsRef.current = blobUrlsRef.current.filter(
      (url) => !removedUrls.includes(url)
    );
  }, [fileList, autoManageBlobUrls]);

  // 컴포넌트 언마운트 시 모든 blob URL 정리
  useEffect(() => {
    return () => {
      if (autoManageBlobUrls) {
        blobUrlsRef.current.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // 이미 해제된 URL인 경우 무시
          }
        });
        blobUrlsRef.current = [];
      }
    };
  }, [autoManageBlobUrls]);

  const showUpload = mode === "edit";
  const file = fileList[0];
  const previewUrl = file?.url || file?.thumbUrl;

  const getText = (key: string, defaultText: string) => {
    return t ? t(key) || defaultText : defaultText;
  };

  // 파일 용량 검증 핸들러
  const handleBeforeUpload = React.useCallback(
    (file: File): boolean => {
      if (!maxSizeInMB) {
        return true; // 용량 제한이 없으면 통과
      }

      if (isFileSizeExceeded(file, maxSizeInMB)) {
        const errorMessage =
          maxSizeErrorMessage ||
          `파일 크기는 ${maxSizeInMB}MB를 초과할 수 없습니다. (현재: ${formatBytes(
            file.size
          )})`;
        showError(errorMessage);
        return false; // 업로드 방지
      }

      return true;
    },
    [maxSizeInMB, maxSizeErrorMessage]
  );

  // 기본 다운로드 핸들러 (onDownload가 없을 때)
  const handleDefaultDownload = React.useCallback(() => {
    if (!file || !previewUrl) return;

    // Blob URL 또는 일반 URL 처리
    if (previewUrl.startsWith("blob:") || previewUrl.startsWith("http")) {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = file.name || "photo";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [file, previewUrl]);

  // 기본 파일 변경 핸들러 (onFileChange가 없을 때)
  const handleDefaultFileChange = React.useCallback<
    Required<UploadProps>["onChange"]
  >(() => {
    // 기본 동작: 특별한 처리 없음
  }, []);

  // 기본 업로드 핸들러 (onUpload가 없을 때)
  const handleDefaultUpload = React.useCallback<
    Required<UploadProps>["customRequest"]
  >(
    ({ file, onSuccess, onError }) => {
      try {
        // 기본 동작: 즉시 성공 처리 (로컬 미리보기용)
        const fileObj = typeof file === "string" ? null : (file as File);
        if (!fileObj) {
          onError?.(new Error("Invalid file"));
          return;
        }

        const previewUrl = URL.createObjectURL(fileObj);

        // Blob URL은 useEffect에서 자동으로 추적 및 관리됨 (fileList 업데이트 시)
        // 여기서는 ref에 직접 추가하지 않아도 됨

        // onFileChange 호출하여 외부 상태 업데이트
        // 주의: onFileChange가 없으면 상태가 업데이트되지 않을 수 있음
        if (onFileChange) {
          const uploadFile: UploadFile = {
            uid: String(Date.now()),
            name: fileObj.name,
            status: "done",
            url: previewUrl,
            thumbUrl: previewUrl,
          };
          const changeParam: Parameters<Required<UploadProps>["onChange"]>[0] =
            {
              fileList: [uploadFile],
              file: uploadFile,
            };
          onFileChange(changeParam);
        }

        onSuccess?.(previewUrl);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [onFileChange]
  );

  // 기본 삭제 핸들러 (onRemove가 없을 때)
  const handleDefaultRemove = React.useCallback(() => {
    // 기본 동작: fileList를 빈 배열로 변경 (onFileChange를 통해)
    if (onFileChange) {
      const changeParam: Parameters<Required<UploadProps>["onChange"]>[0] = {
        fileList: [],
        file: fileList[0] || ({} as UploadFile),
      };
      onFileChange(changeParam);
    }
  }, [fileList, onFileChange]);

  const finalOnDownload = onDownload || handleDefaultDownload;
  const finalOnFileChange = onFileChange ?? handleDefaultFileChange;
  const finalOnUpload = onUpload ?? handleDefaultUpload;
  const finalOnRemove = onRemove ?? handleDefaultRemove;

  return (
    <PhotoContainer>
      <Space align="start">
        {previewUrl ? (
          <PhotoPreview
            src={previewUrl}
            alt={file?.name || "Photo"}
            width={previewWidth}
            height={previewHeight}
          />
        ) : (
          <PhotoPlaceholder width={previewWidth} height={previewHeight}>
            {getText("사진없음", noPhotoText || "사진 없음")}
          </PhotoPlaceholder>
        )}

        <Space direction="vertical" size={4}>
          {showUpload && (
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={finalOnFileChange as UploadProps["onChange"]}
              customRequest={finalOnUpload as UploadProps["customRequest"]}
              beforeUpload={handleBeforeUpload}
              maxCount={maxCount}
              showUploadList={false}
              accept={accept}
            >
              <FormButton icon={<SearchOutlined />} size="small">
                {getText("사진등록", uploadButtonText || "사진 등록")}
              </FormButton>
            </Upload>
          )}
          {file && showUpload && (
            <FormButton
              icon={<DeleteOutlined />}
              onClick={finalOnRemove}
              size="small"
              danger
            >
              {getText("삭제", removeButtonText || "삭제")}
            </FormButton>
          )}
          {file && (
            <FormButton
              icon={<DownloadOutlined />}
              onClick={finalOnDownload}
              size="small"
            >
              {getText("다운로드", downloadButtonText || "다운로드")}
            </FormButton>
          )}
        </Space>
      </Space>
    </PhotoContainer>
  );
};

export default PhotoUpload;
