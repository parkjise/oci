// ============================================================================
// 권한 트리 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useMemo } from "react";
import { Modal, Button } from "antd";
import type { DataNode } from "antd/es/tree";
import type { RoleDto } from "@apis/system/permission/permissionApi";
import { FormTree } from "@components/ui/form";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
interface RoleTreeProps {
  roleList: RoleDto[];
  selectedRoleNo?: string;
  onSelect?: (roleNo: string) => void;
  onAddRole?: (parentRoleNo?: string, isChild?: boolean) => void;
  onDeleteRole?: (roleNo: string) => void;
}

// ============================================================================
// Component
// ============================================================================
const RoleTree: React.FC<RoleTreeProps> = ({
  roleList,
  selectedRoleNo,
  onSelect,
  onAddRole,
  onDeleteRole,
}) => {
  const { t } = useTranslation();

  // 트리 데이터 변환 (LEVEL 기준으로 트리 구성)
  const treeData = useMemo<DataNode[]>(() => {
    const buildTree = (
      parentRoleNo: string | undefined,
      level: number
    ): DataNode[] => {
      return roleList
        .filter((role) => {
          if (level === 1) {
            return role.level === 1 || role.parentRoleNo === undefined;
          }
          return role.parentRoleNo === parentRoleNo && role.level === level;
        })
        .map((role) => {
          const nextLevel = level + 1;
          const children = buildTree(role.roleNo, nextLevel);
          return {
            title: role.roleName || "",
            key: role.roleNo || "",
            isLeaf: children.length === 0,
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    return buildTree(undefined, 1);
  }, [roleList]);

  // 선택된 노드
  const selectedKeys = useMemo(() => {
    if (selectedRoleNo) {
      return [selectedRoleNo];
    }
    return [];
  }, [selectedRoleNo]);

  // 트리 노드 클릭 핸들러
  const handleSelect = (selected: React.Key[]) => {
    if (selected.length > 0 && onSelect) {
      onSelect(selected[0] as string);
    }
  };

  // 트리 노드 우클릭 핸들러
  const handleRightClick: NonNullable<
    React.ComponentProps<typeof FormTree>["onRightClick"]
  > = (info) => {
    const roleNo = String(info.node.key);

    if (!onAddRole && !onDeleteRole) {
      return;
    }

    Modal.confirm({
      title: t("권한 작업"),
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {onAddRole && (
            <>
              <Button
                type="link"
                onClick={() => {
                  Modal.destroyAll();
                  // 하위 권한으로 추가
                  onAddRole(roleNo, true);
                }}
              >
                {t("추가")}
              </Button>
            </>
          )}
          {onDeleteRole && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.destroyAll();
                onDeleteRole(roleNo);
              }}
            >
              {t("삭제")}
            </Button>
          )}
        </div>
      ),
      okText: t("닫기"),
      cancelButtonProps: { style: { display: "none" } },
    });
  };

  return (
    <FormTree
      name="roleTree"
      treeData={treeData}
      selectedKeys={selectedKeys}
      onSelect={(_, info) => handleSelect(info.selected ? [info.node.key] : [])}
      onRightClick={handleRightClick}
      showLine
      defaultExpandAll={false}
    />
  );
};

export default RoleTree;

