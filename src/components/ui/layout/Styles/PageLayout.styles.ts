import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const Article = styled.article`
  padding: 2rem;
  /* height: calc(100vh - 140px); */
  height: calc(100vh - 100px);
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
          overflow-y: auto;
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

    &--search-list-detail-grid {
      .data-grid-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    }
    &--search-grid-panel {
      .data-grid-panel {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
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
      padding: 0;
      gap: 0;
      height: 100%;
      & .page-card {
        &--grid {
          height: 100%;
        }
      }
      & .page-layout__grid {
        overflow: hidden;
        & > .data-grid-panel {
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
    &--search-grid-save {
      padding: 0;
      gap: 0;
      height: 100%;
      flex: 1;
      min-height: 0;
      & .page-card {
        &--grid {
          height: 100%;
        }
      }
      & .page-layout__grid {
        overflow: hidden;
        & > .data-grid-panel {
          height: 100%;
        }
      }
      & .split-layout__panel {
        &.ant-splitter-panel {
          overflow-y: hidden;
        }
      }
    }
    &--search-triple-panel {
      padding: 0;
      gap: 0;
      height: 100%;
      flex: 1;
      min-height: 0;
      & .page-card {
        &--grid {
          height: 100%;
        }
      }
      & .page-layout__grid {
        overflow: hidden;
        & > .data-grid-panel {
          height: 100%;
        }
      }
      & .split-layout__panel {
        &.ant-splitter-panel {
          overflow-y: hidden;
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
      &:has(.record-list) {
        padding-right: 5px;
      }
    }
    &--detail-grid {
      flex: 1;
    }
    &--grid {
      display: flex;
      flex-direction: column;
      &:has(.page-layout--search-triple-panel, .page-layout--search-grid-save) {
        flex: 1;
        min-height: 0;
      }
    }
    &:has(.ant-tabs) {
      padding-top: 0;
    }
  }
`;
