/*
 * 프로젝트 명  : ONERP
 * 파일 명     : UserPickModal.tsx
 * 설명        : 사용자 선택 모달
 */
import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";
import { FormAgGrid } from "@components/ui/form";
import { getUserPickApi } from "@apis/system/pgm/access/permission/permissionApi";
import { useTranslation } from "react-i18next";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import type { ColDef } from "ag-grid-community";

interface UserPickModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (users: any[]) => void;
}

const UserPickModal: React.FC<UserPickModalProps> = ({ open, onClose, onSelect }) => {
    const { t } = useTranslation();
    const { selectedRole } = usePermissionMngStore();
    const [userList, setUserList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [gridApi, setGridApi] = useState<any>(null);

    useEffect(() => {
        if (open && selectedRole) {
            fetchUsers();
            setSearchText("");
        }
    }, [open, selectedRole]);

    const fetchUsers = async () => {
        try {
            const response = await getUserPickApi({ 
                roleType: selectedRole?.roleType || "EM",
                searchText 
            });
            if (response.success) {
                setUserList((response.data as any[]) || []);
            }
        } catch (error) {
            console.error("Failed to fetch users for pick:", error);
        }
    };

    const columnDefs: ColDef[] = [
        { 
            headerName: t("사원번호"), 
            field: "empCode", 
            width: 140,
            checkboxSelection: true,
            headerCheckboxSelection: true,
        },
        { headerName: t("사원명"), field: "empName", width: 120 },
        { headerName: t("부서명"), field: "deptName", flex: 1 },
    ];

    const handleConfirm = () => {
        const selectedRows = gridApi?.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            Modal.warning({ title: t("선택 확인"), content: t("추가할 사용자를 선택하세요.") });
            return;
        }
        onSelect(selectedRows);
        onClose();
    };

    const handleRowDoubleClicked = (params: any) => {
        onSelect([params.data]);
        onClose();
    };

    return (
        <Modal
            title={t("사용자 추가")}
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okText={t("선택 완료")}
            cancelText={t("취소")}
            width={650}
            destroyOnClose
        >
            <div style={{ marginBottom: 16 }}>
                <Input.Search 
                    placeholder={t("사원명/사번 검색")} 
                    onSearch={fetchUsers}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
            <div style={{ height: 450 }}>
                <FormAgGrid
                    columnDefs={columnDefs}
                    rowData={userList}
                    idField="empCode"
                    rowSelection="multiple"
                    pagination={false}
                    onGridReady={(params) => setGridApi(params.api)}
                    onRowDoubleClicked={handleRowDoubleClicked}
                />
            </div>
        </Modal>
    );
};

export default UserPickModal;
