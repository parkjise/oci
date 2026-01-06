import styled from "styled-components";

export const FilterPanelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 5px 0;

  .filter-panel__form {
    display: none; // 검색 조건이 없으면 폼 영역 자체를 숨김
  }

  .filter-panel__actions {
    display: flex;
    gap: 8px;
  }
`;
