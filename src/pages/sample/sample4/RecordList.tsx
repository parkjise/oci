import CardGridList from "@/components/ui/form/CardGridList";
import type { ExtendedColDef } from "@/components/ui/form/AgGrid/FormAgGrid";

interface RecordItem {
  id: string;
  company: string;
  date: string;
  status?: string;
  statusClass?: string;
  isActive?: boolean;
}

const recordItems: RecordItem[] = [
  { id: "7419137", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
  {
    id: "7419138",
    company: "에이비씨 머티리얼즈",
    date: "2025.10.20",
    status: "완료",
    statusClass: "done",
  },
  {
    id: "7419139",
    company: "에이비씨 머티리얼즈",
    date: "2025.10.20",
    status: "전자구매 승인완료",
    statusClass: "approved",
  },
  {
    id: "7419140",
    company: "에이비씨 머티리얼즈",
    date: "2025.10.20",
    status: "결재중",
    statusClass: "pending",
  },
  {
    id: "7419140",
    company: "에이비씨 머티리얼즈",
    date: "2025.10.20",
    status: "상신전",
    statusClass: "pending",
  },
  { id: "7419141", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
  { id: "7419142", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
  { id: "7419143", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
  { id: "7419144", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
  { id: "7419145", company: "에이비씨 머티리얼즈", date: "2025.10.20" },
];

const columnDefs: ExtendedColDef<RecordItem>[] = [
  { field: "id", headerName: "ID", flex: 1 },
  { field: "company", headerName: "회사", flex: 2 },
  { field: "date", headerName: "날짜", flex: 1 },
  { field: "status", headerName: "상태", flex: 1 },
];

const RecordList = ({
  className,
  onSelect,
}: {
  className?: string;
  onSelect?: (item: RecordItem | null) => void;
}) => (
  <CardGridList
    items={recordItems}
    columnDefs={columnDefs}
    totalCount={recordItems.length}
    className={className}
    onSelect={onSelect}
    cardFields={{
      headerLeft: ["id", "status"],
      headerRight: ["date"],
      body: ["company"],
    }}
  />
);

export default RecordList;
