import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";

export interface VerticalLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 상단 그리드 영역에 렌더링할 컴포넌트 */
  topPanel?: ReactNode;
  /** 하단 그리드 영역에 렌더링할 컴포넌트 */
  bottomPanel?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

const VerticalLayout: React.FC<VerticalLayoutProps> = ({
  filterPanel,
  topPanel,
  bottomPanel,
  className = "",
}) => (
  <Article
    className={`page-layout page-layout--search-double-grid ${className}`.trim()}
  >
    {filterPanel != null && (
      <section className="page-card page-card--filter">
        {/* Filter */}
        {filterPanel}
      </section>
    )}

    {topPanel != null && (
      <section className="page-card page-card--grid">
        {/* Grid 1 */}
        {topPanel}
      </section>
    )}

    {bottomPanel != null && (
      <section className="page-card page-card--grid">
        {/* Grid 2 */}
        {bottomPanel}
      </section>
    )}
  </Article>
);

export default VerticalLayout;
