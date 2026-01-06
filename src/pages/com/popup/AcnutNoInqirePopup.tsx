/**
 * AcnutNo(계좌번호) 조회 팝업 (Account Number Inquiry Popup)
 *
 * @description 시스템 공통 계좌 번호 조회를 위한 팝업 컴포넌트
 * @reference 구시스템: selectAcctnbrList.xml, fcmPop_mapper.xml (selectAcctnbrList 쿼리)
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
import { selectAcnutNoInqirePopupList } from "@apis/com/popup";
import type {
    AcnutNoInqirePopupSrchRequest,
    AcnutNoInqirePopupListResponse,
} from "@/types/com/popup/AcnutNoInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";

export type SelectedAcnutNo = AcnutNoInqirePopupListResponse;

type AcnutNoInqirePopupListResponseWithId = AcnutNoInqirePopupListResponse & {
    id?: string;
};

interface AcnutNoInqirePopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 초기 은행코드/계좌번호 */
    initialBankCode?: string;
    /** 초기 통화 */
    initialCurrency?: string;
    /** 초기 계정코드 */
    initialAccCode?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const AcnutNoInqirePopup: React.FC<
    AcnutNoInqirePopupProps & InjectedProps<SelectedAcnutNo>
> = ({
    asOfficeId,
    initialBankCode,
    initialCurrency,
    initialAccCode,
    returnValue,
    close,
    onConfirm,
}) => {
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<AcnutNoInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        // 데이터 변환 헬퍼 함수
        const createSelectedData = useCallback(
            (data: AcnutNoInqirePopupListResponseWithId): SelectedAcnutNo => ({
                officeId: data.officeId,
                bankCode: data.bankCode,
                seq: data.seq,
                bankName: data.bankName,
                bankRgnName: data.bankRgnName,
                accNbr: data.accNbr,
                accCode: data.accCode,
                userId: data.userId,
                wrkDate: data.wrkDate,
                accNbrName: data.accNbrName,
                accNbrCode: data.accNbrCode,
                currency: data.currency,
                orgId: data.orgId,
                dvs: data.dvs,
            }),
            []
        );

        const addIdToData = useCallback(
            (
                data: AcnutNoInqirePopupListResponse[]
            ): AcnutNoInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: `${item.bankCode}-${item.accNbr}-${index}`,
                }));
            },
            []
        );

        // 목록 조회 함수
        const fetchList = useCallback(
            async (request: AcnutNoInqirePopupSrchRequest) => {
                try {
                    const response = await selectAcnutNoInqirePopupList(request);
                    if (response.success && response.data) {
                        setRowData(addIdToData(response.data));
                    } else {
                        showError(response.message || "계좌조회에 실패했습니다.");
                    }
                } catch {
                    showError("계좌조회 중 오류가 발생했습니다.");
                }
            },
            [addIdToData]
        );

        const handleSearch = useCallback(
            async (values: Record<string, unknown>) => {
                const request: AcnutNoInqirePopupSrchRequest = {
                    asOfficeId: asOfficeId || "OSE",
                    asBankCode: values.asBankCode as string,
                    asCurrency: initialCurrency,
                    asAccCode: initialAccCode,
                };
                await fetchList(request);
            },
            [asOfficeId, initialCurrency, initialAccCode, fetchList]
        );

        const columnDefs: ExtendedColDef<AcnutNoInqirePopupListResponseWithId>[] = [
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
                headerName: "은행",
                width: 100,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "bankName",
                headerName: "은행명",
                width: 150,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "accNbrName",
                headerName: "계좌명",
                width: 250,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "accNbr",
                headerName: "계좌번호",
                width: 180,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "accCode",
                headerName: "계정코드",
                width: 120,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
            {
                field: "currency",
                headerName: "통화",
                width: 80,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: AcnutNoInqirePopupListResponseWithId }) => {
                if (!event.data || !returnValue) return;
                returnValue(createSelectedData(event.data));
                close?.();
            },
            [returnValue, createSelectedData, close]
        );

        // 확인 버튼 클릭 시 호출할 함수
        const handleConfirm = useCallback(() => {
            if (!gridApiRef.current || !returnValue) return;

            const selectedRows = gridApiRef.current.getSelectedRows();
            if (selectedRows.length === 0) {
                error({ content: "항목을 선택해주세요.", title: "안내" });
                return;
            }

            returnValue(createSelectedData(selectedRows[0]));
            close?.();
        }, [returnValue, createSelectedData, close]);

        // onConfirm이 전달되면 handleConfirm을 등록
        useEffect(() => {
            onConfirm?.(handleConfirm);
        }, [onConfirm, handleConfirm]);

        // 초기 데이터 로드
        useEffect(() => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            if (initialBankCode) {
                form.setFieldsValue({ asBankCode: initialBankCode });
            }

            const initialRequest: AcnutNoInqirePopupSrchRequest = {
                asOfficeId: asOfficeId || "OSE",
                asBankCode: initialBankCode,
                asCurrency: initialCurrency,
                asAccCode: initialAccCode,
            };

            fetchList(initialRequest);
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
                            label="검색"
                            placeholder="은행코드 또는 계좌번호를 입력하세요"
                            style={{ width: "300px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<AcnutNoInqirePopupListResponseWithId>
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

export default AcnutNoInqirePopup;
