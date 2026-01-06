import React from "react";
import styled from "styled-components";
import { Tag, Typography } from "antd";

const { Text } = Typography;

export const AttachmentDrawerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

export const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
`;

export const FileInput = styled.input`
  display: none;
`;

export const PendingFileList = styled.div`
  padding: 12px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.neutral?.[50] || "#f5f5f5"};
  border-radius: 4px;
  border: 1px dashed ${({ theme }) => theme.colors.neutral?.[300] || "#d9d9d9"};
`;

export const PendingFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.white || "#fff"};
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const AttachmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral?.[300] || "#e8e8e8"};
  margin-bottom: 12px;
`;

export const AttachmentList = styled.div<{ $isDragging?: boolean }>`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
  padding: 0 4px;
  border: 2px dashed transparent;
  border-radius: 4px;
  transition: all 0.2s ease;

  ${({ $isDragging }) =>
    $isDragging &&
    `
    border-color: #1890ff;
    background-color: #e6f7ff;
  `}
`;

export const AttachmentItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.colors.white || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.neutral?.[300] || "#e8e8e8"};
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const AttachmentItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
`;

export const AttachmentItemIcon = styled.div<{ fileType?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 6px;
  
  /* 파일 타입별 배경색 */
  background-color: ${({ fileType, theme }) => {
    const type = fileType?.toLowerCase();
    if (type === "pdf") return "#dc3545";
    if (type === "xls" || type === "xlsx") return "#28a745";
    if (type === "doc" || type === "docx") return "#007bff";
    if (type === "ppt" || type === "pptx") return "#ff6b35";
    if (type === "jpg" || type === "jpeg" || type === "png" || type === "gif") return "#6c757d";
    return theme.colors.neutral?.[50] || "#f5f5f5";
  }};

  i {
    font-size: 24px;
    color: ${({ fileType }) => {
      const type = fileType?.toLowerCase();
      if (type === "pdf" || type === "xls" || type === "xlsx" || 
          type === "doc" || type === "docx" || type === "ppt" || type === "pptx" ||
          type === "jpg" || type === "jpeg" || type === "png" || type === "gif") {
        return "#fff";
      }
      return "#666";
    }};
  }
`;

export const AttachmentItemInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FileName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.neutral?.[900] || "#333"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
`;

export const FileMeta = styled.div`
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.neutral?.[600] || "#666"};
  flex-wrap: wrap;

  span {
    &:not(:last-child)::after {
      content: "·";
      margin-left: 6px;
      margin-right: 6px;
    }
  }
`;

export const AttachmentItemActions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  padding-top: 6px;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral?.[300] || "#e8e8e8"};
  margin-top: 6px;
`;

export const AttachmentItemCheckbox = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export const AttachmentFooter = styled.div`
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral?.[300] || "#e8e8e8"};
  display: flex;
  justify-content: flex-end;
`;

export const PendingFileCountContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PendingFileCountTag = styled(Tag)`
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;

  strong {
    font-size: 14px;
  }

  i {
    font-size: 14px;
  }
`;

export const PendingFileDeleteLabel = styled.span`
  color: #ff4d4f;
  margin-left: 8px;
  font-size: 11px;
`;

export const EmptyFileMessage = styled(Text)`
  text-align: center;
  display: block;
  padding: 20px;
`;

export const LoadingText = styled(Text)`
  margin-top: 16px;
  display: block;
`;

// Modal 관련 스타일 (CSS 클래스로 정의)
export const modalStyle: React.CSSProperties = {
  top: 20,
};

export const modalBodyStyle: React.CSSProperties = {
  padding: 0,
  maxHeight: "calc(100vh - 200px)",
  overflow: "auto",
};

