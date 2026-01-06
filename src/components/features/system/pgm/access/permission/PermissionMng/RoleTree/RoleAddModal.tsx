/*
 * 프로젝트 명  : ONERP
 * 파일 명     : RoleAddModal.tsx
 * 설명        : 권한 추가 모달
 */
import React from "react";
import { Modal, Form, Radio } from "antd";
import { FormInput, FormSelect } from "@components/ui/form";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import type { RoleDto } from "@apis/system/pgm/access/permission/permissionApi";

interface RoleAddModalProps {
    open: boolean;
    onClose: () => void;
    parentRole: RoleDto | null;
}

const RoleAddModal: React.FC<RoleAddModalProps> = ({ open, onClose, parentRole }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { authTypeOptions, createRole, fetchAuthTypes } = usePermissionMngStore();

    React.useEffect(() => {
        if (open && authTypeOptions.length === 0) {
            fetchAuthTypes();
        }
    }, [open, authTypeOptions.length, fetchAuthTypes]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const levelType = values.levelType; // 'D' (동일), 'E' (하위)
            
            const payload: any = {
                roleName: values.roleName,
                roleType: values.roleType,
                levelType: levelType,
            };

            if (parentRole) {
                payload.parentRoleNo = parentRole.roleNo; // Service will handle D/E logic
                payload.levelType = levelType;
            } else {
                payload.level = 1;
                payload.sort = 1;
                payload.levelType = 'E'; // Default for new top level
            }

            const success = await createRole(payload);
            if (success) {
                form.resetFields();
                onClose();
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={t("권한 추가")}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            destroyOnClose
            okText={t("저장")}
            cancelText={t("취소")}
        >
            <Form 
                form={form} 
                layout="vertical" 
                initialValues={{ 
                    levelType: 'E', 
                    roleType: parentRole?.roleType || 'EM' 
                }}
            >
                <Form.Item name="levelType" label={t("추가 위치")}>
                    <Radio.Group>
                        <Radio value="D" disabled={!parentRole}>{t("동일레벨")}</Radio>
                        <Radio value="E">{t("하위레벨")}</Radio>
                    </Radio.Group>
                </Form.Item>
                <FormInput 
                    name="roleName" 
                    label={t("권한명")} 
                />
                <FormSelect 
                    name="roleType" 
                    label={t("권한타입")} 
                    options={authTypeOptions} 
                />
            </Form>
        </Modal>
    );
};

export default RoleAddModal;
