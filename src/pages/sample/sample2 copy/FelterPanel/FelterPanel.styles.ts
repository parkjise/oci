import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const FilterPanelStyles = styled.section`
  &.page-layout__filter-panel {
    padding: 1.4rem 2rem;
    ${mixins.flex("center", "space-between")}
    ${mixins.Card()}
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
      grid-template-columns: repeat(4, 1fr);
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
      .ant-form-item .ant-form-item-control-input {
        height: 28px;
      }
      .ant-form-item .ant-form-item-control-input {
        min-height: 28px;
      }
    }
    &__actions {
      ${mixins.flex("flex-start", "center", "row", "5px")}
      height: 100%;
      button {
        width: 28px;
        height: 28px;
        border-radius: 2px;
        border: 1px solid ${({ theme }) => theme.colors.grey[200]};
      }
    }
  }
`;
