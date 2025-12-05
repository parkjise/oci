import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { FilterPanel, DetailGrid } from "@components/features/sample2";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

type SplitLayoutProps = {
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const TwoGridLayout: React.FC<SplitLayoutProps> = ({
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => (
  <Article className="page-layout  page-layout--two-grid">
    <section className="page-card page-card--filter">
      {/* 조회 */}
      <FilterPanel className="page-layout__filter-panel" />
    </section>
    {/* 조회 결과 */}
    <SplitLayoutStyles>
      <Splitter>
        <Splitter.Panel
          defaultSize={leftPanelSize}
          min={leftPanelMin}
          max={leftPanelMax}
          style={{ overflow: "hidden" }}
          className="page-layout__grid-panel page-layout__grid-panel--left"
        >
          <section className="page-card page-card--grid">
            <DetailGrid className="page-layout__grid" />
          </section>
        </Splitter.Panel>
        <Splitter.Panel className="page-layout__grid-panel page-layout__grid-panel--right">
          <section className="page-card page-card--grid">
            <DetailGrid className="page-layout__grid" />
          </section>
        </Splitter.Panel>
      </Splitter>
    </SplitLayoutStyles>
  </Article>
);

export default TwoGridLayout;
