import React from "react";
import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import {
  createGridReadyHandlerRef,
  addNewRow,
  getSelectedRows,
} from "@utils/agGridUtils";
import type {
  GridApi,
  ColDef,
  IRowNode,
  CellValueChangedEvent,
  ValueFormatterParams,
  ICellRendererParams,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { message } from "antd";
import { usePageModal } from "@hooks/usePageModal";
import { AppPageModal } from "@components/ui/feedback";
import {
  AcntInqirePopup,
  BcncInqirePopup,
  ComCodeInqirePopup,
} from "@/pages/com/popup";
import type {
  AcntInqirePopupListResponse,
  BcncInqirePopupListResponse,
  ComCodeInqirePopupListResponse,
} from "@/types/com/popup";
import type { BankAcnutRegistListResponse } from "@/types/fcm/md/other/bankAcnutRegist.types";
import { getCodeDetailApi } from "@apis/com/code";
import { createCheckboxColumn } from "@components/ui/form/AgGrid/columns/checkboxColumn";
import {
  SearchIconCellRenderer,
  StatusTagRenderer,
} from "@components/ui/form/AgGrid/cells";
import { saveBankAcnutRegist } from "@apis/fcm/md/other/bankAcnutRegist";
import { useAuthStore } from "@store/com/auth/authStore";
import type { BankAcnutRegistSaveRequest } from "@/types/fcm/md/other/bankAcnutRegist.types";

// 행 데이터 타입 정의 (응답 타입에 rowStatus 추가)
export type BankAcnutRowData = BankAcnutRegistListResponse & {
  id: string | number;
  rowStatus?: "C" | "U" | "D";
  [key: string]: unknown;
};

type MainGridProps = {
  className?: string;
  rowData: BankAcnutRowData[];
  setRowData: Dispatch<SetStateAction<BankAcnutRowData[]>>;
  onSaveSuccess?: () => void;
};

export interface MainGridHandle {
  handleSave: () => Promise<void>;
  handleRefresh: () => void;
}

const MainGrid = React.forwardRef<MainGridHandle, MainGridProps>(
  (props: MainGridProps, ref: React.ForwardedRef<MainGridHandle>) => {
    const { t } = useTranslation();
    const { rowData, setRowData, onSaveSuccess, className } = props;
    const { user } = useAuthStore();
    const [, setSaving] = React.useState(false);
    const gridRef = React.useRef<GridApi<BankAcnutRowData> | null>(null);
    const searchContextRef = React.useRef<{
      node: IRowNode<BankAcnutRowData>;
      field: string;
    } | null>(null);
    const [bkGubunOptions, setBkGubunOptions] = React.useState<
      { value: string; label: string }[]
    >([]);
    const [currencyOptions, setCurrencyOptions] = React.useState<
      { value: string; label: string }[]
    >([]);
    const [orgOptions, setOrgOptions] = React.useState<
      { value: string; label: string }[]
    >([]);
    const [bankOptions, setBankOptions] = React.useState<
      { value: string; label: string }[]
    >([]);

    React.useEffect(() => {
      const fetchCodes = async () => {
        try {
          // 금융권 타입 (ACCTGB)
          const gubunResponse = await getCodeDetailApi({
            module: "GL",
            type: "ACCTGB",
            enabledFlag: "Y",
          });
          if (gubunResponse.success && Array.isArray(gubunResponse.data)) {
            setBkGubunOptions(
              gubunResponse.data.map((item) => ({
                value: String(item.code || ""),
                label: item.name1 || "",
              }))
            );
          }

          // 화폐 (FRNCUR)
          const currencyResponse = await getCodeDetailApi({
            module: "GL",
            type: "FRNCUR",
            enabledFlag: "Y",
          });
          if (
            currencyResponse.success &&
            Array.isArray(currencyResponse.data)
          ) {
            setCurrencyOptions(
              currencyResponse.data.map((item) => ({
                value: String(item.code || ""),
                label: String(item.code || ""),
              }))
            );
          }

          // 조직 (ORG)
          const orgResponse = await getCodeDetailApi({
            module: "PF",
            type: "ORG",
            enabledFlag: "Y",
          });
          if (orgResponse.success && Array.isArray(orgResponse.data)) {
            const options = orgResponse.data.map((item) => ({
              value: String(item.code || ""),
              label: item.name1 || "",
            }));
            setOrgOptions([{ value: "", label: "전체" }, ...options]);
          }

          // 은행 (BNKCDE)
          const bankResponse = await getCodeDetailApi({
            module: "GL",
            type: "BNKCDE",
            enabledFlag: "Y",
          });
          if (bankResponse.success && Array.isArray(bankResponse.data)) {
            setBankOptions(
              bankResponse.data.map((item) => ({
                value: String(item.code || ""),
                label: item.name1 || "",
              }))
            );
          }
        } catch (error) {
          console.error("Failed to fetch codes:", error);
        }
      };
      fetchCodes();
    }, []);

    // 그리드 데이터를 부모 상태와 동기화하는 함수
    const notifyRowDataChange = React.useCallback(() => {
      if (gridRef.current) {
        const allData: BankAcnutRowData[] = [];
        gridRef.current.forEachNode((node: IRowNode<BankAcnutRowData>) => {
          if (node.data) allData.push(node.data);
        });
        setRowData(allData);
      }
    }, [setRowData]);

    const onGridReady = React.useCallback(
      createGridReadyHandlerRef(gridRef),
      []
    );

    // 계정조회 팝업 설정
    const acntModal = usePageModal(AcntInqirePopup, {
      title: "계정조회",
      width: 800,
      height: 550,
      onReturn: (data: AcntInqirePopupListResponse) => {
        if (searchContextRef.current && gridRef.current) {
          const { node, field } = searchContextRef.current;
          const nameField = field === "accCode" ? "accName" : "onacctAccName";

          if (node.data) {
            node.setData({
              ...node.data,
              [field]: data.accCode,
              [nameField]: data.accName,
              rowStatus: node.data.rowStatus === "C" ? "C" : "U",
            } as BankAcnutRowData);

            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: [field, nameField, "rowStatus"],
              force: true,
            });

            notifyRowDataChange();
          }
        }
      },
    });

    const openAcntModal = React.useCallback(
      (node: IRowNode<BankAcnutRowData>, field: string) => {
        searchContextRef.current = { node, field };
        acntModal.openModal({
          initialSearch: {
            asAccCde: node.data?.[field as keyof BankAcnutRowData] as string,
          },
        });
      },
      [acntModal]
    );

    // 거래처조회 팝업 설정
    const bcncModal = usePageModal(BcncInqirePopup, {
      title: "거래처조회",
      width: 1000,
      onReturn: (data: BcncInqirePopupListResponse) => {
        if (searchContextRef.current && gridRef.current) {
          const { node, field } = searchContextRef.current;

          if (node.data) {
            node.setData({
              ...node.data,
              [field]: data.custno,
              rowStatus: node.data.rowStatus === "C" ? "C" : "U",
            } as BankAcnutRowData);

            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: [field, "rowStatus"],
              force: true,
            });

            notifyRowDataChange();
          }
        }
      },
    });

    const openBcncModal = React.useCallback(
      (node: IRowNode<BankAcnutRowData>, field: string) => {
        searchContextRef.current = { node, field };
        bcncModal.openModal({
          asOfficeId: "OSE",
          initialCustno: node.data?.[field as keyof BankAcnutRowData] as string,
        });
      },
      [bcncModal]
    );

    // 은행코드 팝업 설정
    const bankModal = usePageModal(ComCodeInqirePopup, {
      title: "은행코드",
      width: 800,
      height: 550,
      onReturn: (data: ComCodeInqirePopupListResponse) => {
        if (searchContextRef.current && gridRef.current) {
          const { node, field } = searchContextRef.current;

          if (node.data) {
            node.setData({
              ...node.data,
              [field]: data.code,
              bankName: data.codeNme,
              rowStatus: node.data.rowStatus === "C" ? "C" : "U",
            } as BankAcnutRowData);

            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: [field, "bankName", "rowStatus"],
              force: true,
            });

            notifyRowDataChange();
          }
        }
      },
    });

    const openBankModal = React.useCallback(
      (node: IRowNode<BankAcnutRowData>, field: string) => {
        searchContextRef.current = { node, field };
        bankModal.openModal({
          asCodeTy: "BNKCDE",
          initialCode: node.data?.[field as keyof BankAcnutRowData] as string,
        });
      },
      [bankModal]
    );

    // 새 행 생성 함수
    const createNewRow = React.useCallback(
      (newId: number | string, seq?: number): BankAcnutRowData => ({
        id: String(newId),
        bankCode: "",
        bankName: "",
        bankRgnName: "",
        accNbrCode: "",
        useYn: "Y",
        currency: "KRW",
        rowStatus: "C",
        seq: seq || 1,
      }),
      []
    );

    // 새 ID 생성 함수
    const generateNewId = React.useCallback((): string => {
      if (rowData.length === 0) return "1";
      const maxId = Math.max(
        ...rowData.map((row) => {
          const id = row.id;
          if (typeof id === "number") return id;
          const num = parseInt(String(id), 10);
          return isNaN(num) ? 0 : num;
        })
      );
      return String(maxId + 1);
    }, [rowData]);

    // 새 SEQ 생성 함수
    const generateNewSeq = React.useCallback((): number => {
      if (rowData.length === 0) return 1;
      const maxSeq = Math.max(...rowData.map((row) => row.seq || 0));
      return maxSeq + 1;
    }, [rowData]);

    // 행 추가 핸들러
    const handleAddRow = React.useCallback(() => {
      addNewRow<BankAcnutRowData>(
        rowData,
        (newId) => createNewRow(newId, generateNewSeq()),
        setRowData,
        gridRef.current,
        "bankCode"
      );
    }, [rowData, generateNewSeq, createNewRow, setRowData]);

    // 행 복사 핸들러
    const handleCopyRow = React.useCallback(() => {
      const selectedRows = getSelectedRows<BankAcnutRowData>(
        gridRef.current,
        () => message.warning("복사할 행을 선택해주세요.")
      );
      if (!selectedRows) return;

      const newRows = selectedRows.map((row) => {
        const newId = generateNewId();
        const newSeq = generateNewSeq();
        return {
          ...row,
          id: newId,
          seq: newSeq,
          rowStatus: "C" as const,
        } as BankAcnutRowData;
      });

      setRowData([...rowData, ...newRows]);
    }, [rowData, generateNewId, generateNewSeq, setRowData]);

    // 행 삭제 핸들러
    const handleDeleteRow = React.useCallback(() => {
      const selectedRows = getSelectedRows<BankAcnutRowData>(
        gridRef.current,
        () => message.warning("삭제할 행을 선택해주세요.")
      );
      if (!selectedRows) return;

      const selectedIds = new Set(selectedRows.map((row) => row.id));
      const updatedRows = rowData
        .map((row) => {
          if (selectedIds.has(row.id)) {
            // 신규 추가된 행('C')은 즉시 제거
            if (row.rowStatus === "C") return null;
            // 기존 데이터는 삭제 상태('D')로 변경
            return { ...row, rowStatus: "D" as const };
          }
          return row;
        })
        .filter((row): row is BankAcnutRowData => row !== null);

      setRowData(updatedRows);
      message.success("삭제되었습니다. (저장 시 반영됩니다)");
    }, [rowData, setRowData]);

    const createOrgValueFormatter = React.useCallback(
      () => (params: ValueFormatterParams<BankAcnutRowData, string>) => {
        const val =
          params.value === undefined || params.value === null
            ? ""
            : String(params.value);
        if (val === "") return "전체";
        const option = orgOptions.find(
          (opt: { value: string; label: string }) => opt.value === val
        );
        return option ? option.label : val;
      },
      [orgOptions]
    );

    const columnDefs = React.useMemo<ColDef<BankAcnutRowData>[]>(
      () => [
        {
          headerName: t("상태"),
          field: "rowStatus",
          width: 50,
          pinned: "left",
          excludeFromExcel: true,
          cellRenderer: StatusTagRenderer,
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          headerName: t("순번_축약형"),
          field: "seq",
          valueGetter: "node.rowIndex + 1",
          width: 50,
          pinned: "left",
          cellStyle: { textAlign: "center" },
          headerClass: "ag-header-cell-center",
        },
        {
          headerName: t("은행코드"),
          field: "bankCode",
          width: 100,
          pinned: "left",
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellRenderer: SearchIconCellRenderer,
          cellRendererParams: (
            params: ICellRendererParams<BankAcnutRowData>
          ) => ({
            onSearchClick: (node: IRowNode<BankAcnutRowData>, field: string) =>
              openBankModal(node, field),
            showIcon: params.data?.rowStatus === "C",
          }),
        },
        {
          headerName: t("은행명"),
          field: "bankName",
          width: 100,
          pinned: "left",
          editable: true,
          cellEditor: "agRichSelectCellEditor",
          cellEditorParams: {
            values: bankOptions.map(
              (opt: { value: string; label: string }) => opt.label
            ),
            searchDebounceDelay: 200,
          },
        },
        {
          headerName: t("지점명"),
          field: "bankRgnName",
          width: 100,
          pinned: "left",
          editable: true,
        },
        {
          headerName: t("실계좌번호"),
          field: "accNbrCode",
          width: 150,
          pinned: "left",
          editable: true,
        },
        {
          headerName: t("계정코드"),
          field: "accCode",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellRenderer: SearchIconCellRenderer,
          cellRendererParams: {
            onSearchClick: (node: IRowNode<BankAcnutRowData>, field: string) =>
              openAcntModal(node, field),
          },
        },
        { headerName: t("계정명"), field: "accName", width: 200 },
        {
          headerName: t("선수금계정"),
          field: "onacctAccCode",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellRenderer: SearchIconCellRenderer,
          cellRendererParams: {
            onSearchClick: (node: IRowNode<BankAcnutRowData>, field: string) =>
              openAcntModal(node, field),
          },
        },
        { headerName: t("선수금계정명"), field: "onacctAccName", width: 200 },
        {
          headerName: t("거래처"),
          field: "custNo",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellRenderer: SearchIconCellRenderer,
          cellRendererParams: {
            onSearchClick: (node: IRowNode<BankAcnutRowData>, field: string) =>
              openBcncModal(node, field),
          },
        },
        {
          headerName: t("금융권타입"),
          field: "bankType",
          width: 150,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
        },
        {
          headerName: t("사업부"),
          field: "dvs",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: orgOptions.map(
              (opt: { value: string; label: string }) => opt.value
            ),
          },
          valueFormatter: createOrgValueFormatter(),
        },
        {
          headerName: t("사업장"),
          field: "orgId",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: orgOptions.map(
              (opt: { value: string; label: string }) => opt.value
            ),
          },
          valueFormatter: createOrgValueFormatter(),
        },
        {
          headerName: t("은행주소"),
          field: "bankAddr",
          width: 300,
          editable: true,
        },
        createCheckboxColumn<BankAcnutRowData>(t("TR사용"), "trAccount", {
          width: 100,
        }),
        createCheckboxColumn<BankAcnutRowData>(
          t("예금시제표_표시"),
          "attribute10",
          {
            width: 120,
          }
        ),
        {
          headerName: t("계좌번호별칭"),
          field: "accNbr",
          width: 200,
          editable: true,
        },
        {
          headerName: t("계좌명"),
          field: "accNbrName",
          width: 200,
          editable: true,
        },
        {
          headerName: t("화폐"),
          field: "currency",
          width: 100,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: currencyOptions.map(
              (opt: { value: string; label: string }) => opt.value
            ),
          },
        },
        {
          headerName: t("계좌종류"),
          field: "bkGubun",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: bkGubunOptions.map(
              (opt: { value: string; label: string }) => opt.value
            ),
          },
          refData: bkGubunOptions.reduce(
            (
              acc: Record<string, string>,
              opt: { value: string; label: string }
            ) => {
              acc[opt.value] = opt.label;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
        createCheckboxColumn<BankAcnutRowData>(
          t("수금_Default"),
          "receiptDefault",
          {
            width: 120,
          }
        ),
        createCheckboxColumn<BankAcnutRowData>(
          t("지급_Default"),
          "paymentDefault",
          {
            width: 120,
          }
        ),
        createCheckboxColumn<BankAcnutRowData>(t("사용"), "useYn", {
          width: 80,
        }),
        {
          headerName: t("구계정코드"),
          field: "oldAccCode",
          width: 120,
          editable: true,
          bodyAlign: "center",
          headerClass: "ag-header-cell-center",
        },
        {
          headerName: t("구계좌번호"),
          field: "oldAcctNbr",
          width: 200,
          editable: true,
        },
      ],
      [
        t,
        createOrgValueFormatter,
        openAcntModal,
        openBcncModal,
        openBankModal,
        bkGubunOptions,
        currencyOptions,
        orgOptions,
        bankOptions,
      ]
    );

    const handleCellValueChanged = React.useCallback(
      (params: CellValueChangedEvent<BankAcnutRowData>) => {
        if (params.data) {
          const updatedRow = params.data;
          const columnsToRefresh = ["rowStatus"];

          // 은행명이 변경된 경우 은행코드도 업데이트
          if (params.column.getColId() === "bankName") {
            const bankName = params.newValue;
            const bankOption = bankOptions.find(
              (opt: { value: string; label: string }) => opt.label === bankName
            );
            if (bankOption) {
              updatedRow.bankCode = bankOption.value;
              columnsToRefresh.push("bankCode");
            }
          }

          if (updatedRow.rowStatus !== "C" && updatedRow.rowStatus !== "D") {
            updatedRow.rowStatus = "U";
          }

          params.api.refreshCells({
            rowNodes: [params.node],
            columns: columnsToRefresh,
            force: true,
          });

          notifyRowDataChange();
        }
      },
      [bankOptions, notifyRowDataChange]
    );

    // 새로고침 핸들러
    const handleRefresh = React.useCallback(() => {
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    }, [onSaveSuccess]);

    // 저장 핸들러
    const handleSave = React.useCallback(async () => {
      setSaving(true);
      try {
        const changedData = rowData.filter((row) => row.rowStatus);
        if (changedData.length === 0) {
          message.info("변경사항이 없습니다.");
          setSaving(false);
          return;
        }

        const saveList = changedData
          .map((row: BankAcnutRowData) => {
            const mappedRow = { ...row };

            if (mappedRow.rowStatus === "C") {
              mappedRow.officeId = user?.officeId || "OSE";
              mappedRow.orgId = "HO"; // 기본값
            }

            return mappedRow;
          })
          .filter(
            (
              row: BankAcnutRowData
            ): row is BankAcnutRowData & { rowStatus: "C" | "U" | "D" } =>
              !!row.rowStatus &&
              ["C", "U", "D"].includes(row.rowStatus as string)
          );

        if (saveList.length === 0) {
          setRowData((prev: BankAcnutRowData[]) =>
            prev.filter((r) => r.rowStatus !== "D")
          );
          setSaving(false);
          return;
        }

        const saveRequest: BankAcnutRegistSaveRequest = {
          list: saveList.map((row) => ({
            ...row,
            rowStatus: row.rowStatus as "C" | "U" | "D",
          })),
        };
        const response = await saveBankAcnutRegist(saveRequest);

        if (response.success) {
          message.success("저장에 성공하였습니다.");
          if (onSaveSuccess) {
            onSaveSuccess();
          }
        }
      } catch (error) {
        console.error("Save error:", error);
        message.error("저장 중 오류가 발생했습니다.");
      } finally {
        setSaving(false);
      }
    }, [rowData, user, onSaveSuccess, setRowData]);

    React.useImperativeHandle(ref, () => ({
      handleSave,
      handleRefresh,
    }));

    const gridOptions = React.useMemo(
      () => ({
        rowSelection: "multiple" as const,
        animateRows: true,
        pagination: false,
        suppressRowClickSelection: false,
        onGridReady,
        onCellValueChanged: handleCellValueChanged,
      }),
      [onGridReady, handleCellValueChanged]
    );

    const toolbarButtons = React.useMemo(
      () => ({
        showAdd: true,
        showCopy: true,
        showDelete: true,
        showExcelDownload: true,
        showExcelUpload: false,
        showRefresh: true,
        showSave: false,
      }),
      []
    );

    return (
      <>
        <FormAgGrid<BankAcnutRowData>
          idField="id"
          columnDefs={columnDefs}
          rowData={rowData}
          gridOptions={gridOptions}
          showToolbar={true}
          enableFilter={false}
          toolbarButtons={toolbarButtons}
          onAddRow={handleAddRow}
          onCopyRow={handleCopyRow}
          onDeleteRow={handleDeleteRow}
          onSave={handleSave}
          setRowData={setRowData}
          createNewRow={createNewRow}
          onRefresh={handleRefresh}
          excelFileName={() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `은행계좌 등록_${year}${month}${day}`;
          }}
          className={className}
        />
        <AppPageModal {...acntModal.modalProps} />
        <AppPageModal {...bcncModal.modalProps} />
        <AppPageModal {...bankModal.modalProps} />
      </>
    );
  }
);

export default React.memo(MainGrid);
