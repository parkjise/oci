// ============================================================================
// 다국어 메시지 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent, ICellRendererParams } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { MessageGridStyles } from "./MessageGrid.styles";
import type { MessageDto } from "@apis/system/message/messageApi";
import type { CodeDetail } from "@/types/api.types";
import { useTranslation } from "react-i18next";

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<ICellRendererParams<MessageDto & { id?: string; chk?: boolean }>> = ({ value }) => {
  const status = value || "";
  
  // C (추가), U (수정), D (삭제) 상태 표시
  let icon = null;
  let backgroundColor = "";
  let iconColor = "";
  let iconClass = "";
  let tooltip = "";

  switch (status) {
    case "C": // Create (추가)
      iconClass = "ri-add-circle-fill";
      backgroundColor = "#e6f7ff";
      iconColor = "#1890ff";
      tooltip = "추가";
      break;
    case "U": // Update (수정)
      iconClass = "ri-edit-circle-fill";
      backgroundColor = "#f6ffed";
      iconColor = "#52c41a";
      tooltip = "수정";
      break;
    case "D": // Delete (삭제)
      iconClass = "ri-delete-bin-fill";
      backgroundColor = "#fff1f0";
      iconColor = "#ff4d4f";
      tooltip = "삭제";
      break;
    default:
      // 상태가 없으면 빈 셀 표시
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <span></span>
        </div>
      );
  }

  icon = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: backgroundColor,
        transition: "all 0.2s ease",
      }}
      title={tooltip}
    >
      <i 
        className={iconClass} 
        style={{ 
          color: iconColor, 
          fontSize: "14px",
          lineHeight: "1",
        }} 
      />
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      {icon}
    </div>
  );
};

// ============================================================================
// Types
// ============================================================================
interface MessageGridProps {
  className?: string;
  rowData: (MessageDto & { id?: string; chk?: boolean })[];
  langTypeList: CodeDetail[];
  iconTypeList: CodeDetail[];
  buttonTypeList: CodeDetail[];
  loading?: boolean;
  onModify?: (modified: boolean) => void;
}

export interface MessageGridRef {
  getGridData: () => (MessageDto & { id?: string; chk?: boolean })[];
  getSelectedRows: () => (MessageDto & { id?: string; chk?: boolean })[];
}

// ============================================================================
// Component
// ============================================================================
const MessageGrid = forwardRef<MessageGridRef, MessageGridProps>(({
  className,
  rowData,
  langTypeList,
  iconTypeList,
  buttonTypeList,
  onModify,
}, ref) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<(MessageDto & { id?: string; chk?: boolean })[]>([]);

  // ref를 통해 그리드 데이터를 가져올 수 있도록 expose
  useImperativeHandle(ref, () => ({
    getGridData: () => {
      if (!gridApi) return gridData;
      
      // 그리드에서 현재 데이터 가져오기
      const allRows: (MessageDto & { id?: string; chk?: boolean })[] = [];
      gridApi.forEachNode((node) => {
        if (node.data) {
          allRows.push(node.data);
        }
      });
      return allRows;
    },
    getSelectedRows: () => {
      if (!gridApi) return [];
      return gridApi.getSelectedRows() as (MessageDto & { id?: string; chk?: boolean })[];
    },
  }), [gridApi, gridData]);

  // rowData 변경 시 gridData 업데이트
  useEffect(() => {
    if (rowData) {
      setGridData(rowData);
    } else {
      setGridData([]);
    }
  }, [rowData]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  // 그리드 데이터 변경 핸들러
  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    if (!gridApi || !event.data) return;
    
    // 변경된 행의 rowStatus를 "U"로 설정
    // - rowStatus가 undefined인 경우 (초기 조회 데이터)만 "U"로 설정
    // - 이미 "C"(신규), "D"(삭제), "U"(수정)로 설정된 행은 변경하지 않음
    const rowData = event.data as MessageDto & { id?: string; chk?: boolean };
    if (!rowData.rowStatus || rowData.rowStatus === undefined) {
      rowData.rowStatus = "U";
      // 그리드 데이터 업데이트 및 상태 컬럼 새로고침
      gridApi.applyTransaction({ update: [rowData] });
      // 상태 컬럼 새로고침하여 아이콘이 즉시 업데이트되도록 함
      gridApi.refreshCells({ 
        rowNodes: [event.node!], 
        columns: ["rowStatus"],
        force: true 
      });
    }
    
    if (onModify) {
      onModify(true);
    }
  }, [gridApi, onModify]);

  // 언어 타입 옵션 맵
  const langTypeOptionsMap: Record<string, string> = {};
  langTypeList.forEach((item) => {
    if (item.code && item.name1) {
      langTypeOptionsMap[item.code] = item.name1;
    }
  });

  // 아이콘 타입 옵션 맵
  const iconTypeOptionsMap: Record<string, string> = {};
  iconTypeList.forEach((item) => {
    if (item.code && item.name1) {
      iconTypeOptionsMap[item.code] = item.name1;
    }
  });

  // 버튼 타입 옵션 맵
  const buttonTypeOptionsMap: Record<string, string> = {};
  buttonTypeList.forEach((item) => {
    if (item.code && item.name1) {
      buttonTypeOptionsMap[item.code] = item.name1;
    }
  });

  // 언어 타입 옵션 배열
  const langTypeOptions = langTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  // 아이콘 타입 옵션 배열
  const iconTypeOptions = iconTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  // 버튼 타입 옵션 배열
  const buttonTypeOptions = buttonTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  const columnDefs: ColDef<MessageDto & { id?: string; chk?: boolean }>[] = [
    {
      width: 50,
      headerCheckboxSelection: true,
      // 필터 적용 후 헤더 체크박스는 필터된 행에만 적용되도록 설정
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      resizable: false,
      suppressHeaderMenuButton: true,
      pinned: "left",
      headerName: "", // 헤더 텍스트 제거
      field: "chk",
      valueGetter: (params) => {
        return params.data?.chk || false;
      },
      valueSetter: (params) => {
        if (params.data) {
          params.data.chk = params.newValue;
          return true;
        }
        return false;
      },
      // 셀 텍스트는 표시하지 않고 체크박스만 보이도록 처리
      valueFormatter: () => "",
    },
    {
      field: "rowStatus",
      headerName: t("상태"),
      width: 80,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      cellRenderer: StatusCellRenderer,
      valueGetter: (params) => {
        return params.data?.rowStatus || "";
      },
    },
    {
      headerName: t("No."),
      width: 80,
      editable: false,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex ?? 0;
        return rowIndex + 1;
      },
    },
    {
      field: "lang",
      headerName: t("언어"),
      width: 100,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: langTypeOptions.map((opt) => opt.value),
      },
      valueFormatter: (params) => {
        if (!params.value) return "";
        return langTypeOptionsMap[params.value] || params.value;
      },
    },
    {
      field: "msgKey",
      headerName: t("메시지 키"),
      width: 200,
      editable: true,
    },
    {
      field: "msgContents",
      headerName: t("메시지 내용"),
      width: 350,
      editable: true,
      valueSetter: (params) => {
        if (params.data) {
          params.data.msgContents = params.newValue;
          return true;
        }
        return false;
      },
    },
    {
      field: "msgIconType",
      headerName: t("아이콘타입"),
      width: 120,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: iconTypeOptions.map((opt) => opt.value),
      },
      valueFormatter: (params) => {
        if (!params.value) return "";
        return iconTypeOptionsMap[params.value] || params.value;
      },
    },
    {
      field: "msgButtonType",
      headerName: t("메시지버튼타입"),
      width: 150,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: buttonTypeOptions.map((opt) => opt.value),
      },
      valueFormatter: (params) => {
        if (!params.value) return "";
        return buttonTypeOptionsMap[params.value] || params.value;
      },
    },
    {
      field: "createdBy",
      headerName: t("작성자"),
      width: 100,
      editable: false,
    },
    {
      field: "creationDate",
      headerName: t("작성일자"),
      width: 120,
      editable: false,
      valueFormatter: (params) => {
        if (!params.value) return "";
        // 날짜 포맷팅 (YYYY-MM-DD)
        if (typeof params.value === "string") {
          return params.value.substring(0, 10);
        }
        return params.value;
      },
    },
    {
      field: "lastUpdatedBy",
      headerName: t("수정자"),
      width: 100,
      editable: false,
    },
    {
      field: "lastUpdateDate",
      headerName: t("수정일자"),
      width: 120,
      editable: false,
      valueFormatter: (params) => {
        if (!params.value) return "";
        // 날짜 포맷팅 (YYYY-MM-DD)
        if (typeof params.value === "string") {
          return params.value.substring(0, 10);
        }
        return params.value;
      },
    },
    {
      field: "programId",
      headerName: t("프로그램ID"),
      width: 150,
      editable: false,
    },
    {
      field: "terminalId",
      headerName: t("터미널ID"),
      width: 150,
      editable: false,
    },
  ];

  // getRowId 함수: 각 행의 고유 ID 반환
  const getRowId = useCallback((params: { data: MessageDto & { id?: string; chk?: boolean } }) => {
    return params.data.id || `${params.data.lang}_${params.data.msgKey}`;
  }, []);

  return (
    <MessageGridStyles className={className}>
      <AgGrid<MessageDto & { id?: string; chk?: boolean }>
        height="100%"
        columnDefs={columnDefs}
        rowData={gridData}
        getRowId={getRowId}
        // 메시지관리 화면은 페이징 없이 전체 데이터를 한 번에 보여준다.
        // FormAgGrid 기본값(pagination: true)을 오버라이드한다.
        pagination={false}
        // 상단 공통 툴바는 사용하지 않고, 상위 화면 버튼(검색/입력/삭제/저장)만 사용한다.
        showToolbar={false}
        onGridReady={handleGridReady}
        onCellValueChanged={handleCellValueChanged}
        rowSelection="multiple"
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
        }}
        suppressRowClickSelection={true}
        animateRows={true}
        rowHeight={35}
        headerHeight={35}
      />
    </MessageGridStyles>
  );
});

MessageGrid.displayName = "MessageGrid";

export default MessageGrid;

