import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  getCodeDetailListApi,
  saveCodeListApi,
  type CodeDto,
  type CodeDetailSearchRequest,
  type CodeSaveRequest,
} from "@apis/system/code/codeApi";
import { getCodeDetailApi } from "@apis/com/code";

interface CodeMngState {
  // 상태
  codeList: (CodeDto & { id?: string; chk?: boolean })[];
  moduleOptions: Array<{ value: string; label: string }>;
  selectedModule: string | undefined;
  codeType: string;
  codeTypeName: string;
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: CodeDetailSearchRequest | null;
  isModified: boolean;

  // 액션
  setCodeList: (data: (CodeDto & { id?: string; chk?: boolean })[]) => void;
  setModuleOptions: (data: Array<{ value: string; label: string }>) => void;
  setSelectedModule: (module: string | undefined) => void;
  setCodeType: (type: string, typeName?: string) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  setIsModified: (modified: boolean) => void;

  // 비즈니스 로직
  fetchModuleList: () => Promise<void>;
  search: (request: CodeDetailSearchRequest) => Promise<void>;
  insert: () => void;
  insertTypeHeader: (type: string, name1: string, nameDesc?: string) => void;
  copy: () => void;
  deleteRows: (selectedRows: (CodeDto & { id?: string })[]) => void;
  save: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  handleCellValueChanged: (params: {
    data: any;
    node: any;
    column: any;
  }) => void;
}

export const useCodeMngStore = create<CodeMngState>((set, get) => ({
  // 초기 상태
  codeList: [],
  moduleOptions: [],
  selectedModule: undefined,
  codeType: "",
  codeTypeName: "",
  loading: false,
  gridApi: null,
  lastSearchRequest: null,
  isModified: false,

  // 상태 설정 액션
  setCodeList: (data) => set({ codeList: data }),
  setModuleOptions: (data) => set({ moduleOptions: data }),
  setSelectedModule: (module) => {
    set({ selectedModule: module, codeType: "", codeTypeName: "" });
  },
  setCodeType: (type, typeName) => {
    set({ codeType: type, codeTypeName: typeName || "" });
  },
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),
  setIsModified: (modified) => set({ isModified: modified }),

  // 모듈 목록 조회
  fetchModuleList: async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "MODULE",
        enabledFlag: "Y",
      });

      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        const options = codeList
          .filter((item) => item.code !== "##")
          .sort((a, b) => (a.orderSeq || 0) - (b.orderSeq || 0))
          .map((item) => ({
            value: item.code || "",
            label: item.name1 || item.code || "",
          }));
        set({ moduleOptions: options });
      } else {
        set({ moduleOptions: [] });
      }
    } catch (error) {
      console.error("모듈 목록 조회 실패:", error);
      set({ moduleOptions: [] });
    }
  },

  // 공통코드 목록 조회
  search: async (request) => {
    const state = get();
    if (state.loading) return;

    if (!request.module || !request.type) {
      set({ codeList: [] });
      return;
    }

    set({ loading: true });

    try {
      const response = await getCodeDetailListApi(request);
      if (response.success && response.data) {
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        const dataWithId = data.map((item, index) => ({
          ...item,
          id: `${item.module}_${item.type}_${item.code}_${index}`,
          rowStatus: undefined as CodeDto["rowStatus"],
        }));
        set({
          codeList: dataWithId,
          lastSearchRequest: request,
          isModified: false,
        });
        message.success(`조회 완료: ${dataWithId.length}건`);
      } else {
        set({ codeList: [] });
      }
    } catch (error) {
      console.error("공통코드 목록 조회 실패:", error);
      message.error("조회 중 오류가 발생했습니다.");
      set({ codeList: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 입력 핸들러 (일반 입력)
  insert: () => {
    const state = get();
    if (!state.selectedModule) {
      message.warning("모듈을 선택해주세요.");
      return;
    }

    if (!state.codeType) {
      message.warning("공통코드구분을 입력해주세요.");
      return;
    }

    const currentData = state.codeList;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const newRow: CodeDto & { id?: string } = {
      module: state.selectedModule,
      type: state.codeType,
      code: "",
      name1: "",
      nameDesc: "",
      enabledFlag: "Y",
      startDate: `${yyyy}-${mm}-${dd}`,
      endDate: "2999-12-31",
      userType: "U",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };

    set({ codeList: [...currentData, newRow], isModified: true });
  },

  // TYPE 헤더 등록 핸들러
  insertTypeHeader: (type, name1, nameDesc) => {
    const state = get();
    if (!state.selectedModule) return;

    const currentData = state.codeList;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const headerRow: CodeDto & { id?: string } = {
      module: state.selectedModule,
      type: type.toUpperCase(),
      code: "##",
      name1: name1,
      nameDesc: nameDesc || "",
      enabledFlag: "Y",
      startDate: `${yyyy}-${mm}-${dd}`,
      endDate: "2999-12-31",
      userType: "A",
      orderSeq: 0,
      rowStatus: "C",
      id: `header_${Date.now()}`,
    };

    set({
      codeList: [...currentData, headerRow],
      codeType: type.toUpperCase(),
      codeTypeName: name1,
      isModified: true,
    });
    message.success("공통코드구분이 등록되었습니다.");
  },

  // 복사 핸들러
  copy: () => {
    const state = get();
    if (!state.gridApi) return;

    const selectedRows = state.gridApi.getSelectedRows() as (CodeDto & {
      id?: string;
    })[];
    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    const base = selectedRows[0];
    const currentData = state.codeList;
    const copied: CodeDto & { id?: string } = {
      ...base,
      code: "",
      rowStatus: "C",
      id: `copy_${Date.now()}`,
    };

    set({ codeList: [...currentData, copied], isModified: true });
  },

  // 삭제 핸들러
  deleteRows: (selectedRows) => {
    const state = get();

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    const currentData = state.codeList;
    const updated = currentData
      .map((row) => {
        const isSelected = selectedRows.some(
          (s) =>
            s.module === row.module &&
            s.type === row.type &&
            s.code === row.code
        );
        if (isSelected) {
          if (row.rowStatus === "C") {
            return null;
          }
          return { ...row, rowStatus: "D" as const };
        }
        return row;
      })
      .filter((row): row is CodeDto & { id?: string } => row !== null);

    set({ codeList: updated, isModified: true });
  },

  // 저장 핸들러
  save: async () => {
    const state = get();
    const currentData = state.codeList;

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
      const saveItems: CodeSaveRequest["codeList"] = currentData
        .filter(
          (row) =>
            row.rowStatus === "C" ||
            row.rowStatus === "U" ||
            row.rowStatus === "D"
        )
        .map((row) => ({
          ...row,
          module: row.module || state.selectedModule || "",
          type: row.type || state.codeType || "",
          code: row.code || "",
        }));

      if (saveItems.length === 0) {
        message.warning("저장할 데이터가 없습니다.");
        return;
      }

      // 필수값 검증 (삭제는 제외)
      const invalid = saveItems.filter((item) => {
        if (item.rowStatus === "D") return false;
        return !item.module || !item.type || !item.code || !item.name1;
      });

      if (invalid.length > 0) {
        message.error("필수 항목을 입력해주세요.");
        return;
      }

      const request: CodeSaveRequest = {
        codeList: saveItems,
      };

      const response = await saveCodeListApi(request);
      if (response.success) {
        message.success("저장되었습니다.");
        set({ isModified: false });
        await get().refresh();
      }
    } catch (error) {
      message.error("저장 중 오류가 발생했습니다.");
    } finally {
      set({ loading: false });
    }
  },

  // 재조회 액션 (마지막 검색 조건으로 다시 조회)
  refresh: async () => {
    const state = get();
    if (state.lastSearchRequest) {
      await get().search(state.lastSearchRequest);
    }
  },

  // 초기화 액션
  reset: () =>
    set({
      codeList: [],
      moduleOptions: [],
      selectedModule: undefined,
      codeType: "",
      codeTypeName: "",
      loading: false,
      gridApi: null,
      lastSearchRequest: null,
      isModified: false,
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
    set({ isModified: true });
  },
}));
