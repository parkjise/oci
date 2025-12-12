// ============================================================================
// 사업장 관리 그리드 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import styled from "styled-components";

export const WorkplaceGridStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const GridContainer = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
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

