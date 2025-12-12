import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  selectBcncList,
  selectBcncDetail,
  selectBcncShipList,
  saveBcnc,
  selectBcncInsertInfo,
  searchBcncList,
} from "@apis/fcm/md/partner/bcncRegistApi";
import { useAuthStore } from "@store/authStore";
import type {
  BcncSrchRequest,
  BcncListResponse,
  BcncDetailResponse,
  BcncShipResponse,
  BcncInsertInfoResponse,
  BcncSaveRequest,
} from "@/types/fcm/md/partner/bcncRegist.types";

interface BcncRegistState {
  // 상태
  searchData: BcncListResponse[];
  detailData: BcncDetailResponse | null;
  shipListData: BcncShipResponse[];
  insertInfoData: BcncInsertInfoResponse | null;
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: BcncSrchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: BcncListResponse[]) => void;
  setDetailData: (data: BcncDetailResponse | null) => void;
  setShipListData: (data: BcncShipResponse[]) => void;
  setInsertInfoData: (data: BcncInsertInfoResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  search: (searchRequest: BcncSrchRequest) => Promise<void>;
  getDetail: (searchRequest: BcncSrchRequest) => Promise<void>;
  getShipList: (searchRequest: BcncSrchRequest) => Promise<void>;
  getInsertInfo: (searchRequest: BcncSrchRequest) => Promise<void>;
  save: (saveRequest: BcncSaveRequest) => Promise<void>;
  searchBcnc: (searchRequest: BcncSrchRequest) => Promise<BcncDetailResponse[]>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useBcncRegistStore = create<BcncRegistState>((set, get) => ({
  // 초기 상태
  searchData: [],
  detailData: null,
  shipListData: [],
  insertInfoData: null,
  loading: false,
  gridApi: null,
  lastSearchRequest: null,

  // 상태 설정 액션
  setSearchData: (data) => set({ searchData: data }),
  setDetailData: (data) => set({ detailData: data }),
  setShipListData: (data) => set({ shipListData: data }),
  setInsertInfoData: (data) => set({ insertInfoData: data }),
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),

  // 목록 조회 액션
  search: async (searchRequest) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await selectBcncList(searchRequest);

      if (response.success && response.data) {
        set({ searchData: response.data, lastSearchRequest: searchRequest });
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

  // 상세 조회 액션
  getDetail: async (searchRequest) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await selectBcncDetail(searchRequest);

      if (response.success && response.data) {
        set({ detailData: response.data });
      } else {
        message.error(response.message || "상세 조회에 실패했습니다.");
        set({ detailData: null });
      }
    } catch (error) {
      message.error("상세 조회 중 오류가 발생했습니다.");
      set({ detailData: null });
      if (import.meta.env.DEV) {
        console.error("상세 조회 실패:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  // 배송지 목록 조회 액션
  getShipList: async (searchRequest) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await selectBcncShipList(searchRequest);

      if (response.success && response.data) {
        set({ shipListData: response.data });
      } else {
        message.error(response.message || "배송지 조회에 실패했습니다.");
        set({ shipListData: [] });
      }
    } catch (error) {
      message.error("배송지 조회 중 오류가 발생했습니다.");
      set({ shipListData: [] });
      if (import.meta.env.DEV) {
        console.error("배송지 조회 실패:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  // 입력 관련 정보 조회 액션
  getInsertInfo: async (searchRequest) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await selectBcncInsertInfo(searchRequest);

      if (response.success && response.data) {
        set({ insertInfoData: response.data });
      } else {
        message.error(
          response.message || "입력 관련 정보 조회에 실패했습니다."
        );
        set({ insertInfoData: null });
      }
    } catch (error) {
      message.error("입력 관련 정보 조회 중 오류가 발생했습니다.");
      set({ insertInfoData: null });
      if (import.meta.env.DEV) {
        console.error("입력 관련 정보 조회 실패:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  // 저장 액션
  save: async (saveRequest) => {
    const { user } = useAuthStore.getState();

    if (!user) {
      message.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (import.meta.env.DEV) {
      console.log("=== 저장 요청 파라미터 ===");
      console.log("saveRequest:", saveRequest);
      console.log("rowStatus:", saveRequest.rowStatus);
      console.log("========================");
    }

    set({ loading: true });

    try {
      const response = await saveBcnc(saveRequest);

      if (response.success) {
        const actionType =
          saveRequest.rowStatus === "C"
            ? "등록"
            : saveRequest.rowStatus === "U"
            ? "수정"
            : "삭제";
        message.success(`거래처가 ${actionType}되었습니다.`);

        // 저장 성공 후 그리드 재조회
        await get().refresh();
      } else {
        message.error(response.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      message.error("저장 중 오류가 발생했습니다.");
      if (import.meta.env.DEV) {
        console.error("저장 실패:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  // 팝업 검색 액션
  searchBcnc: async (searchRequest) => {
    try {
      const response = await searchBcncList(searchRequest);

      if (response.success && response.data) {
        return response.data;
      } else {
        message.error(response.message || "검색에 실패했습니다.");
        return [];
      }
    } catch (error) {
      message.error("검색 중 오류가 발생했습니다.");
      if (import.meta.env.DEV) {
        console.error("검색 실패:", error);
      }
      return [];
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
      detailData: null,
      shipListData: [],
      insertInfoData: null,
      loading: false,
      gridApi: null,
      lastSearchRequest: null,
    }),
}));
