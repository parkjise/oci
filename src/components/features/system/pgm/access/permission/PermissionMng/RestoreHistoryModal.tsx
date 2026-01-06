/*
 * 프로젝트 명  : ONERP
 * 파일 명     : RestoreHistoryModal.tsx
 * 설명        : 권한 변경 이력 및 복구 모달 (AS-IS 디자인 반영)
 */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal, Form } from "antd";
import { 
    FormAgGrid, 
    SearchForm, 
    FormDatePicker, 
    FormRadioGroup, 
    FormInput,
    ActionButtonGroup,
    FormButton
} from "@components/ui/form";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import type { ColDef, GridApi } from "ag-grid-community";
import dayjs from "dayjs";

interface RestoreHistoryModalProps {
    open: boolean;
    onClose: () => void;
    onRestore: (selectedItems: any[]) => void;
    type: 'USER' | 'MENU';
}

const RestoreHistoryModal: React.FC<RestoreHistoryModalProps> = ({ open, onClose, onRestore, type }) => {
    const { t } = useTranslation();
    const { historyList, fetchRoleHistory, selectedRole } = usePermissionMngStore();
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [form] = Form.useForm();

    const handleSearch = useCallback(async (values: any) => {
        if (!selectedRole) return;
        
        const params: any = {
            hisType: values.hisType,
            description: values.description,
        };

        if (values.dateRange && values.dateRange.length === 2) {
            params.dateFr = values.dateRange[0].format("YYYY-MM-DD");
            params.dateTo = values.dateRange[1].format("YYYY-MM-DD");
        }

        await fetchRoleHistory(selectedRole.roleNo, type, params);
    }, [selectedRole, type, fetchRoleHistory]);

    useEffect(() => {
        if (open && selectedRole) {
            // 초기 조회 (기본 날짜 범위 설정: 오늘 ~ 오늘, 타입: 전체)
            const initialParams = {
                dateFr: dayjs().format("YYYY-MM-DD"),
                dateTo: dayjs().format("YYYY-MM-DD"),
                hisType: ""
            };
            form.setFieldsValue({
                dateRange: [dayjs(), dayjs()],
                hisType: "",
                description: ""
            });
            fetchRoleHistory(selectedRole.roleNo, type, initialParams);
        }
    }, [open, selectedRole, type, fetchRoleHistory, form]);

    const columnDefs = useMemo<ColDef[]>(() => {
        const commonCols: ColDef[] = [
            { 
                headerName: "No.", 
                valueGetter: "node.rowIndex + 1", 
                width: 80, 
                maxWidth: 80,
                pinned: 'left',
                cellStyle: { textAlign: 'center' }
            },
            { headerName: "", checkboxSelection: true, headerCheckboxSelection: true, width: 60, maxWidth: 60, pinned: 'left' },
            { 
                headerName: t("Transfered Date"), 
                field: "insDate", 
                width: 180,
                minWidth: 180,
                valueFormatter: (params) => params.value ? dayjs(params.value).format("YYYY-MM-DD HH:mm:ss") : ""
            },
            { headerName: t("변경타입"), field: "histType", width: 90, cellStyle: { textAlign: 'center' } },
            { headerName: t("변경자"), field: "insUserId", width: 100 },
            { headerName: t("Reason"), field: "reason", width: 250 },
        ];

        if (type === 'MENU') {
            return [
                ...commonCols,
                { headerName: t("메뉴번호"), field: "pgmNo", width: 100 },
                { headerName: t("메뉴명"), field: "pgmName", width: 180 },
                { headerName: t("메뉴ID"), field: "windowId", width: 150 },
                { headerName: t("메뉴타입"), field: "pgmType", width: 100 },
            ];
        } else {
            return [
                ...commonCols,
                { headerName: t("직원번호"), field: "typeId", width: 100 },
                { headerName: t("직원명"), field: "typeName", width: 120 },
            ];
        }
    }, [t, type]);

    const handleRestore = () => {
        const selectedRows = gridApi?.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            Modal.warning({ title: t("선택 확인"), content: t("복구할 항목을 선택하세요.") });
            return;
        }
        onRestore(selectedRows);
        onClose();
    };

    const typeOptions = [
        { label: t('전체'), value: "" },
        { label: 'Insert', value: 'I' },
        { label: 'Update', value: 'U' },
        { label: 'Delete', value: 'D' },
    ];

    return (
        <Modal
            title={type === 'USER' ? t("권한사용자 히스토리") : t("권한메뉴 히스토리")}
            open={open}
            onCancel={onClose}
            width={1300}
            destroyOnClose
            footer={[
                <ActionButtonGroup 
                    key="actions"
                    hideButtons={["create", "edit", "copy", "delete", "save"]}
                    customButtons={[
                        <FormButton key="save" type="primary" onClick={handleRestore}>{t("저장")}</FormButton>
                    ]}
                />
            ]}
            className="modal-layout"
        >
            <div className="modal-body">
                <div className="modal-body__header">
                    <SearchForm 
                        form={form} 
                        onSearch={handleSearch}
                        showExpand={false}
                        columnsPerRow={3}
                        visibleRows={1}
                        className="modal-body__actions"
                    >
                        <FormDatePicker 
                            name="dateRange" 
                            label={t("변경일")} 
                            isRange 
                        />
                        <FormRadioGroup 
                            name="hisType" 
                            label={t("타입")} 
                            options={typeOptions} 
                            style={{ whiteSpace: 'nowrap' }}
                        />
                        <FormInput 
                            name="description" 
                            label={t("검색어")} 
                            placeholder={t("변경사유 입력")}
                            onPressEnter={() => form.submit()}
                        />
                    </SearchForm>
                </div>
                
                <div className="modal-body__content">
                    <FormAgGrid
                        columnDefs={columnDefs}
                        rowData={historyList}
                        rowSelection="multiple"
                        onGridReady={(params) => setGridApi(params.api)}
                        height={500}
                        idField="id"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default RestoreHistoryModal;
