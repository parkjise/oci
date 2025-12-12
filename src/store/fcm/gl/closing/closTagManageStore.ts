import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GridApi } from "ag-grid-community";
import { message } from "antd";
import { DLT_DETAIL } from "@components/features/fcm/gl/closing/ClosTagManage/GLAH101E0Data";
import type { LeftGridData } from "@components/features/fcm/gl/closing/ClosTagManage/LeftGrid/LeftGrid";
import type { RightGridData } from "@components/features/fcm/gl/closing/ClosTagManage/RightGrid/RightGrid";
// 주석 처리된 코드에서 사용 예정 (TODO: API 연동 시 활성화)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { closing } from "@apis/fcm/gl";

interface ClosTagManageState {
  // State
  leftGridData: LeftGridData[];
  rightGridData: RightGridData[];
  selectedLeftRow: LeftGridData | null;
  leftGridApi: GridApi | null;
  rightGridApi: GridApi | null;
  loading: boolean;
  originalLeftGridData: LeftGridData[];
  originalRightGridData: RightGridData[]; // 오른쪽 그리드 원본 데이터 (변경사항 감지용)
  lastSearchParams: { year: string } | null; // 마지막 검색 조건

  // Actions
  setLeftGridApi: (api: GridApi | null) => void;
  setRightGridApi: (api: GridApi | null) => void;
  setLeftGridData: (data: LeftGridData[]) => void;
  updateLeftGridData: (data: LeftGridData[]) => void;
  updateRightGridData: (data: RightGridData[]) => void;
  search: (params: { year: string }) => Promise<void>;
  selectLeftRow: (
    row: LeftGridData | null,
    oldRowIndex?: number
  ) => Promise<boolean>;
  validateLeftRowChange: (
    row: LeftGridData,
    newClosingStatus: string,
    oldClosingStatus?: string
  ) => Promise<{
    isValid: boolean;
    shouldUpdate?: boolean;
    updateFields?: Partial<LeftGridData>;
    needsConfirmation?: boolean;
  }>;
  validateRightRowChange: (
    row: RightGridData,
    newClosingStatus: string
  ) => boolean;
  closeAllRightGridRows: () => void; // 오른쪽 그리드의 모든 행을 Close로 변경
  initializeLeftGridData: () => void; // 개발용: 초기 Mock 데이터 로드
  checkLeftGridChanges: () => boolean;
  save: (leftData: LeftGridData[], rightData: RightGridData[]) => Promise<void>;
  reset: () => void;
}

export const useClosTagManageStore = create<ClosTagManageState>()(
  devtools(
    (set, get) => ({
      // Initial state
      leftGridData: [],
      rightGridData: [],
      selectedLeftRow: null,
      leftGridApi: null,
      rightGridApi: null,
      loading: false,
      originalLeftGridData: [],
      originalRightGridData: [],
      lastSearchParams: null,

      // Actions
      setLeftGridApi: (api) => set({ leftGridApi: api }),
      setRightGridApi: (api) => set({ rightGridApi: api }),
      setLeftGridData: (data) => set({ leftGridData: data }),
      updateLeftGridData: (data) => set({ leftGridData: data }),
      updateRightGridData: (data) => set({ rightGridData: data }),

      // 조회 액션 (API 연동 준비 완료)
      search: async (params) => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          // TODO: API 호출 로직 구현 예정
          // const response = await closing.selectDetailList(params);
          // if (response.success && response.data) {
          //   const mappedData = response.data.map(...);
          //   set({ leftGridData: mappedData, originalLeftGridData: mappedData.map(...) });
          //   message.success(`조회 완료: ${mappedData.length}건`);
          // }

          // 개발용: Mock 데이터 사용
          if (import.meta.env.DEV) {
            console.log("조회 조건:", params);
            // 개발 환경에서는 initializeLeftGridData 사용
            get().initializeLeftGridData();
          }

          set({ lastSearchParams: params });
        } catch (error) {
          message.error("조회 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("조회 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // LeftGrid 행 선택 시 RightGrid 데이터 로드
      selectLeftRow: async (row, oldRowIndex) => {
        const { leftGridData, leftGridApi, checkLeftGridChanges } = get();

        // 변경사항이 있는지 확인
        if (checkLeftGridChanges() && oldRowIndex !== undefined) {
          const oldRow = leftGridData[oldRowIndex];
          if (
            oldRow &&
            (oldRow.rowStatus === "U" || oldRow.rowStatus === "C")
          ) {
            message.warning("저장 후 진행하세요!");
            // 이전 행으로 포커스 이동
            if (leftGridApi) {
              leftGridApi.setFocusedCell(oldRowIndex, "closingStatus");
            }
            return false;
          }
        }

        set({ selectedLeftRow: row });
        if (row) {
          set({ loading: true });
          try {
            // TODO: API 호출 로직 구현 예정
            // const mth = row.closingYearMonth?.substring(4, 6);
            // const year = row.closingYearMonth?.substring(0, 4);
            // const response = await closing.selectSubDetailList({ year, mth });
            // if (response.success && response.data) {
            //   const mappedData = response.data.map(...);
            //   set({ rightGridData: mappedData });
            // }

            // 개발용: Mock 데이터 사용
            const mth = row.closingYearMonth?.substring(4, 6) || "11";
            const year = row.closingYearMonth?.substring(0, 4) || "2025";
            const mockSubModules = [
              "AP01",
              "AP02",
              "AR",
              "CO",
              "FA",
              "INV",
              "PAY",
              "TAX",
              "TR",
            ];

            const mockData: RightGridData[] = mockSubModules.map(
              (subModule, index) => ({
                id: `${row.closingYearMonth}_${subModule}_${index}`,
                rowStatus: undefined,
                mth: mth,
                moduleType: subModule,
                closingStatus: row.closingStatus === "Close" ? "Close" : "Open",
                lastRegUser: row.lastRegUser || "관리자",
                creator: row.creator || "관리자",
                createDate: row.createDate || "",
                lastRegDate: row.lastRegDate || "",
                CREATED_BY: "ADMIN",
                LAST_UPDATED_BY: "ADMIN",
                CREATION_DATE: "20241128091232",
                LAST_UPDATE_DATE: "20241128091232",
                SUB_MODULE: subModule,
                CREATED_BY_USER: "관리자",
                YEAR: year,
                OFFICE_ID: "OSE",
                TAG: row.closingStatus === "Close" ? "Y" : "N",
                LAST_UPDATED_BY_USER: "관리자",
              })
            );
            set({
              rightGridData: mockData,
              originalRightGridData: mockData.map((item) => ({ ...item })),
            });
          } catch (error) {
            message.error("데이터 조회 중 오류가 발생했습니다.");
            if (import.meta.env.DEV) {
              console.error("조회 실패:", error);
            }
          } finally {
            set({ loading: false });
          }
        } else {
          set({ rightGridData: [], originalRightGridData: [] });
        }
        return true;
      },

      // LeftGrid 마감상태 변경 검증 및 처리
      validateLeftRowChange: async (
        row,
        newClosingStatus,
        oldClosingStatus?: string
      ) => {
        // Close로 변경 시
        if (newClosingStatus === "Close") {
          // CNT 체크: 미전기 전표가 있으면 마감 불가
          if (row.cnt !== undefined && row.cnt !== 0) {
            message.warning("미전기된 전표가 존재하여 Closing 불가합니다!");
            return { isValid: false, shouldUpdate: false };
          }

          // Close로 변경 시 추가 필드 설정
          return {
            isValid: true,
            shouldUpdate: true,
            updateFields: {
              closingStatus: "Close",
              // AMEND_TAG, ALL_FLAG, ATTRIBUTE1, SUB_MODULE는 실제 데이터 구조에 맞게 설정 필요
            },
          };
        }

        // Open으로 변경 시
        if (newClosingStatus === "Open" && oldClosingStatus === "Close") {
          // PL_TAG(손익마감) 체크
          if (row.profitLossClosing === "Y") {
            message.warning(
              "손익마감 Tag가 Closing 되어 GL Period Open 불가합니다!"
            );
            return { isValid: false, shouldUpdate: false };
          }

          // 확인 다이얼로그는 컴포넌트에서 처리
          return {
            isValid: true,
            shouldUpdate: false, // 확인 다이얼로그 후 처리
            needsConfirmation: true,
          };
        }

        return { isValid: true, shouldUpdate: true };
      },

      // RightGrid 마감상태 변경 검증
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      validateRightRowChange: (_row, _newClosingStatus) => {
        const { selectedLeftRow } = get();
        // LeftGrid가 Close 상태면 RightGrid 편집 불가
        if (selectedLeftRow?.closingStatus === "Close") {
          message.warning("왼쪽 그리드가 마감 상태이므로 편집할 수 없습니다.");
          return false;
        }
        return true;
      },

      // 오른쪽 그리드의 모든 행을 Close로 변경
      closeAllRightGridRows: () => {
        const { rightGridData, rightGridApi, originalRightGridData } = get();
        if (!rightGridData || rightGridData.length === 0) {
          return; // 오른쪽 그리드가 조회되지 않았으면 처리하지 않음
        }

        // 그리드의 현재 상태를 원본 데이터로 저장 (변경 전 상태)
        // 이렇게 하면 변경사항 감지가 가능합니다.
        let currentOriginalData = originalRightGridData;
        if (rightGridApi) {
          const currentGridData: RightGridData[] = [];
          rightGridApi.getRenderedNodes().forEach((node) => {
            const item = node.data as RightGridData;
            if (item) {
              currentGridData.push({ ...item });
            }
          });
          if (currentGridData.length > 0) {
            currentOriginalData = currentGridData;
            set({ originalRightGridData: currentOriginalData });
          }
        }

        const updatedRightGridData = rightGridData.map((row) => {
          // 이미 Close인 경우 건너뜀
          if (row.closingStatus === "Close" && row.TAG === "Y") {
            return row;
          }

          // Close로 변경
          const updatedRow = {
            ...row,
            closingStatus: "Close",
            TAG: "Y",
            rowStatus: row.rowStatus === undefined ? "U" : row.rowStatus, // 변경사항 표시
          };

          // 그리드에도 반영
          if (rightGridApi) {
            const node = rightGridApi.getRowNode(row.id || "");
            if (node && node.data) {
              node.data.closingStatus = "Close";
              node.data.TAG = "Y";
              node.data.rowStatus =
                node.data.rowStatus === undefined ? "U" : node.data.rowStatus;
            }
          }

          return updatedRow;
        });

        // Store 업데이트
        set({ rightGridData: updatedRightGridData });

        // 그리드 UI 업데이트
        if (rightGridApi) {
          rightGridApi.refreshCells({
            columns: ["closingStatus", "rowStatus"],
            force: true,
          });
        }
      },

      // LeftGrid 데이터 초기화 (개발용: Mock 데이터 로드)
      initializeLeftGridData: () => {
        const mappedData: LeftGridData[] = DLT_DETAIL.map((item, index) => ({
          id: String(index + 1),
          rowStatus: undefined,
          closingYearMonth: item.YYMM,
          profitLossClosing: item.SUB_MODULE === "Completed!" ? "Y" : "N",
          closingStatus: item.TAG === "Y" ? "Close" : "Open",
          firstClosingYn: item.ATTRIBUTE1 === "Y" ? "Y" : "N",
          lastRegUser: item.EMP_NAME,
          lastRegDate: item.LAST_UPDATE_DATE
            ? `${item.LAST_UPDATE_DATE.substring(
                0,
                4
              )}-${item.LAST_UPDATE_DATE.substring(
                4,
                6
              )}-${item.LAST_UPDATE_DATE.substring(6, 8)}`
            : "",
          creator: item.EMP_NAME,
          createDate: item.CREATION_DATE
            ? `${item.CREATION_DATE.substring(
                0,
                4
              )}-${item.CREATION_DATE.substring(
                4,
                6
              )}-${item.CREATION_DATE.substring(6, 8)}`
            : "",
          cnt: 0,
        }));

        set({
          leftGridData: mappedData,
          originalLeftGridData: mappedData.map((item) => ({ ...item })),
        });
      },

      // LeftGrid 변경사항 체크
      checkLeftGridChanges: () => {
        const { leftGridData, originalLeftGridData } = get();
        return leftGridData.some((row, index) => {
          const original = originalLeftGridData[index];
          if (!original) return false;
          return (
            row.rowStatus === "U" ||
            row.rowStatus === "C" ||
            row.closingStatus !== original.closingStatus
          );
        });
      },

      // 저장 액션 (API 연동 준비 완료)
      save: async (leftData, rightData) => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          // TODO: API 호출 로직 구현 예정
          // const saveRequest = {
          //   header: leftData.filter(row => row.rowStatus === "U" || row.rowStatus === "C"),
          //   detail: rightData.filter(row => row.rowStatus === "U" || row.rowStatus === "C"),
          // };
          // const response = await closing.saveHeaderDetail(saveRequest);
          // if (response.success) {
          //   message.success("저장되었습니다.");
          //   // 저장 성공 후 재조회
          //   if (state.lastSearchParams) {
          //     await get().search(state.lastSearchParams);
          //   }
          // }

          // 개발용
          if (import.meta.env.DEV) {
            console.log("저장할 데이터:", { leftData, rightData });
            message.success("저장되었습니다. (개발 모드)");
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

      // 초기화 액션
      reset: () => {
        set({
          leftGridData: [],
          rightGridData: [],
          selectedLeftRow: null,
          originalLeftGridData: [],
          originalRightGridData: [],
          lastSearchParams: null,
        });
      },
    }),
    { name: "ClosTagManageStore" }
  )
);
