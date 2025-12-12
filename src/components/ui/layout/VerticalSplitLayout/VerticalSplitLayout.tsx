import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

export interface VerticalSplitLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 상단 그리드 영역에 렌더링할 컴포넌트 */
  topPanel?: ReactNode;
  /** 하단 그리드 영역에 렌더링할 컴포넌트 */
  bottomPanel?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 상단 패널 기본 크기 (기본값: "50%") */
  topPanelSize?: number | string;
  /** 상단 패널 최소 크기 (기본값: 150) */
  topPanelMin?: number;
  /** 상단 패널 최대 크기 (기본값: "80%") */
  topPanelMax?: string | number;
}

const VerticalSplitLayout: React.FC<VerticalSplitLayoutProps> = ({
  filterPanel,
  topPanel,
  bottomPanel,
  className = "",
  topPanelSize = "50%",
  topPanelMin = 150,
  topPanelMax = "80%",
}) => {
  return (
    <Article
      className={`page-layout page-layout--splitter page-layout--vertical ${className}`.trim()}
    >
      {filterPanel != null && (
        <section className="page-card page-card--filter">
          {/* Filter */}
          {filterPanel}
        </section>
      )}
      {(topPanel != null || bottomPanel != null) && (
        <SplitLayoutStyles className="page-layout__split-layout">
          <Splitter className="page-layout__splitter" vertical>
            {topPanel != null && (
              <Splitter.Panel
                defaultSize={topPanelSize}
                min={topPanelMin}
                max={topPanelMax}
                className="page-layout__splitter-panel"
                style={{ overflow: "hidden" }}
              >
                <section className="page-card page-card--grid">
                  {topPanel}
                </section>
              </Splitter.Panel>
            )}
            {bottomPanel != null && (
              <Splitter.Panel className="page-layout__splitter-panel">
                <section className="page-card page-card--grid">
                  {bottomPanel}
                </section>
              </Splitter.Panel>
            )}
          </Splitter>
        </SplitLayoutStyles>
      )}
    </Article>
  );
};

export default VerticalSplitLayout;
