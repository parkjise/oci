import styled from "styled-components";

export const DetailPanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const PhotoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  padding: 4px 0;
`;

export const PhotoPreview = styled.img`
  width: 100px;
  height: 120px;
  object-fit: contain;
  border: 1px solid ${({ theme }) => theme?.colors?.neutral?.[300] || "#d9d9d9"};
  border-radius: 4px;
  background-color: #f5f5f5;
  display: block;
`;
