import { useCallback, useEffect, useState } from "react";
import type { GridApi } from "ag-grid-community";
import { message } from "antd";
import { confirm } from "@components/ui/feedback/Message";
import { useAccnutCldrManageStore } from "@/store/fcm/md/other/AccnutCldrManage";
import type { AccnutCldrManageRestdeGridData } from "@/types/fcm/md/other/accnutCldrManage.types";
import { SOLAR_LUNAR_TYPE } from "@/types/fcm/md/other/accnutCldrManage.types";

/**
 * HolidayGrid 비즈니스 로직 Custom Hook
 * 
 * 책임:
 * - 그리드 데이터 상태 관리
 * - 행 추가/삭제/복사 로직
 * - 양음력 자동 계산 로직
 * - API 연동
 */
export const useHolidayGrid = () => {
  const restdeGridData = useAccnutCldrManageStore(
    (state) => state.restdeGridData
  );
  const restdeGridApi = useAccnutCldrManageStore(
    (state) => state.restdeGridApi
  );
  const setRestdeGridApi = useAccnutCldrManageStore(
    (state) => state.setRestdeGridApi
  );
  const fetchSolcDate = useAccnutCldrManageStore(
    (state) => state.fetchSolcDate
  );
  const fetchCldrId = useAccnutCldrManageStore(
    (state) => state.fetchCldrId
  );
  const lastSearchRequest = useAccnutCldrManageStore(
    (state) => state.lastSearchRequest
  );

  // 로컬 상태로 rowData 관리 (DetailGrid 패턴)
  // [중요] rowData를 state로 관리해야 편집 중에 그리드 리프레시를 막을 수 있음
  const [internalRowData, setInternalRowData] = useState<
    AccnutCldrManageRestdeGridData[]
  >([]);

  // 스토어 데이터가 변경되면 로컬 상태 동기화 (ID 보장)
  useEffect(() => {
    if (restdeGridData) {
      const formattedData = restdeGridData.map((item, index) => ({
        ...item,
        // [중요] ID는 절대 변하지 않는 값이어야 함.
        // 기존 id가 없으면 인덱스 기반의 안정적인 ID 사용.
        id: item.id || `row-${index}`,
      }));
      setInternalRowData(formattedData);
      
      // ❌ 제거: api.setGridOption("rowData", ...) 호출 제거
      // ✅ React의 선언적 방식에 따라 State 변경에만 의존
    }
  }, [restdeGridData]); // restdeGridApi 의존성 제거

  // 기초일자 또는 양음력 변경 시 휴무일자 자동 계산
  const handleBasicDateOrSolarLunarTypeChange = useCallback(
    async (
      nodeId: string,
      api: GridApi<AccnutCldrManageRestdeGridData>,
      basicDate?: string,
      solarLunarType?: string
    ) => {
      const node = api.getRowNode(nodeId);
      if (!node || !node.data) return;

      const finalBasicDate = basicDate || node.data.basicDate;
      const finalSolarLunarType = solarLunarType || node.data.solarLunarType;

      if (!finalBasicDate || !finalSolarLunarType) return;

      let newOffDate = "";

      // 양력: 기초일자를 그대로 휴무일자로 사용
      if (finalSolarLunarType === SOLAR_LUNAR_TYPE.SOLAR) {
        newOffDate = finalBasicDate;
      }
      // 음력: 음력일자 조회 API 호출
      else if (finalSolarLunarType === SOLAR_LUNAR_TYPE.LUNAR) {
        try {
          const solcDateResponse = await fetchSolcDate({
            asBasicDate: finalBasicDate,
          });

          if (solcDateResponse?.solcDate) {
            newOffDate = solcDateResponse.solcDate;
          }
        } catch (error) {
          console.error("음력일자 조회 실패:", error);
        }
      }

      // 값이 변경될 때만 업데이트하여 불필요한 리프레시 방지
      if (newOffDate && node.data.offDate !== newOffDate) {
        node.setDataValue("offDate", newOffDate);
      }
    },
    [fetchSolcDate]
  );

  // 현재 그리드 데이터 가져오기 헬퍼 함수
  const getCurrentGridData = useCallback(() => {
    if (!restdeGridApi) return [];
    const currentData: AccnutCldrManageRestdeGridData[] = [];
    restdeGridApi.forEachNode((node) => {
      if (node.data) currentData.push(node.data);
    });
    return currentData;
  }, [restdeGridApi]);

  // 새 ID 생성 함수
  const generateNewId = useCallback(() => {
    const currentData = getCurrentGridData();
    if (currentData.length === 0) return "1";
    // 숫자로 변환 가능한 ID 중 최대값 찾기
    const maxId = Math.max(
      ...currentData.map((row) => {
        const id = row.id;
        if (!id) return 0;
        // row-, temp- 등의 접두어가 있는 ID는 제외하거나 파싱
        if (String(id).startsWith("row-")) return 0;

        const numId = parseInt(String(id), 10);
        return isNaN(numId) ? 0 : numId;
      })
    );
    return String(maxId + 1);
  }, [getCurrentGridData]);

  // 새 행 생성 함수
  const createNewRow = useCallback(
    (newId: number | string): AccnutCldrManageRestdeGridData => {
      return {
        id: String(newId),
        rowStatus: "C",
        transCalendarId: lastSearchRequest?.asOfficeId ? undefined : undefined,
        basicDate: "",
        solarLunarType: SOLAR_LUNAR_TYPE.SOLAR, // 기본값: 양력
        offDate: "",
        offDateName: "",
        oriOffDate: undefined,
        oriBasicDate: undefined,
        oriSolarLunarType: undefined,
      };
    },
    [lastSearchRequest]
  );

  // 행 추가 핸들러
  const handleAddRow = useCallback(async () => {
    // 달력ID 조회 (회사에 달력이 등록되어 있는지 확인)
    if (!lastSearchRequest?.asOfficeId) {
      message.warning("회사 정보가 없습니다.");
      return;
    }

    const cldrIdResponse = await fetchCldrId({
      asOfficeId: lastSearchRequest.asOfficeId,
    });

    if (!cldrIdResponse?.glCalendarId) {
      message.error("달력이 등록된 회사가 아닙니다!");
      return;
    }

    const newId = generateNewId();
    const newRow = createNewRow(newId);

    // 달력ID 설정
    newRow.transCalendarId = cldrIdResponse.glCalendarId;

    // 로컬 상태 업데이트
    setInternalRowData((prev) => [newRow, ...prev]);

    // 새 행에 포커스 이동
    setTimeout(() => {
      if (restdeGridApi) {
        restdeGridApi.deselectAll();
        // ID 기반으로 노드 찾기 시도
        const newNode = restdeGridApi.getRowNode(String(newId));
        if (newNode) {
          newNode.setSelected(true);
          restdeGridApi.ensureNodeVisible(newNode, "top");
          restdeGridApi.startEditingCell({
            rowIndex: newNode.rowIndex ?? 0,
            colKey: "basicDate",
          });
        }
      }
    }, 100);
  }, [
    lastSearchRequest,
    fetchCldrId,
    generateNewId,
    createNewRow,
    restdeGridApi,
  ]);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!restdeGridApi) {
      message.warning("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = restdeGridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      message.warning("삭제할 행을 선택해주세요.");
      return;
    }

    // 삭제 확인 메시지 표시
    confirm({
      title: "삭제 확인",
      content: `선택한 ${selectedRows.length}건의 데이터를 삭제하시겠습니까?`,
      onOk: () => {
        // 새로 추가된 행 (rowStatus === "C")만 있는지 확인
        const hasOnlyNewRows = selectedRows.every(
          (row) => row.rowStatus === "C"
        );

        // 로컬 상태 기반 업데이트
        setInternalRowData((prev) => {
          const selectedIds = new Set(selectedRows.map((r) => r.id));
          const newData = prev
            .map((row) => {
              if (!row.id || !selectedIds.has(row.id)) return row;
              // 새로 추가된 행 (rowStatus === "C")은 완전히 제거
              if (row.rowStatus === "C") return null;
              // 기존 행은 rowStatus를 "D"로 설정하여 삭제 표시
              return { ...row, rowStatus: "D" as const };
            })
            .filter(
              (row): row is AccnutCldrManageRestdeGridData => row !== null
            );
          return newData;
        });

        restdeGridApi.deselectAll();

        // 새로 추가된 행만 삭제한 경우
        if (hasOnlyNewRows) {
          message.success(`${selectedRows.length}건의 행이 삭제되었습니다.`);
        } else {
          // 기존 행을 삭제한 경우 저장 안내 메시지
          message.success(
            `${selectedRows.length}건의 행이 삭제 표시되었습니다. 저장 버튼을 클릭하여 적용해주세요.`
          );
        }
      },
    });
  }, [restdeGridApi]);

  // 행 복사 핸들러
  const handleCopyRow = useCallback(() => {
    if (!restdeGridApi) {
      message.warning("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = restdeGridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      message.warning("복사할 행을 선택해주세요.");
      return;
    }

    let nextId = generateNewId();

    const newRows: AccnutCldrManageRestdeGridData[] = selectedRows.map(
      (row) => {
        const newRow: AccnutCldrManageRestdeGridData = {
          ...row,
          id: String(nextId),
          rowStatus: "C" as const, // 복사된 행은 새 행으로 처리
          oriOffDate: undefined,
          oriBasicDate: undefined,
          oriSolarLunarType: undefined,
        };
        nextId = String(parseInt(String(nextId), 10) + 1);
        return newRow;
      }
    );

    // 로컬 상태 업데이트
    setInternalRowData((prev) => [...newRows, ...prev]);
    restdeGridApi.deselectAll();

    // 복사된 첫 번째 행에 포커스 이동
    setTimeout(() => {
      if (restdeGridApi && newRows.length > 0) {
        const firstNewId = newRows[0].id;
        if (firstNewId) {
          const newNode = restdeGridApi.getRowNode(String(firstNewId));
          if (newNode) {
            newNode.setSelected(true);
            restdeGridApi.ensureNodeVisible(newNode, "top");
          }
        }
      }
    }, 100);

    message.success(`${selectedRows.length}건의 행이 복사되었습니다.`);
  }, [restdeGridApi, generateNewId]);

  return {
    // State
    internalRowData,
    
    // Handlers
    setRestdeGridApi,
    handleBasicDateOrSolarLunarTypeChange,
    handleAddRow,
    handleDeleteRow,
    handleCopyRow,
    createNewRow,
  };
};

