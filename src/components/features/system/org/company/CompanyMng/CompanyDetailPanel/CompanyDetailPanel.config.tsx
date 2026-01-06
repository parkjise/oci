/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Space, Upload } from "antd";
import { SearchOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { 
  FormInput, 
  FormButton, 
  FormSelect, 
  FormRadioGroup, 
  FormDatePicker, 
} from "@components/ui/form";
import type { TableField } from "@components/ui/form/DataForm/DataForm";
import { PhotoContainer, PhotoPreview } from "./CompanyDetailPanel.styles";

/* =============================================================================
   타입 정의 (Types)
   ============================================================================= */

export type InputComponentProps = {
  name: string;
  placeholder?: string;
  value?: any;
  onChange?: (val: any) => void;
  options?: Array<{ value: string; label: string }>;
  [key: string]: any;
};

export type InputComponentType = NonNullable<TableField["inputComponent"]>;

export interface FieldConfig {
  key?: string;
  label?: string | React.ReactNode;
  inputComponent?: InputComponentType;
  type?: "text" | "select" | "radio" | "date";
  labelKey?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  inputProps?: Partial<InputComponentProps>;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
  render?: (props: {
    field: TableField;
    value: any;
    onChange: (value: any) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
}

/* =============================================================================
   유틸리티 및 헬퍼 (Utilities & Helpers)
   ============================================================================= */

/**
 * 필드 설정 헬퍼
 */
export const createField = ({
  key = "",
  label = "",
  inputComponent,
  type = "text",
  labelKey,
  required,
  options,
  inputProps,
  render,
  ...restOptions
}: FieldConfig = {}): TableField => {
  let wrappedComponent: InputComponentType | undefined = inputComponent;

  const finalInputProps = { ...inputProps };
  if (required) {
    const rules = Array.isArray(finalInputProps.rules)
      ? [...finalInputProps.rules]
      : [];
    finalInputProps.rules = [
      ...rules,
      {
        required: true,
        message: `${
          typeof label === "string" ? label : labelKey || "필수 항목"
        }을(를) 입력하세요.`,
      },
    ];
  }

  // 기본 컴포넌트 자동 할당
  if (!wrappedComponent && !render) {
    if (type === "select") wrappedComponent = FormSelect as any;
    else if (type === "radio") wrappedComponent = FormRadioGroup as any;
    else if (type === "date") wrappedComponent = FormDatePicker as any;
    else wrappedComponent = FormInput as any;
  }

  if (wrappedComponent && !render) {
    const Component = wrappedComponent;
    wrappedComponent = ((props: InputComponentProps) => {
      return React.createElement(Component as any, {
        ...(options ? { options } : {}),
        layout: type === "radio" ? "horizontal" : undefined,
        ...finalInputProps,
        ...props,
        label: "", // DataForm handles labels
      });
    }) as InputComponentType;
  }

  return {
    key,
    label: (labelKey || label) as any,
    inputComponent: wrappedComponent,
    render,
    required, // DataForm uses this to show red asterisk
    ...restOptions,
  } as TableField;
};

/**
 * 사진 업로드 필드 생성
 */
export const createPhotoField = ({
  fileList,
  onFileChange,
  onUpload,
  onRemove,
  onDownload,
  t,
  mode: _mode,
}: {
  fileList: UploadFile[];
  onFileChange?: UploadProps["onChange"];
  onUpload?: UploadProps["customRequest"];
  onRemove?: () => void;
  onDownload?: () => void;
  t: (key: string) => string;
  mode?: "view" | "edit";
}) => {
  return createField({
    key: "photo",
    label: "직인",
    dataColspan: 3,
    render: ({ mode: renderMode }) => {
      const showUpload = renderMode === "edit";
      const file = fileList[0];
      const previewUrl = file?.url || file?.thumbUrl;

      return (
        <PhotoContainer>
          <Space align="start" size={16}>
            {previewUrl ? (
              <PhotoPreview
                src={previewUrl}
                alt={file?.name || "Signature"}
                style={{ display: 'block' }}
              />
            ) : (
              <div style={{ width: 100, height: 120, border: '1px solid #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#999', fontSize: '12px' }}>
                {t("직인없음")}
              </div>
            )}
            
            <Space direction="vertical" size={4}>
              {showUpload && onUpload && (
                <Upload
                  listType="picture"
                  fileList={fileList}
                  onChange={onFileChange}
                  customRequest={onUpload}
                  maxCount={1}
                  showUploadList={false}
                  accept="image/*"
                >
                  <FormButton icon={<SearchOutlined />} size="small" style={{ width: 85, justifyContent: 'flex-start' }}>
                    {t("직인등록")}
                  </FormButton>
                </Upload>
              )}
              {file && showUpload && onRemove && (
                <FormButton 
                  icon={<DeleteOutlined />} 
                  onClick={onRemove} 
                  size="small" 
                  danger
                  style={{ width: 85, justifyContent: 'flex-start' }}
                >
                  {t("삭제")}
                </FormButton>
              )}
              {file && onDownload && (
                <FormButton icon={<DownloadOutlined />} onClick={onDownload} size="small" style={{ width: 85, justifyContent: 'flex-start' }}>
                  {t("다운로드")}
                </FormButton>
              )}
            </Space>
          </Space>
        </PhotoContainer>
      );
    },
  });
};
