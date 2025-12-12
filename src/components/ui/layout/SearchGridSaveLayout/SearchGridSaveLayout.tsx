import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import { FormButton } from "@components/ui/form";
export interface SearchGridLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 그리드 영역에 렌더링할 컴포넌트 */
  leftPanel?: ReactNode;
  /** 오른쪽 그리드 영역에 렌더링할 컴포넌트 */
  rightPanel?: ReactNode;
  grid?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 필터 패널 섹션의 추가 클래스명 */
  filterClassName?: string;
  /** 그리드 섹션의 추가 클래스명 */
  gridClassName?: string;
}

const TwoGridSaveLayout: React.FC<SearchGridLayoutProps> = ({
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
          <DataGridStyles className="data-grid-panel">
            <div className="data-grid-panel__toolbar">
              <div className="data-grid-panel-left"></div>
              <div className="data-grid-panel-right">
                <FormButton
                  size="small"
                  type="primary"
                  className="data-grid-panel__button data-grid-panel__button--save navy"
                >
                  저장
                </FormButton>
              </div>
            </div>
            {/* 그리드 */}
          </DataGridStyles>
          {/*상세 Grid */}
          {grid}
        </section>
      )}
    </Article>
  );
};

export default TwoGridSaveLayout;
