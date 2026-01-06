/**
 * BankCode 조회 팝업 (BankCode Inquiry Popup)
 *
 * @description 시스템 공통 은행 코드 조회를 위한 팝업 컴포넌트
 * @author LeeSangChan
 * @date 2025-12-22
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
import { selectBankCodeInqirePopupList } from "@apis/com/popup";
import type {
    BankCodeInqirePopupSrchRequest,
    BankCodeInqirePopupListResponse,
} from "@/types/com/popup/BankCodeInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";

export type SelectedBankCode = BankCodeInqirePopupListResponse;

type BankCodeInqirePopupListResponseWithId = BankCodeInqirePopupListResponse & {
    id?: string;
};

interface BankCodeInqirePopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 초기 은행코드 */
    initialBankCode?: string;
    /** 초기 검색 조건 (하위 호환성 유지) */
    initialSearch?: Partial<BankCodeInqirePopupSrchRequest>;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const BankCodeInqirePopup: React.FC<
    BankCodeInqirePopupProps & InjectedProps<SelectedBankCode>
> = ({
    asOfficeId,
    initialBankCode,
    initialSearch,
    returnValue,
    close: _close,
    onConfirm,
}) => {
        void _close;
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<BankCodeInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        // 은행 데이터 변환 헬퍼 함수
        const createBankData = useCallback(
            (data: BankCodeInqirePopupListResponseWithId): BankCodeInqirePopupListResponse => ({
                officeId: data.officeId,
                bankCode: data.bankCode,
                bankNm: data.bankNm,
                bankBhfNm: data.bankBhfNm,
                reprsntAcnut: data.reprsntAcnut,
            }),
            []
        );

        const addIdToData = useCallback(
            (
                data: BankCodeInqirePopupListResponse[]
            ): BankCodeInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: item.bankCode || `row-${index}`,
                }));
            },
            []
        );

        const createSearchRequest = useCallback(
            (asBankCode?: string): BankCodeInqirePopupSrchRequest => {
                return {
                    asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
                    asBankCode: asBankCode
                };
            },
            [asOfficeId, initialSearch]
        );

        // 은행 목록 조회 함수
        const fetchBankList = useCallback(
            async (request: BankCodeInqirePopupSrchRequest) => {
                try {
                    const response = await selectBankCodeInqirePopupList(request);
                    if (response.success && response.data) {
                        setRowData(addIdToData(response.data));
                    } else {
                        showError(response.message || "은행조회에 실패했습니다.");
                    }
                } catch {
                    showError("은행조회 중 오류가 발생했습니다.");
                }
            },
            [addIdToData]
        );

        const handleSearch = useCallback(
            async (values: Record<string, unknown>) => {
                const asBankCode = values.asBankCode as string | undefined;
                const request = createSearchRequest(asBankCode);
                await fetchBankList(request);
            },
            [createSearchRequest, fetchBankList]
        );

        const columnDefs: ExtendedColDef<BankCodeInqirePopupListResponseWithId>[] = [
            {
                headerName: "No.",
                minWidth: 70,
                maxWidth: 70,
                width: 70,
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
                field: "bankCode",
                headerName: "은행코드",
                width: 120,
                minWidth: 120,
                maxWidth: 120,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "bankNm",
                headerName: "은행명",
                width: 180,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "bankBhfNm",
                headerName: "지점",
                width: 200,
                sortable: true,
                filter: true,
                flex: 1,
                headerAlign: "center",
            },
            {
                field: "reprsntAcnut",
                headerName: "대표계좌",
                width: 150,
                sortable: true,
                filter: true,
                headerAlign: "center",
                hide: true, // 구시스템에서 hidden이었으므로 기본적으로 숨김 처리
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: BankCodeInqirePopupListResponseWithId }) => {
                if (!event.data || !returnValue) return;
                returnValue(createBankData(event.data));
                close?.();
            },
            [returnValue, createBankData]
        );

        // 확인 버튼 클릭 시 호출할 함수
        const handleConfirm = useCallback(() => {
            if (!gridApiRef.current || !returnValue) return;

            const selectedRows = gridApiRef.current.getSelectedRows();
            if (selectedRows.length === 0) {
                error({ content: "은행을 선택해주세요.", title: "안내" });
                return;
            }

            returnValue(createBankData(selectedRows[0]));
            close?.();
        }, [returnValue, createBankData, close]);

        // onConfirm이 전달되면 handleConfirm을 등록
        useEffect(() => {
            onConfirm?.(handleConfirm);
        }, [onConfirm, handleConfirm]);

        // 초기 데이터 로드
        useEffect(() => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            const bankCode = initialBankCode || initialSearch?.asBankCode;
            const initialRequest = createSearchRequest(bankCode);

            if (bankCode) {
                form.setFieldsValue({ asBankCode: bankCode });
            }

            fetchBankList(initialRequest);
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
                            name="asBankCode"
                            label="은행코드/명"
                            placeholder="은행코드 또는 명을 입력하세요"
                            style={{ width: "250px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<BankCodeInqirePopupListResponseWithId>
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

export default BankCodeInqirePopup;
