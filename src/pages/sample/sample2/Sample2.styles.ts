import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const Article = styled.article`
  padding: 2rem;
  height: calc(100vh - 140px);
  ${mixins.flex("flex-start", "flex-start", "column", "10px")}
`;
