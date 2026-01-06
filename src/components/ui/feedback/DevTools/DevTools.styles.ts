import styled from "styled-components";

export const StyledDevToolsContent = styled.div`
  min-height: 400px;
`;

export const StyledSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StyledCodeBlock = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
  max-height: 400px;
  overflow: auto;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  line-height: 1.5;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

export const StyledButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const StyledRequestList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
`;

export const StyledRequestItem = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  details {
    margin-top: 8px;
  }

  summary {
    user-select: none;
    color: #1890ff;
    
    &:hover {
      color: #40a9ff;
    }
  }
`;

