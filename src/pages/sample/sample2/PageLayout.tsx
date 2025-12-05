import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import {
  FilterPanel,
  RecordList,
  DetailView,
  DetailGrid,
} from "@components/features/sample2";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";
type SplitLayoutProps = {
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};
const SearchListDetailGrid: React.FC<SplitLayoutProps> = ({
  className,
  leftPanelSize = 250,
  leftPanelMin = 250,
  leftPanelMax = "40%",
}) => (
  <Article className="page-layout page-layout--search-list-detail-grid">
    <section className="page-card page-card--filter">
      {/* 조회 */}
      <FilterPanel className="page-layout__filter-panel" />
    </section>
    <SplitLayoutStyles className={className}>
      <Splitter>
        <Splitter.Panel
          defaultSize={leftPanelSize}
          min={leftPanelMin}
          max={leftPanelMax}
          style={{ overflow: "hidden" }}
          className="split-layout__panel split-layout__panel--left"
        >
          <section className="page-card page-card--list">
            {/* 리스트 */}
            <RecordList className="page-layout__record-list" />
          </section>
        </Splitter.Panel>
        <Splitter.Panel>
          <div className="split-layout__pane-right">
            <div className="page-layout__detail-view page-card  page-card--detail-view">
              <DetailView className="page-layout__detail-view" />
            </div>
            <div className="page-layout__detail-grid page-card  page-card--detail-grid">
              <DetailGrid className="page-layout__detail-grid" />
            </div>
          </div>
        </Splitter.Panel>
      </Splitter>
    </SplitLayoutStyles>
  </Article>
);

export default SearchListDetailGrid;
