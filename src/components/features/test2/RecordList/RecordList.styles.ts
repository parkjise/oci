import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const RecordListStyles = styled.div`
  height: 100%;
  ${mixins.Card()}
  padding-right: 5px;

  .record-list {
    ${mixins.flex("flex-start", "flex-start", "column", "10px")}
    width: 100%;
    height: 100%;
    min-height: 0;
    &__header {
      ${mixins.flex("center", "space-between", "row")}
      width: 100%;
    }
    &__count {
      font-size: 11px;
      color: ${({ theme }) => theme.colors.neutral[500]};
      &-number {
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
    }
    &__view {
      &-controls {
        ${mixins.flex("center", "flex-start", "row", "5px")}
      }
      &-button {
        width: auto;
        height: auto;
        border: none;
        i {
          color: ${({ theme }) => theme.colors.neutral[500]};
        }
        &--active {
          i {
            color: ${({ theme }) => theme.colors.neutral[800]};
          }
        }
      }
    }
    &__items {
      width: 100%;
      ${mixins.flex("flex-start", "flex-start", "column", "10px")}
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      ${mixins.scrollbar()}
    }
    &__item {
      width: 100%;
      ${mixins.flex("flex-start", "flex-start", "column", "5px")}
      border-radius: 4px;
      border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
      padding: 8px 10px;
      background-color: ${({ theme }) => theme.colors.neutral[100]};
      cursor: pointer;
      &-header {
        ${mixins.flex("center", "space-between", "row")}
        width: 100%;
        &-left {
          ${mixins.flex("center", "flex-start", "row", "10px")}
        }
      }
      &-id {
        color: ${({ theme }) => theme.colors.black};
        font-size: 1.1rem;
      }
      &-date {
        color: ${({ theme }) => theme.colors.neutral[600]};
        font-size: 1rem;
      }
      &-company {
        color: ${({ theme }) => theme.colors.neutral[800]};
        font-size: 1.2rem;
      }
      &:hover,
      &--active {
        border: 1px solid ${({ theme }) => theme.colors.grey[300]};
        background-color: ${({ theme }) => theme.colors.white};
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
      }
    }
    &__status {
      font-size: 10px;
      border: none;
      border-radius: 4px;
      margin-inline-end: 0;
      padding-inline: 5px;
      font-weight: 500;
      &--done {
        background-color: #f0f9ff;
        color: #005eac;
      }
      &--approved {
        background-color: #fef4e4;
        color: #f7b84b;
      }
      &--pending {
        background-color: #fff1ee;
        color: #f06548;
      }
    }
  }
`;
