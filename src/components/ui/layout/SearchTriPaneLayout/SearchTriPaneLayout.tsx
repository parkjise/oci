import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import type { ReactNode } from "react";

type SplitLayoutProps = {
  filterPanel?: ReactNode;
  filterClassName?: string;
  grid?: ReactNode;
  gridClassName?: string;
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const SearchTriPaneLayout: React.FC<SplitLayoutProps> = ({
  filterPanel,
  grid,
  className = "",
  filterClassName = "",
  gridClassName = "",
}) => {
  return (
    <Article
      className={`page-layout page-layout--filter-detail ${className}`.trim()}
    >
      {filterPanel != null && (
        <section
          className={`page-layout__filter page-card page-card--filter ${filterClassName}`.trim()}
        >
          {/* 조회 */}
          {filterPanel}
        </section>
      )}
      {grid != null && (
        <section
          className={`page-card page-card--grid ${gridClassName}`.trim()}
        >
          {/*상세 Grid */}
          {grid}
        </section>
      )}
    </Article>
  );
};

export default SearchTriPaneLayout;
