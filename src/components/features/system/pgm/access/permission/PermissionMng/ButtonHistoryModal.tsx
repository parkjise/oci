/*
 * 프로젝트 명  : ONERP
 * 파일 명     : ButtonHistoryModal.tsx
 * 설명        : 버튼 권한 변경 이력 조회 모달 (디자인 통일)
 * 변경이력    :
 * - 2026.01.02 : ckkim (최초작성 및 디자인 개선)
 */
import React, { useEffect, useCallback, useMemo } from "react";
import { Modal, Form } from "antd";
import { 
    FormAgGrid, 
    SearchForm, 
    FormDatePicker, 
    FormRadioGroup, 
    FormInput,
    ActionButtonGroup
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import type { ColDef } from "ag-grid-community";
import dayjs from "dayjs";

interface ButtonHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    roleNo: string;
    pgmNo: string;
    pgmName: string;
}

const ButtonHistoryModal: React.FC<ButtonHistoryModalProps> = ({ 
    visible, 
    onClose, 
    roleNo, 
    pgmNo,
    pgmName
}) => {
    const { t } = useTranslation();
    const { buttonHistoryList, fetchButtonHistory } = usePermissionMngStore();
    const [form] = Form.useForm();

    const handleSearch = useCallback(async (values: any) => {
        if (!roleNo || !pgmNo) return;
        
        const params: any = {
            hisType: values.hisType,
            description: values.description,
        };

        if (values.dateRange && values.dateRange.length === 2) {
            params.dateFr = values.dateRange[0].format("YYYY-MM-DD");
            params.dateTo = values.dateRange[1].format("YYYY-MM-DD");
        }

        await fetchButtonHistory(roleNo, pgmNo, params);
    }, [roleNo, pgmNo, fetchButtonHistory]);

    useEffect(() => {
        if (visible && roleNo && pgmNo) {
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
            fetchButtonHistory(roleNo, pgmNo, initialParams);
        }
    }, [visible, roleNo, pgmNo, fetchButtonHistory, form]);

    const columnDefs = useMemo<ColDef[]>(() => [
        { 
            headerName: "No.", 
            valueGetter: "node.rowIndex + 1", 
            width: 70, 
            maxWidth: 70,
            pinned: 'left',
            cellStyle: { textAlign: 'center' }
        },
        { 
            headerName: t("변경일시"), 
            field: "hisDate", 
            width: 170,
            valueFormatter: (params) => params.value ? dayjs(params.value).format("YYYY-MM-DD HH:mm:ss") : ""
        },
        { 
            headerName: t("타입"), 
            field: "hisType", 
            width: 80, 
            cellStyle: { textAlign: 'center' },
            valueFormatter: (params) => {
                const types: any = { 'I': 'Insert', 'U': 'Update', 'D': 'Delete' };
                return types[params.value] || params.value;
            }
        },
        { headerName: t("변경자"), field: "hisUser", width: 100 },
        { headerName: t("객체명"), field: "objName", width: 130 },
        { headerName: t("객체ID"), field: "objectId", width: 130 },
        { 
            headerName: t("권한유무"), 
            field: "roleEnabled", 
            width: 80, 
            cellStyle: { textAlign: 'center' }
        },
        { headerName: t("변경사유"), field: "description", width: 250, flex: 1 },
    ], [t]);

    const typeOptions = [
        { label: t('전체'), value: "" },
        { label: 'Insert', value: 'I' },
        { label: 'Update', value: 'U' },
        { label: 'Delete', value: 'D' },
    ];

    return (
        <Modal
            title={`${t("버튼 권한 히스토리")} (${pgmNo} - ${pgmName})`}
            open={visible}
            onCancel={onClose}
            width={1200}
            destroyOnClose
            footer={[
                <ActionButtonGroup 
                    key="actions"
                    hideButtons={["create", "edit", "copy", "delete", "save"]}
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
                        />
                        <FormInput 
                            name="description" 
                            label={t("검색어")} 
                            placeholder={t("객체명 또는 사유")}
                            onPressEnter={() => form.submit()}
                        />
                    </SearchForm>
                </div>
                
                <div className="modal-body__content">
                    <FormAgGrid
                        columnDefs={columnDefs}
                        rowData={buttonHistoryList}
                        height={500}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ButtonHistoryModal;
