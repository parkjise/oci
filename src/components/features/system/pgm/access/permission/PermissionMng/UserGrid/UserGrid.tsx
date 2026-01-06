/*
 * 프로젝트 명  : ONERP
 * 파일 명     : UserGrid.tsx
 * 설명        : 사용자 그리드 컴포넌트 (Authz 샘플 디자인 1:1 적용)
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성 - 디자인 정밀 보정)
 */
import React, { useMemo, useState } from "react";
import { FormAgGrid } from "@components/ui/form";
import { FormButton } from "@components/ui/form";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import type { ColDef } from "ag-grid-community";
import UserPickModal from "../UserPickModal";
import ChangeReasonModal from "../ChangeReasonModal";
import RestoreHistoryModal from "../RestoreHistoryModal";

const UserGrid: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const selectedRole = usePermissionMngStore(state => state.selectedRole);
    const userList = usePermissionMngStore(state => state.userList);
    const saveRoleUsers = usePermissionMngStore(state => state.saveRoleUsers);

    const [isUserPickOpen, setIsUserPickOpen] = useState(false);
    const [isReasonOpen, setIsReasonOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'I' | 'D' | 'M' | 'R', users: any[] } | null>(null);
    const [gridApi, setGridApi] = useState<any>(null);

    const columnDefs = useMemo<ColDef[]>(() => [
        { headerName: t("사용자ID"), field: "typeId", flex: 1 },
        { headerName: t("사용자명"), field: "typeName", flex: 1 },
        { headerName: t("부서명"), field: "deptName", flex: 1.5 },
    ], [t]);

    const handleAddUsers = (selectedUsers: any[]) => {
        if (!selectedUsers || selectedUsers.length === 0) return;

        // 중복 체크 및 필터링
        const existingIds = new Set(userList.map(u => u.typeId));
        const newUsers = selectedUsers
            .filter(user => !existingIds.has(user.empCode))
            .map(user => ({
                roleNo: selectedRole?.roleNo || "",
                typeId: user.empCode,
                typeName: user.empName,
                roleType: "EM", // 기본값
            }));

        if (newUsers.length === 0) {
            Modal.warning({ title: t("중복 확인"), content: t("선택한 사용자가 이미 모두 추가되어 있습니다.") });
            return;
        }

        setPendingAction({ type: 'I', users: newUsers });
        setIsReasonOpen(true);
    };

    const handleDelete = () => {
        const selectedRows = gridApi?.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            Modal.warning({ title: t("행 선택"), content: t("삭제할 사용자를 선택하세요.") });
            return;
        }

        setPendingAction({ type: 'D', users: selectedRows });
        setIsReasonOpen(true);
    };

    const handleConfirmReason = async (reason: string) => {
        if (!selectedRole || !pendingAction) return;

        const success = await saveRoleUsers(
            selectedRole.roleNo,
            reason,
            pendingAction.type,
            pendingAction.users
        );

        if (success) {
            setPendingAction(null);
            setIsReasonOpen(false);
        }
    };

    const handleRestoreConfirm = (selectedItems: any[]) => {
        setPendingAction({ type: 'R', users: selectedItems });
        setIsReasonOpen(true);
    };

    return (
        <div className="authz__pane authz__pane--roles page-card">
            <div className="authz__toolbar">
                <div className="authz__title">
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{t("사용자 정보")}</span>
                </div>
                <div className="authz__actions">
                    <FormButton size="small" onClick={() => setIsUserPickOpen(true)} disabled={!selectedRole}>{t("추가")}</FormButton>
                    <FormButton size="small" danger onClick={handleDelete} disabled={!selectedRole}>{t("삭제")}</FormButton>
                    <FormButton size="small" onClick={() => setIsHistoryOpen(true)} disabled={!selectedRole}>{t("복구")}</FormButton>
                </div>
            </div>
            <div className="authz__content authz__content--grid">
                <FormAgGrid
                    columnDefs={columnDefs}
                    rowData={userList}
                    idField="typeId"
                    pagination={false}
                    height="100%"
                    rowSelection="multiple"
                    onGridReady={(params) => setGridApi(params.api)}
                />
            </div>
            <UserPickModal 
                open={isUserPickOpen} 
                onClose={() => setIsUserPickOpen(false)} 
                onSelect={handleAddUsers}
            />
            <ChangeReasonModal
                open={isReasonOpen}
                onClose={() => setIsReasonOpen(false)}
                onConfirm={handleConfirmReason}
            />
            <RestoreHistoryModal
                open={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onRestore={handleRestoreConfirm}
                type="USER"
            />
        </div>
    );
});

export default UserGrid;
