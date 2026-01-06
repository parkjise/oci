import { useRef, useCallback, lazy } from "react";
import type { IRowNode } from "ag-grid-community";
import { usePageModal } from "@hooks/usePageModal";
import type { GridRowData } from "./DetailGrid";

// 팝업 컴포넌트들을 lazy loading으로 변경 (성능 최적화)
const WrterInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.WrterInqirePopup,
  }))
);
const AccnutComCodeInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.AccnutComCodeInqirePopup,
  }))
);
const AdresInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.AdresInqirePopup,
  }))
);

import type { SelectedWriter } from "@/types/com/popup/WrterInqirePopup.types";
import type { AccnutComCodeInqirePopupListResponse as SelectedAccnutComCode } from "@/types/com/popup/AccnutComCodeInqirePopup.types";
import type { AdresInqirePopupListResponse as SelectedAdres } from "@/types/com/popup/AdresInqirePopup.types";
import { useAuthStore } from "@store/com/auth/authStore";

export const useGridCellEditor = () => {
  const { user } = useAuthStore();
  // ⚡ updateShipListItem 제거: 편집 중 Store 업데이트 하지 않음 (성능 최적화)

  // 검색 컨텍스트 (어떤 행, 어떤 컬럼에서 검색이 요청되었는지)
  const searchContextRef = useRef<{
    node: IRowNode<GridRowData>;
    columnId: string;
  } | null>(null);

  // --- 팝업 설정 ---

  // 1. 영업사원 (직원 조회) 팝업
  const writerPopup = usePageModal<
    { asOfficeId?: string; initialUserId?: string },
    SelectedWriter
  >(WrterInqirePopup, {
    title: "직원 조회",
    width: 800,
    onReturn: (value: SelectedWriter) => {
      if (!searchContextRef.current) return;
      const { node } = searchContextRef.current;
      node.setDataValue("salesMan", value.makeUser);
      node.setDataValue("salesName", value.makeUserName);
    },
  });

  // 2. 국가코드 (회계공통코드) 팝업
  const nationalCodePopup = usePageModal<
    { asOfficeId?: string; asCodeTy: string; initialCode?: string },
    SelectedAccnutComCode
  >(AccnutComCodeInqirePopup, {
    title: "국가코드 조회",
    width: 800,
    onReturn: (value: SelectedAccnutComCode) => {
      if (!searchContextRef.current) return;
      const { node } = searchContextRef.current;
      node.setDataValue("country", value.code);
      node.setDataValue("nationName", value.codeNme);
    },
  });

  // 3. 주소 조회 팝업
  const addressPopup = usePageModal<{ initialKeyword?: string }, SelectedAdres>(
    AdresInqirePopup,
    {
      title: "주소 조회",
      width: 800,
      onReturn: (value: SelectedAdres) => {
        if (!searchContextRef.current) return;
        const { node } = searchContextRef.current;
        node.setDataValue("shipAddr", value.roadAddr);
      },
    }
  );

  // --- 핸들러 ---

  // 검색 버튼 클릭 핸들러
  const handleOpenSearch = useCallback(
    (node: IRowNode<GridRowData>, columnId: string) => {
      searchContextRef.current = { node, columnId };
      const initialValue = node.data ? (node.data as any)[columnId] : "";

      if (columnId === "salesMan") {
        writerPopup.openModal({
          asOfficeId: user?.officeId,
          initialUserId: initialValue,
        });
      } else if (columnId === "country") {
        nationalCodePopup.openModal({
          asOfficeId: user?.officeId,
          asCodeTy: "NATION",
          initialCode: initialValue,
        });
      } else if (columnId === "shipAddr") {
        addressPopup.openModal({
          initialKeyword: initialValue,
        });
      }
    },
    [writerPopup, nationalCodePopup, addressPopup, user]
  );

  // ⚡ [최적화] 셀 편집 종료 핸들러 - Store 업데이트 제거
  // 콤보박스 선택 시 Store를 즉시 업데이트하면 DetailGrid가 리렌더링되어 느려짐
  // 데이터 동기화는 '저장(Save)' 버튼 누를 때 gridApi.forEachNode로 한 번에 처리
  const handleCellEditingStopped = useCallback(() => {
    // AG-Grid 내부 상태만 유지, Store 업데이트 하지 않음
    return;
  }, []);

  return {
    handleOpenSearch,
    handleCellEditingStopped,
    modalProps: {
      writerModalProps: writerPopup.modalProps,
      nationalCodeModalProps: nationalCodePopup.modalProps,
      addressModalProps: addressPopup.modalProps,
    },
  };
};
