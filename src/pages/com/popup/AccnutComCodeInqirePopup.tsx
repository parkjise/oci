/**
 * 회계공통코드 조회 팝업 (Accounting Common Code Inquiry Popup)
 *
 * @description 회계 공통 코드 조회를 위한 팝업 컴포넌트
 * @author LeeSangChan
 * @date 2025-12-23
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "antd";
import type { GridApi } from "ag-grid-community";
import {
    FormInput,
    SearchActions,
    FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import { selectAccnutComCodeInqirePopupList } from "@apis/com/popup";
import type {
    AccnutComCodeInqirePopupSrchRequest,
    AccnutComCodeInqirePopupListResponse,
} from "@/types/com/popup/AccnutComCodeInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";
import { isEmpty } from "@utils/stringUtils";

export type SelectedAccnutComCode = AccnutComCodeInqirePopupListResponse;

type AccnutComCodeInqirePopupListResponseWithId = AccnutComCodeInqirePopupListResponse & {
    id?: string;
};

interface AccnutComCodeInqirePopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 코드유형 (필수) */
    asCodeTy?: string;
    /** 모듈 */
    asModule?: string;
    /** 초기 코드/명 */
    initialCode?: string;
    /** 초기 검색 조건 */
    initialSearch?: Partial<AccnutComCodeInqirePopupSrchRequest>;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const AccnutComCodeInqirePopup: React.FC<
    AccnutComCodeInqirePopupProps & InjectedProps<SelectedAccnutComCode>
> = ({
    asOfficeId,
    asCodeTy,
    asModule,
    initialCode,
    initialSearch,
    returnValue,
    close: _close,
    onConfirm,
}) => {
        void _close;
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<AccnutComCodeInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        const addIdToData = useCallback(
            (
                data: AccnutComCodeInqirePopupListResponse[]
            ): AccnutComCodeInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: item.code || `row-${index}`,
                }));
            },
            []
        );

        const createSearchRequest = useCallback(
            (asSrchKwrd?: string): AccnutComCodeInqirePopupSrchRequest => {
                return {
                    asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
                    asCodeTy: asCodeTy || initialSearch?.asCodeTy || "",
                    asModule: asModule || initialSearch?.asModule,
                    asSrchKwrd: !isEmpty(asSrchKwrd)
                        ? asSrchKwrd
                        : initialCode || initialSearch?.asSrchKwrd,
                };
            },
            [asOfficeId, asCodeTy, asModule, initialCode, initialSearch]
        );

        // 회계공통코드 목록 조회 함수
        const fetchAccnutComCodeList = useCallback(
            async (request: AccnutComCodeInqirePopupSrchRequest) => {
                try {
                    const response = await selectAccnutComCodeInqirePopupList(request);
                    if (response.success && response.data) {
                        setRowData(addIdToData(response.data));
                    } else {
                        showError(response.message || "코드조회에 실패했습니다.");
                    }
                } catch {
                    showError("코드조회 중 오류가 발생했습니다.");
                }
            },
            [addIdToData]
        );

        const handleSearch = useCallback(
            async (values: Record<string, unknown>) => {
                const asSrchKwrd = values.asSrchKwrd as string | undefined;
                const request = createSearchRequest(asSrchKwrd);
                await fetchAccnutComCodeList(request);
            },
            [createSearchRequest, fetchAccnutComCodeList]
        );

        const columnDefs: ExtendedColDef<AccnutComCodeInqirePopupListResponseWithId>[] = [
            {
                headerName: "No.",
                minWidth: 50,
                maxWidth: 50,
                width: 50,
                valueGetter: (params) => {
                    if (params.node?.rowIndex !== null) {
                        return (params.node?.rowIndex ?? 0) + 1;
                    }
                    return "";
                },
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "code",
                headerName: "코드구분",
                width: 90,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "codeTy",
                headerName: "기타코드",
                width: 100,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "codeNme",
                headerName: "기타코드명",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "codeDesc",
                headerName: "기타코드 세부설명",
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt1",
                headerName: "상세정보1",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt2",
                headerName: "상세정보2",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt3",
                headerName: "상세정보3",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt4",
                headerName: "상세정보4",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt5",
                headerName: "상세정보5",
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: AccnutComCodeInqirePopupListResponseWithId }) => {
                if (!event.data || !returnValue) return;
                returnValue(event.data);
                close?.();
            },
            [returnValue, close]
        );

        const handleConfirm = useCallback(() => {
            if (!gridApiRef.current || !returnValue) return;

            const selectedRows = gridApiRef.current.getSelectedRows();
            if (selectedRows.length === 0) {
                error({ content: "코드를 선택해주세요.", title: "안내" });
                return;
            }

            returnValue(selectedRows[0]);
            close?.();
        }, [returnValue, close]);

        useEffect(() => {
            onConfirm?.(handleConfirm);
        }, [onConfirm, handleConfirm]);

        useEffect(() => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            const kwrd = initialCode || initialSearch?.asSrchKwrd;
            const initialRequest = createSearchRequest(kwrd);

            if (kwrd) {
                form.setFieldsValue({ asSrchKwrd: kwrd });
            }

            // sType (코드유형)은 보통 넘겨받아서 고정값으로 사용하지만, 화면상 보여주기 위해 세팅
            if (asCodeTy || initialSearch?.asCodeTy) {
                form.setFieldsValue({ asCodeTy: asCodeTy || initialSearch?.asCodeTy });
            }

            fetchAccnutComCodeList(initialRequest);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <div className="modal-body">
                <div className="modal-body__header">
                    <SearchActions
                        form={form}
                        onSearch={handleSearch}
                        visibleRows={1}
                        columnsPerRow={2} // 검색어와 Type 두개 보여주기 위해
                        resetExpandOnReset={true}
                        className="modal-body__actions"
                    >
                        <FormInput
                            name="asSrchKwrd"
                            label="검색어"
                            placeholder="검색어를 입력하세요."
                            style={{ width: "210px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                        <FormInput
                            name="asCodeTy"
                            label="Type"
                            placeholder="Type"
                            style={{ width: "250px" }}
                            disabled={true}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<AccnutComCodeInqirePopupListResponseWithId>
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

export default AccnutComCodeInqirePopup;
