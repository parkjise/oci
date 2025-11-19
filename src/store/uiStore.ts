import { create } from "zustand";
import type { RouteConfig } from "@/model/routes";

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
      if (state.openTabs.find((t) => t.path === tab.path)) {
        return { activeTabKey: tab.path };
      }
      // 열려있지 않다면, 새로운 탭을 추가하고 활성화
      return {
        openTabs: [...state.openTabs, tab],
        activeTabKey: tab.path,
      };
    }),
  removeTab: (key) =>
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.path !== key);
      let newActiveTabKey = state.activeTabKey;
      if (state.activeTabKey === key) {
        newActiveTabKey =
          newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null;
      }
      return {
        openTabs: newTabs,
        activeTabKey: newActiveTabKey,
      };
    }),
  setActiveTabKey: (key) => set({ activeTabKey: key }),
  closeAllTabs: () => set({ openTabs: [], activeTabKey: null }),
}));
