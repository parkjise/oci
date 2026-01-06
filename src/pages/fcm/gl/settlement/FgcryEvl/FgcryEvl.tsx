import React, { useCallback, useRef } from "react";
import TwoGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import TowGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/TowGridLayout";
import {
  FilterPanel,
  LeftGrid,
  RightGrid,
} from "@components/features/fcm/gl/settlement/fgcryEvl";
import { ActionButtonGroup, FormButton } from "@/components/ui/form";
import { DataGridStyles } from "@/pages/sample/sample3/DataGrid.styles";
import type {
  FgcryEvlCreatRequest,
  FgcryEvlDeleteRequest,
  FgcryEvlReverseRequest,
  FgcryEvlSrchRequest,
  FgcryEvlHderListResponse,
} from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { useAuthStore } from "@store/com/auth/authStore";
import { useFgcryEvlStore } from "@store/fcm/gl/settlement/FgcryEvlStore";
import { confirm, showWarning } from "@components/ui/feedback/Message";
import type { FilterPanelRef } from "@components/features/fcm/gl/settlement/fgcryEvl/FilterPanel/FilterPanel";


const FgcryEvl: React.FC = () => {
  const filterPanelRef = useRef<FilterPanelRef | null>(null);
  const { user } = useAuthStore();
  const { search, create, checkGlDate, delete: deleteAction, reverse: reverseAction } = useFgcryEvlStore();

  // Create 버튼 핸들러
  const handleCreate = useCallback(async () => {
    if (!filterPanelRef.current) {
      showWarning("검색 조건을 확인할 수 없습니다.");
      return;
    }

    // 1. 필드 검증
    const isValid = await filterPanelRef.current.validateFields();
    if (!isValid) {
      return;
    }

    // 2. 회계일자와 구분 가져오기
    const glDate = filterPanelRef.current.getCurrentDate();
    const category = filterPanelRef.current.getCurrentCategory();

    if (!glDate || !category) {
      showWarning("회계일자와 구분을 선택해주세요.");
      return;
    }

    if (!user?.officeId || !user?.empCode) {
      showWarning("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 3. 회계 기초, 마감 여부 체크
    try {
      // const checkResult = await checkGlDate({
      //   officeId: user.officeId,
      //   category: "GL",
      //   glDate: glDate,
      // });

      // if (checkResult <= 0) {
      //   console.log("회계 기초 또는 마감 체크에 실패했습니다.", checkResult);
      //   showWarning("회계 기초 또는 마감 체크에 실패했습니다.");
      //   return;
      // }

      // 4. 해당 회계일자로 생성된 데이터 체크
      const searchRequest: FgcryEvlSrchRequest = {
        asOfficeId: user.officeId,
        asStdDate: glDate,
        asType: category, // AP, AR, GL 문자열 그대로 사용
        asFrExEvalId: "",
        asCurrDeci: "",
        asCurrFormat: "",
      };

      await search(searchRequest);

      // 조회 결과 확인 (search 액션 완료 후 상태 확인)
      const currentSearchData = useFgcryEvlStore.getState().searchData;
      if (currentSearchData && currentSearchData.length > 0) {
        showWarning("생성된 자료가 있습니다. 삭제 후 입력하세요.");
        return;
      }

      // 5. Confirm 후 Create 실행
      confirm({
        title: "확인",
        content: "Create 하시겠습니까?",
        okText: "확인",
        cancelText: "취소",
        onOk: async () => {
          const createRequest: FgcryEvlCreatRequest = {
            pOfficeId: user.officeId,
            pGlDate: glDate,
            pCategory: category,
            pUserId: user.empCode,
            pGCurr: "KRW", // 통화단위 (기본값, 필요시 설정에서 가져오기)
            pProgramId: "OSE", // 프로그램 ID (필요시 설정에서 가져오기)
            pTerminalId: "", // 터미널 ID (필요시 설정에서 가져오기)
          };

          await create(createRequest);

          if (filterPanelRef.current) {
            await filterPanelRef.current.handleSearch();
          }
        },
      });
    } catch (error) {
      console.error("Create 처리 중 오류:", error);
      showWarning("Create 처리 중 오류가 발생했습니다.");
    }
  }, [user, search, create, checkGlDate]);

  const handleDelete = useCallback(async () => {
    const { gridApi, delete: deleteAction } = useFgcryEvlStore.getState();

    // 1. 그리드에서 선택된 행 가져오기
    if (!gridApi) {
      showWarning("그리드가 준비되지 않았습니다.");
      return;
    }

    const selectedRows = gridApi.getSelectedRows() as FgcryEvlHderListResponse[];

    if (!selectedRows || selectedRows.length === 0) {
      showWarning("선택된 데이터가 없습니다.");
      return;
    }

    // 단일 행만 선택 가능 (웹스퀘어 로직: getFocusedRowIndex)
    const selectedRow = selectedRows[0];

    // 2. 전표 전기 여부 체크
    if (selectedRow.slipNoPosted === "Y") {
      showWarning(`${selectedRow.slipNo || ""} 회계전표가 전기되었습니다!`);
      return;
    }

    if (selectedRow.revSlipNoPosted === "Y") {
      showWarning(`${selectedRow.revSlipNo || ""} 회계전표가 전기되었습니다!`);
      return;
    }

    // 3. 회계일자 가져오기
    if (!filterPanelRef.current) {
      showWarning("검색 조건을 확인할 수 없습니다.");
      return;
    }

    const glDate = filterPanelRef.current.getCurrentDate();
    if (!glDate) {
      showWarning("회계일자를 선택해주세요.");
      return;
    }

    if (!user?.officeId) {
      showWarning("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 4. 회계 기초, 마감 여부 체크
    try {
      // const checkResult = await checkGlDate({
      //   officeId: user.officeId,
      //   category: "GL",
      //   glDate: glDate,
      // });

      // if (checkResult <= 0) {
      //   showWarning("회계 기초 또는 마감 체크에 실패했습니다.");
      //   return;
      // }

      // 5. 외화평가ID 확인
      const exEvaluId = selectedRow.frExEvalId;
      if (!exEvaluId) {
        showWarning("외화평가ID를 찾을 수 없습니다.");
        return;
      }

      // 6. Confirm 후 Delete 실행
      confirm({
        title: "확인",
        content: "Delete 하시겠습니까?",
        okText: "확인",
        cancelText: "취소",
        onOk: async () => {
          const deleteRequest: FgcryEvlDeleteRequest = {
            pExEvaluId: exEvaluId,
          };

          await deleteAction(deleteRequest);

          if (filterPanelRef.current) {
            await filterPanelRef.current.handleSearch();
          }
        },
      });
    } catch (error) {
      console.error("Delete 처리 중 오류:", error);
      showWarning("Delete 처리 중 오류가 발생했습니다.");
    }
  }, [user, deleteAction]);

  const handleReverse = useCallback(async () => {
    const { gridApi, reverse: reverseAction } = useFgcryEvlStore.getState();

    // 1. 그리드에서 선택된 행 가져오기
    if (!gridApi) {
      showWarning("그리드가 준비되지 않았습니다.");
      return;
    }

    const selectedRows = gridApi.getSelectedRows() as FgcryEvlHderListResponse[];

    if (!selectedRows || selectedRows.length === 0) {
      showWarning("선택된 데이터가 없습니다.");
      return;
    }

    // 단일 행만 선택 가능 (웹스퀘어 로직: getFocusedRowIndex)
    const selectedRow = selectedRows[0];

    // 2. Reverse 전표 존재 여부 체크
    if (selectedRow.revSlipNo && selectedRow.revSlipNo !== "") {
      showWarning(`${selectedRow.revSlipNo} Reverse 전표가 이미 존재합니다!`);
      return;
    }

    // 3. 회계년도 마지막 Period 체크 (SLIP_NO의 8번째부터 2자리가 "12")
    if (selectedRow.slipNo) {
      const period = selectedRow.slipNo.substring(8, 10);
      if (period === "12") {
        showWarning("회계년도 마지막 Period 전표는 Reverse할 수 없습니다!");
        return;
      }
    }

    // 4. 원전표 전기 여부 체크
    if (selectedRow.slipNoPosted !== "Y") {
      showWarning(`원전표 ${selectedRow.slipNo || ""}의 회계전표를 먼저 전기하십시요!`);
      return;
    }

    // 5. 회계일자 가져오기 및 익월 1일로 변환
    if (!filterPanelRef.current) {
      showWarning("검색 조건을 확인할 수 없습니다.");
      return;
    }

    const glDate = filterPanelRef.current.getCurrentDate();
    if (!glDate) {
      showWarning("회계일자를 선택해주세요.");
      return;
    }

    // 회계일자를 익월 1일로 변환 (YYYYMMDD -> YYYYMM -> +1개월 -> YYYYMM01)
    const yearMonth = glDate.substring(0, 6); // YYYYMM
    const year = parseInt(yearMonth.substring(0, 4), 10);
    const month = parseInt(yearMonth.substring(4, 6), 10);

    let nextYear = year;
    let nextMonth = month + 1;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    const revGlDate = `${nextYear}${String(nextMonth).padStart(2, "0")}01`;

    if (!user?.empCode) {
      showWarning("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 6. 전표ID 확인
    const slipId = selectedRow.slpHeaderId;
    if (!slipId) {
      showWarning("전표ID를 찾을 수 없습니다.");
      return;
    }

    // 7. Confirm 후 Reverse 실행
    confirm({
      title: "확인",
      content: "Reverse 하시겠습니까?",
      okText: "확인",
      cancelText: "취소",
      onOk: async () => {
        const reverseRequest: FgcryEvlReverseRequest = {
          pSlipId: slipId,
          pRevGlDate: revGlDate,
          pUserId: user.empCode,
          pProgramId: "", // 프로그램 ID (필요시 설정에서 가져오기)
          pTerminalId: "", // 터미널 ID (필요시 설정에서 가져오기)
        };

        await reverseAction(reverseRequest);
      },
    });
  }, [user, reverseAction]);

  return (
    <TwoGridSaveLayout
      filterPanel={
        <FilterPanel
          className="page-layout__filter-panel"
          onRefReady={(ref) => {
            filterPanelRef.current = ref;
          }}
        />
      }
      grid={
        <>
          <DataGridStyles className="data-grid-panel">
            <div className="data-grid-panel__toolbar">
              <div className="data-grid-panel-left">
                {/* 왼쪽 영역 (필요시 추가) */}
              </div>
              <div className="data-grid-panel-right">
                <ActionButtonGroup
                  hideButtons={["edit", "copy", "delete", "expand", "create", "save"]}
                  onButtonClick={{
                    //save: handleSave,
                  }}
                  customButtons={[
                    <FormButton
                      key="create"
                      size="small"
                      onClick={handleCreate}
                    >
                      Create
                    </FormButton>,
                    <FormButton
                      key="delete"
                      size="small"
                      onClick={handleDelete}
                    >
                      Delete
                    </FormButton>,
                    <FormButton
                      key="reverse"
                      size="small"
                      onClick={handleReverse}
                    >
                      Reverse
                    </FormButton>,
                  ]} />
              </div>
            </div>
          </DataGridStyles>
          <TowGridSaveLayout
            primaryPanel={<LeftGrid className="page-layout__grid" />}
            secondaryPanel={<RightGrid className="page-layout__grid" />}
          />
        </>
      }
    />
  );
};

export default FgcryEvl;
