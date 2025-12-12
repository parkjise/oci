import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

export interface TwoGridLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 왼쪽 그리드 영역에 렌더링할 컴포넌트 */
  leftPanel?: ReactNode;
  /** 오른쪽 그리드 영역에 렌더링할 컴포넌트 */
  rightPanel?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 왼쪽 패널 기본 크기 (기본값: "50%") */
  leftPanelSize?: number | string;
  /** 왼쪽 패널 최소 크기 (기본값: 150) */
  leftPanelMin?: number;
  /** 왼쪽 패널 최대 크기 (기본값: "80%") */
  leftPanelMax?: string | number;
}

const TwoGridLayout: React.FC<TwoGridLayoutProps> = ({
  filterPanel,
  leftPanel,
  rightPanel,
  className = "",
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => (
  <Article className={`page-layout page-layout--two-grid ${className}`.trim()}>
    {filterPanel != null && (
      <section className="page-card page-card--filter">
        {/* 조회 */}
        {filterPanel}
      </section>
    )}
    {/* 조회 결과 */}
    {(leftPanel != null || rightPanel != null) && (
      <SplitLayoutStyles>
        <Splitter>
          {leftPanel != null && (
            <Splitter.Panel
              defaultSize={leftPanelSize}
              min={leftPanelMin}
              max={leftPanelMax}
              style={{ overflow: "hidden" }}
              className="page-layout__grid-panel page-layout__grid-panel--left"
            >
              <section className="page-card page-card--grid">
                {leftPanel}
              </section>
            </Splitter.Panel>
          )}
          {rightPanel != null && (
            <Splitter.Panel className="page-layout__grid-panel page-layout__grid-panel--right">
              <section className="page-card page-card--grid">
                {rightPanel}
              </section>
            </Splitter.Panel>
          )}
        </Splitter>
      </SplitLayoutStyles>
    )}
  </Article>
);

export default TwoGridLayout;
