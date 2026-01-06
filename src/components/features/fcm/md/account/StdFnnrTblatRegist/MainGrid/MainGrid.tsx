/**
 * 재무회계 > 기준정보 > 계정코드관리 > 표준재무제표 등록 - 계정코드매핑(상세)
 *
 * @description 표준재무제표 등록 - 계정코드매핑(상세)
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { type RefObject, useCallback, useMemo, useRef } from "react";
import type {
  StdFnnrTblatRegistMainListResponse,
  StdFnnrTblatRegistSrchRequest
} from "@/types/fcm/md/account/stdFnnrTblatRegist.types";
import type {
  CellValueChangedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  RowDataUpdatedEvent,
} from "ag-grid-community";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { Tag } from "antd";
import { FormAgGrid } from "@form";
import { createCheckboxColumn } from "@form/AgGrid";
import { getUUID } from "@utils/uuidUtils";
import { useTranslation } from "react-i18next";

type MainGridProps = {
  className?: string;
  mainList: StdFnnrTblatRegistMainListResponse[];
  setMainList: React.Dispatch<React.SetStateAction<StdFnnrTblatRegistMainListResponse[]>>;
  originMainMap: Map<string, StdFnnrTblatRegistMainListResponse>;
  searchRequestRef: RefObject<StdFnnrTblatRegistSrchRequest | undefined>;
  gridRef: RefObject<GridApi<StdFnnrTblatRegistMainListResponse> | null>;
}

const MainGrid: React.FC<MainGridProps> = React.memo(({
  className,
  mainList,
  setMainList,
  originMainMap,
  searchRequestRef,
  gridRef,
}) => {
  const { t } = useTranslation();

  const addedRowUuidRef = useRef<string | null>(null);

  const onGridReady = useCallback((params: GridReadyEvent<StdFnnrTblatRegistMainListResponse>) => {
    gridRef.current = params.api;
  }, [gridRef]);

  const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent<StdFnnrTblatRegistMainListResponse>) => {
    if (addedRowUuidRef.current) {
      const uuid = addedRowUuidRef.current;
      const addedNode = params.api.getRowNode(uuid);
      if (addedNode) {
        params.api.deselectAll();
        addedNode.setSelected(true);
        params.api.ensureNodeVisible(addedNode, "bottom");
      }
      addedRowUuidRef.current = null;
    }
  }, []);

  const columnDefs = useMemo<ExtendedColDef<StdFnnrTblatRegistMainListResponse>[]>(() => [
    {
      valueGetter: (params) => {
        if (!params.node?.data) return undefined;
        const row = params.node.data;
        if (row.uuid.startsWith('new_')) return 'C';
        if (row.willUpdate) return 'U';
        return undefined;
      },
      cellRenderer: (params: ICellRendererParams<StdFnnrTblatRegistMainListResponse>) => {
        switch (params.value) {
          case 'C': return <Tag color="blue">{t("추가")}</Tag>;
          case 'U': return <Tag color="orange">{t("수정")}</Tag>;
          default: return null;
        }
      },
      excludeFromExcel: true,
      headerName: t("상태_축약형"),
      editable: false,
      width: 70,
      pinned: "left",
      sortable: false,
      filter: false,
      resizable: false,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      valueGetter: (params) => {
        return (params.node?.rowIndex ?? 0) + 1;
      },
      headerName: t("순번_축약형"),
      editable: false,
      width: 90,
      pinned: "left",
      sortable: true,
      filter: false,
      resizable: false,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "repType",
      headerName: t("재무제표_양식코드"),
      editable: false,
      width: 160,
      sortable: false,
      filter: false,
      resizable: false,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "repCde",
      headerName: t("코드"),
      editable: (params) => {
        return params.data?.uuid.startsWith('new_') ?? false;
      },
      width: 110,
      headerAlign: "center",
      bodyAlign: "center",
      headerClass: "required-header",
    },
    {
      field: "accCdeN",
      headerName: t("표준계정코드"),
      editable: (params) => {
        return params.data?.uuid.startsWith('new_') ?? false;
      },
      width: 220,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
      headerClass: "required-header",
    },
    {
      field: "accNmeN",
      headerName: (`${t("표준계정코드")}${t("명(이름)")}`),
      editable: (params) => {
        return params.data?.uuid.startsWith('new_') ?? false;
      },
      width: 250,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "accOutNme",
      headerName: (`${t("출력")}${t("명(이름)")}`),
      editable: true,
      width: 200,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
    createCheckboxColumn<StdFnnrTblatRegistMainListResponse>(
      t("사용여부"),
      "useYn",
      {
        width: 130,
        editable: true,
      }
    ),
    createCheckboxColumn<StdFnnrTblatRegistMainListResponse>(
      t("신규여부"),
      "newYn",
      {
        width: 120,
        editable: false,
      }
    ),
  ], [t]);

  const handleAddRow = useCallback(() => {
    const newRow: StdFnnrTblatRegistMainListResponse = {
      willUpdate: false,
      uuid: `new_${getUUID()}`,
      repType: searchRequestRef.current?.asRepType ?? '',
      repCde: '',
      accCdeN: undefined,
      accNmeN: undefined,
      accOutNme: undefined,
      useYn: 'Y',
      newYn: 'Y',
    };

    setMainList((prev) => [...prev, newRow]);
    // 새로 추가된 행만 선택 상태로 두기 위해 uuid 지정.
    addedRowUuidRef.current = newRow.uuid;
  }, [searchRequestRef, setMainList]);

  const handleUpdateRow = useCallback((e: CellValueChangedEvent<StdFnnrTblatRegistMainListResponse>) => {
    const updatedRow = e.data;
    if (updatedRow.uuid.startsWith('new_')) return;

    const origin = originMainMap.get(updatedRow.uuid);
    if (!origin) return;

    const fieldsToCompare: (keyof StdFnnrTblatRegistMainListResponse)[] = [
      'accOutNme', 'useYn'
    ];

    const isChanged = fieldsToCompare.some(field => updatedRow[field] != origin[field]);

    setMainList((prevList) => prevList.map((item) => {
      if (item.uuid === updatedRow.uuid) {
        // 기존 객체를 직접 수정하지 않고 새로운 객체를 생성하여 반환
        return {
          ...updatedRow,
          willUpdate: isChanged
        } as StdFnnrTblatRegistMainListResponse;
      }
      return item;
    }));
  }, [originMainMap, setMainList]);

  // 행삭제 없음.
  // const handleDeleteRow = useCallback(async () => {
  //   if (!gridRef.current) return;
  //
  //   const selectedNodes = gridRef.current.getSelectedNodes();
  //   if (selectedNodes.length === 0) return;
  //   //
  //   const selectedSet = new Set<string>();
  //   for (const node of selectedNodes) {
  //     const data = node.data;
  //     if (!data) {
  //       continue;
  //     }
  //     const uuid = data.uuid;
  //     const rowNumber = (node.rowIndex ?? 0) + 1;
  //     if (!uuid.startsWith('new_')) {
  //       showWarning(`[순번: ${rowNumber}] 새로 추가하려는 항목만 삭제 가능합니다. 기존 항목은 사용여부를 해제하여 저장하세요.`, 3);
  //       return;
  //     }
  //     selectedSet.add(uuid);
  //   }
  //
  //   setMainList((prevList) => prevList.reduce<StdFnnrTblatRegistMainListResponse[]>(
  //     (acc, item) => {
  //       if (selectedSet.has(item.uuid)) {
  //         // 새로 추가한 항이라면 넣지 않고
  //         if (item.uuid.startsWith('new_')) {
  //           return acc;
  //         } else {
  //           acc.push({ ...item, willDelete: !item.willDelete });
  //         }
  //       } else {
  //         acc.push(item);
  //       }
  //       return acc;
  //     }, []));
  // }, [gridRef, setMainList]);

  const gridOptions = useMemo(() => ({
    defaultColDef: {
      flex: undefined,
    },
    rowSelection: "multiple" as const,
    pagination: false,
    onGridReady,
    onRowDataUpdated,
  }), [onGridReady, onRowDataUpdated])

  const getRowId = useCallback((params: GetRowIdParams<StdFnnrTblatRegistMainListResponse>) => {
    return params.data.uuid;
  }, []);

  return (
    <FormAgGrid<StdFnnrTblatRegistMainListResponse & { id?: undefined }>
      rowData={mainList}
      columnDefs={columnDefs}
      getRowId={getRowId}
      className={className}
      idField={'uuid'}
      showToolbar={true}
      onAddRow={handleAddRow}
      onCellValueChanged={handleUpdateRow}
      // onDeleteRow={handleDeleteRow}
      gridOptions={gridOptions}
      excelFileName={'표준재무제표_계정코드'}
      toolbarButtons={{
        showAdd: true,
        showCopy: false,
        showDelete: false,
        showSave: false,
        enableExcelDownload: true,
        showExcelUpload: false,
      }}
    />
  )
});

export default MainGrid;
