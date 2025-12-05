// ============================================================================
// 메시지관리 페이지 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import styled from "styled-components";
import * as mixins from "@/styles/mixins";

// 페이지 전체 레이아웃
export const Article = styled.article`
  padding: 2rem;
  height: calc(100vh - 140px);
  width: 100%;
  overflow: hidden;
  ${mixins.flex("flex-start", "flex-start", "column", "10px")};
`;

// 상단 검색/버튼 영역 컨테이너
export const HeaderContainer = styled.div`
  margin-bottom: 10px;
  padding: 10px 10px 8px;
  border-bottom: 1px solid #d9d9d9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
`;

// 검색 조건 영역
export const SearchArea = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
`;

// 개별 검색 필드 컨테이너
export const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// 검색 라벨 (폭 고정으로 정렬 유지)
export const SearchLabel = styled.span`
  display: inline-block;
  width: 100px;
`;

// 버튼 영역
export const ButtonArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
`;

// Type 셀렉트박스 전용 래퍼 (폭 고정)
export const TypeSelectWrapper = styled.div`
  width: 150px;
  
  // ant-form-item의 높이를 조정하여 Select 박스와 정렬 맞춤
  .ant-form-item {
    margin-bottom: 0;
    height: auto;
    padding: 0;
    
    .ant-form-item-row {
      align-items: center;
    }
    
    .ant-form-item-control {
      line-height: 1;
      flex: 1;
    }
    
    .ant-form-item-control-input {
      min-height: auto;
      padding: 0;
    }
    
    .ant-form-item-control-input-content {
      line-height: 1;
      display: flex;
      align-items: center;
    }
  }
`;

