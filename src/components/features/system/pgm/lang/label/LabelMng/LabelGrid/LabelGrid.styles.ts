// ============================================================================
// 다국어 라벨 그리드 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.02 : ckkim (그리드 레이아웃 수정 - 샘플 구조 적용)

import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const LabelGridStyles = styled.div`
  width: 100%;
  height: 100%;
  ${mixins.flex("flex-start", "flex-start", "column")}
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

// 그리드 컨테이너 (AgGrid를 감싸는 영역)
export const GridContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  
  /* FormAgGrid의 StyledAgGridContainer가 flex 레이아웃을 사용하도록 */
  > div {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
`;

