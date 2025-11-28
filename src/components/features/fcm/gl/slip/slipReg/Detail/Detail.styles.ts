import styled from "styled-components";

export const DetailStyles = styled.div`
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;

  .page-layout__detail {
    width: 100%;
    height: 100%;
  }

  .detail__pane-left,
  .detail__pane-right {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .detail__pane-left {
    padding-right: 12px;
    overflow: hidden;
  }

  .detail__pane-right {
    padding-left: 12px;
    overflow: hidden;
  }

  .detail__pane-left > *,
  .detail__pane-right > * {
    flex: 1;
    min-height: 0;
  }

  .detail__stack {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 12px;
  }

  .detail__stack-top {
    flex-shrink: 0;
  }

  .detail__stack-bottom {
    flex: 1;
    min-height: 0;
  }
`;

