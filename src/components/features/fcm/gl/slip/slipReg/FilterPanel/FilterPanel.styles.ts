import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const FilterPanelStyles = styled.section`
  &.page-layout__filter-panel {
    padding: 1.4rem 2rem;
    ${mixins.flex("center", "space-between")}
    ${mixins.Card()}
    width: 100%;
  }

  .filter-panel {
    &__form {
      display: flex;
      width: 100%;
      gap: 1.2rem;
      align-items: flex-start;
    }

    &__fields {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 1.6rem;
      min-width: 0;
      overflow-x: auto;
      padding-top: 4px;
      padding-bottom: 12px;

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

      .ant-input-search {
        .ant-input {
          height: 28px;
          line-height: 28px;
        }
        .ant-input-search-button {
          height: 28px !important;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          .ant-btn {
            height: 100% !important;
            padding: 0 12px;
          }
        }
      }
    }

    &__field {
      flex: 1;
      min-width: 220px;

      &--inline {
        display: flex;
        align-items: center;
        gap: 8px;

        > *:not(.filter-panel__field-label) {
          flex: 1;
          min-width: 0;
        }
      }

      &--select {
        flex: 1;
      }
    }

    &__field-label {
      font-size: 1.2rem;
      min-width: 70px;
      color: ${({ theme }) => theme.colors.neutral[800]};
      flex-shrink: 0;
    }

    &__field-control {
      flex: 1;
      min-width: 0;
    }
    &__actions {
      ${mixins.flex("flex-start", "center", "row", "5px")}
      align-self: flex-start;
      height: auto;
      margin-top: 3px;
      button {
        width: 28px;
        height: 28px;
        border-radius: 2px;
        border: 1px solid ${({ theme }) => theme.colors.grey[200]};
      }
    }
  }

  @media (max-width: 768px) {
    &.page-layout__filter-panel {
      padding: 1.2rem;
      flex-direction: column;
      gap: 1.2rem;
    }

    .filter-panel__form {
      flex-direction: column;
      align-items: stretch;
      gap: 1.2rem;
    }

    .filter-panel__field {
      min-width: 100%;
    }

    .filter-panel__actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
`;
