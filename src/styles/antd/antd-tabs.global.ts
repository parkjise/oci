import { css } from "styled-components";
// import * as mixins from "@/styles/mixins";

export const antdTabsGlobal = css`
  .ant-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    &-nav-wrap {
      background-color: ${({ theme }) => theme.colors.white};
      border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[300]};
    }
    & .ant-tabs-content {
      height: 100%;
    }
    & .ant-tabs-content-holder {
      flex: 1;
      min-height: 0;
    }
    & .ant-tabs-tabpane {
      height: 100%;
    }
  }
  .ant-tabs .ant-tabs-tab-btn {
    color: ${({ theme }) => theme.colors.neutral[600]};
  }
  .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${({ theme }) => theme.colors.neutral[800]};
  }
  .ant-tabs .ant-tabs-ink-bar {
    background-color: ${({ theme }) => theme.colors.neutral[800]};
  }

  article {
    .page-card {
      .ant-tabs-nav {
        margin-bottom: 15px;
      }
    }
  }
`;
