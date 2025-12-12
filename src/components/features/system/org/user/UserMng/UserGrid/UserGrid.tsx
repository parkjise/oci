// ============================================================================
// 사용자 관리 그리드 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.03 : ckkim (비밀번호변경일자, 시작일자, 직위, 사원번호, 구매결의권한, 근무장소 필드 추가)

import {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import type {
  ColDef,
  GridReadyEvent,
  GridApi,
  CellValueChangedEvent,
  ICellRendererParams,
  SelectionChangedEvent,
  RowClickedEvent,
} from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { UserGridStyles, GridContainer } from "./UserGrid.styles";
import type { UserDto } from "@apis/system/user/userApi";
import { useTranslation } from "react-i18next";

// ============================================================================
// Types
// ============================================================================
interface UserGridProps {
  className?: string;
  rowData: (UserDto & { id?: string; chk?: boolean })[];
  loading?: boolean;
  onModify?: (modified: boolean) => void;
  onAddRow?: (gridApi: any) => void;
  onDeleteRow?: (gridApi: any) => void;
  onSave?: () => void;
  isModified?: boolean;
  totalCount?: number;
  onRowSelection?: (selectedRows: UserDto[]) => void;
  orgList?: Array<{ value: string; label: string }>; // 사업장 목록 (코드-라벨 매핑용)
}

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<
  ICellRendererParams<UserDto & { id?: string; chk?: boolean }>
> = ({ value }) => {
  const status = value || "";

  let icon = null;
  let backgroundColor = "";
  let iconColor = "";
  let iconClass = "";
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
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {icon}
    </div>
  );
};

export interface UserGridRef {
  getGridData: () => (UserDto & { id?: string; chk?: boolean })[];
  getSelectedRows: () => (UserDto & { id?: string; chk?: boolean })[];
  getGridApi: () => GridApi | null;
}

// ============================================================================
// Component
// ============================================================================
const UserGrid = forwardRef<UserGridRef, UserGridProps>(
  (
    {
      className,
      rowData,
      onModify,
      onAddRow,
      onDeleteRow,
      onSave,
      onRowSelection,
      orgList = [],
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const isInitialLoadRef = useRef<boolean>(true); // 최초 로드 여부 추적
    const prevSelectedEmpCodeRef = useRef<string | null>(null); // 이전 선택된 행의 empCode 추적

    // AP 권한 코드를 라벨로 변환
    const getAcpayRoleLabel = (code: string | undefined): string => {
      if (!code) return "";
      switch (code) {
        case "A":
          return "Corporation";
        case "B":
          return "Department";
        case "C":
          return "Individual";
        default:
          return code;
      }
    };

    // 구매요청권한 코드를 라벨로 변환
    const getPurreqRoleLabel = (code: string | undefined): string => {
      if (!code) return "";
      switch (code) {
        case "C":
          return t("회사");
        case "O":
          return t("사업장");
        case "D":
          return t("부서");
        case "P":
          return t("개인");
        case "":
          return t("없음");
        default:
          return code;
      }
    };

    // 사업장 코드를 라벨로 변환
    const getOrgLabel = (code: string | undefined): string => {
      if (!code) return "";
      const org = orgList.find((item) => item.value === code);
      return org?.label || code;
    };

    useImperativeHandle(
      ref,
      () => ({
        getGridData: () => {
          if (!gridApi) return rowData || [];

          const allRows: (UserDto & { id?: string; chk?: boolean })[] = [];
          gridApi.forEachNode((node) => {
            if (node.data) {
              allRows.push(node.data);
            }
          });
          return allRows;
        },
        getSelectedRows: () => {
          if (!gridApi) return [];
          return gridApi.getSelectedRows() as (UserDto & {
            id?: string;
            chk?: boolean;
          })[];
        },
        getGridApi: () => {
          return gridApi;
        },
      }),
      [gridApi, rowData]
    );

    const handleGridReady = useCallback((event: GridReadyEvent) => {
      setGridApi(event.api);
      // handleGridReady에서는 선택하지 않음 (useEffect에서 처리)
    }, []);

    // 수정 상태인 행이 있는지 확인하는 헬퍼 함수
    const hasModifiedRow = useCallback(
      (gridApi: GridApi, excludeEmpCode?: string | null): boolean => {
        if (!gridApi) return false;

        const allRows = gridApi
          .getRenderedNodes()
          .map((node) => node.data as UserDto)
          .filter(
            (row) => row && (!excludeEmpCode || row.empCode !== excludeEmpCode)
          );

        return allRows.some(
          (row) =>
            row.rowStatus === "U" ||
            row.rowStatus === "C" ||
            row.rowStatus === "D"
        );
      },
      []
    );

    // 행 클릭 핸들러 - 수정 상태인 행이 있으면 다른 행 선택 방지
    const handleRowClicked = useCallback(
      (event: RowClickedEvent) => {
        if (!gridApi || !event.data) return;

        const clickedRow = event.data as UserDto;
        const currentSelectedRows = gridApi.getSelectedRows() as UserDto[];
        const currentSelectedEmpCode =
          currentSelectedRows.length > 0
            ? currentSelectedRows[0].empCode
            : null;

        // 클릭한 행이 이미 선택된 행이면 허용
        if (currentSelectedEmpCode === clickedRow.empCode) {
          prevSelectedEmpCodeRef.current = clickedRow.empCode;
          return;
        }

        // 수정 상태인 행이 있는지 확인 (현재 선택된 행 제외)
        const hasModified = hasModifiedRow(gridApi, currentSelectedEmpCode);

        // 수정 상태인 행이 있으면 다른 행 선택 방지
        if (hasModified) {
          // 즉시 선택 방지
          event.node.setSelected(false);
          // 이전 선택 상태 즉시 복원
          if (currentSelectedEmpCode) {
            gridApi.forEachNode((node) => {
              if (node.data?.empCode === currentSelectedEmpCode) {
                node.setSelected(true);
              } else {
                node.setSelected(false);
              }
            });
          } else {
            // 선택된 행이 없으면 모든 선택 해제
            gridApi.deselectAll();
          }
          return;
        }

        // 수정 상태인 행이 없으면 선택 허용
        prevSelectedEmpCodeRef.current = clickedRow.empCode;
      },
      [gridApi, hasModifiedRow]
    );

    // 행 선택 변경 핸들러
    const handleSelectionChanged = useCallback(
      (event: SelectionChangedEvent) => {
        const selectedRows = event.api.getSelectedRows() as UserDto[];

        // 수정 상태인 행이 있는지 확인
        const allRows = event.api
          .getRenderedNodes()
          .map((node) => node.data as UserDto)
          .filter((row) => row);

        const hasModified = allRows.some(
          (row) =>
            row.rowStatus === "U" ||
            row.rowStatus === "C" ||
            row.rowStatus === "D"
        );

        if (hasModified && selectedRows.length > 0) {
          const newSelectedUser = selectedRows[0];

          // 이전 선택된 행이 수정 상태인지 확인
          if (prevSelectedEmpCodeRef.current) {
            const prevSelectedRow = allRows.find(
              (row) => row.empCode === prevSelectedEmpCodeRef.current
            );

            if (prevSelectedRow) {
              const isPrevRowModified =
                prevSelectedRow.rowStatus === "U" ||
                prevSelectedRow.rowStatus === "C" ||
                prevSelectedRow.rowStatus === "D";

              // 이전 선택된 행이 수정 상태이고, 다른 행을 선택하려고 하면 즉시 방지
              if (
                isPrevRowModified &&
                newSelectedUser.empCode !== prevSelectedEmpCodeRef.current
              ) {
                // 즉시 선택 취소 및 이전 선택 상태로 복원
                event.api.deselectAll();
                event.api.forEachNode((node) => {
                  if (node.data?.empCode === prevSelectedEmpCodeRef.current) {
                    node.setSelected(true);
                  } else {
                    node.setSelected(false);
                  }
                });
                // onRowSelection 호출하지 않음 (선택 방지)
                return;
              }
            }
          }

          // 다른 수정 상태인 행이 있는지 확인
          const hasOtherModifiedRow = allRows.some(
            (row) =>
              row.empCode !== newSelectedUser.empCode &&
              (row.rowStatus === "U" ||
                row.rowStatus === "C" ||
                row.rowStatus === "D")
          );

          // 다른 수정 상태인 행이 있으면 다른 행 선택 즉시 방지
          if (
            hasOtherModifiedRow &&
            prevSelectedEmpCodeRef.current &&
            newSelectedUser.empCode !== prevSelectedEmpCodeRef.current
          ) {
            // 즉시 선택 취소 및 이전 선택 상태로 복원
            event.api.deselectAll();
            event.api.forEachNode((node) => {
              if (node.data?.empCode === prevSelectedEmpCodeRef.current) {
                node.setSelected(true);
              } else {
                node.setSelected(false);
              }
            });
            // onRowSelection 호출하지 않음 (선택 방지)
            return;
          }

          // 선택 성공 시 이전 선택 추적
          prevSelectedEmpCodeRef.current = newSelectedUser.empCode;
        } else if (selectedRows.length > 0) {
          // 수정 상태인 행이 없으면 선택 허용
          prevSelectedEmpCodeRef.current = selectedRows[0].empCode;
        } else {
          // 선택 해제 시 이전 선택 초기화
          prevSelectedEmpCodeRef.current = null;
        }

        if (onRowSelection) {
          onRowSelection(selectedRows);
        }
      },
      [onRowSelection]
    );

    const handleCellValueChanged = useCallback(
      (event: CellValueChangedEvent) => {
        if (!gridApi || !event.data) return;

        const rowData = event.data as UserDto & { id?: string; chk?: boolean };
        if (!rowData.rowStatus || rowData.rowStatus === undefined) {
          rowData.rowStatus = "U";
          gridApi.applyTransaction({ update: [rowData] });
          gridApi.refreshCells({
            rowNodes: [event.node!],
            columns: ["rowStatus"],
            force: true,
          });
        }

        if (onModify) {
          onModify(true);
        }
      },
      [gridApi, onModify]
    );

    // 최초 로드 시에만 첫 번째 행 자동 선택
    useEffect(() => {
      if (
        gridApi &&
        rowData &&
        rowData.length > 0 &&
        isInitialLoadRef.current
      ) {
        // 약간의 지연을 두어 그리드가 완전히 렌더링된 후 선택
        const timeoutId = setTimeout(() => {
          // 다시 한 번 확인 (타이밍 이슈 방지)
          if (!isInitialLoadRef.current) {
            return;
          }
          const firstRow = gridApi.getDisplayedRowAtIndex(0);
          const selectedRows = gridApi.getSelectedRows();
          // 선택된 행이 없고 첫 번째 행이 존재할 때만 자동 선택
          if (firstRow && firstRow.data && selectedRows.length === 0) {
            gridApi.setNodesSelected({ nodes: [firstRow], newValue: true });
            if (onRowSelection) {
              const newSelectedRows = gridApi.getSelectedRows() as UserDto[];
              if (newSelectedRows.length > 0) {
                onRowSelection(newSelectedRows);
              }
            }
            // 최초 로드 완료 표시
            isInitialLoadRef.current = false;
          }
        }, 300);

        return () => clearTimeout(timeoutId);
      }
    }, [gridApi, rowData, onRowSelection]);

    // AS-IS 순서: chk, ORG_ID(소속사업장), SUB_ORG_ID(종사업장), DEPT_CODE(부서코드), DEPT_NME(부서명),
    // EMP_CODE(사용자ID), EMP_NAME(사용자명), EMP_ABB_NAME(사용자약어), ACPAY_ROLE(AP권한),
    // PURREQ_ROLE(구매요청권한), APPL_USE_YN(구매결의자), EMAIL_ID(MAIL ID), BUYER_YN(영업사원여부), USE_YN(사용여부)
    const columnDefs: ColDef<UserDto & { id?: string; chk?: boolean }>[] = [
      {
        width: 50,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        resizable: false,
        suppressHeaderMenuButton: true,
        pinned: "left",
        headerName: "",
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
        field: "orgId" as any, // AS-IS: ORG_ID (소속사업장)
        headerName: t("소속사업장"),
        width: 120,
        editable: true,
        valueGetter: (params) => {
          // AS-IS: ORG_ID 사용
          const data = params.data as UserDto & {
            id?: string;
            chk?: boolean;
            orgId?: string;
          };
          return data?.orgId || "";
        },
        valueSetter: (params) => {
          if (params.data) {
            const data = params.data as UserDto & {
              id?: string;
              chk?: boolean;
              orgId?: string;
            };
            // orgId 업데이트
            data.orgId = params.newValue;
            return true;
          }
          return false;
        },
        valueFormatter: (params) => {
          // 코드를 라벨로 표시
          const data = params.data as UserDto & {
            id?: string;
            chk?: boolean;
            orgId?: string;
          };
          const code = params.value || data?.orgId;
          return getOrgLabel(code);
        },
      },
      {
        field: "subOrgId", // AS-IS: SUB_ORG_ID (종사업장)
        headerName: t("종사업장"),
        width: 120,
        editable: true,
        valueFormatter: (params) => {
          // 코드를 라벨로 표시
          return getOrgLabel(params.value);
        },
      },
      {
        field: "deptCode",
        headerName: t("부서코드"),
        width: 100,
        editable: true,
        hide: true,
      },
      {
        field: "deptName",
        headerName: t("부서명"),
        width: 200,
        editable: false,
      },
      {
        field: "empCode",
        headerName: t("사용자ID"),
        width: 120,
        editable: true,
        pinned: "left",
      },
      {
        field: "empName",
        headerName: t("사용자명"),
        width: 120,
        editable: true,
      },
      {
        field: "empAbbName",
        headerName: t("사용자약어"),
        width: 120,
        editable: true,
      },
      {
        field: "acpayRole", // AS-IS: ACPAY_ROLE (AP권한)
        headerName: t("AP권한"),
        width: 100,
        editable: true,
        valueFormatter: (params) => {
          // 코드를 라벨로 표시
          return getAcpayRoleLabel(params.value);
        },
      },
      {
        field: "purreqRole", // AS-IS: PURREQ_ROLE (구매요청권한)
        headerName: t("구매요청권한"),
        width: 120,
        editable: true,
        valueFormatter: (params) => {
          // 코드를 라벨로 표시
          return getPurreqRoleLabel(params.value);
        },
      },
      {
        field: "applUseYn",
        headerName: t("구매결의자"),
        width: 100,
        editable: true,
      },
      {
        field: "emailId",
        headerName: t("MAIL ID"),
        width: 200,
        editable: true,
      },
      {
        field: "ySale", // AS-IS: YSALE (영업사원여부, checkbox)
        headerName: t("영업사원여부"),
        width: 120,
        editable: true,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
        valueGetter: (params) => {
          // 데이터에서 ySale 값을 명시적으로 가져옴
          return params.data?.ySale || "N";
        },
        cellRenderer: (params: {
          value: string;
          data?: UserDto & { id?: string; chk?: boolean };
          api?: GridApi;
          node?: any;
        }) => {
          const value = params.value || params.data?.ySale || "N";
          return (
            <input
              type="checkbox"
              checked={value === "Y"}
              onChange={(e) => {
                if (params.data && params.api) {
                  const newValue = e.target.checked ? "Y" : "N";
                  params.data.ySale = newValue;

                  // 수정 상태로 변경
                  if (
                    !params.data.rowStatus ||
                    params.data.rowStatus === undefined
                  ) {
                    params.data.rowStatus = "U";
                  }

                  // 그리드에 변경사항 알림
                  params.api.applyTransaction({ update: [params.data] });

                  // 상태 컬럼 새로고침
                  if (params.node) {
                    params.api.refreshCells({
                      rowNodes: [params.node],
                      columns: ["rowStatus"],
                      force: true,
                    });
                  }

                  // ySale 필드가 변경되었을 때 상세 패널 업데이트
                  if (onRowSelection) {
                    const selectedRows =
                      params.api.getSelectedRows() as UserDto[];
                    if (
                      selectedRows.length > 0 &&
                      selectedRows[0].empCode === params.data.empCode
                    ) {
                      // 현재 선택된 행이 변경된 행과 같으면 상세 패널 업데이트
                      onRowSelection([params.data]);
                    }
                  }

                  // 수정 상태 알림
                  if (onModify) {
                    onModify(true);
                  }
                }
              }}
              style={{ cursor: "pointer" }}
            />
          );
        },
      },
      {
        field: "useYn",
        headerName: t("사용여부"),
        width: 100,
        editable: true,
      },
      // AS-IS에 없는 추가 필드들 (구매담당여부부터는 모두 숨김)
      {
        field: "buyerYn",
        headerName: t("구매담당여부"),
        width: 120,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "purkpoRole",
        headerName: t("구매결의권한"),
        width: 120,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "pstnCode",
        headerName: t("직위"),
        width: 100,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "empyId",
        headerName: t("사원번호"),
        width: 120,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "passwordDate",
        headerName: t("비밀번호변경일자"),
        width: 140,
        editable: false,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "startDate",
        headerName: t("시작일자"),
        width: 120,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "workPlace",
        headerName: t("근무장소"),
        width: 120,
        editable: true,
        hide: true, // 구매담당여부부터 숨김
      },
    ];

    return (
      <UserGridStyles className={className}>
        <GridContainer>
          <AgGrid<UserDto & { id?: string; chk?: boolean }>
            height="100%"
            columnDefs={columnDefs}
            rowData={rowData || []}
            pagination={false}
            showToolbar={true}
            onAddRow={onAddRow}
            onDeleteRow={onDeleteRow}
            onSave={onSave}
            toolbarButtons={{
              showAdd: true,
              showCopy: false,
              showDelete: true,
              showExcelDownload: true,
              showExcelUpload: false,
              showRefresh: false,
              showSave: true,
            }}
            onGridReady={handleGridReady}
            onCellValueChanged={handleCellValueChanged}
            onSelectionChanged={handleSelectionChanged}
            onRowClicked={handleRowClicked}
            rowSelection="single"
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              flex: undefined,
              minWidth: 100,
              suppressSizeToFit: true, // 컬럼 너비 고정
            }}
            suppressRowClickSelection={false}
            suppressClickEdit={true} // 셀 더블클릭 시 편집 모드 진입 방지
            domLayout="normal"
            animateRows={true}
            rowHeight={30}
            headerHeight={32}
            ensureDomOrder={true}
            enableRangeSelection={false}
          />
        </GridContainer>
      </UserGridStyles>
    );
  }
);

UserGrid.displayName = "UserGrid";

export default UserGrid;
