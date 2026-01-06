import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const SearchFormStyles = styled.div<{ $columnsPerRow?: number }>`
  &.page-layout__filter-panel {
    /* padding: 1.4rem 2rem; */
    ${mixins.flex("flex-start", "space-between")}
    width: 100%;
  }
  .filter-panel {
    &__form {
      position: relative;
      ${mixins.grid({
        columns: "repeat(4, 1fr)",
        columnGap: "3rem",
        rowGap: "1.2rem",
      })}
      display: grid;
      grid-template-columns: ${({ $columnsPerRow }) =>
        $columnsPerRow ? `repeat(${$columnsPerRow}, 1fr)` : "repeat(4, 1fr)"};
      column-gap: 3rem;
      flex: 1;
      padding-right: 40px;
      &::after {
        content: "";
        position: absolute;
        right: 0;
        margin-right: 20px;
        width: 1px;
        height: 100%;
        background-color: ${({ theme }) => theme.colors.neutral[300]};
      }
      label {
        font-size: 1.2rem;
        min-width: 7rem;
        color: ${({ theme }) => theme.colors.neutral[800]};
      }
      .ant-picker,
      .ant-input {
        padding: 0.2rem 1.1rem;
      }
      .ant-form-item {
        margin-bottom: 0;
      }
      .ant-form-item .ant-form-item-label > label,
      .ant-form-item .ant-form-item-control-input,
      .ant-input,
      .ant-select,
      .ant-picker,
      .ant-input-number {
        height: 28px;
      }
      .ant-form-item .ant-form-item-control-input {
        min-height: 28px;
      }
      .ant-input-search-btn {
        height: 28px;
      }
      & .ant-btn {
        &:hover,
        &:active,
        &:focus {
          border-color: ${({ theme }) => theme.colors.neutral[800]};
          color: ${({ theme }) => theme.colors.neutral[800]};
        }
      }
    }
    &__actions {
      ${mixins.flex("flex-start", "flex-start", "row", "5px")}
      height: 100%;
    }
    &__button {
      height: 28px;
      &--submit {
        padding-inline: 15px;
      }
      &--reset,
      &--toggle {
        width: 28px;
      }
    }
  }
  .ant-space-compact {
    &.filter-panel__field {
      & + .ant-form-item {
        flex: 1;
      }
    }
    & .ant-form-item {
      & + .ant-form-item {
        flex: 1;
      }
    }
    & .ant-form-item {
      &:has(input[type="search"]) {
        width: 100%;
      }
    }
  }
`;
