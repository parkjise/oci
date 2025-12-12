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
        padding-right: 5px;
        &--grid {
          height: 100%;
          overflow-y: scroll;
          ${mixins.scrollbar()}
        }
      }

      .ant-splitter {
        .ant-splitter-panel {
          overflow-y: hidden;
        }
      }
    }

    &--search-double-grid {
      .page-card {
        padding-right: 5px;
        &--grid {
          overflow-y: scroll;
          height: 100%;
          ${mixins.scrollbar()}
        }
      }
      .ag-theme-quartz {
        padding-bottom: 15px;
      }
    }
    &--search-triple-grid {
      & .page-card {
        padding-right: 5px;
        &--grid {
          overflow-y: scroll;
          height: 100%;
          ${mixins.scrollbar()}
        }
      }
    }
    &--search-triple-stack {
      & .page-card {
        &--grid {
          height: 100%;
        }
      }
      & .split-layout__panel {
        &.ant-splitter-panel {
          overflow-y: hidden;
        }
        &--right {
          .page-card--grid {
            padding-right: 5px;
            flex: 1;
            overflow-y: scroll;
            height: 100%;
            ${mixins.scrollbar()}
          }
          overflow-y: hidden;
          ${mixins.flex("flex-start", "flex-start", "column", "10px")}
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
