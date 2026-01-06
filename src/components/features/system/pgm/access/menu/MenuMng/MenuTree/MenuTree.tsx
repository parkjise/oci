// ============================================================================
// 메뉴 트리 컴포넌트
// ============================================================================

import React, { useMemo, useState, useEffect } from "react";
import { Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import type { DataNode } from "antd/es/tree";
import { FormTree } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { useMenuMngStore } from "@store/system/pgm/access/menu/menuMngStore";

// ============================================================================
// Component
// ============================================================================
const MenuTree: React.FC = () => {
  const { t } = useTranslation();
  const {
    menuList,
    selectedMenu,
    selectMenu,
    addMenu,
    deleteMenu,
    isModified,
  } = useMenuMngStore();

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuPgmNo, setContextMenuPgmNo] = useState<string>("");

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenuVisible) return;

    const handleClickOutside = () => {
      setContextMenuVisible(false);
    };

    // Add event listener with a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenuVisible]);

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
    if (selectedMenu?.pgmNo) {
      return [selectedMenu.pgmNo];
    }
    return [];
  }, [selectedMenu]);

  // 트리 노드 클릭 핸들러
  const handleSelect = (selected: React.Key[]) => {
    if (selected.length > 0) {
      const targetPgmNo = selected[0] as string;

      // 수정된 내용이 있으면 확인 다이얼로그 표시
      if (isModified) {
        Modal.confirm({
          title: t("확인"),
          content: t("변경사항이 있습니다. 저장하지 않고 이동하시겠습니까?"),
          okText: t("이동"),
          cancelText: t("취소"),
          onOk: () => {
            selectMenu(targetPgmNo);
          },
        });
      } else {
        selectMenu(targetPgmNo);
      }
    }
  };

  // Context menu items
  const contextMenuItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "addSameLevel",
        label: t("동일 레벨 메뉴 추가"),
        onClick: () => {
          setContextMenuVisible(false);
          const currentMenu = menuList.find(
            (m) => m.pgmNo === contextMenuPgmNo
          );
          addMenu({
            parentPgmNo: currentMenu?.parentPgmNo,
            pgmName: "New..",
            useMenu: "N",
            hidden: "N",
            useYn: "N",
          });
        },
      },
      {
        key: "addSubLevel",
        label: t("하위 레벨 메뉴 추가"),
        onClick: () => {
          setContextMenuVisible(false);
          const parentMenu = menuList.find((m) => m.pgmNo === contextMenuPgmNo);
          if (parentMenu) {
            addMenu({
              parentPgmNo: contextMenuPgmNo,
              pgmName: "New..",
              useMenu: "N",
              hidden: "N",
              useYn: "N",
            });
          }
        },
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: t("삭제"),
        danger: true,
        onClick: () => {
          setContextMenuVisible(false);
          deleteMenu(contextMenuPgmNo);
        },
      },
    ];
  }, [t, contextMenuPgmNo, menuList, addMenu, deleteMenu, isModified]);

  // 트리 노드 우클릭 핸들러
  const handleRightClick: NonNullable<
    React.ComponentProps<typeof FormTree>["onRightClick"]
  > = async (info) => {
    const pgmNo = String(info.node.key);
    setContextMenuPgmNo(pgmNo);

    // Get mouse position from the event
    const event = info.event as React.MouseEvent;
    const menuPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    // 수정된 내용이 있으면 확인 다이얼로그 표시
    if (isModified) {
      Modal.confirm({
        title: t("확인"),
        content: t("변경사항이 있습니다. 저장하지 않고 이동하시겠습니까?"),
        okText: t("이동"),
        cancelText: t("취소"),
        onOk: async () => {
          await selectMenu(pgmNo);
          setContextMenuPosition(menuPosition);
          setContextMenuVisible(true);
        },
      });
    } else {
      // Select the menu on right-click
      await selectMenu(pgmNo);
      setContextMenuPosition(menuPosition);
      setContextMenuVisible(true);
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items: contextMenuItems }}
        open={contextMenuVisible}
        onOpenChange={(visible) => setContextMenuVisible(visible)}
        trigger={[]}
        overlayStyle={{
          position: "fixed",
          left: contextMenuPosition.x,
          top: contextMenuPosition.y,
        }}
      >
        <div style={{ height: 0, width: 0 }} />
      </Dropdown>

      <FormTree
        name="menuTree"
        treeData={treeData}
        selectedKeys={selectedKeys}
        onSelect={(_, info) =>
          handleSelect(info.selected ? [info.node.key] : [])
        }
        onRightClick={handleRightClick}
        showLine
        defaultExpandAll={false}
      />
    </>
  );
};

export default MenuTree;
