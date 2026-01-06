import React, { useState, useEffect } from "react";
import MainHeader from "../MainHeader";
import MainSidebar from "../MainSidebar";
import MainContent from "../MainContent";
import { DevTools } from "@components/ui/feedback";
import {
  StyledLayout,
  StyledLayoutContent,
  StyledLayoutSubcontent,
} from "./MainLayout.styles";

const MainLayout: React.FC = () => {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // Ctrl+Shift+F11 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + Shift + F11
      // F11 키는 keyCode 122 또는 code "F11"로 확인
      const isF11 = 
        event.keyCode === 122 || 
        event.code === "F11" ||
        (event.key && event.key.toUpperCase() === "F11");
      
      if (event.ctrlKey && event.shiftKey && isF11) {
        event.preventDefault();
        event.stopPropagation();
        setDevToolsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return (
    <StyledLayout>
      <MainHeader />
      <StyledLayoutSubcontent>
        <MainSidebar />
        <StyledLayoutContent>
          <MainContent />
        </StyledLayoutContent>
      </StyledLayoutSubcontent>
      <DevTools open={devToolsOpen} onClose={() => setDevToolsOpen(false)} />
    </StyledLayout>
  );
};

export default MainLayout;
