
export interface AtmcJrnlzMastrSetupHderListResponse {
    applName: string;
    accountingType: string;
    glItem: string;
    description: string;
    lastUpdateDate: string;
    lastUpdatedBy: string;
}

export interface AtmcJrnlzMastrSetupDetailListResponse {
    officeId: string;
    applName: string;
    accountingType: string;
    glItem: string;
    glClass: string;
    accountCode: string;
    cusCde: string;
    itemCode: string;
    lastUpdateDate: string;
    lastUpdatedBy: string;
}

export interface MasterRowData extends AtmcJrnlzMastrSetupHderListResponse {
    id: string;
    rowStatus?: "C" | "U" | "D";
    oriApplName?: string;
    oriAccountingType?: string;
    oriGlItem?: string;
}

export interface DetailRowData extends AtmcJrnlzMastrSetupDetailListResponse {
    id: string;
    rowStatus?: "C" | "U" | "D";
    oriApplName?: string;
    oriAccountingType?: string;
    oriGlItem?: string;
    oriGlClass?: string;
}

export interface AtmcJrnlzMastrSetupSrchRequest {
    asOfficeId?: string;
    asApplName: string;
    asAccountingType: string;
    asGlItem: string;
}

export interface AtmcJrnlzMastrSetupHderData {
    rowStatus: "C" | "U" | "D";
    oriApplName?: string;
    oriAccountingType?: string;
    oriGlItem?: string;
    applName?: string;
    accountingType?: string;
    glItem?: string;
    description?: string;
}

export interface AtmcJrnlzMastrSetupDetailData {
    rowStatus: "C" | "U" | "D";
    oriApplName?: string;
    oriAccountingType?: string;
    oriGlItem?: string;
    oriGlClass?: string;
    officeId: string;
    applName?: string;
    accountingType?: string;
    glItem?: string;
    glClass?: string;
    accountCode?: string;
    cusCde?: string;
    itemCode?: string;
}

export interface AtmcJrnlzMastrSetupSaveRequest {
    headerList: AtmcJrnlzMastrSetupHderData[];
    detailList: AtmcJrnlzMastrSetupDetailData[];
}