import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import { 
  selectAdvpayCtExcclcProcessDetailList,
  updateAdvpayCtExcclcProcessGlgu,
  createAdvpayCtExcclcProcessSlip,
  cancelAdvpayCtExcclcProcessSlip,
//  chkGlDate,
} from "@apis/fcm/gl/settlement";
import type {
  AdvpayCtExcclcProcessSearchRequest,
  AdvpayCtExcclcProcessDetailResponse,
  AdvpayCtExcclcProcessProcRequest,
} from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";
//import type { ChkGlDateRequest } from "@/types/fcm/gl/settlement/fgcryEvl.types";

interface AdvpayCtExcclcProcessState {
  // 상태
  searchData: AdvpayCtExcclcProcessDetailResponse[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: AdvpayCtExcclcProcessSearchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: AdvpayCtExcclcProcessDetailResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  search: (searchRequest: AdvpayCtExcclcProcessSearchRequest) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  updateGlgu: (selectedRows: AdvpayCtExcclcProcessDetailResponse[]) => Promise<void>;
 // checkGlDate: (checkRequest: ChkGlDateRequest) => Promise<number>;
  createSlip: (request: AdvpayCtExcclcProcessProcRequest) => Promise<boolean>;
  cancelSlip: (request: AdvpayCtExcclcProcessProcRequest) => Promise<boolean>;
}

export const useAdvpayCtExcclcProcessStore = create<AdvpayCtExcclcProcessState>(
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
        const response = await selectAdvpayCtExcclcProcessDetailList(searchRequest);

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

    // GL 수기처리 여부 업데이트 액션
    updateGlgu: async (selectedRows) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await updateAdvpayCtExcclcProcessGlgu(selectedRows);

        if (response.success) {
          message.success("GL처리가 적용되었습니다.");
          
          // 업데이트 후 자동으로 조회 실행
          if (state.lastSearchRequest) {
            await get().search(state.lastSearchRequest);
          }
        } else {
          message.error(response.message || "GL처리 적용에 실패했습니다.");
        }
      } catch (error) {
        message.error("GL처리 적용 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("GL처리 적용 실패:", error);
        }
      } finally {
        set({ loading: false });
      }
    },

    // 회계일자 체크 액션
    // checkGlDate: async (checkRequest) => {
    //   try {
    //     const response = await chkGlDate(checkRequest);
    //     if (response.success && response.data) {
    //       return response.data.result;
    //     }
    //     return 0;
    //   } catch (error) {
    //     console.error("회계일자 체크 실패:", error);
    //     return 0;
    //   }
    // },

    // 전표 생성 액션
    createSlip: async (request) => {
      const state = get();
      if (state.loading) return false;

      set({ loading: true });

      try {
        const response = await createAdvpayCtExcclcProcessSlip(request);
        
        if (response.success && response.data) {
          if (response.data.pResult === "S") {
            return true;
          } else {
            message.error(response.data.pErrbuff || "전표 생성에 실패했습니다.");
            return false;
          }
        } else {
          message.error(response.message || "전표 생성에 실패했습니다.");
          return false;
        }
      } catch (error) {
        message.error("전표 생성 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("전표 생성 실패:", error);
        }
        return false;
      } finally {
        set({ loading: false });
      }
    },

    // 전표 취소 액션
    cancelSlip: async (request) => {
      const state = get();
      if (state.loading) return false;

      set({ loading: true });

      try {
        const response = await cancelAdvpayCtExcclcProcessSlip(request);
        
        if (response.success && response.data) {
          if (response.data.pResult === "S") {
            return true;
          } else {
            message.error(response.data.pErrbuff || "전표 취소에 실패했습니다.");
            return false;
          }
        } else {
          message.error(response.message || "전표 취소에 실패했습니다.");
          return false;
        }
      } catch (error) {
        message.error("전표 취소 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("전표 취소 실패:", error);
        }
        return false;
      } finally {
        set({ loading: false });
      }
    },
  })
);
