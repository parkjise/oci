import React from "react";
import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

type SplitLayoutProps = {
  leftPanel?: ReactNode;
  rightTopPanel?: ReactNode;
  rightBottomPanel?: ReactNode;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const SearchTriPanel: React.FC<SplitLayoutProps> = ({
  leftPanel,
  rightTopPanel,
  rightBottomPanel,
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => {
  return (
    <Article className="page-layout page-layout--search-triple-panel">
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
            <section className="page-card page-card--grid">{leftPanel}</section>
          </Splitter.Panel>

          {/* RIGHT 2-GRID VERTICAL */}
          <Splitter.Panel className="split-layout__panel split-layout__panel--right">
            <Splitter
              vertical
              className="split-layout__splitter split-layout__splitter--vertical"
            >
              <Splitter.Panel
                min={"20%"}
                max={"80%"}
                defaultSize={"50%"}
                className="split-layout__panel split-layout__panel--top-grid"
              >
                <section className="page-card page-card--grid">
                  {rightTopPanel}
                </section>
              </Splitter.Panel>
              <Splitter.Panel className="split-layout__panel split-layout__panel--bottom-grid">
                <section className="page-card page-card--grid">
                  {rightBottomPanel}
                </section>
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
        </Splitter>
      </SplitLayoutStyles>
    </Article>
  );
};

export default SearchTriPanel;
