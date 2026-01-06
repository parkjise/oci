import React from "react";
import type { TableField } from "../DataForm";
import type { UploadFile, UploadProps } from "antd";
import PhotoUpload from "./PhotoUpload";

export interface CreatePhotoFieldOptions {
  /** 파일 목록 */
  fileList: UploadFile[];
  /** 파일 변경 핸들러 */
  onFileChange?: UploadProps["onChange"];
  /** 파일 업로드 핸들러 */
  onUpload?: UploadProps["customRequest"];
  /** 파일 삭제 핸들러 */
  onRemove?: () => void;
  /** 파일 다운로드 핸들러 */
  onDownload?: () => void;
  /** 필드 키 (기본값: "photo") */
  key?: string;
  /** 필드 라벨 (기본값: "사진") */
  label?: string;
  /** 데이터 열 병합 (기본값: 5) */
  dataColspan?: number;
  /** 번역 함수 */
  t?: (key: string) => string;
  /** 모드 (view/edit) */
  mode?: "view" | "edit";
  /** PhotoUpload 컴포넌트 추가 props */
  photoUploadProps?: Partial<React.ComponentProps<typeof PhotoUpload>>;
}

/**
 * DataForm에서 사용할 수 있는 사진 업로드 필드 생성
 * 
 * @param options - 필드 생성 옵션
 * @returns TableField 객체
 * 
 * @example
 * ```tsx
 * const tableRows = [
 *   {
 *     fields: [
 *       createPhotoField({
 *         fileList,
 *         onUpload: handleFileUpload,
 *         onRemove: handleFileRemove,
 *         t,
 *         mode: "edit"
 *       })
 *     ]
 *   }
 * ];
 * ```
 */
export const createPhotoField = ({
  fileList,
  onFileChange,
  onUpload,
  onRemove,
  onDownload,
  key = "photo",
  label = "사진",
  dataColspan = 5,
  t,
  mode,
  photoUploadProps,
}: CreatePhotoFieldOptions): TableField => {
  return {
    key,
    label,
    dataColspan,
    render: ({ mode: renderMode }: { mode: "view" | "edit" }) => {
      const currentMode = mode || renderMode;
      return (
        <PhotoUpload
          fileList={fileList}
          onFileChange={onFileChange}
          onUpload={onUpload}
          onRemove={onRemove}
          onDownload={onDownload}
          mode={currentMode}
          t={t}
          {...photoUploadProps}
        />
      );
    },
  };
};

