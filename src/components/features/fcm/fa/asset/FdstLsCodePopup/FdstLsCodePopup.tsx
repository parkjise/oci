/**
 * 계정조회 팝업 (Account Inquiry Popup)
 *
 * @description 시스템 공통 계정 과목 조회를 위한 팝업 컴포넌트
 * @author 김민수
 * @date 2025-12-18
 * @last_modified 2025-12-18
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "antd";
import type { GridApi } from "ag-grid-community";
import {
  FormInput,
  SearchActions,
  FormAgGrid,
} from "@form";
import type { ExtendedColDef } from "@form/AgGrid/FormAgGrid.tsx";
import { createGridReadyHandlerRef } from "@utils/agGridUtils.tsx";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@components/ui/feedback/Modal/PageModal.tsx";
import type { FdstLsCodeListResponse, FdstLsCodeSrchRequest } from "@/types/fcm/fa.asset/fdstTmplat.types.ts";
import { selectFdstLsCodeList } from "@apis/fcm";

export type SelectedCode = FdstLsCodeListResponse;

type FdstLsCodeListResponseWithId = FdstLsCodeListResponse & {
  id?: string;
};

interface FdstLsCodePopupProps {
  /** 대표사무소 */
  asOfficeId?: string;
  /** 초기 세부분류명 */
  initialScodeName?: string;
  /** 초기 검색 조건 (하위 호환성 유지) */
  initialSearch?: Partial<FdstLsCodeSrchRequest>;
  /** 확인 버튼 핸들러 등록 함수 */
  onConfirm?: (handler: () => void) => void;
}

const FdstLsCodePopup: React.FC<
  FdstLsCodePopupProps & InjectedProps<SelectedCode>
> = ({
  asOfficeId,
  initialScodeName,
  initialSearch,
  returnValue,
  close: _close,
  onConfirm,
}) => {
  void _close;
  const gridApiRef = useRef<GridApi | null>(null);
  const [rowData, setRowData] = useState<FdstLsCodeListResponseWithId[]>(
    []
  );
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 데이터 변환 헬퍼 함수
  const createResultData = useCallback(
    (data: FdstLsCodeListResponseWithId): FdstLsCodeListResponse => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = data;
      return rest;
    },
    []
  );

  const addIdToData = useCallback(
    (
      data: FdstLsCodeListResponse[]
    ): FdstLsCodeListResponseWithId[] => {
      return data.map((item) => ({
        ...item,
        id: item.lsScode,
      }));
    },
    []
  );

  const createSearchRequest = useCallback(
    (asScodeName?: string, asScode?: string): FdstLsCodeSrchRequest => {
      return {
        asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
        asScode: asScode,
        asScodeName: asScodeName,
      };
    },
    [asOfficeId, initialSearch]
  );

  // 목록 조회 함수
  const fetchCodeList = useCallback(
    async (request: FdstLsCodeSrchRequest) => {
      try {
        const response = await selectFdstLsCodeList(request);
        if (response.success && response.data) {
          setRowData(addIdToData(response.data));
        } else {
          showError(response.message || "계정조회에 실패했습니다.");
        }
      } catch {
        showError("계정조회 중 오류가 발생했습니다.");
      }
    },
    [addIdToData]
  );

  const handleSearch = useCallback(
    async (values: Record<string, unknown>) => {
      const asScode = values.asScode as string | undefined;
      const asScodeName = values.asScodeName as string | undefined;
      const request = createSearchRequest(asScode, asScodeName);
      await fetchCodeList(request);
    },
    [createSearchRequest, fetchCodeList]
  );

  const columnDefs: ExtendedColDef<FdstLsCodeListResponseWithId>[] = [
    {
      field: "lsLcode",
      headerName: "대분류",
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      resizable: false,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
    {
      field: "lsLcodeName",
      headerName: "대분류명",
      width: 160,
      minWidth: 160,
      maxWidth: 160,
      resizable: false,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
    {
      field: "lsScode",
      headerName: "세부분류",
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      resizable: false,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
    {
      field: "lsScodeName",
      headerName: "세부분류명",
      resizable: false,
      sortable: true,
      filter: true,
      headerAlign: "center",
    },
  ];

  const handleRowDoubleClick = useCallback(
    (event: { data: FdstLsCodeListResponseWithId }) => {
      if (!event.data || !returnValue) return;
      returnValue(createResultData(event.data));
    },
    [returnValue, createResultData]
  );

  // 확인 버튼 클릭 시 호출할 함수
  const handleConfirm = useCallback(() => {
    if (!gridApiRef.current || !returnValue) return;

    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      error({ content: "분류을 선택해주세요.", title: "안내" });
      return;
    }

    returnValue(createResultData(selectedRows[0]));
  }, [returnValue, createResultData]);

  // onConfirm이 전달되면 handleConfirm을 등록
  useEffect(() => {
    onConfirm?.(handleConfirm);
  }, [onConfirm, handleConfirm]);

  // 초기 데이터 로드
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const scodeName = initialScodeName || initialSearch?.asScodeName;
    if (scodeName) {
      form.setFieldValue('asScodeName', scodeName);
    }
    if (initialSearch?.asScode) {
      form.setFieldValue('asScode', initialSearch.asScode);
    }

    const initialRequest = createSearchRequest(scodeName, initialSearch?.asScode);
    fetchCodeList(initialRequest);
  }, [createSearchRequest, fetchCodeList, form, initialScodeName, initialSearch]);

  return (
    <div className="modal-body">
      <div className="modal-body__header">
        <SearchActions
          form={form}
          onSearch={handleSearch}
          visibleRows={1}
          columnsPerRow={4}
          resetExpandOnReset={true}
          className="modal-body__actions"
        >
          <FormInput
            name="asScode"
            label="세부분류코드"
            placeholder="세부분류코드"
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
          <FormInput
            name="asScodeName"
            label="세부분류명"
            placeholder="세부분류명"
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
        </SearchActions>
      </div>
      <div className="modal-body__content">
        <FormAgGrid<FdstLsCodeListResponseWithId>
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onRowDoubleClicked={handleRowDoubleClick}
          height={400}
          gridOptions={{
            rowSelection: "single",
            pagination: false,
          }}
          enableFilter={true}
          showToolbar={false}
          idField="id"
        />
      </div>
    </div>
  );
};

export default FdstLsCodePopup;
