import styled from "styled-components";
import { SearchOutlined } from "@ant-design/icons";

export const CellContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 4px;
`;

export const ValueSpan = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.ag-cell-align-left {
    text-align: left;
  }
  &.ag-cell-align-center {
    text-align: center;
  }
  &.ag-cell-align-right {
    text-align: right;
  }
`;

export const SearchIcon = styled(SearchOutlined)`
  cursor: pointer;
  color: #1890ff;
  margin-left: 8px;
  font-size: 14px;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #40a9ff;
    background-color: #e6f7ff;
    transform: scale(1.1);
  }

  &:active {
    color: #096dd9;
    background-color: #bae7ff;
    transform: scale(0.95);
  }
`;
