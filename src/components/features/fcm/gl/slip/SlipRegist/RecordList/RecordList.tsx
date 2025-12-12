import { useMemo } from "react";
import CardGridList from "@/components/ui/form/CardGridList";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import dayjs from "dayjs";

interface RecordItem {
  id: string;
  company: string;
  date: string;
  status?: string;
  statusClass?: string;
  isActive?: boolean;
}

const RecordList = ({
  className,
}: {
  className?: string;
}) => {
  const { slipList, selectedSlipId, isNewSlip, handleSelectSlipWithEditMode } = useSlipRegist();

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
        status: item.edimStatusName || undefined,
        statusClass: item.statusClass || undefined,
        isActive: selectedSlipId === item.slpHeaderId,
      };
    });
  }, [slipList, selectedSlipId]);

  const handleSelect = (item: RecordItem | null) => {
    // null이 전달되는 경우는 신규 모드로 전환하는 등 외부에서 선택 해제하는 경우이므로
    // 아무것도 하지 않음 (기존 선택 해제 유지)
    if (!item) {
      return;
    }
    
    if (item.id && handleSelectSlipWithEditMode) {
      handleSelectSlipWithEditMode(item.id);
    }
  };

  // 신규 모드로 전환될 때 CardGridList를 재마운트하여 선택 상태 초기화
  const gridKey = useMemo(() => {
    if (isNewSlip && selectedSlipId === null) {
      return `new-${isNewSlip}`;
    }
    return selectedSlipId || 'default';
  }, [isNewSlip, selectedSlipId]);

  return (
    <CardGridList<RecordItem>
      key={gridKey}
      items={recordItems}
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
