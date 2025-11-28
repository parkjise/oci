// ============================================================================
// 메뉴 버튼 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "antd";
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { MenuButtonGridStyles } from "./MenuButtonGrid.styles";
import type { MenuButtonDto } from "@apis/system/menu/menuApi";
import { getCodeDetailApi } from "@apis/comCode";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
interface MenuButtonGridProps {
  className?: string;
  rowData: MenuButtonDto[];
  onModify?: (modified: boolean) => void;
  onChange?: (rows: MenuButtonDto[]) => void;
}

export interface MenuButtonGridRef {
  getGridData: () => MenuButtonDto[];
}

// ============================================================================
// Component
// ============================================================================
const MenuButtonGrid = forwardRef<MenuButtonGridRef, MenuButtonGridProps>(({
  className,
  rowData,
  onModify,
  onChange,
}, ref) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<MenuButtonDto[]>([]);
  const [originalRowData, setOriginalRowData] = useState<MenuButtonDto[]>([]); // 원본 데이터 보관
  const [ynOptions, setYnOptions] = useState<string[]>([]);
  const [ynLabelMap, setYnLabelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // rowData가 변경될 때 gridData 업데이트
    // 원본 데이터도 함께 저장하여 기존 행과 신규 행을 구분
    if (rowData) {
      // 원본 데이터 저장 (서버에서 받은 초기 데이터)
      setOriginalRowData(rowData.map(row => ({ ...row })));
      
      // gridData 업데이트 (rowStatus가 없으면 유지, 신규 행만 "C" 설정)
      const updatedData = rowData.map((row) => {
        // rowStatus가 이미 있으면 유지
        if (row.rowStatus) {
          return { ...row };
        }
        // rowStatus가 없으면 기존 행으로 간주 (서버에서 받은 데이터)
        return { ...row };
      });
      setGridData(updatedData);
    } else {
      setOriginalRowData([]);
      setGridData([]);
    }
  }, [rowData]);

  useEffect(() => {
    // 사용여부/Visible 공통코드(SYS / 00000003) 조회
    const fetchYnCodes = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "SYS",
          type: "00000003",
          enabledFlag: "Y",
        });
        const data = Array.isArray(response.data) ? response.data : [response.data];
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
        // 실패 시 기본값(Y/N) 사용
        setYnOptions(["Y", "N"]);
        setYnLabelMap({ Y: "Y", N: "N" });
        if (import.meta.env.DEV) {
          // 개발 환경에서만 로그 출력
          // eslint-disable-next-line no-console
          console.error("Failed to load 사용여부 코드", error);
        }
      }
    };

    fetchYnCodes();
  }, []);

  const columnDefs: ColDef<MenuButtonDto>[] = [
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
      editable: true,
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
  ];

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // ref를 통해 그리드 데이터를 가져올 수 있도록 expose
  useImperativeHandle(ref, () => ({
    getGridData: () => {
      if (gridApi) {
        // 편집 중인 셀의 편집을 종료하여 최신 값 반영
        gridApi.stopEditing();
      }
      
      // 화면에 표시된 행의 최신 값 수집
      const visibleRowMap = new Map<string, MenuButtonDto>();
      if (gridApi) {
        gridApi.forEachNode((node) => {
          if (node.data) {
            const row = node.data as MenuButtonDto;
            const key = `${row.objId || ''}_${row.pgmNo || ''}`;
            visibleRowMap.set(key, { ...(row as MenuButtonDto) });
          }
        });
      }
      
      // gridData state에서 모든 행 가져오기 (삭제 마킹된 행 포함)
      const updated: MenuButtonDto[] = gridData.map((row) => {
        const key = `${row.objId || ''}_${row.pgmNo || ''}`;
        const visibleRow = visibleRowMap.get(key);
        
        // 화면에 표시된 행이 있으면 최신 값 사용, 없으면 gridData의 값 사용
        const rowData: MenuButtonDto = visibleRow 
          ? { ...visibleRow, rowStatus: row.rowStatus } // rowStatus는 원본 유지
          : { ...row };
        
        // rowStatus 처리 로직
        if (rowData.rowStatus === "C") {
          // 신규 행은 "C" 유지
        } else if (rowData.rowStatus === "D") {
          // 삭제 예정 행은 "D" 유지
        } else if (rowData.rowStatus === "U") {
          // 이미 수정 마킹된 행은 "U" 유지
        } else {
          // rowStatus가 없는 경우: 원본 데이터와 비교하여 기존 행인지 판단
          const originalRow = originalRowData.find(
            (orig) => orig.objId === rowData.objId && orig.pgmNo === rowData.pgmNo
          );
          
          if (originalRow) {
            // 원본 데이터에 있으면 기존 행이 수정된 것
            rowData.rowStatus = "U";
          } else {
            // 원본 데이터에 없으면 신규 행
            rowData.rowStatus = "C";
          }
        }
        
        return rowData;
      });
      
      return updated;
    },
  }), [gridApi, gridData, originalRowData]);

  // 셀 값 변경 핸들러
  const handleCellValueChanged = useCallback(() => {
    // 셀 값이 변경되면 그리드 데이터 업데이트
    const updated: MenuButtonDto[] = [];
    
    // 모든 행 데이터를 다시 수집하여 최신 상태 유지
    if (gridApi) {
      gridApi.forEachNode((node) => {
        if (node.data) {
          const row: MenuButtonDto = { ...(node.data as MenuButtonDto) };
          
          // rowStatus 처리 로직
          if (row.rowStatus === "C") {
            // 신규 행은 "C" 유지
            // 변경 없음
          } else if (row.rowStatus === "D") {
            // 삭제 예정 행은 "D" 유지
            // 변경 없음
          } else if (row.rowStatus === "U") {
            // 이미 수정 마킹된 행은 "U" 유지
            // 변경 없음
          } else {
            // rowStatus가 없는 경우: 원본 데이터와 비교하여 기존 행인지 판단
            const originalRow = originalRowData.find(
              (orig) => orig.objId === row.objId && orig.pgmNo === row.pgmNo
            );
            
            if (originalRow) {
              // 원본 데이터에 있으면 기존 행이 수정된 것
              row.rowStatus = "U";
            } else {
              // 원본 데이터에 없으면 신규 행
              row.rowStatus = "C";
            }
          }
          
          updated.push(row);
        }
      });
    }

    setGridData(updated);
    if (onModify) onModify(true);
    if (onChange) onChange(updated);
  }, [gridApi, originalRowData, onModify, onChange]);

  const handleAddRow = () => {
    const newRow: MenuButtonDto = {
      objId: "",
      objType: "BTN",
      useYn: "Y",
      objName: "",
      visibleYn: "Y",
      rowStatus: "C",
    };
    const updated = [...gridData, newRow];
    setGridData(updated);
    if (onModify) onModify(true);
    if (onChange) onChange(updated);
  };

  const handleDeleteRow = () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    // 선택된 행들을 "D"로 마킹하거나 제거
    const updatedData = gridData.map((row) => {
      const isSelected = selectedRows.some(
        (selected) => selected.objId === row.objId && selected.pgmNo === row.pgmNo
      );
      
      if (isSelected) {
        // 신규 행(C)이면 그냥 제거, 기존 행이면 "D"로 마킹
        if (row.rowStatus === "C") {
          return null; // 제거
        } else {
          return { ...row, rowStatus: "D" as const };
        }
      }
      return row;
    }).filter((row): row is MenuButtonDto => row !== null);

    setGridData(updatedData);
    
    // 그리드 선택 상태 초기화
    gridApi.deselectAll();
    
    if (onModify) onModify(true);
    if (onChange) onChange(updatedData);
  };


  return (
    <MenuButtonGridStyles className={className}>
      <div className="menu-button-grid__header">
        <div className="menu-button-grid__actions">
          <Button
            icon={<i className="ri-add-line" />}
            size="small"
            onClick={handleAddRow}
          >
            {t("추가")}
          </Button>
          <Button
            icon={<i className="ri-delete-bin-line" />}
            size="small"
            onClick={handleDeleteRow}
          />
        </div>
      </div>
      <div className="menu-button-grid__content">
        <AgGrid<MenuButtonDto & { id?: string }>
          rowData={gridData.filter(row => row.rowStatus !== "D").map(row => ({ ...row, id: `${row.objId || ''}_${row.pgmNo || ''}` }))}
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
            getRowId: (params) => `${params.data.objId || ''}_${params.data.pgmNo || ''}`,
          }}
        />
      </div>
    </MenuButtonGridStyles>
  );
});

MenuButtonGrid.displayName = "MenuButtonGrid";

export default MenuButtonGrid;


