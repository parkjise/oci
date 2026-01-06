import { post } from "@apis/common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
    BankAcnutRegistSrchRequest,
    BankAcnutRegistListResponse,
    BankAcnutRegistSaveRequest
} from "@/types/fcm/md/other/bankAcnutRegist.types";

/**
 * 은행계좌 등록 목록 조회 API
 * @param params - 검색 조건
 * @returns 은행계좌 목록
 */
export const selectBankAcnutRegistList = async (
    params: BankAcnutRegistSrchRequest
): Promise<ApiResponse<BankAcnutRegistListResponse[]>> => {
    return post<BankAcnutRegistListResponse[]>(
        "/fcm/md/other/bankAcnutRegist/selectBankAcnutRegistList",
        params
    );
};

/**
 * 은행계좌 등록 저장 API
 * @param params - 저장 데이터 목록
 * @returns 성공 여부
 */
export const saveBankAcnutRegist = async (
    params: BankAcnutRegistSaveRequest
): Promise<ApiResponse<void>> => {
    return post<void>(
        "/fcm/md/other/bankAcnutRegist/saveBankAcnutRegist",
        params
    );
};
