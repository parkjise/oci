// ============================================================================
// 메뉴 버튼 그리드 컴포넌트
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  ColDef,
  GridReadyEvent,
  GridApi,
  CellEditingStoppedEvent,
} from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { MenuButtonGridStyles } from "./MenuButtonGrid.styles";
import type { MenuButtonDto } from "@apis/system/menu/menuApi";
import { getCodeDetailApi } from "@apis/com/code";
import { useTranslation } from "react-i18next";
import { useMenuMngStore } from "@store/system/pgm/access/menu/menuMngStore";
import { message } from "antd";

// ============================================================================
// Component
// ============================================================================
const MenuButtonGrid: React.FC = () => {
  const { t } = useTranslation();
  const {
    buttonList,
    setButtonList,
    setIsModified,
    isModified,
    selectedMenu,
    setButtonGridApi,
  } = useMenuMngStore();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [ynOptions, setYnOptions] = useState<string[]>([]);
  const [ynLabelMap, setYnLabelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // 사용여부/Visible 공통코드(SYS / 00000003) 조회
    const fetchYnCodes = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "SYS",
          type: "00000003",
          enabledFlag: "Y",
        });
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        const values: string[] = [];
        const labelMap: Record<string, string> = {};
        (data as any[]).forEach((item) => {
          if (item.code) {
            values.push(item.code);
            if (item.name1) {
              labelMap[item.code] = item.name1;
            }
          }
        });
        if (values.length > 0) {
          setYnOptions(values);
          setYnLabelMap(labelMap);
        } else {
          setYnOptions(["Y", "N"]);
          setYnLabelMap({ Y: "Y", N: "N" });
        }
      } catch (error) {
        setYnOptions(["Y", "N"]);
        setYnLabelMap({ Y: "Y", N: "N" });
      }
    };

    fetchYnCodes();
  }, []);

  const columnDefs: ColDef<MenuButtonDto>[] = useMemo(
    () => [
      {
        width: 50,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        resizable: false,
        suppressHeaderMenuButton: true,
        pinned: "left",
      },
      {
        field: "objId",
        headerName: t("컨트롤명"),
        width: 150,
        editable: (params) => {
          // 새로 추가된 행(rowStatus가 "C")은 항상 편집 가능
          // 저장된 데이터(rowStatus가 "C"가 아닌 경우)는 objId 변경 불가 (objId가 PK이므로)
          const rowStatus = params.data?.rowStatus;

          // rowStatus가 "C"인 경우는 항상 편집 가능 (objId 입력 중에도 편집 가능하도록)
          return rowStatus === "C";
        },
      },
      {
        field: "objType",
        headerName: t("컨트롤타입"),
        width: 150,
        editable: false,
      },
      {
        field: "useYn",
        headerName: t("사용여부"),
        width: 100,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ynOptions,
        },
        valueFormatter: (params) =>
          params.value && ynLabelMap[params.value as string]
            ? ynLabelMap[params.value as string]
            : params.value || "",
      },
      {
        field: "objName",
        headerName: t("명칭"),
        width: 200,
        editable: true,
      },
      {
        field: "visibleYn",
        headerName: t("Visible"),
        width: 100,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ynOptions,
        },
        valueFormatter: (params) =>
          params.value && ynLabelMap[params.value as string]
            ? ynLabelMap[params.value as string]
            : params.value || "",
      },
    ],
    [t, ynOptions, ynLabelMap]
  );

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setButtonGridApi(params.api); // Store에 gridApi 저장
  };

  const handleCellValueChanged = useCallback(
    (params: any) => {
      if (!gridApi) return;

      // objId 중복 체크는 편집 종료 시점에 처리
      // 여기서는 store 업데이트만 수행
      if (params.colDef?.field === "objId") {
        // 편집 중에는 store 업데이트하지 않음 (편집 종료 시점에 처리)
        return;
      }

      // gridData update logic from visual grid
      const updatedRows: MenuButtonDto[] = [];
      gridApi.forEachNode((node) => {
        if (node.data) {
          const row = { ...node.data } as MenuButtonDto;
          if (!row.rowStatus) row.rowStatus = "U";
          updatedRows.push(row);
        }
      });

      setButtonList(updatedRows);
      if (!isModified) setIsModified(true);
    },
    [gridApi, setButtonList, isModified, setIsModified]
  );

  // 편집 종료 핸들러 (objId 변경 시에는 store 업데이트하지 않음, 저장 시점에 처리)
  const handleCellEditingStopped = useCallback(
    (params: CellEditingStoppedEvent) => {
      if (!gridApi) return;

      // objId 편집 종료 시에는 store를 업데이트하지 않음 (행 유지를 위해)
      // 저장 시점에 그리드에서 최신 데이터를 가져와서 처리
      if (params.column?.getColId() === "objId") {
        // objId 변경 시에는 그리드 노드의 데이터만 유지하고 store는 업데이트하지 않음
        // 이렇게 하면 getRowId가 변경되어도 행이 사라지지 않음
        return;
      }

      // objId가 아닌 다른 필드 변경 시에만 store 업데이트
      const updatedRows: MenuButtonDto[] = [];
      gridApi.forEachNode((node) => {
        if (node.data) {
          const row = { ...node.data } as MenuButtonDto;
          if (!row.rowStatus) row.rowStatus = "U";
          updatedRows.push(row);
        }
      });

      setButtonList(updatedRows);
      if (!isModified) setIsModified(true);
    },
    [gridApi, setButtonList, isModified, setIsModified]
  );

  const handleAddRow = useCallback(() => {
    if (!selectedMenu?.pgmNo) {
      message.warning(t("메뉴를 선택해주세요."));
      return;
    }

    if (!gridApi) return;

    // 그리드에서 현재 최신 데이터를 먼저 가져와서 store 동기화
    // (objId 편집 종료 시 store가 업데이트되지 않았을 수 있으므로)
    const currentGridData: MenuButtonDto[] = [];
    gridApi.forEachNode((node) => {
      if (node.data) {
        const row = { ...node.data } as MenuButtonDto;
        if (!row.rowStatus) row.rowStatus = "U";
        currentGridData.push(row);
      }
    });

    // store의 buttonList에서 삭제 상태인 행들을 찾아서 추가
    const deletedButtons = buttonList.filter(
      (btn) => btn.rowStatus === "D" && btn.pgmNo === selectedMenu.pgmNo
    );

    // 그리드 데이터와 삭제 상태인 행들을 병합
    const syncedButtonList = [...currentGridData, ...deletedButtons];

    // 고유한 임시 ID 생성 (objId가 빈 문자열일 때 AgGrid rowId로 사용)
    const tempId = `TEMP_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newRow: MenuButtonDto & { tempId?: string } = {
      objId: "",
      pgmNo: selectedMenu.pgmNo,
      objType: "BTN",
      useYn: "Y",
      objName: "",
      visibleYn: "Y",
      rowStatus: "C",
      tempId, // 임시 고유 ID 저장
    };

    const updated = [...syncedButtonList, newRow];
    setButtonList(updated);
    if (!isModified) setIsModified(true);
  }, [
    gridApi,
    buttonList,
    selectedMenu,
    setButtonList,
    isModified,
    setIsModified,
    t,
  ]);

  const handleDeleteRow = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows() as (MenuButtonDto & {
      tempId?: string;
      id?: string;
    })[];
    if (selectedRows.length === 0) return;

    // 그리드에서 현재 최신 데이터를 먼저 가져와서 store 동기화
    const currentGridData: MenuButtonDto[] = [];
    gridApi.forEachNode((node) => {
      if (node.data) {
        const row = { ...node.data } as MenuButtonDto;
        if (!row.rowStatus) row.rowStatus = "U";
        currentGridData.push(row);
      }
    });

    // store의 buttonList에서 삭제 상태인 행들을 찾아서 추가
    const deletedButtons = buttonList.filter(
      (btn) => btn.rowStatus === "D" && btn.pgmNo === selectedMenu?.pgmNo
    );

    // 그리드 데이터와 삭제 상태인 행들을 병합
    const syncedButtonList = [...currentGridData, ...deletedButtons];

    const updatedList = syncedButtonList
      .map((row) => {
        const rowWithTemp = row as MenuButtonDto & { tempId?: string };
        // objId가 있으면 objId와 pgmNo로 매칭, 없으면 tempId로 매칭
        const isSelected = selectedRows.some((s) => {
          if (rowWithTemp.objId && s.objId) {
            return (
              s.objId === rowWithTemp.objId && s.pgmNo === rowWithTemp.pgmNo
            );
          }
          // objId가 없는 새 행은 tempId로 매칭
          return (
            s.tempId === rowWithTemp.tempId && s.pgmNo === rowWithTemp.pgmNo
          );
        });

        if (isSelected) {
          if (row.rowStatus === "C") return null; // 새로 추가된 행은 완전히 제거
          return { ...row, rowStatus: "D" }; // 기존 행은 삭제 상태로 표시
        }
        return row;
      })
      .filter((r): r is MenuButtonDto => r !== null);

    setButtonList(updatedList);
    if (!isModified) setIsModified(true);
  }, [
    gridApi,
    buttonList,
    selectedMenu,
    setButtonList,
    isModified,
    setIsModified,
  ]);

  // rowData를 고유 ID와 함께 매핑
  const mappedRowData = useMemo(() => {
    return buttonList
      .filter((row) => row.rowStatus !== "D")
      .map((row, index) => {
        const tempId = (row as any).tempId;
        const existingId = (row as any).id;
        // tempId를 우선 사용 (새로 추가된 행은 항상 tempId를 가짐)
        // tempId가 없고 objId가 있을 때만 objId_pgmNo 조합 사용
        const uniqueId = tempId
          ? tempId
          : row.objId
          ? `${row.objId}_${row.pgmNo || ""}`
          : existingId ||
            `NEW_${row.pgmNo || ""}_${index}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
        return { ...row, id: uniqueId };
      });
  }, [buttonList]);

  return (
    <MenuButtonGridStyles className="menu-button-grid">
      <div className="menu-button-grid__content">
        <AgGrid<MenuButtonDto & { id?: string; tempId?: string }>
          rowData={mappedRowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellValueChanged={handleCellValueChanged}
          headerHeight={32}
          rowHeight={32}
          defaultColDef={{
            sortable: false,
            filter: false,
            suppressHeaderMenuButton: true,
            resizable: true,
          }}
          gridOptions={{
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            pagination: false,
            stopEditingWhenCellsLoseFocus: true,
            getRowId: (params) => {
              // tempId를 우선 사용 (새로 추가된 행은 항상 tempId를 가짐)
              // tempId가 없고 objId가 있을 때만 objId_pgmNo 조합 사용
              const data = params.data as MenuButtonDto & {
                tempId?: string;
                id?: string;
              };
              if (data.tempId) {
                return data.tempId;
              }
              if (data.objId) {
                return `${data.objId}_${data.pgmNo || ""}`;
              }
              // 고유 ID 생성: timestamp + random 조합
              return (
                data.id ||
                `ROW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              );
            },
            onCellEditingStopped: handleCellEditingStopped,
          }}
          showToolbar={true}
          toolbarButtons={{
            showAdd: true,
            showDelete: true,
            showSave: false, // Save is handled by parent form usually, or global save? MenuMng has global save.
            showCopy: false,
          }}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
        />
      </div>
    </MenuButtonGridStyles>
  );
};

export default MenuButtonGrid;
