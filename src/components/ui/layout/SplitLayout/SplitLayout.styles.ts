import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const SplitLayoutStyles = styled.section`
  width: 100%;
  height: 100%;
  min-height: 0;

  .ant-splitter {
    gap: 5px;
  }

  .ant-splitter-panel {
    min-width: 0;
    min-height: 0;
  }

  .split-layout__pane {
    &-left {
      height: 100%;
      min-height: 0;
    }
    &-right {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      ${mixins.flex("flex-start", "flex-start", "column", "10px")}
    }
  }

  .page-layout__detail-view {
    min-height: 0;
  }

  .page-layout__detail-grid {
    height: 100%;
    min-height: 0;
  }

  .ant-splitter-vertical > .ant-splitter-bar .ant-splitter-bar-dragger::before {
    height: 0px;
  }
  .ant-splitter-horizontal
    > .ant-splitter-bar
    .ant-splitter-bar-dragger::before {
    width: 0px;
  }
`;
