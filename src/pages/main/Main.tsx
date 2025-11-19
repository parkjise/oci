import React from "react";
import { MainLayout } from "@components/layout/Index";
import { StyledMainPage } from "./Main.styles";

const Main: React.FC = () => {
  return (
    <StyledMainPage>
      <MainLayout />
    </StyledMainPage>
  );
};

export default Main;
