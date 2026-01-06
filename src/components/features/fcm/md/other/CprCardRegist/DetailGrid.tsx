import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Tag } from "antd";
import type { GridApi, GridReadyEvent, CellStyle, CellValueChangedEvent, IRowNode, ValueFormatterParams } from "ag-grid-community";

import FormAgGrid, { type ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { showError, showSuccess, info, confirm } from "@components/ui/feedback/Message";
import { parseExcelFile } from "@utils/excelUtils";
import type { AcntCodeListResponse } from "@/types/fcm/md/account/AcntCodeRegist.types";
import { useAcntCodeRegistStore } from "@/store/fcm/md/account/AcntCodeRegistStore";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import { AcntInqirePopup } from "@/pages/com/popup";

import { createComboBoxColumn } from "@components/ui/form/AgGrid/columns/comboBoxColumn";
import { getCodeDetailApi, type CodeDetail } from "@apis/com/code";

type GridRowData = AcntCodeListResponse & {
  id?: string | number;
  rowStatus?: "C" | "U" | "D";
};

type DetailGridProps = {
  className?: string;
};

// 계정 팝업 Props 타입 (필요한 경우)
type AcntInqirePopupProps = {
  asOfficeId?: string;
  initialAccCode?: string;
  initialSearch?: {
    asAccCde?: string;
    asAccActYn?: string;
    asCstPayYn?: string;
    asUseYn?: string;
    asAccLvl?: string;
  };
};

const YN_OPT_OPTIONS = [
  { value: "1", label: "Yes" },
  { value: "2", label: "No" },
  { value: "3", label: "Opt." },
];

const YN_OPTIONS = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
];

/**
 * 전역 formatters.ts 수정을 피하기 위한 로컬 공통코드 포맷터
 * segment5 등 커스텀 필드를 키로 사용하는 경우를 지원합니다.
 */
const localComCodeCache = new Map<string, { value: string; label: string }[]>();

const createLocalComCodeFormatter = (valueKey: string = "code", labelKey: string = "name1", optField?: string) => {
  return (params: ValueFormatterParams) => {
    // 만약 optField가 있고 그 값이 '1'(Yes)이 아니면 표시하지 않음
    if (optField && params.data?.[optField] !== "1") return "";

    const val = params.value;
    if (val === undefined || val === null || val === "") return "";

    const colDef = params.column.getColDef();
    const comCodeParams = colDef.cellEditorParams?.comCodeParams;
    if (!comCodeParams) return val;

    const cacheKey = JSON.stringify(comCodeParams) + "_" + valueKey + "_" + labelKey;
    const cachedOptions = localComCodeCache.get(cacheKey);

    if (cachedOptions) {
      const option = cachedOptions.find(opt => opt.value === String(val));
      return option ? option.label : val;
    }

    // 캐시가 없으면 백그라운드에서 로드
    getCodeDetailApi(comCodeParams).then(response => {
      if (response.success && Array.isArray(response.data)) {
        const options = response.data.map(item => ({
          value: String(item[valueKey as keyof CodeDetail] || ""),
          label: String(item[labelKey as keyof CodeDetail] || ""),
        }));
        localComCodeCache.set(cacheKey, options);
        // 데이터 로드 후 해당 셀만 새로고침
        if (params.api && params.node && params.column) {
          params.api.refreshCells({
            rowNodes: [params.node],
            columns: [params.column.getColId()],
            force: true,
          });
        }
      }
    });

    return val;
  };
};

const DetailGrid: React.FC<DetailGridProps> = ({ className }) => {
  const { searchData, setGridApi, loading, selectedData, setSelectedData, mode, setMode, updateData } = useAcntCodeRegistStore();
  const gridRef = useRef<GridApi | null>(null);
  const [rowData, setRowData] = useState<GridRowData[]>([]);
  const activeNodeRef = useRef<IRowNode<GridRowData> | null>(null);

  useEffect(() => {
    // 스토어 데이터가 변경되면 그리드 데이터 업데이트 (이미 _rowId 포함됨)
    setRowData(searchData as GridRowData[]);
  }, [searchData]);



  const onGridReady = (params: GridReadyEvent) => {
    gridRef.current = params.api;
    setGridApi(params.api);
  };

  // 1. 계정 조회 모달 (상위계정 등 검색 시 사용 가능하도록 설정)
  const acntModal = usePageModal<AcntInqirePopupProps, any>(
    AcntInqirePopup,
    {
      title: "계정조회",
      centered: true,
      width: 700,
      height: 600,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        const node = activeNodeRef.current;
        if (!node || !node.data || !gridRef.current) return;

        const updatedData = { ...node.data };
        const field = (activeNodeRef.current as any).activeField;

        if (field) {
          updatedData[field as keyof GridRowData] = returnValue.accCode as any;
          if (field === 'accCode') {
            updatedData.accName = returnValue.accName;
          }

          // 상태 업데이트
          if (updatedData.rowStatus !== "C") {
            updatedData.rowStatus = "U";
          }

          node.setData(updatedData);
          gridRef.current.refreshCells({ rowNodes: [node], columns: [field, 'accName', 'rowStatus'], force: true });

          // 스토어 동기화
          updateData(updatedData as AcntCodeListResponse);
        }
      }
    }
  );

  const handleSearchClick = useCallback((node: IRowNode<GridRowData>, field: string) => {
    if (!node || !node.data) return;

    node.setSelected(true);
    activeNodeRef.current = node;
    (activeNodeRef.current as any).activeField = field;

    // 현재는 예시로 highAccCode들에 대해 계정 팝업 연결
    acntModal.openModal({
      asOfficeId: node.data.officeId,
      initialAccCode: node.data[field as keyof GridRowData] as string,
    });
  }, [acntModal]);

  // 컬럼 정의
  const columnDefs: ExtendedColDef<GridRowData>[] = useMemo(
    () => {


      const getEditable = (params: { data?: GridRowData }) => {
        return mode === "edit" && params.data?.rowStatus !== "D";
      };

      const accLvlOptions = ["01", "02", "03", "04", "05"].map(v => ({ value: v, label: v }));
      const accMgmtLvlOptions = ["1", "2", "3"].map(v => ({ value: v, label: v }));
      const vfOptions = [
        { value: "VARIABLE", label: "변동비" },
        { value: "FIXED", label: "고정비" }
      ];

      return [
        {
          field: "ifrsOrderSeq",
          headerName: "순번",
          width: 80,
          minWidth: 80,
          maxWidth: 80,
          suppressHeaderMenuButton: true,
          suppressMenu: true,
          sortable: false,
          filter: false,
          resizable: false,
          editable: false,
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "rowStatus",
          headerName: "상태",
          width: 80,
          minWidth: 80,
          maxWidth: 80,
          pinned: "left",
          suppressHeaderMenuButton: true,
          suppressMenu: true,
          sortable: false,
          filter: false,
          resizable: false,
          editable: false,
          cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
            if (!params.value) return null;
            const statusMap = {
              C: { text: "추가", color: "blue" },
              U: { text: "수정", color: "orange" },
              D: { text: "삭제", color: "red" },
            };
            const statusInfo = statusMap[params.value];
            if (!statusInfo) return null;
            return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
        },

        // 1. Basic Info
        {
          field: "accCode",
          headerName: "카드번호",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: (params) => params.data?.rowStatus === "C",
          headerClass: "required-header",
          cellStyle: { textAlign: "center" } as CellStyle,
        },
        {
          field: "accName",
          headerName: "카드별칭",
          width: 170,
          minWidth: 170,
          maxWidth: 170,
          editable: true,
          headerClass: "required-header",
        },
        {
          field: "accEngName",
          headerName: "카드발급일자",
          width: 200,
          minWidth: 200,
          maxWidth: 200,
          editable: true,
        },
        {
          field: "accAbb",
          headerName: "만료일",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: true,
          cellStyle: { textAlign: "center" } as CellStyle,
        },
        // 2. Account Settings
        {
          ...createComboBoxColumn(
            "accLvl",
            "계정 LVL",
            {
              options: accLvlOptions,
              editable: true,
            },
            100
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        {
          field: "actAccYn",
          headerName: "카드종류",
          width: 100,
          minWidth: 100,
          maxWidth: 100,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.actAccYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.actAccYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          ...createComboBoxColumn(
            "acctType",
            "계정유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCTYP",
                enabledFlag: "Y",
              },
              editable: true,
            },
            120
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center",
        },
        // 3. Hierarchy
        {
          field: "highAccCode1",
          headerName: "카드종류명칭",
          width: 140,
          minWidth: 140,
          maxWidth: 140,
          editable: true,
        },
        {
          field: "highAccCode2",
          headerName: "거래서(사원)",
          width: 140,
          minWidth: 140,
          maxWidth: 140,
          editable: true,
        },
        {
          field: "highAccCode3",
          headerName: "거래처명(사원)",
          width: 140,
          minWidth: 140,
          maxWidth: 140,
          editable: true,
        },
        {
          field: "highAccCode4",
          headerName: "사용",
          width: 140,
          minWidth: 140,
          maxWidth: 140,
          editable: true,
        },
        {
          field: "highAccCode5",
          headerName: "소지자사번",
          width: 140,
          minWidth: 140,
          maxWidth: 140,
          editable: true,
        },
        // 4. Output Names
        { field: "accOutName1", headerName: "소지자", width: 150, minWidth: 150, maxWidth: 150, editable: true },
        { field: "accOutName2", headerName: "카드관리자", width: 150, minWidth: 150, maxWidth: 150, editable: true },
        { field: "accOutName3", headerName: "카드관리자명", width: 150, minWidth: 150, maxWidth: 150, editable: true },
        { field: "accOutName4", headerName: "유효기간", width: 150, minWidth: 150, maxWidth: 150, editable: true },
        // 5. Display Options
        {
          field: "cdtDbtYn",
          headerName: "결제은행",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.cdtDbtYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.cdtDbtYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "cstPayYn",
          headerName: "결제계좌",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.cstPayYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.cstPayYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "tbOutYn",
          headerName: "전화번호",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.tbOutYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.tbOutYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "bsOutYn",
          headerName: "이전카드번호",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.bsOutYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.bsOutYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "isOutYn",
          headerName: "계정코드",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.isOutYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.isOutYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        // 6. Functional Options
        {
          ...createComboBoxColumn(
            "prdExpnYn",
            "선급비용 여부",
            { options: YN_OPTIONS, editable: true },
            110
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          width: 120,
          minWidth: 120,
          maxWidth: 120,
        },
        {
          ...createComboBoxColumn(
            "prepayAmtYn",
            "선급금 여부",
            { options: YN_OPTIONS, editable: true },
            100
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          width: 120,
          minWidth: 120,
          maxWidth: 120,
        },
        {
          field: "evidenceYn",
          headerName: "계정명",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.evidenceYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.evidenceYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "fundIcmExpnYn",
          headerName: "공정코드",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.fundIcmExpnYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.fundIcmExpnYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "entItemYn",
          headerName: "공정명",
          width: 100,
          minWidth: 100,
          maxWidth: 100,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.entItemYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.entItemYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "useYn",
          headerName: "차량번호",
          width: 100,
          minWidth: 100,
          maxWidth: 100,
          editable: getEditable,
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
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        {
          field: "newYn",
          headerName: "사업장",
          width: 100,
          minWidth: 100,
          maxWidth: 100,
          editable: getEditable,
          cellEditor: "agCheckboxCellEditor",
          cellRenderer: "agCheckboxCellRenderer",
          valueGetter: (params) => {
            return params.data?.newYn === "Y";
          },
          valueSetter: (params) => {
            if (params.data) {
              params.data.newYn = params.newValue ? "Y" : "N";
              return true;
            }
            return false;
          },
          cellStyle: { textAlign: "center" } as CellStyle,
          cellClass: "ag-checkbox-cell-center",
          headerClass: "ag-header-cell-center",
        },
        // 7. Management Items
        { ...createComboBoxColumn("accMgmtNbr1Opt", "관리항목(1)선택", { options: YN_OPT_OPTIONS, editable: true }, 150), width: 150, minWidth: 150, maxWidth: 150 },
        {
          ...createComboBoxColumn<GridRowData>(
            "accMgmtNbr1Type",
            "관리항목(1)유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "CUST",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            150,
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center required-header",
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.accMgmtNbr1Opt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "accMgmtNbr1Opt"),
        },
        { ...createComboBoxColumn("accMgmtNbr2Opt", "관리항목(2)선택", { options: YN_OPT_OPTIONS, editable: true }, 150), width: 150, minWidth: 150, maxWidth: 150 },
        {
          ...createComboBoxColumn<GridRowData>(
            "accMgmtNbr2Type",
            "관리항목(2)유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "MNG",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            100,
          ),
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.accMgmtNbr2Opt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "accMgmtNbr2Opt"),
        },
        { ...createComboBoxColumn("refOpt", "REF 선택", { options: YN_OPT_OPTIONS, editable: true }, 150), width: 150, minWidth: 150, maxWidth: 150 },
        {
          ...createComboBoxColumn<GridRowData>(
            "refType",
            "REF 유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "REF",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            100
          ),
          cellStyle: { textAlign: "center" } as CellStyle,
          headerClass: "ag-header-cell-center required-header",
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.refOpt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "refOpt"),
        },
        { ...createComboBoxColumn("exchgRateOpt", "금액선택", { options: YN_OPT_OPTIONS, editable: true }, 100) },
        {
          ...createComboBoxColumn<GridRowData>(
            "exchgRateType",
            "금액유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "EXCH",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            100
          ),
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.exchgRateOpt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "exchgRateOpt"),
        },
        { ...createComboBoxColumn("unitOpt", "단위선택", { options: YN_OPT_OPTIONS, editable: true }, 150), width: 150, minWidth: 150, maxWidth: 150 },
        {
          ...createComboBoxColumn<GridRowData>(
            "unitType",
            "단위유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "UNIT",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            100
          ),
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.unitOpt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "unitOpt"),
        },
        { ...createComboBoxColumn("etcOpt", "기타선택", { options: YN_OPT_OPTIONS, editable: true }, 150), width: 150, minWidth: 150, maxWidth: 150 },
        {
          ...createComboBoxColumn<GridRowData>(
            "etcType",
            "기타유형",
            {
              comCodeParams: {
                module: "GL",
                type: "ACCMNG",
                attribute4: "ETC",
                enabledFlag: "Y",
              },
              editable: true, // createComboBoxColumn에서 기본값으로 사용, 아래에서 함수로 덮어씀
              valueKey: "segment5",
              labelKey: "name1",
            },
            100
          ),
          editable: (params) => mode === "edit" && params.data?.rowStatus !== "D" && params.data?.etcOpt === "1",
          width: 150,
          minWidth: 150,
          maxWidth: 150,
          valueFormatter: createLocalComCodeFormatter("segment5", "name1", "etcOpt"),
        },
        // 8. Dates & Codes
        { ...createComboBoxColumn("occurDateOpt", "발생일자선택", { options: YN_OPT_OPTIONS, editable: true }, 110) },
        { ...createComboBoxColumn("maturDateOpt", "만기일자선택", { options: YN_OPT_OPTIONS, editable: true }, 110) },
        { ...createComboBoxColumn("cstCdeOpt", "공정코드선택", { options: YN_OPT_OPTIONS, editable: true }, 110) },
        { ...createComboBoxColumn("finGdsGrpOpt", "제품코드선택", { options: YN_OPT_OPTIONS, editable: true }, 110) },
        // 9. Classification & Levels
        { field: "coType", headerName: "원가요소구분", width: 110, minWidth: 110, maxWidth: 110, editable: true },
        {
          ...createComboBoxColumn("vfType", "변동비/고정비", { options: vfOptions, editable: true }, 120),
          cellStyle: { textAlign: "center" } as CellStyle,
        },
        { field: "plType", headerName: "손익요소 구분", width: 110, minWidth: 110, maxWidth: 110, editable: true },
        {
          ...createComboBoxColumn("accMgmtLvl", "계정관리수준", { options: accMgmtLvlOptions, editable: true }, 110),
          cellStyle: { textAlign: "center" } as CellStyle,
        },
        // 10. System Fields
        { field: "lagacyCode", headerName: "과거코드", width: 100, minWidth: 100, maxWidth: 100, editable: true },
        { field: "createdBy", headerName: "생성자", width: 90, minWidth: 90, maxWidth: 90, editable: false },
        { field: "creationDate", headerName: "생성일", width: 110, minWidth: 110, maxWidth: 110, editable: false },
        { field: "lastUpdatedBy", headerName: "최종수정자", width: 100, minWidth: 100, maxWidth: 100, editable: false },
        { field: "lastUpdateDate", headerName: "최종수정일", width: 110, editable: false },
        { field: "terminalId", headerName: "사용자IP", width: 100, editable: false },
      ];
    },
    [handleSearchClick]
  );

  // 행추가
  const handleAddRow = useCallback(() => {
    if (!gridRef.current) return;

    const newRow: GridRowData = {
      accCode: "",
      accName: "",

      // Defaults from ACAB101E0.xml
      dlyTbOutYn: "Y",
      glOutYn: "Y",
      tbOutYn: "Y",
      actAccYn: "Y",
      accMgmtNbr1Opt: "N",
      accMgmtNbr2Opt: "N",
      refOpt: "N",
      exchgRateOpt: "N",
      unitOpt: "N",
      etcOpt: "N",
      occurDateOpt: "N",
      maturDateOpt: "N",
      cstCdeOpt: "N",
      finGdsGrpOpt: "N",
      accLvl: "05",
      accOutLvl: "1",
      accMgmtLvl: "1",
      useYn: "Y",
      newYn: "Y",

      rowStatus: "C", // 신규 상태
      _rowId: Math.random().toString(36).substring(2, 11), // 프론트엔드 식별자
    };

    // 스토어에 먼저 추가 (동기화 원천)
    updateData(newRow);

    gridRef.current.applyTransaction({ add: [newRow] });

    // 새로 추가된 행을 선택 상태로 설정하고 편집 모드로 전환
    setSelectedData(newRow);
    setMode("edit");

    // 포커스 (맨 아래 행)
    const lastRowIndex = gridRef.current.getDisplayedRowCount() - 1;
    gridRef.current.ensureIndexVisible(lastRowIndex);
    const firstCol = gridRef.current.getAllDisplayedColumns()[1]; // 상태(rowStatus) 다음 (계정코드)
    gridRef.current.setFocusedCell(lastRowIndex, firstCol);
  }, [setSelectedData, setMode, updateData]);

  // 행복사
  const handleCopyRow = useCallback(() => {
    if (!gridRef.current) return;

    let selectedRows = gridRef.current.getSelectedRows() as GridRowData[];

    // 그리드 선택이 없으면 상세 뷰에서 선택된 데이터(Store) 사용 시도
    if (selectedRows.length === 0 && selectedData) {
      selectedRows = [selectedData as GridRowData];
    }

    if (selectedRows.length === 0) {
      info({ content: "복사할 행을 선택해주세요." });
      return;
    }

    const newRows = selectedRows.map((row) => ({
      ...row,
      accCode: "", // 코드는 비움 (신규이므로)
      rowStatus: "C",
      _rowId: Math.random().toString(36).substring(2, 11), // 프론트엔드 식별자
      creationDate: undefined,
      lastUpdateDate: undefined,
      createdBy: undefined,
      lastUpdatedBy: undefined
    }));

    // 스토어 동기화
    newRows.forEach((row) => {
      updateData(row as AcntCodeListResponse);
    });

    gridRef.current.applyTransaction({ add: newRows });
    showSuccess(`${newRows.length}건이 복사되었습니다.`);
  }, [selectedData, updateData]);

  // 행삭제
  const handleDeleteRow = useCallback(() => {
    if (!gridRef.current) return;

    const selectedNodes = gridRef.current.getSelectedNodes();
    if (selectedNodes.length === 0) {
      info({ content: "삭제할 행을 선택해주세요." });
      return;
    }

    confirm({
      title: "삭제 확인",
      content: "선택한 항목을 삭제하시겠습니까?",
      onOk: () => {
        selectedNodes.forEach(node => {
          if (node.data) {
            const rowData = node.data;
            if (rowData.rowStatus === "C") {
              // 신규행은 즉시 삭제
              gridRef.current?.applyTransaction({ remove: [rowData] });
            } else {
              // 기존행은 "D" 마킹
              rowData.rowStatus = "D";
              node.setData(rowData);
              gridRef.current?.refreshCells({ rowNodes: [node], columns: ["rowStatus"], force: true });
            }
          }
        });
        showSuccess("삭제 마킹되었습니다. 저장 시 최종 반영됩니다.");
      }
    });
  }, []);

  // 엑셀 다운로드
  const handleExcelDownload = useCallback(() => {
    if (!gridRef.current) return;
    gridRef.current.exportDataAsExcel({
      fileName: `계정코드등록_${new Date().toISOString().slice(0, 10)}`,
    });
  }, []);

  // 엑셀 업로드
  const handleExcelUpload = useCallback(async (file: File) => {
    try {
      const uploadedData = await parseExcelFile<any>(file);
      if (uploadedData && uploadedData.length > 0) {
        const newRows = uploadedData.map(item => ({
          ...item,
          rowStatus: "C",
          _rowId: Math.random().toString(36).substring(2, 11)
        }));
        gridRef.current?.applyTransaction({ add: newRows });
        showSuccess(`${newRows.length}건이 업로드되었습니다.`);
      }
    } catch (e) {
      showError("엑셀 업로드 실패");
    }
    return false;
  }, []);

  return (
    <>
      <FormAgGrid<GridRowData>
        className={className}
        rowData={rowData}
        columnDefs={columnDefs}
        idField="_rowId"
        showToolbar={true}
        onGridReady={onGridReady}
        loading={loading}
        toolbarButtons={{
          showAdd: true,
          showCopy: false,
          showDelete: true,
          showExcelDownload: true,
          showExcelUpload: false,
        }}
        onAddRow={handleAddRow}
        onCopyRow={handleCopyRow}
        onDeleteRow={handleDeleteRow}
        onExcelDownload={handleExcelDownload}
        onExcelUpload={handleExcelUpload}
        gridOptions={{
          getRowId: (params) => params.data._rowId,
          rowSelection: "single",
          pagination: false,
          rowHeight: 32,
          headerHeight: 32,
          suppressRowClickSelection: false,
          onCellValueChanged: (params: CellValueChangedEvent) => {
            if (params.data && params.oldValue !== params.newValue) {
              const data = params.data as GridRowData;
              const colId = params.column.getColId();

              // 관리항목 선택(Opt)이 변경되었을 때 유형(Type) 처리
              const optToTypeMap: Record<string, string> = {
                accMgmtNbr1Opt: "accMgmtNbr1Type",
                accMgmtNbr2Opt: "accMgmtNbr2Type",
                refOpt: "refType",
                exchgRateOpt: "exchgRateType",
                unitOpt: "unitType",
                etcOpt: "etcType",
              };

              if (optToTypeMap[colId] && params.newValue !== "1") {
                // Yes가 아니면 유형 값을 비움
                const typeField = optToTypeMap[colId];
                (data as any)[typeField] = "";
                params.api.refreshCells({ rowNodes: [params.node], columns: [typeField], force: true });
              }

              // 신규가 아닌 경우 상태 "U"로 변경
              if (data.rowStatus !== "C" && data.rowStatus !== "D") {
                data.rowStatus = "U";
                params.node.setData(data);
                params.api.refreshCells({ rowNodes: [params.node], columns: ["rowStatus"], force: true });
              }

              // 스토어 동기화 (Form에 반영)
              updateData(data as AcntCodeListResponse);
            }
          },
          onRowClicked: (event) => {
            if (event.data) {
              setSelectedData(event.data);
              setMode("edit");
            }
          }
        }}
      />
      <AppPageModal {...acntModal.modalProps} />
    </>
  );
};

export default DetailGrid;
