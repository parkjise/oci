import { create } from "zustand";
import {
  showError,
  showWarning,
  showSuccess,
} from "@/components/ui/feedback/Message";
import dayjs from "dayjs";
import type { GridApi } from "ag-grid-community";
import {
  selectBcncList,
  selectBcncDetail,
  selectBcncShipList,
  saveBcnc,
  selectBcncInsertInfo,
  searchBcncList,
} from "@apis/fcm/md/partner/BcncRegist/BcncRegistApi";
import { useAuthStore } from "@store/com/auth/authStore";
import type {
  BcncSrchRequest,
  BcncListResponse,
  BcncDetailResponse,
  BcncShipResponse,
  BcncInsertInfoResponse,
  BcncSaveRequest,
} from "@/types/fcm/md/partner/BcncRegist/BcncRegist.types";

interface BcncRegistState {
  // 상태
  searchData: BcncListResponse[];
  detailData: BcncDetailResponse | null;
  shipListData: (BcncShipResponse & {
    rowStatus?: "C" | "U" | "D";
    id?: string;
  })[];
  insertInfoData: BcncInsertInfoResponse | null;
  loading: boolean;
  gridApi: GridApi | null;
  detailGridApi: GridApi | null; // 우측 상세 그리드용 API 추가
  lastSearchRequest: BcncSrchRequest | null; // 마지막 검색 조건 저장
  detailViewMode: "view" | "edit"; // DetailView의 모드 상태

  // 액션
  setSearchData: (data: BcncListResponse[]) => void;
  setDetailData: (data: BcncDetailResponse | null) => void;
  setShipListData: (
    data: (BcncShipResponse & { rowStatus?: "C" | "U" | "D"; id?: string })[]
  ) => void;
  setInsertInfoData: (data: BcncInsertInfoResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  setDetailGridApi: (api: GridApi | null) => void;
  setDetailViewMode: (mode: "view" | "edit") => void;
  updateShipListItem: (
    shipId: string,
    updates: Partial<
      BcncShipResponse & { rowStatus?: "C" | "U" | "D"; id?: string }
    >
  ) => void;
  addShipListItem: (
    item: BcncShipResponse & { rowStatus?: "C" | "U" | "D"; id?: string }
  ) => void;
  search: (searchRequest: BcncSrchRequest) => Promise<void>;
  getDetail: (searchRequest: BcncSrchRequest) => Promise<void>;
  getShipList: (searchRequest: BcncSrchRequest) => Promise<void>;
  getInsertInfo: (searchRequest: BcncSrchRequest) => Promise<void>;
  save: (saveRequest: BcncSaveRequest) => Promise<void>;
  searchBcnc: (searchRequest: BcncSrchRequest) => Promise<BcncDetailResponse[]>;
  refresh: () => Promise<void>;
  reset: () => void;
  
  // 🚀 [최적화] 통합 액션 - Batch Update로 연쇄 리렌더링 방지
  selectRow: (officeId: string, custno: string) => Promise<void>; // 상세 조회 통합
  initNew: (officeId: string) => Promise<void>; // 신규 등록 통합
}

export const useBcncRegistStore = create<BcncRegistState>((set, get) => ({
  // 초기 상태
  searchData: [],
  detailData: null,
  shipListData: [],
  insertInfoData: null,
  loading: false,
  gridApi: null,
  detailGridApi: null,
  lastSearchRequest: null,
  detailViewMode: "view", // 기본값: view 모드

  // 상태 설정 액션
  setSearchData: (data) => set({ searchData: data }),
  setDetailData: (data) => set({ detailData: data }),
  setShipListData: (data) => set({ shipListData: data }),
  setInsertInfoData: (data) => set({ insertInfoData: data }),
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),
  setDetailGridApi: (api) => set({ detailGridApi: api }),
  setDetailViewMode: (mode) => set({ detailViewMode: mode }),

  // 배송지 목록 개별 아이템 업데이트 액션
  updateShipListItem: (shipIdOrId, updates) => {
    set((state) => ({
      shipListData: state.shipListData.map((item) =>
        item.shipId === shipIdOrId || item.id === shipIdOrId
          ? { ...item, ...updates }
          : item
      ),
    }));
  },

  // 배송지 추가 액션
  addShipListItem: (item) => {
    set((state) => ({
      shipListData: [item, ...state.shipListData],
    }));
  },

  // 목록 조회 액션
  search: async (searchRequest) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await selectBcncList(searchRequest);

      if (response.success && response.data) {
        set({ 
          searchData: response.data, 
          lastSearchRequest: searchRequest,
          // ✅ 조회 시 우측 DetailView/DetailGrid 초기화
          detailData: null,
          shipListData: [],
          detailViewMode: "view",
        });
        
        // ✅ LeftGrid 선택 해제
        const { gridApi, detailGridApi } = get();
        if (gridApi) {
          gridApi.deselectAll();
        }
        // ✅ DetailGrid도 초기화
        if (detailGridApi) {
          detailGridApi.setGridOption("rowData", []);
        }
        
        showSuccess(`조회 완료: ${response.data.length}건`);
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

  // 상세 조회 액션
  getDetail: async (searchRequest) => {
    try {
      const response = await selectBcncDetail(searchRequest);

      if (response.success && response.data) {
        set({ detailData: response.data });
      } else {
        showError(response.message || "상세 조회에 실패했습니다.");
        set({ detailData: null });
      }
    } catch (error) {
      showError("상세 조회 중 오류가 발생했습니다.");
      set({ detailData: null });
      if (import.meta.env.DEV) {
        console.error("상세 조회 실패:", error);
      }
    }
  },

  // 배송지 목록 조회 액션
  getShipList: async (searchRequest) => {
    try {
      const response = await selectBcncShipList(searchRequest);

      if (response.success && response.data) {
        set({ shipListData: response.data });
      } else {
        showError(response.message || "배송지 조회에 실패했습니다.");
        set({ shipListData: [] });
      }
    } catch (error) {
      showError("배송지 조회 중 오류가 발생했습니다.");
      set({ shipListData: [] });
      if (import.meta.env.DEV) {
        console.error("배송지 조회 실패:", error);
      }
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
        showError(
          response.message || "입력 관련 정보 조회에 실패했습니다."
        );
        set({ insertInfoData: null });
      }
    } catch (error) {
      showError("입력 관련 정보 조회 중 오류가 발생했습니다.");
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
      const errorMsg = "사용자 정보를 찾을 수 없습니다.";
      showError(errorMsg);
      throw new Error(errorMsg);
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
        showSuccess(`거래처가 ${actionType}되었습니다.`);

        // 저장 성공 후 그리드 재조회
        await get().refresh();
      } else {
        const errorMsg = response.message || "저장에 실패했습니다.";
        showError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
      showError(errorMsg);
      if (import.meta.env.DEV) {
        console.error("저장 실패:", error);
      }
      throw error; // 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록 함
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
        showError(response.message || "검색에 실패했습니다.");
        return [];
      }
    } catch (error) {
      showError("검색 중 오류가 발생했습니다.");
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
      showWarning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
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
      detailViewMode: "view",
    }),

  // 🚀 [최적화 1] 상세 조회 통합 액션 (Row Click 시 사용)
  // 기존: Loading(T) -> Detail(fetch) -> Ship(fetch) -> ViewMode -> Loading(F) (총 5회 렌더링)
  // 변경: Loading(T) -> Promise.all -> SetAll(State) (총 2회 렌더링)
  selectRow: async (officeId, custno) => {
    const state = get();
    // 이미 같은 데이터를 보고 있다면 무시
    if (
      state.detailData?.officeId === officeId &&
      state.detailData?.custno === custno
    ) {
      return;
    }

    set({ loading: true }); // 1차 렌더링 (로딩 표시)

    try {
      // 병렬 조회
      const [detailRes, shipRes] = await Promise.all([
        selectBcncDetail({ asOfficeId: officeId, asCustno: custno }),
        selectBcncShipList({ asOfficeId: officeId, asCustno: custno }),
      ]);

      // 상태를 한 번에 업데이트 (Batch) -> 2차 렌더링 (데이터 표시)
      set({
        detailData: detailRes.success ? detailRes.data : null,
        shipListData: shipRes.success ? shipRes.data : [],
        detailViewMode: "view", // 조회 모드로 강제 전환
        loading: false,
      });

      if (!detailRes.success)
        showError(detailRes.message || "상세 조회에 실패했습니다.");
      if (!shipRes.success)
        showError(shipRes.message || "배송지 조회에 실패했습니다.");
    } catch (error) {
      console.error(error);
      set({ detailData: null, shipListData: [], loading: false });
      showError("조회 중 오류가 발생했습니다.");
    }
  },

  // 🚀 [최적화 2] 신규 등록 통합 액션 (Create Click 시 사용)
  initNew: async (officeId) => {
    set({ loading: true }); // 1차 렌더링

    try {
      // 초기화 정보 조회
      const res = await selectBcncInsertInfo({ asOfficeId: officeId });
      const insertInfoData = res.success ? res.data : null;

      // ⚡ [최적화] 초기 데이터를 폼에 맞는 형태로 완전히 준비
      // dayjs 변환을 여기서 미리 처리하여 DetailView useEffect 부담 감소
      let initialDetailData: any = null;
      if (insertInfoData) {
        initialDetailData = {
          method: insertInfoData.lsPayGroup,
          acctNum1: insertInfoData.lsLiability,
          acctName1: insertInfoData.lsLiaName,
          acctNum2: insertInfoData.lsPrepay,
          acctName2: insertInfoData.lsPreName,
          custno: insertInfoData.lsCustno,
          useYno: "Y",
          currency: "KRW",
          nationalCde: "KOR",
          nationName: "대한민국",
          sdate: dayjs(), // ✅ dayjs 객체로 저장 (문자열 변환 불필요)
          rowStatus: "C",
        };
      }

      // 그리드 시각적 초기화 (Store 업데이트 전에 먼저 실행)
      const { gridApi, detailGridApi } = get();
      if (gridApi) {
        gridApi.deselectAll();
        gridApi.clearFocusedCell();
      }
      if (detailGridApi) {
        detailGridApi.setGridOption("rowData", []);
      }

      // ⚡ 상태 일괄 업데이트 -> 2차 렌더링 (이게 끝!)
      set({
        insertInfoData,
        detailData: initialDetailData,
        shipListData: [], // 우측 그리드 초기화
        detailViewMode: "edit", // 편집 모드로 전환
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false });
      showError("초기화 정보 조회 중 오류가 발생했습니다.");
    }
  },
}));
