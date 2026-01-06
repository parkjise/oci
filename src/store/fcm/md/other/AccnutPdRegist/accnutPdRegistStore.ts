import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import dayjs from "dayjs";
import {
  selectAccnutPdRegistInit,
  selectAccnutPdRegistList,
  saveAccnutPdRegist,
  cloneAccnutPdRegistNextYear,
} from "@/apis/fcm/md/other/accnutPdRegistApi";
import type {
  PeriodData,
  PeriodSearchParams,
} from "@/types/fcm/md/other/accnutPdRegist.types";
import { useAuthStore } from "@store/com/auth/authStore";

interface AccnutPdRegistState {
  // 상태
  loading: boolean;
  gridApi: GridApi | null;
  gridData: PeriodData[];
  currentYear: string;
  nextYear: string;
  canModify: boolean; // 수정 가능 여부 (권한)

  // Grid API
  setGridApi: (api: GridApi | null) => void;
  setGridData: (data: PeriodData[]) => void;

  // 연도 관리
  setCurrentYear: (year: string) => void;
  setNextYear: (year: string) => void;
  moveYear: (direction: -1 | 1) => void;

  // 초기화 (권한 체크)
  initPage: () => Promise<void>;

  // 데이터 조회
  fetchPeriodList: (year?: string, nextYearParam?: string) => Promise<void>;

  // 데이터 저장
  savePeriodList: () => Promise<void>;

  // 다음 연도 복사
  copyToNextYear: (fromYear?: string, toYear?: string) => Promise<void>;

  // 초기화
  reset: () => void;
}

export const useAccnutPdRegistStore = create<AccnutPdRegistState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      loading: false,
      gridApi: null,
      gridData: [],
      currentYear: dayjs().format("YYYY"),
      nextYear: String(Number(dayjs().format("YYYY")) + 1),
      canModify: false,

      // Grid API 설정
      setGridApi: (api) => set({ gridApi: api }),
      setGridData: (data) => set({ gridData: data }),

      // 연도 설정
      setCurrentYear: (year) => {
        set({ currentYear: year });
      },

      setNextYear: (year) => {
        set({ nextYear: year });
      },

      // 연도 이동
      moveYear: (direction) => {
        const state = get();
        const newYear = String(Number(state.currentYear) + direction);
        set({
          currentYear: newYear,
          nextYear: String(Number(newYear) + 1),
        });
        // 연도 변경 후 자동 조회
        get().fetchPeriodList();
      },

      // 페이지 초기화 (권한 체크)
      initPage: async () => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        set({ loading: true });

        try {
          const params: PeriodSearchParams = {
            asOfficeId: user.officeId || "",
            asYear: state.currentYear,
            asNextYear: state.nextYear,
          };

          const response = await selectAccnutPdRegistInit(params);

          if (response.success && response.data) {
            // 권한 체크: ADMIN이 아니면 수정 불가
            const canModify =
              response.data.result === "Y" || user.empCode === "ADMIN";
            set({ canModify });

            // 초기 조회 실행 (자동 조회 비활성화)
            // await get().fetchPeriodList();
          } else {
            message.error(
              response.message || "초기화 정보 조회에 실패했습니다."
            );
          }
        } catch (error) {
          message.error("초기화 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("초기화 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 회계기간 목록 조회
      fetchPeriodList: async (year?: string, nextYearParam?: string) => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        set({ loading: true });

        try {
          const params: PeriodSearchParams = {
            asOfficeId: user.officeId || "",
            asYear: year || state.currentYear,
            asNextYear: nextYearParam || state.nextYear,
          };

          const response = await selectAccnutPdRegistList(params);

          if (response.success && response.data) {
            // 각 데이터에 id 추가 (AG-Grid용)
            const gridData: PeriodData[] = response.data.map(
              (item, index: number) => ({
                ...item,
                id: String(index + 1),
              })
            );

            set({ gridData });

            // Grid API가 있으면 포커스 설정
            if (state.gridApi && gridData.length > 0) {
              setTimeout(() => {
                state.gridApi?.setFocusedCell(0, "periodNum");
              }, 100);
            }
          } else {
            message.error(response.message || "조회에 실패했습니다.");
            set({ gridData: [] });
          }
        } catch (error) {
          message.error("조회 중 오류가 발생했습니다.");
          set({ gridData: [] });
          if (import.meta.env.DEV) {
            console.error("조회 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 회계기간 저장
      savePeriodList: async () => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        // rowStatus가 있는 데이터만 추출 (C, U, D)
        const modifiedData = state.gridData.filter(
          (item) => item.rowStatus !== undefined
        );

        if (modifiedData.length === 0) {
          message.warning("저장할 데이터가 없습니다.");
          return;
        }

        // officeId, accYear 자동 세팅
        const saveData = modifiedData.map((item) => ({
          ...item,
          officeId: item.officeId || user.officeId || "",
          accYear: item.accYear || state.currentYear,
        }));

        set({ loading: true });

        try {
          const response = await saveAccnutPdRegist(saveData);

          if (response.success) {
            message.success("저장되었습니다.");
            // 저장 후 재조회
            await get().fetchPeriodList();
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

      // 다음 연도 복사
      copyToNextYear: async (fromYear?: string, toYear?: string) => {
        const state = get();
        const { user } = useAuthStore.getState();

        if (!user) {
          message.error("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        // 파라미터가 없으면 Store 값 사용
        const currentYear = fromYear || state.currentYear;
        const nextYear = toYear || state.nextYear;

        // Store 값 업데이트
        set({ currentYear, nextYear });

        // 검증
        if (nextYear === currentYear) {
          message.warning("복사하려는 연도가 같을 수 없습니다.");
          return;
        }

        if (Number(nextYear) <= Number(currentYear)) {
          message.warning("복사하려는 연도가 기준년도보다 과거일 수 없습니다.");
          return;
        }

        set({ loading: true });

        try {
          const response = await cloneAccnutPdRegistNextYear({
            asOfficeId: user.officeId || "",
            asYear: currentYear,
            asNextYear: nextYear,
          });

          if (response.success && response.data) {
            if (response.data.resultCount > 0) {
              message.success(
                `${response.data.resultCount}건의 데이터가 복사되었습니다.`
              );
              // 복사 성공 시 다음 연도로 이동
              const newCurrentYear = nextYear;
              const newNextYear = String(Number(newCurrentYear) + 1);
              set({
                currentYear: newCurrentYear,
                nextYear: newNextYear,
              });
              await get().fetchPeriodList();
            } else {
              message.warning("복사할 데이터가 없습니다.");
            }
          } else {
            message.error(response.message || "다음 연도 복사에 실패했습니다.");
          }
        } catch (error) {
          message.error("다음 연도 복사 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("다음 연도 복사 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 초기화
      reset: () => {
        const state = get();
        // gridApi는 유지 (규칙 3.2)
        set({
          loading: false,
          gridApi: state.gridApi,
          gridData: [],
          currentYear: dayjs().format("YYYY"),
          nextYear: String(Number(dayjs().format("YYYY")) + 1),
          canModify: false,
        });

        // 그리드 데이터 초기화
        if (state.gridApi) {
          state.gridApi.setGridOption("rowData", []);
        }
      },
    }),
    { name: "AccnutPdRegistStore" }
  )
);
