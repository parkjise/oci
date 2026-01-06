/**
 * 작성자조회 팝업 (Writer Inquiry Popup)
 * 
 * @description 전표나 문서의 작성자(직원) 조회를 위한 공통 팝업
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { FC } from "react";
import { Form } from "antd";
import type { InjectedProps } from "@/components/ui/feedback/Modal";
import { showError, error } from "@/components/ui/feedback";
import {
  FormInput,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type {
  GridApi,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import { selectWrterInqirePopupList } from "@apis/com/popup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  WrterInqirePopupProps,
  WrterInqirePopupSrchRequest,
  WrterInqirePopupListResponse,
  SelectedWriter,
} from "@/types/com/popup/WrterInqirePopup.types";

export type { SelectedWriter };

const WrterInqirePopup: FC<
  WrterInqirePopupProps & InjectedProps<SelectedWriter>
> = ({ asOfficeId, initialUserId, asDeptCode, returnValue, close, onConfirm }) => {
  const [writerList, setWriterList] = useState<WrterInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asUserIdInput = values?.asUserId as string | undefined;
      const apiParams: WrterInqirePopupSrchRequest = {
        asOfficeId: asOfficeId || undefined,
        asDeptCode: asDeptCode || undefined,
        asUserId: asUserIdInput || undefined,
      };

      const response = await selectWrterInqirePopupList(apiParams);

      if (response.success && response.data) {
        const transformedData: WrterInqirePopupListResponse[] = response.data.map((item, index) => ({
          ...item,
          id: item.empCode || `row-${index}`,
          empCode: String(item.empCode || ""),
          empName: String(item.empName || ""),
          deptCode: String(item.deptCode || ""),
          deptName: String(item.deptName || ""),
        }));
        setWriterList(transformedData);
      } else {
        showError(response.message || "작성자 목록 조회 중 오류가 발생했습니다.");
        setWriterList([]);
      }
    } catch (error) {
      console.error("작성자 목록 조회 오류:", error);
      showError("작성자 목록 조회 중 오류가 발생했습니다.");
      setWriterList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId, asDeptCode]);

  // 초기 사용자ID가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialUserId) {
      form.setFieldsValue({ asUserId: initialUserId });
    }
    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 작성자 데이터 변환 헬퍼 함수
  const createWriterData = useCallback(
    (data: WrterInqirePopupListResponse): SelectedWriter => ({
      makeUser: data.empCode,
      makeUserName: data.empName || "",
    }),
    []
  );

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<WrterInqirePopupListResponse>) => {
      const data = params.data;
      if (data && data.empCode && returnValue) {
        returnValue(createWriterData(data));
        close();
      }
    },
    [returnValue, close, createWriterData]
  );

  // 확인 버튼 클릭 시 호출할 함수
  const handleConfirm = useCallback(() => {
    if (!gridApiRef.current || !returnValue) return;

    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      error({ content: "작성자를 선택해주세요.", title: "안내" });
      return;
    }

    returnValue(createWriterData(selectedRows[0]));
    close();
  }, [returnValue, close, createWriterData]);

  // onConfirm이 전달되면 handleConfirm을 등록
  useEffect(() => {
    onConfirm?.(handleConfirm);
  }, [onConfirm, handleConfirm]);

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [close]);

  // 그리드 컬럼 정의
  const columnDefs: ExtendedColDef<WrterInqirePopupListResponse>[] = [
    {
      field: "empCode",
      headerName: "사용자ID",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "empName",
      headerName: "사용자명",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "deptCode",
      headerName: "부서코드",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "deptName",
      headerName: "부서명",
      width: 200,
      sortable: true,
      filter: true,
      flex: 1,
      headerAlign: "center",
    },
  ];

  return (
    <div className="modal-body">
      <div className="modal-body__header">
        <SearchActions
          form={form}
          onSearch={handleSearch}
          showReset={true}
          onReset={() => {
            form.resetFields();
            setWriterList([]);
          }}
          visibleRows={1}
          columnsPerRow={3}
          resetExpandOnReset={true}
          className="modal-body__actions"
        >
          <FormInput
            name="asUserId"
            label="성명"
            placeholder="사용자ID, 사용자명 입력"
            style={{ width: "300px" }}
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
        </SearchActions>
      </div>
      <div className="modal-body__content">
        <FormAgGrid<WrterInqirePopupListResponse>
          rowData={writerList}
          columnDefs={columnDefs}
          height={400}
          onGridReady={onGridReady}
          onRowDoubleClicked={handleRowDoubleClick}
          enableFilter={true}
          gridOptions={{
            rowSelection: "single",
            pagination: false,
          }}
          showToolbar={false}
          headerTextAlign="center"
          idField="id"
        />
      </div>
    </div>
  );
};

export default WrterInqirePopup;
