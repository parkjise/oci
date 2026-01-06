import { post } from "@apis/common";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  BcncAcnutSrchRequest,
  BcncAcnutListResponse,
} from "@/types/fcm/md/partner/BcncAcnutRegist/BcncAcnutRegist.types";

export const selectBcncAcnutList = async (
  params: BcncAcnutSrchRequest
): Promise<ApiResponse<BcncAcnutListResponse[]>> => {
  return post("/fcm/md/partner/selectBcncAcnutList", params);
};

export const saveBcncAcnut = async (
  params: BcncAcnutListResponse[]
): Promise<ApiResponse<void>> => {
  return post("/fcm/md/partner/saveBcncAcnut", { list: params });
};

export const selectBcncAcnutRegistMaxSeq = async (
  params: BcncAcnutSrchRequest
): Promise<ApiResponse<{ seq: number }>> => {
  return post("/fcm/md/partner/selectBcncAcnutRegistMaxSeq", params);
};
