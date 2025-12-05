// 외화평가 RecordList 데이터 타입
export interface FgcryEvlListResponse {
  id?: string | number;
  dvs?: string; // 구분 (AP, AR, GL)
  slipNo?: string; // 전표번호
  reverseSlipNo?: string; // Reverse 전표
  posted?: string; // 전기여부 (Y/N)
  revSlipNoPosted?: string; // Rev Slip No Posted (Y/N)
  frExEvalId?: string; // Fr Ex Eval Id (삭제 시 필요)
  [key: string]: unknown;
}

// DetailView에서 사용하는 SlipMaster 타입
export interface SlipMaster {
  id?: string;
  status?: string;
  statusColor?: string;
  date?: string;
  company?: string;
  makeDept?: string;
  deptName?: string;
  userId?: string;
  makerName?: string;
  slipName?: string;
  slipExptnName?: string;
  dvs?: string;
  srcTblName?: string;
  sourceKey?: string;
  glSlipNo?: string;
  exptnTgt?: string;
  edimStatusName?: string;
  creationDate?: string;
  reverseNo?: string;
  description?: string;
  closed?: string;
  lastUpdateDate?: string;
  details?: unknown[];
  [key: string]: unknown;
}

// 외화평가 DetailGrid 데이터 타입
export interface FgcryEvlDetailResponse {
  id?: number;
  status?: string; // 상태
  invNo?: string; // Invoice No.
  currency?: string; // 통화
  account?: string; // 계정
  accountName?: string; // 계정명
  customer?: string; // 거래처
  customerName?: string; // 거래처명
  manageNo2?: string; // 관리번호2
  exchangeRate?: number; // 환율
  foreignAmount?: number; // 외화금액
  localAmount?: number; // 원화금액
  evaluationRate?: number; // 평가환율
  evaluationAmount?: number; // 환산금액
  evaluationProfit?: number; // 환산 평가 손익
  businessUnit?: string; // 사업부
  slipHeaderId?: string; // Slp Header Id
  slipNo?: string; // 전표번호
  [key: string]: unknown;
}

// Mock 데이터: RecordList (왼쪽 테이블)
export const mockFgcryEvlList: FgcryEvlListResponse[] = [
  {
    id: "MSD-20251205-1",
    dvs: "AP",
    slipNo: "MSD-20251205-1",
    reverseSlipNo: "",
    posted: "N",
  },
];

// Mock 데이터: DetailGrid (오른쪽 테이블) - 전표번호별 상세 데이터
export const mockFgcryEvlDetail: Record<string, FgcryEvlDetailResponse[]> = {
  "MSD-20251205-1": [
    {
      id: 1,
      status: "",
      invNo: "109-20250829-21",
      currency: "USD",
      account: "2120202",
      accountName: "미지급금(외화)",
      customer: "100369",
      customerName: "Argus media",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 1000,
      localAmount: 1350500,
      evaluationRate: 1350.5,
      evaluationAmount: 1350500,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 2,
      status: "",
      invNo: "109-20250901-61",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099633",
      customerName: "시엔에스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2000,
      localAmount: 2701000,
      evaluationRate: 1350.5,
      evaluationAmount: 2701000,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 3,
      status: "",
      invNo: "109-20250905-12",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099575",
      customerName: "프린웍스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 1500,
      localAmount: 2025750,
      evaluationRate: 1350.5,
      evaluationAmount: 2025750,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 4,
      status: "",
      invNo: "109-20250910-33",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099560",
      customerName: "파이니어(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 3000,
      localAmount: 4051500,
      evaluationRate: 1350.5,
      evaluationAmount: 4051500,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 5,
      status: "",
      invNo: "109-20250915-45",
      currency: "USD",
      account: "2120202",
      accountName: "미지급금(외화)",
      customer: "100369",
      customerName: "Argus media",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2500,
      localAmount: 3376250,
      evaluationRate: 1350.5,
      evaluationAmount: 3376250,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 6,
      status: "",
      invNo: "109-20250920-78",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099633",
      customerName: "시엔에스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 1800,
      localAmount: 2430900,
      evaluationRate: 1350.5,
      evaluationAmount: 2430900,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 7,
      status: "",
      invNo: "109-20250925-56",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099575",
      customerName: "프린웍스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2200,
      localAmount: 2971100,
      evaluationRate: 1350.5,
      evaluationAmount: 2971100,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 8,
      status: "",
      invNo: "109-20250930-89",
      currency: "USD",
      account: "2120202",
      accountName: "미지급금(외화)",
      customer: "099560",
      customerName: "파이니어(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 3200,
      localAmount: 4321600,
      evaluationRate: 1350.5,
      evaluationAmount: 4321600,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 9,
      status: "",
      invNo: "109-20251005-23",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "100369",
      customerName: "Argus media",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 1900,
      localAmount: 2565950,
      evaluationRate: 1350.5,
      evaluationAmount: 2565950,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 10,
      status: "",
      invNo: "109-20251010-67",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099633",
      customerName: "시엔에스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2100,
      localAmount: 2836050,
      evaluationRate: 1350.5,
      evaluationAmount: 2836050,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 11,
      status: "",
      invNo: "109-20251015-34",
      currency: "USD",
      account: "2120202",
      accountName: "미지급금(외화)",
      customer: "099575",
      customerName: "프린웍스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2800,
      localAmount: 3781400,
      evaluationRate: 1350.5,
      evaluationAmount: 3781400,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 12,
      status: "",
      invNo: "109-20251020-91",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "099560",
      customerName: "파이니어(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2400,
      localAmount: 3241200,
      evaluationRate: 1350.5,
      evaluationAmount: 3241200,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 13,
      status: "",
      invNo: "109-20251025-48",
      currency: "USD",
      account: "2120102",
      accountName: "매입채무(외화외상매입금)",
      customer: "100369",
      customerName: "Argus media",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 2600,
      localAmount: 3511300,
      evaluationRate: 1350.5,
      evaluationAmount: 3511300,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
    {
      id: 14,
      status: "",
      invNo: "109-20251030-72",
      currency: "USD",
      account: "2120202",
      accountName: "미지급금(외화)",
      customer: "099633",
      customerName: "시엔에스(베트남)",
      manageNo2: "",
      exchangeRate: 1350.5,
      foreignAmount: 1700,
      localAmount: 2295850,
      evaluationRate: 1350.5,
      evaluationAmount: 2295850,
      evaluationProfit: 0,
      businessUnit: "HO",
      slipHeaderId: "MSD-20251205-1",
      slipNo: "MSD-20251205-1",
    },
  ],
};

