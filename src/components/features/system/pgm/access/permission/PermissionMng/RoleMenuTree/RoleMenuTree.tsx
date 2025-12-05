// ============================================================================
// 권한 메뉴 트리 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useMemo } from "react";
import { Button } from "antd";
import type { DataNode } from "antd/es/tree";
import type { RoleMenuDto } from "@apis/system/permission/permissionApi";
import { FormTree } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { RoleMenuTreeStyles } from "./RoleMenuTree.styles";

// ============================================================================
// Types
// ============================================================================
interface RoleMenuTreeProps {
  roleMenuList: RoleMenuDto[];
  onSetMenu?: () => void;
}

// ============================================================================
// Component
// ============================================================================
const RoleMenuTree: React.FC<RoleMenuTreeProps> = ({
  roleMenuList,
  onSetMenu,
}) => {
  const { t } = useTranslation();

  // 트리 데이터 변환 (LEVEL 기준으로 트리 구성)
  const treeData = useMemo<DataNode[]>(() => {
    const buildTree = (
      parentPgmNo: string | undefined,
      level: number
    ): DataNode[] => {
      return roleMenuList
        .filter((menu) => {
          const menuLevel = menu.level || 1;
          if (level === 1) {
            return menuLevel === 1 || menu.parentPgmNo === undefined;
          }
          return menu.parentPgmNo === parentPgmNo && menuLevel === level;
        })
        .map((menu) => {
          const nextLevel = level + 1;
          const children = buildTree(menu.pgmNo, nextLevel);
          const isLeaf = menu.isLeaf === "Y" || children.length === 0;
          return {
            title: menu.pgmName || "",
            key: menu.pgmNo || "",
            isLeaf,
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    return buildTree(undefined, 1);
  }, [roleMenuList]);

  // 트리 노드 클릭 핸들러 (leaf 노드만 처리)
  const handleSelect = (selected: React.Key[]) => {
    if (selected.length > 0) {
      const selectedKey = selected[0] as string;
      const selectedMenu = roleMenuList.find((m) => m.pgmNo === selectedKey);
      if (selectedMenu?.isLeaf === "Y") {
        // leaf 노드 클릭 시 버튼 설정 팝업 호출 (구현 필요)
        // onButtonSetting?.(selectedKey);
      }
    }
  };

  return (
    <RoleMenuTreeStyles>
      <div style={{ marginBottom: "10px", display: "flex", gap: "5px" }}>
        <Button onClick={onSetMenu}>{t("메뉴설정")}</Button>
      </div>
      <FormTree
        name="roleMenuTree"
        treeData={treeData}
        onSelect={(_, info) => handleSelect(info.selected ? [info.node.key] : [])}
        showLine
        defaultExpandAll={false}
      />
    </RoleMenuTreeStyles>
  );
};

export default RoleMenuTree;

