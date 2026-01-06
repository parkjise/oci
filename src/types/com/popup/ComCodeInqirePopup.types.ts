export interface ComCodeInqirePopupSrchRequest {
    asOfficeId: string;
    asCodeTy: string;
    asSrchKwrd?: string;
    asSgmt2?: string;
}

export interface ComCodeInqirePopupListResponse {
    officeId: string;
    codeTy: string;
    code: string;
    codeNme: string;
    codeDesc: string;
    sgmt5: string;
    sortCol: string;
    sgmt7: string;
    sgmt1: string;
}

export type SelectedComCode = ComCodeInqirePopupListResponse;
