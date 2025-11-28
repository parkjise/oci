import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const DetailGridStyles = styled.div`
  height: 100%;
  ${mixins.flex("", "", "column")}
  flex: 1;
  ${mixins.Card()}
`;
