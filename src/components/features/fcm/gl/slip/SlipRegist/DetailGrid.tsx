/**
 * 전표 상세 그리드 (Slip Detail Grid)
 * 
 * @description 전표의 분개 항목(계정, 금액, 거래처 등)을 Ag-Grid를 통해 편집하고 관리하는 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useCallback, useRef } from "react";
import { Tag } from "antd";
import type { GridApi, ICellRendererParams, CellValueChangedEvent, IRowNode } from "ag-grid-community";
import FormAgGrid, {
  type ExtendedColDef,
} from "@/components/ui/form/AgGrid/FormAgGrid";
import { SearchIconCellRenderer } from "@/components/ui/form/AgGrid/cells";
import { createComboBoxColumn } from "@/components/ui/form/AgGrid/columns/comboBoxColumn";

import { useAuthStore } from "@/store/com/auth/authStore";
import { useSlipRegist, useSlipRegistStore } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import type { SlipRegistDetailResponse } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import { showSuccess, error } from "@components/ui/feedback/Message";
import {
  AcntInqirePopup,
  DeptInqirePopup,
  BcncInqirePopup,
  PrjctInqirePopup,
  ProcsCodePopup,
  PrdlstSeInqirePopup,
  PrdlstCodeInqirePopup,
  ManageItemInputPopup,
} from "@/pages/com/popup";
import { selectManageItemNm } from "@/apis/fcm/gl/slip/SlipRegist/SlipRegist";
import type { SelectedAccount } from "@/pages/com/popup/AcntInqirePopup";
import type { ManageItemData, ManageItemInputPopupProps } from "@/types/com/popup/ManageItemInputPopup.types";
import type { SelectedDept } from "@/pages/com/popup/DeptInqirePopup";
import type { SelectedBcnc } from "@/pages/com/popup/BcncInqirePopup";
import type { SelectedProject } from "@/pages/com/popup/PrjctInqirePopup";
import type { SelectedProcsCode } from "@/pages/com/popup/ProcsCodePopup";
import type { SelectedPrdlstSe } from "@/pages/com/popup/PrdlstSeInqirePopup";
import type { SelectedPrdlstCode } from "@/pages/com/popup/PrdlstCodeInqirePopup";


// 계정 팝업 Props 타입
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


// 부서 팝업 Props 타입
type DeptInqirePopupProps = {
  asOfficeId?: string;
  initialDeptCode?: string;
  asStndDate?: string;
};

// 거래처 팝업 Props 타입
type BcncInqirePopupProps = {
  asOfficeId?: string;
  initialCustno?: string;
  asUseYno?: string;
  asCustType?: string;
};

// 프로젝트 팝업 Props 타입
type PrjctInqirePopupProps = {
  asOfficeId?: string;
  initialProjectCode?: string;
};

// 공정코드 팝업 Props 타입
interface ProcsCodePopupProps {
  asOfficeId?: string;
  asOrgId?: string;
  initialCostCode?: string;
  [key: string]: any;
}

// 품목군 팝업 Props 타입
type PrdlstSeInqirePopupProps = {
  asOfficeId?: string;
  asOrgId?: string;
  itemGroup?: string;
};

// 품목코드 팝업 Props 타입
type PrdlstCodeInqirePopupProps = {
  asOfficeId?: string;
  asOrgId?: string;
  asMatclass?: string;
  initialFind?: string;
};

// 컬럼 정의
const columnDefs: ExtendedColDef<SlipRegistDetailResponse>[] = [
  {
    field: "rowStatus",
    headerName: "상태",
    width: 80,
    pinned: "left",
    sortable: false,
    filter: false,
    resizable: false,
    editable: false,
    excludeFromExcel: true, // 엑셀 다운로드에서 제외
    cellRenderer: (params: { value: "C" | "U" | "D" | undefined }) => {
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
      if (params.value === "D") {
        return { backgroundColor: "#fff1f0" };
      }
      return null;
    },
  },
  {
    field: "seqAckSlp",
    headerName: "번호",
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    sortable: false,
    filter: false,
    resizable: false,
    editable: false,
  },
  {
    field: "accCode",
    headerName: "계정",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header"
  },
  {
    field: "accName",
    headerName: "계정명",
    width: 170,
    minWidth: 170,
    maxWidth: 170,
    sortable: true,
    filter: true,
    editable: true,
  },
  createComboBoxColumn("curr", "화폐", {
    comCodeParams: {
      module: "GL",
      type: "FRNCUR",
      enabledFlag: "Y",
    },
    valueKey: "code",
    labelKey: "code",
    editable: true,
  }, 100),
  {
    field: "exchgRateType",
    headerName: "환율타입",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
    valueGetter: (params) => {
      // exchgRateType 또는 exRateType 필드에서 값 가져오기
      return params.data?.exchgRateType || (params.data as any)?.exRateType || "";
    },
    valueSetter: (params) => {
      // 값 설정 시 exchgRateType에 저장
      if (params.data) {
        params.data.exchgRateType = params.newValue || "";
        // exRateType도 함께 업데이트 (백엔드 호환성)
        (params.data as any).exRateType = params.newValue || "";
      }
      return true;
    },
  },
  {
    field: "exchgRate",
    headerName: "환율",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    valueFormatter: (params) => params.value ? Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
    bodyAlign: "right",
  },
  {
    field: "drRelAmt",
    headerName: "차변금액",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Math.round(Number(params.value)).toLocaleString() : "0",
    sortable: true,
    filter: true,
    editable: true,
    bodyAlign: "right",
    headerClass: "required-header",
    valueSetter: (params) => {
      if (params.data) {
        // 콤마 제거 및 공백 제거
        const newVal = String(params.newValue || "0").replace(/,/g, "").trim();
        params.data.drRelAmt = newVal; // 차변금액 설정

        // 환율 가져오기 (기본값 1)
        const rate = parseFloat(params.data.exchgRate || "1");
        // 환산금액 계산 (입력금액 / 환율)
        // 원화(KRW)이거나 환율이 1인 경우 정확히 동일하게 처리
        const calculatedVal = rate === 1 ? parseFloat(newVal) : parseFloat(newVal) / rate;
        params.data.drAmt = calculatedVal.toString(); // 차변환산금액 설정
      }
      return true;
    },
  },
  {
    field: "crRelAmt",
    headerName: "대변금액",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Math.round(Number(params.value)).toLocaleString() : "0",
    sortable: true,
    filter: true,
    editable: true,
    bodyAlign: "right",
    headerClass: "required-header",
    valueSetter: (params) => {
      if (params.data) {
        // 콤마 제거 및 공백 제거
        const newVal = String(params.newValue || "0").replace(/,/g, "").trim();
        params.data.crRelAmt = newVal; // 대변금액 설정

        // 환율 가져오기 (기본값 1)
        const rate = parseFloat(params.data.exchgRate || "1");
        // 환산금액 계산 (입력금액 / 환율)
        // 원화(KRW)이거나 환율이 1인 경우 정확히 동일하게 처리
        const calculatedVal = rate === 1 ? parseFloat(newVal) : parseFloat(newVal) / rate;
        params.data.crAmt = calculatedVal.toString(); // 대변환산금액 설정
      }
      return true;
    },
  },
  {
    field: "drAmt",
    headerName: "차변금액(환산)",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString() : "0",
    sortable: true,
    filter: true,
    bodyAlign: "right",
  },
  {
    field: "crAmt",
    headerName: "대변금액(환산)",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    valueFormatter: (params) =>
      params.value ? Number(params.value).toLocaleString() : "0",
    sortable: true,
    filter: true,
    bodyAlign: "right",
  },
  {
    field: "rem",
    headerName: "적요",
    width: 400,
    minWidth: 400,
    maxWidth: 400,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "pssnDept",
    headerName: "부서",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "deptName",
    headerName: "부서명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "accMgmtNbr3",
    headerName: "거래처",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    headerClass: "required-header",
  },
  {
    field: "custname",
    headerName: "거래처명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "accMgmtNbr1Nme",
    headerName: "관리(1)명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "accMgmtNbr2Nme",
    headerName: "관리(2)명",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "dvs",
    headerName: "시산사업장",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
  },
  {
    field: "orgId",
    headerName: "사업장",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
  },
  {
    field: "costCode",
    headerName: "공정코드",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "costCodeName",
    headerName: "공정명",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    sortable: true,
    filter: true,
  },
  {
    field: "finGdsGrpCode",
    headerName: "품목군",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "grpName",
    headerName: "품목군명",
    width: 180,
    minWidth: 180,
    maxWidth: 180,
    sortable: true,
    filter: true,
  },
  {
    field: "itemCode",
    headerName: "품목코드",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "itemName",
    headerName: "품목명",
    width: 180,
    minWidth: 180,
    maxWidth: 180,
    sortable: true,
    filter: true,
  },
  {
    field: "projectCode",
    headerName: "프로젝트",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
  },
  {
    field: "projectName",
    headerName: "프로젝트명",
    width: 250,
    minWidth: 250,
    maxWidth: 250,
    sortable: true,
    filter: true,
  },
  {
    field: "srcTblNme",
    headerName: "서브모듈원천",
    width: 150,
    minWidth: 150,
    maxWidth: 150,
    sortable: true,
    filter: true,
  },
  {
    field: "subModuleKey",
    headerName: "서브모튤KEY",
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    sortable: true,
    filter: true,
  },
  {
    field: "taxType",
    headerName: "AP부가세",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "vatWthTaxType",
    headerName: "상세",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "sendYn",
    headerName: "지급대상",
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel1",
    headerName: "Channel1",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel2",
    headerName: "Channel2",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "channel3",
    headerName: "Channel3",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "trReDept",
    headerName: "품목구분",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment1",
    headerName: "품목대분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment2",
    headerName: "품목중분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "itemSegment3",
    headerName: "품목소분류",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "fixAssRgstYn",
    headerName: "고정자산",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
  {
    field: "fixYn",
    headerName: "Reg Fix",
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    sortable: true,
    filter: true,
    editable: true,
    hide: true,
  },
];

// 그리드 행 데이터 타입
type GridRowData = SlipRegistDetailResponse & {
  id?: string | number;
  rowStatus?: "C" | "U" | "D";
};



const DetailGrid: React.FC<{ className?: string }> = ({ className }) => {
  const { slipDetails, setSlipDetails, slipHeader, editingSlipId, isNewSlip } = useSlipRegist();
  const gridRef = useRef<GridApi | null>(null);

  // 편집 모드 여부 (신규 생성 중이거나 특정 전표를 편집 중인 경우)
  const isEditMode = !!editingSlipId || isNewSlip;

  // 관리항목 입력 팝업 모달 관리
  const manageItemModal = usePageModal<ManageItemInputPopupProps, ManageItemData>(
    ManageItemInputPopup,
    {
      title: "관리항목 입력",
      centered: true,
      width: 700,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        console.log('[DEBUG] DetailGrid Received data:', returnValue);

        let node: IRowNode<GridRowData> | null | undefined = null;

        // 1. ID로 노드 찾기 (가장 정확함)
        if (returnValue.seqAckSlp && gridRef.current) {
          const idNode = gridRef.current.getRowNode(String(returnValue.seqAckSlp));
          if (idNode) {
            node = idNode;
            console.log('[DEBUG] Found node by ID:', returnValue.seqAckSlp, node);
          }
        }

        // 2. activeNodeRef 시도 (ID로 못 찾은 경우)
        if (!node) {
          node = activeNodeRef.current;
          console.log('[DEBUG] Checking activeNodeRef:', node);
        }

        // 3. Fallback: 선택된 노드 확인
        if ((!node || !node.data) && gridRef.current) {
          console.warn('[DEBUG] activeNodeRef/ID invalid. Trying getSelectedNodes...');
          const selected = gridRef.current.getSelectedNodes();
          if (selected.length > 0) {
            node = selected[0];
            console.log('[DEBUG] Found node via getSelectedNodes:', node);
          }
        }

        if (node && node.data && gridRef.current) {
          const oldData = { ...node.data };
          const updatedData = {
            ...oldData,
            ...returnValue,
            accMgmtNbr1Nme: returnValue.accMgmtNbr1Nme || oldData.accMgmtNbr1Nme,
            accMgmtNbr2Nme: returnValue.accMgmtNbr2Nme || oldData.accMgmtNbr2Nme,
          };

          // 신규가 아닌 경우 상태를 "U"로 변경
          if (updatedData.rowStatus !== "C") {
            updatedData.rowStatus = "U";
          }

          console.log('[DEBUG] DetailGrid Final Updated Data:', updatedData);

          // 1. 그리드 데이터 업데이트 (트랜잭션 사용)
          console.log('[DEBUG] DetailGrid attempting transaction update with:', updatedData);
          const res = gridRef.current.applyTransaction({ update: [updatedData] });
          console.log('[DEBUG] Transaction result:', res);

          // 2. Zustand 스토어 업데이트
          const store = useSlipRegistStore.getState();
          const nextDetails = store.slipDetails.map((item: any) =>
            String(item.seqAckSlp) === String(updatedData.seqAckSlp) ? { ...updatedData } : item
          );
          store.setSlipDetails(nextDetails);

          // 3. 셀 리프레시 (트랜잭션 결과의 노드 사용)
          if (res && res.update && res.update.length > 0) {
            const updatedNode = res.update[0];
            console.log('[DEBUG] Transaction success. Refreshing node:', updatedNode.data);
            gridRef.current.refreshCells({
              rowNodes: [updatedNode],
              columns: ['rowStatus', 'accMgmtNbr1Nme', 'accMgmtNbr2Nme', 'accCode', 'accName', 'curr', 'exchgRate', 'drRelAmt', 'crRelAmt'],
              force: true
            });
          } else {
            console.warn('[DEBUG] Transaction failed or no rows updated via transaction. Fallback to existing node.');
            // fallback: 트랜잭션이 실패했거나 노드를 못 찾은 경우 기존 노드 리프레시
            // 데이터 강제 업데이트
            node.setData(updatedData as GridRowData);
            gridRef.current.refreshCells({
              rowNodes: [node],
              columns: ['rowStatus', 'accMgmtNbr1Nme', 'accMgmtNbr2Nme'],
              force: true
            });
          }

          console.log('[DEBUG] DetailGrid update complete. RowStatus:', updatedData.rowStatus);
        } else {
          console.error('[DEBUG] DetailGrid: activeNodeRef is null or missing data!');
        }
      },
    }
  );

  // 현재 활성화된(검색 클릭된) 노드를 추적하기 위한 Ref
  const activeNodeRef = useRef<IRowNode<GridRowData> | null>(null);

  // 공통 onReturn 핸들러 생성 (리프레시 로직 중복 제거)
  const createOnReturnHandler = (
    updateData: (responseData: any, rowData: GridRowData) => void,
    refreshColumns: string[]
  ) => {
    return (returnValue: any) => {
      const node = activeNodeRef.current;
      if (!node || !node.data) return;

      const rowData = node.data as GridRowData;

      // 데이터 업데이트
      updateData(returnValue, rowData);

      // 상태 업데이트 (신규가 아니면 수정으로 변경)
      if (rowData.rowStatus !== "C") {
        rowData.rowStatus = "U";
      }

      // 그리드 갱신
      if (gridRef.current) {
        // Zustand 스토어 업데이트 (불변성 유지)
        const store = useSlipRegistStore.getState();
        const nextDetails = store.slipDetails.map((item) =>
          String(item.seqAckSlp) === String(rowData.seqAckSlp) ? { ...rowData } : item
        );
        store.setSlipDetails(nextDetails);

        // 셀 리프레시
        gridRef.current.refreshCells({
          rowNodes: [node],
          columns: [...refreshColumns, "rowStatus"],
          force: true,
        });
      }
    };
  };

  // 1. 계정 조회 모달
  const acntModal = usePageModal<AcntInqirePopupProps, SelectedAccount>(
    AcntInqirePopup,
    {
      title: "계정조회",
      centered: true,
      width: 700,
      destroyOnHidden: true,
      onReturn: async (returnValue) => {
        const node = activeNodeRef.current;
        if (!node || !node.data) return;

        const rowData = node.data as GridRowData;

        // 계정 정보 업데이트
        rowData.accCode = returnValue.accCode;
        rowData.accName = returnValue.accName;
        rowData.accMgmtNbr1Opt = returnValue.accMgmtNbr1Opt;
        rowData.accMgmtNbr1Type = returnValue.accMgmtNbr1Type;
        rowData.accMgmtNbr2Opt = returnValue.accMgmtNbr2Opt;
        rowData.accMgmtNbr2Type = returnValue.accMgmtNbr2Type;
        rowData.cstCdeOpt = returnValue.cstCdeOpt;
        rowData.occurDateOpt = returnValue.occurDateOpt;
        rowData.maturDateOpt = returnValue.maturDateOpt;
        rowData.refOpt = returnValue.refOpt;
        rowData.exchgRateOpt = returnValue.exchgRateOpt;
        rowData.entItemYn = returnValue.entItemYn;

        // 관리항목 초기화
        rowData.accMgmtNbr1Nme = "";
        rowData.accMgmtNbr2Nme = "";
        rowData.accMgmtNbr1 = "";
        rowData.accMgmtNbr2 = "";
        rowData.occurDate = "";
        rowData.maturDate = "";
        rowData.accRelAmt = "";
        rowData.intRate = "";

        // 관리항목 명칭 동적 조회 (API 호출)
        try {
          const rawType1 = returnValue.accMgmtNbr1Type ? String(returnValue.accMgmtNbr1Type).padStart(2, '0') : "";
          const rawType2 = returnValue.accMgmtNbr2Type ? String(returnValue.accMgmtNbr2Type).padStart(2, '0') : "";
          const type1 = rawType1 ? `CUST${rawType1}` : "";
          const type2 = rawType2 ? `MNG${rawType2}` : "";

          if (rawType1 || rawType2) {
            const response = await selectManageItemNm({
              asRpsnOffice: slipHeader?.bltOfficeId || "OSE",
              accMgmtNbr1Type: type1,
              accMgmtNbr2Type: type2
            });

            if (response.data) {
              (rowData as any).accMgmtName1 = response.data.accMgmtName1;
              (rowData as any).accMgmtName2 = response.data.accMgmtName2;
              console.log('[DEBUG] DetailGrid Fetched Mgmt Labels:', response.data);
            }
          }
        } catch (error) {
          console.error('[DEBUG] Failed to fetch management item labels:', error);
          // 실패 시 기존 로직(getMgmtLabel) Fallback
          (rowData as any).accMgmtName1 = returnValue.mgmtNbr1TypeNme || "";
          (rowData as any).accMgmtName2 = returnValue.mgmtNbr2TypeNme || "";
        }

        // 상태 업데이트
        if (rowData.rowStatus !== "C") {
          rowData.rowStatus = "U";
        }

        // 그리드 및 스토어 갱신
        if (gridRef.current) {
          const store = useSlipRegistStore.getState();
          const nextDetails = store.slipDetails.map((item) =>
            String(item.seqAckSlp) === String(rowData.seqAckSlp) ? { ...rowData } : item
          );
          store.setSlipDetails(nextDetails);

          gridRef.current.refreshCells({
            rowNodes: [node],
            columns: ["accCode", "accName", "accMgmtNbr1Nme", "accMgmtNbr2Nme", "rowStatus"],
            force: true,
          });
        }
      }
    }
  );

  // 2. 화폐 조회 모달 (콤보박스로 변경되어 제거 가능하지만 일단 주석 처리하거나 제거)

  // 3. 부서 조회 모달
  const deptModal = usePageModal<DeptInqirePopupProps, SelectedDept>(
    DeptInqirePopup,
    {
      title: "부서조회",
      width: 700,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.pssnDept = returnValue.deptCode;
        rowData.deptName = returnValue.deptName;
      }, ["pssnDept", "deptName"])
    }
  );

  // 4. 거래처 조회 모달 (관리항목 3 - accMgmtNbr3)
  const bcncModal = usePageModal<BcncInqirePopupProps, SelectedBcnc>(
    BcncInqirePopup,
    {
      title: "거래처조회",
      centered: true,
      width: 800,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.accMgmtNbr3 = returnValue.custno;
        // 거래처명 필드 업데이트
        rowData.custname = returnValue.custname;
      }, ["accMgmtNbr3", "custname"])
    }
  );

  // 5. 프로젝트 조회 모달
  const projectModal = usePageModal<PrjctInqirePopupProps, SelectedProject>(
    PrjctInqirePopup,
    {
      title: "프로젝트조회",
      centered: true,
      width: 700,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.projectCode = returnValue.projectCode;
        rowData.projectName = returnValue.projectName;
      }, ["projectCode", "projectName"])
    }
  );

  // 6. 공정코드 조회 모달 (costCode)
  const procsCodeModal = usePageModal<ProcsCodePopupProps, SelectedProcsCode>(
    ProcsCodePopup,
    {
      title: "공정코드 조회",
      centered: true,
      width: 700,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.costCode = returnValue.costCode;
        (rowData as any).costName = returnValue.costName;
      }, ["costCode", "costName"])
    }
  );

  // 7. 품목군 조회 모달 (finGdsGrpCode)
  const prdlstSeModal = usePageModal<PrdlstSeInqirePopupProps, SelectedPrdlstSe>(
    PrdlstSeInqirePopup,
    {
      title: "품목군 조회",
      centered: true,
      width: 900,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.finGdsGrpCode = returnValue.itemGroup;
        rowData.grpName = returnValue.itemGroupName;
      }, ["finGdsGrpCode", "grpName"])
    }
  );

  // 8. 품목코드 조회 모달 (itemCode)
  const prdlstCodeModal = usePageModal<PrdlstCodeInqirePopupProps, SelectedPrdlstCode>(
    PrdlstCodeInqirePopup,
    {
      title: "품목코드 조회",
      centered: true,
      width: 900,
      destroyOnHidden: true,
      onReturn: createOnReturnHandler((returnValue, rowData) => {
        rowData.itemCode = returnValue.itemCode;
        rowData.itemName = returnValue.itemName;
      }, ["itemCode", "itemName"])
    }
  );

  // 공통 검색 클릭 핸들러
  const handleSearchClick = useCallback((node: IRowNode<GridRowData>, field: string) => {
    if (!node || !node.data) return;

    console.log('[DEBUG] handleSearchClick called for field:', field);

    // 노드 선택 및 Ref 설정
    node.setSelected(true);
    activeNodeRef.current = node;

    const rowData = node.data;
    const officeId = slipHeader?.bltOfficeId || "OSE";
    const orgId = slipHeader?.orgId || "";

    switch (field) {
      case "accCode":
        acntModal.openModal({
          asOfficeId: officeId,
          initialAccCode: rowData.accCode || undefined,
          initialSearch: {
            asAccActYn: "Y",
            asCstPayYn: "N",
            asAccLvl: "05",
          }
        });
        break;
      case "pssnDept":
        deptModal.openModal({
          asOfficeId: officeId,
          initialDeptCode: rowData.pssnDept || undefined
        });
        break;
      case "accMgmtNbr3":
        bcncModal.openModal({
          asOfficeId: officeId,
          initialCustno: rowData.accMgmtNbr3 || undefined,
        });
        break;
      case "projectCode":
        projectModal.openModal({
          asOfficeId: officeId,
          initialProjectCode: rowData.projectCode || undefined,
        });
        break;
      case "costCode":
        procsCodeModal.openModal({
          asOfficeId: officeId,
          asOrgId: orgId,
          initialCostCode: rowData.costCode || undefined,
        });
        break;
      case "finGdsGrpCode":
        prdlstSeModal.openModal({
          asOfficeId: officeId,
          asOrgId: orgId,
          itemGroup: rowData.finGdsGrpCode || undefined,
        });
        break;
      case "itemCode":
        prdlstCodeModal.openModal({
          asOfficeId: officeId,
          asOrgId: orgId,
          asMatclass: rowData.finGdsGrpCode || undefined,
          initialFind: rowData.itemCode || undefined,
        });
        break;
      case "accMgmtNbr1Nme":
      case "accMgmtNbr2Nme":
        // 계정코드가 없는 경우 경고 메시지 표시
        if (!rowData.accCode) {
          error({ content: "계정코드를 입력 하세요." });
          return;
        }
        manageItemModal.openModal({
          asOfficeId: officeId,
          initialData: rowData as ManageItemData,
          onConfirm: manageItemModal.setConfirmHandler,
        });
        break;
    }
  }, [slipHeader, acntModal, deptModal, bcncModal, projectModal, procsCodeModal, prdlstSeModal, prdlstCodeModal]);
  const createNewRow = useCallback(
    (newId: number | string): SlipRegistDetailResponse => ({
      // 기본값 설정
      seqAckSlp:
        typeof newId === "number" ? newId.toString() : newId || undefined,
      curr: "KRW",
      exchgRateType: "User",
      exchgRate: "1.00",
      rem: slipHeader?.description || "",
      pssnDept: useAuthStore.getState().user?.deptCode || "",
      deptName: useAuthStore.getState().user?.deptName || "",
      rowStatus: "C",
    }),
    [slipHeader]
  );

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    // 유효성 체크: 대표적요(slipHeader.description) 필드 확인
    if (!slipHeader?.description || slipHeader.description.trim() === "") {
      error({ content: "적요는 필수 입력 항목 입니다." });
      return;
    }

    // 새 ID 생성 (최대 순번 + 1)
    const newId =
      slipDetails.length === 0
        ? 1
        : Math.max(...slipDetails.map((d) => parseInt(d.seqAckSlp || "0"))) + 1;

    const newRow = createNewRow(newId);

    // 행 추가 (맨 아래에 추가)
    setSlipDetails([...slipDetails, newRow]);

    // 그리드 마지막 행으로 포커스
    setTimeout(() => {
      if (gridRef.current) {
        const rowCount = gridRef.current.getDisplayedRowCount();
        if (rowCount > 0) {
          const lastIndex = rowCount - 1;
          // 페이지 이동 (마지막 페이지로)
          const pageSize = gridRef.current.paginationGetPageSize();
          const lastPage = Math.floor(lastIndex / pageSize);
          gridRef.current.paginationGoToPage(lastPage);

          const lastNode = gridRef.current.getDisplayedRowAtIndex(lastIndex);
          if (lastNode) {
            lastNode.setSelected(true);
            gridRef.current.ensureNodeVisible(lastNode, "bottom");
          }
        }
      }
    }, 100);
  }, [slipHeader, slipDetails, setSlipDetails, createNewRow]);

  // accCode, curr, pssnDept, accMgmtNbr3, projectCode, costCode, finGdsGrpCode, itemCode 컬럼에 cellRenderer 추가 (동적으로 생성)
  const columnDefsWithRenderer = React.useMemo(() => {
    return columnDefs.map((col) => {
      // 원래 편집 가능한 컬럼이었을 경우, 이젠 편집 모드일 때만 편집 가능하도록 설정
      let currentCol = {
        ...col,
        editable: col.editable === true ? isEditMode : col.editable,
      };

      // SearchIconCellRenderer 적용 대상 컬럼
      if (["accCode", "pssnDept", "accMgmtNbr3", "projectCode", "costCode", "finGdsGrpCode", "itemCode", "accMgmtNbr1Nme", "accMgmtNbr2Nme"].includes(currentCol.field || "")) {
        currentCol = {
          ...currentCol,
          cellRenderer: SearchIconCellRenderer,
          cellRendererParams: (_params: ICellRendererParams<GridRowData>) => ({
            onSearchClick: handleSearchClick,
            showIcon: isEditMode
          })
        };
      }


      return currentCol;
    });
  }, [slipHeader, isEditMode, manageItemModal, handleSearchClick]);

  return (
    <>
      <FormAgGrid<SlipRegistDetailResponse & { id?: string | number }>
        rowData={slipDetails}
        columnDefs={columnDefsWithRenderer}
        enableFilter={true}
        showToolbar={true}
        onAddRow={handleAddRow}
        setRowData={setSlipDetails}
        toolbarButtons={{
          showAdd: true,
          showCopy: true,
          showDelete: true,
          enableAdd: isEditMode,
          enableCopy: isEditMode,
          enableDelete: isEditMode,
          showExcelDownload: true,
          showExcelUpload: false,
          showRefresh: true,
          showSave: false,
        }}
        gridOptions={{
          onGridReady: (params) => {
            console.log('[DEBUG] DetailGrid onGridReady');
            gridRef.current = params.api;
          },
          pagination: false,
          rowSelection: "single",
          getRowId: (params) => String(params.data.seqAckSlp),
          onCellValueChanged: (params: CellValueChangedEvent) => {
            if (params.data) {
              const updatedData = params.data as SlipRegistDetailResponse;

              // 1. 삭제된 행 편집 방지
              if (updatedData.rowStatus === "D") {
                error({ content: "삭제된 행은 편집할 수 없습니다." });
                params.api.refreshCells({ rowNodes: [params.node] });
                return;
              }

              // 값이 변경되지 않았으면 무시
              if (params.oldValue === params.newValue) return;

              // 2. 상태 업데이트 (신규(C)가 아니면 수정(U)으로 변경)
              const nextStatus = updatedData.rowStatus === "C" ? "C" : "U";
              const finalData = { ...updatedData, rowStatus: nextStatus };

              // 3. 그리드 데이터 갱신
              params.node.setData(finalData);

              // 4. 스토어 업데이트
              const store = useSlipRegistStore.getState();
              const nextDetails = store.slipDetails.map((item) =>
                String(item.seqAckSlp) === String(finalData.seqAckSlp) ? finalData : item
              );
              store.setSlipDetails(nextDetails);

              // 5. 상태 컬럼 리프레시
              params.api.refreshCells({
                rowNodes: [params.node],
                columns: ["rowStatus"],
                force: true,
              });

              // 6. 변경 알림
              if (params.colDef.headerName) {
                showSuccess(`${params.colDef.headerName}이(가) "${params.newValue}"(으)로 변경되었습니다.`);
              }
            }
          },
        }}
        className={className}
        headerTextAlign="center"
        idField="seqAckSlp"
      />
      <AppPageModal {...manageItemModal.modalProps} />
      <AppPageModal {...acntModal.modalProps} />
      <AppPageModal {...deptModal.modalProps} />
      <AppPageModal {...bcncModal.modalProps} />
      <AppPageModal {...projectModal.modalProps} />
      <AppPageModal {...procsCodeModal.modalProps} />
      <AppPageModal {...prdlstSeModal.modalProps} />
      <AppPageModal {...prdlstCodeModal.modalProps} />
    </>
  );
};

export default DetailGrid;
