import styled from "styled-components";

export const ActionButtonGroupStyles = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .action-button-group {
    &__list {
      display: flex;
      gap: 5px;
    }

    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 5px;
    }

    &__button {
      &--more {
        border: none;
        &:hover {
          border: none !important;
        }
      }
    }
  }
`;
