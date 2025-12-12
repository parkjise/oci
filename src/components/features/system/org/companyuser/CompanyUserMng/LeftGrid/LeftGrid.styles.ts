import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const LeftGridStyles = styled.div`
  width: 100%;
  height: 100%;
  ${mixins.flex("flex-start", "flex-start", "column")}
  flex: 1;

  .data-grid-panel {
    width: 100%;
    &__toolbar {
      ${mixins.flex("center", "space-between", "row")}
      margin-bottom: 10px;
    }
    &-left {
      ${mixins.flex("center", "flex-start", "row")}
      .data-grid-panel__button {
        & + .data-grid-panel__button:not(.data-grid-panel__button--more) {
          margin-left: 5px;
        }
      }
    }
  }

  /* AG Grid 헤더 가운데 정렬 */
  .ag-header-cell-center {
    .ag-header-cell-label {
      justify-content: center;
      text-align: center;
    }
  }
`;
