// ============================================================================
// 메뉴 트리 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useMemo } from "react";
import { Modal, Button } from "antd";
import type { DataNode } from "antd/es/tree";
import type { MenuDto } from "@apis/system/menu/menuApi";
import { FormTree } from "@components/ui/form";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
interface MenuTreeProps {
  menuList: MenuDto[];
  selectedPgmNo?: string;
  onSelect?: (pgmNo: string) => void;
  onAddMenu?: (parentPgmNo: string, isChild: boolean) => void;
  onDeleteMenu?: (pgmNo: string) => void;
}

// ============================================================================
// Component
// ============================================================================
const MenuTree: React.FC<MenuTreeProps> = ({
  menuList,
  selectedPgmNo,
  onSelect,
  onAddMenu,
  onDeleteMenu,
}) => {
  const { t } = useTranslation();

  // 트리 데이터 변환 (1레벨만 루트로 표시, 하위 노드는 재귀적으로 구성)
  const treeData = useMemo<DataNode[]>(() => {
    const buildTree = (
      parentPgmNo: string | undefined,
      level: number
    ): DataNode[] => {
      return menuList
        .filter((menu) => {
          if (level === 1) {
            return menu.lvl === 1;
          }
          return menu.parentPgmNo === parentPgmNo && menu.lvl === level;
        })
        .map((menu) => {
          const children = buildTree(menu.pgmNo, level + 1);
          return {
            title: menu.pgmName || "",
            key: menu.pgmNo || "",
            isLeaf: children.length === 0,
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    return buildTree(undefined, 1);
  }, [menuList]);

  // 선택된 노드
  const selectedKeys = useMemo(() => {
    if (selectedPgmNo) {
      return [selectedPgmNo];
    }
    return [];
  }, [selectedPgmNo]);

  // 트리 노드 클릭 핸들러
  const handleSelect = (selected: React.Key[]) => {
    if (selected.length > 0 && onSelect) {
      onSelect(selected[0] as string);
    }
  };

  // 트리 노드 우클릭 핸들러 (컨텍스트 메뉴 UI는 트리 컴포넌트에서 처리)
  const handleRightClick: NonNullable<
    React.ComponentProps<typeof FormTree>["onRightClick"]
  > = (info) => {
    const pgmNo = String(info.node.key);

    if (!onAddMenu && !onDeleteMenu) {
      return;
    }

    Modal.confirm({
      title: t("메뉴 작업"),
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {onAddMenu && (
            <>
              <Button
                type="link"
                onClick={() => {
                  Modal.destroyAll();
                  // 하위 메뉴로 추가
                  onAddMenu(pgmNo, true);
                }}
              >
                {t("하위 메뉴 추가")}
              </Button>
              <Button
                type="link"
                onClick={() => {
                  Modal.destroyAll();
                  // 동일 레벨로 추가
                  onAddMenu(pgmNo, false);
                }}
              >
                {t("동일 레벨 메뉴 추가")}
              </Button>
            </>
          )}
          {onDeleteMenu && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.destroyAll();
                onDeleteMenu(pgmNo);
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
      name="menuTree"
      treeData={treeData}
      selectedKeys={selectedKeys}
      onSelect={(_, info) => handleSelect(info.selected ? [info.node.key] : [])}
      onRightClick={handleRightClick}
      showLine
      defaultExpandAll={false}
    />
  );
};

export default MenuTree;


