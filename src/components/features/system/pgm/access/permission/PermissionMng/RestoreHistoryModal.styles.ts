import styled from "styled-components";

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
`;

export const FilterWrapper = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 15px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

export const GridWrapper = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  overflow: hidden;
  height: 500px;
`;
