import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  showWarning,
  showSuccess,
  showError,
  showInfo,
} from "@/components/ui/feedback/Message";
import type { GridApi } from "ag-grid-community";
import {
  selectBcncAcnutList,
  saveBcncAcnut,
  selectBcncAcnutRegistMaxSeq,
} from "@/apis/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegistApi";
import { getCodeDetailApi } from "@/apis/com/code";
import { useAuthStore } from "@store/com/auth/authStore";
import type { CodeDetail } from "@/types/com/api/api.types";
import type {
  BcncAcnutSrchRequest,
  BcncAcnutListResponse,
} from "@/types/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegist.types";

interface BcncAcnutRegistState {
  // State
  gridData: BcncAcnutListResponse[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: BcncAcnutSrchRequest | null;
  currencyCodes: CodeDetail[];

  // Actions
  setGridData: (data: BcncAcnutListResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;

  fetchData: (params: BcncAcnutSrchRequest) => Promise<void>;
  fetchCurrencyCodes: () => Promise<void>;
  saveData: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  gridData: [],
  loading: false,
  gridApi: null,
  lastSearchRequest: null,
  currencyCodes: [],
};

export const useBcncAcnutRegistStore = create<BcncAcnutRegistState>()(
  devtools((set, get) => ({
    ...initialState,

    setGridData: (data) => set({ gridData: data }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),

    fetchData: async (params) => {
      const { user } = useAuthStore.getState();
      if (!user?.officeId) {
        showWarning("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // Automatically inject officeId from AuthUser
      const requestParams: BcncAcnutSrchRequest = {
        ...params,
        asOfficeId: user.officeId,
      };

      set({ loading: true, lastSearchRequest: requestParams });

      try {
        const response = await selectBcncAcnutList(requestParams);
        if (response.success && response.data) {
          // Add unique ID for Grid operations
          const dataWithIds = response.data.map((item, index) => ({
            ...item,
            id: index + 1,
            rowStatus: "", // Initial status (Empty instead of 'R')
          })) as BcncAcnutListResponse[]; // Cast to ensure type compatibility

          set({ gridData: dataWithIds });
          showSuccess(`조회 완료: ${response.data.length}건`);
        } else {
          showError(response.message || "조회에 실패했습니다.");
          set({ gridData: [] });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showError("조회 중 오류가 발생했습니다.");
        set({ gridData: [] });
      } finally {
        set({ loading: false });
      }
    },

    fetchCurrencyCodes: async () => {
      try {
        const response = await getCodeDetailApi({
          module: "GL",
          type: "FRNCUR",
          enabledFlag: "Y",
        });
        if (response.success && response.data) {
          // API returns an array for this type of request despite the type definition saying single CodeDetail
          set({ currencyCodes: response.data as unknown as CodeDetail[] });
        }
      } catch (error) {
        console.error("Failed to fetch currency codes:", error);
      }
    },

    saveData: async () => {
      const {
        gridData: storeGridData,
        lastSearchRequest,
        fetchData,
        gridApi,
      } = get();

      if (!lastSearchRequest?.asCustno) {
        showError("거래처 정보가 없습니다. 저장이 불가능합니다.");
        return;
      }

      // Sync Grid Data from API if available to ensure we have latest edits
      let currentGridData = storeGridData;
      if (gridApi) {
        const rowData: BcncAcnutListResponse[] = [];
        gridApi.forEachNode((node) => {
          if (node.data) {
            rowData.push(node.data);
          }
        });
        currentGridData = rowData;
        // Optionally update store
        set({ gridData: rowData });
      }

      // 1. Validation Logic
      let inPriCnt = 0;
      let outPriCnt = 0;
      let hasIn = false;
      let hasOut = false;

      // Check all rows (not just changed ones) for validation context
      currentGridData.forEach((row) => {
        if (row.rowStatus !== "D") {
          // Ignore deleted rows for uniqueness check
          if (row.inoutType === "1") hasIn = true;
          if (row.inoutType === "2") hasOut = true;

          if (row.defaultYn === "Y") {
            if (row.inoutType === "1") {
              inPriCnt++;
            } else if (row.inoutType === "2") {
              outPriCnt++;
            }
          }
        }
      });

      // "Primary 계좌번호는 반드시 입출금별로 하나여야 합니다!" (MSG_CM_1981)
      if (
        inPriCnt > 1 ||
        outPriCnt > 1 ||
        (inPriCnt === 0 && hasIn) ||
        (outPriCnt === 0 && hasOut)
      ) {
        showError("Primary 계좌번호는 반드시 입출금별로 하나여야 합니다!");
        return;
      }

      // Filter rows with changes (C: Create, U: Update, D: Delete)
      const changedRows = currentGridData.filter(
        (row) =>
          row.rowStatus === "C" ||
          row.rowStatus === "U" ||
          row.rowStatus === "D"
      );

      if (changedRows.length === 0) {
        showInfo("저장할 데이터가 없습니다.");
        return;
      }

      set({ loading: true });

      try {
        // 2. Max Seq Logic for New Rows
        const newRows = changedRows.filter((row) => row.rowStatus === "C");
        if (newRows.length > 0 && lastSearchRequest) {
          const seqResponse =
            await selectBcncAcnutRegistMaxSeq(lastSearchRequest);
          if (
            seqResponse.success &&
            seqResponse.data &&
            typeof seqResponse.data.seq === "number"
          ) {
            let maxSeq = seqResponse.data.seq;
            newRows.forEach((row) => {
              maxSeq++;
              row.seq = maxSeq;
            });
          }
        }

        const response = await saveBcncAcnut(changedRows);

        if (response.success) {
          showSuccess("저장되었습니다.");
          // Refresh data if last search request exists
          if (lastSearchRequest) {
            await fetchData(lastSearchRequest);
          } else {
            // If no search context, clear data or reset
            set({ gridData: [] });
          }
        } else {
          showError(response.message || "저장에 실패했습니다.");
        }
      } catch (error) {
        console.error("Failed to save data:", error);
        showError("저장 중 오류가 발생했습니다.");
      } finally {
        set({ loading: false });
      }
    },

    reset: () => {
      set((state) => ({
        ...initialState,
        gridApi: state.gridApi, // Keep the existing grid API instance
      }));
      // Optional: Clear grid data visually
      if (get().gridApi) {
        get().gridApi?.setGridOption("rowData", []);
      }
    },
  }))
);
