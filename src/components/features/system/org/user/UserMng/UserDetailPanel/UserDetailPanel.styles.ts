import styled from "styled-components";

export const DetailPanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const DeptSearchContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  
  .dept-search__input {
    flex: 1;
    min-width: 0;
  }
`;
