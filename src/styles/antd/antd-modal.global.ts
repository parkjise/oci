import { css } from "styled-components";
import * as mixins from "@/styles/mixins";

export const antdModalGlobal = css`
  .modal-layout {
    .ant-modal {
      &-container {
        padding: 0;
        overflow: hidden;
      }
      &-header {
        margin-bottom: 0;
        padding-inline: 20px;
        padding-block: 15px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
        .ant-modal-title {
          font-size: 16px;
          font-weight: 400;
          color: ${({ theme }) => theme.colors.neutral[800]};
        }
      }
      &-body {
        padding-inline: 15px;
        padding-block: 15px;
        background-color: ${({ theme }) => theme.colors.neutral[100]};
        .page-layout--search-double-grid {
          padding: 0;
          height: auto;
          .filter-panel__button--submit {
            height: 28px;
          }
        }
        .modal {
          &-body {
            ${mixins.flex("flex-start", "flex-start", "column", "10px")}
            &__header {
              width: 100%;
              ${mixins.Card()}
            }
            &__actions {
              ${mixins.flex("flex-start", "space-between")}
              & .filter-panel__form {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                column-gap: 3rem;
                flex: 1;
              }
            }
            &__content {
              width: 100%;
              ${mixins.Card()}
            }
          }
        }
      }
      &-footer {
        margin-top: 0;
        background-color: ${({ theme }) => theme.colors.white};
        border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
        padding-inline: 20px;
        padding-block: 10px;
      }
    }
    &__content {
    }
    &__search,
    &__grid {
      ${mixins.Card()}
    }
    &__form {
      ${mixins.grid({
        columns: "repeat(2,1fr)",
        columnGap: "20px",
        rowGap: "10px",
      })}
    }
  }
`;
