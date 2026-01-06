import styled from "styled-components";

export const PhotoContainer = styled.div`
  padding: 12px 0;
`;

export const PhotoPreview = styled.img<{ width?: number; height?: number }>`
  max-width: ${(props) => props.width || 200}px;
  max-height: ${(props) => props.height || 200}px;
  width: ${(props) => props.width || 200}px;
  height: ${(props) => props.height || 200}px;
  object-fit: contain;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: block;
`;

export const PhotoPlaceholder = styled.div<{ width?: number; height?: number }>`
  width: ${(props) => props.width || 200}px;
  height: ${(props) => props.height || 200}px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
`;

