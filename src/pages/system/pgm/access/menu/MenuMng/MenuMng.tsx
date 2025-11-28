// ============================================================================
// 메뉴관리 페이지 (MenuMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Splitter, Modal, message, Button } from "antd";
import { Article } from "./MenuMng.styles";
import {
  MenuTree,
  MenuDetailForm,
  MenuButtonGrid,
} from "@components/features/system/pgm/access/menu/MenuMng";
import type { MenuDetailFormRef } from "@components/features/system/pgm/access/menu/MenuMng/MenuDetailForm/MenuDetailForm";
import type { MenuButtonGridRef } from "@components/features/system/pgm/access/menu/MenuMng/MenuButtonGrid/MenuButtonGrid";
import {
  getMenuListApi,
  getMenuButtonListApi,
  saveMenuApi,
  insertMenuApi,
  deleteMenuApi,
  type MenuDto,
  type MenuButtonDto,
} from "@apis/system/menu/menuApi";
import { useTranslation } from "react-i18next";

// ============================================================================
// Component
// ============================================================================
const MenuMng: React.FC = () => {
  const { t } = useTranslation();
  const [menuList, setMenuList] = useState<MenuDto[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuDto | undefined>();
  const [buttonList, setButtonList] = useState<MenuButtonDto[]>([]);
  const [selectedPgmNo, setSelectedPgmNo] = useState<string>("");
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuFormRef = useRef<MenuDetailFormRef>(null);
  const buttonGridRef = useRef<MenuButtonGridRef>(null);

  // 메뉴 버튼 리스트 조회 (먼저 정의)
  const fetchButtonList = useCallback(async (pgmNo: string) => {
    try {
      const response = await getMenuButtonListApi(pgmNo);
      if (response.success && response.data) {
        setButtonList(response.data);
      }
    } catch (error) {
      // 버튼이 없을 수도 있으므로 에러는 무시
    }
  }, []);

  // 메뉴 리스트 조회
  const fetchMenuList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMenuListApi();
      if (response.success && response.data) {
        setMenuList(response.data);
        // 첫 번째 1레벨 메뉴 선택 (초기 로드 시에는 isModified가 false이므로 직접 선택)
        const firstLevel1Menu = response.data.find((menu) => menu.lvl === 1);
        if (firstLevel1Menu?.pgmNo) {
          setSelectedPgmNo(firstLevel1Menu.pgmNo);
          setSelectedMenu(firstLevel1Menu);
          fetchButtonList(firstLevel1Menu.pgmNo);
        }
      }
    } catch (error) {
      message.error(t("MSG_SY_0001"));
    } finally {
      setLoading(false);
    }
  }, [t, fetchButtonList]);

  // 메뉴 선택 핸들러
  const handleMenuSelect = useCallback(
    (pgmNo: string) => {
      if (isModified) {
        Modal.confirm({
          title: t("MSG_SY_0002"),
          content: t("MSG_SY_0003"),
          okText: t("예"),
          cancelText: t("아니오"),
          onOk: () => {
            setIsModified(false);
            setSelectedPgmNo(pgmNo);
            const menu = menuList.find((m) => m.pgmNo === pgmNo);
            setSelectedMenu(menu);
            if (menu?.pgmNo) {
              fetchButtonList(menu.pgmNo);
            }
          },
        });
        return;
      }
      setSelectedPgmNo(pgmNo);
      const menu = menuList.find((m) => m.pgmNo === pgmNo);
      setSelectedMenu(menu);
      if (menu?.pgmNo) {
        fetchButtonList(menu.pgmNo);
      }
    },
    [isModified, menuList, fetchButtonList, t]
  );

  // 메뉴 저장
  const handleSave = useCallback(async () => {
    if (!selectedMenu) {
      message.warning(t("MSG_SY_0004"));
      return;
    }

    // 폼에서 최신 값 가져오기 (날짜 필드 포함)
    const formValues = menuFormRef.current?.getFormValues() || {};
    
    // 체크박스 값 정규화 함수
    const normalizeBoolean = (value: any): "Y" | "N" => {
      if (value === "Y" || value === true) return "Y";
      return "N";
    };
    
    // 체크박스 포함 필드(Y/N 문자열로 정규화)
    const menuForSave: MenuDto = {
      ...selectedMenu,
      ...formValues, // 폼의 최신 값으로 덮어쓰기 (날짜 필드 포함)
      useMenu: normalizeBoolean(formValues.useMenu || selectedMenu.useMenu),
      hidden: normalizeBoolean(formValues.hidden || selectedMenu.hidden),
      // effectiveDateFrom, effectiveDateTo 명시적으로 포함 (폼에서 가져온 값 우선)
      effectiveDateFrom: formValues.effectiveDateFrom || selectedMenu?.effectiveDateFrom || undefined,
      effectiveDateTo: formValues.effectiveDateTo || selectedMenu?.effectiveDateTo || undefined,
    };
    
    // effectiveDateRange 배열이 있으면 제거
    if ((menuForSave as any).effectiveDateRange) {
      delete (menuForSave as any).effectiveDateRange;
    }

    // 버튼 정보: 그리드에서 최신 데이터 가져오기 (편집 중인 셀 값 포함)
    const latestButtonData = buttonGridRef.current?.getGridData() || buttonList || [];
    const buttonsForSave: MenuButtonDto[] = latestButtonData.map(
      (button) => ({
        ...button,
        systemId: button.systemId || menuForSave.systemId,
        pgmNo: button.pgmNo || menuForSave.pgmNo,
      })
    );

    try {
      setLoading(true);
      const response = await saveMenuApi({
        menu: menuForSave,
        buttons: buttonsForSave,
      });

      if (response.success) {
        message.success(t("MSG_SY_0005"));

        // 저장된 메뉴 번호 저장
        const savedPgmNo = selectedMenu.pgmNo;

        // isModified를 먼저 false로 설정 (저장 후 팝업 방지)
        setIsModified(false);

        // 메뉴 리스트 다시 조회
        const updatedMenuListResponse = await getMenuListApi();
        if (updatedMenuListResponse.success && updatedMenuListResponse.data) {
          setMenuList(updatedMenuListResponse.data);

          // 저장 후 같은 메뉴를 다시 선택하되, isModified가 false이므로 팝업이 뜨지 않음
          if (savedPgmNo) {
            // 직접 메뉴 선택 로직 실행 (팝업 없이)
            setSelectedPgmNo(savedPgmNo);
            const menu = updatedMenuListResponse.data.find(
              (m) => m.pgmNo === savedPgmNo
            );
            setSelectedMenu(menu);
            if (menu?.pgmNo) {
              fetchButtonList(menu.pgmNo);
            }
          }
        }
      }
    } catch (error) {
      message.error(t("MSG_SY_0006"));
    } finally {
      setLoading(false);
    }
  }, [selectedMenu, buttonList, fetchButtonList, t]);

  // 메뉴 추가
  const handleAddMenu = useCallback(
    async (parentPgmNo?: string, isChild: boolean = false) => {
      Modal.confirm({
        title: t("MSG_SY_0007"),
        content: t("MSG_SY_0008"),
        okText: t("예"),
        cancelText: t("아니오"),
        onOk: async () => {
          // 하위 메뉴로 추가
          const newMenu: MenuDto = {
            parentPgmNo: isChild ? parentPgmNo : undefined,
            pgmName: "New..",
            useMenu: "N",
            hidden: "N",
            useYn: "N",
            rowStatus: "C",
          };

          try {
            setLoading(true);
            const response = await insertMenuApi(newMenu);
            if (response.success && response.data?.pgmNo) {
              message.success(t("MSG_SY_0009"));
              await fetchMenuList();
              handleMenuSelect(response.data.pgmNo);
            }
          } catch (error) {
            message.error(t("MSG_SY_0010"));
          } finally {
            setLoading(false);
          }
        },
        onCancel: async () => {
          // 동일 레벨로 추가
          const newMenu: MenuDto = {
            parentPgmNo: parentPgmNo,
            pgmName: "New..",
            useMenu: "N",
            hidden: "N",
            useYn: "N",
            rowStatus: "C",
          };

          try {
            setLoading(true);
            const response = await insertMenuApi(newMenu);
            if (response.success && response.data?.pgmNo) {
              message.success(t("MSG_SY_0009"));
              await fetchMenuList();
              handleMenuSelect(response.data.pgmNo);
            }
          } catch (error) {
            message.error(t("MSG_SY_0010"));
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [fetchMenuList, handleMenuSelect, t]
  );

  // 메뉴 삭제
  const handleDeleteMenu = useCallback(
    async (pgmNo: string) => {
      // 하위 메뉴 확인
      const hasChild = menuList.some((menu) => menu.parentPgmNo === pgmNo);

      if (hasChild) {
        message.warning(t("MSG_SY_0011"));
        return;
      }

      Modal.confirm({
        title: t("MSG_SY_0012"),
        content: t("MSG_SY_0013"),
        okText: t("예"),
        cancelText: t("아니오"),
        onOk: async () => {
          try {
            setLoading(true);
            const response = await deleteMenuApi(pgmNo);
            if (response.success) {
              message.success(t("MSG_SY_0014"));
              await fetchMenuList();
              // 부모 메뉴 선택 또는 첫 번째 메뉴 선택
              const deletedMenu = menuList.find((m) => m.pgmNo === pgmNo);
              if (deletedMenu?.parentPgmNo) {
                handleMenuSelect(deletedMenu.parentPgmNo);
              } else {
                const firstLevel1Menu = menuList.find((m) => m.lvl === 1);
                if (firstLevel1Menu?.pgmNo) {
                  handleMenuSelect(firstLevel1Menu.pgmNo);
                }
              }
            }
          } catch (error) {
            message.error(t("MSG_SY_0015"));
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [menuList, fetchMenuList, handleMenuSelect, t]
  );

  // 메뉴 상세 변경 핸들러
  const handleMenuChange = useCallback(
    (_changedValues: Partial<MenuDto>, allValues: MenuDto) => {
      // allValues에 모든 필드가 포함되도록 보장 (effectiveDateFrom, effectiveDateTo 포함)
      setSelectedMenu({
        ...allValues,
        // 날짜 필드가 명시적으로 포함되도록 보장
        effectiveDateFrom: allValues.effectiveDateFrom,
        effectiveDateTo: allValues.effectiveDateTo,
      });
      setIsModified(true);
    },
    []
  );

  // 버튼 리스트 변경 핸들러
  const handleButtonChange = useCallback((modified: boolean) => {
    setIsModified(modified);
  }, []);

  // 버튼 리스트 변경 시 상위 상태 업데이트
  const handleButtonListChange = useCallback((rows: MenuButtonDto[]) => {
    setButtonList(rows);
    setIsModified(true);
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchMenuList();
  }, [fetchMenuList]);

  return (
    <Article className="page-layout page-layout-splitter">
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "5px",
        }}
      >
        <Button
          type="primary"
          onClick={handleSave}
          loading={loading}
          disabled={!selectedMenu || !isModified}
        >
          {t("저장")}
        </Button>
      </div>
      <Splitter>
        <Splitter.Panel defaultSize={300} min={200} max="40%">
          <MenuTree
            menuList={menuList}
            selectedPgmNo={selectedPgmNo}
            onSelect={handleMenuSelect}
            onAddMenu={handleAddMenu}
            onDeleteMenu={handleDeleteMenu}
          />
        </Splitter.Panel>
        <Splitter.Panel>
          <Splitter layout="vertical">
            <Splitter.Panel
              defaultSize={400}
              min={200}
              max="60%"
              style={{ overflow: "auto" }}
            >
              <MenuDetailForm
                ref={menuFormRef}
                menu={selectedMenu}
                onValuesChange={handleMenuChange}
              />
            </Splitter.Panel>
            <Splitter.Panel style={{ overflow: "hidden" }}>
              <MenuButtonGrid
                ref={buttonGridRef}
                rowData={buttonList}
                onModify={handleButtonChange}
                onChange={handleButtonListChange}
              />
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </Article>
  );
};

export default MenuMng;
