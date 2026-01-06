/**
 * 부가세유형 조회 팝업 (VAT Type Inquiry Popup)
 *
 * @description 부가세유형 조회를 위한 팝업 컴포넌트
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
import { selectVatTyInqirePopupList } from "@apis/com/popup";
import type {
    VatTyInqirePopupSrchRequest,
    VatTyInqirePopupListResponse,
} from "@/types/com/popup/VatTyInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";
import { isEmpty } from "@utils/stringUtils";

export type SelectedVatTy = VatTyInqirePopupListResponse;

type VatTyInqirePopupListResponseWithId = VatTyInqirePopupListResponse & {
    id?: string;
};

interface VatTyInqirePopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 부가세코드 */
    asTaxCode?: string;
    /** 부가세유형 (모듈) */
    asTaxTy?: string;
    /** 초기 코드 */
    initialCode?: string;
    /** 초기 검색 조건 */
    initialSearch?: Partial<VatTyInqirePopupSrchRequest>;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const VatTyInqirePopup: React.FC<
    VatTyInqirePopupProps & InjectedProps<SelectedVatTy>
> = ({
    asOfficeId,
    asTaxCode,
    asTaxTy,
    initialCode,
    initialSearch,
    returnValue,
    close: _close,
    onConfirm,
}) => {
        void _close;
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<VatTyInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        const addIdToData = useCallback(
            (
                data: VatTyInqirePopupListResponse[]
            ): VatTyInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: item.taxCode || `row-${index}`,
                }));
            },
            []
        );

        const createSearchRequest = useCallback(
            (taxCode?: string): VatTyInqirePopupSrchRequest => {
                return {
                    asOfficeId: asOfficeId || initialSearch?.asOfficeId || "OSE",
                    asTaxCode: !isEmpty(taxCode)
                        ? taxCode
                        : asTaxCode || initialCode || initialSearch?.asTaxCode,
                    asTaxTy: asTaxTy || initialSearch?.asTaxTy,
                };
            },
            [asOfficeId, asTaxTy, asTaxCode, initialCode, initialSearch]
        );

        // 부가세유형 목록 조회 함수
        const fetchVatTyList = useCallback(
            async (request: VatTyInqirePopupSrchRequest) => {
                try {
                    const response = await selectVatTyInqirePopupList(request);
                    if (response.success && response.data) {
                        setRowData(addIdToData(response.data));
                    } else {
                        showError(response.message || "부가세유형 조회에 실패했습니다.");
                    }
                } catch {
                    showError("부가세유형 조회 중 오류가 발생했습니다.");
                }
            },
            [addIdToData]
        );

        const handleSearch = useCallback(
            async (values: Record<string, unknown>) => {
                const taxCode = values.asTaxCode as string | undefined;
                const request = createSearchRequest(taxCode);
                await fetchVatTyList(request);
            },
            [createSearchRequest, fetchVatTyList]
        );

        const columnDefs: ExtendedColDef<VatTyInqirePopupListResponseWithId>[] = [
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
                field: "taxCode",
                headerName: "코드",
                width: 80,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "taxName",
                headerName: "부가세명",
                width: 120,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "description",
                headerName: "설명", // 화면 헤더명 '비고' or '설명'? Legacy grid mapping says "설명" for DESCRIPTION, but displayed "비고" in column text. Legacy grid ID=DESCRIPTION name=비고, ID=REMARK name=적요.
                // But XML dlt_vatCode has: DESCRIPTION(비고), REMARK(적요).
                // Grid header row: column11(설명) -> which maps to ? Let's check dlt_vatCode fields map.
                // In legacy XML grid row:
                // taxCode -> id=TAX_CODE
                // taxName -> id=TAX_NAME
                // remark -> id=REMARK
                // taxRate -> id=TAX_RATE
                // accountCode -> id=ACCOUNT_CODE
                // description -> id=DESCRIPTION
                //
                // Grid Header Labels in XML:
                // "코드", "부가세명", "설명", "세율", "계정코드", "비고"
                // Mapping:
                // "설명" column -> id=REMARK (Wait, line 181: col id=REMARK match column11(Header "설명"))
                // "비고" column -> id=DESCRIPTION (Wait, line 184: col id=DESCRIPTION match column16(Header "비고"))
                // So:
                // taxCode = 코드
                // taxName = 부가세명
                // remark = 설명
                // taxRate = 세율
                // accountCode = 계정코드
                // description = 비고
                //
                // I will use these labels.
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
                flex: 1,
            },
            {
                field: "taxRate",
                headerName: "세율",
                width: 80,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "right" },
            },
            {
                field: "accountCode",
                headerName: "계정코드",
                width: 100,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "remark",
                headerName: "비고",
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: VatTyInqirePopupListResponseWithId }) => {
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
                error({ content: "부가세유형을 선택해주세요.", title: "안내" });
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

            const code = asTaxCode || initialCode || initialSearch?.asTaxCode;
            const initialRequest = createSearchRequest(code);

            if (code) {
                form.setFieldsValue({ asTaxCode: code });
            }

            fetchVatTyList(initialRequest);
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
                            name="asTaxCode"
                            label="검색"
                            placeholder="코드 또는 부가세명을 입력하세요"
                            style={{ width: "300px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<VatTyInqirePopupListResponseWithId>
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

export default VatTyInqirePopup;
