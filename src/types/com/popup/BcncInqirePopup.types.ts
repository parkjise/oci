/**
 * 거래처 조회 팝업 관련 TypeScript 타입 정의
 */

/**
 * 거래처 조회 팝업 검색 요청 타입
 */
export interface BcncInqirePopupSrchRequest {
    asOfficeId?: string;
    asUseYno?: string;
    asCustType?: string;
    asCustno?: string;
}

/**
 * 거래처 조회 팝업 목록 응답 타입
 */
export interface BcncInqirePopupListResponse {
    id?: string | number;
    officeId?: string;
    custno: string;
    custname: string;
    custename?: string;
    custType?: string;
    custArea?: string;
    custClass?: string;
    custStatus?: string;
    rArea?: string;
    pname?: string;
    ipsStatus?: string;
    pidno?: string;
    regtno?: string;
    rnnNo?: string;
    binNo?: string;
    cikNo?: string;
    carno?: string;
    zipcode?: string;
    addr?: string;
    paddr?: string;
    fax?: string;
    uptae?: string;
    jong?: string;
    odate?: string;
    sdate?: string;
    engage?: string;
    cdate?: string;
    discount?: string;
    charger?: string;
    business?: string;
    baddr?: string;
    pcustno?: string;
    eidate?: string;
    bank?: string;
    dman?: string;
    ysale?: string;
    handle?: string;
    other?: string;
    msale?: string;
    credit?: string;
    mpower?: string;
    car?: string;
    etc?: string;
    openstn?: string;
    dscr1?: string;
    dscr2?: string;
    dscr3?: string;
    dscr4?: string;
    tel?: string;
    method?: string;
    custnoGb?: string;
    custnoGbName?: string;
    regtnoGb?: string;
    endGb?: string;
    demdType?: string;
    ntnlCde?: string;
    currUnit?: string;
    stlmTerm?: string;
    stlmTermAr?: string;
    acctNbr?: string;
    vatType?: string;
    vatType2?: string;
    useYno?: string;
    gbocexpnYno?: string;
    saleGb?: string;
    depositor?: string;
    tuk?: string;
    dpart?: string;
    dname?: string;
    dtitle?: string;
    purGb?: string;
    userId?: string;
    wrkDate?: string;
    chengName?: string;
    acctNum1?: string;
    acctNum2?: string;
    acctNum3?: string;
    currency?: string;
    salesMan?: string;
    emailId?: string;
    [key: string]: unknown;
}

/**
 * 반환할 거래처 데이터 타입
 */
export type SelectedBcnc = {
    custno: string;
    custname: string;
};

/**
 * BcncInqirePopup 컴포넌트의 Props 타입
 */
export interface BcncInqirePopupProps {
    /** 대표사무소 ID */
    asOfficeId?: string;
    /** 초기 거래처번호 */
    initialCustno?: string;
    /** 사용여부 필터 */
    asUseYno?: string;
    /** 거래처구분 필터 */
    asCustType?: string;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
}
