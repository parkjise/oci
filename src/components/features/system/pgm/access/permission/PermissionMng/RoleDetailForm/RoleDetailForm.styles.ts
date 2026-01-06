// ============================================================================
// 권한 상세 폼 스타일
// ============================================================================
// 변경이력:
// - 2025.01.15 : ckkim (최초작성)

import styled from "styled-components";

export const RoleDetailFormStyles = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;

  .ant-form-inline {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    padding-right: 10px;
    
    label {
      font-size: 12px;
      color: ${({ theme }) => theme.colors.neutral[600]};
    }
  }

  .divider {
    width: 1px;
    height: 15px;
    background-color: ${({ theme }) => theme.colors.neutral[300]};
  }
`;

