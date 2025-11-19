import React from "react";
import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";
import MainContent from "./MainContent";
import {
  StyledLayout,
  StyledLayoutContent,
  StyledLayoutSubcontent,
} from "./MainLayout.styles";

const MainLayout: React.FC = () => {
  return (
    <StyledLayout>
      <MainHeader />
      <StyledLayoutSubcontent>
        <MainSidebar />
        <StyledLayoutContent>
          <MainContent />
        </StyledLayoutContent>
      </StyledLayoutSubcontent>
    </StyledLayout>
  );
};

export default MainLayout;
