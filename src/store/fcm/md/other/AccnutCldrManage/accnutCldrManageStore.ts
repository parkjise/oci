import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  selectAccnutCldrManageCldrList,
  selectAccnutCldrManageRestdeList,
  selectAccnutCldrManageCldrId,
  selectAccnutCldrManageSolcDate,
  createAccnutCldrManageCldr,
  copyAccnutCldrManageRestde,
  saveAccnutCldrManageCldr,
  saveAccnutCldrManageRestde,
} from "@/apis/fcm/md/other/accnutCldrManageApi";
import type {
  AccnutCldrManageSrchRequest,
  AccnutCldrManageCldrIdResponse,
  AccnutCldrManageSolcDateResponse,
  AccnutCldrManageCldrGridData,
  AccnutCldrManageRestdeGridData,
} from "@/types/fcm/md/other/accnutCldrManage.types";
import { SOLAR_LUNAR_TYPE } from "@/types/fcm/md/other/accnutCldrManage.types";
import { useAuthStore } from "@store/com/auth/authStore";

interface AccnutCldrManageState {
  // 상태
  loading: boolean;
  cldrLoading: boolean;
  restdeLoading: boolean;
  cldrGridApi: GridApi | null;
  restdeGridApi: GridApi | null;
  cldrGridData: AccnutCldrManageCldrGridData[];
  restdeGridData: AccnutCldrManageRestdeGridData[];
  lastSearchRequest: AccnutCldrManageSrchRequest | null;

  // 액션
  setCldrGridApi: (api: GridApi | null) => void;
  setRestdeGridApi: (api: GridApi | null) => void;
  setCldrGridData: (data: AccnutCldrManageCldrGridData[]) => void;
  setRestdeGridData: (data: AccnutCldrManageRestdeGridData[]) => void;
  setLoading: (loading: boolean) => void;

  // 조회
  fetchCldrList: (request: AccnutCldrManageSrchRequest) => Promise<void>;
  fetchRestdeList: (request: AccnutCldrManageSrchRequest) => Promise<void>;
  fetchCldrId: (
    request: AccnutCldrManageSrchRequest
  ) => Promise<AccnutCldrManageCldrIdResponse | null>;
  fetchSolcDate: (
    request: AccnutCldrManageSrchRequest
  ) => Promise<AccnutCldrManageSolcDateResponse | null>;

  // 생성/복사
  createCldr: (request: AccnutCldrManageSrchRequest) => Promise<void>;
  copyRestde: (request: AccnutCldrManageSrchRequest) => Promise<void>;

  // 저장
  saveCldr: () => Promise<void>;
  saveRestde: () => Promise<void>;

  // 초기화
  reset: () => void;
}

export const useAccnutCldrManageStore = create<AccnutCldrManageState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      loading: false,
      cldrLoading: false,
      restdeLoading: false,
      cldrGridApi: null,
      restdeGridApi: null,
      cldrGridData: [],
      restdeGridData: [],
      lastSearchRequest: null,

      // 상태 설정 액션
      setCldrGridApi: (api) => set({ cldrGridApi: api }),
      setRestdeGridApi: (api) => set({ restdeGridApi: api }),
      setCldrGridData: (data) => set({ cldrGridData: data }),
      setRestdeGridData: (data) => set({ restdeGridData: data }),
      setLoading: (loading) => set({ loading }),

      // 달력 목록 조회
      fetchCldrList: async (request) => {
        set({ cldrLoading: true, loading: true });

        try {
          const response = await selectAccnutCldrManageCldrList(request);

          if (response.success && response.data) {
            const gridData: AccnutCldrManageCldrGridData[] = response.data.map(
              (item, index: number) => ({
                ...item,
                id: String(index + 1), // 조회한 목록의 index + 1로 설정
                rowStatus: undefined,
              } as AccnutCldrManageCldrGridData)
            );

            set({
              cldrGridData: gridData,
              lastSearchRequest: request,
            });
          } else {
            message.error(response.message || "조회에 실패했습니다.");
            set({ cldrGridData: [] });
          }
        } catch (error) {
          message.error("조회 중 오류가 발생했습니다.");
          set({ cldrGridData: [] });
          if (import.meta.env.DEV) {
            console.error("조회 실패:", error);
          }
        } finally {
          const currentState = get();
          set({
            cldrLoading: false,
            loading: currentState.restdeLoading, // restdeLoading이 true면 loading도 true 유지
          });
        }
      },

      // 휴일 목록 조회
      fetchRestdeList: async (request) => {
        set({ restdeLoading: true, loading: true });

        try {
          const response = await selectAccnutCldrManageRestdeList(request);

          if (response.success && response.data) {
            const gridData: AccnutCldrManageRestdeGridData[] =
              response.data.map((item, index: number) => ({
                ...item,
                id: String(index + 1), // 조회한 목록의 index + 1로 설정
                rowStatus: undefined,
                // ori 필드가 없으면 현재 값을 ori로 설정 (UPDATE WHERE 절에서 원본 키값으로 사용)
                oriOffDate: item.oriOffDate || item.offDate || "",
                oriBasicDate: item.oriBasicDate || item.basicDate || "",
                oriSolarLunarType:
                  item.oriSolarLunarType || item.solarLunarType || "",
              } as AccnutCldrManageRestdeGridData));

            set({
              restdeGridData: gridData,
              lastSearchRequest: request,
            });
          } else {
            message.error(response.message || "조회에 실패했습니다.");
            set({ restdeGridData: [] });
          }
        } catch (error) {
          message.error("조회 중 오류가 발생했습니다.");
          set({ restdeGridData: [] });
          if (import.meta.env.DEV) {
            console.error("조회 실패:", error);
          }
        } finally {
          const currentState = get();
          set({
            restdeLoading: false,
            loading: currentState.cldrLoading, // cldrLoading이 true면 loading도 true 유지
          });
        }
      },

      // 달력ID 조회
      fetchCldrId: async (request) => {
        try {
          const response = await selectAccnutCldrManageCldrId(request);
          if (response.success && response.data) {
            return response.data;
          }
          return null;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("달력ID 조회 실패:", error);
          }
          return null;
        }
      },

      // 음력일자 조회
      fetchSolcDate: async (request) => {
        try {
          const response = await selectAccnutCldrManageSolcDate(request);
          if (response.success && response.data) {
            return response.data;
          }
          return null;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("음력일자 조회 실패:", error);
          }
          return null;
        }
      },

      // 달력 생성
      createCldr: async (request) => {
        set({ loading: true });

        try {
          const response = await createAccnutCldrManageCldr(request);
          if (response.success) {
            message.success("Calendar 생성이 완료되었습니다.");
            // 생성 후 달력 목록 재조회
            await get().fetchCldrList(request);
          } else {
            message.error(response.message || "달력 생성에 실패했습니다.");
          }
        } catch (error) {
          message.error("달력 생성 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("달력 생성 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 전년도 휴일 복사
      copyRestde: async (request) => {
        set({ loading: true });

        try {
          const response = await copyAccnutCldrManageRestde(request);
          if (response.success) {
            message.success("전년도 휴일 복사가 완료되었습니다.");
            // 복사 후 휴일 목록 재조회
            await get().fetchRestdeList(request);
          } else {
            message.error(
              response.message || "전년도 휴일 복사에 실패했습니다."
            );
          }
        } catch (error) {
          message.error("전년도 휴일 복사 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("전년도 휴일 복사 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 달력 저장
      saveCldr: async () => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!state.cldrGridApi) {
          message.warning("그리드가 초기화되지 않았습니다.");
          return;
        }

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        // 변경된 데이터만 추출
        const modifiedData: AccnutCldrManageCldrGridData[] = [];
        state.cldrGridApi.forEachNode((node) => {
          if (node.data && node.data.rowStatus) {
            modifiedData.push(node.data);
          }
        });

        if (modifiedData.length === 0) {
          message.warning("저장할 데이터가 없습니다.");
          return;
        }

        const saveData = modifiedData.map((item) => ({
          transCalendarId: item.transCalendarId?.toString() || "",
          transDate: item.transDate || "",
          businessDayFlag: item.businessDayFlag || "Y",
          remark: item.remark || "",
        }));

        set({ loading: true });

        try {
          const response = await saveAccnutCldrManageCldr({ list: saveData });
          if (response.success) {
            message.success("저장되었습니다.");
            // 저장 후 재조회
            if (state.lastSearchRequest) {
              await get().fetchCldrList(state.lastSearchRequest);
            }
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

      // 휴일 저장
      saveRestde: async () => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!state.restdeGridApi) {
          message.warning("그리드가 초기화되지 않았습니다.");
          return;
        }

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        // 변경된 데이터만 추출
        const modifiedData: AccnutCldrManageRestdeGridData[] = [];
        state.restdeGridApi.forEachNode((node) => {
          if (node.data && node.data.rowStatus) {
            modifiedData.push(node.data);
          }
        });

        if (modifiedData.length === 0) {
          message.warning("저장할 데이터가 없습니다.");
          return;
        }

        const saveData = modifiedData.map((item) => {
          // 새로 추가된 행 (rowStatus === "C")의 경우 ori 필드들은 없어야 함
          // 수정된 행 (rowStatus === "U")의 경우 ori 필드는 원본 키값으로 WHERE 절에서 사용됨
          const isNewRow = item.rowStatus === "C";

          return {
            rowStatus: item.rowStatus || "U",
            transCalendarId: item.transCalendarId?.toString() || "",
            // 새로 추가된 행: ori 필드는 undefined 또는 빈 문자열
            // 수정된 행: ori 필드는 반드시 원본 값이어야 함 (UPDATE WHERE 절에서 사용)
            oriOffDate: isNewRow ? undefined : item.oriOffDate || "",
            oriBasicDate: isNewRow ? undefined : item.oriBasicDate || "",
            oriSolarLunarType: isNewRow
              ? undefined
              : item.oriSolarLunarType || "",
            // SET 절에 사용될 현재 값들
            offDate: item.offDate || "",
            basicDate: item.basicDate || "",
            solarLunarType: item.solarLunarType || SOLAR_LUNAR_TYPE.SOLAR,
            offDateName: item.offDateName || "",
          };
        });

        set({ loading: true });

        try {
          const response = await saveAccnutCldrManageRestde({
            list: saveData,
          });
          if (response.success) {
            message.success("저장되었습니다.");
            // 저장 후 재조회
            if (state.lastSearchRequest) {
              await get().fetchRestdeList(state.lastSearchRequest);
            }
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

      // 초기화
      reset: () => {
        const state = get();
        // gridApi는 기존 state의 값을 유지해야 함 (규칙 3.2)
        set({
          loading: false,
          cldrLoading: false,
          restdeLoading: false,
          cldrGridApi: state.cldrGridApi, // 기존 gridApi 유지
          restdeGridApi: state.restdeGridApi, // 기존 gridApi 유지
          cldrGridData: [],
          restdeGridData: [],
          lastSearchRequest: null,
        });

        // 그리드 데이터를 시각적으로 초기화 (선택사항)
        if (state.cldrGridApi) {
          state.cldrGridApi.setGridOption("rowData", []);
        }
        if (state.restdeGridApi) {
          state.restdeGridApi.setGridOption("rowData", []);
        }
      },
    }),
    { name: "AccnutCldrManageStore" }
  )
);
