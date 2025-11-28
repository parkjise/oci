import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const Article = styled.article`
  padding: 2rem;
  height: calc(100vh - 140px);
  ${mixins.grid({
    rows: "1fr",
    gap: "10px",
  })}
  &.page-layout:has(.page-layout__filter-panel) {
    ${mixins.grid({
      rows: "auto 1fr",
      gap: "10px",
    })}
  }
  .content {
    min-height: 0;
  }
`;
