// ============================================================================
// 권한 사용자 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColDef, GridReadyEvent, GridApi } from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { RoleUserGridStyles } from "./RoleUserGrid.styles";
import type { RoleUserDto } from "@apis/system/permission/permissionApi";
import type { CodeDetail } from "@/types/api.types";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
interface RoleUserGridProps {
  className?: string;
  roleUserList: RoleUserDto[];
  authTypeList: CodeDetail[];
  onModify?: (modified: boolean) => void;
  onAddUser?: () => void;
  onDeleteUser?: (roleUser: RoleUserDto) => void;
  onRestore?: () => void;
}

// ============================================================================
// Component
// ============================================================================
const RoleUserGrid: React.FC<RoleUserGridProps> = ({
  className,
  roleUserList,
  authTypeList,
  onModify,
  onAddUser,
  onDeleteUser,
  onRestore,
}) => {
  const { t } = useTranslation();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<(RoleUserDto & { id?: string })[]>([]);

  useEffect(() => {
    if (roleUserList) {
      // id 필드 추가 (FormAgGrid 요구사항)
      const dataWithId = roleUserList.map((item, index) => ({
        ...item,
        id: item.roleNo ? `${item.roleNo}_${item.typeId}_${index}` : `row_${index}`,
      }));
      setGridData(dataWithId);
    } else {
      setGridData([]);
    }
  }, [roleUserList]);

  // 그리드 준비 핸들러
  const handleGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  // 그리드 데이터 변경 핸들러
  const handleCellValueChanged = useCallback(() => {
    if (onModify) {
      onModify(true);
    }
  }, [onModify]);

  // 선택된 행 삭제
  const handleDelete = useCallback(() => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows() as (RoleUserDto & { id?: string })[];
    if (selectedRows.length === 0) {
      return;
    }
    if (onDeleteUser && selectedRows[0]) {
      // id 필드 제거 후 전달
      const { id, ...roleUser } = selectedRows[0];
      onDeleteUser(roleUser);
    }
  }, [gridApi, onDeleteUser]);

  // 권한 타입 라벨 맵
  const authTypeLabelMap: Record<string, string> = {};
  authTypeList.forEach((item) => {
    if (item.code && item.name1) {
      authTypeLabelMap[item.code] = item.name1;
    }
  });

  const columnDefs: ColDef<RoleUserDto & { id?: string }>[] = [
    {
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      resizable: false,
      suppressHeaderMenuButton: true,
      pinned: "left",
    },
    {
      headerName: t("No."),
      width: 60,
      editable: false,
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex ?? 0;
        return rowIndex + 1;
      },
      sortable: false,
      filter: false,
    },
    {
      headerName: t("상태"),
      width: 80,
      editable: false,
      valueGetter: () => "", // 상태는 추후 구현
      sortable: false,
      filter: false,
    },
    {
      field: "typeId",
      headerName: t("ID"),
      width: 100,
      editable: false,
    },
    {
      field: "typeName",
      headerName: t("NAME"),
      width: 120,
      editable: false,
    },
  ];

  return (
    <RoleUserGridStyles className={className}>
      <div style={{ marginBottom: "10px", display: "flex", gap: "5px", justifyContent: "space-between" }}>
        <Space>
          <Button onClick={onRestore}>{t("복구")}</Button>
          <Button onClick={onAddUser}>{t("추가")}</Button>
          <Button onClick={handleDelete} danger>
            {t("삭제")}
          </Button>
        </Space>
        <Space.Compact style={{ width: "200px" }}>
          <Input
            placeholder={t("검색")}
            prefix={<SearchOutlined />}
          />
        </Space.Compact>
      </div>
      <AgGrid<RoleUserDto & { id?: string }>
        columnDefs={columnDefs}
        rowData={gridData}
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
    </RoleUserGridStyles>
  );
};

export default RoleUserGrid;

