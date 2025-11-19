import styled from "styled-components";
import { Layout, Menu } from "antd";

const { Sider } = Layout;

export const StyledSidebar = styled(Sider)`
  min-height: calc(100vh - 64px);
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background-color: #001529;
  overflow: hidden !important;
  overflow-x: hidden !important;
  transition: width 0.2s ease-in-out !important;
  flex-shrink: 0;
  box-sizing: border-box;

  &:not(.ant-layout-sider-collapsed) {
    min-width: 250px !important;
    max-width: 400px !important;
  }

  &.ant-layout-sider-collapsed {
    min-width: 64px !important;
    max-width: 64px !important;
  }

  * {
    box-sizing: border-box;
  }
`;

export const StyledSidebarHeader = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #001529;
  overflow: hidden;

  > span {
    color: #ffffff;
    white-space: nowrap;
  }
`;

export const StyledSidebarHeaderCollapsed = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #001529;
  overflow: hidden;
  color: #ffffff;

  .anticon,
  svg {
    color: #ffffff !important;
    fill: #ffffff !important;
    font-size: 18px;
  }
`;

export const StyledFavoritesCount = styled.span`
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
`;

export const StyledMenuContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

export const StyledMenu = styled(Menu)`
  border-right: none;
  background-color: #001529;
  color: #ffffff !important;
  overflow: visible !important;

  * {
    overflow: visible !important;
    text-overflow: clip !important;
  }

  .ant-menu-item {
    border-radius: 6px;
    height: 40px;
    line-height: 40px;
    padding-left: 20px !important;
    padding-right: 20px !important;
    color: #ffffff !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;

    > span {
      color: #ffffff !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }

    .anticon,
    .ant-menu-item-icon,
    svg {
      color: #ffffff !important;
      fill: #ffffff !important;
    }

    &:not(:hover):not(.ant-menu-item-selected) {
      background-color: transparent !important;
      color: #ffffff !important;

      > span {
        color: #ffffff !important;
      }

      .anticon,
      .ant-menu-item-icon,
      svg {
        color: #ffffff !important;
        fill: #ffffff !important;
      }
    }

    &:hover {
      background-color: #ffffff !important;
      color: #000000 !important;

      > span {
        color: #000000 !important;
      }

      .anticon,
      .ant-menu-item-icon,
      svg {
        color: #000000 !important;
        fill: #000000 !important;
      }
    }

    &.ant-menu-item-selected {
      background-color: #ffffff !important;
      color: #000000 !important;

      > span {
        color: #000000 !important;
      }

      .anticon,
      .ant-menu-item-icon,
      svg {
        color: #000000 !important;
        fill: #000000 !important;
      }

      &::after {
        display: none;
      }
    }
  }

  .ant-menu-submenu {
    .ant-menu-submenu-title {
      border-radius: 6px;
      height: 40px;
      line-height: 40px;
      padding-left: 20px !important;
      padding-right: 20px !important;
      color: #ffffff !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: clip !important;

      > span {
        color: #ffffff !important;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
      }

      .anticon,
      .ant-menu-item-icon,
      svg {
        color: #ffffff !important;
        fill: #ffffff !important;
      }

      &:not(:hover) {
        background-color: transparent !important;
        color: #ffffff !important;

        > span {
          color: #ffffff !important;
        }

        .ant-menu-submenu-arrow,
        .ant-menu-submenu-arrow::before,
        .ant-menu-submenu-arrow::after {
          color: #ffffff !important;
          background: #ffffff !important;
        }

        .anticon,
        .ant-menu-item-icon,
        svg {
          color: #ffffff !important;
          fill: #ffffff !important;
        }
      }

      &:hover {
        background-color: #ffffff !important;
        color: #000000 !important;

        > span {
          color: #000000 !important;
        }

        .ant-menu-submenu-arrow,
        .ant-menu-submenu-arrow::before,
        .ant-menu-submenu-arrow::after {
          color: #000000 !important;
          background: #000000 !important;
        }

        .anticon,
        .ant-menu-item-icon,
        svg {
          color: #000000 !important;
          fill: #000000 !important;
        }
      }
    }

    .ant-menu {
      background-color: rgba(0, 0, 0, 0.2);

      .ant-menu-item {
        padding-left: 48px !important;
        padding-right: 20px !important;
        color: #ffffff !important;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;

        > span {
          color: #ffffff !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }

        .anticon,
        .ant-menu-item-icon,
        svg {
          color: #ffffff !important;
          fill: #ffffff !important;
        }

        &:not(:hover):not(.ant-menu-item-selected) {
          background-color: transparent !important;
          color: #ffffff !important;

          > span {
            color: #ffffff !important;
          }

          .anticon,
          .ant-menu-item-icon,
          svg {
            color: #ffffff !important;
            fill: #ffffff !important;
          }
        }

        &:hover,
        &.ant-menu-item-selected {
          background-color: #ffffff !important;
          color: #000000 !important;

          > span {
            color: #000000 !important;
          }

          .anticon,
          .ant-menu-item-icon,
          svg {
            color: #000000 !important;
            fill: #000000 !important;
          }
        }
      }

      .ant-menu-submenu {
        .ant-menu-submenu-title {
          padding-left: 48px !important;
          padding-right: 20px !important;
          color: #ffffff !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;

          > span {
            color: #ffffff !important;
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: clip !important;
          }

          .anticon,
          .ant-menu-item-icon,
          svg {
            color: #ffffff !important;
            fill: #ffffff !important;
          }

          &:not(:hover) {
            background-color: transparent !important;
            color: #ffffff !important;

            > span {
              color: #ffffff !important;
            }

            .ant-menu-submenu-arrow,
            .ant-menu-submenu-arrow::before,
            .ant-menu-submenu-arrow::after {
              color: #ffffff !important;
              background: #ffffff !important;
            }

            .anticon,
            .ant-menu-item-icon,
            svg {
              color: #ffffff !important;
              fill: #ffffff !important;
            }
          }

          &:hover {
            background-color: #ffffff !important;
            color: #000000 !important;

            > span {
              color: #000000 !important;
            }

            .ant-menu-submenu-arrow,
            .ant-menu-submenu-arrow::before,
            .ant-menu-submenu-arrow::after {
              color: #000000 !important;
              background: #000000 !important;
            }

            .anticon,
            .ant-menu-item-icon,
            svg {
              color: #000000 !important;
              fill: #000000 !important;
            }
          }
        }

        .ant-menu {
          background-color: rgba(0, 0, 0, 0.3);

          .ant-menu-item {
            padding-left: 72px !important;
            padding-right: 20px !important;
            color: #ffffff !important;
            white-space: nowrap !important;
            overflow: visible !important;
            text-overflow: clip !important;

            > span {
              color: #ffffff !important;
              white-space: nowrap !important;
              overflow: visible !important;
              text-overflow: clip !important;
            }

            .anticon,
            .ant-menu-item-icon,
            svg {
              color: #ffffff !important;
              fill: #ffffff !important;
            }

            &:not(:hover):not(.ant-menu-item-selected) {
              background-color: transparent !important;
              color: #ffffff !important;

              > span {
                color: #ffffff !important;
              }

              .anticon,
              .ant-menu-item-icon,
              svg {
                color: #ffffff !important;
                fill: #ffffff !important;
              }
            }

            &:hover,
            &.ant-menu-item-selected {
              background-color: #ffffff !important;
              color: #000000 !important;

              > span {
                color: #000000 !important;
              }

              .anticon,
              .ant-menu-item-icon,
              svg {
                color: #000000 !important;
                fill: #000000 !important;
              }
            }
          }
        }
      }
    }
  }

  .ant-menu-item-icon {
    font-size: 16px;
    margin-right: 12px;
    color: #ffffff !important;
    fill: #ffffff !important;
  }
`;

export const StyledCollapseButton = styled.div`
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  font-size: 16px;
  background-color: #001529;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  transition: background-color 0.2s, color 0.2s;

  .anticon,
  svg {
    color: #ffffff !important;
    fill: #ffffff !important;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;

    .anticon,
    svg {
      color: #ffffff !important;
      fill: #ffffff !important;
    }
  }
`;
