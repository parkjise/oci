import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Spin, Tag, Button, Tooltip } from "antd";
import FormAgGrid, {
  type ExtendedColDef,
} from "@/components/ui/form/AgGrid/FormAgGrid";
import { CardGridListStyles } from "./CardGridList.styles";

// 상수 정의
const LOADING_OVERLAY_STYLE = {
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.6)",
  zIndex: 10,
};

const GRID_STYLE_OPTIONS = {
  fontSize: "12px",
  headerFontSize: "12px",
  rowHeight: "36px",
  headerHeight: "40px",
  cellPadding: "6px",
};

export type ViewMode = "card" | "grid";

export interface Item {
  id?: string | number;
  ID?: string | number;
  image?: string;
  title?: string;
  name?: string;
  subTitle?: string;
  isActive?: boolean;
  statusClass?: string;
  [key: string]: unknown;
}

interface CardGridListProps<T> {
  items: T[];
  totalCount?: number;
  initialView?: ViewMode;
  loading?: boolean;
  onToggleView?: (mode: ViewMode) => void;
  className?: string;
  onSelect?: (item: T | null) => void;
  cardFields?: {
    headerLeft?: string[];
    headerRight?: string[];
    body?: string[];
  };
  // 뷰 모드 설정: "card" | "grid" | "both"
  viewMode?: ViewMode | "both";
  columnDefs?: ExtendedColDef<T>[];
}

function CardGridList<T>({
  items,
  totalCount,
  initialView = "card",
  loading = false,
  onToggleView,
  className,
  onSelect,
  cardFields = {
    headerLeft: ["id", "status"],
    headerRight: ["date"],
    body: ["company"],
  },
  viewMode = "both",
  columnDefs,
}: CardGridListProps<T>) {
  // viewMode에 따라 초기 뷰 결정
  const getInitialView = (): ViewMode => {
    if (viewMode === "both") return initialView;
    return viewMode; // "card" 또는 "grid"
  };

  const [view, setView] = useState<ViewMode>(getInitialView());
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const gridApiRef = useRef<{
    forEachNode: (callback: (node: unknown) => void) => void;
    deselectAll: () => void;
  } | null>(null);

  // 아이템에서 ID 추출하는 헬퍼 함수
  const extractItemId = useCallback(
    (item: unknown, fallbackIndex?: number): string | number => {
      return (
        (item as { id?: string | number; ID?: string | number })?.id ??
        (item as { id?: string | number; ID?: string | number })?.ID ??
        fallbackIndex ??
        0
      );
    },
    []
  );

  // 그리드에서 특정 아이템 선택하는 헬퍼 함수
  const selectItemInGrid = useCallback(
    (id: string | number) => {
      if (!gridApiRef.current) return;

      gridApiRef.current.forEachNode((node: unknown) => {
        const nodeId = extractItemId((node as { data: unknown }).data);
        const isMatch = String(nodeId) === String(id);
        // false 파라미터: onSelectionChanged 이벤트 트리거 방지
        (
          node as {
            setSelected: (selected: boolean, preventEvent: boolean) => void;
          }
        ).setSelected(isMatch, false);
      });
    },
    [extractItemId]
  );

  useEffect(() => {
    if (!gridApiRef.current) return;

    if (selectedId != null) {
      let found = false;
      gridApiRef.current.forEachNode((node: unknown) => {
        if (found) return;
        const nodeId = extractItemId((node as { data: unknown }).data);
        const isMatch = String(nodeId) === String(selectedId);
        if (isMatch) {
          (
            node as {
              setSelected: (selected: boolean, preventEvent: boolean) => void;
            }
          ).setSelected(true, false);
          found = true;
        } else {
          (
            node as {
              setSelected: (selected: boolean, preventEvent: boolean) => void;
            }
          )?.setSelected(false, false);
        }
      });
    } else {
      gridApiRef.current.deselectAll();
    }
  }, [selectedId, extractItemId]);

  useEffect(() => {
    if (!onSelect) return;

    if (selectedId == null) {
      onSelect(null);
    } else {
      const selectedItem = items.find((it) => {
        const id = extractItemId(it);
        return String(id) === String(selectedId);
      });
      onSelect(selectedItem ?? null);
    }
  }, [selectedId, items, onSelect, extractItemId]);

  const handleToggle = useCallback(
    (mode: ViewMode) => {
      if (viewMode === "both") {
        setView(mode);
        onToggleView?.(mode);
      }
    },
    [viewMode, onToggleView]
  );

  const handleGridReady = useCallback(
    (params: { api: typeof gridApiRef.current }) => {
      gridApiRef.current = params.api;
      if (selectedId != null && params.api) {
        params.api.forEachNode((node: unknown) => {
          const nodeId = extractItemId((node as { data: unknown }).data);
          const isMatch = String(nodeId) === String(selectedId);
          (
            node as {
              setSelected: (selected: boolean, preventEvent: boolean) => void;
            }
          )?.setSelected(isMatch, false);
        });
      }
    },
    [selectedId, extractItemId]
  );

  const handleSelectionChanged = useCallback(
    (event: {
      api: { getSelectedRows?: () => Array<{ id?: string | number }> };
    }) => {
      const rows = event.api.getSelectedRows?.() || [];
      const id = rows[0]?.id ?? null;
      setSelectedId(id ?? null);
    },
    []
  );

  const gridColumns = useMemo(() => {
    // columnDefs가 제공되면 그것을 사용
    if (columnDefs) {
      return columnDefs;
    }

    // 기존 로직: columnDefs가 없으면 동적 생성
    if (!items.length) return [];

    const item = items[0] as Record<string, unknown>;
    const cols: { field: string; headerName: string; flex: number }[] = [];
    Object.keys(item).forEach((key) => {
      if (key !== "isActive" && key !== "statusClass") {
        cols.push({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          flex: 1,
        });
      }
    });
    return cols;
  }, [items, columnDefs]);

  return (
    <CardGridListStyles className={className}>
      <div className="record-list">
        <div className="record-list__header">
          <div className="record-list__count">
            전체{" "}
            <span className="record-list__count-number">
              {totalCount ?? items.length}
            </span>
            건
          </div>
          {/* viewMode가 "both"일 때만 토글 버튼 표시 */}
          {viewMode === "both" && (
            <div className="record-list__view-controls">
              <Tooltip title="카드형으로 보기">
                <Button
                  htmlType="button"
                  icon={
                    <i className="ri-gallery-view-2" style={{ fontSize: 14 }} />
                  }
                  className={`record-list__view-button ${
                    view === "card" ? "record-list__view-button--active" : ""
                  }`}
                  aria-pressed={view === "card"}
                  aria-label="카드형으로 보기"
                  onClick={() => handleToggle("card")}
                />
              </Tooltip>
              <Tooltip title="그리드로 보기">
                <Button
                  htmlType="button"
                  icon={<i className="ri-menu-line" style={{ fontSize: 14 }} />}
                  className={`record-list__view-button ${
                    view === "grid" ? "record-list__view-button--active" : ""
                  }`}
                  aria-pressed={view === "grid"}
                  aria-label="그리드로 보기"
                  onClick={() => handleToggle("grid")}
                />
              </Tooltip>
            </div>
          )}
        </div>
        {view === "grid" ? (
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
            {loading && (
              <div style={LOADING_OVERLAY_STYLE}>
                <Spin size="large" />
              </div>
            )}

            <FormAgGrid
              onGridReady={handleGridReady}
              onSelectionChanged={handleSelectionChanged}
              rowData={items as { id?: string | number }[]}
              columnDefs={
                gridColumns as ExtendedColDef<{ id?: string | number }>[]
              }
              height="100%"
              width="100%"
              enableFilter={false}
              gridOptions={{
                pagination: false,
                rowSelection: "single",
              }}
              showToolbar={false}
              styleOptions={GRID_STYLE_OPTIONS}
              className="record-list__grid"
            />
          </div>
        ) : (
          <div className="record-list__items" data-view={view}>
            {loading && (
              <div
                className="record-list__overlay"
                style={LOADING_OVERLAY_STYLE}
              >
                <Spin size="large" />
              </div>
            )}

            {items.map((it, idx) => {
              const id = extractItemId(it, idx);
              const isSelected =
                selectedId !== null && String(selectedId) === String(id);
              return (
                <div
                  key={idx}
                  className={`record-list__item ${
                    isSelected
                      ? "record-list__item--selected record-list__item--active"
                      : ""
                  } ${
                    (it as { isActive?: boolean }).isActive
                      ? "record-list__item--active"
                      : ""
                  }`}
                  tabIndex={0}
                  role="button"
                  aria-selected={isSelected}
                  aria-label={`${
                    (it as { title?: string; name?: string })?.title ||
                    (it as { title?: string; name?: string })?.name ||
                    `아이템 ${idx + 1}`
                  }`}
                  onClick={() => {
                    setSelectedId(id);
                    selectItemInGrid(id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(id);
                      selectItemInGrid(id);
                    }
                  }}
                >
                  <div className="record-list__item-header">
                    <div className="record-list__item-header-left">
                      {cardFields.headerLeft?.map((fieldName) => {
                        if (fieldName === "id") {
                          return (
                            <span
                              key={fieldName}
                              className="record-list__item-id"
                            >
                              {(it as { id?: string | number }).id}
                            </span>
                          );
                        } else if (
                          fieldName === "status" &&
                          (it as { status?: string }).status
                        ) {
                          return (
                            <Tag
                              key={fieldName}
                              className={`record-list__status record-list__status--${
                                (it as { statusClass?: string }).statusClass
                              }`}
                            >
                              {(it as { status?: string }).status}
                            </Tag>
                          );
                        } else if ((it as Record<string, unknown>)[fieldName]) {
                          return (
                            <span key={fieldName}>
                              {String(
                                (it as Record<string, unknown>)[fieldName]
                              )}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className="record-list__item-header-right">
                      {cardFields.headerRight?.map((fieldName) => {
                        if (fieldName === "date") {
                          return (
                            <span
                              key={fieldName}
                              className="record-list__item-date"
                            >
                              {(it as { date?: string }).date}
                            </span>
                          );
                        } else if ((it as Record<string, unknown>)[fieldName]) {
                          return (
                            <span key={fieldName}>
                              {String(
                                (it as Record<string, unknown>)[fieldName]
                              )}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                  <div className="record-list__item-body">
                    {cardFields.body?.map((fieldName) => {
                      if (fieldName === "company") {
                        return (
                          <div
                            key={fieldName}
                            className="record-list__item-company"
                          >
                            {(it as { company?: string }).company}
                          </div>
                        );
                      } else if ((it as Record<string, unknown>)[fieldName]) {
                        return (
                          <div key={fieldName}>
                            {String((it as Record<string, unknown>)[fieldName])}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CardGridListStyles>
  );
}

export default CardGridList;
