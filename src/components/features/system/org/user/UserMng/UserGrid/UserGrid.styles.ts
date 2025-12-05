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
`;


