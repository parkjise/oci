/*
 * 프로젝트 명  : ONERP
 * 파일 명     : PermissionMng.tsx
 * 설명        : 권한 관리 화면 (Authz 샘플 디자인 1:1 적용)
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성 - 디자인 정밀 보정)
 */
import React from "react";
import { FormInput, FormButton } from "@components/ui/form";
import { PermissionMngStyles } from "./PermissionMng.Styles";
import { RoleTree, UserGrid, MenuTree } from "@components/features/system/pgm/access/permission/PermissionMng";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import { App, Form } from "antd";

const PermissionMng: React.FC = () => {
    const { t } = useTranslation();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const selectedRole = usePermissionMngStore(state => state.selectedRole);
    const updateRoleName = usePermissionMngStore(state => state.updateRoleName);

    const fetchAuthTypes = usePermissionMngStore(state => state.fetchAuthTypes);

    React.useEffect(() => {
        fetchAuthTypes();
    }, [fetchAuthTypes]);

    React.useEffect(() => {
        form.setFieldsValue({
            roleNo: selectedRole?.roleNo || "",
            roleType: selectedRole?.roleTypeName || selectedRole?.roleType || "",
            roleName: selectedRole?.roleName || ""
        });
    }, [selectedRole, form]);

    const handleRoleNameChange = async () => {
        if (!selectedRole) return;
        
        try {
            const values = await form.validateFields(['roleName']);
            const trimmedName = (values.roleName || "").trim();
            
            if (!trimmedName) {
                message.warning(t("권한명을 입력하세요."));
                return;
            }

            if (trimmedName.length > 100) {
                message.warning(t("권한명은 100자 이내로 입력하세요."));
                return;
            }

            await updateRoleName(selectedRole.roleNo, trimmedName);
        } catch (error) {
            // Validation failed
        }
    };

    return (
        <PermissionMngStyles className="authz">
            {/* LEFT: 권한 목록/검색 */}
            <RoleTree />

            {/* RIGHT: 상세 */}
            <section className="authz__column authz__column--detail">
                {/* 상단 메타 정보 & 저장 버튼 */}
                <div className="authz__header authz__header--detail page-card">
                    <Form form={form} component={false}>
                        <div className="authz__meta">
                            <div className="authz__meta-item">
                                <span className="authz__meta-label">{t("권한번호")}</span>
                                <FormInput 
                                    name="roleNo" 
                                    label="" 
                                    mode="view" 
                                    className="authz__meta-field"
                                />
                            </div>
                            <span className="divider"></span>
                            <div className="authz__meta-item">
                                <span className="authz__meta-label">{t("권한타입")}</span>
                                <FormInput 
                                    name="roleType" 
                                    label="" 
                                    mode="view" 
                                    className="authz__meta-field"
                                />
                            </div>
                            <span className="divider"></span>
                            <div className="authz__meta-item authz__meta-item--name">
                                <span className="authz__meta-label">{t("권한명")}</span>
                                <FormInput
                                    name="roleName"
                                    label=""
                                    className="authz__input authz__input--name"
                                    disabled={!selectedRole}
                                    maxLength={100}
                                />
                                <FormButton 
                                    className="authz__btn authz__btn--rename"
                                    onClick={handleRoleNameChange}
                                    disabled={!selectedRole}
                                >
                                    {t("권한명 변경")}
                                </FormButton>
                            </div>
                        </div>
                    </Form>
                    <div className="authz__actions authz__actions--detail">
                        <FormButton className="authz__btn authz__btn--save navy" disabled={!selectedRole}>
                            {t("저장")}
                        </FormButton>
                    </div>
                </div>

                {/* 하단 그리드 & 트리 레이아웃 */}
                <div className="authz__body authz__body--detail">
                    <UserGrid />
                    <MenuTree />
                </div>
            </section>
        </PermissionMngStyles>
    );
};

export default PermissionMng;
