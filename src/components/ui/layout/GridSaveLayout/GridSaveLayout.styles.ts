import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const GridSaveLayoutContainer = styled.div`
  ${mixins.flex('flex-start','flex-start','column')}
  width: 100%;
  height: 100%;
  .grid-wrapper{
    width: 100%;
    height: 100%;
  }

`;

export const ButtonWrapper = styled.div`
${mixins.flex('center','flex-end','row',"5px")}
width: 100%;
  margin-bottom: 10px;
`;

export const GridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  height: 100%;
`;
