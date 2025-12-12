import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { FilterPanel, DetailGrid } from "@/components";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

type SplitLayoutProps = {
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const SearchTripleStackLayout: React.FC<SplitLayoutProps> = ({
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => {
  return (
    <Article className="page-layout page-layout--search-triple-stack">
      <section className="page-card page-card--filter">
        <FilterPanel className="page-layout__filter-panel" />
      </section>

      <SplitLayoutStyles className="split-layout">
        {/* OUTER SPLITTER */}
        <Splitter className="split-layout__splitter">
          {/* LEFT GRID */}
          <Splitter.Panel
            defaultSize={leftPanelSize}
            min={leftPanelMin}
            max={leftPanelMax}
            style={{ overflow: "hidden" }}
            className="split-layout__panel split-layout__panel--left-grid"
          >
            <section className="page-card page-card--grid">
              <DetailGrid className="page-layout__grid" />
            </section>
          </Splitter.Panel>

          {/* RIGHT 2-GRID VERTICAL */}
          <Splitter.Panel className="split-layout__panel split-layout__panel--right">
            <section className="page-card page-card--grid">
              <DetailGrid className="page-layout__grid" />
            </section>
            <section className="page-card page-card--grid">
              <DetailGrid className="page-layout__grid" />
            </section>
          </Splitter.Panel>
        </Splitter>
      </SplitLayoutStyles>
    </Article>
  );
};

export default SearchTripleStackLayout;
