/*
 * 프로젝트 명  : ONERP
 * 파일 명     : MenuTree.tsx
 * 설명        : 메뉴 트리 컴포넌트 (Authz 샘플 디자인 1:1 적용)
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성 - 디자인 정밀 보정)
 */
import React, { useMemo, useState, useEffect } from "react";
import { FormButton, FormTree, FormInput } from "@components/ui/form";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import type { DataNode } from "antd/es/tree";
import MenuAddModal from "./MenuAddModal";
import ChangeReasonModal from "../ChangeReasonModal";
import RestoreHistoryModal from "../RestoreHistoryModal";
import { ButtonPermissionModal } from "../ButtonPermissionModal";

const MenuTree: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const selectedRole = usePermissionMngStore(state => state.selectedRole);
    const menuList = usePermissionMngStore(state => state.menuList);
    const saveRoleMenus = usePermissionMngStore(state => state.saveRoleMenus);
    
    const [searchValue, setSearchValue] = useState("");
    const [finalSearch, setFinalSearch] = useState("");
    const [isMenuAddOpen, setIsMenuAddOpen] = useState(false);

    const [isReasonOpen, setIsReasonOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [pendingActionType, setPendingActionType] = useState<'M' | 'R'>('M');
    const [pendingMenus, setPendingMenus] = useState<any[]>([]);

    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
    const [selectedMenuForButtons, setSelectedMenuForButtons] = useState<any>(null);

    const handleSearch = (value: string) => {
        setFinalSearch(value);
    };

    const uniqueMenus = useMemo(() => {
        if (!menuList || menuList.length === 0) return [];
        return Array.from(
            new Map(menuList.map(item => [item.pgmNo, item])).values()
        );
    }, [menuList]);

    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        if (finalSearch && uniqueMenus.length > 0) {
            // Search active: expand all nodes to show matches
            setExpandedKeys(uniqueMenus.map(m => m.pgmNo));
        } else {
            // Search cleared or initial load: collapse all (only level 1 visible)
            setExpandedKeys([]);
        }
    }, [finalSearch, uniqueMenus]);

    const onExpand = (keys: React.Key[]) => {
        setExpandedKeys(keys);
    };

    const treeData = useMemo<DataNode[]>(() => {
        if (uniqueMenus.length === 0) return [];
        
        const minLevel = Math.min(...uniqueMenus.map(m => m.level));

        const grouped = uniqueMenus.reduce((acc, menu) => {
            const key = menu.parentPgmNo || 'ROOT';
            if (!acc[key]) acc[key] = [];
            acc[key].push(menu);
            return acc;
        }, {} as Record<string, typeof uniqueMenus>);

        const buildTreeNodes = (parentPgmNo: string | undefined, level: number): DataNode[] => {
            const list = level === minLevel 
                ? (grouped['ROOT'] || uniqueMenus.filter(m => m.level === minLevel))
                : (grouped[parentPgmNo || ''] || []);

            return list
                .map((menu) => {
                    const children = buildTreeNodes(menu.pgmNo, level + 1);
                    const title = menu.pgmName || "";
                    const isMatch = finalSearch ? title.toLowerCase().includes(finalSearch.toLowerCase()) : false;
                    const nodeTitle = isMatch ? (
                        <span style={{ color: '#f50', fontWeight: 600 }}>{title}</span>
                    ) : (
                        title
                    );
                    return {
                        title: nodeTitle,
                        key: menu.pgmNo || "",
                        isLeaf: children.length === 0,
                        children: children.length > 0 ? children : undefined,
                        data: menu
                    };
                })
                .filter(node => {
                    if (!finalSearch) return true;
                    const hasMatch = (node.data.pgmName || "").toLowerCase().includes(finalSearch.toLowerCase());
                    return hasMatch || (node.children && node.children.length > 0);
                });
        };
        return buildTreeNodes(undefined, minLevel);
    }, [uniqueMenus, finalSearch]);

    const onSelect = React.useCallback((_selectedKeys: React.Key[], info: any) => {
        if (info.node.isLeaf) {
            console.log("Leaf selected:", info.node.data);
            setSelectedMenuForButtons(info.node.data);
            setIsButtonModalOpen(true);
        }
    }, []);

    const handleMenuAddConfirm = React.useCallback((selectedMenus: any[]) => {
        setPendingMenus(selectedMenus);
        setPendingActionType('M');
        setIsReasonOpen(true);
    }, []);

    const handleRestoreConfirm = React.useCallback((selectedItems: any[]) => {
        setPendingMenus(selectedItems);
        setPendingActionType('R');
        setIsReasonOpen(true);
    }, []);

    const handleConfirmReason = React.useCallback(async (reason: string) => {
        if (!selectedRole) return;
        
        const success = await saveRoleMenus(selectedRole.roleNo, reason, pendingActionType, pendingMenus);
        if (success) {
            setIsReasonOpen(false);
        }
    }, [selectedRole, pendingActionType, pendingMenus, saveRoleMenus]);

    return (
        <div className="authz__pane authz__pane--menus page-card">
            <div className="authz__toolbar">
                <div className="authz__search authz__search--menus">
                    <FormInput
                        name="menuSearch"
                        label=""
                        type="search"
                        placeholder={t("메뉴 검색")}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        className="authz__input authz__input--search"
                    />
                </div>
                <div className="authz__actions">
                    <FormButton size="small" onClick={() => setIsHistoryOpen(true)} disabled={!selectedRole}>{t("복구")}</FormButton>
                    <FormButton size="small" onClick={() => setIsMenuAddOpen(true)} disabled={!selectedRole}>{t("메뉴설정")}</FormButton>
                </div>
            </div>
            <div className="authz__content authz__content--menus">
                <div className="authz__tree authz__tree--menus page-card">
                    <FormTree
                        name="roleMenuTree"
                        treeData={treeData}
                        onSelect={onSelect}
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        showLine
                        virtual={true}
                        height={700}
                    />
                </div>
            </div>
            <MenuAddModal
                open={isMenuAddOpen}
                onClose={() => setIsMenuAddOpen(false)}
                onConfirm={handleMenuAddConfirm}
                roleNo={selectedRole?.roleNo || ""}
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
                type="MENU"
            />
            {selectedMenuForButtons && (
                <ButtonPermissionModal
                    visible={isButtonModalOpen}
                    onClose={() => {
                        setIsButtonModalOpen(false);
                        setSelectedMenuForButtons(null);
                    }}
                    menu={selectedMenuForButtons}
                />
            )}
        </div>
    );
});

export default MenuTree;
