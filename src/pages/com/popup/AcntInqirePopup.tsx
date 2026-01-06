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
// import VerticalLayout from "@/components/ui/layout/VerticalLayout/VerticalLayout";
import {
  FormInput,
  FormCheckbox,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import { selectAcntInqirePopupList } from "@apis/com/popup";
import type {
  AcntInqirePopupSrchRequest,
  AcntInqirePopupListResponse,
} from "@/types/com/popup/AcntInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";

export type SelectedAccount = AcntInqirePopupListResponse;

type AcntInqirePopupListResponseWithId = AcntInqirePopupListResponse & {
  id?: string;
};

interface AcntInqirePopupProps {
  /** 대표사무소 */
  asOfficeId?: string;
  /** 초기 계정코드 */
  initialAccCode?: string;
  /** 초기 검색 조건 (하위 호환성 유지) */
  initialSearch?: Partial<AcntInqirePopupSrchRequest>;
  /** 확인 버튼 핸들러 등록 함수 */
  onConfirm?: (handler: () => void) => void;
}

const AcntInqirePopup: React.FC<
  AcntInqirePopupProps & InjectedProps<SelectedAccount>
> = ({
  asOfficeId,
  initialAccCode,
  initialSearch,
  returnValue,
  close: _close,
  onConfirm,
}) => {
    void _close;
    const gridApiRef = useRef<GridApi | null>(null);
    const [rowData, setRowData] = useState<AcntInqirePopupListResponseWithId[]>(
      []
    );
    const [form] = Form.useForm();
    const hasInitialized = useRef(false);

    const onGridReady = createGridReadyHandlerRef(gridApiRef);

    // 계정 데이터 변환 헬퍼 함수
    const createAccountData = useCallback(
      (data: AcntInqirePopupListResponseWithId): AcntInqirePopupListResponse => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = data;
        return rest;
      },
      []
    );

    const addIdToData = useCallback(
      (
        data: AcntInqirePopupListResponse[]
      ): AcntInqirePopupListResponseWithId[] => {
        return data.map((item, index) => ({
          ...item,
          id: item.accCode || `row-${index}`,
        }));
      },
      []
    );

    const createSearchRequest = useCallback(
      (asAccCde?: string, asCstPayYn?: boolean): AcntInqirePopupSrchRequest => {
        return {
          asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
          asAccCde: asAccCde,
          asAccActYn: initialSearch?.asAccActYn,
          asCstPayYn: asCstPayYn !== undefined ? (asCstPayYn ? "Y" : "N") : initialSearch?.asCstPayYn,
          asUseYn: initialSearch?.asUseYn || "Y",
          asAccLvl: initialSearch?.asAccLvl,
        };
      },
      [asOfficeId, initialSearch]
    );

    // 계정 목록 조회 함수
    const fetchAccountList = useCallback(
      async (request: AcntInqirePopupSrchRequest) => {
        try {
          const response = await selectAcntInqirePopupList(request);
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
        const asAccCde = values.asAccCde as string | undefined;
        const asCstPayYn = values.asCstPayYn as boolean | undefined;
        const request = createSearchRequest(asAccCde, asCstPayYn);
        await fetchAccountList(request);
      },
      [createSearchRequest, fetchAccountList]
    );

    const columnDefs: ExtendedColDef<AcntInqirePopupListResponseWithId>[] = [
      {
        headerName: "No.",
        minWidth: 90,
        maxWidth: 90,
        width: 90,
        valueGetter: (params) => {
          if (params.node?.rowIndex !== null) {
            return (params.node?.rowIndex ?? 0) + 1;
          }
          return "";
        },
        sortable: true,
        filter: true,
        headerAlign: "center",
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "상태",
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        valueGetter: () => "",
        sortable: true,
        filter: true,
        headerAlign: "center",
        cellStyle: { textAlign: "center" },
      },
      {
        field: "accCode",
        headerName: "계정코드",
        width: 150,
        minWidth: 150,
        maxWidth: 150,
        sortable: true,
        filter: true,
        headerAlign: "center",
      },
      {
        field: "accName",
        headerName: "계정과목명",
        width: 200,
        sortable: true,
        filter: true,
        flex: 1,
        headerAlign: "center",
      },
    ];

    const handleRowDoubleClick = useCallback(
      (event: { data: AcntInqirePopupListResponseWithId }) => {
        if (!event.data || !returnValue) return;
        returnValue(createAccountData(event.data));
      },
      [returnValue, createAccountData]
    );

    // 확인 버튼 클릭 시 호출할 함수
    const handleConfirm = useCallback(() => {
      if (!gridApiRef.current || !returnValue) return;

      const selectedRows = gridApiRef.current.getSelectedRows();
      if (selectedRows.length === 0) {
        error({ content: "계정을 선택해주세요.", title: "안내" });
        return;
      }

      returnValue(createAccountData(selectedRows[0]));
    }, [returnValue, createAccountData]);

    // onConfirm이 전달되면 handleConfirm을 등록
    useEffect(() => {
      onConfirm?.(handleConfirm);
    }, [onConfirm, handleConfirm]);

    // 초기 데이터 로드
    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const accCode = initialAccCode || initialSearch?.asAccCde;

      // 폼 초기값 설정
      const initialFormValues: any = {};
      if (accCode) initialFormValues.asAccCde = accCode;
      if (initialSearch?.asCstPayYn) {
        initialFormValues.asCstPayYn = initialSearch.asCstPayYn === 'Y';
      }

      form.setFieldsValue(initialFormValues);

      const initialRequest = createSearchRequest(accCode, initialSearch?.asCstPayYn === 'Y');
      fetchAccountList(initialRequest);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
              name="asAccCde"
              label="계정코드"
              placeholder="계정코드를 입력하세요"
              onPressEnter={() => handleSearch(form.getFieldsValue())}
            />
            <FormCheckbox name="asCstPayYn" label="지결표시여부" />
          </SearchActions>
        </div>
        <div className="modal-body__content">
          <FormAgGrid<AcntInqirePopupListResponseWithId>
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

export default AcntInqirePopup;

