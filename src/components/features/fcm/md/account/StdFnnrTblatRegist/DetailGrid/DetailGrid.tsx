/**
 * 재무회계 > 기준정보 > 계정코드관리 > 표준재무제표 등록 - 계정코드(메인)
 *
 * @description 표준재무제표 등록 - 계정코드(메인)
 * @author 윤동수
 * @date 2025-12-24
 * @last_modified 2025-12-29
 */

import React, { type RefObject, useCallback, useMemo, useRef, useState } from "react";
import type {
  StdFnnrTblatRegistDetailListResponse,
} from "@/types/fcm/md/account/stdFnnrTblatRegist.types";
import {
  type CellKeyDownEvent,
  type CellValueChangedEvent,
  type GetRowIdParams,
  type GridApi,
  type GridReadyEvent,
  type ICellRendererParams, type IRowNode, type RowDataUpdatedEvent
} from "ag-grid-community";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { Tag } from "antd";
import { FormAgGrid } from "@form";
import { AppPageModal, LoadingSpinner, showWarning } from "@/components";
import { DetailGridStyles } from "./DetailGrid.styles";
import { createCheckboxColumn, createSearchColumn } from "@form/AgGrid";
import { AcntInqirePopup } from "@pages/com/popup";
import { usePageModal } from "@/hooks/usePageModal";
import { selectAcntInqirePopupList } from "@apis/com/popup";
import { useTranslation } from "react-i18next";
import type { AcntInqirePopupListResponse } from "@/types/com/popup";
import { useAuthStore } from "@store/com/auth";
import { getUUID } from "@utils/uuidUtils";

type MainGridProps = {
  className?: string;
  detailList: StdFnnrTblatRegistDetailListResponse[];
  setDetailList: React.Dispatch<React.SetStateAction<StdFnnrTblatRegistDetailListResponse[]>>;
  originDetailMap: Map<string, StdFnnrTblatRegistDetailListResponse>;
  gridRef: RefObject<GridApi<StdFnnrTblatRegistDetailListResponse> | null>;
}

const DetailGrid: React.FC<MainGridProps> = React.memo(({
  className,
  detailList,
  setDetailList,
  originDetailMap,
  gridRef,
}) => {
  const { t } = useTranslation();

  const [columnSearching, setColumnSearching] = useState(false);

  const copiedRowUuidRef = useRef<string | null>(null);

  const onGridReady = useCallback((params: GridReadyEvent<StdFnnrTblatRegistDetailListResponse>) => {
    gridRef.current = params.api;
  }, [gridRef]);

  const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent<StdFnnrTblatRegistDetailListResponse>) => {
    if (copiedRowUuidRef.current) {
      const uuid = copiedRowUuidRef.current;
      const addedNode = params.api.getRowNode(uuid);
      if (addedNode) {
        params.api.deselectAll();
        addedNode.setSelected(true);
        params.api.ensureNodeVisible(addedNode, "bottom");
      }
      copiedRowUuidRef.current = null;
    }
  }, []);

  const userOfficeId = useMemo(() => {
    const user = useAuthStore.getState().user;
    return user?.officeId ?? 'OSE';
  }, []);

  const activeAcntNodeRef = useRef<IRowNode<StdFnnrTblatRegistDetailListResponse> | undefined>(undefined);
  const activeAcntFieldRef = useRef<string | undefined>(undefined);
  const prevAcntValueRef = useRef<string | undefined>(undefined);

  const acntModal = usePageModal(
    AcntInqirePopup,
    {
      title: t("계정"),
      width: 800,
      centered: true,
      onReturn: (data: AcntInqirePopupListResponse) => {
        const node = activeAcntNodeRef.current;
        const field = activeAcntFieldRef.current;
        if (node && field) {
          // 필드명에 따라 매핑되는 명칭 필드 결정 (onerpAccCdeF -> onerpAccNmeF, onerpAccCdeT -> onerpAccNmeT)
          const nameField =
            field.endsWith('F')
              ? 'onerpAccNmeF'
              : 'onerpAccNmeT';
          node.setDataValue(field, data.accCode);
          node.setDataValue(nameField, data.accName);
        }
      },
    });

  const openAcntModal = useCallback(
    async (node: IRowNode<StdFnnrTblatRegistDetailListResponse>,
      field: string,
      clicked: boolean,) => {
      const column = gridRef.current?.getColumn(field);
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
        prevAcntValueRef.current = node.data?.[field as keyof StdFnnrTblatRegistDetailListResponse] as string;
      }

      activeAcntNodeRef.current = node;
      activeAcntFieldRef.current = field;

      const initialAccCode = node.data?.[field as keyof StdFnnrTblatRegistDetailListResponse] as string;

      setColumnSearching(true);
      acntModal.openModal({
        asOfficeId: userOfficeId,
        initialAccCode: (initialAccCode ?? '').trim(),
        onConfirm: acntModal.setConfirmHandler,
      });
    }, [acntModal, gridRef, userOfficeId]);

  const enterAcntModal = useCallback(
    async (
      node: IRowNode<StdFnnrTblatRegistDetailListResponse>,
      field: string) => {
      const column = gridRef.current?.getColumn(field);
      if (!column || !column.isCellEditable(node)) {
        return;
      }

      const accCode = node.data?.[field as keyof StdFnnrTblatRegistDetailListResponse] as string;
      if (accCode === undefined) {
        return;
      }

      const nameField = field.endsWith('F') ? 'onerpAccNmeF' : 'onerpAccNmeT';

      if (accCode.length == 0) {
        node.setDataValue(field, undefined);
        node.setDataValue(nameField, undefined);
        return;
      }

      activeAcntNodeRef.current = node;
      activeAcntFieldRef.current = field;

      if (accCode.trim().length > 0) {
        try {
          setColumnSearching(true);
          const response = await selectAcntInqirePopupList({
            asOfficeId: userOfficeId,
            asAccCde: accCode,
          });

          if (response.success && response.data.length === 1 && accCode === response.data[0].accCode) {
            const nameField =
              field.endsWith('F')
                ? 'onerpAccNmeF'
                : 'onerpAccNmeT';
            node.setDataValue(nameField, response.data[0].accName);
            return;
          }
        } finally {
          setColumnSearching(false);
        }
      }

      await openAcntModal(node, field, false);
    }, [gridRef, openAcntModal, userOfficeId]);

  const handleAfterOpenChange = useCallback((open: boolean) => {
    setColumnSearching(false)
    const node = activeAcntNodeRef.current;
    const field = activeAcntFieldRef.current;
    if (open && node && field && node.data) {
      node.setDataValue(field, prevAcntValueRef.current);
    }
  }, []);

  const columnDefs = useMemo<ExtendedColDef<StdFnnrTblatRegistDetailListResponse>[]>(() => [
    {
      valueGetter: (params) => {
        if (!params.node?.data) return undefined;
        const row = params.node.data;
        if (row.uuid.startsWith('new_')) return 'C';
        if (row.willDelete) return 'D';
        if (row.willUpdate) return 'U';
        return undefined;
      },
      cellRenderer: (params: ICellRendererParams<StdFnnrTblatRegistDetailListResponse>) => {
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
    createCheckboxColumn<StdFnnrTblatRegistDetailListResponse>(
      t("사용여부"),
      "useYn",
      {
        width: 130,
        editable: false,
      }
    ),
    createCheckboxColumn<StdFnnrTblatRegistDetailListResponse>(
      t("신규여부"),
      "newYn",
      {
        width: 120,
        editable: false,
      }
    ),
    {
      ...createSearchColumn<StdFnnrTblatRegistDetailListResponse>(
        (`${t("계정")} From`),
        "onerpAccCdeF",
        (node, field) => openAcntModal(node, field, true),
        {
          width: 160,
          showIcon: true,
          bodyAlign: "center",
          filter: true,
        }
      ),
      editable: (params) => {
        const data = params.data;
        if (!data) {
          return false;
        }
        const uuid = data.uuid;
        const id = data.id;
        return uuid.startsWith('new_') || !!id;
      },
      // 수정 불가하면 검색필드가 아닌 그냥 빈 칸으로 표현.
      cellRendererSelector: (params) => {
        const data = params.data;
        if (!data) {
          return { component: null };
        }
        const uuid = data.uuid;
        const id = data.id;
        if (uuid.startsWith('new_') || !!id) {
          return undefined;
        } else {
          return { component: null };
        }
      },
    },
    {
      field: "onerpAccNmeF",
      headerName: (`${t("계정")}${t("명(이름)")} From`),
      editable: false,
      width: 280,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      ...createSearchColumn<StdFnnrTblatRegistDetailListResponse>(
        (`${t("계정")} To`),
        "onerpAccCdeT",
        (node, field) => openAcntModal(node, field, true),
        {
          width: 160,
          showIcon: true,
          bodyAlign: "center",
          filter: true,
        }
      ),
      editable: (params) => {
        const data = params.data;
        if (!data) {
          return false;
        }
        const uuid = data.uuid;
        const id = data.id;
        return uuid.startsWith('new_') || !!id;
      },
      // 수정 불가하면 검색필드가 아닌 그냥 빈 칸으로 표현.
      cellRendererSelector: (params) => {
        const data = params.data;
        if (!data) {
          return { component: null };
        }
        const uuid = data.uuid;
        const id = data.id;
        if (uuid.startsWith('new_') || !!id) {
          return undefined;
        } else {
          return { component: null };
        }
      },
    },
    {
      field: "onerpAccNmeT",
      headerName: (`${t("계정")}${t("명(이름)")} To`),
      editable: false,
      width: 280,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
    {
      field: "id",
      headerName: "ID",
      cellRenderer: (params: ICellRendererParams<StdFnnrTblatRegistDetailListResponse>) => {
        if (!params.data) {
          return undefined;
        }
        const uuid = params.data.uuid;
        if (uuid.startsWith('nonexist_')) {
          return '-';
        } else if (uuid.startsWith('new_')) {
          return (
            <Tag color="blue">{t("추가")}</Tag>
          );
        }
        return params.data.id;
      },
      editable: false,
      width: 90,
      sortable: true,
      filter: true,
      headerAlign: "center",
      bodyAlign: "center",
    },
  ], [openAcntModal, t]);

  const handleCopyRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedNodes = gridRef.current.getSelectedNodes();
    if (selectedNodes.length === 0) {
      /*
        ko: 복사할 행을 선택하세요!
        en: please select the line which need to copy
       */
      showWarning(t("MSG_CM_0379"));
      return;
    }

    // 선택 항 중 첫째만 유지하고 나머지는 비선택 상태로 변경. 복사는 한 행만 복사.
    const selectedFirstNode = selectedNodes[0]!;
    selectedNodes.forEach((node) => {
      if (node != selectedFirstNode) {
        node.setSelected(false);
      }
    })

    const newDetailList: StdFnnrTblatRegistDetailListResponse[] = [];
    detailList.forEach((origin) => {
      newDetailList.push(origin);
      if (selectedFirstNode.data?.uuid === origin.uuid) {
        const copiedData: StdFnnrTblatRegistDetailListResponse = {
          ...origin,
          uuid: `new_${getUUID()}`,
          willUpdate: false,
          id: undefined,
          newYn: 'Y',
          onerpAccCdeF: origin.onerpAccCdeF,
          onerpAccNmeF: origin.onerpAccNmeF,
          onerpAccCdeT: origin.onerpAccCdeT,
          onerpAccNmeT: origin.onerpAccNmeT,
        };
        newDetailList.push(copiedData);
        // 복사되어 새로 추가된 행만 선택 상태로 두기 위해 uuid 지정.
        copiedRowUuidRef.current = copiedData.uuid;
      }
    })
    setDetailList(newDetailList);
  }, [detailList, gridRef, setDetailList, t]);

  const handleDeleteRow = useCallback(async () => {
    if (!gridRef.current) return;

    const selectedNodes = gridRef.current.getSelectedNodes();
    if (selectedNodes.length === 0) return;

    const selectedSet = new Set<string>();
    for (const node of selectedNodes) {
      const data = node.data;
      if (!data) {
        continue;
      }
      const uuid = data.uuid;
      const rowNumber = (node.rowIndex ?? 0) + 1;
      if (uuid.startsWith('nonexist_')) {
        /*
          MSG_CM_0475
          ko: 삭제할 자료가 없습니다.
          en: No data to delete!
         */
        /*
          MSG_MD_0001
          ko: 계정코드만 존재합니다.
          en: Only the Account code Exists.
         */
        showWarning(`[${t("순번_축약형")} ${rowNumber}] ${t("MSG_CM_0475")} (${t("MSG_MD_0001")})`, 3);
        return;
      }
      if (data.newYn !== 'Y') {
        /*
          MSG_CM_2483
          ko: 신규 항목만 삭제 가능합니다.
          en: Only New Items Can Be Deleted.
         */
        showWarning(`[${t("순번_축약형")} ${rowNumber}] ${t("MSG_CM_2483")}`, 3);
        return;
      }
      selectedSet.add(uuid);
    }

    setDetailList((prevList) => prevList.reduce<StdFnnrTblatRegistDetailListResponse[]>(
      (acc, item) => {
        if (selectedSet.has(item.uuid)) {
          // 새로 추가한 항이라면 넣지 않고 제외
          if (item.uuid.startsWith('new_')) {
            return acc;
          } else {
            acc.push({ ...item, willDelete: !item.willDelete });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []));
  }, [gridRef, setDetailList, t]);

  const handleUpdateRow = useCallback(async (e: CellValueChangedEvent<StdFnnrTblatRegistDetailListResponse>) => {
    if (e.source === 'edit') {
      const field = e.column.getColId();
      if (field === 'onerpAccCdeF' || field === 'onerpAccCdeT') {
        prevAcntValueRef.current = e.oldValue;
        await enterAcntModal(e.node, field);
        return;
      }
    }

    const updatedRow = e.data;
    if (updatedRow.uuid.startsWith('new_')) return;

    // 계정코드(헤더)만 존재하는 매핑이 없는 항목이면 대상 아님.
    if (!updatedRow.id) return;

    const origin = originDetailMap.get(updatedRow.uuid);
    if (!origin) return;

    const fieldsToCompare: (keyof StdFnnrTblatRegistDetailListResponse)[] = [
      'onerpAccCdeF', 'onerpAccCdeT',
    ];

    const isChanged = fieldsToCompare.some(field => updatedRow[field] != origin[field]);

    setDetailList((prevList) => prevList.map((item) => {
      if (item.uuid === updatedRow.uuid) {
        // 기존 객체를 직접 수정하지 않고 새로운 객체를 생성하여 반환
        return {
          ...updatedRow,
          willUpdate: isChanged
        } as StdFnnrTblatRegistDetailListResponse;
      }
      return item;
    }));
  }, [originDetailMap, setDetailList, enterAcntModal]);

  const handleCellKeyDown = useCallback(async (params: CellKeyDownEvent) => {
    if (params.event instanceof KeyboardEvent) {
      if (params.event.code.toUpperCase() === 'ENTER') {
        const field = params.column.getColId();
        if (field === 'onerpAccCdeF' || field === 'onerpAccCdeT') {
          await enterAcntModal(params.node, field);
        }
      }
    }
  }, [enterAcntModal]);

  const gridOptions = useMemo(() => ({
    defaultColDef: {
      flex: undefined,
    },
    rowSelection: "multiple" as const,
    pagination: false,
    onGridReady,
    onRowDataUpdated,
  }), [onGridReady, onRowDataUpdated])

  const getRowId = useCallback((params: GetRowIdParams<StdFnnrTblatRegistDetailListResponse>) => {
    return params.data.uuid;
  }, []);

  return (
    <DetailGridStyles>
      <AppPageModal
        {...acntModal.modalProps}
        modalProps={{
          ...acntModal.modalProps.modalProps,
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
      <FormAgGrid<StdFnnrTblatRegistDetailListResponse>
        rowData={detailList}
        columnDefs={columnDefs}
        getRowId={getRowId}
        className={className}
        idField={'uuid'}
        showToolbar={true}
        onCopyRow={handleCopyRow}
        onCellValueChanged={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        onCellKeyDown={handleCellKeyDown}
        gridOptions={gridOptions}
        excelFileName={'표준재무제표_계정코드매핑'}
        toolbarButtons={{
          showAdd: false,
          showCopy: true,
          showDelete: true,
          showSave: false,
          enableExcelDownload: true,
          showExcelUpload: false,
        }}
      />
    </DetailGridStyles>
  )
});

export default DetailGrid;
