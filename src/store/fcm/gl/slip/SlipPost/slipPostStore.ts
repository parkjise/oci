import { create } from "zustand";
import type { GridApi } from "ag-grid-community";
import dayjs from "dayjs";
import { slip } from "@apis/fcm/gl";
import { useAuthStore } from "@store/com/auth/authStore";
import {
  showSuccess,
  showError,
  showWarning,
} from "@/components/ui/feedback/Message";
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
  handleSaveFromGrid: () => Promise<void>; // Grid에서 호출하는 저장 액션
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
    if (sPostYnParam && sPostYnParam !== state.sPostYn) {
      set({ sPostYn: sPostYnParam });
    }

    try {
      const response = await slip.selectSlipPostList(searchRequest);

      if (response.success && response.data) {
        // [수정] 서버에서 이미 asTgt 조건으로 필터링된 데이터를 받으므로
        // 프론트엔드에서 다시 필터링하지 않고 바로 사용
        // 서버 쿼리가 정확하다는 가정하에 이중 필터링 제거
        const filteredData = response.data;

        set({ searchData: filteredData, lastSearchRequest: searchRequest });
        showSuccess(`조회 완료: ${filteredData.length}건`);
      } else {
        showError(response.message || "조회에 실패했습니다.");
        set({ searchData: [] });
      }
    } catch (error) {
      showError("조회 중 오류가 발생했습니다.");
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
      showWarning("전기 또는 전기취소를 선택해주세요.");
      return;
    }

    if (!user) {
      showError("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (selectedRows.length === 0) {
      showWarning("선택된 항목이 없습니다.");
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
        showSuccess(
          `${selectedRows.length}건의 항목이 ${actionType} 처리되었습니다.`
        );

        // 저장 성공 후 그리드 재조회
        await get().refresh();
      } else {
        showError(response.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      showError("저장 중 오류가 발생했습니다.");
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
      showWarning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
    }
  },

  // Grid에서 호출하는 저장 액션 (선택된 행을 가져와서 저장)
  handleSaveFromGrid: async () => {
    const state = get();
    if (!state.gridApi) {
      showError("그리드가 초기화되지 않았습니다.");
      return;
    }

    // 데이터 조회 여부 확인
    if (state.searchData.length === 0) {
      showWarning("데이터 조회 후 선택 바랍니다.");
      return;
    }

    // 선택된 행 가져오기
    const selectedRows = state.gridApi.getSelectedRows() as SlipPostSearchResponse[];

    // 선택된 행이 있는지 확인
    if (selectedRows.length === 0) {
      showWarning("체크된 데이터가 없습니다.");
      return;
    }

    // 기존 save 함수 호출
    await get().save(selectedRows);
  },

  // 초기화 액션
  reset: () => {
    const state = get();
    set({
      searchData: [],
      sPostYn: "UNPOST",
      loading: false,
      gridApi: state.gridApi, // ✅ gridApi 유지 (Rule 3.2)
      lastSearchRequest: null,
    });
    
    // 그리드 데이터도 초기화
    if (state.gridApi) {
      state.gridApi.setGridOption("rowData", []);
    }
  },
}));
