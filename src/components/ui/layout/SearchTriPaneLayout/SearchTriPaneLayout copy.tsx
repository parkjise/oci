import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { DetailGrid } from "@/components";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import { FormButton } from "@/components/ui/form";
import { FilterPanel } from "@components/features/sample2";
type SplitLayoutProps = {
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const SearchTriPaneLayout: React.FC<SplitLayoutProps> = ({
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => {
  return (
    <Article className="page-layout page-layout--filter-detail">
      <section className="page-card page-card--filter">
        <FilterPanel className="page-layout__filter-panel" />
      </section>
      <section className="page-card page-card--grid">
        <Article className="page-layout page-layout--search-triple-panel">
          <DataGridStyles className="dg-panel">
            <div className="dg-panel__toolbar">
              <FormButton
                size="small"
                type="primary"
                className="dg-panel__button dg-panel__button--save navy"
              >
                저장
              </FormButton>
            </div>
          </DataGridStyles>
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
                      <DetailGrid className="page-layout__grid" />
                    </section>
                  </Splitter.Panel>
                  <Splitter.Panel className="split-layout__panel split-layout__panel--bottom-grid">
                    <section className="page-card page-card--grid">
                      <DetailGrid className="page-layout__grid" />
                    </section>
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
            </Splitter>
          </SplitLayoutStyles>
        </Article>
      </section>
    </Article>
  );
};

export default SearchTriPaneLayout;
