import styled from "styled-components";
import { Layout, Card, Tabs } from "antd";

const { Content } = Layout;

export const StyledContent = styled(Content)`
  padding: 0;
  min-height: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
`;

export const StyledContentInner = styled.div`
  padding: 24px;
  border-radius: 0;
`;

export const StyledWelcomeCard = styled(Card)`
  text-align: center;
  box-shadow: none;
  border: none;
`;

export const StyledTabs = styled(Tabs)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .ant-tabs-nav {
    margin: 0;
    padding: 0 16px;
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;
    flex-shrink: 0;

    .ant-tabs-tab {
    }

    .ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: #1890ff;
      }
    }
  }

  .ant-tabs-tab {
    padding: 12px 16px;
    margin: 0 4px 0 0;
  }

  .ant-tabs-content-holder {
    background: #fafafa;
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .ant-tabs-content {
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* 비활성 탭 패널 숨기기 */
  .ant-tabs-tabpane:not(.ant-tabs-tabpane-active) {
    display: none !important;
  }

  .ant-tabs-tabpane-active {
    display: flex;
  }
`;

export const StyledTabContent = styled.div`
  background: #fafafa;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  padding: 0;
  position: relative;
`;
