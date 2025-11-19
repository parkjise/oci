import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailStyles = styled.section`
  ${mixins.grid({
    columns: "1fr",
    rows: "1fr",
    gap: "10px",
  })}
  height: 100%;
  min-height: 0;
  .pane-left {
    min-height: 0;
  }
  .pane-right {
    min-width: 0;
    min-height: 0;
    ${mixins.grid({
      columns: "1fr",
      rows: "1fr",
      gap: "10px",
    })}
    height: 100%;
    min-height: 0;
  }
  .pane-right:has(
      .page-layout__record-list,
      .page-layout__detail-view,
      .page-layout__filter-panel
    ) {
    ${mixins.grid({
      columns: "1fr",
      rows: "auto 1fr",
      gap: "10px",
    })}
  }
  &:has(.pane-left) {
    ${mixins.grid({
      columns: "minmax(250px, 1fr) 6fr",
    })}
  }
`;
