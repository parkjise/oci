import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";

export interface SearchGridLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 그리드 영역에 렌더링할 컴포넌트 */
  grid?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 필터 패널 섹션의 추가 클래스명 */
  filterClassName?: string;
  /** 그리드 섹션의 추가 클래스명 */
  gridClassName?: string;
}

const SearchGridLayout: React.FC<SearchGridLayoutProps> = ({
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

export default SearchGridLayout;
