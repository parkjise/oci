/*
 * 프로젝트 명  : ONERP
 * 파일 명     : MenuAddModal.tsx
 * 설명        : 메뉴 설정(추가) 모달
 */
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Tree, Input } from "antd";
import { getMenuListApi } from "@apis/system/menu/menuApi";
import { usePermissionMngStore } from "@store/system/pgm/access/permission/permissionMngStore";
import { useTranslation } from "react-i18next";
import type { DataNode } from "antd/es/tree";

interface MenuAddModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (selectedMenus: any[]) => void;
    roleNo: string;
}

const MenuAddModal: React.FC<MenuAddModalProps> = ({ open, onClose, onConfirm, roleNo }) => {
    const { t } = useTranslation();
    const [menuList, setMenuList] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [checkedState, setCheckedState] = useState<{ checked: React.Key[]; halfChecked: React.Key[] }>({ checked: [], halfChecked: [] });

    useEffect(() => {
        if (open && roleNo) {
            fetchMenus();
        }
    }, [open, roleNo]);

    const fetchMenus = async () => {
        try {
            const response = await getMenuListApi();
            if (response.success) {
                const data = (response.data as any[]) || [];
                setMenuList(data);
                
                // 현재 권한에 할당된 메뉴 목록 가져오기 (문자열 Set으로 변환 및 공백 제거)
                const assignedMenus = usePermissionMngStore.getState().menuList;
                const assignedPgmNos = new Set(assignedMenus.map(m => String(m.pgmNo || '').trim()));

                // 전체 메뉴 중 부모 프로그램 번호들을 수집 (공백 제거 및 'null' 제외)
                const allParentPgmNos = new Set(
                    data.map(m => String(m.parentPgmNo || '').trim())
                        .filter(v => v && v !== 'null' && v !== 'undefined')
                );

                // 이미 할당된 메뉴 중 자식이 없는 'Leaf' 노드만 체크 배열에 넣음
                const initialChecked = data
                    .filter(m => {
                        const pgmNoStr = String(m.pgmNo || '').trim();
                        // 할당되어 있고, 부모가 아닌 노드만 직접 체크
                        return assignedPgmNos.has(pgmNoStr) && !allParentPgmNos.has(pgmNoStr);
                    })
                    .map(m => String(m.pgmNo || '').trim());
                
                setCheckedState({ checked: initialChecked, halfChecked: [] });
            }
        } catch (error) {
            console.error("Failed to fetch menu list:", error);
        }
    };

    const treeData = useMemo<DataNode[]>(() => {
        if (!menuList || menuList.length === 0) return [];
        
        const minLevel = Math.min(...menuList.map(m => m.lvl || m.level || 1));
        const grouped: Record<string, any[]> = {};
        const roots: any[] = [];
        
        menuList.forEach(m => {
            const parentKey = m.parentPgmNo || "ROOT";
            const currentLevel = m.lvl || m.level || 1;
            if (currentLevel === minLevel || parentKey === "90000" || parentKey === "ROOT") {
                roots.push(m);
            } else {
                if (!grouped[parentKey]) grouped[parentKey] = [];
                grouped[parentKey].push(m);
            }
        });

        const buildTreeNodes = (list: any[]): DataNode[] => {
            return list.map(m => {
                const children = grouped[m.pgmNo] ? buildTreeNodes(grouped[m.pgmNo]) : [];
                const title = m.pgmName || "";
                
                const isMatch = title.toLowerCase().includes(searchValue.toLowerCase());
                const nodeTitle = isMatch && searchValue ? (
                    <span style={{ color: '#1890ff', fontWeight: 600 }}>{title}</span>
                ) : (
                    title
                );

                return {
                    title: nodeTitle,
                    key: String(m.pgmNo || '').trim(),
                    children: children.length > 0 ? children : undefined,
                    isMatch,
                    pgmName: title
                };
            }).filter(node => {
                if (!searchValue) return true;
                return node.isMatch || (node.children && node.children.length > 0);
            });
        };

        return buildTreeNodes(roots);
    }, [menuList, searchValue]);

    const handleConfirm = () => {
        // 부모-자식 관계 유지를 위해 체크된 노드와 반체크(half-checked)된 부모 노드를 모두 포함
        const allKeys = new Set([...checkedState.checked, ...checkedState.halfChecked].map(k => String(k).trim()));
        const selectedMenus = menuList.filter(m => allKeys.has(String(m.pgmNo || '').trim()));
        onConfirm(selectedMenus);
        onClose();
    };

    return (
        <Modal
            title={t("메뉴 설정")}
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okText={t("반영")}
            cancelText={t("취소")}
            width={550}
            destroyOnClose
            className="menu-add-modal"
        >
            <div style={{ marginBottom: 16 }}>
                <Input.Search 
                    placeholder={t("메뉴명 검색")} 
                    onChange={e => setSearchValue(e.target.value)} 
                    allowClear
                />
            </div>
            <div style={{ 
                height: 450, 
                overflowY: 'auto', 
                border: '1px solid #f0f0f0', 
                borderRadius: 4,
                padding: '8px 12px',
                backgroundColor: '#fafafa'
            }}>
                <Tree
                    checkable
                    selectable={false}
                    checkedKeys={checkedState}
                    onCheck={(keys, info) => {
                        if (Array.isArray(keys)) {
                            setCheckedState({ 
                                checked: keys, 
                                halfChecked: (info as any).halfCheckedKeys || [] 
                            });
                        } else {
                            setCheckedState(keys);
                        }
                    }}
                    treeData={treeData}
                    defaultExpandAll={!!searchValue}
                />
            </div>
        </Modal>
    );
};

export default MenuAddModal;
