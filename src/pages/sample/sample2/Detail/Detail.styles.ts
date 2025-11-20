import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailStyles = styled.section`
  height: 100%;
  min-height: 0;

  /* Ant Design Splitter 스타일 */
  .ant-splitter {
    height: 100%;
  }

  .ant-splitter-panel {
    overflow: hidden;
  }

  .detail__pane {
    &-left {
      height: 100%;
      min-height: 0;
      overflow: auto;
    }
    &-right {
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      ${mixins.flex("stretch", "flex-start", "column", "10px")}
    }
  }
`;
