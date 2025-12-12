import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

export interface SearchTripleGridLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 좌측 그리드 영역에 렌더링할 컴포넌트 */
  leftPanel?: ReactNode;
  /** 우측 상단 그리드 영역에 렌더링할 컴포넌트 */
  rightTopPanel?: ReactNode;
  /** 우측 하단 그리드 영역에 렌더링할 컴포넌트 */
  rightBottomPanel?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 좌측 패널 기본 크기 (기본값: "50%") */
  leftPanelSize?: number | string;
  /** 좌측 패널 최소 크기 (기본값: 150) */
  leftPanelMin?: number;
  /** 좌측 패널 최대 크기 (기본값: "80%") */
  leftPanelMax?: string | number;
  /** 우측 상단 패널 기본 크기 (기본값: "50%") */
  rightTopPanelSize?: number | string;
  /** 우측 상단 패널 최소 크기 (기본값: 150) */
  rightTopPanelMin?: number;
  /** 우측 상단 패널 최대 크기 (기본값: "80%") */
  rightTopPanelMax?: string | number;
  /** 우측 하단 패널 기본 크기 (기본값: "50%") */
  rightBottomPanelSize?: number | string;
  /** 우측 하단 패널 최소 크기 (기본값: 100) */
  rightBottomPanelMin?: number;
  /** 우측 하단 패널 최대 크기 (기본값: "80%") */
  rightBottomPanelMax?: string | number;
}

const SearchTripleGridLayout: React.FC<SearchTripleGridLayoutProps> = ({
  filterPanel,
  leftPanel,
  rightTopPanel,
  rightBottomPanel,
  className = "",
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
  rightTopPanelSize = "50%",
  rightTopPanelMin = 150,
  rightTopPanelMax = "80%",
  rightBottomPanelSize = "50%",
  rightBottomPanelMin = 100,
  rightBottomPanelMax = "80%",
}) => {
  const hasRightPanels = rightTopPanel != null || rightBottomPanel != null;
  const hasLeftPanel = leftPanel != null;

  return (
    <Article
      className={`page-layout page-layout--search-triple-grid ${className}`.trim()}
    >
      {filterPanel != null && (
        <section className="page-card page-card--filter">{filterPanel}</section>
      )}

      {(hasLeftPanel || hasRightPanels) && (
        <SplitLayoutStyles className="split-layout">
          {/* OUTER SPLITTER */}
          <Splitter className="split-layout__splitter">
            {/* LEFT GRID */}
            {leftPanel != null && (
              <Splitter.Panel
                defaultSize={leftPanelSize}
                min={leftPanelMin}
                max={leftPanelMax}
                style={{ overflow: "hidden" }}
                className="split-layout__panel split-layout__panel--left-grid"
              >
                <section className="page-card page-card--grid">
                  {leftPanel}
                </section>
              </Splitter.Panel>
            )}

            {/* RIGHT 2-GRID VERTICAL */}
            {hasRightPanels && (
              <Splitter.Panel className="split-layout__panel split-layout__panel--right">
                <Splitter
                  vertical
                  className="split-layout__splitter split-layout__splitter--vertical"
                >
                  {/* RIGHT TOP GRID */}
                  {rightTopPanel != null && (
                    <Splitter.Panel
                      min={rightTopPanelMin}
                      max={rightTopPanelMax}
                      defaultSize={rightTopPanelSize}
                      className="split-layout__panel split-layout__panel--top-grid"
                    >
                      <section className="page-card page-card--grid">
                        {rightTopPanel}
                      </section>
                    </Splitter.Panel>
                  )}

                  {/* RIGHT BOTTOM GRID */}
                  {rightBottomPanel != null && (
                    <Splitter.Panel
                      min={rightBottomPanelMin}
                      max={rightBottomPanelMax}
                      defaultSize={rightBottomPanelSize}
                      className="split-layout__panel split-layout__panel--bottom-grid"
                    >
                      <section className="page-card page-card--grid">
                        {rightBottomPanel}
                      </section>
                    </Splitter.Panel>
                  )}
                </Splitter>
              </Splitter.Panel>
            )}
          </Splitter>
        </SplitLayoutStyles>
      )}
    </Article>
  );
};

export default SearchTripleGridLayout;
