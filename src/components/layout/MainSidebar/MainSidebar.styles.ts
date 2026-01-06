import styled from "styled-components";
import { Layout, Menu } from "antd";
import * as mixins from "@/styles/mixins";
const { Sider } = Layout;

export const StyledSidebar = styled(Sider)`
  /* min-height: calc(100vh - 64px);
  height: calc(100vh - 64px); */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-x: hidden;
  transition: width 0.2s ease-in-out;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  /* border-right: 1px solid #314d7c; */
  background: linear-gradient(180deg, #3d5a8b 53.1%, #1e3253 100%);

  &:not(.ant-layout-sider-collapsed) {
    min-width: 200px;
    max-width: 400px;
  }

  &.ant-layout-sider-collapsed {
    min-width: 70px;
    max-width: 70px;
    & .anticon-star {
      svg {
        width: 18px;
        height: 18px;
        fill: #fff;
      }
    }
    & .ant-menu-submenu-title {
      padding-inline: 0 !important;
      text-align: center;
      & .ant-menu-item-icon {
        font-size: 20px;
      }
    }
    .sidebar-favorites__title {
      display: none;
    }
    .collapse {
      justify-content: center;
      padding-inline: 0;
    }
  }
  .ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-item-icon
    + span {
    display: none;
  }
`;

export const StyledSidebarHeader = styled.div`
  cursor: pointer;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  flex-shrink: 0;
  color: #f2f4f6;
  font-size: 14px;
  font-weight: 400;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  .sidebar-favorites {
    &__title {
      ${mixins.flex("center", "flex-start", "row", "10px")}
    }
    &__icon {
      i {
        font-size: 16px;
      }
    }
    &__title {
      padding-left: 10px;
      font-size: 13px;
    }
    &__chevron {
      i {
        font-size: 16px;
      }
      padding-right: 13px;
    }
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
  overflow: hidden;
`;

export const StyledFavoritesCount = styled.span`
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  color: #5086c4;
  line-height: 1.4;
  background-color: #eef6ff;
`;

export const StyledMenuContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 100px 0;
  min-height: 0;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

export const StyledMenu = styled(Menu)`
  margin-top: 10px;
  .ant-menu {
    /* menu color */
    &-title {
      &-content {
        color: #f2f4f6;
        &:hover {
          color: #fff;
        }
      }
    }
    &.ant-menu-sub {
      &.ant-menu-inline {
        background-color: transparent;
      }
    }
    &-submenu-arrow {
      color: #fff;
    }
    &-submenu-title {
      margin: 0;
      padding-left: 10px !important;
      .ant-menu-item-icon {
        font-weight: normal;
        font-size: 18px;
        color: #b1c1db !important;
      }
    }
  }
  &.ant-menu {
    border-inline-end: none !important;
    background-color: transparent;
    border: none;
    & .menu-depth-1 {
      border-radius: 4px;
      padding-inline: 10px;
      min-height: 45px;
      line-height: 45px;
      & > .ant-menu-submenu-title {
        transition: none;
        border-radius: 0;
        width: 100%;
        font-size: 13px;
        height: 45px;
        line-height: 45px;
        box-sizing: border-box;
        border: 1px solid transparent;
        background: transparent;
        position: relative;
        z-index: 0;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 34px;
          border-radius: 4px;
          border: 1px solid transparent;
          background: transparent;
          box-shadow: none;
          pointer-events: none;
          z-index: -1;
        }

        &:hover {
          &::before {
            background-color: #fff;
            border-color: #152746;
            box-shadow: 0 6px 15px 0 rgba(0, 0, 0, 0.05);
            height: 34px;
          }

          & .ant-menu-item-icon {
            color: #dc3545 !important;
          }
          & .ant-menu-title-content {
            color: #434343;
          }
          & .ant-menu-submenu-arrow {
            color: #dc3545 !important;
          }
        }
      }

      &.ant-menu-submenu-open {
        & > .ant-menu-submenu-title {
          &::before {
            height: 34px;
            background-color: #fff;
            border-color: #152746;
            box-shadow: 0 6px 15px 0 rgba(0, 0, 0, 0.05);
          }

          & .ant-menu-item-icon {
            color: #dc3545 !important;
          }
          & .ant-menu-title-content {
            color: #434343;
          }
          & .ant-menu-submenu-arrow {
            color: #dc3545 !important;
          }
        }
      }
    }
    /* & .menu-depth-1 {
      border-radius: 4px;
      padding-inline: 10px;
      min-height: 45px;
      line-height: 45px;
      & > .ant-menu-submenu-title {
        transition: none;
        border-radius: 0;
        width: 100%;
        border: 1px solid transparent;

        &:hover {
          background-color: #fff;
          border-radius: 4px;
          height: 34px;
          border: 1px solid #152746;
          box-shadow: 0 6px 15px 0 rgba(0, 0, 0, 0.05);
          & .ant-menu-item-icon {
            color: #dc3545 !important;
          }
          & .ant-menu-title-content {
            color: #434343;
          }
          & .ant-menu-submenu-arrow {
            color: #dc3545 !important;
          }
        }
      }
      &.ant-menu-submenu-open {
        & > .ant-menu-submenu-title {
          border-radius: 4px;
          width: 100%;
          height: 36px;
          line-height: 36px;
          background-color: #fff;
          border: 1px solid #152746;
          & .ant-menu-item-icon {
            color: #dc3545 !important;
          }
          & .ant-menu-title-content {
            color: #434343;
          }
          & .ant-menu-submenu-arrow {
            color: #dc3545 !important;
          }
        }
      }
    } */
    & .menu-depth-2 {
      border-radius: 0;
      /* background-color: #233b65; */
      & > .ant-menu-submenu-title {
        border-radius: 0;
        width: 100%;
        height: 30px !important;
        line-height: 30px !important;
        &:hover {
          border-radius: 4px;
          background-color: #233b65;
        }
        .ant-menu-submenu-arrow {
          inset-inline-start: 25px;
        }
        .ant-menu-title-content {
          font-size: 13px;
          padding-left: 30px;
        }
      }
    }
    & .menu-depth-3 {
      border-radius: 0;
      /* background-color: #10264a; */
      & > .ant-menu-submenu-title {
        border-radius: 0;
        width: 100%;
        height: 30px !important;
        line-height: 30px !important;
        &:hover {
          border-radius: 4px;
          background-color: #233b65;
        }
        .ant-menu-submenu-arrow {
          inset-inline-start: 35px;
        }
        .ant-menu-title-content {
          font-size: 13px;
          padding-left: 40px;
        }
      }
    }
    & .menu-depth-4 {
      width: 100%;
      border-radius: 0;
      /* background-color: #4a5a71; */
      font-size: 12px !important;
      padding-left: 50px !important;
      height: 30px !important;
      line-height: 30px !important;
      margin: 0;
      &.ant-menu-item:hover {
        background-color: transparent;
      }
      & .ant-menu-submenu-title {
        border-radius: 0;
        width: 100%;
        height: 30px !important;
        line-height: 30px !important;
        /* background-color: #01060d; */
      }
      .ant-menu-title-content {
        font-size: 12px;
        display: flex;
        align-items: center;
        padding-left: 5px;
        &::before {
          font-family: "remixicon";
          content: "\\eac2";
          font-style: normal;
          font-weight: normal;
          speak: none;
          display: inline-block;
          line-height: 1;
          margin-right: 5px;
          opacity: 0.7;
          font-size: 12px;
        }
        &:hover {
          background-color: #2f4976;
        }
        /* &:hover {
          background-color: #2f4976;
          &::before {
            content: "";
            display: inline-flex;
            align-items: center;
            width: 2px;
            height: 16px;
            line-height: 30px;
            background-color: #e21a22;
            margin-right: 10px;
          }
        } */
      }

      &.active {
        .ant-menu-title-content {
          background-color: #2f4976;
          position: relative;
          padding-left: 10px;
          &::before {
            font-family: "remixicon";
            content: "\\eac2";
            font-style: normal;
            font-weight: normal;
            speak: none;
            display: inline-block;
            line-height: 1;
            margin-right: 5px;
            opacity: 0.7;
            font-size: 12px;
          }
          &::after {
            content: "";
            position: absolute;
            left: 0;
            width: 2px;
            height: 16px;
            line-height: 30px;
            background-color: #e21a22;
          }
        }
      }
    }
  }
  /* .ant-menu-sub:has(> .menu-depth-4) {
    padding: 0px 5px;
  } */
`;

export const StyledCollapseButton = styled.div`
  height: 37px;
  min-height: 37px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  font-size: 16px;
  padding-right: 10px;
  border-top: 1px solid #496696;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  transition:
    all 0.2s,
    color 0.2s;
  background-color: #314973;
  i {
    font-size: 22px;
  }
`;
