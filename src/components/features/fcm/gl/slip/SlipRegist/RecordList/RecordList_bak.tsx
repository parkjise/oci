import React, { useState, useMemo, useCallback } from "react";
import { Button, Tooltip, Tag } from "antd";
import { RecordListStyles } from "./RecordList.styles";
import type { SlipRegistListResponse } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import { FormAgGrid } from "@components/ui/form";
import { createTextColumn } from "@utils/agGridUtils";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import type { ColDef } from "ag-grid-community";
import dayjs from "dayjs";

type RecordListProps = {
  className?: string;
};

const RecordList: React.FC<RecordListProps> = ({ className }) => {
  const { slipList, selectedSlipId, handleSelectSlipWithEditMode } = useSlipRegist();
  const items = slipList;
  const selectedId = selectedSlipId || "";
  const onSelect = handleSelectSlipWithEditMode;
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");

  // 그리드 컬럼 정의
  const columnDefs: ColDef<SlipRegistListResponse>[] = useMemo(() => [
    {
      ...createTextColumn<SlipRegistListResponse>("slpHeaderId", "전표ID", 150),
      hide: true,
      suppressHeaderMenuButton: true,
      editable: false,
      suppressColumnsToolPanel: true,
      sortable: false,
      filter: false,
    },
    {
      ...createTextColumn<SlipRegistListResponse>("bltDateAckSlp", "회계일자", 120),
      valueFormatter: (params) => {
        if (!params.value) return "";
        return dayjs(params.value, "YYYYMMDD").format("YYYY.MM.DD");
      },
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<SlipRegistListResponse>("edimStatusName", "전자결재 상태", 120),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<SlipRegistListResponse>("custname", "거래처명", 200),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<SlipRegistListResponse>("makeDeptName", "작성부서", 120),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
    {
      ...createTextColumn<SlipRegistListResponse>("createdByName", "작성자", 100),
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
    },
  ], []);

  // 그리드 행 클릭 핸들러
  const handleRowClick = useCallback((params: any) => {
    if (params.data && onSelect) {
      const id = params.data.slpHeaderId || "";
      if (id && id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  // 그리드 셀 클릭 핸들러
  const handleCellClick = useCallback((params: any) => {
    if (params.node) {
      params.node.setSelected(true);
    }
    if (params.data && onSelect) {
      const id = params.data.slpHeaderId || "";
      if (id && id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  // 그리드 선택 변경 핸들러
  const handleSelectionChanged = useCallback((params: any) => {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows.length > 0 && selectedRows[0] && onSelect) {
      const id = selectedRows[0].slpHeaderId || "";
      if (id && id !== selectedId) {
        onSelect(id);
      }
    }
  }, [onSelect, selectedId]);

  // 그리드 행 스타일
  const getRowStyle = useCallback((params: any) => {
    if (params.node.isSelected() || params.data?.slpHeaderId === selectedId) {
      return { backgroundColor: "#e6f7ff" };
    }
    return undefined;
  }, [selectedId]);

  // 그리드 옵션
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
    onSelectionChanged: handleSelectionChanged,
    getRowStyle: getRowStyle,
  }), [handleCellClick, handleSelectionChanged, getRowStyle]);

  return (
    <RecordListStyles className={className}>
      <div className="record-list">
        <div className="record-list__header">
          <div className="record-list__count">
            전체 <span className="record-list__count-number">{items.length}</span>건
          </div>
          <div className="record-list__view-controls">
            <Tooltip title="카드형으로 보기">
              <Button
                icon={
                  <i className="ri-gallery-view-2" style={{ fontSize: 14 }} />
                }
                className={`record-list__view-button ${viewMode === "card" ? "record-list__view-button--active" : ""}`}
                onClick={() => setViewMode("card")}
              />
            </Tooltip>
            <Tooltip title="그리드로 보기">
              <Button
                icon={<i className="ri-menu-line" style={{ fontSize: 14 }} />}
                className={`record-list__view-button ${viewMode === "grid" ? "record-list__view-button--active" : ""}`}
                onClick={() => setViewMode("grid")}
              />
            </Tooltip>
          </div>
        </div>
        <div className="record-list__items">
          {items.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              조회된 데이터가 없습니다.
            </div>
          ) : viewMode === "card" ? (
            items.map((item) => {
              const isActive = selectedId === item.slpHeaderId;
              const formattedDate = item.bltDateAckSlp 
                ? dayjs(item.bltDateAckSlp, "YYYYMMDD").format("YYYY.MM.DD")
                : "";
              
              // 전자결재 상태에 따른 Tag 클래스 및 텍스트 결정
              const getStatusTag = () => {
                if (!item.edimStatusName) return null;
                
                const status = item.edimStatusName.toLowerCase();
                let tagClass = "record-list__status";
                let statusText = item.edimStatusName;
                
                if (status.includes("완료") || status.includes("done")) {
                  tagClass += " record-list__status--done";
                } else if (status.includes("승인") || status.includes("approved")) {
                  tagClass += " record-list__status--approved";
                } else if (status.includes("결재") || status.includes("pending")) {
                  tagClass += " record-list__status--pending";
                }
                
                return (
                  <Tag className={tagClass}>
                    {statusText}
                  </Tag>
                );
              };
              
              return (
                <div
                  key={item.slpHeaderId || Math.random()}
                  className={`record-list__item ${isActive ? "record-list__item--active" : ""}`}
                  onClick={() => onSelect && item.slpHeaderId && onSelect(item.slpHeaderId)}
                >
                  <div className="record-list__item-header">
                    <div className="record-list__item-header-left">
                      <span className="record-list__item-id">{item.slpHeaderId || ""}</span>
                      {getStatusTag()}
                    </div>
                    <div className="record-list__item-header-right">
                      <span className="record-list__item-date">{formattedDate}</span>
                    </div>
                  </div>
                  <div className="record-list__item-company">{item.custname || ""}</div>
                </div>
              );
            })
          ) : (
            <FormAgGrid<SlipRegistListResponse & { id?: string }>
              rowData={items as (SlipRegistListResponse & { id?: string })[]}
              columnDefs={columnDefs}
              height="100%"
              headerHeight={32}
              idField="slpHeaderId"
              gridOptions={{
                ...gridOptions,
                onRowClicked: handleRowClick,
              }}
              rowSelection="single"
            />
          )}
        </div>
      </div>
    </RecordListStyles>
  );
};

export default RecordList;
