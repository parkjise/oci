import styled from "styled-components";

export const MenuButtonGridStyles = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .menu-button-grid__header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 4px;
  }

  .menu-button-grid__actions {
    display: flex;
    gap: 4px;
  }

  .menu-button-grid__content {
    flex: 1;
    min-height: 0;
  }
`;



