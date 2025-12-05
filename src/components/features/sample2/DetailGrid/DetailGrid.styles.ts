import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailGridStyles = styled.div`
  width: 100%;
  height: 100%;
  ${mixins.flex("flex-start", "flex-start", "column")}
  flex: 1;
`;
