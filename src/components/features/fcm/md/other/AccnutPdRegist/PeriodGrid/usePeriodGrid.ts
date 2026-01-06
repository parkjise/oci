import { useCallback } from "react";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import { useAccnutPdRegistStore } from "@/store/fcm/md/other/AccnutPdRegist/accnutPdRegistStore";
import { useAuthStore } from "@store/com/auth/authStore";
import type { PeriodData } from "@/types/fcm/md/other/accnutPdRegist.types";

/**
 * PeriodGrid 행위(Behavior) 관리 Hook
 * - 그리드 행 추가/삭제/복사
 * - 포커스 이동, 편집 모드 전환 등 UI 조작
 */
export const usePeriodGrid = (gridApi: GridApi | null) => {
  const gridData = useAccnutPdRegistStore((state) => state.gridData);
  const setGridData = useAccnutPdRegistStore((state) => state.setGridData);
  const currentYear = useAccnutPdRegistStore((state) => state.currentYear);
  const { user } = useAuthStore();

  /**
   * 행 추가
   */
  const handleAddRow = useCallback(() => {
    if (!gridApi) {
      message.warning("그리드가 초기화되지 않았습니다.");
      return;
    }

    if (!user) {
      message.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 새 행 데이터
    const newRow: PeriodData = {
      id: `new-${Date.now()}`,
      rowStatus: "C",
      officeId: user.officeId || "",
      accYear: currentYear,
      periodNum: 0,
      periodName: "",
      accMonth: "",
      dateF: "",
      dateT: "",
      adjustFlag: "N",
      realYear: currentYear,
      realMth: "",
      quarter: 1,
      halfYearly: 1,
    };

    // Store 데이터 업데이트
    const newData = [...gridData, newRow];
    setGridData(newData);

    // UI 조작: 포커스 및 편집 시작
    setTimeout(() => {
      const rowIndex = newData.length - 1;

      // 스크롤 이동
      gridApi.ensureIndexVisible(rowIndex, "middle");

      // 행 선택
      const rowNode = gridApi.getRowNode(newRow.id as string);
      if (rowNode) {
        rowNode.setSelected(true, true);
      }

      // 포커스 및 편집
      gridApi.setFocusedCell(rowIndex, "periodNum");
      gridApi.startEditingCell({
        rowIndex,
        colKey: "periodNum",
      });
    }, 100);
  }, [gridApi, gridData, setGridData, currentYear, user]);

  /**
   * 행 삭제
   */
  const handleDeleteRow = useCallback(() => {
    if (!gridApi) {
      message.warning("그리드가 초기화되지 않았습니다.");
      return;
    }

    const focusedCell = gridApi.getFocusedCell();
    const rowIndex = focusedCell?.rowIndex;

    if (rowIndex === undefined || rowIndex < 0) {
      message.warning("삭제할 행을 선택하세요.");
      return;
    }

    if (rowIndex >= gridData.length) {
      message.warning("유효하지 않은 행입니다.");
      return;
    }

    const targetRow = gridData[rowIndex];

    // rowStatus가 "C"인 경우 → 완전히 제거 (신규 행)
    // 그 외의 경우 → rowStatus를 "D"로 변경 (삭제 예정)
    const newData = gridData
      .map((row, index) => {
        if (index !== rowIndex) return row;

        // 신규 행(C)은 완전히 제거
        if (row.rowStatus === "C") return null;

        // 기존 행은 삭제 표시
        return { ...row, rowStatus: "D" as const };
      })
      .filter((row): row is PeriodData => row !== null);

    setGridData(newData);

    message.success(
      targetRow.rowStatus === "C"
        ? "행이 삭제되었습니다."
        : "행이 삭제 표시되었습니다. 저장 버튼을 눌러주세요."
    );
  }, [gridApi, gridData, setGridData]);

  /**
   * 행 복사
   */
  const handleCopyRow = useCallback(() => {
    if (!gridApi) {
      message.warning("그리드가 초기화되지 않았습니다.");
      return;
    }

    const focusedCell = gridApi.getFocusedCell();
    const rowIndex = focusedCell?.rowIndex;

    if (rowIndex === undefined || rowIndex < 0) {
      message.warning("복사할 행을 선택하세요.");
      return;
    }

    if (rowIndex >= gridData.length) {
      message.warning("유효하지 않은 행입니다.");
      return;
    }

    // 현재 행 데이터 복사
    const sourceRow = gridData[rowIndex];
    if (!sourceRow) {
      message.warning("복사할 행이 없습니다.");
      return;
    }

    // periodNum을 제외한 나머지 복사, 새로운 id와 rowStatus 부여
    const copiedRow: PeriodData = {
      ...sourceRow,
      id: `new-${Date.now()}`,
      rowStatus: "C",
      periodNum: 0, // periodNum은 초기화
    };

    // 다음 행에 삽입
    const newData = [
      ...gridData.slice(0, rowIndex + 1),
      copiedRow,
      ...gridData.slice(rowIndex + 1),
    ];
    setGridData(newData);

    // UI 조작: 포커스 및 편집 시작
    setTimeout(() => {
      const newRowIndex = rowIndex + 1;

      // 스크롤 이동
      gridApi.ensureIndexVisible(newRowIndex, "middle");

      // 행 선택
      const rowNode = gridApi.getRowNode(copiedRow.id as string);
      if (rowNode) {
        rowNode.setSelected(true, true);
      }

      // 포커스 및 편집
      gridApi.setFocusedCell(newRowIndex, "periodNum");
      gridApi.startEditingCell({
        rowIndex: newRowIndex,
        colKey: "periodNum",
      });
    }, 100);
  }, [gridApi, gridData, setGridData]);

  return {
    handleAddRow,
    handleDeleteRow,
    handleCopyRow,
  };
};

