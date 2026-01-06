// ============================================================================
// 메뉴관리 페이지 (MenuMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useEffect } from "react";
import SearchTripleGridLayout from "@/components/ui/layout/SearchTripleGridLayout/SearchTripleGridLayout";
import {
  MenuTree,
  MenuDetailForm,
  MenuButtonGrid,
} from "@components/features/system/pgm/access/menu/MenuMng";
import { useMenuMngStore } from "@store/system/pgm/access/menu/menuMngStore";

// ============================================================================
// Component
// ============================================================================
const MenuMng: React.FC = () => {
  const { fetchMenuList } = useMenuMngStore();

  // 초기 로드
  useEffect(() => {
     const init = async () => {
        // 기존 선택 초기화 (요청사항: 다시 오픈 시 리셋)
        useMenuMngStore.getState().setSelectedMenu(undefined);
        useMenuMngStore.getState().setButtonList([]);
        
        await fetchMenuList();
        
        const { menuList, selectMenu } = useMenuMngStore.getState();
        if (menuList.length > 0) {
           // 항상 첫 번째 메뉴 선택 (리셋 후 첫 번째)
           const firstPgmNo = menuList[0].pgmNo;
           if (firstPgmNo) {
             await selectMenu(firstPgmNo);
           }
        }
     };
     init();

     // 언마운트 시 정리
     return () => {
         useMenuMngStore.getState().setSelectedMenu(undefined);
         useMenuMngStore.getState().setButtonList([]);
         useMenuMngStore.getState().setMenuList([]); // Optional: clear list too? safe choice.
     }
  }, [fetchMenuList]);

  return (
    <SearchTripleGridLayout
      leftPanel={<MenuTree />}
      rightTopPanel={<MenuDetailForm />}
      rightBottomPanel={<MenuButtonGrid />}
      leftPanelSize={300}
      className="page-layout--menu-mng"
    />
  );
};

export default MenuMng;
