import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { ICellRendererParams, IRowNode } from "ag-grid-community";
import type { GridRowData } from "../DetailGrid/DetailGrid";

const CommonSearchCellRenderer: React.FC<
  ICellRendererParams<GridRowData> & {
    onSearchClick?: (node: IRowNode<GridRowData>) => void;
    editable?: boolean;
  }
> = (props) => {
  const { value, node, onSearchClick, editable = true } = props;

  // onSearchClick이 props로 전달되지 않았을 경우를 대비해 colDef.cellRendererParams에서 가져옴
  const handleSearchClick = onSearchClick || (props as any).onSearchClick;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    padding: "0 4px",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle} title={String(value || "")}>
        {value}
      </span>
      {editable && (
        <SearchOutlined
          onClick={(e) => {
            e.stopPropagation();
            if (node && handleSearchClick) {
              handleSearchClick(node);
            }
          }}
          style={{
            cursor: "pointer",
            color: "#1890ff",
            marginLeft: "4px",
            fontSize: "14px",
          }}
        />
      )}
    </div>
  );
};

export default React.memo(CommonSearchCellRenderer);
