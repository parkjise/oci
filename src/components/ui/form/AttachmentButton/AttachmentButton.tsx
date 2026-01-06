import React from "react";
import { Tooltip, Badge } from "antd";
import styled from "styled-components";
import FormButton from "../Button/FormButton";

const AttachmentButtonContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .attachment-badge {
    position: absolute;
    top: -6px;
    right: -22px;
    
    .ant-scroll-number {
      color: ${({ theme }) => theme.colors.white};
      font-size: 11px;
    }
    
    .ant-badge-multiple-words {
      padding: 0 6px;
    }
  }
`;

export interface AttachmentButtonProps {
  /** 파일 개수 */
  count?: number;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 버튼 크기 (기본값: "small") */
  size?: "small" | "middle" | "large";
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 툴팁 텍스트 (기본값: "첨부파일") */
  tooltip?: string;
  /** 커스텀 className */
  className?: string;
}

/**
 * 첨부파일 버튼 컴포넌트
 * DataForm과 그리드에서 공통으로 사용
 */
export const AttachmentButton: React.FC<AttachmentButtonProps> = ({
  count = 0,
  onClick,
  size = "small",
  disabled = false,
  tooltip = "첨부파일",
  className,
}) => {
  return (
    <AttachmentButtonContainer className={className}>
      <Tooltip title={tooltip}>
        <FormButton
          icon={<i className="ri-attachment-2" style={{ fontSize: 20 }} />}
          size={size}
          onClick={onClick}
          disabled={disabled}
          className="detail-view__button detail-view__button--more"
        />
      </Tooltip>
      {count > 0 && (
        <Badge
          className="attachment-badge"
          count={count}
          color="#DC3545"
        />
      )}
    </AttachmentButtonContainer>
  );
};

