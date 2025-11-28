import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const Article = styled.article`
  padding: 2rem;
  height: calc(100vh - 140px);
  width: 100%;
  overflow: hidden;
  ${mixins.flex("flex-start", "flex-start", "column", "10px")}

  .page-layout__filter-panel {
    width: 100%;
    flex-shrink: 0;
  }

  .page-layout__detail {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
`;
