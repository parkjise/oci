/**
 * ============================================================================
 * 공통 팝업 API 모음
 * ============================================================================
 *
 * 모든 공통 팝업 관련 API 호출 함수를 이 파일에서 통합 관리합니다.
 */

import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    AcntInqirePopupSrchRequest,
    AcntInqirePopupListResponse,
    AccnutComCodeInqirePopupSrchRequest,
    AccnutComCodeInqirePopupListResponse,
    AcnutNoInqirePopupSrchRequest,
    AcnutNoInqirePopupListResponse,
    BankCodeInqirePopupSrchRequest,
    BankCodeInqirePopupListResponse,
    BcncInqirePopupSrchRequest,
    BcncInqirePopupListResponse,
    ComCodeInqirePopupSrchRequest,
    ComCodeInqirePopupListResponse,
    CrrncyKndPopupSrchRequest,
    CrrncyKndPopupListResponse,
    DeptInqirePopupSrchRequest,
    DeptInqirePopupListResponse,
    PrdlstCodeInqirePopupSrchRequest,
    PrdlstCodeInqirePopupListResponse,
    PrdlstSeInqirePopupSrchRequest,
    PrdlstSeInqirePopupListResponse,
    PrjctInqirePopupSrchRequest,
    PrjctInqirePopupListResponse,
    ProcsCodePopupSrchRequest,
    ProcsCodePopupListResponse,
    VatTyInqirePopupSrchRequest,
    VatTyInqirePopupListResponse,
    WrterInqirePopupSrchRequest,
    WrterInqirePopupListResponse,
    AdresInqirePopupSrchRequest,
    AdresInqirePopupListResponse,
} from "@/types/com/popup";

// ManageItemInputPopupApi 관련 타입은 별도 정의 필요 시 추가
// 현재는 manageItemInputPopupApi 파일 내용을 분석하여 통합하겠습니다.

/**
 * 계정조회 팝업 목록 조회
 */
export const selectAcntInqirePopupList = async (
    request: AcntInqirePopupSrchRequest
): Promise<ApiResponse<AcntInqirePopupListResponse[]>> => {
    return await post<AcntInqirePopupListResponse[]>(
        "/com/popup/selectAcntInqirePopupList",
        request
    );
};

/**
 * 회계공통코드 조회 팝업 목록 조회
 */
export const selectAccnutComCodeInqirePopupList = async (
    params: AccnutComCodeInqirePopupSrchRequest
): Promise<ApiResponse<AccnutComCodeInqirePopupListResponse[]>> => {
    return post<AccnutComCodeInqirePopupListResponse[]>(
        "/com/popup/selectAccnutComCodeInqirePopupList",
        params
    );
};

/**
 * 계좌번호 조회 팝업 목록 조회
 */
export const selectAcnutNoInqirePopupList = async (
    request: AcnutNoInqirePopupSrchRequest
): Promise<ApiResponse<AcnutNoInqirePopupListResponse[]>> => {
    return await post<AcnutNoInqirePopupListResponse[]>(
        "/com/popup/selectAcnutNoInqirePopupList",
        request
    );
};

/**
 * BankCode 조회 팝업 목록 조회
 */
export const selectBankCodeInqirePopupList = async (
    request: BankCodeInqirePopupSrchRequest
): Promise<ApiResponse<BankCodeInqirePopupListResponse[]>> => {
    return await post<BankCodeInqirePopupListResponse[]>(
        "/com/popup/selectBankCodeInqirePopupList",
        request
    );
};

/**
 * 거래처 조회 팝업 목록 조회
 */
export const selectBcncInqirePopupList = async (
    request: BcncInqirePopupSrchRequest
): Promise<ApiResponse<BcncInqirePopupListResponse[]>> => {
    return await post<BcncInqirePopupListResponse[]>(
        "/com/popup/selectBcncInqirePopupList",
        request
    );
};

/**
 * 공통코드 조회 팝업 목록 조회
 */
export const selectComCodeInqirePopupList = async (
    params: ComCodeInqirePopupSrchRequest
): Promise<ApiResponse<ComCodeInqirePopupListResponse[]>> => {
    return post<ComCodeInqirePopupListResponse[]>(
        "/com/popup/selectComCodeInqirePopupList",
        params
    );
};

/**
 * 통화종류 팝업 목록 조회
 */
export const selectCrrncyKndPopupList = async (
    request: CrrncyKndPopupSrchRequest
): Promise<ApiResponse<CrrncyKndPopupListResponse[]>> => {
    return await post<CrrncyKndPopupListResponse[]>(
        "/com/popup/selectCrrncyKndPopupList",
        request
    );
};

/**
 * 부서 조회 팝업 목록 조회
 */
export const selectDeptInqirePopupList = async (
    request: DeptInqirePopupSrchRequest
): Promise<ApiResponse<DeptInqirePopupListResponse[]>> => {
    return await post<DeptInqirePopupListResponse[]>(
        "/com/popup/selectDeptInqirePopupList",
        request
    );
};

/**
 * 품목코드 조회 팝업 목록 조회
 */
export const selectPrdlstCodeInqirePopupList = async (
    request: PrdlstCodeInqirePopupSrchRequest
): Promise<ApiResponse<PrdlstCodeInqirePopupListResponse[]>> => {
    return await post<PrdlstCodeInqirePopupListResponse[]>(
        "/com/popup/selectPrdlstCodeInqirePopupList",
        request
    );
};

/**
 * 품목구분 조회 팝업 목록 조회
 */
export const selectPrdlstSeInqirePopupList = async (
    request: PrdlstSeInqirePopupSrchRequest
): Promise<ApiResponse<PrdlstSeInqirePopupListResponse[]>> => {
    return await post<PrdlstSeInqirePopupListResponse[]>(
        "/com/popup/selectPrdlstSeInqirePopupList",
        request
    );
};

/**
 * 프로젝트 조회 팝업 목록 조회
 */
export const selectPrjctInqirePopupList = async (
    request: PrjctInqirePopupSrchRequest
): Promise<ApiResponse<PrjctInqirePopupListResponse[]>> => {
    return await post<PrjctInqirePopupListResponse[]>(
        "/com/popup/selectPrjctInqirePopupList",
        request
    );
};

/**
 * 공정코드 팝업 목록 조회
 */
export const selectProcsCodePopupList = async (
    request: ProcsCodePopupSrchRequest
): Promise<ApiResponse<ProcsCodePopupListResponse[]>> => {
    return await post<ProcsCodePopupListResponse[]>(
        "/com/popup/selectProcsCodePopupList",
        request
    );
};

/**
 * 부가세유형 조회 팝업 목록 조회
 */
export const selectVatTyInqirePopupList = async (
    params: VatTyInqirePopupSrchRequest
): Promise<ApiResponse<VatTyInqirePopupListResponse[]>> => {
    return post<VatTyInqirePopupListResponse[]>(
        "/com/popup/selectVatTyInqirePopupList",
        params
    );
};

/**
 * 작성자 조회 팝업 목록 조회
 */
export const selectWrterInqirePopupList = async (
    request: WrterInqirePopupSrchRequest
): Promise<ApiResponse<WrterInqirePopupListResponse[]>> => {
    return await post<WrterInqirePopupListResponse[]>(
        "/com/popup/selectWrterInqirePopupList",
        request
    );
};

/**
 * 주소 조회 팝업 목록 조회
 */
export const selectAdresInqirePopupList = async (
    request: AdresInqirePopupSrchRequest
): Promise<ApiResponse<AdresInqirePopupListResponse[]>> => {
    return await post<AdresInqirePopupListResponse[]>(
        "/com/popup/selectAdresInqirePopupList",
        request
    );
};
