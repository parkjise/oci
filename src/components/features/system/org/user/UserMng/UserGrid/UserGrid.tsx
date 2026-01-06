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
  GridApi,
  CellValueChangedEvent,
  ICellRendererParams,
  SelectionChangedEvent,
  RowClickedEvent,
} from "ag-grid-enterprise";
import AgGrid from "@components/ui/form/AgGrid/FormAgGrid";
import { UserGridStyles, GridContainer, StatusIconContainer, StatusIcon } from "./UserGrid.styles";
import type { UserDto } from "@apis/system/user/userApi";
import { useTranslation } from "react-i18next";
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { MessageModal } from "@components/ui/feedback";
import { createGridReadyHandler, getSelectedRows as getSelectedRowsUtil } from "@utils/agGridUtils";

// ============================================================================
// Status Cell Renderer
// ============================================================================
const StatusCellRenderer: React.FC<
  ICellRendererParams<UserDto & { id?: string; chk?: boolean }>
> = ({ value }) => {
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
      return (
        <StatusIconContainer>
          <span></span>
        </StatusIconContainer>
      );
  }

  return (
    <StatusIconContainer>
      <StatusIcon
        $backgroundColor={backgroundColor}
        $iconColor={iconColor}
        title={tooltip}
      >
        <i className={iconClass} />
      </StatusIcon>
    </StatusIconContainer>
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
const UserGrid = forwardRef<UserGridRef, { className?: string }>(
  ({ className }, ref) => {
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const gridContainerRef = useRef<HTMLDivElement | null>(null);
    const isRestoringSelectionRef = useRef<boolean>(false);
    const isInitialLoadRef = useRef<boolean>(true);
    const prevSelectedEmpCodeRef = useRef<string | null>(null);

    const {
      userList,
      orgList,
      selectedUser,
      setSelectedUser,
      setSelectedRows,
      handleCellValueChanged,
      loading,
    } = useUserMngStore();

    // AP 권한 (A: Corporation, B: Department, C: Individual)
    const getAcpayRoleLabel = (code: string | undefined): string => {
      switch (code) {
        case "A":
          return t("회사");
        case "B":
          return t("부서");
        case "C":
          return t("개인");
        default:
          return code || "";
      }
    };

    // 구매요청권한 (C: 회사, O: 사업장, D: 부서, P: 개인)
    const getPurreqRoleLabel = (code: string | undefined): string => {
      switch (code) {
        case "C":
          return t("회사");
        case "O":
          return t("사업장");
        case "D":
          return t("부서");
        case "P":
          return t("개인");
        default:
          return code || t("없음");
      }
    };

    // 구매결의권한 (C: 회사, O: 사업장)
    const getPurkpoRoleLabel = (code: string | undefined): string => {
      switch (code) {
        case "C":
          return t("회사");
        case "O":
          return t("사업장");
        default:
          return code || t("없음");
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
          if (!gridApi) return userList || [];

          const allRows: (UserDto & { id?: string; chk?: boolean })[] = [];
          gridApi.forEachNode((node) => {
            if (node.data) {
              allRows.push(node.data);
            }
          });
          return allRows;
        },
        getSelectedRows: () => {
          const selectedRows = getSelectedRowsUtil(gridApi);
          return (selectedRows || []) as (UserDto & {
            id?: string;
            chk?: boolean;
          })[];
        },
        getGridApi: () => {
          return gridApi;
        },
      }),
      [gridApi, userList]
    );

    const handleGridReady = useCallback(
      createGridReadyHandler(setGridApi),
      []
    );

    // 행 클릭 핸들러
    const handleRowClicked = useCallback(
      (event: RowClickedEvent) => {
        if (!gridApi || !event.data) return;

        const clickedEmpCode = event.data.empCode || (event.data as any).id;

        // 현재 선택된 행이 신규/수정/삭제 상태인지 확인
        if (selectedUser?.rowStatus) {
          const status = selectedUser.rowStatus;
          if (status === "C" || status === "U" || status === "D") {
            const currentEmpCode =
              selectedUser.empCode || (selectedUser as any).id;

            // 다른 행을 클릭한 경우에만 선택 방지
            if (clickedEmpCode !== currentEmpCode) {
              isRestoringSelectionRef.current = true;
              event.node.setSelected(false);

              // 현재 선택된 행으로 선택 복원
              requestAnimationFrame(() => {
                gridApi.forEachNode((node) => {
                  const rowData = node.data as UserDto & { id?: string };
                  const rowEmpCode = rowData.empCode || (rowData as any).id;
                  node.setSelected(rowEmpCode === currentEmpCode);
                });

                // 하이라이트 제거 (여러 번 시도)
                requestAnimationFrame(() => {
                  gridApi.clearFocusedCell();
                  gridApi.redrawRows();

                  const removeClickedClass = () => {
                    const gridElement =
                      (gridApi as any).eGridDiv ||
                      gridContainerRef.current?.querySelector(
                        ".ag-root-wrapper"
                      );
                    const target = gridElement || document;
                    const clickedRows =
                      target.querySelectorAll(".ag-row-clicked");
                    clickedRows.forEach((row: Element) =>
                      row.classList.remove("ag-row-clicked")
                    );
                    return clickedRows.length;
                  };

                  removeClickedClass();
                  requestAnimationFrame(() => {
                    gridApi.redrawRows();
                    setTimeout(() => {
                      removeClickedClass();
                      requestAnimationFrame(() => {
                        gridApi.redrawRows();
                        setTimeout(() => {
                          removeClickedClass();
                          isRestoringSelectionRef.current = false;
                        }, 50);
                      });
                    }, 50);
                  });
                });
              });

              MessageModal.warning({
                title: t("알림"),
                content: t(
                  "신규/수정/삭제 상태인 행은 저장 또는 취소 후 다른 행을 선택할 수 있습니다."
                ),
              });

              return;
            }
          }
        }

        prevSelectedEmpCodeRef.current = clickedEmpCode;
      },
      [gridApi, selectedUser, t]
    );

    // 행 선택 변경 핸들러
    const handleSelectionChanged = useCallback(
      (event: SelectionChangedEvent) => {
        const selectedRows = getSelectedRowsUtil(event.api) as UserDto[] | null;
        const api = event.api;
        
        if (!selectedRows) return;

        // 복원 중이면 선택 변경 무시
        if (isRestoringSelectionRef.current) {
          return;
        }

        if (selectedRows.length > 0) {
          const newSelectedUser = selectedRows[0];
          const newEmpCode =
            newSelectedUser.empCode || (newSelectedUser as any).id;
          const currentEmpCode =
            selectedUser?.empCode || (selectedUser as any)?.id;

          // 현재 선택된 행이 신규/수정/삭제 상태이고 다른 행을 선택하려는 경우
          if (selectedUser?.rowStatus && newEmpCode !== currentEmpCode) {
            const status = selectedUser.rowStatus;
            if (status === "C" || status === "U" || status === "D") {
              isRestoringSelectionRef.current = true;

              // 현재 선택된 행으로 선택 복원
              requestAnimationFrame(() => {
                api.deselectAll();

                let foundCurrentNode = false;
                api.forEachNode((node) => {
                  const rowData = node.data as UserDto & { id?: string };
                  const rowEmpCode = rowData.empCode || (rowData as any).id;
                  if (rowEmpCode === currentEmpCode) {
                    node.setSelected(true);
                    foundCurrentNode = true;
                  } else {
                    node.setSelected(false);
                  }
                });

                if (foundCurrentNode) {
                  // 하이라이트 제거 (여러 번 시도)
                  requestAnimationFrame(() => {
                    api.clearFocusedCell();
                    api.redrawRows();

                    const removeClickedClass = () => {
                      const gridElement =
                        (api as any).eGridDiv ||
                        gridContainerRef.current?.querySelector(
                          ".ag-root-wrapper"
                        );
                      const target = gridElement || document;
                      const clickedRows =
                        target.querySelectorAll(".ag-row-clicked");
                      clickedRows.forEach((row: Element) =>
                        row.classList.remove("ag-row-clicked")
                      );
                      return clickedRows.length;
                    };

                    removeClickedClass();
                    requestAnimationFrame(() => {
                      api.redrawRows();
                      setTimeout(() => {
                        removeClickedClass();
                        requestAnimationFrame(() => {
                          api.redrawRows();
                          setTimeout(() => {
                            removeClickedClass();
                            isRestoringSelectionRef.current = false;
                          }, 50);
                        });
                      }, 50);
                    });
                  });
                } else {
                  isRestoringSelectionRef.current = false;
                }
              });

              return;
            }
          }

          prevSelectedEmpCodeRef.current = newEmpCode;
          if (setSelectedUser) {
            setSelectedUser(newSelectedUser);
          }
        } else {
          if (!isRestoringSelectionRef.current) {
            prevSelectedEmpCodeRef.current = null;
            if (setSelectedUser) {
              setSelectedUser(null);
            }
          }
        }

        if (setSelectedRows) {
          setSelectedRows(selectedRows || []);
        }
      },
      [setSelectedUser, setSelectedRows, selectedUser, t]
    );

    const onCellValueChanged = useCallback(
      (event: CellValueChangedEvent) => {
        if (event.data) {
          handleCellValueChanged(event.data);
        }
      },
      [handleCellValueChanged]
    );

    // 조회 완료 후 첫 번째 행 자동 선택
    const prevLoadingRef = useRef<boolean>(false);
    useEffect(() => {
      if (
        gridApi &&
        userList &&
        userList.length > 0 &&
        !loading &&
        prevLoadingRef.current // 이전에 로딩 중이었고 지금은 로딩 완료 (조회 완료)
      ) {
        const timeoutId = setTimeout(() => {
          // 이미 선택된 행이 있으면 자동 선택하지 않음 (삭제 등으로 인한 userList 변경 방지)
          const currentSelectedRows = getSelectedRowsUtil(gridApi);
          if (currentSelectedRows && currentSelectedRows.length > 0) {
            prevLoadingRef.current = loading;
            return;
          }

          // 조회 완료 후 항상 첫 번째 행 선택
          const firstRow = gridApi.getDisplayedRowAtIndex(0);
          if (firstRow && firstRow.data) {
            gridApi.deselectAll();
            gridApi.setNodesSelected({ nodes: [firstRow], newValue: true });
            setSelectedUser(firstRow.data);
            prevSelectedEmpCodeRef.current =
              firstRow.data.empCode || (firstRow.data as any).id;
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      }
      prevLoadingRef.current = loading;
    }, [gridApi, userList, loading, setSelectedUser]);

    // 최초 로드 시 첫 번째 행 자동 선택
    useEffect(() => {
      if (
        gridApi &&
        userList &&
        userList.length > 0 &&
        isInitialLoadRef.current
      ) {
        const timeoutId = setTimeout(() => {
          if (!isInitialLoadRef.current) {
            return;
          }
          const firstRow = gridApi.getDisplayedRowAtIndex(0);
          const selectedRows = getSelectedRowsUtil(gridApi);
          if (firstRow && firstRow.data && (!selectedRows || selectedRows.length === 0)) {
            gridApi.setNodesSelected({ nodes: [firstRow], newValue: true });
            setSelectedUser(firstRow.data);
            prevSelectedEmpCodeRef.current =
              firstRow.data.empCode || (firstRow.data as any).id;
            isInitialLoadRef.current = false;
            prevLoadingRef.current = false;
          }
        }, 300);

        return () => clearTimeout(timeoutId);
      }
    }, [gridApi, userList, setSelectedUser]);

    // selectedUser 변경 시 그리드에서 해당 행 선택
    useEffect(() => {
      if (!gridApi || !selectedUser) return;

      const currentEmpCode = (selectedUser.empCode || (selectedUser as any).id) as string;
      const currentSelectedEmpCode = prevSelectedEmpCodeRef.current;

      // 그리드에서 해당 행 찾기
      let targetNode: any = null;
      gridApi.forEachNode((node) => {
        if (node.data) {
          const nodeEmpCode = node.data.empCode || node.data.id;
          if (nodeEmpCode === currentEmpCode) {
            targetNode = node;
          }
        }
      });

      // 행을 찾았으면 선택 및 스크롤 (이미 선택된 행이어도 저장 후 위치 이동 등을 고려해 수행)
      if (targetNode) {
        // 이미 선택된 상태가 아니거나 ID가 바뀐 경우 선택 수행
        if (!targetNode.isSelected() || currentEmpCode !== currentSelectedEmpCode) {
          isRestoringSelectionRef.current = true;
          gridApi.deselectAll();
          targetNode.setSelected(true);
          // 선택 후 플래그 해제는 비동기로 처리
          setTimeout(() => {
            isRestoringSelectionRef.current = false;
          }, 50);
        }
        
        // 무조건 스크롤하여 화면 중앙에 오도록 함 (약간의 지연을 주어 그리드 렌더링 완료 후 실행 보장)
        setTimeout(() => {
          gridApi.ensureNodeVisible(targetNode, "middle");
        }, 100);
        
        prevSelectedEmpCodeRef.current = currentEmpCode;
      } else {
        // 행을 찾지 못한 경우 (아직 그리드에 반영되지 않았을 수 있음)
        // 약간의 지연 후 다시 시도
        const retryTimeout = setTimeout(() => {
          let retryTargetNode = null;
          gridApi.forEachNode((node) => {
            if (node.data) {
              const nodeEmpCode = node.data.empCode || node.data.id;
              if (nodeEmpCode === currentEmpCode) {
                retryTargetNode = node;
              }
            }
          });

          if (retryTargetNode) {
            isRestoringSelectionRef.current = true;
            gridApi.deselectAll();
            gridApi.setNodesSelected({ nodes: [retryTargetNode], newValue: true });
            gridApi.ensureNodeVisible(retryTargetNode, "middle");
            prevSelectedEmpCodeRef.current = currentEmpCode;
            requestAnimationFrame(() => {
              isRestoringSelectionRef.current = false;
            });
          }
        }, 100);

        return () => clearTimeout(retryTimeout);
      }
    }, [gridApi, selectedUser]);

    // userList 변경 시 그리드 리프레시 (rowStatus 아이콘 갱신 보장)
    useEffect(() => {
      if (gridApi && userList) {
        // [Issue Fix] 데이터가 변경되면 즉시 셀을 리프레시함
        gridApi.refreshCells({
          force: true,
        });

        // 저장 후처럼 rowStatus가 모두 사라진 경우, 
        // AgGrid의 내부 캐시가 남아있을 수 있으므로 강제로 전체 행을 다시 그림
        const hasAnyStatus = userList.some(u => u.rowStatus === 'U' || u.rowStatus === 'C' || u.rowStatus === 'D');
        if (!hasAnyStatus) {
          const timeoutId = setTimeout(() => {
            gridApi.redrawRows();
          }, 50);
          return () => clearTimeout(timeoutId);
        }
      }
    }, [gridApi, userList]);

    // AS-IS 순서: chk, ORG_ID(소속사업장), SUB_ORG_ID(종사업장), DEPT_CODE(부서코드), DEPT_NME(부서명),
    // EMP_CODE(사용자ID), EMP_NAME(사용자명), EMP_ABB_NAME(사용자약어), ACPAY_ROLE(AP권한),
    // PURREQ_ROLE(구매요청권한), APPL_USE_YN(구매결의자), EMAIL_ID(MAIL ID), BUYER_YN(영업사원여부), USE_YN(사용여부)
    // TO-BE 순서: chk, rowStatus, No., EMP_CODE(사용자ID), EMP_NAME(사용자명), DEPT_NME(부서명),
    // ORG_ID(소속사업장), SUB_ORG_ID(종사업장), ...
    const columnDefs: ColDef<UserDto & { id?: string; chk?: boolean }>[] = [
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
        valueGetter: (params) => {
          return params.data?.rowStatus || "";
        },
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
        valueGetter: (params) => {
          const rowIndex = params.node?.rowIndex ?? 0;
          return rowIndex + 1;
        },
      },
      {
        field: "empCode",
        headerName: t("사용자ID"),
        width: 120,
        editable: false,
        pinned: "left",
      },
      {
        field: "empName",
        headerName: t("사용자명"),
        width: 120,
        editable: false,
      },
      {
        field: "deptName",
        headerName: t("부서명"),
        width: 100,
        editable: false,
      },
      {
        field: "orgId",
        headerName: t("소속사업장"),
        width: 120,
        editable: false,
        valueFormatter: (params) => {
          return getOrgLabel(params.value || params.data?.orgId);
        },
      },
      {
        field: "subOrgId",
        headerName: t("종사업장"),
        width: 120,
        editable: false,
        valueFormatter: (params) => {
          return getOrgLabel(params.value);
        },
      },
      {
        field: "deptCode",
        headerName: t("부서코드"),
        width: 100,
        editable: false,
        hide: true,
      },
      {
        field: "empAbbName",
        headerName: t("사용자약어"),
        width: 120,
        editable: false,
      },
      {
        field: "acpayRole",
        headerName: t("AP권한"),
        width: 100,
        editable: false,
        valueFormatter: (params) => {
          return getAcpayRoleLabel(params.value);
        },
      },
      {
        field: "purreqRole",
        headerName: t("구매요청권한"),
        width: 120,
        editable: false,
        valueFormatter: (params) => {
          return getPurreqRoleLabel(params.value);
        },
      },
      {
        field: "emailId",
        headerName: t("MAIL ID"),
        width: 200,
        editable: false,
      },
      {
        field: "ySale",
        headerName: t("영업사원여부"),
        width: 120,
        editable: false,
        cellStyle: { textAlign: "center" },
        headerClass: "ag-header-cell-center",
        valueFormatter: (params) => {
          const value = params.value || params.data?.ySale || "N";
          return value === "Y" ? "Y" : "N";
        },
      },
      {
        field: "useYn",
        headerName: t("사용여부"),
        width: 80,
        editable: false,
      },
      // AS-IS에 없는 추가 필드들 (구매담당여부부터는 모두 숨김)
      {
        field: "buyerYn",
        headerName: t("구매담당여부"),
        width: 120,
        editable: false,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "purkpoRole",
        headerName: t("구매결의권한"),
        width: 120,
        editable: false,
        valueFormatter: (params) => getPurkpoRoleLabel(params.value),
      },
      {
        field: "pstnCode",
        headerName: t("직위"),
        width: 100,
        editable: false,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "empyId",
        headerName: t("사원번호"),
        width: 120,
        editable: false,
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
        editable: false,
        hide: true, // 구매담당여부부터 숨김
      },
      {
        field: "workPlace",
        headerName: t("근무장소"),
        width: 120,
        editable: false,
        hide: true, // 구매담당여부부터 숨김
      },
    ];

    return (
      <UserGridStyles className={className}>
        <GridContainer ref={gridContainerRef}>
          <AgGrid<UserDto & { id?: string; chk?: boolean }>
            height="100%"
            columnDefs={columnDefs}
            rowData={userList || []}
            pagination={false}
            showToolbar={false}
            onGridReady={handleGridReady}
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={handleSelectionChanged}
            onRowClicked={handleRowClicked}
            rowSelection="single"
            getRowId={(params) => params.data.id || params.data.empCode}
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
