/**
 * 전표 목록 리스트 (Slip Record List)
 * 
 * @description 검색 조건에 맞는 전표들을 카드 형태로 리스팅하고 선택 기능을 제공하는 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import { useMemo, useCallback } from "react";
import CardGridList from "@/components/ui/form/CardGridList";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import dayjs from "dayjs";

interface RecordItem {
  id: string; // slpHeaderId
  company: string; // custname
  date: string; // formatted bltDateAckSlp
  status?: string; // edimStatusName
  statusClass?: string;
  isActive?: boolean;
  description?: string;
  // New fields for Grid View
  exptnTgt?: string; // 전기
  glNumber?: string; // 전표번호
  slipTypeName?: string; // 이체모듈
  slipExptnSrcName?: string; // 이체원천
  sumTotAmt?: number; // 금액
  ackPerName?: string; // 승인자
  ackDate?: string; // 승인일
  crDbCnt?: number; // 라인수
  makeDept?: string; // 작성부서
  makeDeptName?: string; // 작성부서명
  sourceKeyName?: string; // 이체원천키명
  sourceKey?: string; // 이체원천키
  createdByName?: string; // 생성자
  creationDate?: string; // 생성일
  lastUpdatedByName?: string; // 최종수정자
  lastUpdateDate?: string; // 최종수정일
  programId?: string; // DATA 경로
  slpHeaderId?: string; // 전표ID
  reference2?: string; // 전기일자
  attribute8?: string; // Closed
  attribute10?: string; // Reserve
}

const columnDefs: ExtendedColDef<RecordItem>[] = [
  { field: "exptnTgt", headerName: "전기", width: 70, cellStyle: { textAlign: "center" } },
  { field: "status", headerName: "전자결재", width: 100 },
  { field: "glNumber", headerName: "전표번호", width: 120, cellClass: "blue-link" },
  { field: "description", headerName: "적요", width: 300, minWidth: 300, maxWidth: 300 },
  { field: "company", headerName: "대표거래처", width: 200 },
  { field: "slipTypeName", headerName: "이체모듈", width: 100 },
  { field: "slipExptnSrcName", headerName: "이체원천", width: 100 },
  {
    field: "sumTotAmt",
    headerName: "금액",
    width: 150,
    cellStyle: { textAlign: "right" },
    valueFormatter: (params) => {
      if (params.value === undefined || params.value === null) return "";
      return Number(params.value).toLocaleString();
    },
  },
  { field: "ackPerName", headerName: "승인자", width: 100 },
  { field: "ackDate", headerName: "승인일", width: 100, cellStyle: { textAlign: "center" } },
  { field: "crDbCnt", headerName: "라인수", width: 70, cellStyle: { textAlign: "center" } },
  { field: "makeDept", headerName: "작성부서", width: 100 },
  { field: "makeDeptName", headerName: "작성부서명", width: 130 },
  { field: "sourceKeyName", headerName: "이체원천키명", width: 140 },
  { field: "sourceKey", headerName: "이체원천키", width: 150 },
  { field: "createdByName", headerName: "생성자", width: 80 },
  {
    field: "creationDate",
    headerName: "생성일",
    width: 150,
    cellStyle: { textAlign: "center" },
    valueFormatter: (params) => (params.value ? dayjs(params.value).format("YYYY.MM.DD HH:mm:ss") : ""),
  },
  { field: "lastUpdatedByName", headerName: "최종수정자", width: 100 },
  {
    field: "lastUpdateDate",
    headerName: "최종수정일",
    width: 150,
    cellStyle: { textAlign: "center" },
    valueFormatter: (params) => (params.value ? dayjs(params.value).format("YYYY.MM.DD HH:mm:ss") : ""),
  },
  { field: "programId", headerName: "DATA 경로", width: 180 },
  { field: "slpHeaderId", headerName: "전표ID", width: 80 },
  { field: "reference2", headerName: "전기일자", width: 120, cellStyle: { textAlign: "center" } },
  { field: "attribute8", headerName: "Closed", width: 80, cellStyle: { textAlign: "center" } },
  { field: "attribute10", headerName: "Reserve", width: 200 },
];

const RecordList = ({
  className,
  onSelect,
}: {
  className?: string;
  onSelect?: (item: RecordItem | null) => void;
}) => {
  const { slipList, selectedSlipId, handleSelectSlip, isNewSlip } = useSlipRegist();

  // 데이터 변환: SlipRegistListResponse -> RecordItem
  const recordItems: RecordItem[] = useMemo(() => {
    return slipList.map((item) => {
      const formattedDate = item.bltDateAckSlp
        ? dayjs(item.bltDateAckSlp, "YYYYMMDD").format("YYYY.MM.DD")
        : "";

      return {
        id: item.slpHeaderId || "",
        company: item.custname || "",
        date: formattedDate,
        description: item.description || "",
        status: item.edimStatusName || undefined,
        statusClass: item.statusClass || undefined,
        isActive: selectedSlipId === item.slpHeaderId,
        // New fields
        exptnTgt: item.exptnTgt,
        glNumber: item.glNumber,
        slipTypeName: item.slipTypeName,
        slipExptnSrcName: item.slipExptnSrcName,
        sumTotAmt: item.sumTotAmt,
        ackPerName: item.ackPerName,
        ackDate: item.ackDate,
        crDbCnt: item.crDbCnt,
        makeDept: item.makeDept,
        makeDeptName: item.makeDeptName,
        sourceKeyName: item.sourceKeyName,
        sourceKey: item.sourceKey,
        createdByName: item.createdByName,
        creationDate: item.creationDate,
        lastUpdatedByName: item.lastUpdatedByName,
        lastUpdateDate: item.lastUpdateDate,
        programId: item.programId,
        slpHeaderId: item.slpHeaderId,
        reference2: item.reference2,
        attribute8: item.attribute8,
        attribute10: item.attribute10,
      };
    });
  }, [slipList, selectedSlipId]);

  // 항목 선택 핸들러 - store의 handleSelectSlip 호출하여 헤더/상세 조회
  const handleSelect = useCallback(
    (item: RecordItem | null) => {
      if (!item || !item.id) {
        // null이 전달되는 경우는 선택 해제이므로 아무것도 하지 않음
        if (onSelect) {
          onSelect(item);
        }
        return;
      }

      // 현재 선택된 항목과 같은 항목을 선택한 경우 (신규 모드가 아닐 때만 무시)
      // 신규 모드일 때는 같은 항목을 선택해도 조회를 다시 실행하여 신규 모드를 취소해야 함
      if (selectedSlipId === item.id && !isNewSlip) {
        // 외부 onSelect 콜백만 호출
        if (onSelect) {
          onSelect(item);
        }
        return;
      }

      // 다른 항목을 선택한 경우에만 store의 handleSelectSlip 호출하여 헤더/상세 조회
      handleSelectSlip(item.id);

      // 외부 onSelect 콜백이 있으면 호출
      if (onSelect) {
        onSelect(item);
      }
    },
    [handleSelectSlip, onSelect, selectedSlipId]
  );

  return (
    <CardGridList
      items={recordItems}
      columnDefs={columnDefs}
      totalCount={recordItems.length}
      className={className}
      onSelect={handleSelect}
      cardFields={{
        headerLeft: ["id", "status"],
        headerRight: ["date"],
        body: ["company"],
      }}
    />
  );
};

export default RecordList;
