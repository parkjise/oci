import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailStyles = styled.section`
  height: 100%;
  min-height: 0;
  .ant-splitter-bar {
    margin: 5px;
  }
  .ant-splitter {
    height: 100%;
    min-height: 0;
  }
  .detail__pane {
    &-left {
      min-height: 0;
    }
    &-right {
      min-width: 0;
      min-height: 0;
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    &-right .detail__vertical-splitter {
      flex: 1 1 auto;
      min-height: 0;
    }

    &-top {
      min-height: 0;
    }
    &-bottom {
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .page-layout__detail-grid {
      flex: 1 1 auto;
      min-height: 0;
    }
  }
`;
