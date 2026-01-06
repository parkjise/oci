import { useState, useCallback, useEffect, useRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, SelectionChangedEvent, ICellRendererParams } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { WorkplaceGridStyles, GridContainer } from "./WorkplaceGrid.styles";
import type { WorkplaceDto } from "@apis/system/org/workplaceApi";
import { useTranslation } from "react-i18next";
import { useWorkplaceMngStore } from "@store/system/org/workplace/workplaceMngStore";
import styled from "styled-components";

// ============================================================================
// Internal Styled Components for Status
// ============================================================================
const StatusIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StatusIcon = styled.div<{ $backgroundColor: string; $iconColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$iconColor};
  font-size: 14px;
`;

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<ICellRendererParams<WorkplaceDto>> = ({ value }) => {
  const status = value || "";
  let iconClass = "";
  let backgroundColor = "";
  let iconColor = "";
  let tooltip = "";

  switch (status) {
    case "C":
      iconClass = "ri-add-circle-fill";
      backgroundColor = "#e6f7ff";
      iconColor = "#1890ff";
      tooltip = "추가";
      break;
    case "U":
      iconClass = "ri-edit-circle-fill";
      backgroundColor = "#f6ffed";
      iconColor = "#52c41a";
      tooltip = "수정";
      break;
    case "D":
      iconClass = "ri-delete-bin-fill";
      backgroundColor = "#fff1f0";
      iconColor = "#ff4d4f";
      tooltip = "삭제";
      break;
    default:
      return null;
  }

  return (
    <StatusIconContainer>
      <StatusIcon $backgroundColor={backgroundColor} $iconColor={iconColor} title={tooltip}>
        <i className={iconClass} />
      </StatusIcon>
    </StatusIconContainer>
  );
};

// ============================================================================
// Component
// ============================================================================
const WorkplaceGrid: React.FC = () => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const isRestoringSelectionRef = useRef(false);
  const prevSelectedIdRef = useRef<string | null>(null);

  const {
    workplaceList,
    selectedWorkplace,
    setSelectedWorkplace,
    setSelectedRows,
    loading,
    insert,
    copy,
    remove,
    save,
  } = useWorkplaceMngStore();

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  // 선택 변경 핸들러
  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (isRestoringSelectionRef.current) return;

    const selectedRows = event.api.getSelectedRows();
    const rows = selectedRows as WorkplaceDto[];
    
    setSelectedRows(rows);
    if (rows.length > 0) {
      setSelectedWorkplace(rows[0]);
    } else {
      setSelectedWorkplace(null);
    }
  }, [setSelectedRows, setSelectedWorkplace]);

  // selectedWorkplace 변경 시 그리드 선택 동기화
  useEffect(() => {
    if (!gridApi || !selectedWorkplace) return;

    const currentId = (selectedWorkplace as any).id;
    if (currentId === prevSelectedIdRef.current) return;

    let targetNode: any = null;
    gridApi.forEachNode((node) => {
      // id check
      if (node.data?.id === currentId) {
        targetNode = node;
      }
    });

    if (targetNode) {
      isRestoringSelectionRef.current = true;
      gridApi.deselectAll();
      targetNode.setSelected(true);
      
      // 저장 후 등 스크롤 이동이 필요할 때 보장
      setTimeout(() => {
        gridApi.ensureNodeVisible(targetNode, "middle");
      }, 100);

      prevSelectedIdRef.current = currentId;
      setTimeout(() => {
        isRestoringSelectionRef.current = false;
      }, 50);
    }
  }, [gridApi, selectedWorkplace]);

  // 데이터 변경 시 리프레시
  useEffect(() => {
    if (gridApi) {
      gridApi.refreshCells({ force: true });
      
      // 상태가 하나도 없는 경우 (저장 후) 잔상 제거를 위해 redraw
      const hasAnyStatus = workplaceList.some(c => !!c.rowStatus);
      if (!hasAnyStatus) {
        setTimeout(() => gridApi.redrawRows(), 50);
      }
    }
  }, [gridApi, workplaceList]);

  // workplaceList 변경 시 첫 번째 행 선택 (데이터가 로드되었을 때만)
  useEffect(() => {
    if (gridApi && workplaceList.length > 0) {
      const selectedNodes = gridApi.getSelectedNodes();
      // 선택된 것이 없고, store에도 선택된 것이 없으면 첫번째 선택
      if (selectedNodes.length === 0 && !selectedWorkplace) {
        gridApi.getDisplayedRowAtIndex(0)?.setSelected(true);
      }
    }
  }, [gridApi, workplaceList, selectedWorkplace]);

  const columnDefs: ColDef<WorkplaceDto & { id?: string; chk?: boolean }>[] = [
    {
      width: 30,
      minWidth: 30,
      maxWidth: 30,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      resizable: false,
      suppressHeaderMenuButton: true,
      suppressMovable: true,
      pinned: "left",
      headerName: "",
      field: "chk",
      valueGetter: (params) => params.data?.chk || false,
      valueFormatter: () => "",
    },
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: t("No."),
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
    },
    {
      field: "orgId",
      headerName: t("사업장코드"),
      width: 100,
      editable: false,
      pinned: "left",
    },
    {
      field: "orgNme",
      headerName: t("사업장명"),
      width: 200,
      editable: false,
    },
    {
      field: "orgEngNme",
      headerName: t("사업장명(영문)"),
      width: 250,
      editable: false,
    },
    {
      field: "regtNo",
      headerName: t("사업자번호"),
      width: 120,
      editable: false,
    },
    {
      field: "rpsnNme",
      headerName: t("대표자"),
      width: 100,
      editable: false,
    },
    {
      field: "addr",
      headerName: t("주소"),
      width: 300,
      editable: false,
    },
    {
      field: "enabledFlag",
      headerName: t("사용"),
      width: 80,
      editable: false,
    }
  ];

  return (
    <WorkplaceGridStyles>
      <GridContainer>
        <AgGrid<WorkplaceDto & { id?: string; chk?: boolean }>
          height="100%"
          columnDefs={columnDefs}
          rowData={workplaceList || []}
          loading={loading}
          pagination={false}
          showToolbar={false}
          onAddRow={insert}
          onCopyRow={copy}
          onDeleteRow={remove}
          onSave={save}
          toolbarButtons={{
            showAdd: false,
            showCopy: false,
            showDelete: false,
            showExcelDownload: false,
            showSave: false,
          }}
          onGridReady={handleGridReady}
          onSelectionChanged={handleSelectionChanged}
          rowSelection="single"
          suppressRowClickSelection={true}
          getRowId={(params) => params.data.id || `${params.data.officeId}_${params.data.orgId}`}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          rowHeight={32}
          headerHeight={34}
        />
      </GridContainer>
    </WorkplaceGridStyles>
  );
};

export default WorkplaceGrid;
