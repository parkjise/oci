/**
 * ============================================================================
 * LeftGrid 비즈니스 로직 Hook
 * ============================================================================
 */

import { useCallback } from "react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { confirm } from "@/components/ui/feedback/Message";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { useAuthStore } from "@store/com/auth/authStore";
import type { LeftGridData } from "@/types/fcm/gl/closing/closTagManage.types";

/**
 * LeftGrid의 셀 값 변경 로직을 처리하는 Hook
 */
export const useLeftGridLogic = () => {
  const { user } = useAuthStore();
  const {
    validateLeftRowChange,
    updateLeftGridData,
    closeAllRightGridRows,
    openAllRightGridRows,
    selectLeftRow,
  } = useClosTagManageStore();

  /**
   * 셀 값 변경 핸들러
   */
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (!event.data || !event.colDef.field) return;

      const row = event.data as LeftGridData;
      const field = event.colDef.field;

      if (field === "tag") {
        // valueSetter에서 변환하지만, handleCellValueChanged는 변환 전 값("Close"/"Open")을 받을 수 있음
        // "Close"/"Open"을 "Y"/"N"으로 변환
        const rawNewValue = event.newValue as string;
        const rawOldValue = event.oldValue as string;

        // "Close"/"Open"을 "Y"/"N"으로 변환
        const newValue =
          rawNewValue === "Close"
            ? "Y"
            : rawNewValue === "Open"
            ? "N"
            : rawNewValue;
        const oldValue =
          rawOldValue === "Close"
            ? "Y"
            : rawOldValue === "Open"
            ? "N"
            : rawOldValue;

        // 그리드 데이터에서 원본 데이터 확인 (oldValue가 없을 경우 대비)
        const actualOldValue = oldValue || row.tag || "N";

        const validationResult = await validateLeftRowChange(
          row,
          newValue,
          actualOldValue
        );

        if (!validationResult.isValid && event.api) {
          // 변경 거부 시 이전 값으로 복원
          const node = event.node;
          if (node && node.data) {
            node.data.tag = actualOldValue;
            // 특정 셀만 refresh하여 깜빡거림 최소화
            event.api.refreshCells({
              rowNodes: [node],
              columns: ["tag"],
              force: true,
            });
          }
          return;
        }

        // 확인 다이얼로그가 필요한 경우
        if (validationResult.needsConfirmation) {
          confirm({
            content: "전 서브모듈 마감Tag를 Open 하시겠습니까?",
            onOk: async () => {
              // 확인 시 그리드 노드의 데이터 직접 수정
              // event.node가 유효하지 않을 수 있으므로 row.id를 통해 다시 찾기
              if (event.api && row.id) {
                const node = event.api.getRowNode(row.id);
                if (node && node.data) {
                  // validationResult의 updateFields를 포함하여 데이터 업데이트
                  const updatedData = {
                    ...node.data,
                    tag: newValue, // "Y" or "N"
                    rowStatus: "U" as const,
                    ...(validationResult.updateFields || {}), // updateFields 병합
                  };

                  // node.setData()를 사용하여 데이터 업데이트 (AG-Grid 권장 방법)
                  node.setData(updatedData);

                  // row 데이터도 동기화 (이벤트에서 받은 row 객체)
                  row.tag = newValue;
                  row.rowStatus = "U";
                  if (validationResult.updateFields) {
                    Object.assign(row, validationResult.updateFields);
                  }

                  // rowStatus 컬럼만 refresh하여 시각적으로 반영 (깜빡거림 최소화)
                  event.api.refreshCells({
                    rowNodes: [node],
                    columns: ["rowStatus", "tag"],
                    force: true,
                  });

                  // 추가로 node.data도 직접 업데이트 (이중 안전장치)
                  if (node.data) {
                    node.data.tag = newValue;
                    node.data.rowStatus = "U";
                    if (validationResult.updateFields) {
                      Object.assign(node.data, validationResult.updateFields);
                    }
                  }

                  // Store의 leftGridData와 selectedLeftRow 동기화
                  if (event.api) {
                    const allGridData: LeftGridData[] = [];
                    event.api.forEachNode((gridNode) => {
                      if (gridNode.data) {
                        allGridData.push(
                          JSON.parse(
                            JSON.stringify(gridNode.data)
                          ) as LeftGridData
                        );
                      }
                    });
                    updateLeftGridData(allGridData);

                    // selectedLeftRow가 변경된 행이면 업데이트 및 RightGrid 재조회
                    // confirm의 onOk 콜백 내부에서는 클로저 문제를 피하기 위해 store에서 직접 가져옴
                    const currentSelectedLeftRow =
                      useClosTagManageStore.getState().selectedLeftRow;
                    if (
                      currentSelectedLeftRow?.closingYearMonth ===
                      row.closingYearMonth
                    ) {
                      const updatedSelectedRow = allGridData.find(
                        (item) => item.closingYearMonth === row.closingYearMonth
                      );
                      if (updatedSelectedRow) {
                        // RightGrid 재조회를 위해 selectLeftRow 호출 (먼저 서버 데이터 가져오기)
                        await selectLeftRow(
                          updatedSelectedRow,
                          undefined,
                          {
                            officeId: user?.officeId,
                            empCode: user?.empCode,
                          }
                        );

                        // 서버 데이터를 가져온 후 서브모듈도 Open으로 변경 (wf_all_flag 로직)
                        openAllRightGridRows();
                      }
                    } else {
                      // 서브모듈도 Open으로 변경 (wf_all_flag 로직)
                      openAllRightGridRows();
                    }
                  } else {
                    // 서브모듈도 Open으로 변경 (wf_all_flag 로직)
                    openAllRightGridRows();
                  }

                  if (import.meta.env.DEV) {
                    console.log("확인 다이얼로그 후 LeftGrid 셀 변경:", {
                      rowId: row.id,
                      closingYearMonth: row.closingYearMonth,
                      tag: row.tag,
                      oldValue: actualOldValue,
                      newValue: newValue,
                      rowStatus: row.rowStatus,
                      nodeDataRowStatus: node.data?.rowStatus,
                      nodeDataTag: node.data?.tag,
                      updatedDataRowStatus: updatedData.rowStatus,
                      updatedDataTag: updatedData.tag,
                      nodeFound: !!node,
                    });
                  }
                } else {
                  if (import.meta.env.DEV) {
                    console.error(
                      "확인 다이얼로그 후 LeftGrid 노드를 찾을 수 없음:",
                      {
                        rowId: row.id,
                        closingYearMonth: row.closingYearMonth,
                      }
                    );
                  }
                }
              }
            },
            onCancel: () => {
              // 취소 시 이전 값으로 복원
              const node = event.node;
              if (node && node.data && event.api) {
                node.data.tag = actualOldValue;
                event.api.refreshCells({
                  rowNodes: [node],
                  columns: ["tag"],
                  force: true,
                });
              }
            },
          });
          return;
        }

        // 확인 다이얼로그가 필요 없는 경우 (Close로 변경)
        if (event.api && row.id) {
          const node = event.api.getRowNode(row.id);
          if (node && node.data) {
            // validationResult의 updateFields를 포함하여 데이터 업데이트
            const updatedData = {
              ...node.data,
              tag: newValue, // "Y" or "N"
              rowStatus: "U" as const,
              ...(validationResult.updateFields || {}), // updateFields 병합
            };

            // node.setData()를 사용하여 데이터 업데이트
            node.setData(updatedData);

            // row 데이터도 동기화
            row.tag = newValue;
            row.rowStatus = "U";
            if (validationResult.updateFields) {
              Object.assign(row, validationResult.updateFields);
            }

            // rowStatus 컬럼만 refresh
            event.api.refreshCells({
              rowNodes: [node],
              columns: ["rowStatus", "tag"],
              force: true,
            });

            // Store의 leftGridData 동기화
            if (event.api) {
              const allGridData: LeftGridData[] = [];
              event.api.forEachNode((gridNode) => {
                if (gridNode.data) {
                  allGridData.push(
                    JSON.parse(
                      JSON.stringify(gridNode.data)
                    ) as LeftGridData
                  );
                }
              });
              updateLeftGridData(allGridData);

              // 현재 선택된 행이 변경된 행이면 RightGrid 재조회
              const currentSelectedLeftRow =
                useClosTagManageStore.getState().selectedLeftRow;
              if (
                currentSelectedLeftRow?.closingYearMonth ===
                row.closingYearMonth
              ) {
                const updatedSelectedRow = allGridData.find(
                  (item) => item.closingYearMonth === row.closingYearMonth
                );
                if (updatedSelectedRow) {
                  // RightGrid 재조회를 위해 selectLeftRow 호출 (먼저 서버 데이터 가져오기)
                  await selectLeftRow(updatedSelectedRow, undefined, {
                    officeId: user?.officeId,
                    empCode: user?.empCode,
                  });

                  // 서버 데이터를 가져온 후 RightGrid 상태 변경
                  if (newValue === "Y") {
                    closeAllRightGridRows();
                  } else if (newValue === "N") {
                    openAllRightGridRows();
                  }
                }
              } else {
                // 선택되지 않은 행이 변경된 경우에도 RightGrid 상태 변경
                if (newValue === "Y") {
                  closeAllRightGridRows();
                } else if (newValue === "N") {
                  openAllRightGridRows();
                }
              }
            }

            if (import.meta.env.DEV) {
              console.log("LeftGrid 셀 변경 (확인 다이얼로그 없음):", {
                rowId: row.id,
                closingYearMonth: row.closingYearMonth,
                tag: row.tag,
                oldValue: actualOldValue,
                newValue: newValue,
                rowStatus: row.rowStatus,
              });
            }
          }
        }
      }
    },
    [
      validateLeftRowChange,
      updateLeftGridData,
      closeAllRightGridRows,
      openAllRightGridRows,
      selectLeftRow,
      user?.officeId,
      user?.empCode,
    ]
  );

  return {
    handleCellValueChanged,
  };
};

