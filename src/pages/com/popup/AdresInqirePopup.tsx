
/**
 * 주소 조회 팝업 (Address Inquiry Popup)
 *
 * @description 주소 조회를 위한 팝업 컴포넌트
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
import { selectAdresInqirePopupList } from "@apis/com/popup";
import type {
    AdresInqirePopupSrchRequest,
    AdresInqirePopupListResponse,
} from "@/types/com/popup/AdresInqirePopup.types";
import { showError, error } from "@components/ui/feedback";
import type { InjectedProps } from "@/components/ui/feedback/Modal/PageModal";
import { isEmpty } from "@utils/stringUtils";

export type SelectedAdres = AdresInqirePopupListResponse;

type AdresInqirePopupListResponseWithId = AdresInqirePopupListResponse & {
    id?: string;
};

interface AdresInqirePopupProps {
    /** 초기 주소 검색어 */
    initialKeyword?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}

const AdresInqirePopup: React.FC<
    AdresInqirePopupProps & InjectedProps<SelectedAdres>
> = ({
    initialKeyword,
    returnValue,
    close: _close,
    onConfirm,
}) => {
        void _close;
        const gridApiRef = useRef<GridApi | null>(null);
        const [rowData, setRowData] = useState<AdresInqirePopupListResponseWithId[]>(
            []
        );
        const [form] = Form.useForm();
        const hasInitialized = useRef(false);

        const onGridReady = createGridReadyHandlerRef(gridApiRef);

        const addIdToData = useCallback(
            (
                data: AdresInqirePopupListResponse[]
            ): AdresInqirePopupListResponseWithId[] => {
                return data.map((item, index) => ({
                    ...item,
                    id: item.zipNo + item.roadAddr || `row-${index}`, // 유니크 키 조합
                }));
            },
            []
        );

        const createSearchRequest = useCallback(
            (keyword?: string): AdresInqirePopupSrchRequest => {
                return {
                    keyword: !isEmpty(keyword) ? keyword! : "",
                    currentPage: 1, // 페이징 처리가 필요하다면 상태 관리 필요. 현재는 1페이지 고정 (API 구조상)
                    countPerPage: 50, // 넉넉하게 50건 조회
                    resultType: "json",
                };
            },
            []
        );

        // 주소 목록 조회 함수
        const fetchAdresList = useCallback(
            async (request: AdresInqirePopupSrchRequest) => {
                if (!request.keyword) {
                    // 검색어가 없으면 조회 안함 (주소 API 특성상 전체 조회 불가)
                    return;
                }
                try {
                    const response = await selectAdresInqirePopupList(request);
                    if (response.success && response.data) {
                        setRowData(addIdToData(response.data));
                    } else {
                        // 에러 메시지가 있으면 보여주고, 없으면 목록 비움 (검색 결과 없음 등)
                        if (response.message) {
                            showError(response.message);
                        }
                        setRowData([]);
                    }
                } catch {
                    showError("주소 조회 중 오류가 발생했습니다.");
                }
            },
            [addIdToData]
        );

        const handleSearch = useCallback(
            async (values: Record<string, unknown>) => {
                const keyword = values.keyword as string | undefined;
                if (!keyword) {
                    showError("검색어를 입력하세요.");
                    return;
                }
                const request = createSearchRequest(keyword);
                await fetchAdresList(request);
            },
            [createSearchRequest, fetchAdresList]
        );

        const columnDefs: ExtendedColDef<AdresInqirePopupListResponseWithId>[] = [
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
                field: "roadAddr",
                headerName: "도로명주소",
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "jibunAddr",
                headerName: "지번주소",
                width: 300,
                sortable: true,
                filter: true,
                headerAlign: "center",
            },
            {
                field: "zipNo",
                headerName: "우편번호",
                width: 100,
                sortable: true,
                filter: true,
                headerAlign: "center",
                cellStyle: { textAlign: "center" },
            },
        ];

        const handleRowDoubleClick = useCallback(
            (event: { data: AdresInqirePopupListResponseWithId }) => {
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
                error({ content: "주소를 선택해주세요.", title: "안내" });
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

            const keyword = initialKeyword;

            if (keyword) {
                form.setFieldsValue({ keyword: keyword });
                const initialRequest = createSearchRequest(keyword);
                fetchAdresList(initialRequest);
            }
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
                            name="keyword"
                            label="주소 검색"
                            placeholder="도로명, 지번, 건물명 입력"
                            style={{ width: "300px" }}
                            onPressEnter={() => handleSearch(form.getFieldsValue())}
                        />
                    </SearchActions>
                </div>
                <div className="modal-body__content">
                    <FormAgGrid<AdresInqirePopupListResponseWithId>
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

export default AdresInqirePopup;
