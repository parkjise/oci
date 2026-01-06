export interface VatTyInqirePopupSrchRequest {
    asOfficeId: string;
    asTaxCode?: string;
    asTaxTy?: string;
}

export interface VatTyInqirePopupListResponse {
    taxCode: string;
    description: string;
    taxRate: string;
    accountCode: string;
    relCusYn: string;
    nonDeduct: string;
    elecYn: string;
    taxName: string;
    remark: string;
}

export type SelectedVatTy = VatTyInqirePopupListResponse;
