import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { FilterPanel, DetailGrid } from "@/components";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";
const VerticalSplitLayout: React.FC = () => {
  return (
    <Article className="page-layout page-layout--splitter page-layout--vertical">
      {/* Filter */}
      <section className="page-card page-card--filter">
        <FilterPanel className="page-layout__filter-panel" />
      </section>
      <SplitLayoutStyles className="page-layout__split-layout">
        <Splitter className="page-layout__splitter" vertical>
          <Splitter.Panel
            className="page-layout__splitter-panel"
            style={{ overflow: "hidden" }}
          >
            <section className="page-card page-card--grid">
              <DetailGrid className="page-layout__grid" />
            </section>
          </Splitter.Panel>

          <Splitter.Panel className="page-layout__splitter-panel">
            <section className="page-card page-card--grid">
              <DetailGrid className="page-layout__grid" />
            </section>
          </Splitter.Panel>
        </Splitter>
      </SplitLayoutStyles>
    </Article>
  );
};

export default VerticalSplitLayout;
