/**
 * 관리항목 입력 팝업 관련 TypeScript 타입 정의
 */

/**
 * 관리항목 데이터 인터페이스
 * SlipRegistDetailRequest 타입과 호환되도록 구성
 */
export interface ManageItemData {
    accMgmtNbr1?: string;
    accMgmtNbr1Nme?: string;
    accMgmtNbr1Type?: string;
    accMgmtNbr1Opt?: string;
    accMgmtName1?: string;
    accMgmtNbr2?: string;
    accMgmtNbr2Nme?: string;
    accMgmtNbr2Type?: string;
    accMgmtNbr2Opt?: string;
    accMgmtName2?: string;
    occurDate?: string;
    occurDateOpt?: string;
    maturDate?: string;
    maturDateOpt?: string;
    accRelAmt?: number | string;
    refOpt?: string;
    intRate?: number | string;
    exchgRateOpt?: string;
    costCode?: string;
    costCodeName?: string;
    cstCdeOpt?: string;
    entExpnYn?: string;
    entItemYn?: string;
    accCode?: string;
    occurAmt?: number | string;
    serAckSlp?: number | string;
    seqAckSlp?: number | string;
    rem?: string;
    gridRow?: number;
    // Legacy 호환성을 위한 추가 필드
    coId1?: string;
    accMgmtNbr1Txt?: string;
    coId2?: string;
    accMgmtNbr2Txt?: string;
    unit?: string;
    unitTxt?: string;
    occurDateDt?: string;
    maturDateDt?: string;
    [key: string]: any;
}

export interface ManageItemInputPopupProps {
    /** 대표사무소 */
    asOfficeId?: string;
    /** 초기 데이터 */
    initialData?: ManageItemData;
    /** 확인 버튼 핸들러 등록 함수 */
    onConfirm?: (handler: () => void) => void;
    [key: string]: any;
}
