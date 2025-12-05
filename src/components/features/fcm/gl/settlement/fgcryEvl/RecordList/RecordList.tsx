import React, { useState, useMemo, useCallback } from "react";
import { RecordListStyles } from "./RecordList.styles";
import { type ColDef } from "ag-grid-community";
import { FormAgGrid, FormButton } from "@components/ui/form";
import { createTextColumn } from "@utils/agGridUtils";

// 외화평가 RecordList 데이터 타입 정의
export interface FgcryEvlListResponse {
  id?: string | number;
  dvs?: string; // 구분 (AP, AR, GL)
  slipNo?: string; // 전표번호
  reverseSlipNo?: string; // Reverse 전표
  posted?: string; // 전기여부 (Y/N)
  [key: string]: unknown;
}

type RecordListProps = {
  className?: string;
  items: FgcryEvlListResponse[];
  onSelect: (id: string) => void;
  selectedId: string;
  editingId?: string | null;
};

const RecordList: React.FC<RecordListProps> = ({ className, items, onSelect, selectedId, editingId }) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const columnDefs: ColDef<FgcryEvlListResponse>[] = useMemo(() => [
    {
      ...createTextColumn<FgcryEvlListResponse>("id", "ID", 120),
      hide: true,
      suppressHeaderMenuButton: true,
      editable: false,
      suppressColumnsToolPanel: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: "No.",
      width: 80,
      pinned: "left",
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("dvs", "구분", 100),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("slipNo", "전표번호", 200),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("reverseSlipNo", "Reverse 전표", 200),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<FgcryEvlListResponse>("posted", "전기여부", 100),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
  ], []);

  const listViewColumns = useMemo(() => columnDefs.filter(
    (col): col is ColDef<FgcryEvlListResponse> & { field: keyof FgcryEvlListResponse } =>
      Boolean(col.field) && col.hide !== true
  ), [columnDefs]);

  const getFieldValue = (item: FgcryEvlListResponse, field: keyof FgcryEvlListResponse) => {
    const value = item[field];
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  };

  const handleRowClick = useCallback((params: any) => {
    if (params.data) {
      const id = String(params.data.id || "");
      if (id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  const handleCellClick = useCallback((params: any) => {
    // 셀 클릭 시 행 전체 선택
    if (params.node) {
      params.node.setSelected(true);
    }
    if (params.data) {
      const id = String(params.data.id || "");
      if (id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  const handleSelectionChanged = useCallback((params: any) => {
    // 선택 변경 시 selectedId 업데이트 (중복 호출 방지)
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows.length > 0 && selectedRows[0]) {
      const id = String(selectedRows[0].id || "");
      if (id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  const handleCellDoubleClick = useCallback((params: any) => {
    // 더블클릭 시 편집 모드 진입 방지
    params.event?.stopPropagation();
    return false;
  }, []);

  const getRowStyle = useCallback((params: any) => {
    if (params.node.isSelected() || String(params.data?.id || "") === selectedId) {
      return { backgroundColor: "#fff7e6" };
    }
    return undefined;
  }, [selectedId]);

  const gridOptions = useMemo(() => ({
    pagination: false,
    defaultColDef: {
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    suppressClickEdit: true,
    suppressRowClickSelection: false,
    onCellClicked: handleCellClick,
    onCellDoubleClicked: handleCellDoubleClick,
    onSelectionChanged: handleSelectionChanged,
    getRowStyle: getRowStyle,
  }), [handleCellClick, handleCellDoubleClick, handleSelectionChanged, getRowStyle]);

  // items가 없거나 빈 배열일 때 처리
  const safeItems = items || [];
  
  return (
    <RecordListStyles className={className}>
      <div className="record-list__header">
        <span className="record-list__count">전체 <strong>{safeItems.length}</strong> 건</span>
        <div className="record-list__actions">
          <FormButton
            type="text"
            icon={<i className="ri-layout-grid-fill" />}
            size="small"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "active" : ""}
          />
          <FormButton
            type="text"
            icon={<i className="ri-list-check" />}
            size="small"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "active" : ""}
          />
        </div>
      </div>
      <div className={`record-list__content ${viewMode === "grid" ? "record-list__content--grid" : ""}`}>
        {safeItems.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
            조회된 데이터가 없습니다.
          </div>
        ) : viewMode === "list" ? (
          safeItems.map((item, index) => {
            const itemKey = String(item.id || `item-${index}`);
            const isEditing = editingId === String(item.id);
            // 필드를 두 줄로 나누기: 첫 번째 줄 (구분, 전표번호), 두 번째 줄 (Reverse 전표, 전기여부)
            const firstLineFields = listViewColumns.slice(0, 2);
            const secondLineFields = listViewColumns.slice(2);
            return (
              <div
                key={itemKey}
                className={`record-item ${selectedId === String(item.id) ? "active" : ""} ${isEditing ? "editing" : ""}`}
                onClick={() => {
                  if (String(item.id) !== selectedId) {
                    onSelect(String(item.id || ""));
                  }
                }}
              >
                <div className="record-item__line">
                  <div className="record-item__content">
                    <div className="record-item__line-first">
                      {firstLineFields.map(({ field }) => {
                        return (
                          <span key={String(field)} className="record-item__value">
                            {getFieldValue(item, field)}
                          </span>
                        );
                      })}
                    </div>
                    {secondLineFields.length > 0 && (
                      <div className="record-item__line-second">
                        {secondLineFields.map(({ field }) => {
                          return (
                            <span key={String(field)} className="record-item__value">
                              {getFieldValue(item, field)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <FormAgGrid<FgcryEvlListResponse>
            rowData={safeItems}
            columnDefs={columnDefs}
            height="100%"
            headerHeight={32}
            idField="id"
            gridOptions={{
              ...gridOptions,
              onRowClicked: handleRowClick,
            }}
            rowSelection="single"
          />
        )}
      </div>
    </RecordListStyles>
  );
};

export default RecordList;
