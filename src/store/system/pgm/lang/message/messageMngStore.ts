import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  getMessageListApi,
  saveMessageApi,
  type MessageDto,
  type MessageSearchRequest,
  type MessageSaveRequest,
} from "@apis/system/message/messageApi";
import { getCodeDetailApi } from "@apis/com/code";
import type { CodeDetail } from "@/types/com/api/api.types";

interface MessageMngState {
  // 상태
  messageList: (MessageDto & { id?: string; chk?: boolean })[];
  langTypeList: CodeDetail[];
  iconTypeList: CodeDetail[];
  buttonTypeList: CodeDetail[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: MessageSearchRequest | null;

  // 액션
  setMessageList: (data: (MessageDto & { id?: string; chk?: boolean })[]) => void;
  setLangTypeList: (data: CodeDetail[]) => void;
  setIconTypeList: (data: CodeDetail[]) => void;
  setButtonTypeList: (data: CodeDetail[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;

  // 비즈니스 로직
  fetchLangTypeList: () => Promise<void>;
  fetchIconTypeList: () => Promise<void>;
  fetchButtonTypeList: () => Promise<void>;
  search: (request: MessageSearchRequest) => Promise<void>;
  insert: () => void;
  deleteRows: (selectedRows: (MessageDto & { id?: string })[]) => void;
  save: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  handleCellValueChanged: (params: {
    data: any;
    node: any;
    column: any;
  }) => void;
}

export const useMessageMngStore = create<MessageMngState>((set, get) => ({
  // 초기 상태
  messageList: [],
  langTypeList: [],
  iconTypeList: [],
  buttonTypeList: [],
  loading: false,
  gridApi: null,
  lastSearchRequest: null,

  // 상태 설정 액션
  setMessageList: (data) => set({ messageList: data }),
  setLangTypeList: (data) => set({ langTypeList: data }),
  setIconTypeList: (data) => set({ iconTypeList: data }),
  setButtonTypeList: (data) => set({ buttonTypeList: data }),
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

  // 아이콘 타입 코드 조회
  fetchIconTypeList: async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000701",
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        set({ iconTypeList: codeList });
      }
    } catch (error) {
      console.error("아이콘 타입 조회 실패:", error);
    }
  },

  // 버튼 타입 코드 조회
  fetchButtonTypeList: async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000702",
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        set({ buttonTypeList: codeList });
      }
    } catch (error) {
      console.error("버튼 타입 조회 실패:", error);
    }
  },

  // 다국어 메시지 목록 조회
  search: async (request) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      const response = await getMessageListApi(request);
      if (response.success && response.data) {
        const messages = Array.isArray(response.data) ? response.data : [];
        const dataWithId = messages.map((item, index) => ({
          ...item,
          id: `${item.lang}_${item.msgKey}_${index}`,
          rowStatus: undefined,
        }));

        set({ messageList: dataWithId, lastSearchRequest: request });
        message.success(`조회 완료: ${dataWithId.length}건`);
      } else {
        set({ messageList: [] });
      }
    } catch (error) {
      console.error("다국어 메시지 목록 조회 실패:", error);
      message.error("조회 중 오류가 발생했습니다.");
      set({ messageList: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 입력 핸들러
  insert: () => {
    const state = get();
    const currentData = state.messageList;
    const newRow: MessageDto & { id?: string } = {
      lang: "",
      msgKey: "",
      msgContents: "",
      isUse: "Y",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };

    set({ messageList: [newRow, ...currentData] });
  },

  // 삭제 핸들러
  deleteRows: (selectedRows) => {
    const state = get();

    if (selectedRows.length === 0) {
      message.warning("선택된 항목이 없습니다.");
      return;
    }

    const currentData = state.messageList;
    const updatedData = currentData
      .map((row) => {
        const isSelected = selectedRows.some(
          (selected) =>
            selected.lang === row.lang && selected.msgKey === row.msgKey
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
      .filter((row) => row !== null) as (MessageDto & { id?: string })[];

    set({ messageList: updatedData });
  },

  // 저장 핸들러
  save: async () => {
    const state = get();
    const currentData = state.messageList;

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
      const saveItems: MessageSaveRequest["messages"] = currentData
        .filter(
          (row) =>
            row.rowStatus === "C" ||
            row.rowStatus === "U" ||
            row.rowStatus === "D"
        )
        .map((row) => ({
          rowStatus: row.rowStatus!,
          lang: row.lang || "",
          msgKey: row.msgKey || "",
          msgContents: row.msgContents || "",
          msgIconType: row.msgIconType,
          msgButtonType: row.msgButtonType,
          oriLang: row.oriLang,
          oriMsgKey: row.oriMsgKey,
        }));

      if (saveItems.length === 0) {
        message.warning("저장할 데이터가 없습니다.");
        return;
      }

      // 필수 필드 검증
      const invalidItems = saveItems.filter((item) => {
        if (item.rowStatus === "D") return false; // 삭제는 검증 제외
        return !item.lang || !item.msgKey || !item.msgContents;
      });

      if (invalidItems.length > 0) {
        message.error("필수 항목을 입력해주세요.");
        return;
      }

      const request: MessageSaveRequest = {
        messages: saveItems,
      };

      const response = await saveMessageApi(request);

      if (response.success) {
        message.success("저장되었습니다.");
        // 저장 후 재조회
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
    } else {
      // 검색 조건이 없으면 빈 조건으로 조회
      await get().search({
        lang: undefined,
        msgKey: undefined,
        msgContents: undefined,
      });
    }
  },

  // 초기화 액션
  reset: () =>
      set({
        messageList: [],
        langTypeList: [],
        iconTypeList: [],
        buttonTypeList: [],
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

