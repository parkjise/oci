export interface AdresInqirePopupSrchRequest {
    keyword: string;
    currentPage: number;
    countPerPage: number;
    resultType?: string;
}

export interface AdresInqirePopupListResponse {
    roadAddr: string;
    jibunAddr: string;
    zipNo: string;
    totalCount: string;
    currentPage?: string;
    countPerPage?: string;
    errorCode?: string;
    errorMessage?: string;
}

export type SelectedAdres = AdresInqirePopupListResponse;
