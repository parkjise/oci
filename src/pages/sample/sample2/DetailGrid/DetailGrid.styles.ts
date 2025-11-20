import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const DetailGridStyles = styled.div`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  ${mixins.Card()}

  /* AG Grid가 남은 공간을 채우도록 */
  .ag-root-wrapper {
    flex: 1;
    height: 100% !important;
  }
`;
