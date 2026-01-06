import { create } from "zustand";
import type { RouteConfig } from "@/types/com/routes/routes.types";

interface UiState {
  openTabs: RouteConfig[];
  activeTabKey: string | null;
  addTab: (tab: RouteConfig) => void;
  removeTab: (key: string) => void;
  setActiveTabKey: (key: string | null) => void;
  closeAllTabs: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  openTabs: [],
  activeTabKey: null,
  addTab: (tab) =>
    set((state) => {
      // 이미 열려있는 탭인지 확인
      const existingTabIndex = state.openTabs.findIndex((t) => t.path === tab.path);
      
      if (existingTabIndex !== -1) {
        // 이미 열려있는 탭이면 해당 탭으로 이동(활성화)만 수행
        return {
          activeTabKey: tab.path,
        };
      }
      
      // 열려있지 않다면, 새로운 탭을 맨 앞에 추가하고 활성화
      return {
        openTabs: [tab, ...state.openTabs], // 맨 앞에 추가
        activeTabKey: tab.path,
      };
    }),
  removeTab: (key) =>
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.path !== key);
      let newActiveTabKey = state.activeTabKey;
      if (state.activeTabKey === key) {
        // 제거된 탭이 활성 탭이면, 남은 탭 중 첫 번째 탭을 활성화 (최근 탭)
        newActiveTabKey =
          newTabs.length > 0 ? newTabs[0].path : null;
      }
      return {
        openTabs: newTabs,
        activeTabKey: newActiveTabKey,
      };
    }),
  setActiveTabKey: (key) => set({ activeTabKey: key }),
  closeAllTabs: () => set({ openTabs: [], activeTabKey: null }),
}));

