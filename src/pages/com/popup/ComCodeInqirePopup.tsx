/**
 * Common Code 조회 팝업 (Common Code Inquiry Popup)
 *
 * @description 시스템 공통 코드 조회를 위한 팝업 컴포넌트
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
import { selectComCodeInqirePopupList } from "@apis/com/popup";
import type {
    ComCodeInqirePopupSrchRequest,
    ComCodeInqirePopupListResponse,
} from "@/types/com/popup/ComCodeInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";
import { isEmpty } from "@utils/stringUtils";

export type SelectedComCode = ComCodeInqirePopupListResponse;

type ComCodeInqirePopupListResponseWithId = ComCodeInqirePopupListResponse & {
    id?: string;
};

interface ComCodeInqirePopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 코드유형 (필수) */
    asCodeTy?: string;
    /** 세그먼트2 */
    asSgmt2?: string;
    /** 초기 코드/명 */
    initialCode?: string;
    /** 초기 검색 조건 */
    initialSearch?: Partial<ComCodeInqirePopupSrchRequest>;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const ComCodeInqirePopup: React.FC<
    ComCodeInqirePopupProps & InjectedProps<SelectedComCode>
> = ({
    asOfficeId,
    asCodeTy,
    asSgmt2,
    initialCode,
    initialSearch,
    returnValue,
    close: _close,
    onConfirm,
}) => {
        void _close;
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<ComCodeInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        const addIdToData = useCallback(
            (
                data: ComCodeInqirePopupListResponse[]
            ): ComCodeInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: item.code || `row-${index}`,
                }));
            },
            []
        );

        const createSearchRequest = useCallback(
            (asSrchKwrd?: string): ComCodeInqirePopupSrchRequest => {
                return {
                    asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
                    asCodeTy: asCodeTy || initialSearch?.asCodeTy || "",
                    asSgmt2: asSgmt2 || initialSearch?.asSgmt2,
                    asSrchKwrd: !isEmpty(asSrchKwrd)
                        ? asSrchKwrd
                        : initialCode || initialSearch?.asSrchKwrd,
                };
            },
            [asOfficeId, asCodeTy, asSgmt2, initialCode, initialSearch]
        );

        // 공통코드 목록 조회 함수
        const fetchComCodeList = useCallback(
            async (request: ComCodeInqirePopupSrchRequest) => {
                try {
                    const response = await selectComCodeInqirePopupList(request);
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
                await fetchComCodeList(request);
            },
            [createSearchRequest, fetchComCodeList]
        );

        const columnDefs: ExtendedColDef<ComCodeInqirePopupListResponseWithId>[] = [
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
                headerName: "상세기타구분", // Legacy: 상세기타구분
                width: 120,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "codeNme",
                headerName: "코드명", // Legacy: 코드명
                width: 200,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "sgmt5",
                headerName: "설명", // Legacy: 설명
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
                flex: 1,
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: ComCodeInqirePopupListResponseWithId }) => {
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

            fetchComCodeList(initialRequest);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <div className="modal-body">
                <div className="modal-body__header">
                    <SearchActions
                        form={form}
                        onSearch={handleSearch}
                        visibleRows={1}
                        columnsPerRow={1}
                        resetExpandOnReset={true}
                        className="modal-body__actions"
                    >
                        <FormInput
                            name="asSrchKwrd"
                            label="검색어"
                            placeholder="코드 또는 명을 입력하세요"
                            style={{ width: "250px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<ComCodeInqirePopupListResponseWithId>
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

export default ComCodeInqirePopup;
