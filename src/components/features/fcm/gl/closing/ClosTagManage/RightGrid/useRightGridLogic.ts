/**
 * ============================================================================
 * RightGrid 비즈니스 로직 Hook
 * ============================================================================
 */

import { useCallback, useMemo } from "react";
import type {
  CellValueChangedEvent,
  IRowNode,
  GridApi,
} from "ag-grid-community";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import type { RightGridData } from "@/types/fcm/gl/closing/closTagManage.types";

/**
 * RightGrid의 비즈니스 로직을 처리하는 Hook
 */
export const useRightGridLogic = () => {
  const { originalRightGridData, validateRightRowChange, updateRightGridData } =
    useClosTagManageStore();

  // 원본 데이터 Map 생성 (getChangedRows와 handleCellValueChanged에서 공통 사용)
  const originalRightMap = useMemo(() => {
    const map = new Map<string, RightGridData>();
    originalRightGridData.forEach((item) => {
      if (item.id) {
        map.set(item.id, item);
      }
    });
    return map;
  }, [originalRightGridData]);

  /**
   * 변경된 행 추출 (모든 행 확인 - 스크롤 밖 행 포함)
   */
  const getChangedRows = useCallback(
    (gridApi: GridApi | null): RightGridData[] => {
      if (!gridApi) return [];
      const changedRows: RightGridData[] = [];

      // 그리드에서 모든 행 데이터 가져오기 (forEachNode 사용)
      gridApi.forEachNode((node: IRowNode<RightGridData>) => {
        const item = node.data as RightGridData;
        if (!item) return;

        const original = item.id ? originalRightMap.get(item.id) : undefined;

        if (original) {
          // TAG 필드 비교
          if (original.TAG !== item.TAG) {
            changedRows.push({ ...item });
          }
        } else {
          // 원본에 없는 경우 (새로 추가된 경우)
          if (item.rowStatus === "C") {
            changedRows.push({ ...item });
          }
        }
      });
      return changedRows;
    },
    [originalRightMap]
  );

  /**
   * 셀 값 변경 핸들러
   */
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<RightGridData>) => {
      if (params.colDef.field !== "closingStatus" || !params.data) {
        return;
      }

      const row = params.data as RightGridData;
      const node = params.node;
      const newClosingStatus = params.newValue as string;
      const oldClosingStatus =
        (params.oldValue as string | undefined) || row.closingStatus || "Open";

      // 1) 검증
      const isValid = validateRightRowChange(row, newClosingStatus);
      if (!isValid) {
        // 검증 실패 시 원래 값으로 복구
        if (node && node.data) {
          node.data.closingStatus = oldClosingStatus;
          node.data.TAG = oldClosingStatus === "Close" ? "Y" : "N";
        }
        row.closingStatus = oldClosingStatus;
        row.TAG = oldClosingStatus === "Close" ? "Y" : "N";
        // 특정 셀만 refresh하여 깜빡거림 최소화
        params.api.refreshCells({
          rowNodes: [params.node],
          columns: ["closingStatus"],
          force: true,
        });
        return;
      }

      // 2) 데이터 일관성 보장 (valueSetter가 해주긴 하지만, 한 번 더 확실히)
      // node.data를 먼저 업데이트하고, row는 node.data의 참조이므로 자동으로 업데이트됨
      if (node && node.data) {
        node.data.closingStatus = newClosingStatus;
        node.data.TAG = newClosingStatus === "Close" ? "Y" : "N";
        // row는 node.data의 참조이므로 자동으로 업데이트됨
        row.closingStatus = node.data.closingStatus;
        row.TAG = node.data.TAG;
      } else {
        // node.data가 없는 경우 (비정상적인 상황)
        row.closingStatus = newClosingStatus;
        row.TAG = newClosingStatus === "Close" ? "Y" : "N";
      }

      // 3) 원본과 비교하여 rowStatus 설정
      const original = row.id ? originalRightMap.get(row.id) : undefined;
      const currentTag = row.TAG || (row.closingStatus === "Close" ? "Y" : "N");

      if (original) {
        // 원본과 비교: TAG가 다르면 수정 상태
        const originalTag =
          original.TAG || (original.closingStatus === "Close" ? "Y" : "N");

        if (originalTag !== currentTag) {
          // node.data를 먼저 업데이트
          if (node && node.data) {
            node.data.rowStatus = "U";
          }
          row.rowStatus = "U";
        } else {
          // 원본과 같으면 변경사항 없음
          if (node && node.data) {
            node.data.rowStatus = undefined;
          }
          row.rowStatus = undefined;
        }
      } else {
        // 원본이 없는 신규 행이라면, 수정으로 본다 (또는 추가로 처리)
        // 마감상태가 변경되었으므로 무조건 "U"로 설정
        if (node && node.data) {
          node.data.rowStatus = "U";
        }
        row.rowStatus = "U";
      }

      if (import.meta.env.DEV) {
        console.log("RightGrid 셀 변경 후:", {
          rowId: row.id,
          closingStatus: row.closingStatus,
          rowStatus: row.rowStatus,
          nodeDataRowStatus: node?.data?.rowStatus,
          nodeDataClosingStatus: node?.data?.closingStatus,
          nodeDataTag: node?.data?.TAG,
          originalTag: original?.TAG,
          currentTag: row.TAG,
          isSameReference: row === node?.data,
        });
      }

      // store도 업데이트하여 저장 시점에 올바른 데이터를 가져올 수 있도록 함
      // 하지만 그리드 리렌더링은 방지하기 위해 그리드 API에서 직접 가져옴
      if (node && node.data) {
        // 그리드의 모든 행 데이터를 가져와서 store 업데이트
        const allRows: RightGridData[] = [];
        params.api.forEachNode((gridNode) => {
          if (gridNode.data) {
            allRows.push({ ...gridNode.data } as RightGridData);
          }
        });
        // store 업데이트 (비동기로 처리하여 리렌더링 지연)
        setTimeout(() => {
          updateRightGridData(allRows);
        }, 0);
      }

      // rowStatus와 closingStatus 컬럼 refresh하여 시각적으로 반영 (깜빡거림 최소화)
      // force: false로 설정하여 데이터 변경 없이 렌더링만 업데이트
      params.api.refreshCells({
        rowNodes: [params.node],
        columns: ["closingStatus", "rowStatus"],
        force: false, // force: true는 데이터를 다시 읽어올 수 있으므로 false로 변경
      });

      // rowStatus가 제대로 설정되었는지 확인
      if (import.meta.env.DEV) {
        setTimeout(() => {
          const refreshedNode = params.api.getRowNode(row.id || "");
          console.log("refreshCells 후 node.data 확인:", {
            rowId: row.id,
            rowStatus: refreshedNode?.data?.rowStatus,
            closingStatus: refreshedNode?.data?.closingStatus,
            TAG: refreshedNode?.data?.TAG,
          });
        }, 100);
      }
    },
    [validateRightRowChange, originalRightMap, updateRightGridData]
  );

  return {
    handleCellValueChanged,
    getChangedRows,
  };
};
