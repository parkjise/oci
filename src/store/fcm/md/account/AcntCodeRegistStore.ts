import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
    selectAcntCodeList,
    saveAcntCode,
} from "@apis/fcm/md/account";
import type {
    AcntCodeSrchRequest,
    AcntCodeListResponse,
    AcntCodeSaveRequest
} from "@/types/fcm/md/account/AcntCodeRegist.types";

interface AcntCodeRegistState {
    // 상태
    searchData: AcntCodeListResponse[];
    loading: boolean;
    gridApi: GridApi | null;
    lastSearchRequest: AcntCodeSrchRequest | null; // 마지막 검색 조건 저장
    selectedData: AcntCodeListResponse | null; // 선택된 행 데이터
    mode: "view" | "edit"; // 상세 뷰 모드

    // 액션
    setSearchData: (data: AcntCodeListResponse[]) => void;
    setLoading: (loading: boolean) => void;
    setGridApi: (api: GridApi | null) => void;
    setSelectedData: (data: AcntCodeListResponse | null) => void;
    setMode: (mode: "view" | "edit") => void;
    updateData: (data: AcntCodeListResponse) => void;
    search: (searchRequest: AcntCodeSrchRequest) => Promise<void>;
    save: (saveRequest: AcntCodeSaveRequest) => Promise<boolean>;
    refresh: () => Promise<void>;
    reset: () => void;
}

export const useAcntCodeRegistStore = create<AcntCodeRegistState>(
    (set, get) => ({
        // 초기 상태
        searchData: [],
        loading: false,
        gridApi: null,
        lastSearchRequest: null,
        selectedData: null,
        mode: "edit",

        // 상태 설정 액션
        setSearchData: (data) => set({
            searchData: data.map(item => ({
                ...item,
                _rowId: item._rowId || Math.random().toString(36).substring(2, 11)
            }))
        }),
        setLoading: (loading) => set({ loading }),
        setGridApi: (api) => set({ gridApi: api }),
        setSelectedData: (data) => set({ selectedData: data }),
        setMode: (mode) => set({ mode }),

        // 데이터 업데이트 액션 (그리드/폼 동기화용)
        updateData: (updatedItem) => {
            const state = get();

            // 식별자 결정: _rowId가 있으면 그것을, 없으면 accCode를 사용
            const isTarget = (item: AcntCodeListResponse) => {
                if (updatedItem._rowId && item._rowId) {
                    return item._rowId === updatedItem._rowId;
                }
                return item.accCode === updatedItem.accCode;
            };

            // 1. 리스트에서 해당 항목 업데이트 또는 추가
            const exists = state.searchData.some(isTarget);
            let nextSearchData;

            if (exists) {
                nextSearchData = state.searchData.map((item) =>
                    isTarget(item) ? updatedItem : item
                );
            } else {
                nextSearchData = [...state.searchData, updatedItem];
            }

            // 2. 선택된 데이터가 업데이트된 데이터라면 같이 업데이트
            let nextSelectedData = state.selectedData;
            if (state.selectedData && isTarget(state.selectedData)) {
                // 중요: 객체 참조가 변경되어야 React Effect가 트리거되므로 복사본 생성
                nextSelectedData = { ...updatedItem };
            }

            set({
                searchData: nextSearchData,
                selectedData: nextSelectedData,
            });

            // 3. 그리드 API가 있다면 강제 리프레시 (선택적)
            if (state.gridApi) {
                state.gridApi.refreshCells({ force: true });
            }
        },

        // 목록 조회 액션
        search: async (searchRequest) => {
            const state = get();
            if (state.loading) return;

            set({ loading: true });

            try {
                const response = await selectAcntCodeList(searchRequest);

                if (response.success && response.data) {
                    const dataWithIds = response.data.map(item => ({
                        ...item,
                        _rowId: Math.random().toString(36).substring(2, 11)
                    }));
                    set({
                        searchData: dataWithIds,
                        lastSearchRequest: searchRequest,
                        selectedData: null, // 조회 시 선택 초기화
                        mode: "edit",
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

        // 저장 액션
        save: async (saveRequest) => {
            const state = get();
            if (state.loading) return false;

            set({ loading: true });

            try {
                const response = await saveAcntCode(saveRequest);

                if (response.success) {
                    set({ loading: false }); // refresh/search가 실행될 수 있도록 loading 해제
                    message.success("저장되었습니다.");
                    await get().refresh();
                    return true;
                } else {
                    message.error(response.message || "저장에 실패했습니다.");
                    return false;
                }
            } catch (error) {
                message.error("저장 중 오류가 발생했습니다.");
                if (import.meta.env.DEV) {
                    console.error("저장 실패:", error);
                }
                return false;
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
                // 검색 조건이 없으면 기본 정보로라도 조회 (사무소 코드 등)
                // 만약 FilterPanel에서 user.officeId를 사용한다면 여기서도 필요할 수 있음.
                // 일단 null이면 조회를 건너뜀 (FilterPanel에서 초기 조회를 하도록 유도하는 것이 정석)
            }
        },

        // 초기화 액션
        reset: () =>
            set({
                searchData: [],
                loading: false,
                gridApi: null,
                lastSearchRequest: null,
                selectedData: null,
                mode: "view",
            }),
    })
);
