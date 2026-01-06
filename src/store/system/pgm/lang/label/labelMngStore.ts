import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  getLabelListApi,
  saveLabelApi,
  type LabelDto,
  type LabelSearchRequest,
  type LabelSaveRequest,
} from "@apis/system/label/labelApi";
import { getCodeDetailApi } from "@apis/com/code";
import type { CodeDetail } from "@/types/com/api/api.types";
import { getUUID } from "@utils/uuidUtils";

interface LabelMngState {
  // 상태
  labelList: (LabelDto & { id?: string; chk?: boolean })[];
  langTypeList: CodeDetail[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: LabelSearchRequest | null;

  // 액션
  setLabelList: (data: (LabelDto & { id?: string; chk?: boolean })[]) => void;
  setLangTypeList: (data: CodeDetail[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;

  // 비즈니스 로직
  fetchLangTypeList: () => Promise<void>;
  search: (request: LabelSearchRequest) => Promise<void>;
  insert: () => void;
  deleteRows: (selectedRows: (LabelDto & { id?: string })[]) => void;
  save: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  handleCellValueChanged: (params: {
    data: any;
    node: any;
    column: any;
  }) => void;
}

export const useLabelMngStore = create<LabelMngState>((set, get) => ({
  // 초기 상태
  labelList: [],
  langTypeList: [],
  loading: false,
  gridApi: null,
  lastSearchRequest: null,

  // 상태 설정 액션
  setLabelList: (data) => set({ labelList: data }),
  setLangTypeList: (data) => set({ langTypeList: data }),
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),

  // 언어 타입 코드 조회
  fetchLangTypeList: async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000700",
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        set({ langTypeList: codeList });
      }
    } catch (error) {
      console.error("언어 타입 조회 실패:", error);
    }
  },

  // 다국어 라벨 목록 조회
  search: async (request) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await getLabelListApi(request);
      if (response.success) {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data
          ? [response.data]
          : [];

        const dataWithId = data.map((item) => ({
          ...item,
          id: `${item.locale}_${item.key}`,
          rowStatus: undefined,
        }));

        set({ labelList: dataWithId, lastSearchRequest: request });
        message.success(`조회 완료: ${dataWithId.length}건`);
      } else {
        set({ labelList: [] });
      }
    } catch (error) {
      console.error("다국어 라벨 목록 조회 실패:", error);
      message.error("조회 중 오류가 발생했습니다.");
      set({ labelList: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 입력 핸들러
  insert: () => {
    const state = get();
    const currentData = state.labelList;
    const newRow: LabelDto & { id?: string } = {
      locale: "",
      key: "",
      label: "",
      rowStatus: "C",
      id: `new_${getUUID()}`,
    };

    set({ labelList: [newRow, ...currentData] });
  },

  // 삭제 핸들러
  deleteRows: (selectedRows) => {
    const state = get();

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    const currentData = state.labelList;
    const updatedData = currentData
      .map((row) => {
        const isSelected = selectedRows.some(
          (selected) =>
            selected.locale === row.locale && selected.key === row.key
        );
        if (isSelected) {
          if (row.rowStatus === "C") {
            return null;
          } else {
            return { ...row, rowStatus: "D" as const };
          }
        }
        return row;
      })
      .filter((row) => row !== null) as (LabelDto & { id?: string })[];

    set({ labelList: updatedData });
  },

  // 저장 핸들러
  save: async () => {
    const state = get();
    const currentData = state.labelList;

    const hasChanges = currentData.some(
      (row) =>
        row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D"
    );

    if (!hasChanges) {
      message.info("변경된 데이터가 없습니다.");
      return;
    }

    set({ loading: true });

    try {
      const saveItems: LabelSaveRequest["labels"] = currentData
        .filter(
          (row) =>
            row.rowStatus === "C" ||
            row.rowStatus === "U" ||
            row.rowStatus === "D"
        )
        .map((row) => ({
          rowStatus: row.rowStatus!,
          locable: row.locale,
          lKey: row.key,
          lable: row.label,
          lableDesc: row.desc,
          oriLocable: row.oriLocable,
          oriLKey: row.oriLKey,
        }));

      const request: LabelSaveRequest = {
        labels: saveItems,
      };

      const response = await saveLabelApi(request);

      if (response.success) {
        const responseMessage = response.data?.message || "저장되었습니다.";
        message.success(responseMessage);
        
        // 저장 성공 후 loading을 false로 설정하고 재조회
        set({ loading: false });
        
        // 마지막 검색 조건으로 재조회
        await get().refresh();
      } else {
        const errorMessage = response.data?.message || "저장 중 오류가 발생했습니다.";
        message.error(errorMessage);
        set({ loading: false });
      }
    } catch (error) {
      console.error("저장 실패:", error);
      message.error("저장 중 오류가 발생했습니다.");
      set({ loading: false });
    }
  },

  // 재조회 액션 (마지막 검색 조건으로 다시 조회)
  refresh: async () => {
    const state = get();
    if (state.lastSearchRequest) {
      await get().search(state.lastSearchRequest);
    } else {
      // 검색 조건이 없으면 빈 조건으로 조회
      await get().search({
        asLang: undefined,
        asKey: undefined,
        asWord: undefined,
      });
    }
  },

  // 초기화 액션
  reset: () =>
    set({
      labelList: [],
      langTypeList: [],
      loading: false,
      gridApi: null,
      lastSearchRequest: null,
    }),

  // 그리드 셀 변경 핸들러
  handleCellValueChanged: (params) => {
    const { gridApi } = get();
    if (!gridApi || !params.data) return;

    const rowData = params.data;
    // rowStatus가 없거나 undefined인 경우만 "U"로 설정 (기존 데이터 수정)
    if (!rowData.rowStatus) {
      rowData.rowStatus = "U";
      gridApi.applyTransaction({ update: [rowData] });
      gridApi.refreshCells({
        rowNodes: [params.node],
        columns: ["rowStatus"],
        force: true,
      });
    }
  },
}));
