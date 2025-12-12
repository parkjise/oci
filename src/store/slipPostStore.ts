import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import dayjs from "dayjs";
import { slip } from "@apis/fcm/gl";
import { useAuthStore } from "@store/authStore";
import type {
  SlipPostSearchRequest,
  SlipPostSearchResponse,
  SlipPostSaveRequest,
  SlipPostSaveHeader,
  SlipPostSaveDetail,
} from "@/types/fcm/gl/slip/slipPost.types";

interface SlipPostState {
  // 상태
  searchData: SlipPostSearchResponse[];
  sPostYn: string; // "UNPOST" | "POST"
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: SlipPostSearchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: SlipPostSearchResponse[]) => void;
  setSPostYn: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  search: (
    searchRequest: SlipPostSearchRequest,
    sPostYn?: string
  ) => Promise<void>;
  save: (selectedRows: SlipPostSearchResponse[]) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useSlipPostStore = create<SlipPostState>((set, get) => ({
  // 초기 상태
  searchData: [],
  sPostYn: "UNPOST",
  loading: false,
  gridApi: null,
  lastSearchRequest: null,

  // 상태 설정 액션
  setSearchData: (data) => set({ searchData: data }),
  setSPostYn: (value) => set({ sPostYn: value }),
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),

  // 조회 액션
  search: async (searchRequest, sPostYnParam) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    // sPostYn 파라미터가 있으면 store에 저장
    const currentSPostYn = sPostYnParam || state.sPostYn;
    if (sPostYnParam && sPostYnParam !== state.sPostYn) {
      set({ sPostYn: sPostYnParam });
    }

    try {
      const response = await slip.selectSlipPostList(searchRequest);

      if (response.success && response.data) {
        // sPostYn에 따라 필터링 (exptnTgt 기준)
        let filteredData = response.data;

        if (currentSPostYn === "UNPOST") {
          // 전기: exptnTgt가 "N"인 것만 (전기 가능한 것)
          filteredData = response.data.filter(
            (item: SlipPostSearchResponse) => item.exptnTgt === "N"
          );
        } else if (currentSPostYn === "POST") {
          // 전기취소: exptnTgt가 "Y"이고 reverse와 reference4가 없는 것만 (전기취소 가능한 것)
          filteredData = response.data.filter(
            (item: SlipPostSearchResponse) =>
              item.exptnTgt === "Y" && !item.reverse && !item.reference4
          );
        }

        set({ searchData: filteredData, lastSearchRequest: searchRequest });
        message.success(`조회 완료: ${filteredData.length}건`);
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

  // 저장 액션
  save: async (selectedRows) => {
    const state = get();
    const { user } = useAuthStore.getState();

    if (import.meta.env.DEV) {
      console.log("Current Auth State:", useAuthStore.getState());
    }

    if (!state.sPostYn) {
      message.warning("전기 또는 전기취소를 선택해주세요.");
      return;
    }

    if (!user) {
      message.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    const currentDate = dayjs().format("YYYY-MM-DD");
    const userId = user.empCode || "SYSTEM";

    // 저장할 데이터 구성
    const headers: SlipPostSaveHeader[] = [];
    const details: SlipPostSaveDetail[] = [];

    if (state.sPostYn === "UNPOST") {
      // 전기 처리
      selectedRows.forEach((row, index) => {
        if (!row.slpHeaderId) return;

        const header: SlipPostSaveHeader = {
          slpHeaderId: row.slpHeaderId,
          ackPer: userId,
          exptnTgt: "Y",
          reference2: currentDate, // 전기일자
          reference4: "",
          rowStatus: "U",
          lastUpdatedBy: userId,
          programId: "FCM-SERVICE",
          terminalId: "LOCAL",
        };

        const detail: SlipPostSaveDetail = {
          exptnTgt: "Y",
          slpHeaderId: row.slpHeaderId,
          rowSeq: index,
          rowStatus: "U",
          lastUpdatedBy: userId,
          programId: "FCM-SERVICE",
          terminalId: "LOCAL",
        };

        headers.push(header);
        details.push(detail);
      });
    } else if (state.sPostYn === "POST") {
      // 전기취소 처리
      selectedRows.forEach((row, index) => {
        if (!row.slpHeaderId) return;

        const header: SlipPostSaveHeader = {
          slpHeaderId: row.slpHeaderId,
          ackPer: "",
          exptnTgt: "N",
          reference2: "",
          reference4: currentDate, // 전기취소일자
          rowStatus: "U",
          lastUpdatedBy: userId,
          programId: "FCM-SERVICE",
          terminalId: "LOCAL",
        };

        const detail: SlipPostSaveDetail = {
          exptnTgt: "N",
          slpHeaderId: row.slpHeaderId,
          rowSeq: index,
          rowStatus: "U",
          lastUpdatedBy: userId,
          programId: "FCM-SERVICE",
          terminalId: "LOCAL",
        };

        headers.push(header);
        details.push(detail);
      });
    }

    const saveRequest: SlipPostSaveRequest = {
      headers,
      details,
    };

    // 저장 요청 파라미터 콘솔 출력 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log("=== 저장 요청 파라미터 ===");
      console.log("saveRequest:", saveRequest);
      console.log("sPostYn:", state.sPostYn);
      console.log("선택된 행 개수:", selectedRows.length);
      console.log("========================");
    }

    try {
      const response = await slip.saveSlipPost(saveRequest);

      if (response.success) {
        const actionType = state.sPostYn === "UNPOST" ? "전기" : "전기취소";
        message.success(
          `${selectedRows.length}건의 항목이 ${actionType} 처리되었습니다.`
        );

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
      sPostYn: "UNPOST",
      loading: false,
      gridApi: null,
      lastSearchRequest: null,
    }),
}));
