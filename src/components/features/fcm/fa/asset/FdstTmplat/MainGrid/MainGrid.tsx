import React, { type RefObject, useCallback, useMemo, useRef, useState } from "react"
import FormAgGrid, { createCheckboxColumn, createSearchColumn, type ExtendedColDef } from "@form/AgGrid";
import type { FdstLsCodeListResponse, FdstTmplatListResponse } from "@/types/fcm/fa.asset/fdstTmplat.types.ts";
import { useTranslation } from "react-i18next";
import type {
  CellKeyDownEvent,
  CellValueChangedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams, IRowNode,
  RowDataUpdatedEvent
} from "ag-grid-community";
import { Tag } from "antd";
import { getUUID } from "@utils/uuidUtils.ts";
import { useAuthStore } from "@store/com/auth";
import { FdstLsCodePopup } from "@components/features/fcm/fa/asset/FdstLsCodePopup";
import { usePageModal } from "@/hooks";
import { selectFdstLsCodeList } from "@apis/fcm";
import { AppPageModal, LoadingSpinner } from "@/components";

type MainGridProps = {
  className?: string;
  gridRef: RefObject<GridApi<FdstTmplatListResponse> | null>;
  list: FdstTmplatListResponse[];
  setList: React.Dispatch<React.SetStateAction<FdstTmplatListResponse[]>>;
  originMap: Map<string, FdstTmplatListResponse>;
}

const MainGrid: React.FC<MainGridProps> = React.memo(({
  className,
  gridRef,
  list,
  setList,
  originMap,
}) => {
  const { t } = useTranslation();

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  const [columnSearching, setColumnSearching] = useState(false);
  const activeScodeNameNodeRef = useRef<IRowNode<FdstTmplatListResponse> | undefined>(undefined);
  const prevScodeNameValueRef = useRef<string | undefined>(undefined);

  const addedRowUuidRef = useRef<string | null>(null);

  const onGridReady = useCallback((params: GridReadyEvent<FdstTmplatListResponse>) => {
    gridRef.current = params.api;
  }, [gridRef]);

  const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent<FdstTmplatListResponse>) => {
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

  const gridOptions = useMemo(() => ({
    defaultColDef: {
      flex: undefined,
    },
    rowSelection: "multiple" as const,
    pagination: false,
    onGridReady,
    onRowDataUpdated,
  }), [onGridReady, onRowDataUpdated])

  const getRowId = useCallback((params: GetRowIdParams<FdstTmplatListResponse>) => {
    return params.data.uuid;
  }, []);

  const lsCodeModal = usePageModal(
    FdstLsCodePopup,
    {
      title: "분류",
      width: 800,
      centered: true,
      onReturn: (data: FdstLsCodeListResponse) => {
        const node = activeScodeNameNodeRef.current;
        if (node) {
          if (node.data) {
            node.data.scode = data.lsScode;
            node.data.lcode = data.lsLcode;
          }
          node.setDataValue('scodeName', data.lsScodeName);
        }
      },
    });

  const openLsCodeModal = useCallback(
    async (node: IRowNode<FdstTmplatListResponse>,
      clicked: boolean,) => {
      const column = gridRef.current?.getColumn('scodeName');
      if (!column || !column.isCellEditable(node)) {
        return;
      }

      /*
        handleAfterOpenChange 에서 모달을 띄우기 전 유효한 값으로 다시 되돌리는데,
        사용자가 셀을 변경하거나 Enter를 입력한 경우에는 현재 유효값을 설정하지만,
        돋보기를 클릭하는 경우에는 설정하지 않으므로 먼 예전의 값으로 돌아갈 수 있어서
        (모달을 띄우지 않고 바로 입력된 경우 이전 유효값을 저장해두지 않으므로)
        돋보기를 클릭하는 경우에는 현재 유효값을 저장해둔다.
       */
      if (clicked) {
        prevScodeNameValueRef.current = node.data?.scodeName;
      }

      activeScodeNameNodeRef.current = node;

      const initialScodeName = node.data?.scodeName;

      setColumnSearching(true);
      lsCodeModal.openModal({
        asOfficeId: userOfficeId,
        initialScodeName: (initialScodeName ?? '').trim(),
        onConfirm: lsCodeModal.setConfirmHandler,
      });
    }, [lsCodeModal, gridRef, userOfficeId]);

  const enterLsCodeModal = useCallback(
    async (
      node: IRowNode<FdstTmplatListResponse>,) => {
      const column = gridRef.current?.getColumn('scodeName');
      if (!column || !column.isCellEditable(node)) {
        return;
      }

      const scodeName = node.data?.scodeName;
      if (scodeName === undefined) {
        return;
      }

      if (scodeName.length == 0) {
        if (node.data) {
          node.data.scode = undefined;
          node.data.lcode = undefined;
        }
        node.setDataValue('scodeName', undefined);
        return;
      }

      activeScodeNameNodeRef.current = node;

      if (scodeName.trim().length > 0) {
        try {
          setColumnSearching(true);
          const response = await selectFdstLsCodeList({
            asOfficeId: userOfficeId,
            asScodeName: scodeName,
          });

          if (response.success && response.data.length === 1 && scodeName === response.data[0].lsScodeName) {
            if (node.data) {
              node.data.scode = response.data[0].lsScode;
              node.data.lcode = response.data[0].lsLcode;
            }
            node.setDataValue('scodeName', response.data[0].lsScodeName);
            return;
          }
        } finally {
          setColumnSearching(false);
        }
      }

      await openLsCodeModal(node, false);
    }, [gridRef, openLsCodeModal, userOfficeId]);

  const handleAfterOpenChange = useCallback((open: boolean) => {
    setColumnSearching(false)
    const node = activeScodeNameNodeRef.current;
    if (open && node && node.data) {
      node.setDataValue('scodeName', prevScodeNameValueRef.current);
    }
  }, []);

  const columnDefs = useMemo<ExtendedColDef<FdstTmplatListResponse>[]>(() => [
    {
      valueGetter: (params) => {
        if (!params.node?.data) return undefined;
        const row = params.node.data;
        if (row.uuid.startsWith('new_')) return 'C';
        if (row.willDelete) return 'D';
        if (row.willUpdate) return 'U';
        return undefined;
      },
      cellRenderer: (params: ICellRendererParams<FdstTmplatListResponse>) => {
        switch (params.value) {
          case 'C': return <Tag color="blue">{t("추가")}</Tag>;
          case 'U': return <Tag color="orange">{t("수정")}</Tag>;
          case 'D': return <Tag color="red">{t("삭제")}</Tag>;
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
      field: "description",
      headerName: "자산명",
      editable: true,
      width: 600,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      ...createSearchColumn<FdstTmplatListResponse>(
        "세분류명",
        "scodeName",
        (node) => openLsCodeModal(node, true),
        {
          width: 160,
          showIcon: true,
          bodyAlign: "left",
          headerAlign: "center",
          filter: true,
          editable: true,
        }
      ),
    },
    {
      field: "acquisitionDate",
      headerName: "취득일자",
      editable: true,
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    createCheckboxColumn<FdstTmplatListResponse>(
      "상각여부",
      "deprnFlag",
      {
        width: 120,
        editable: true,
      }
    ),
    {
      field: "assetsCost",
      headerName: "원시취득가액",
      editable: true,
      width: 150,
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<FdstTmplatListResponse>) => {
        const formattedValue = params.value ? Math.floor(params.value).toLocaleString() : '0';
        if (params.value < 0) {
          return (
            <span style={{color: 'red'}}>{formattedValue}</span>
          );
        } else {
          return (
            <span>{formattedValue}</span>
          );
        }
      },
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "right",
    },
    {
      field: "assetsUnits",
      headerName: "단위",
      editable: true,
      width: 100,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "invoiceQty",
      headerName: "수량",
      editable: true,
      width: 100,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "right",
    },
    {
      field: "custNo",
      headerName: "거래처코드",
      editable: true,
      width: 130,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "invoiceAccount",
      headerName: "INVOICE 계정코드",
      editable: true,
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "assetDeptCd",
      headerName: "부서코드",
      editable: true,
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "cstCde",
      headerName: "공정코드",
      editable: true,
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "projectCode",
      headerName: "프로젝트코드",
      editable: true,
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "poNumber",
      headerName: "PO번호",
      editable: true,
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
  ], [openLsCodeModal, t]);

  const handleAddRow = useCallback(() => {
    const newRow: FdstTmplatListResponse = {
      willDelete: false,
      willUpdate: false,
      uuid: `new_${getUUID()}`,
      officeId: userOfficeId,
      scode: undefined,
      scodeName: undefined,
      acquisitionDate: undefined,
      deprnFlag: 'N',
      assetsCost: undefined,
      assetsUnits: undefined,
      invoiceQty: undefined,
      custNo: undefined,
      invoiceAccount: undefined,
      assetDeptCd: undefined,
      cstCde: undefined,
      projectCode: undefined,
      poNumber: undefined,
    };

    setList((prev) => [...prev, newRow]);
    // 새로 추가된 행만 선택 상태로 두기 위해 uuid 지정.
    addedRowUuidRef.current = newRow.uuid;
  }, [setList, userOfficeId]);

  const handleUpdateRow = useCallback(async (e: CellValueChangedEvent<FdstTmplatListResponse>) => {
    if (e.source === 'edit') {
      const field = e.column.getColId();
      if (field === 'scodeName') {
        prevScodeNameValueRef.current = e.oldValue;
        await enterLsCodeModal(e.node);
        return;
      }
    }
    
    const updatedRow = e.data;

    // Number컬럼에서 숫자 형식이 아닌 형태 입력시의 null을 0으로 변환.
    if (!updatedRow.assetsCost) {
      updatedRow.assetsCost = 0;
    }

    if (updatedRow.uuid.startsWith('new_') || updatedRow.willDelete) return;

    const origin = originMap.get(updatedRow.uuid);
    if (!origin) return;

    const fieldsToCompare: (keyof FdstTmplatListResponse)[] = [
      'description', 'scode', 'orgCode', 'acquisitionDate',
      'deprnFlag', 'assetsCost', 'assetsUnits', 'invoiceQty',
      'custNo', 'invoiceAccount', 'assetDeptCd', 'cstCde',
      'projectCode', 'poNumber'
    ];

    const isChanged = fieldsToCompare.some(field => updatedRow[field] != origin[field]);

    setList((prevList) => prevList.map((item) => {
      if (item.uuid === updatedRow.uuid) {
        // 기존 객체를 직접 수정하지 않고 새로운 객체를 생성하여 반환
        return {
          ...updatedRow,
          willUpdate: isChanged
        } as FdstTmplatListResponse;
      }
      return item;
    }));
  }, [enterLsCodeModal, originMap, setList]);

  const handleCellKeyDown = useCallback(async (params: CellKeyDownEvent) => {
    if (params.event instanceof KeyboardEvent) {
      if (params.event.code.toUpperCase() === 'ENTER') {
        const field = params.column.getColId();
        if (field === 'scodeName') {
          await enterLsCodeModal(params.node);
        }
      }
    }
  }, [enterLsCodeModal]);

  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const selectedSet = new Set<string>(
      selectedRows.map((row) => row.uuid)
    );

    setList((prevList) => prevList.reduce<FdstTmplatListResponse[]>(
      (acc, item) => {
        if (selectedSet.has(item.uuid)) {
          // 새로 추가한 항이라면 넣지 않고 제외
          if (item.uuid.startsWith('new_')) {
            return acc;
          }
          acc.push({ ...item, willDelete: !item.willDelete });
        } else {
          acc.push(item);
        }
        return acc;
      }, []));
  }, [gridRef, setList]);

  return (
    <>
      <AppPageModal
        {...lsCodeModal.modalProps}
        modalProps={{
          ...lsCodeModal.modalProps.modalProps,
          afterOpenChange: handleAfterOpenChange,
        }}
      />
      {
        /*
          ko: 검색 중...
          en: Searching...
         */
      }
      {columnSearching && <LoadingSpinner tip={t("검색_중")} />}
      <FormAgGrid<FdstTmplatListResponse & { id?: undefined }>
        rowData={list}
        columnDefs={columnDefs}
        getRowId={getRowId}
        className={className}
        idField={'uuid'}
        showToolbar={true}
        onAddRow={handleAddRow}
        onCellValueChanged={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        onCellKeyDown={handleCellKeyDown}
        gridOptions={gridOptions}
        excelFileName={'고정자산템플릿'}
        toolbarButtons={{
        showAdd: true,
        showCopy: false,
        showDelete: true,
        showSave: false,
        enableExcelDownload: true,
        showExcelUpload: true,
      }}
        />
    </>

  );
});

export default MainGrid;
