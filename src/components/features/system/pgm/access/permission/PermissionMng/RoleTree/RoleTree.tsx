/*
 * 프로젝트 명  : ONERP
 * 파일 명     : RoleTree.tsx
 * 설명        : 권한 트리 컴포넌트 (Authz 샘플 디자인 1:1 적용)
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성 - 디자인 정밀 보정)
 */
import React, { useMemo, useState, useEffect } from "react";
import { FormButton, FormTree, FormInput } from "@components/ui/form";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import type { DataNode } from "antd/es/tree";
import { Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import RoleAddModal from "./RoleAddModal";

const RoleTree: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const roleList = usePermissionMngStore(state => state.roleList);
    const fetchRoleList = usePermissionMngStore(state => state.fetchRoleList);
    const setSelectedRole = usePermissionMngStore(state => state.setSelectedRole);
    const selectedRole = usePermissionMngStore(state => state.selectedRole);
    const copyRole = usePermissionMngStore(state => state.copyRole);
    const deleteRole = usePermissionMngStore(state => state.deleteRole);
    
    const [searchValue, setSearchValue] = useState("");
    const [finalSearch, setFinalSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        fetchRoleList();
    }, [fetchRoleList]);

    const handleSearch = (value: string) => {
        setFinalSearch(value);
    };

    const handleCopyRole = React.useCallback(async (roleNo: string) => {
        await copyRole(roleNo);
    }, [copyRole]);

    const handleDeleteRole = React.useCallback((roleNo: string) => {
        Modal.confirm({
            title: t("삭제 확인"),
            content: t("선택한 권한을 삭제하시겠습니까? 하위 권한이 있는 경우 함께 삭제될 수 있습니다."),
            onOk: async () => {
                await deleteRole(roleNo);
            }
        });
    }, [deleteRole, t]);

    const memoizedGetMenuItems = React.useCallback((role: any): MenuProps => ({
        items: [
            {
                key: 'add',
                label: t("권한 추가"),
                onClick: () => {
                    setSelectedRole(role);
                    setIsAddOpen(true);
                }
            },
            {
                key: 'copy',
                label: t("권한 복사"),
                onClick: () => handleCopyRole(role.roleNo)
            },
            {
                key: 'delete',
                label: t("권한 삭제"),
                danger: true,
                onClick: () => handleDeleteRole(role.roleNo)
            }
        ]
    }), [t, setSelectedRole, handleCopyRole, handleDeleteRole]);

    const onSelect = React.useCallback((selectedKeys: React.Key[], info: any) => {
        if (selectedKeys.length > 0) {
            setSelectedRole(info.node.data);
        }
    }, [setSelectedRole]);

    const treeData = useMemo<DataNode[]>(() => {
        if (!roleList || roleList.length === 0) return [];

        // Deduplicate roles to avoid infinite loops or duplicates in messy data
        const uniqueRoles = Array.from(
            new Map(roleList.map(item => [item.roleNo, item])).values()
        );

        const minLevel = Math.min(...uniqueRoles.map(r => r.level));
        
        const grouped = uniqueRoles.reduce((acc, role) => {
            const key = role.parentRoleNo || 'ROOT';
            if (!acc[key]) acc[key] = [];
            acc[key].push(role);
            return acc;
        }, {} as Record<string, typeof uniqueRoles>);

        const buildTreeNodes = (parentRoleNo: string | undefined, level: number): DataNode[] => {
            const list = level === minLevel 
                ? (grouped['ROOT'] || uniqueRoles.filter(r => r.level === minLevel))
                : (grouped[parentRoleNo || ''] || []);

            return list
                .map((role) => {
                    const children = buildTreeNodes(role.roleNo, level + 1);
                    const titleStr = role.roleName || "";
                    const isMatch = finalSearch ? titleStr.toLowerCase().includes(finalSearch.toLowerCase()) : false;
                    
                    return {
                        title: (
                            <Dropdown menu={memoizedGetMenuItems(role)} trigger={['contextMenu']}>
                                <span style={{ 
                                    color: isMatch ? '#f50' : 'inherit',
                                    fontWeight: isMatch ? 600 : 'normal'
                                }}>
                                    {titleStr}
                                </span>
                            </Dropdown>
                        ),
                        key: role.roleNo || "",
                        isLeaf: children.length === 0,
                        children: children.length > 0 ? children : undefined,
                        data: role
                    };
                })
                .filter(node => {
                    if (!finalSearch) return true;
                    const hasMatch = (node.data.roleName || "").toLowerCase().includes(finalSearch.toLowerCase());
                    return hasMatch || (node.children && node.children.length > 0);
                });
        };
        return buildTreeNodes(undefined, minLevel);
    }, [roleList, finalSearch, memoizedGetMenuItems]);

    return (
        <section className="authz__column authz__column--list page-card">
            <div className="authz__header authz__header--list">
                <div className="authz__search authz__search--roles">
                    <FormInput
                        name="roleSearch"
                        label=""
                        type="search"
                        placeholder={t("권한 검색")}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        className="authz__input authz__input--search"
                    />
                </div>
                <div className="authz__actions">
                    <FormButton size="small" onClick={() => handleCopyRole(selectedRole?.roleNo || "")} disabled={!selectedRole}>{t("권한복사")}</FormButton>
                </div>
            </div>
            <div className="authz__body authz__body--list page-card">
                <div className="authz__tree authz__tree--roles">
                    <FormTree
                        name="roleTree"
                        treeData={treeData}
                        onSelect={onSelect}
                        showLine
                        defaultExpandAll
                        selectedKeys={selectedRole ? [selectedRole.roleNo] : []}
                        virtual={true}
                        height={700} // Virtualization requires fixed height
                    />
                </div>
            </div>
            <RoleAddModal 
                open={isAddOpen} 
                onClose={() => setIsAddOpen(false)} 
                parentRole={selectedRole}
            />
        </section>
    );
});

export default RoleTree;
