/**
 * 재무회계 > 기준정보 > 기타관리 > 지급조건 등록 - 그리드(단일)
 *
 * @description 지급조건 등록 - 그리드(단일)
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { type RefObject, useCallback, useMemo, useRef } from "react";
import { FormAgGrid } from "@form";
import {
  HOLIDAY_PAY_TYPE___NEXTDAY,
  HOLIDAY_PAY_TYPE___PREVDAY,
  HOLIDAY_PAY_TYPE___SAMEDAY,
  type PymntCndRegistListResponse,
  TERMS_TYPE___AP,
  TERMS_TYPE___AR,
  TERMS_TYPE___CM
} from "@/types/fcm/md/other/pymntCndRegist.types";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import type {
  CellValueChangedEvent,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ICellRendererParams, RowDataUpdatedEvent
} from "ag-grid-community";
import { Tag } from "antd";
import { useAuthStore } from "@store/com/auth";
import { createCheckboxColumn } from "@form/AgGrid";
import { getUUID } from "@utils/uuidUtils";
import { useTranslation } from "react-i18next";

type MainGridProps = {
  className?: string;
  list: PymntCndRegistListResponse[];
  setList: React.Dispatch<React.SetStateAction<PymntCndRegistListResponse[]>>;
  originMap: Map<string, PymntCndRegistListResponse>;
  gridRef: RefObject<GridApi<PymntCndRegistListResponse> | null>;
}

const MainGrid: React.FC<MainGridProps> = React.memo(({
  className,
  list,
  setList,
  originMap,
  gridRef,
}) => {
  const { t } = useTranslation();

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  const addedRowUuidRef = useRef<string | null>(null);

  const onGridReady = useCallback((params: GridReadyEvent<PymntCndRegistListResponse>) => {
    gridRef.current = params.api;
  }, [gridRef]);

  const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent<PymntCndRegistListResponse>) => {
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

  const termsTypeLabelMap: Record<string, string> = useMemo(() => ({
    [TERMS_TYPE___AR]: 'AR',
    [TERMS_TYPE___AP]: 'AP',
    [TERMS_TYPE___CM]: 'CM',
  }), []);

  const termsTypeColorMap: Record<string, string> = useMemo(() => ({
    [TERMS_TYPE___AR]: 'blue',
    [TERMS_TYPE___AP]: 'green',
    [TERMS_TYPE___CM]: 'red',
  }), []);

  const holidayPayTypeTranslationKeyMap: Record<string, string> = useMemo(() => ({
    [HOLIDAY_PAY_TYPE___SAMEDAY]: '당일_Same_Day',
    [HOLIDAY_PAY_TYPE___NEXTDAY]: '익일_Next_Day',
    [HOLIDAY_PAY_TYPE___PREVDAY]: '이전_Prev_Day',
  }), []);

  const holidayPayTypeColorMap: Record<string, string> = useMemo(() => ({
    [HOLIDAY_PAY_TYPE___SAMEDAY]: 'blue',
    [HOLIDAY_PAY_TYPE___NEXTDAY]: 'green',
    [HOLIDAY_PAY_TYPE___PREVDAY]: 'red',
  }), []);

  const currTypeTranslationKeyMap: Record<string, string> = useMemo(() => ({
    '원화': '원화_KRW',
    '외화': '외화_축약형',
  }), []);

  const currTypeColorMap: Record<string, string> = useMemo(() => ({
    '원화': 'blue',
    '외화': 'red',
  }), []);

  const columnDefs = useMemo<ExtendedColDef<PymntCndRegistListResponse>[]>(() => [
    {
      valueGetter: (params) => {
        if (!params.node?.data) return undefined;
        const row = params.node.data;
        if (row.uuid.startsWith('new_')) return 'C';
        if (row.willDelete) return 'D';
        if (row.willUpdate) return 'U';
        return undefined;
      },
      cellRenderer: (params: ICellRendererParams<PymntCndRegistListResponse>) => {
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
      field: "termsType",
      headerName: t("구분_Type"),
      editable: (params) => {
        return params.data?.uuid.startsWith('new_') ?? false;
      },
      width: 100,
      pinned: "left",
      sortable: true,
      resizable: false,
      filter: "agSetColumnFilter",
      useValueFormatterForExport: true,
      valueFormatter: (params) => {
        if (!params.data) {
          // !params.data: 셀렉트박스용 표출 문구
          const value = params.value;
          return termsTypeLabelMap[value || ''] || value;
        } else {
          // params.data: 클립보드에 넣어지는 값
          return params.data.termsType;
        }
      },
      cellRenderer: (params: { value: string }) => {
        const colorValue = termsTypeColorMap[params.value] ?? 'gray';
        return (
          <Tag color={colorValue} style={{ margin: 0 }}>
            {termsTypeLabelMap[params.value || ''] || params.value}
          </Tag>
        );
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          TERMS_TYPE___AR,
          TERMS_TYPE___AP,
          TERMS_TYPE___CM,
        ],
      },
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "termsCode",
      headerName: `Terms ${t("코드")}`,
      editable: (params) => {
        return params.data?.uuid.startsWith('new_') ?? false;
      },
      width: 200,
      pinned: "left",
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
      headerClass: "required-header",
    },
    {
      field: "termsName",
      headerName: `Terms ${t("명(이름)").trim()}`,
      editable: true,
      width: 200,
      pinned: "left",
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
      headerClass: "required-header",
    },
    {
      field: "cutOfDate",
      headerName: t("기준일자"),
      editable: true,
      width: 160,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    createCheckboxColumn<PymntCndRegistListResponse>(
      t("말일여부"),
      "monthOfLast",
      {
        width: 180,
        editable: true,
      }
    ),
    {
      field: "holidayPayType",
      headerName: t("공휴일지급구분"),
      editable: true,
      width: 180,
      sortable: true,
      filter: "agSetColumnFilter",
      useValueFormatterForExport: true,
      valueFormatter: (params) => {
        if (!params.data) {
          // !params.data: 셀렉트박스용 표출 문구
          const value = params.value;
          const translationKey = holidayPayTypeTranslationKeyMap[value || ''];
          return translationKey ? t(translationKey) : value;
        } else {
          // params.data: 클립보드에 넣어지는 값
          return params.data.holidayPayType;
        }
      },
      cellRenderer: (params: { value: string }) => {
        const colorValue = holidayPayTypeColorMap[params.value] ?? 'gray';
        const translationKey = holidayPayTypeTranslationKeyMap[params.value || ''];
        return (
          <Tag color={colorValue} style={{ margin: 0 }}>
            {translationKey ? t(translationKey) : params.value}
          </Tag>
        );
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          HOLIDAY_PAY_TYPE___PREVDAY,
          HOLIDAY_PAY_TYPE___SAMEDAY,
          HOLIDAY_PAY_TYPE___NEXTDAY,
        ],
      },
    },
    {
      field: "monthForword",
      headerName: t("+월수"),
      editable: true,
      width: 130,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "dayOfMonth",
      headerName: t("+일수(+월수후)"),
      editable: true,
      width: 210,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "dateForword",
      headerName: t("특정일"),
      editable: true,
      width: 150,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "days",
      headerName: t("+일수"),
      editable: true,
      width: 120,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    createCheckboxColumn<PymntCndRegistListResponse>(
      t("사용여부"),
      "useYn",
      {
        width: 130,
        editable: true,
      }
    ),
    {
      field: "noteDueDays",
      headerName: t("어음만기일수"),
      editable: true,
      width: 160,
      sortable: true,
      filter: true,
      cellEditor: "agNumberCellEditor",
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "attribute5",
      headerName: "Terms Desc.",
      editable: true,
      width: 360,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "attribute7",
      headerName: "Curr Type",
      editable: true,
      width: 140,
      sortable: true,
      filter: "agSetColumnFilter",
      useValueFormatterForExport: true,
      valueFormatter: (params) => {
        if (!params.data) {
          // !params.data: 셀렉트박스용 표출 문구
          const value = params.value;
          const translationKey = currTypeTranslationKeyMap[value || ''];
          return translationKey ? t(translationKey) : value;
        } else {
          // params.data: 클립보드에 넣어지는 값
          return params.data.attribute7;
        }
      },
      cellRenderer: (params: { value: string }) => {
        const colorValue = currTypeColorMap[params.value] ?? 'gray';
        const translationKey = currTypeTranslationKeyMap[params.value || ''];
        return (
          <Tag color={colorValue} style={{ margin: 0 }}>
            {translationKey ? t(translationKey) : params.value}
          </Tag>
        );
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ['', '원화', '외화'],
      },
    },
    {
      field: "attribute10",
      headerName: "Old Code ID",
      editable: true,
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "oldTermsCode",
      headerName: "Old Terms Code",
      editable: true,
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "left",
    },
  ],
    [
      currTypeColorMap,
      currTypeTranslationKeyMap,
      holidayPayTypeColorMap,
      holidayPayTypeTranslationKeyMap,
      t,
      termsTypeColorMap,
      termsTypeLabelMap
    ]
  );

  const handleAddRow = useCallback(() => {
    const newRow: PymntCndRegistListResponse = {
      willDelete: false,
      willUpdate: false,
      uuid: `new_${getUUID()}`,
      officeId: userOfficeId,
      termsCode: '',
      termsName: '',
      termsType: TERMS_TYPE___AR,
      cutOfDate: undefined,
      monthOfLast: undefined,
      holidayPayType: HOLIDAY_PAY_TYPE___SAMEDAY,
      monthForword: undefined,
      dayOfMonth: undefined,
      dateForword: undefined,
      days: undefined,
      noteDueDays: undefined,
      useYn: 'Y',
      attribute5: undefined,
      attribute7: undefined,
      attribute10: undefined,
      oldTermsCode: undefined,
    };

    setList((prev) => [...prev, newRow]);
    // 새로 추가된 행만 선택 상태로 두기 위해 uuid 지정.
    addedRowUuidRef.current = newRow.uuid;
  }, [setList, userOfficeId]);

  const handleUpdateRow = useCallback((e: CellValueChangedEvent<PymntCndRegistListResponse>) => {
    const updatedRow = e.data;
    if (updatedRow.uuid.startsWith('new_') || updatedRow.willDelete) return;

    const origin = originMap.get(updatedRow.uuid);
    if (!origin) return;

    const fieldsToCompare: (keyof PymntCndRegistListResponse)[] = [
      'termsName', 'cutOfDate', 'monthOfLast', 'holidayPayType',
      'monthForword', 'dayOfMonth', 'dateForword', 'days',
      'useYn', 'noteDueDays', 'attribute5', 'attribute7',
      'attribute10', 'oldTermsCode'
    ];

    // 기존 null 위해 셀렉트박스에 있는 ''를(직접 EMPTY를 선택한 경우) 다르게 인식하지 않도록 함.
    if (updatedRow.attribute7?.trim().length === 0) {
      updatedRow.attribute7 = undefined;
    }
    const isChanged = fieldsToCompare.some(field => updatedRow[field] != origin[field]);

    setList((prevList) => prevList.map((item) => {
      if (item.uuid === updatedRow.uuid) {
        // 기존 객체를 직접 수정하지 않고 새로운 객체를 생성하여 반환
        return {
          ...updatedRow,
          willUpdate: isChanged
        } as PymntCndRegistListResponse;
      }
      return item;
    }));
  }, [originMap, setList]);

  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length === 0) return;

    const selectedSet = new Set<string>(
      selectedRows.map((row) => row.uuid)
    );

    setList((prevList) => prevList.reduce<PymntCndRegistListResponse[]>(
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

  const gridOptions = useMemo(() => ({
    defaultColDef: {
      flex: undefined,
    },
    rowSelection: "multiple" as const,
    pagination: false,
    onGridReady,
    onRowDataUpdated,
  }), [onGridReady, onRowDataUpdated])

  const getRowId = useCallback((params: GetRowIdParams<PymntCndRegistListResponse>) => {
    return params.data.uuid;
  }, []);

  return (
    <FormAgGrid<PymntCndRegistListResponse & { id?: undefined }>
      rowData={list}
      columnDefs={columnDefs}
      getRowId={getRowId}
      className={className}
      idField={'uuid'}
      showToolbar={true}
      onAddRow={handleAddRow}
      onCellValueChanged={handleUpdateRow}
      onDeleteRow={handleDeleteRow}
      gridOptions={gridOptions}
      excelFileName={'지급조건'}
      toolbarButtons={{
        showAdd: true,
        showCopy: false,
        showDelete: true,
        showSave: false,
        enableExcelDownload: true,
        showExcelUpload: false,
      }}
    />
  )
});

export default MainGrid;
