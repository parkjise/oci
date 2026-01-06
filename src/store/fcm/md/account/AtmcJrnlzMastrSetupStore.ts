import { create } from "zustand";
import type {
  MasterRowData,
  DetailRowData,
} from "@/types/fcm/md/account/AtmcJrnlzMastrSetup.types";
import {
  selectAtmcJrnlzMastrSetupHderList,
  selectAtmcJrnlzMastrSetupDetailList,
} from "@/apis/fcm/md/account/atmcJrnlzMastrSetupApi";

interface AtmcJrnlzMastrSetupState {
  masterList: MasterRowData[];
  detailList: DetailRowData[];
  detailCache: Record<string, DetailRowData[]>; // Master ID별 디테일 데이터 캐시
  loading: boolean;
  selectedMasterRow: MasterRowData | null;

  setMasterList: (list: MasterRowData[]) => void;
  setDetailList: (list: DetailRowData[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedMasterRow: (row: MasterRowData | null) => void;

  fetchMasterList: () => Promise<void>;
  fetchDetailList: (officeId: string, applName: string, accountingType: string, glItem: string) => Promise<void>;
  reset: () => void;
}

export const useAtmcJrnlzMastrSetupStore = create<AtmcJrnlzMastrSetupState>((set, get) => ({
  masterList: [],
  detailList: [],
  detailCache: {},
  loading: false,
  selectedMasterRow: null,

  setMasterList: (list) => set({ masterList: list }),
  setDetailList: (list) => {
    const { selectedMasterRow } = get();
    if (selectedMasterRow) {
      set((state) => ({
        detailList: list,
        detailCache: {
          ...state.detailCache,
          [selectedMasterRow.id]: list,
        },
      }));
    } else {
      set({ detailList: list });
    }
  },
  setLoading: (loading) => set({ loading: loading }),
  setSelectedMasterRow: (row) => {
    const { detailCache } = get();
    // 선택된 마스터가 바뀌면 해당 마스터의 캐시된 디테일 정보를 불러옴
    const cachedDetail = row ? detailCache[row.id] || [] : [];
    set({ selectedMasterRow: row, detailList: cachedDetail });
  },

  fetchMasterList: async () => {
    set({ loading: true });
    try {
      const response = await selectAtmcJrnlzMastrSetupHderList();
      if (response.success && response.data) {
        set({
          masterList: response.data.map((item) => ({
            ...item,
            id: `${item.applName}_${item.accountingType}_${item.glItem}`,
            oriApplName: item.applName,
            oriAccountingType: item.accountingType,
            oriGlItem: item.glItem,
          })),
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchDetailList: async (officeId, applName, accountingType, glItem) => {
    const { selectedMasterRow } = get();
    if (!selectedMasterRow) return;

    set({ loading: true });
    try {
      const response = await selectAtmcJrnlzMastrSetupDetailList({
        asOfficeId: officeId,
        asApplName: applName,
        asAccountingType: accountingType,
        asGlItem: glItem,
      });
      if (response.success && response.data) {
        const mappedDetails = response.data.map((item) => ({
          ...item,
          id: `${item.applName}_${item.accountingType}_${item.glItem}_${item.glClass}`,
          oriApplName: item.applName,
          oriAccountingType: item.accountingType,
          oriGlItem: item.glItem,
          oriGlClass: item.glClass,
        }));

        set((state) => ({
          detailList: mappedDetails,
          detailCache: {
            ...state.detailCache,
            [selectedMasterRow.id]: mappedDetails,
          },
        }));
      }
    } finally {
      set({ loading: false });
    }
  },

  reset: () =>
    set({
      masterList: [],
      detailList: [],
      detailCache: {},
      loading: false,
      selectedMasterRow: null,
    }),
}));
