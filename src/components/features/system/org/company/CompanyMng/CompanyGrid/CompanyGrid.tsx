// ============================================================================
// 법인 관리 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2024.12.26 : Antigravity (Store 패턴 적용 및 리팩토링)

import { useState, useCallback, forwardRef, useEffect, useRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, SelectionChangedEvent, ICellRendererParams } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { CompanyGridStyles, GridContainer } from "./CompanyGrid.styles";
import type { CompanyDto } from "@apis/system/org/companyApi";
import { useTranslation } from "react-i18next";
import { useCompanyMngStore } from "@store/system/org/company/companyMngStore";
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
const StatusCellRenderer: React.FC<ICellRendererParams<CompanyDto>> = ({ value }) => {
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
// Types
// ============================================================================
interface CompanyGridProps {
  className?: string;
}

// ============================================================================
// Component
// ============================================================================
const CompanyGrid = forwardRef<any, CompanyGridProps>(({
  className,
}, _ref) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const isRestoringSelectionRef = useRef(false);
  const prevSelectedIdRef = useRef<string | null>(null);

  const {
    companyList,
    selectedCompany,
    setSelectedCompany,
    setSelectedRows,
    loading,
    insert,
    copy,
    remove,
    save,
  } = useCompanyMngStore();

  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  // 선택 변경 핸들러
  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (isRestoringSelectionRef.current) return;

    const selectedRows = event.api.getSelectedRows();
    const rows = selectedRows as CompanyDto[];
    
    setSelectedRows(rows);
    if (rows.length > 0) {
      setSelectedCompany(rows[0]);
    } else {
      setSelectedCompany(null);
    }
  }, [setSelectedRows, setSelectedCompany]);

  // selectedCompany 변경 시 그리드 선택 동기화
  useEffect(() => {
    if (!gridApi || !selectedCompany) return;

    const currentId = selectedCompany.officeId || (selectedCompany as any).id;
    if (currentId === prevSelectedIdRef.current) return;

    let targetNode: any = null;
    gridApi.forEachNode((node) => {
      const nodeId = node.data?.officeId || node.data?.id;
      if (nodeId === currentId) {
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
  }, [gridApi, selectedCompany]);

  // 데이터 변경 시 리프레시
  useEffect(() => {
    if (gridApi) {
      gridApi.refreshCells({ force: true });
      
      // 상태가 하나도 없는 경우 (저장 후) 잔상 제거를 위해 redraw
      const hasAnyStatus = companyList.some(c => !!c.rowStatus);
      if (!hasAnyStatus) {
        setTimeout(() => gridApi.redrawRows(), 50);
      }
    }
  }, [gridApi, companyList]);

  // companyList 변경 시 첫 번째 행 선택 (데이터가 로드되었을 때만)
  useEffect(() => {
    if (gridApi && companyList.length > 0) {
      const selectedNodes = gridApi.getSelectedNodes();
      if (selectedNodes.length === 0 && !selectedCompany) {
        gridApi.getDisplayedRowAtIndex(0)?.setSelected(true);
      }
    }
  }, [gridApi, companyList, selectedCompany]);

  const columnDefs: ColDef<CompanyDto & { id?: string; chk?: boolean }>[] = [
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
      valueSetter: (params) => {
        if (params.data) {
          params.data.chk = params.newValue;
          return true;
        }
        return false;
      },
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
      field: "officeId",
      headerName: t("회사코드"),
      width: 100,
      editable: false,
      pinned: "left",
    },
    {
      field: "officeNme",
      headerName: t("회사명"),
      width: 200,
      editable: false,
    },
    {
      field: "officeEngNme",
      headerName: t("회사명(영문)"),
      width: 300,
      editable: false,
    },
    {
      field: "rpsnNme",
      headerName: t("대표자"),
      width: 150,
      editable: false,
    },
    {
      field: "corpNo",
      headerName: t("법인번호"),
      width: 150,
      editable: false,
    },
    {
      field: "addr",
      headerName: t("주소"),
      width: 400,
      editable: false,
    },
  ];

  return (
    <CompanyGridStyles className={className}>
      <GridContainer>
        <AgGrid<CompanyDto & { id?: string; chk?: boolean }>
          height="100%"
          columnDefs={columnDefs}
          rowData={companyList || []}
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
          getRowId={(params) => params.data.officeId || params.data.id}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          rowHeight={32}
          headerHeight={34}
        />
      </GridContainer>
    </CompanyGridStyles>
  );
});

CompanyGrid.displayName = "CompanyGrid";

export default CompanyGrid;
