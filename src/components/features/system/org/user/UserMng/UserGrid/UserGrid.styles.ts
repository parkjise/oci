// ============================================================================
// 사용자 관리 그리드 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import styled from "styled-components";

export const UserGridStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; /* 추가 */
`;

export const GridContainer = styled.div`
  flex: 1;
  width: 100%;
  height: 100%; /* min-height: 0 대신 height: 100% 사용 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  .ag-theme-quartz {
    width: 100%;
    height: 100%;
    flex: 1;
  }
  
  /* 선택되지 않은 행의 클릭 하이라이트 강제 제거 */
  .ag-row-clicked:not(.ag-row-selected) {
    background-color: inherit !important;
    color: inherit !important;
  }
  
  .ag-row-clicked:not(.ag-row-selected) .ag-cell {
    background-color: inherit !important;
    color: inherit !important;
  }
`;

export const StatusIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const StatusIcon = styled.div<{ $backgroundColor: string; $iconColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  borderRadius: 50%;
  background-color: ${props => props.$backgroundColor};
  transition: all 0.2s ease;
  
  i {
    color: ${props => props.$iconColor};
    font-size: 14px;
    line-height: 1;
  }
`;


