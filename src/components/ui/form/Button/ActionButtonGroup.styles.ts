import styled from "styled-components";

export const ActionButtonGroupStyles = styled.div`
  .action-button-group {
    &__divider {
      width: 1px;
      height: 20px;
      background-color: ${({ theme }) => theme.colors.neutral[300]};
      margin: 0 10px;
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
