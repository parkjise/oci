import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GridApi } from "ag-grid-community";
import {
  showError,
  showWarning,
  showSuccess,
  showInfo,
  warning,
} from "@/components/ui/feedback/Message";
import type {
  LeftGridData,
  RightGridData,
} from "@/types/fcm/gl/closing/closTagManage.types";
import {
  selectClosTagManageList,
  selectClosTagManageDetailList,
  saveClosTagManageHderDetail,
  updateClosTagManageGL,
  createClosTagManageTag,
} from "@apis/fcm/gl/closing";

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
  setSelectedLeftRow: (row: LeftGridData | null) => void; // selectedLeftRow만 업데이트 (재조회 없음)
  search: (
    params: { year: string },
    userInfo?: { officeId?: string; empCode?: string },
    options?: { skipAutoSelect?: boolean }
  ) => Promise<void>;
  selectLeftRow: (
    row: LeftGridData | null,
    oldRowIndex?: number,
    userInfo?: { officeId?: string; empCode?: string }
  ) => Promise<boolean>;
  validateLeftRowChange: (
    row: LeftGridData,
    newTag: string, // "Y" or "N"
    oldTag?: string // "Y" or "N"
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
  closeAllRightGridRows: () => void;
  openAllRightGridRows: () => void; // 오른쪽 그리드의 모든 행을 Close로 변경
  initializeLeftGridData: () => void; // 개발용: 초기 Mock 데이터 로드
  checkLeftGridChanges: () => boolean;
  save: (
    leftData: LeftGridData[],
    rightData: RightGridData[],
    userInfo?: { officeId?: string; empCode?: string }
  ) => Promise<void>;
  collectAndSave: (userInfo?: {
    officeId?: string;
    empCode?: string;
  }) => Promise<void>;
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
      setSelectedLeftRow: (row) => set({ selectedLeftRow: row }), // 재조회 없이 selectedLeftRow만 업데이트

      // 조회 액션 (API 연동 완료)
      search: async (
        params,
        userInfo?: { officeId?: string; empCode?: string },
        options?: { skipAutoSelect?: boolean }
      ) => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          // 조회 전에 rightGrid 초기화 및 leftGrid 선택 해제
          const { leftGridApi } = get();
          if (leftGridApi) {
            leftGridApi.deselectAll();
          }

          set({
            rightGridData: [],
            originalRightGridData: [],
            selectedLeftRow: null,
          });

          // API 요청 파라미터 구성
          const requestParams = {
            asOfficeId: userInfo?.officeId || "",
            asYear: params.year,
            asYymm: undefined, // 년월은 선택적
          };

          // API 호출
          const response = await selectClosTagManageList(requestParams);

          if (import.meta.env.DEV) {
            console.log("selectClosTagManageList 응답:", {
              success: response.success,
              message: response.message,
              dataCount: response.data?.length || 0,
              dataSample: response.data?.slice(0, 3).map((item) => ({
                year: item.year,
                mth: item.mth,
                yymm: item.yymm,
                tag: item.tag,
                plTag: item.plTag,
              })),
            });
          }

          if (response.success && response.data) {
            // 조회 결과가 0개일 때 자동 태그 생성 (as-is 로직)
            if (response.data.length === 0) {
              if (import.meta.env.DEV) {
                console.log("조회 결과가 0개 - 자동 태그 생성 시작");
              }

              try {
                // 태그 생성 API 호출
                const createTagResponse = await createClosTagManageTag({
                  asOfficeId: userInfo?.officeId || "",
                  asYear: params.year,
                  asUser: userInfo?.empCode,
                });

                if (createTagResponse.success) {
                  if (import.meta.env.DEV) {
                    console.log("태그 생성 성공 - 재조회 시작:", {
                      pResult: createTagResponse.data?.pResult,
                      pErrbuff: createTagResponse.data?.pErrbuff,
                      year: params.year,
                    });
                  }

                  // 태그 생성 성공 메시지 표시
                  showSuccess("태그가 생성되었습니다. 조회를 진행합니다.");

                  // loading을 false로 설정하여 재조회가 실행되도록 함
                  set({ loading: false });

                  // 태그 생성 성공 후 해당 년도로 자동 재조회
                  // options는 전달하지 않아서 자동 선택이 실행되도록 함
                  await get().search(params, userInfo);

                  if (import.meta.env.DEV) {
                    console.log("태그 생성 후 재조회 완료:", params.year);
                  }
                  return; // 재조회 후 종료
                } else {
                  // 태그 생성 실패 시 에러 메시지 표시
                  const errorMsg =
                    createTagResponse.data?.pErrbuff ||
                    createTagResponse.message ||
                    "태그 생성 중 오류가 발생했습니다.";
                  showError(errorMsg);
                  if (import.meta.env.DEV) {
                    console.error("태그 생성 실패:", {
                      pResult: createTagResponse.data?.pResult,
                      pErrbuff: createTagResponse.data?.pErrbuff,
                      message: createTagResponse.message,
                    });
                  }
                  return;
                }
              } catch (error) {
                showError("태그 생성 중 오류가 발생했습니다.");
                if (import.meta.env.DEV) {
                  console.error("태그 생성 실패:", error);
                }
                return;
              }
            }

            // 응답 데이터를 LeftGridData 형식으로 매핑
            // rowStatus를 명시적으로 undefined로 설정하여 저장 후 상태 초기화
            const mappedData: LeftGridData[] = response.data.map((item) => {
              const rowData: LeftGridData = {
                id: `${item.year}-${item.mth}`,
                rowStatus: undefined, // 저장 후 재조회 시 상태 초기화
                status: undefined,
                closingYearMonth: item.yymm || `${item.year}${item.mth}`,
                profitLossClosing: item.plTag,
                tag: item.tag || "N", // 서버의 TAG 값 직접 사용 ("Y" or "N")
                firstClosingYn: item.attribute1,
                subModule: item.subModule, // 서브모듈 추가
                lastRegUser: item.lastUpdatedBy,
                lastRegDate: item.lastUpdateDate,
                creator: item.createdBy,
                createDate: item.creationDate,
                cnt: item.cnt,
              };
              // rowStatus를 명시적으로 제거하여 undefined로 확실히 설정
              delete rowData.rowStatus;
              return rowData;
            });

            if (import.meta.env.DEV) {
              console.log("LeftGrid 데이터 매핑 완료:", {
                mappedDataCount: mappedData.length,
                mappedDataSample: mappedData.slice(0, 3).map((item) => ({
                  id: item.id,
                  closingYearMonth: item.closingYearMonth,
                  tag: item.tag,
                  rowStatus: item.rowStatus,
                  // 서버에서 받은 원본 TAG 값 확인
                  serverTag: response.data?.find(
                    (d) =>
                      `${d.year}-${d.mth}` === item.id ||
                      d.yymm === item.closingYearMonth
                  )?.tag,
                })),
                // 서버 응답의 TAG 값 확인
                serverResponseTags: response.data?.slice(0, 3).map((item) => ({
                  yymm: item.yymm || `${item.year}${item.mth}`,
                  tag: item.tag,
                  tagFromServer: item.tag,
                })),
              });
            }

            // originalLeftGridData도 rowStatus를 제거하여 깊은 복사
            const originalData = mappedData.map((item) => {
              const copy = { ...item };
              delete copy.rowStatus;
              return copy;
            });

            set({
              leftGridData: mappedData,
              originalLeftGridData: originalData,
            });

            // 데이터 업데이트 후에도 선택 해제 확인 및 그리드 업데이트
            const { leftGridApi: updatedLeftGridApi } = get();
            if (updatedLeftGridApi) {
              if (import.meta.env.DEV) {
                console.log("LeftGrid 그리드 API에 데이터 설정:", {
                  mappedDataCount: mappedData.length,
                  hasGridApi: !!updatedLeftGridApi,
                });
              }

              // 그리드에 직접 데이터 설정하여 즉시 반영
              // 깊은 복사로 새로운 배열 생성하여 그리드가 완전히 새로고침되도록 함
              const gridDataCopy = mappedData.map((item) => ({
                ...item,
                rowStatus: undefined, // 명시적으로 undefined로 설정
              }));
              updatedLeftGridApi.setGridOption("rowData", gridDataCopy);

              // 다음 틱에서 선택 해제 및 rowStatus 초기화 (데이터 업데이트 후)
              setTimeout(() => {
                updatedLeftGridApi.deselectAll();
                // 모든 행의 rowStatus를 명시적으로 undefined로 초기화
                updatedLeftGridApi.forEachNode((node) => {
                  if (node.data) {
                    // rowStatus를 완전히 제거하여 undefined로 설정
                    delete node.data.rowStatus;
                  }
                });
                // rowStatus 컬럼만 refresh하여 시각적으로 반영 (force: true로 강제 새로고침)
                updatedLeftGridApi.refreshCells({
                  columns: ["rowStatus"],
                  force: true, // force: true로 설정하여 데이터를 다시 읽어옴
                });

                // 조회 후 첫 번째 행 선택 및 포커스 설정 (as-is 로직)
                // skipAutoSelect 옵션이 true이면 자동 선택 건너뛰기 (저장 후 재조회 시)
                if (mappedData.length > 0 && !options?.skipAutoSelect) {
                  try {
                    // 먼저 첫 번째 행이 보이도록 스크롤
                    updatedLeftGridApi.ensureIndexVisible(0, "middle");

                    // 그리드가 완전히 렌더링된 후 행 선택 및 포커스 설정
                    setTimeout(() => {
                      // 첫 번째 행의 노드 찾기
                      const firstRowNode = updatedLeftGridApi.getRowNode("0");
                      if (firstRowNode) {
                        // 행 선택
                        firstRowNode.setSelected(true);
                        // 포커스 설정
                        updatedLeftGridApi.setFocusedCell(0, "tag");
                        if (import.meta.env.DEV) {
                          console.log(
                            "조회 후 첫 번째 행 선택 및 포커스 설정 완료"
                          );
                        }
                      } else {
                        // getRowNode가 실패하면 forEachNode로 찾기
                        updatedLeftGridApi.forEachNode((node) => {
                          if (node.rowIndex === 0) {
                            node.setSelected(true);
                            updatedLeftGridApi.setFocusedCell(0, "tag");
                            if (import.meta.env.DEV) {
                              console.log(
                                "조회 후 첫 번째 행 선택 및 포커스 설정 완료 (forEachNode)"
                              );
                            }
                          }
                        });
                      }
                    }, 50);
                  } catch (error) {
                    if (import.meta.env.DEV) {
                      console.error("행 선택 및 포커스 설정 실패:", error);
                    }
                  }
                }
              }, 150); // 그리드 업데이트가 완료된 후 실행 (지연 시간 증가)
            } else {
              if (import.meta.env.DEV) {
                console.log("LeftGrid 그리드 API가 없음 - 데이터 설정 불가");
              }
            }

            if (import.meta.env.DEV) {
              console.log("LeftGrid 재조회 완료:", {
                dataCount: mappedData.length,
                hasGridApi: !!updatedLeftGridApi,
              });
            }

            showSuccess(`조회 완료: ${mappedData.length}건`);
          } else {
            showError(response.message || "조회 중 오류가 발생했습니다.");
          }

          set({ lastSearchParams: params });
        } catch (error) {
          showError("조회 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("조회 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // LeftGrid 행 선택 시 RightGrid 데이터 로드
      selectLeftRow: async (
        row,
        oldRowIndex,
        userInfo?: { officeId?: string }
      ) => {
        const { leftGridData, leftGridApi } = get();

        // 이전 행 인덱스가 있고 변경사항이 있는지 확인
        if (oldRowIndex !== undefined && oldRowIndex >= 0) {
          // 그리드에서 직접 이전 행의 변경사항 확인
          let oldRowHasChanges = false;
          if (leftGridApi) {
            leftGridApi.forEachNode((node) => {
              if (node.rowIndex === oldRowIndex) {
                const rowData = node.data as LeftGridData;
                if (
                  rowData &&
                  (rowData.rowStatus === "U" || rowData.rowStatus === "C")
                ) {
                  oldRowHasChanges = true;
                }
              }
            });
          } else {
            // API가 없으면 store의 데이터 확인
          const oldRow = leftGridData[oldRowIndex];
          if (
            oldRow &&
            (oldRow.rowStatus === "U" || oldRow.rowStatus === "C")
          ) {
              oldRowHasChanges = true;
            }
          }

          if (oldRowHasChanges) {
            warning({
              content: "저장 후 진행하세요!",
            });
            // 이전 행으로 포커스 이동
            if (leftGridApi) {
              leftGridApi.setFocusedCell(oldRowIndex, "tag");
              // 이전 행 선택 복원
              leftGridApi.forEachNode((node) => {
                if (node.rowIndex === oldRowIndex) {
                  node.setSelected(true);
                } else {
                  node.setSelected(false);
                }
              });
            }
            return false;
          }
        }

        set({ selectedLeftRow: row });

        // 그리드에서 행 선택
        if (leftGridApi && row?.id) {
          const node = leftGridApi.getRowNode(row.id);
          if (node) {
            // 모든 행 선택 해제
            leftGridApi.deselectAll();
            // 해당 행 선택
            node.setSelected(true);
            // 포커스 이동
            if (node.rowIndex !== null && node.rowIndex !== undefined) {
              leftGridApi.setFocusedCell(node.rowIndex, "tag");
            }

            if (import.meta.env.DEV) {
              console.log("LeftGrid 행 선택:", {
                rowId: row.id,
                closingYearMonth: row.closingYearMonth,
                rowIndex: node.rowIndex,
                nodeFound: !!node,
              });
            }
          } else {
            if (import.meta.env.DEV) {
              console.warn("LeftGrid 행을 찾을 수 없음:", {
                rowId: row.id,
                closingYearMonth: row.closingYearMonth,
              });
            }
          }
        }

        if (row) {
          set({ loading: true });
          try {
            // 년월 추출
            const yymm = row.closingYearMonth || "";
            const year = yymm.substring(0, 4);

            // API 요청 파라미터 구성
            const requestParams = {
              asOfficeId: userInfo?.officeId || "",
              asYear: year,
              asYymm: yymm,
            };

            // API 호출
            const response = await selectClosTagManageDetailList(requestParams);

            if (import.meta.env.DEV) {
              console.log("상세 목록 조회 응답:", response);
            }

            if (response.success) {
              // 응답 데이터가 없거나 빈 배열인 경우 처리
              if (!response.data || response.data.length === 0) {
                set({
                  rightGridData: [],
                  originalRightGridData: [],
                });
                if (import.meta.env.DEV) {
                  console.log("상세 목록 데이터가 없습니다.");
                }
                return true;
              }

              // 응답 데이터를 RightGridData 형식으로 매핑
              const mappedData: RightGridData[] = response.data.map(
                (item, index) => ({
                  id: `${item.year || ""}-${item.mth || ""}-${
                    item.subModule || ""
                  }-${index}`,
                rowStatus: undefined,
                  status: undefined,
                  moduleType: item.subModule,
                  closingStatus: item.tag === "Y" ? "Close" : "Open",
                  lastRegUser: item.lastUpdatedBy,
                  creator: item.createdBy,
                  createDate: item.creationDate,
                  lastRegDate: item.lastUpdateDate,
                  mth: item.mth,
                  CREATED_BY: item.createdBy,
                  LAST_UPDATED_BY: item.lastUpdatedBy,
                  CREATION_DATE: item.creationDate,
                  LAST_UPDATE_DATE: item.lastUpdateDate,
                  SUB_MODULE: item.subModule,
                  CREATED_BY_USER: item.createdByUser,
                  YEAR: item.year,
                  OFFICE_ID: item.officeId,
                  TAG: item.tag,
                  LAST_UPDATED_BY_USER: item.lastUpdatedByUser,
                })
              );

              if (import.meta.env.DEV) {
                console.log("매핑된 상세 데이터:", mappedData);
              }

            set({
                rightGridData: mappedData,
                originalRightGridData: mappedData.map((item) => ({ ...item })),
              });
            } else {
              showError(
                response.message || "데이터 조회 중 오류가 발생했습니다."
              );
              set({
                rightGridData: [],
                originalRightGridData: [],
              });
            }
          } catch (error) {
            showError("데이터 조회 중 오류가 발생했습니다.");
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
        newTag, // "Y" or "N"
        oldTag?: string // "Y" or "N"
      ) => {
        // "Y"로 변경 시 (마감)
        if (newTag === "Y") {
          // CNT 체크: 미전기 전표가 있으면 마감 불가
          if (row.cnt !== undefined && row.cnt !== 0) {
            showWarning("미전기된 전표가 존재하여 Closing 불가합니다!");
            return { isValid: false, shouldUpdate: false };
          }

          // "Y"로 변경 시 추가 필드 설정
          return {
            isValid: true,
            shouldUpdate: true,
            updateFields: {
              tag: "Y",
              subModule: "Completed!", // Close 시 서브모듈을 "Completed!"로 설정
              firstClosingYn: "Y", // Close 시 최초마감여부를 "Y"로 설정
            },
          };
        }

        // "N"으로 변경 시 (마감 해제)
        if (newTag === "N" && oldTag === "Y") {
          // PL_TAG(손익마감) 체크
          if (row.profitLossClosing === "Y") {
            showWarning(
              "손익마감 Tag가 Closing 되어 GL Period Open 불가합니다!"
            );
            return { isValid: false, shouldUpdate: false };
          }

          // 확인 다이얼로그는 컴포넌트에서 처리
          // 확인 후 업데이트할 필드 정보 포함
          return {
            isValid: true,
            shouldUpdate: false, // 확인 다이얼로그 후 처리
            needsConfirmation: true,
            updateFields: {
              tag: "N",
              subModule: "Not Completed!", // Open 시 서브모듈을 "Not Completed!"로 설정
            },
          };
        }

        return { isValid: true, shouldUpdate: true };
      },

      // RightGrid 마감상태 변경 검증
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      validateRightRowChange: (_row, _newClosingStatus) => {
        const { selectedLeftRow } = get();
        // LeftGrid가 "Y" 상태면 RightGrid 편집 불가
        if (selectedLeftRow?.tag === "Y") {
          showWarning("왼쪽 그리드가 마감 상태이므로 편집할 수 없습니다.");
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
          // 이미 "Y"인 경우 건너뜀
          if (row.TAG === "Y") {
            return row;
          }

          // "Y"로 변경
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

      // 오른쪽 그리드의 모든 행을 Open으로 변경
      openAllRightGridRows: () => {
        const { rightGridData, rightGridApi, originalRightGridData } = get();
        if (!rightGridData || rightGridData.length === 0) {
          if (import.meta.env.DEV) {
            console.log("openAllRightGridRows: 오른쪽 그리드 데이터가 없음");
          }
          return; // 오른쪽 그리드가 조회되지 않았으면 처리하지 않음
        }

        if (import.meta.env.DEV) {
          console.log("openAllRightGridRows 호출됨:", {
            rightGridDataCount: rightGridData.length,
            hasRightGridApi: !!rightGridApi,
          });
        }

        // 그리드의 현재 상태를 원본 데이터로 저장 (변경 전 상태)
        let currentOriginalData = originalRightGridData;
        if (rightGridApi) {
          const currentGridData: RightGridData[] = [];
          // getRenderedNodes() 대신 forEachNode 사용하여 모든 노드 가져오기
          rightGridApi.forEachNode((node) => {
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
          // 이미 "N"인 경우 건너뜀
          if (row.TAG === "N") {
            return row;
          }

          // "N"으로 변경
          const updatedRow = {
            ...row,
            closingStatus: "Open",
            TAG: "N",
            rowStatus: row.rowStatus === undefined ? "U" : row.rowStatus, // 변경사항 표시
          };

          // 그리드에도 반영
          if (rightGridApi) {
            const node = rightGridApi.getRowNode(row.id || "");
            if (node && node.data) {
              node.data.closingStatus = "Open";
              node.data.TAG = "N";
              node.data.rowStatus =
                node.data.rowStatus === undefined ? "U" : node.data.rowStatus;
            }
          }

          return updatedRow;
        });

        if (import.meta.env.DEV) {
          console.log("openAllRightGridRows - 업데이트된 데이터:", {
            updatedCount: updatedRightGridData.filter((row) => row.TAG === "N")
              .length,
            totalCount: updatedRightGridData.length,
          });
        }

        // Store 업데이트
        set({ rightGridData: updatedRightGridData });

        // 그리드 UI 업데이트
        if (rightGridApi) {
          // force: false로 변경하여 데이터 리셋 방지
          rightGridApi.refreshCells({
            columns: ["closingStatus", "rowStatus"],
            force: false,
          });
        }
      },

      // LeftGrid 데이터 초기화 (API 연동 시 사용 예정)
      initializeLeftGridData: () => {
        // TODO: API 연동 시 구현 예정
        set({
          leftGridData: [],
          originalLeftGridData: [],
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
            row.tag !== original.tag
          );
        });
      },

      // 저장 액션 (API 연동 완료)
      save: async (
        leftData,
        rightData,
        userInfo?: { officeId?: string; empCode?: string }
      ) => {
        const state = get();
        if (state.loading) return;

        set({ loading: true });

        try {
          if (import.meta.env.DEV) {
            console.log("Store save 함수 - 받은 데이터:", {
              leftDataCount: leftData.length,
              rightDataCount: rightData.length,
              leftDataSample: leftData.slice(0, 3).map((row) => ({
                closingYearMonth: row.closingYearMonth,
                tag: row.tag,
                rowStatus: row.rowStatus,
                hasRowStatus: "rowStatus" in row,
                rowStatusType: typeof row.rowStatus,
                allKeys: Object.keys(row),
              })),
              rightDataSample: rightData.slice(0, 3).map((row) => ({
                id: row.id,
                moduleType: row.moduleType,
                closingStatus: row.closingStatus,
                rowStatus: row.rowStatus,
                TAG: row.TAG,
              })),
            });
          }

          // 이미 필터링된 데이터를 받지만, 혹시 모를 경우를 대비해 다시 필터링
          const changedLeftData = leftData.filter(
            (row) => row.rowStatus === "U" || row.rowStatus === "C"
          );
          const changedRightData = rightData.filter(
            (row) => row.rowStatus === "U" || row.rowStatus === "C"
          );

          if (import.meta.env.DEV) {
            console.log("Store save 함수 - 변경된 데이터:", {
              changedLeftDataCount: changedLeftData.length,
              changedRightDataCount: changedRightData.length,
              changedLeftData: changedLeftData.map((row) => ({
                closingYearMonth: row.closingYearMonth,
                tag: row.tag,
                rowStatus: row.rowStatus,
              })),
              // 필터링되지 않은 LeftData 확인
              filteredOutLeftData: leftData
                .filter((row) => row.rowStatus !== "U" && row.rowStatus !== "C")
                .map((row) => ({
                  closingYearMonth: row.closingYearMonth,
                  tag: row.tag,
                  rowStatus: row.rowStatus,
                  rowStatusValue: row.rowStatus,
                  rowStatusIsUndefined: row.rowStatus === undefined,
                })),
            });
          }

          // 변경사항이 없으면 저장하지 않음
          if (changedLeftData.length === 0 && changedRightData.length === 0) {
            showInfo("저장할 데이터가 없습니다.");
            set({ loading: false });
            return;
          }

          if (import.meta.env.DEV) {
            console.log("저장 시작 - 변경된 데이터:", {
              changedLeftDataCount: changedLeftData.length,
              changedRightDataCount: changedRightData.length,
            });
          }

          // LeftGridData를 ClosTagManageHderData로 변환
          const headerList = changedLeftData.map((item) => {
            const yymm = item.closingYearMonth || "";
            // subModule과 attribute1 필드 포함
            const year = yymm.substring(0, 4);
            const mth = yymm.substring(4, 6);

            // tag 필드 직접 사용
            const tagValue = item.tag || "N";

            if (import.meta.env.DEV) {
              console.log("LeftGrid 저장 데이터 변환:", {
                closingYearMonth: yymm,
                tag: item.tag,
                tagValue: tagValue,
                rowStatus: item.rowStatus,
              });
            }

            return {
              rowStatus: item.rowStatus || "U",
              officeId: userInfo?.officeId || "",
              year: year,
              mth: mth,
              tag: tagValue,
              plTag: item.profitLossClosing || "N",
              subModule: item.subModule, // 서브모듈 필드 추가
              attribute1: item.firstClosingYn || "N",
              lastUpdatedBy: userInfo?.empCode || "",
              lastUpdateDate: undefined, // 서버에서 설정
              createdBy: item.creator || userInfo?.empCode || "",
              creationDate: item.createDate || undefined,
              programId: "ClosTagManage",
              terminalId: "SYSTEM",
              empName: undefined,
              amendTag: undefined,
              allFlag: undefined,
              cnt: item.cnt || 0,
              yymm: yymm,
            };
          });

          // RightGridData를 ClosTagManageDetailData로 변환
          const detailList = changedRightData.map((item) => {
            const selectedRow = state.selectedLeftRow;
            const yymm = selectedRow?.closingYearMonth || "";
            const year = yymm.substring(0, 4);
            const mth = yymm.substring(4, 6);

            return {
              rowStatus: item.rowStatus || "U",
              officeId: userInfo?.officeId || "",
              year: year,
              mth: mth,
              subModule: item.moduleType || item.SUB_MODULE || "",
              tag: item.closingStatus === "Close" ? "Y" : "N",
              createdBy:
                item.creator || item.CREATED_BY || userInfo?.empCode || "",
              creationDate: item.createDate || item.CREATION_DATE || undefined,
              lastUpdatedBy:
                item.lastRegUser ||
                item.LAST_UPDATED_BY ||
                userInfo?.empCode ||
                "",
              lastUpdateDate:
                item.lastRegDate || item.LAST_UPDATE_DATE || undefined,
              programId: "ClosTagManage",
              terminalId: "SYSTEM",
              lastUpdatedByUser: item.LAST_UPDATED_BY_USER,
              createdByUser: item.CREATED_BY_USER,
            };
          });

          // API 호출 전 로그
          if (import.meta.env.DEV) {
            console.log("저장 API 호출 전 데이터:", {
              headerListCount: headerList.length,
              detailListCount: detailList.length,
              headerList: headerList.map((h) => ({
                year: h.year,
                mth: h.mth,
                tag: h.tag,
                rowStatus: h.rowStatus,
              })),
              detailList: detailList.map((d) => ({
                year: d.year,
                mth: d.mth,
                subModule: d.subModule,
                tag: d.tag,
                rowStatus: d.rowStatus,
              })),
            });
          }

          // API 호출 - saveHeaderDetail 먼저 호출
          const response = await saveClosTagManageHderDetail({
            headerList: headerList.length > 0 ? headerList : undefined,
            detailList: detailList.length > 0 ? detailList : undefined,
          });

          if (import.meta.env.DEV) {
            console.log("saveClosTagManageHderDetail 응답:", {
              success: response.success,
              message: response.message,
              headerListCount: headerList.length,
              detailListCount: detailList.length,
            });
          }

          if (response.success) {
            if (import.meta.env.DEV) {
              console.log(
                "saveClosTagManageHderDetail 성공 - updateGL 호출 전 상태:",
                {
                  changedLeftDataCount: changedLeftData.length,
                  changedRightDataCount: changedRightData.length,
                  changedLeftData: changedLeftData.map((row) => ({
                    closingYearMonth: row.closingYearMonth,
                    tag: row.tag,
                    rowStatus: row.rowStatus,
                  })),
                  leftDataCount: leftData.length,
                  rightDataCount: rightData.length,
                  leftDataSample: leftData.slice(0, 3).map((row) => ({
                    closingYearMonth: row.closingYearMonth,
                    tag: row.tag,
                    rowStatus: row.rowStatus,
                  })),
                  changedLeftDataFiltered: leftData
                    .filter(
                      (row) => row.rowStatus === "U" || row.rowStatus === "C"
                    )
                    .map((row) => ({
                      closingYearMonth: row.closingYearMonth,
                      tag: row.tag,
                      rowStatus: row.rowStatus,
                    })),
                }
              );
            }

            // saveHeaderDetail 성공 후 updateGL 호출 (as-is 로직과 동일)
            // as-is에서는 saveHeaderDetail 성공 시 항상 updateGL을 호출함
            // 무조건 호출: 변경된 LeftGrid 데이터가 있으면 그것을 사용하고, 없으면 selectedLeftRow를 사용
            const leftDataForUpdateGL =
              changedLeftData.length > 0
                ? changedLeftData
                : state.selectedLeftRow
                ? [state.selectedLeftRow]
                : [];

            if (leftDataForUpdateGL.length > 0) {
              if (import.meta.env.DEV) {
                console.log(
                  "updateGL 호출 시작 - LeftGrid 행 수:",
                  leftDataForUpdateGL.length,
                  {
                    isChangedData: changedLeftData.length > 0,
                    isSelectedRow: !state.selectedLeftRow
                      ? false
                      : changedLeftData.length === 0,
                  }
                );
              }

              // 각 LeftGrid 행에 대해 updateGL 호출
              for (const leftItem of leftDataForUpdateGL) {
                const yymm = leftItem.closingYearMonth || "";
                const year = yymm.substring(0, 4);
                const mth = yymm.substring(4, 6);

                const updateGLParams = {
                  rowStatus: leftItem.rowStatus || "U",
                  officeId: userInfo?.officeId || "",
                  year: year,
                  mth: mth,
                  tag: leftItem.tag || "N", // tag 필드 직접 사용
                  plTag: leftItem.profitLossClosing || "N",
                  subModule: leftItem.subModule, // subModule 필드 추가
                  attribute1: leftItem.firstClosingYn || "N",
                  lastUpdatedBy: userInfo?.empCode || "",
                  lastUpdateDate: undefined,
                  createdBy: leftItem.creator || userInfo?.empCode || "",
                  creationDate: leftItem.createDate || undefined,
                  programId: "ClosTagManage",
                  terminalId: "SYSTEM",
                  empName: undefined,
                  amendTag: undefined,
                  allFlag: undefined,
                  cnt: leftItem.cnt || 0,
                  yymm: yymm,
                };

                if (import.meta.env.DEV) {
                  console.log("updateGL 호출:", {
                    yymm,
                    year,
                    mth,
                    tag: updateGLParams.tag,
                    rowStatus: updateGLParams.rowStatus,
                  });
                }

                const updateGLResponse = await updateClosTagManageGL(
                  updateGLParams
                );

                if (import.meta.env.DEV) {
                  console.log("updateGL 응답:", {
                    success: updateGLResponse.success,
                    message: updateGLResponse.message,
                  });
                }

                if (!updateGLResponse.success) {
                  showError(
                    `GL 업데이트 실패: ${
                      updateGLResponse.message || "알 수 없는 오류"
                    }`
                  );
                  set({ loading: false });
                  return;
                }
              }
            } else {
              // selectedLeftRow도 없으면 updateGL 호출하지 않음
              if (import.meta.env.DEV) {
                console.log(
                  "updateGL 호출 건너뜀: changedLeftData와 selectedLeftRow가 모두 없음",
                  {
                    changedLeftDataCount: changedLeftData.length,
                    hasSelectedLeftRow: !!state.selectedLeftRow,
                  }
                );
              }
            }

            // updateGL 완료 후 재조회 (as-is의 sbm_updateGL_submitdone과 동일)
            showSuccess("저장되었습니다.");

            // 저장 성공 후 재조회
            if (state.lastSearchParams) {
              if (import.meta.env.DEV) {
                console.log("저장 후 재조회 시작:", {
                  lastSearchParams: state.lastSearchParams,
                });
              }

              // 저장 전 선택된 행의 closingYearMonth 저장
              const savedSelectedYearMonth =
                state.selectedLeftRow?.closingYearMonth;

              // loading을 false로 설정하여 search 함수가 실행되도록 함
              set({ loading: false });

              // 왼쪽 그리드만 재조회 (오른쪽 그리드는 비워둠)
              // skipAutoSelect 옵션을 true로 설정하여 자동 선택 건너뛰기
              await get().search(state.lastSearchParams, userInfo, {
                skipAutoSelect: true,
              });

              // 재조회 완료 후 저장 전 선택했던 행을 다시 선택하고 RightGrid도 조회
              const { leftGridApi, leftGridData } = get();
              if (
                leftGridApi &&
                savedSelectedYearMonth &&
                leftGridData.length > 0
              ) {
                // 먼저 모든 선택 해제
                leftGridApi.deselectAll();
                leftGridApi.setFocusedCell(-1, "");

                // 그리드 렌더링 완료 대기 후 저장 전 선택했던 행 다시 선택
                setTimeout(async () => {
                  const updatedLeftGridApi = get().leftGridApi;
                  const updatedLeftGridData = get().leftGridData;

                  if (updatedLeftGridApi && updatedLeftGridData.length > 0) {
                    // 저장 전 선택했던 행 찾기 (updatedLeftGridData에서 먼저 찾기)
                    const targetRowFromData = updatedLeftGridData.find(
                      (row) => row.closingYearMonth === savedSelectedYearMonth
                    );

                    if (targetRowFromData) {
                      // 그리드에서 해당 행의 노드 찾기 및 선택
                      let targetRowIndex: number | null = null;
                      updatedLeftGridApi.forEachNode((node) => {
                        if (
                          node.data?.closingYearMonth ===
                            savedSelectedYearMonth &&
                          typeof node.rowIndex === "number"
                        ) {
                          targetRowIndex = node.rowIndex;
                          // 행 선택
                          node.setSelected(true);
                          // 포커스 설정
                          updatedLeftGridApi.setFocusedCell(
                            node.rowIndex,
                            "tag"
                          );
                          // 해당 행이 보이도록 스크롤
                          updatedLeftGridApi.ensureIndexVisible(
                            node.rowIndex,
                            "middle"
                          );
                        }
                      });

                      // selectedLeftRow 업데이트
                      set({ selectedLeftRow: targetRowFromData });

                      if (import.meta.env.DEV) {
                        console.log("저장 후 재선택 - selectLeftRow 호출 전:", {
                          targetRow: targetRowFromData.closingYearMonth,
                          targetRowIndex,
                          hasUserInfo: !!userInfo,
                        });
                      }

                      // selectLeftRow를 호출하여 RightGrid도 재조회
                      // oldRowIndex를 undefined로 전달하여 변경사항 체크 건너뛰기 (저장 후이므로 변경사항 없음)
                      const selectResult = await get().selectLeftRow(
                        targetRowFromData,
                        undefined, // 저장 후 재조회이므로 oldRowIndex를 undefined로 전달하여 변경사항 체크 건너뛰기
                        userInfo
                      );

                      if (import.meta.env.DEV) {
                        console.log(
                          "저장 후 재선택 및 RightGrid 재조회 완료:",
                          {
                            savedSelectedYearMonth,
                            selectResult,
                          }
                        );
                      }
                    } else {
                      // 저장 전 선택했던 행을 찾지 못한 경우 첫 번째 행 선택
                      const firstNode = updatedLeftGridApi.getRowNode("0");
                      if (firstNode && firstNode.data) {
                        const firstRow = firstNode.data as LeftGridData;
                        if (firstRow && firstRow.closingYearMonth) {
                          firstNode.setSelected(true);
                          updatedLeftGridApi.setFocusedCell(0, "tag");
                          set({ selectedLeftRow: firstRow });

                          if (import.meta.env.DEV) {
                            console.log(
                              "저장 후 첫 번째 행 선택 - selectLeftRow 호출:",
                              {
                                firstRow: firstRow.closingYearMonth,
                                hasUserInfo: !!userInfo,
                              }
                            );
                          }

                          // 첫 번째 행 선택 시 RightGrid도 조회
                          // oldRowIndex를 undefined로 전달하여 변경사항 체크 건너뛰기
                          await get().selectLeftRow(
                            firstRow,
                            undefined,
                            userInfo
                          );
                        }
                      }
                    }
                  }
                }, 200); // 그리드 렌더링 완료 대기
              } else {
                // 저장 전 선택했던 행이 없거나 데이터가 없는 경우 오른쪽 그리드 초기화
                set({
                  rightGridData: [],
                  originalRightGridData: [],
                });
              }

              if (import.meta.env.DEV) {
                console.log("저장 후 재조회 완료 - 오른쪽 그리드 초기화됨");
              }
            }
          } else {
            showError(response.message || "저장 중 오류가 발생했습니다.");
          }
        } catch (error) {
          showError("저장 중 오류가 발생했습니다.");
          if (import.meta.env.DEV) {
            console.error("저장 실패:", error);
          }
        } finally {
          set({ loading: false });
        }
      },

      // 그리드에서 데이터를 수집하고 저장하는 액션 (Page의 handleSave 로직 이동)
      collectAndSave: async (userInfo?: {
        officeId?: string;
        empCode?: string;
      }) => {
        const state = get();
        const { leftGridApi, rightGridApi, leftGridData, rightGridData } =
          state;

        if (!userInfo?.officeId || !userInfo?.empCode) {
          showError("사용자 정보를 찾을 수 없습니다.");
          return;
        }

        // 왼쪽 그리드에서 모든 행 데이터 가져오기
        const allLeftRows: LeftGridData[] = [];
        if (leftGridApi) {
          leftGridApi.forEachNode((node) => {
            if (node.data) {
              // 깊은 복사하여 참조 문제 방지
              const rowData = JSON.parse(
                JSON.stringify(node.data)
              ) as LeftGridData;
              allLeftRows.push(rowData);
            }
          });
        } else {
          // API가 없으면 store의 데이터 사용
          allLeftRows.push(...leftGridData);
        }

        // 오른쪽 그리드에서 모든 행 데이터 가져오기
        const allRightRows: RightGridData[] = [];
        if (rightGridApi) {
          rightGridApi.forEachNode((node) => {
            if (node.data) {
              // 깊은 복사하여 참조 문제 방지
              const rowData = JSON.parse(
                JSON.stringify(node.data)
              ) as RightGridData;
              allRightRows.push(rowData);
            }
          });
        } else {
          // API가 없으면 store의 데이터 사용
          allRightRows.push(...rightGridData);
        }

        // 변경된 행만 필터링
        const changedLeftRows = allLeftRows.filter(
          (row) => row.rowStatus === "U" || row.rowStatus === "C"
        );
        const changedRightRows = allRightRows.filter(
          (row) => row.rowStatus === "U" || row.rowStatus === "C"
        );

        // 변경사항이 없으면 저장하지 않음
        if (changedLeftRows.length === 0 && changedRightRows.length === 0) {
          showWarning("변경된 항목이 없습니다.");
          return;
        }

        // 저장 전에 store 동기화
        const { updateLeftGridData, updateRightGridData } = get();
        updateLeftGridData(allLeftRows);
        updateRightGridData(allRightRows);

        // 저장 실행
        await get().save(changedLeftRows, changedRightRows, userInfo);
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
