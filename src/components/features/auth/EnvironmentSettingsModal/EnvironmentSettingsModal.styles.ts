import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const EnvironmentSettingsStyles = styled.div`
  .ant-input-css-var {
    height: 36px;
  }
  .ant-input {
    &::placeholder {
      font-size: 12px;
      font-weight: 400;
    }
  }
  .environment-settings {
    &__fields {
      margin-bottom: 0;
      ${mixins.Card()}
      .ant-form-item-control-input-content {
        ${mixins.flex("flex-start", "flex-start", "column", "20px")}
        .ant-form-item {
          width: 100%;
          &-label {
            padding-bottom: 5px;
          }
          &-required {
            font-size: 13px;
            font-weight: 400;
            color: ${({ theme }) => theme.colors.neutral[800]};
          }
        }
      }
    }
    &__footer {
      margin-top: 15px;
      margin-bottom: 0;
    }
    &__actions {
      ${mixins.flex("center", "flex-end", "row", "5px")}
    }
  }
`;

