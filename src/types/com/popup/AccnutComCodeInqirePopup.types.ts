
export interface AccnutComCodeInqirePopupSrchRequest {
    asOfficeId: string;
    asModule?: string;
    asCodeTy?: string;
    asOrgId?: string;
    asSrchKwrd?: string;
    asSgmt1?: string;
    asSgmt2?: string;
    asSgmt3?: string;
    asSgmt4?: string;
    asSgmt5?: string;
    asSgmt6?: string;
    asDefaultYn?: string;
    asEnabledFlag?: string;
}

export interface AccnutComCodeInqirePopupListResponse {
    officeId: string;
    module: string;
    codeTy: string;
    code: string;
    codeNme: string;
    codeNme2: string;
    codeDesc: string;
    codeAbbr: string;
    sgmt1: string;
    sgmt2: string;
    sgmt3: string;
    sgmt4: string;
    sgmt5: string;
    sgmt6: string;
    sgmt7: string;
    sgmt8: string;
    sgmt9: string;
    sgmt10: string;
    sgmt11: string;
    sgmt12: string;
    sgmt13: string;
    sgmt14: string;
    sgmt15: string;
    orgId: string;
    enabledFlag: string;
    startDate: string;
    endDate: string;
    sortCol: string;
    defaultYn: string;
    userTy: string;
    onerpExec: string;
    nmeAbbrLen: string;
}

export type SelectedAccnutComCode = AccnutComCodeInqirePopupListResponse;
