import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-enterprise";
import {
  getMenuListApi,
  getMenuButtonListApi,
  saveMenuApi,
  insertMenuApi,
  deleteMenuApi,
  type MenuDto,
  type MenuButtonDto,
  type MenuSaveRequest,
} from "@apis/system/menu/menuApi";

interface MenuMngState {
  // State
  menuList: MenuDto[];
  selectedMenu: MenuDto | undefined;
  buttonList: MenuButtonDto[];
  loading: boolean;
  isModified: boolean;
  buttonGridApi: GridApi | null;

  // Actions
  setMenuList: (menuList: MenuDto[]) => void;
  setSelectedMenu: (menu: MenuDto | undefined) => void;
  setButtonList: (buttonList: MenuButtonDto[]) => void;
  setLoading: (loading: boolean) => void;
  setIsModified: (isModified: boolean) => void;
  setButtonGridApi: (api: GridApi | null) => void;

  fetchMenuList: () => Promise<void>;
  fetchButtonList: (pgmNo: string) => Promise<void>;
  selectMenu: (pgmNo: string) => Promise<void>;

  // Logic
  save: (request: MenuSaveRequest) => Promise<boolean>;
  addMenu: (menu: MenuDto) => Promise<void>;
  deleteMenu: (pgmNo: string) => Promise<void>;
  sanitizeAndSave: () => Promise<boolean>;
}

/**
 * 데이터 정제 유틸리티
 */
const sanitizeMenuData = (menu: MenuDto): MenuDto => {
  const sanitized = { ...menu };

  // Boolean -> Y/N 변환
  if (typeof (sanitized as any).useMenu === "boolean") {
    sanitized.useMenu = (sanitized as any).useMenu ? "Y" : "N";
  }
  if (typeof (sanitized as any).hidden === "boolean") {
    sanitized.hidden = (sanitized as any).hidden ? "Y" : "N";
  }

  // 날짜 하이픈 제거 (YYYY-MM-DD -> YYYYMMDD)
  if (sanitized.effectiveDateFrom) {
    sanitized.effectiveDateFrom = sanitized.effectiveDateFrom.replace(/-/g, "");
  }
  if (sanitized.effectiveDateTo) {
    sanitized.effectiveDateTo = sanitized.effectiveDateTo.replace(/-/g, "");
  }

  return sanitized;
};

export const useMenuMngStore = create<MenuMngState>((set, get) => ({
  // Initial State
  menuList: [],
  selectedMenu: undefined,
  buttonList: [],
  loading: false,
  isModified: false,
  buttonGridApi: null,

  // Setters
  setMenuList: (menuList) => set({ menuList }),
  setSelectedMenu: (selectedMenu) => set({ selectedMenu }),
  setButtonList: (buttonList) => set({ buttonList }),
  setLoading: (loading) => set({ loading }),
  setIsModified: (isModified) => set({ isModified }),
  setButtonGridApi: (api) => set({ buttonGridApi: api }),

  // Fetch Menu List
  fetchMenuList: async () => {
    set({ loading: true });
    try {
      const response = await getMenuListApi();
      if (response.success && response.data) {
        set({ menuList: response.data });
      }
    } catch (error) {
      message.error("메뉴 목록 조회에 실패했습니다.");
    } finally {
      set({ loading: false });
    }
  },

  // Fetch Button List
  fetchButtonList: async (pgmNo: string) => {
    try {
      const response = await getMenuButtonListApi(pgmNo);
      if (response.success && response.data) {
        set({ buttonList: response.data });
      } else {
        set({ buttonList: [] });
      }
    } catch (error) {
      console.error("버튼 리스트 조회 실패:", error);
      set({ buttonList: [] });
    }
  },

  // Select Menu
  selectMenu: async (pgmNo: string) => {
    const { menuList, fetchButtonList } = get();
    const menu = menuList.find((m) => m.pgmNo === pgmNo);

    set({
      selectedMenu: menu,
      isModified: false,
    });

    if (menu?.pgmNo) {
      await fetchButtonList(menu.pgmNo);
    } else {
      set({ buttonList: [] });
    }
  },

  // Save
  save: async (request: MenuSaveRequest) => {
    set({ loading: true });
    try {
      const response = await saveMenuApi(request);
      if (response.success) {
        message.success("저장되었습니다.");
        set({ isModified: false });
        await get().fetchMenuList();

        const { selectedMenu } = get();
        if (selectedMenu?.pgmNo) {
          await get().selectMenu(selectedMenu.pgmNo);
        }
        return true;
      } else {
        message.error(response.message || "저장에 실패했습니다.");
        return false;
      }
    } catch (error) {
      message.error("저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * 컴포넌트의 복잡한 저장 로직을 Store로 이동
   */
  sanitizeAndSave: async () => {
    const { selectedMenu, buttonGridApi, buttonList, save } = get();
    if (!selectedMenu) return false;

    // 1. 메뉴 데이터 정제
    const sanitizedMenu = sanitizeMenuData(selectedMenu);

    // 2. 버튼 데이터 수집 및 정제
    let finalButtonList: MenuButtonDto[] = [];
    if (buttonGridApi) {
      buttonGridApi.stopEditing();
      
      // 편집 종료 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      const gridData: MenuButtonDto[] = [];
      buttonGridApi.forEachNode((node) => {
        if (node.data) gridData.push(node.data);
      });

      const deletedButtons = buttonList.filter(
        (btn) => btn.rowStatus === "D" && btn.pgmNo === selectedMenu.pgmNo
      );

      finalButtonList = [...gridData, ...deletedButtons];
    } else {
      finalButtonList = buttonList;
    }

    // 3. 버튼 유효성 검사 (Control ID 중복 및 필수 입력)
    const objIdMap = new Set<string>();
    for (const btn of finalButtonList) {
      if (btn.rowStatus === "D") continue;
      
      if (!btn.objId || btn.objId.trim() === "") {
        message.warning("컨트롤명이 입력되지 않은 행이 있습니다.");
        return false;
      }

      const key = `${btn.pgmNo}_${btn.objId.trim()}`;
      if (objIdMap.has(key)) {
        message.warning("컨트롤명이 중복됩니다.");
        return false;
      }
      objIdMap.add(key);
    }

    // 4. 저장 API 호출
    const cleanedButtons = finalButtonList.map(({ tempId, ...rest }: any) => rest);
    return await save({
      menu: sanitizedMenu,
      buttons: cleanedButtons,
    });
  },

  // Add Menu
  addMenu: async (menu: MenuDto) => {
    set({ loading: true });
    try {
      const response = await insertMenuApi(menu);
      if (response.success && response.data?.pgmNo) {
        message.success("추가되었습니다.");
        await get().fetchMenuList();
        await get().selectMenu(response.data.pgmNo);
      }
    } catch (error) {
      message.error("추가 중 오류가 발생했습니다.");
    } finally {
      set({ loading: false });
    }
  },

  // Delete Menu
  deleteMenu: async (pgmNo: string) => {
    set({ loading: true });
    try {
      const response = await deleteMenuApi(pgmNo);
      if (response.success) {
        message.success("삭제되었습니다.");
        await get().fetchMenuList();

        const { menuList } = get();
        if (menuList.length > 0) {
          const firstMenu = menuList.find((m) => m.lvl === 1);
          if (firstMenu?.pgmNo) {
            await get().selectMenu(firstMenu.pgmNo);
          } else {
            set({ selectedMenu: undefined, buttonList: [] });
          }
        } else {
          set({ selectedMenu: undefined, buttonList: [] });
        }
      }
    } catch (error) {
      message.error("삭제 중 오류가 발생했습니다.");
    } finally {
      set({ loading: false });
    }
  },
}));
