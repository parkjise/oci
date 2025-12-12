import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import { selectAdvpayCtDtaCreatList } from "@apis/fcm/gl/settlement";
import type {
  AdvpayCtDtaCreatSearchRequest,
  AdvpayCtDtaCreatSearchResponse,
} from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";

interface AdvpayCtDtaCreatState {
  // 상태
  searchData: AdvpayCtDtaCreatSearchResponse[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: AdvpayCtDtaCreatSearchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: AdvpayCtDtaCreatSearchResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  search: (searchRequest: AdvpayCtDtaCreatSearchRequest) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useAdvpayCtDtaCreatStore = create<AdvpayCtDtaCreatState>(
  (set, get) => ({
    // 초기 상태
    searchData: [],
    loading: false,
    gridApi: null,
    lastSearchRequest: null,

    // 상태 설정 액션
    setSearchData: (data) => set({ searchData: data }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),

    // 조회 액션
    search: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await selectAdvpayCtDtaCreatList(searchRequest);

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
        searchData: [],
        loading: false,
        gridApi: null,
        lastSearchRequest: null,
      }),
  })
);

