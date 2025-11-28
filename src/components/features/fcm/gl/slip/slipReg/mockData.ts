export interface SlipDetail {
    status: string;
    seq: number;
    accountCode: string;
    accountName: string;
    currency: string;
    exchangeRateType: string;
    exchangeRate: number;
    debitAmount: number;
    creditAmount: number;
    debitAmountConverted: number;
    creditAmountConverted: number;
    description: string;
    dept?: string;
    deptName?: string;
    partner?: string;
    partnerName?: string;
    manage1Name?: string;
    manage2Name?: string;
    trialBizArea?: string;
    bizArea?: string;
    processCode?: string;
    processName?: string;
    itemGroup?: string;
    itemGroupName?: string;
    itemCode?: string;
    itemName?: string;
    project?: string;
    projectName?: string;
    subModuleSource?: string;
    subModuleKey?: string;
    apVat?: string;
    detail?: string;
    paymentTarget?: string;
    channel1?: string;
    channel2?: string;
    channel3?: string;
    itemType?: string;
    itemLargeClass?: string;
    itemMiddleClass?: string;
    itemSmallClass?: string;
    fixedAsset?: string;
    regFix?: string;
}

export interface SlipMaster {
    id: string; // glSlipNo
    status: string; // for RecordList
    statusColor: string; // for RecordList
    date: string; // creationDate
    company: string; // for RecordList

    // DetailView fields
    makeDept: string;
    deptName: string;
    userId: string;
    makerName: string;
    slipName: string;
    slipExptnName: string;
    dvs?: string;
    srcTblName: string;
    sourceKey: string;
    glSlipNo: string;
    exptnTgt: string;
    edimStatusName: string;
    creationDate: string;
    reverseNo: string;
    description: string;
    closed: string;
    lastUpdateDate: string;

    details: SlipDetail[];
}

export const mockSlips: SlipMaster[] = [
    {
        id: "7419137",
        status: "완료",
        statusColor: "blue",
        date: "2025.10.20",
        company: "에이비씨 머티리얼즈",
        makeDept: "A11",
        deptName: "경영관리본부",
        userId: "ADMIN",
        makerName: "관리자",
        slipName: "대체전표",
        slipExptnName: "",
        srcTblName: "",
        sourceKey: "",
        glSlipNo: "7419137",
        exptnTgt: "",
        edimStatusName: "승인완료",
        creationDate: "2025-10-20",
        reverseNo: "10",
        description: "사무용품 및 식대 지급",
        closed: "",
        lastUpdateDate: "2025-10-20",
        details: [
            {
                status: "U",
                seq: 1,
                accountCode: "11101010",
                accountName: "현금",
                currency: "KRW",
                exchangeRateType: "매매기준율",
                exchangeRate: 1,
                debitAmount: 150000,
                creditAmount: 0,
                debitAmountConverted: 150000,
                creditAmountConverted: 0,
                description: "사무용품 구입",
                dept: "A11",
                deptName: "경영관리본부",
                partner: "P001",
                partnerName: "오피스디포",
            },
            {
                status: "U",
                seq: 2,
                accountCode: "51101010",
                accountName: "복리후생비",
                currency: "KRW",
                exchangeRateType: "매매기준율",
                exchangeRate: 1,
                debitAmount: 0,
                creditAmount: 150000,
                debitAmountConverted: 0,
                creditAmountConverted: 150000,
                description: "사무용품 구입",
                dept: "A11",
                deptName: "경영관리본부",
                partner: "P001",
                partnerName: "오피스디포",
            }
        ]
    },
    {
        id: "7419122",
        status: "전자결재 승인완료",
        statusColor: "orange",
        date: "2025.10.20",
        company: "가나다물산(주)",
        makeDept: "A12",
        deptName: "해외영업팀",
        userId: "USER01",
        makerName: "홍길동",
        slipName: "일반전표",
        slipExptnName: "",
        srcTblName: "",
        sourceKey: "",
        glSlipNo: "7419122",
        exptnTgt: "",
        edimStatusName: "승인완료",
        creationDate: "2025-10-20",
        reverseNo: "",
        description: "해외 출장비 정산",
        closed: "",
        lastUpdateDate: "2025-10-20",
        details: [
            {
                status: "I",
                seq: 1,
                accountCode: "11101020",
                accountName: "보통예금",
                currency: "USD",
                exchangeRateType: "전신환매도율",
                exchangeRate: 1350.5,
                debitAmount: 100,
                creditAmount: 0,
                debitAmountConverted: 135050,
                creditAmountConverted: 0,
                description: "해외 출장비 송금",
                dept: "A12",
                deptName: "해외영업팀",
                partner: "P002",
                partnerName: "Global Hotel",
            },
            {
                status: "I",
                seq: 2,
                accountCode: "51101030",
                accountName: "여비교통비",
                currency: "USD",
                exchangeRateType: "전신환매도율",
                exchangeRate: 1350.5,
                debitAmount: 0,
                creditAmount: 100,
                debitAmountConverted: 0,
                creditAmountConverted: 135050,
                description: "해외 출장비 송금",
                dept: "A12",
                deptName: "해외영업팀",
                partner: "P002",
                partnerName: "Global Hotel",
            }
        ]
    },
    {
        id: "7419105",
        status: "",
        statusColor: "",
        date: "2025.10.19",
        company: "데오코퍼레이션",
        makeDept: "A11",
        deptName: "경영관리본부",
        userId: "ADMIN",
        makerName: "관리자",
        slipName: "대체전표",
        slipExptnName: "",
        srcTblName: "",
        sourceKey: "",
        glSlipNo: "7419105",
        exptnTgt: "",
        edimStatusName: "작성중",
        creationDate: "2025-10-19",
        reverseNo: "",
        description: "택배비 지급",
        closed: "",
        lastUpdateDate: "2025-10-19",
        details: [
            {
                status: "",
                seq: 1,
                accountCode: "11101010",
                accountName: "현금",
                currency: "KRW",
                exchangeRateType: "매매기준율",
                exchangeRate: 1,
                debitAmount: 50000,
                creditAmount: 0,
                debitAmountConverted: 50000,
                creditAmountConverted: 0,
                description: "택배비 지급",
                dept: "A11",
                deptName: "경영관리본부",
                partner: "P003",
                partnerName: "우체국택배",
            }
        ]
    }
];
