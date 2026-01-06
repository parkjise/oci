/*
 * 프로젝트 명  : ONERP
 * 파일 명     : ButtonPermissionModal.tsx
 * 설명        : 버튼 권한 관리 모달
 * 변경이력    :
 * - 2025.12.31 : ckkim (최초작성)
 */
import React, { useEffect, useState } from "react";
import { Modal, Form, Descriptions, Divider } from "antd";
import { useTranslation } from "react-i18next";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { FormAgGrid, FormButton } from "@components/ui/form";
import { CheckboxCellRenderer } from "@components/ui/form/AgGrid/cells/CheckboxCellRenderer";
import { HistoryOutlined } from "@ant-design/icons";
import ChangeReasonModal from "./ChangeReasonModal";
import ButtonHistoryModal from "./ButtonHistoryModal";
import type { RoleMenuDto, RoleMenuWinObjDto } from "@apis/system/pgm/access/permission/permissionApi";
import type { ColDef } from "ag-grid-community";

interface ButtonPermissionModalProps {
    visible: boolean;
    onClose: () => void;
    menu: RoleMenuDto;
}

export const ButtonPermissionModal: React.FC<ButtonPermissionModalProps> = ({ visible, onClose, menu }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { selectedRole, buttonList, fetchButtonList, saveButtonPermissions } = usePermissionMngStore();
    const [reasonModalVisible, setReasonModalVisible] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [gridApi, setGridApi] = useState<any>(null);

    const [initialButtons, setInitialButtons] = useState<RoleMenuWinObjDto[]>([]);

    useEffect(() => {
        if (visible && selectedRole && menu) {
            fetchButtonList(selectedRole.roleNo, menu.pgmNo);
        }
    }, [visible, selectedRole, menu, fetchButtonList]);

    // 백업본 생성 (초기 데이터 로드 시)
    useEffect(() => {
        if (buttonList) {
            setInitialButtons(JSON.parse(JSON.stringify(buttonList)));
        }
    }, [buttonList]);

    const handleSaveClick = () => {
        if (!gridApi || !initialButtons) return;

        let isChanged = false;
        gridApi.forEachNode((node: any) => {
            const original = initialButtons.find(b => b.objectId === node.data.objectId);
            if (original) {
                if (original.roleEnabled !== node.data.roleEnabled) {
                    isChanged = true;
                }
            }
        });

        if (!isChanged) {
            Modal.info({
                title: t("알림"),
                content: t("변경사항이 없습니다."),
            });
            return;
        }

        setReasonModalVisible(true);
    };

    const handleSave = async (reason: string) => {
        if (!selectedRole || !menu || !gridApi) return;
        
        const updatedButtons: RoleMenuWinObjDto[] = [];
        gridApi.forEachNode((node: any) => {
            const data = { ...node.data };
            // Ensure all enable flags match ROLE_ENABLED if record is being updated/saved
            const isEnabled = data.roleEnabled === 'Y';
            data.retrieveEnabled = isEnabled ? 'Y' : 'N';
            data.createEnabled = isEnabled ? 'Y' : 'N';
            data.updateEnabled = isEnabled ? 'Y' : 'N';
            data.deleteEnabled = isEnabled ? 'Y' : 'N';
            updatedButtons.push(data);
        });

        const success = await saveButtonPermissions(
            selectedRole.roleNo, 
            menu.pgmNo, 
            reason, 
            updatedButtons
        );

        if (success) {
            setReasonModalVisible(false);
            onClose();
        }
    };

    const columnDefs: ColDef[] = [
        {
            headerName: t("객체ID"),
            field: "objectId",
            width: 150,
            editable: false,
        },
        {
            headerName: t("객체명"),
            field: "objName",
            flex: 1,
            editable: false,
        },
        {
            headerName: t("권한유무"),
            field: "roleEnabled",
            width: 100,
            cellRenderer: CheckboxCellRenderer,
            cellRendererParams: {
                editable: true,
                convertYN: true,
            },
            editable: false, // Checkbox handles its own editing
        }
    ];

    return (
        <>
            <Modal
                title={t("버튼 권한 관리")}
                open={visible}
                onCancel={onClose}
                width={800}
                footer={[
                    <div key="actions" style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <FormButton 
                            icon={<HistoryOutlined />}
                            onClick={() => setHistoryModalVisible(true)}
                        >
                            {t("이력조회")}
                        </FormButton>
                        <FormButton 
                            type="primary" 
                            onClick={handleSaveClick}
                        >
                            {t("저장")}
                        </FormButton>
                        <FormButton onClick={onClose}>
                            {t("닫기")}
                        </FormButton>
                    </div>
                ]}
            >
                <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label={t("프로그램번호")}>{menu.pgmNo}</Descriptions.Item>
                    <Descriptions.Item label={t("프로그램명")}>{menu.pgmName}</Descriptions.Item>
                </Descriptions>
                
                <Divider orientation={"left" as any}>
                    {t("버튼 목록")}
                </Divider>

                <Form form={form} component={false}>
                    <div style={{ height: "400px" }}>
                        <FormAgGrid
                            columnDefs={columnDefs}
                            rowData={buttonList}
                            pagination={false}
                            onGridReady={(params) => setGridApi(params.api)}
                            gridOptions={{
                                suppressRowClickSelection: true,
                            }}
                        />
                    </div>
                </Form>
            </Modal>

            <ChangeReasonModal
                open={reasonModalVisible}
                onClose={() => setReasonModalVisible(false)}
                onConfirm={handleSave}
            />

            {selectedRole && (
                <ButtonHistoryModal
                    visible={historyModalVisible}
                    onClose={() => setHistoryModalVisible(false)}
                    roleNo={selectedRole.roleNo}
                    pgmNo={menu.pgmNo}
                    pgmName={menu.pgmName}
                />
            )}
        </>
    );
};
