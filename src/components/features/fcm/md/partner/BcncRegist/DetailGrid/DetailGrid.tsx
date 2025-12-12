import React, { useRef, useCallback, useMemo, useState } from "react";
import { message, Tag, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellStyle,
  ICellRendererParams,
  CellEditingStoppedEvent,
  IRowNode,
} from "ag-grid-community";
import { FormAgGrid, FormButton } from "@components/ui/form";
import { usePageModal } from "@hooks/usePageModal";
import { AppPageModal } from "@components/ui/feedback";
import { useBcncRegistStore } from "@store/bcncRegistStore";
import type { BcncShipResponse } from "@/types/fcm/md/partner/bcncRegist.types";

type DetailGridProps = {
  className?: string;
  rowData?: BcncShipResponse[];
};

type GridRowData = BcncShipResponse & {
  id?: string;
  rowStatus?: "C" | "U" | "D";
};

// 팝업에서 반환할 데이터 타입
type SearchResult = {
  code: string;
  name: string;
};

// 검색 팝업 컴포넌트 Props
type SearchPopupProps = {
  initialValue?: string;
  searchParam?: string; // 검색 파라미터 (영업사원번호 또는 이름)
};

// 영업사원 조회 결과 타입
type SalesManSearchResult = {
  code: string;
  name: string;
};

// 국가코드 조회 결과 타입
type CountrySearchResult = {
  code: string;
  name: string;
};

// 화폐단위 조회 결과 타입
type CurrencySearchResult = {
  code: string;
};

// 주소 조회 결과 타입
type AddressSearchResult = {
  address: string;
};

// 영업사원 셀 렌더러 컴포넌트 Props
type SalesManCellRendererProps = {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
};

// 공통 검색 셀 렌더러 컴포넌트 Props
type SearchCellRendererProps = {
  params: ICellRendererParams<GridRowData>;
  gridRef: React.RefObject<GridApi | null>;
  columnId: string; // 컬럼 ID (salesMan, country, currency, shipAddr)
  modalTitle: string; // 팝업 제목
};

// 영업사원 조회 API 함수 (placeholder - 실제 API로 교체 필요)
const searchSalesManApi = async (
  searchValue: string
): Promise<SalesManSearchResult[]> => {
  // TODO: 실제 영업사원 조회 API 호출로 교체
  // 예: return await getSalesManApi({ code: searchValue, name: searchValue });

  // 임시: 빈 배열 반환 (실제 API 연결 시 searchValue 파라미터 사용)
  void searchValue; // 린터 경고 방지용 (실제 API 연결 시 제거)
  return [];
};

// 국가코드 조회 API 함수 (placeholder - 실제 API로 교체 필요)
const searchCountryApi = async (
  searchValue: string
): Promise<CountrySearchResult[]> => {
  // TODO: 실제 국가코드 조회 API 호출로 교체
  // 예: return await getCountryApi({ code: searchValue, name: searchValue });

  // 임시: 빈 배열 반환 (실제 API 연결 시 searchValue 파라미터 사용)
  void searchValue; // 린터 경고 방지용 (실제 API 연결 시 제거)
  return [];
};

// 화폐단위 조회 API 함수 (placeholder - 실제 API로 교체 필요)
const searchCurrencyApi = async (
  searchValue: string
): Promise<CurrencySearchResult[]> => {
  // TODO: 실제 화폐단위 조회 API 호출로 교체
  // 예: return await getCurrencyApi({ code: searchValue });

  // 임시: 빈 배열 반환 (실제 API 연결 시 searchValue 파라미터 사용)
  void searchValue; // 린터 경고 방지용 (실제 API 연결 시 제거)
  return [];
};

// 주소 조회 API 함수 (placeholder - 실제 API로 교체 필요)
const searchAddressApi = async (
  searchValue: string
): Promise<AddressSearchResult[]> => {
  // TODO: 실제 주소 조회 API 호출로 교체
  // 예: return await getAddressApi({ address: searchValue });

  // 임시: 빈 배열 반환 (실제 API 연결 시 searchValue 파라미터 사용)
  void searchValue; // 린터 경고 방지용 (실제 API 연결 시 제거)
  return [];
};

// 검색 팝업 컴포넌트 (예제 - 실제 팝업 컴포넌트로 교체 필요)
const SearchPopup: React.FC<
  SearchPopupProps & {
    returnValue: (value: SearchResult) => void;
    close: () => void;
  }
> = ({ initialValue, searchParam, returnValue, close }) => {
  // TODO: searchParam을 사용하여 팝업에서 초기 검색 수행
  void searchParam; // 린터 경고 방지용 (실제 구현 시 사용)
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const handleSelect = () => {
    if (selectedCode && selectedName) {
      returnValue({ code: selectedCode, name: selectedName });
    } else {
      message.warning("코드와 이름을 입력해주세요.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>영업사원 검색</h3>
      <p>영업사원 코드와 이름을 입력한 후 선택 버튼을 클릭하세요.</p>
      {initialValue && <p style={{ color: "#666" }}>현재 값: {initialValue}</p>}
      <div style={{ marginBottom: "16px" }}>
        <Input
          placeholder="영업사원 코드 입력"
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          style={{ marginBottom: "8px" }}
        />
        <Input
          placeholder="영업사원명 입력"
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        />
      </div>
      <div>
        <FormButton
          type="primary"
          onClick={handleSelect}
          style={{ marginRight: "8px" }}
        >
          선택
        </FormButton>
        <FormButton onClick={close}>취소</FormButton>
      </div>
    </div>
  );
};

// 영업사원 셀 렌더러 컴포넌트
const SalesManCellRenderer: React.FC<SalesManCellRendererProps> = ({
  params,
  gridRef,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = React.useRef(params);
  React.useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 검색 팝업 모달 관리
  const searchModal = usePageModal<SearchPopupProps, SearchResult>(
    SearchPopup,
    {
      title: "영업사원 검색",
      centered: true,
      width: 500,
      height: 300,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          // 영업사원 선택 시: 영업사원 코드와 영업사원명 모두 업데이트
          rowData.salesMan = returnValue.code;
          rowData.salesName = returnValue.name;
          // 두 컬럼 모두 업데이트
          if (gridRef.current) {
            gridRef.current.refreshCells({
              rowNodes: [currentParams.node],
              columns: ["salesMan", "salesName"],
            });
            // 상태 업데이트 (rowStatus 변경)
            if (rowData.rowStatus !== "C") {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          }
        }
      },
    }
  );

  const handleSearchClick = () => {
    searchModal.openModal({ initialValue: value });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...searchModal.modalProps} />
    </>
  );
};

// 공통 검색 셀 렌더러 컴포넌트 (국가코드, 화폐단위, 주소용)
const SearchCellRenderer: React.FC<SearchCellRendererProps> = ({
  params,
  gridRef,
  columnId,
  modalTitle,
}) => {
  const value = params.value || "";

  // params를 ref로 저장하여 최신 값 유지
  const paramsRef = React.useRef(params);
  React.useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // 검색 팝업 모달 관리
  const searchModal = usePageModal<SearchPopupProps, SearchResult>(
    SearchPopup,
    {
      title: modalTitle,
      centered: true,
      width: 500,
      height: 300,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        const currentParams = paramsRef.current;
        const rowData = currentParams.data as GridRowData;
        if (rowData && currentParams.node) {
          if (columnId === "country") {
            // 국가코드: 코드와 국가명 모두 업데이트
            rowData.country = returnValue.code;
            rowData.nationName = returnValue.name;
            if (gridRef.current) {
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["country", "nationName"],
              });
              // 상태 업데이트 (rowStatus 변경)
              if (rowData.rowStatus !== "C") {
                rowData.rowStatus = "U";
                gridRef.current.refreshCells({
                  rowNodes: [currentParams.node],
                  columns: ["rowStatus"],
                  force: true,
                });
              }
            }
          } else if (columnId === "currency") {
            // 화폐단위: 자기 컬럼만 업데이트
            rowData.currency = returnValue.code;
            if (gridRef.current) {
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["currency"],
              });
              // 상태 업데이트 (rowStatus 변경)
              if (rowData.rowStatus !== "C") {
                rowData.rowStatus = "U";
                gridRef.current.refreshCells({
                  rowNodes: [currentParams.node],
                  columns: ["rowStatus"],
                  force: true,
                });
              }
            }
          } else if (columnId === "shipAddr") {
            // 주소: 자기 컬럼만 업데이트
            rowData.shipAddr = returnValue.code || returnValue.name || "";
            if (gridRef.current) {
              gridRef.current.refreshCells({
                rowNodes: [currentParams.node],
                columns: ["shipAddr"],
              });
              // 상태 업데이트 (rowStatus 변경)
              if (rowData.rowStatus !== "C") {
                rowData.rowStatus = "U";
                gridRef.current.refreshCells({
                  rowNodes: [currentParams.node],
                  columns: ["rowStatus"],
                  force: true,
                });
              }
            }
          }
        }
      },
    }
  );

  const handleSearchClick = () => {
    searchModal.openModal({ initialValue: value });
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0 4px",
    flexShrink: 0,
  };

  return (
    <>
      <div style={containerStyle}>
        <span style={textStyle}>{value}</span>
        <FormButton
          type="text"
          icon={<SearchOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSearchClick();
          }}
          style={buttonStyle}
        />
      </div>
      <AppPageModal {...searchModal.modalProps} />
    </>
  );
};

const DetailGrid: React.FC<DetailGridProps> = ({ rowData: propRowData }) => {
  const gridRef = useRef<GridApi | null>(null);
  // Store 연결
  const { shipListData, setGridApi } = useBcncRegistStore();

  // Store의 shipListData를 우선 사용하고, 없으면 propRowData 사용
  const sourceData = useMemo(() => {
    return shipListData && shipListData.length > 0
      ? shipListData
      : propRowData || [];
  }, [shipListData, propRowData]);

  // 내부 상태로 rowData 관리
  const [internalRowData, setInternalRowData] = useState<GridRowData[]>(() => {
    return sourceData.map((item, index) => ({
      ...item,
      id: item.shipId ?? `row-${index}`,
      rowStatus: undefined as "C" | "U" | "D" | undefined,
    }));
  });

  // sourceData가 변경되면 내부 상태 업데이트
  React.useEffect(() => {
    const newRowData = sourceData.map((item, index) => ({
      ...item,
      id: item.shipId ?? `row-${index}`,
      rowStatus: undefined as "C" | "U" | "D" | undefined,
    }));
    setInternalRowData(newRowData);
  }, [sourceData]);

  const rowData = internalRowData;

  // 그리드 준비 핸들러
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      // Store에 gridApi 저장
      setGridApi(params.api);
    },
    [setGridApi]
  );

  // 새 ID 생성 함수
  const generateNewId = useCallback((): string => {
    if (rowData.length === 0) return "1";
    const maxId = Math.max(
      ...rowData
        .map((row) => {
          const id = row.id;
          if (typeof id === "string") {
            const numId = parseInt(id, 10);
            return isNaN(numId) ? 0 : numId;
          }
          return 0;
        })
        .filter((id) => id > 0)
    );
    return String(maxId + 1);
  }, [rowData]);

  // 새 행 생성 함수
  const createNewRow = useCallback((newId: number | string): GridRowData => {
    return {
      shipId: String(newId),
      id: String(newId),
      useYn: "Y",
      primaryChk: "N",
      rowStatus: "C",
    } as GridRowData;
  }, []);

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    const newId = generateNewId();
    const newRow = createNewRow(newId);
    setInternalRowData((prev) => [newRow, ...prev]);

    // 새 행에 포커스 이동
    setTimeout(() => {
      if (gridRef.current) {
        const firstNode = gridRef.current.getDisplayedRowAtIndex(0);
        if (firstNode) {
          firstNode.setSelected(true);
          gridRef.current.ensureNodeVisible(firstNode, "top");
          gridRef.current.setFocusedCell(0, "shipName");
        }
      }
    }, 100);

    message.success("새 행이 추가되었습니다.");
  }, [generateNewId, createNewRow]);

  // 행 복사 핸들러
  const handleCopyRow = useCallback(() => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = gridRef.current.getSelectedRows() as GridRowData[];
    if (selectedRows.length === 0) {
      message.warning("복사할 행을 선택해주세요.");
      return;
    }

    const newRows: GridRowData[] = selectedRows.map((row) => {
      const newId = generateNewId();
      return {
        ...row,
        shipId: String(newId),
        id: String(newId),
        rowStatus: "C" as const,
      };
    });

    setInternalRowData((prev) => [...newRows, ...prev]);
    message.success(`${selectedRows.length}건의 행이 복사되었습니다.`);
  }, [generateNewId]);

  // 행 삭제 핸들러
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    const selectedRows = gridRef.current.getSelectedRows() as GridRowData[];
    if (selectedRows.length === 0) {
      message.warning("삭제할 행을 선택해주세요.");
      return;
    }

    const selectedIds = new Set(selectedRows.map((row) => row.id));

    setInternalRowData((prev) =>
      prev
        .map((item) => {
          if (selectedIds.has(item.id)) {
            // 신규 추가된 행(rowStatus: "C")은 완전히 제거
            if (item.rowStatus === "C") {
              return null;
            }
            // 기존 행은 삭제 상태로 변경
            return { ...item, rowStatus: "D" as const };
          }
          return item;
        })
        .filter((item): item is GridRowData => item !== null)
    );

    gridRef.current?.refreshCells();
    gridRef.current?.deselectAll();
    message.success(
      `선택된 ${selectedRows.length}건의 행이 삭제 상태로 표시되었습니다. 저장 시 반영됩니다.`
    );
  }, []);

  // 데이터 변경 추적 함수
  const handleSetRowData = useCallback((data: GridRowData[]) => {
    setInternalRowData(data);
  }, []);

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.error("그리드가 초기화되지 않았습니다.");
      return;
    }

    // 변경된 행 필터링 (rowStatus가 "C", "U", "D"인 행)
    const changedRows = rowData.filter(
      (row) =>
        row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D"
    );

    if (changedRows.length === 0) {
      message.warning("저장할 변경사항이 없습니다.");
      return;
    }

    // TODO: API 호출
    // await save(changedRows);
    message.info(
      `저장 기능은 API 연결 후 구현 예정입니다. (변경된 행: ${changedRows.length}건)`
    );
  }, [rowData]);

  // 편집 종료 시 사용할 노드 참조 및 컬럼 정보
  const editingNodeRef = useRef<{
    node: IRowNode<GridRowData>;
    data: GridRowData;
    columnId: string; // 컬럼 ID (salesMan, country, currency, shipAddr)
  } | null>(null);

  // 검색 팝업 모달 관리 (셀 편집 종료 시 사용)
  const searchModalForEdit = usePageModal<SearchPopupProps, SearchResult>(
    SearchPopup,
    {
      title: "검색", // 동적으로 변경됨
      centered: true,
      width: 500,
      height: 300,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        // 팝업에서 선택한 값으로 업데이트
        if (gridRef.current && editingNodeRef.current) {
          const { node, data, columnId } = editingNodeRef.current;

          if (columnId === "salesMan") {
            // 영업사원: 코드와 이름 모두 업데이트
            data.salesMan = returnValue.code;
            data.salesName = returnValue.name;
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ["salesMan", "salesName"],
            });
          } else if (columnId === "country") {
            // 국가코드: 코드와 국가명 모두 업데이트
            data.country = returnValue.code;
            data.nationName = returnValue.name;
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ["country", "nationName"],
            });
          } else if (columnId === "currency") {
            // 화폐단위: 자기 컬럼만 업데이트
            data.currency = returnValue.code;
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ["currency"],
            });
          } else if (columnId === "shipAddr") {
            // 주소: 자기 컬럼만 업데이트 (code 또는 name 필드 사용)
            data.shipAddr = returnValue.code || returnValue.name || "";
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ["shipAddr"],
            });
          }

          // 상태 업데이트 (rowStatus 변경)
          if (data.rowStatus !== "C") {
            data.rowStatus = "U";
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ["rowStatus"],
              force: true,
            });
          }
          editingNodeRef.current = null; // 참조 초기화
        }
      },
    }
  );

  // 셀 편집 종료 핸들러 (영업사원, 국가코드, 화폐단위, 주소)
  const handleCellEditingStopped = useCallback(
    async (params: CellEditingStoppedEvent<GridRowData>) => {
      const columnId = params.column?.getColId();

      // 처리할 컬럼인지 확인
      if (
        columnId !== "salesMan" &&
        columnId !== "country" &&
        columnId !== "currency" &&
        columnId !== "shipAddr"
      ) {
        return;
      }

      // 입력값 확인
      const inputValue = params.newValue?.toString().trim() || "";
      if (!inputValue) {
        return; // 빈 값이면 무시
      }

      // 기존 값과 동일하면 무시
      const oldValue = params.oldValue?.toString().trim() || "";
      if (inputValue === oldValue) {
        return;
      }

      try {
        let searchResults: Array<
          | SalesManSearchResult
          | CountrySearchResult
          | CurrencySearchResult
          | AddressSearchResult
        > = [];

        // 컬럼별로 적절한 API 호출
        if (columnId === "salesMan") {
          searchResults = await searchSalesManApi(inputValue);
        } else if (columnId === "country") {
          searchResults = await searchCountryApi(inputValue);
        } else if (columnId === "currency") {
          searchResults = await searchCurrencyApi(inputValue);
        } else if (columnId === "shipAddr") {
          searchResults = await searchAddressApi(inputValue);
        }

        if (searchResults.length === 0) {
          // 조회 결과가 없으면 팝업 띄우기
          editingNodeRef.current = {
            node: params.node,
            data: params.data as GridRowData,
            columnId,
          };
          // 모달 제목 동적 변경을 위해 새로운 모달 인스턴스 생성
          searchModalForEdit.openModal({
            initialValue: inputValue,
            searchParam: inputValue,
          });
          // 모달 제목 업데이트 (임시로 동일한 모달 사용)
        } else if (searchResults.length === 1) {
          // 단건이면 바로 세팅
          const rowData = params.data as GridRowData;
          if (rowData && params.node) {
            const result = searchResults[0] as
              | SalesManSearchResult
              | CountrySearchResult
              | CurrencySearchResult
              | AddressSearchResult;

            if (columnId === "salesMan") {
              const salesResult = result as SalesManSearchResult;
              rowData.salesMan = salesResult.code;
              rowData.salesName = salesResult.name;
              if (gridRef.current) {
                gridRef.current.refreshCells({
                  rowNodes: [params.node],
                  columns: ["salesMan", "salesName"],
                });
              }
              message.success("영업사원 정보가 자동으로 설정되었습니다.");
            } else if (columnId === "country") {
              const countryResult = result as CountrySearchResult;
              rowData.country = countryResult.code;
              rowData.nationName = countryResult.name;
              if (gridRef.current) {
                gridRef.current.refreshCells({
                  rowNodes: [params.node],
                  columns: ["country", "nationName"],
                });
              }
              message.success("국가코드 정보가 자동으로 설정되었습니다.");
            } else if (columnId === "currency") {
              const currencyResult = result as CurrencySearchResult;
              rowData.currency = currencyResult.code;
              if (gridRef.current) {
                gridRef.current.refreshCells({
                  rowNodes: [params.node],
                  columns: ["currency"],
                });
              }
              message.success("화폐단위가 자동으로 설정되었습니다.");
            } else if (columnId === "shipAddr") {
              const addressResult = result as AddressSearchResult;
              rowData.shipAddr = addressResult.address;
              if (gridRef.current) {
                gridRef.current.refreshCells({
                  rowNodes: [params.node],
                  columns: ["shipAddr"],
                });
              }
              message.success("주소가 자동으로 설정되었습니다.");
            }

            // 상태 업데이트 (rowStatus 변경)
            if (rowData.rowStatus !== "C" && gridRef.current) {
              rowData.rowStatus = "U";
              gridRef.current.refreshCells({
                rowNodes: [params.node],
                columns: ["rowStatus"],
                force: true,
              });
            }
          }
        } else {
          // 다건이면 팝업 띄우기
          editingNodeRef.current = {
            node: params.node,
            data: params.data as GridRowData,
            columnId,
          };
          searchModalForEdit.openModal({
            initialValue: inputValue,
            searchParam: inputValue,
          });
        }
      } catch (error) {
        message.error(`${columnId} 조회 중 오류가 발생했습니다.`);
        if (import.meta.env.DEV) {
          console.error(`${columnId} 조회 실패:`, error);
        }
      }
    },
    [searchModalForEdit]
  );

  // 컬럼 정의 (useMemo로 최적화)
  const columnDefs: ColDef<
    BcncShipResponse & { id?: string; rowStatus?: "C" | "U" | "D" }
  >[] = useMemo(
    () => [
      {
        field: "rowStatus",
        headerName: "상태",
        width: 80,
        pinned: "left",
        excludeFromExcel: true, // 엑셀 다운로드에서 제외
        headerClass: "ag-header-cell-center",
        sortable: false,
        filter: false,
        cellRenderer: (params: { value?: "C" | "U" | "D" }) => {
          if (!params.value) return null;
          const statusMap = {
            C: { text: "추가", color: "blue" },
            U: { text: "수정", color: "orange" },
            D: { text: "삭제", color: "red" },
          };
          const statusInfo = statusMap[params.value];
          if (!statusInfo) return null;
          return (
            <Tag color={statusInfo.color} style={{ margin: 0 }}>
              {statusInfo.text}
            </Tag>
          );
        },
        cellStyle: (params) => {
          const baseStyle: CellStyle = { textAlign: "center" };
          if (params.value === "D") {
            return { ...baseStyle, backgroundColor: "#fff1f0" };
          }
          return baseStyle;
        },
      },
      {
        field: "useYn",
        headerName: "사용",
        width: 80,
        editable: true,
        cellEditor: "agCheckboxCellEditor",
        cellRenderer: "agCheckboxCellRenderer",
        valueGetter: (params) => {
          return params.data?.useYn === "Y";
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.useYn = params.newValue ? "Y" : "N";
            return true;
          }
          return false;
        },
        cellClass: "ag-checkbox-cell-center",
        headerClass: "ag-header-cell-center",
      },
      {
        field: "shipName",
        headerName: "배송지 명",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "primaryChk",
        headerName: "Primary",
        width: 80,
        editable: true,
        cellEditor: "agCheckboxCellEditor",
        cellRenderer: "agCheckboxCellRenderer",
        valueGetter: (params) => {
          return params.data?.primaryChk === "Y";
        },
        valueSetter: (params) => {
          if (params.data) {
            params.data.primaryChk = params.newValue ? "Y" : "N";
            return true;
          }
          return false;
        },
        cellClass: "ag-checkbox-cell-center",
        headerClass: "ag-header-cell-center",
      },
      {
        field: "orgId",
        headerName: "사업장",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "salesMan",
        headerName: "영업사원",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true, // 편집 기능 활성화
        cellEditor: "agTextCellEditor", // 기본 텍스트 에디터 사용
        cellRenderer: (params: ICellRendererParams<GridRowData>) => {
          return <SalesManCellRenderer params={params} gridRef={gridRef} />;
        },
      },
      {
        field: "salesName",
        headerName: "영업사원명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
      },
      {
        field: "country",
        headerName: "국가코드",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
        cellEditor: "agTextCellEditor",
        cellRenderer: (params: ICellRendererParams<GridRowData>) => {
          return (
            <SearchCellRenderer
              params={params}
              gridRef={gridRef}
              columnId="country"
              modalTitle="국가코드 검색"
            />
          );
        },
      },
      {
        field: "nationName",
        headerName: "국가명",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
      },
      {
        field: "currency",
        headerName: "화폐단위",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
        cellEditor: "agTextCellEditor",
        cellRenderer: (params: ICellRendererParams<GridRowData>) => {
          return (
            <SearchCellRenderer
              params={params}
              gridRef={gridRef}
              columnId="currency"
              modalTitle="화폐단위 검색"
            />
          );
        },
      },
      {
        field: "shipAddr",
        headerName: "주소",
        width: 300,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
        cellEditor: "agTextCellEditor",
        cellRenderer: (params: ICellRendererParams<GridRowData>) => {
          return (
            <SearchCellRenderer
              params={params}
              gridRef={gridRef}
              columnId="shipAddr"
              modalTitle="주소 검색"
            />
          );
        },
      },
      {
        field: "chargeMan",
        headerName: "담당자",
        width: 120,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "phoneNum",
        headerName: "전화번호",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "chargeNumber",
        headerName: "담당자번호",
        width: 120,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "siteFaxNo",
        headerName: "팩스번호",
        width: 150,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "contractFrom",
        headerName: "계약일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "contractTo",
        headerName: "계약만료일",
        width: 120,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "channel",
        headerName: "Channel1",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "channel2",
        headerName: "Channel2",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "channel3",
        headerName: "Channel3",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "category1",
        headerName: "Territory1",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "category2",
        headerName: "Territory2",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "category3",
        headerName: "Territory3",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "category4",
        headerName: "Territory4",
        width: 100,
        cellStyle: { textAlign: "center" } as CellStyle,
        headerClass: "ag-header-cell-center",
        editable: true,
      },
      {
        field: "attribute1",
        headerName: "비고",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
      {
        field: "attribute2",
        headerName: "메모",
        width: 200,
        cellStyle: { textAlign: "left" } as CellStyle,
        editable: true,
      },
    ],
    []
  );

  return (
    <div className="data-grid-panel">
      {/* 임시 주석처리 - 빌드 에러 방지 */}
      {/* <style>{`
        .ag-checkbox-cell-center {
          padding: 0 !important;
          text-align: center !important;
        }
        .ag-checkbox-cell-center > div {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          height: 100% !important;
        }
        .ag-checkbox-cell-center .ag-checkbox {
          margin: 0 !important;
        }
      `}</style> */}
      {/* 그리드 */}
      <FormAgGrid<
        BcncShipResponse & { id?: string; rowStatus?: "C" | "U" | "D" }
      >
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height={300}
        excelFileName="거래처등록" // 엑셀 다운로드 파일명
        idField="id"
        showToolbar={true}
        styleOptions={{
          fontSize: "12px",
          headerFontSize: "12px",
          rowHeight: "32px",
          headerHeight: "32px",
          cellPadding: "6px",
          headerPadding: "8px",
          selectedRowBackgroundColor: "#e6f7ff",
          hoverRowBackgroundColor: "#bae7ff",
        }}
        gridOptions={useMemo(
          () => ({
            defaultColDef: {
              flex: undefined,
            },
            rowSelection: "multiple",
            animateRows: true,
            pagination: false,
            paginationPageSize: 10,
            rowHeight: 32,
            paginationPageSizeSelector: [10, 20, 50, 100],
            suppressRowClickSelection: false, // 행 클릭 선택 활성화
            onGridReady: handleGridReady,
            onSelectionChanged: (params) => {
              // 선택된 행 변경 시 필요한 로직 추가 가능
              if (params.api) {
                // const selectedRows = params.api.getSelectedRows();
                // 선택된 행 수 확인 등 필요한 로직 추가 가능
              }
            },
            onCellValueChanged: (params) => {
              if (params.data) {
                const updatedRow = params.data as GridRowData;

                // 삭제된 행은 편집 불가
                if (updatedRow.rowStatus === "D") {
                  message.error("삭제된 행은 편집할 수 없습니다.");
                  if (gridRef.current) {
                    gridRef.current.refreshCells({ rowNodes: [params.node] });
                  }
                  return;
                }

                // 신규 행이 아니면 수정 상태로 변경
                if (updatedRow.rowStatus !== "C") {
                  updatedRow.rowStatus = "U";
                }

                // 상태 컬럼만 refresh
                if (gridRef.current) {
                  gridRef.current.refreshCells({
                    rowNodes: [params.node],
                    columns: ["rowStatus"],
                    force: true,
                  });
                }
              }
            },
            onCellEditingStopped: handleCellEditingStopped,
          }),
          [handleGridReady, handleCellEditingStopped]
        )}
        toolbarButtons={{
          showDelete: true,
          showCopy: true,
          showAdd: true,
          enableExcelDownload: true,
          showSave: true,
        }}
        onAddRow={handleAddRow}
        onCopyRow={handleCopyRow}
        onDeleteRow={handleDeleteRow}
        createNewRow={createNewRow}
        setRowData={handleSetRowData}
        onSave={handleSave}
      />
      {/* 영업사원 검색 팝업 모달 (셀 편집 종료 시 사용) */}
      <AppPageModal {...searchModalForEdit.modalProps} />
    </div>
  );
};

export default DetailGrid;
