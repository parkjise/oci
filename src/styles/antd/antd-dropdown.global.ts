import { css } from "styled-components";
import * as mixins from "@/styles/mixins";

export const antdDropdownGlobal = css`
  .header-dropdown {
    padding: 10px 20px 0 20px;
    background-color: ${({ theme }) => theme.colors.white};
    ${mixins.BoxShadow("0 1px 3px rgba(0, 0, 0, .08)")}
  }
  .language-switcher {
    top: 50px !important;
    &__menu {
      padding: 10px;
      ${mixins.flex("center", "flex-start", "column", "5px")}
    }
    &__option {
      ${mixins.flex("center", "flex-start", "row", "10px")}
    }
    .ant-btn {
      &.language-switcher__option {
        border: none;
        color: ${({ theme }) => theme.colors.grey[400]};
        &:hover,
        &:focus,
        &:active {
          border: none;
          color: ${({ theme }) => theme.colors.neutral[600]};
          background-color: ${({ theme }) => theme.colors.neutral[200]};
        }
        &--active {
          color: ${({ theme }) => theme.colors.grey[600]};
          background-color: ${({ theme }) => theme.colors.neutral[100]};
        }
      }
    }
    &__flag {
      width: 16px;
      height: 16px;
      img {
        width: 100%;
        min-height: auto;
      }
    }
    &__label {
      font-size: 13px;
    }
  }
  .user-menu {
    inset: 50px 30px auto auto !important;
    &__content {
      max-width: 170px;
      width: 170px;
    }
    &__name {
      font-size: 16px;
      text-align: center;
      padding-bottom: 5px;
    }
    &__role {
      font-size: 12px;
      text-align: center;
      padding-bottom: 10px;
      color: ${({ theme }) => theme.colors.grey[500]};
    }
    &__divider {
      width: 100%;
      height: 1px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
    }
    &__group {
      padding: 15px 0;
      ${mixins.flex("flex-start", "flex-start", "column", "8px")}
      .user-menu__item {
        justify-content: flex-start;
      }
    }
    &__group--logout {
      padding: 10px 0;
      .user-menu__item--logout {
        justify-content: center;
      }
    }
    .ant-btn {
      &.user-menu__item {
        width: 100%;
        &--settings,
        &--password {
          i {
            font-size: 16px;
            padding-right: 0px;
          }
        }
        &--logout {
          border-color: ${({ theme }) => theme.red.primary};
          color: ${({ theme }) => theme.red.textColor};
          background-color: ${({ theme }) => theme.red.primary};
          /* box-shadow: 0 4px 20px rgba(241, 85, 108, 0.15); */
          &:hover,
          &:active {
            border-color: ${({ theme }) => theme.red.primary} !important;
            color: ${({ theme }) => theme.red.textColor} !important;
            background-color: ${({ theme }) => theme.red.primary} !important;
          }
          &:focus {
            border-color: ${({ theme }) => theme.red.primary};
            color: ${({ theme }) => theme.red.textColor};
            background-color: ${({ theme }) => theme.red.primary};
          }
        }
      }
    }

    .ant-dropdown-menu {
    }
  }
`;
