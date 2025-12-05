import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const Article = styled.article`
  padding: 2rem;
  height: calc(100vh - 140px);
  ${mixins.flex("flex-start", "flex-start", "column", "10px")}

  &.page-layout {
    &--filter-detail {
      .page-card {
        &--grid {
          height: 100%;
        }
      }
    }
    &--two-grid {
      .page-card {
        &--grid {
          height: 100%;
        }
      }
    }
    &--vertical {
      .page-card {
        &--grid {
          height: 100%;
        }
      }
    }

    &--search-double-grid {
      .page-card {
        &--grid {
          overflow-y: scroll;
          height: 100%;
        }
      }
      .ag-theme-quartz {
        padding-bottom: 15px;
      }
    }
    &--search-triple-grid {
      & .page-card {
        &--grid {
          height: 100%;
        }
      }
    }
  }
  .page-card {
    width: 100%;
    ${mixins.Card()}
    &--list {
      height: 100%;
      min-height: 0;
      padding-right: 5px;
    }
    &--detail-grid {
      flex: 1;
    }
  }
`;
