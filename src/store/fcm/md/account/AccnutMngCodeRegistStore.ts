import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  selectAccnutMngCodeMgmtDivCodeList,
  selectAccnutMngCodeList,
} from "@apis/fcm/md/account";
import type {
  AccnutMngCodeSrchRequest,
  AccnutMngCodeMgmtDivCodeListResponse,
  AccnutMngCodeListResponse,
} from "@/types/fcm/md/account/AccnutMngCodeRegist.types";

interface AccnutMngCodeRegistState {
  // 상태
  mgmtDivCodeList: AccnutMngCodeMgmtDivCodeListResponse[];
  searchData: AccnutMngCodeListResponse[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: AccnutMngCodeSrchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: AccnutMngCodeListResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  loadMgmtDivCodeList: (params: AccnutMngCodeSrchRequest) => Promise<void>; // 관리구분 코드 조회
  search: (searchRequest: AccnutMngCodeSrchRequest) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useAccnutMngCodeRegistStore = create<AccnutMngCodeRegistState>(
  (set, get) => ({
    // 초기 상태
    mgmtDivCodeList: [],
    searchData: [],
    loading: false,
    gridApi: null,
    lastSearchRequest: null,

    // 상태 설정 액션
    setSearchData: (data) => set({ searchData: data }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),

    // 관리구분 코드 조회 액션
    loadMgmtDivCodeList: async (params: AccnutMngCodeSrchRequest) => {
      const state = get();
      if (state.loading) return;
      console.log("params", params);
      set({ loading: true });

      try {
        const response = await selectAccnutMngCodeMgmtDivCodeList(params);

        if (response.success && response.data) {
          set({ mgmtDivCodeList: response.data });
        } else {
          message.error(response.message || "관리구분 코드 조회에 실패했습니다.");
          set({ mgmtDivCodeList: [] });
        }
      } catch (error) {
        message.error("관리구분 코드 조회 중 오류가 발생했습니다.");
        set({ mgmtDivCodeList: [] });
        if (import.meta.env.DEV) {
          console.error("관리구분 코드 조회 실패:", error);
        }
      } finally {
        set({ loading: false });
      }
    },

    // 목록 조회 액션
    search: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await selectAccnutMngCodeList(searchRequest);

        if (response.success && response.data) {
          set({
            searchData: response.data,
            lastSearchRequest: searchRequest,
          });
          message.success(`조회 완료: ${response.data.length}건`);
        } else {
          message.error(response.message || "조회에 실패했습니다.");
          set({ searchData: [] });
        }
      } catch (error) {
        message.error("조회 중 오류가 발생했습니다.");
        set({ searchData: [] });
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      } finally {
        set({ loading: false });
      }
    },

    // 재조회 액션 (마지막 검색 조건으로 다시 조회)
    refresh: async () => {
      const state = get();
      if (state.lastSearchRequest) {
        await get().search(state.lastSearchRequest);
      } else {
        message.warning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
      }
    },

    // 초기화 액션
    reset: () =>
      set({
        mgmtDivCodeList: [],
        searchData: [],
        loading: false,
        gridApi: null,
        lastSearchRequest: null,
      }),
  })
);

