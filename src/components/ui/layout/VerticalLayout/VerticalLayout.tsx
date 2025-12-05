import React from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { FilterPanel, DetailGrid } from "@components/features/sample2";

const VerticalLayout: React.FC = () => (
  <Article className="page-layout page-layout--search-double-grid">
    {/* Filter */}
    <section className="page-card page-card--filter">
      <FilterPanel className="page-layout__filter-panel" />
    </section>

    {/* Grid 1 */}
    <section className="page-card page-card--grid">
      <DetailGrid className="page-layout__grid" />
    </section>

    {/* Grid 2 */}
    <section className="page-card page-card--grid">
      <DetailGrid className="page-layout__grid" />
    </section>
  </Article>
);

export default VerticalLayout;
