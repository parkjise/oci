import { create } from "zustand";
import type { GridApi } from "ag-grid-community";
import {
  selectFgcryEvlList,
  selectFgcryEvlDetailList,
  createFgcryEvl,
  deleteFgcryEvl,
  reverseFgcryEvl,
  chkGlDate,
} from "@apis/fcm/gl/settlement";
import type {
  FgcryEvlSrchRequest,
  FgcryEvlHderListResponse,
  FgcryEvlDetailListResponse,
  FgcryEvlCreatRequest,
  FgcryEvlDeleteRequest,
  FgcryEvlReverseRequest,
  ChkGlDateRequest,
} from "@/types/fcm/gl/settlement/fgcryEvl.types";
import { showSuccess, showError, showWarning } from "@components/ui/feedback/Message";

// ============================================================================
// 가상 데이터 생성 함수 (개발 환경용)
// ============================================================================

/**
 * 헤더 목록 가상 데이터 생성
 */
// const createMockHeaderData = (searchRequest: FgcryEvlSrchRequest): FgcryEvlHderListResponse[] => {
//   const typeLabels: Record<string, string> = {
//     AP: "AP",
//     AR: "AR",
//     GL: "GL",
//   };

//   const typeLabel = typeLabels[searchRequest.asType] || searchRequest.asType;

//   return [
//     {
//       evalType: typeLabel,
//       slipNo: `SLP-${searchRequest.asStdDate}-001`,
//       revSlipNo: `REV-${searchRequest.asStdDate}-001`,
//       evaluationType: searchRequest.asType,
//       slpHeaderId: `HEADER-${searchRequest.asStdDate}-001`,
//       revSlpHeaderId: `REV-HEADER-${searchRequest.asStdDate}-001`,
//       stdDate: searchRequest.asStdDate,
//       frExEvalId: `EVAL-${searchRequest.asStdDate}-001`,
//       slipNoPosted: "Y",
//       revSlipNoPosted: "N",
//       createdBy: "ADMIN",
//       creationDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//       lastUpdatedBy: "ADMIN",
//       lastUpdateDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//       programId: "FGCryEvl",
//       terminalId: "TERM001",
//     },
// {
//   evalType: typeLabel,
//   slipNo: `SLP-${searchRequest.asStdDate}-002`,
//   revSlipNo: `REV-${searchRequest.asStdDate}-002`,
//   evaluationType: searchRequest.asType,
//   slpHeaderId: `HEADER-${searchRequest.asStdDate}-002`,
//   revSlpHeaderId: `REV-HEADER-${searchRequest.asStdDate}-002`,
//   stdDate: searchRequest.asStdDate,
//   frExEvalId: `EVAL-${searchRequest.asStdDate}-002`,
//   slipNoPosted: "Y",
//   revSlipNoPosted: "Y",
//   createdBy: "USER01",
//   creationDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//   lastUpdatedBy: "USER01",
//   lastUpdateDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//   programId: "FGCryEvl",
//   terminalId: "TERM002",
// },
// {
//   evalType: typeLabel,
//   slipNo: `SLP-${searchRequest.asStdDate}-003`,
//   revSlipNo: `REV-${searchRequest.asStdDate}-003`,
//   evaluationType: searchRequest.asType,
//   slpHeaderId: `HEADER-${searchRequest.asStdDate}-003`,
//   revSlpHeaderId: `REV-HEADER-${searchRequest.asStdDate}-003`,
//   stdDate: searchRequest.asStdDate,
//   frExEvalId: `EVAL-${searchRequest.asStdDate}-003`,
//   slipNoPosted: "N",
//   revSlipNoPosted: "N",
//   createdBy: "USER02",
//   creationDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//   lastUpdatedBy: "USER02",
//   lastUpdateDate: new Date().toISOString().replace("T", " ").substring(0, 19),
//   programId: "FGCryEvl",
//   terminalId: "TERM003",
// },
//   ];
// };

// /**
//  * 상세 목록 가상 데이터 생성
//  */
// const createMockDetailData = (searchRequest: FgcryEvlSrchRequest, headerId: string): FgcryEvlDetailListResponse[] => {
//   const currencies = ["USD", "EUR", "JPY", "CNY"];
//   const accounts = [
//     { code: "1101", name: "현금" },
//     { code: "1201", name: "매출채권" },
//     { code: "2101", name: "매입채무" },
//     { code: "3101", name: "자본금" },
//   ];

//   return Array.from({ length: 8 }, (_, index) => {
//     const currency = currencies[index % currencies.length];
//     const account = accounts[index % accounts.length];
//     const exchangeRate = 1200 + (index * 10);
//     const occurAmtFr = 1000 + (index * 100);
//     const occurAmt = occurAmtFr * exchangeRate;
//     const evaluExRate = exchangeRate + 50;
//     const exchangeAmt = occurAmtFr * evaluExRate;
//     const gainLossAmt = exchangeAmt - occurAmt;

//     return {
//       officeId: searchRequest.asOfficeId,
//       stdDate: searchRequest.asStdDate,
//       evaluationType: searchRequest.asType,
//       currency: currency,
//       accCde: account.code,
//       accName: account.name,
//       accMgmtNbr1: `MGMT-${String(index + 1).padStart(3, "0")}`,
//       accMgmtNbr1Name: `관리번호${index + 1}`,
//       accMgmtNbr2: `MGMT2-${String(index + 1).padStart(3, "0")}`,
//       exchangeRate: exchangeRate,
//       occurAmtFr: occurAmtFr,
//       occurAmt: occurAmt,
//       evaluExRate: evaluExRate,
//       exchangeAmt: exchangeAmt,
//       gainLossAmt: gainLossAmt,
//       slpHeaderId: headerId,
//       slipNo: `SLP-${searchRequest.asStdDate}-${String(index + 1).padStart(3, "0")}`,
//       invoiceNumber: `INV-${searchRequest.asStdDate}-${String(index + 1).padStart(3, "0")}`,
//       salesNo: `SALES-${String(index + 1).padStart(3, "0")}`,
//       invoiceId: `INV-ID-${String(index + 1).padStart(3, "0")}`,
//       slsMstId: `SALES-MST-${String(index + 1).padStart(3, "0")}`,
//       pssnDept: "영업부",
//       orgId: "ORG001",
//       dvs: "사업부1",
//       eCurrPre: "2",
//       eCurrConv: "1",
//       eCurrFormat: "###,###,###",
//       currFormat: "###,###,###",
//     };
//   });
// };

interface FgcryEvlState {
  // 상태
  searchData: FgcryEvlHderListResponse[];  // 헤더 목록 (왼쪽 그리드)
  detailData: FgcryEvlDetailListResponse[]; // 상세 목록 (오른쪽 그리드)
  selectedHeaderId: string | null;          // 선택된 헤더 ID
  loading: boolean;
  gridApi: GridApi | null;
  detailGridApi: GridApi | null;            // 상세 그리드 API
  lastSearchRequest: FgcryEvlSrchRequest | null;

  // 액션
  setSearchData: (data: FgcryEvlHderListResponse[]) => void;
  setDetailData: (data: FgcryEvlDetailListResponse[]) => void;
  setSelectedHeaderId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  setDetailGridApi: (api: GridApi | null) => void;
  search: (searchRequest: FgcryEvlSrchRequest) => Promise<void>;
  selectHeader: (headerId: string) => Promise<void>; // 헤더 선택 시 상세 조회
  refresh: () => Promise<void>;
  reset: () => void;
  create: (createRequest: FgcryEvlCreatRequest) => Promise<void>; // Create 액션
  checkGlDate: (checkRequest: ChkGlDateRequest) => Promise<number>; // 회계일자 체크
  delete: (deleteRequest: FgcryEvlDeleteRequest) => Promise<void>; // Delete 액션
  reverse: (reverseRequest: FgcryEvlReverseRequest) => Promise<void>; // Reverse 액션
}

export const useFgcryEvlStore = create<FgcryEvlState>(
  (set, get) => ({
    // 초기 상태
    searchData: [],
    detailData: [],
    selectedHeaderId: null,
    loading: false,
    gridApi: null,
    detailGridApi: null,
    lastSearchRequest: null,

    // 상태 설정 액션
    setSearchData: (data) => set({ searchData: data }),
    setDetailData: (data) => set({ detailData: data }),
    setSelectedHeaderId: (id) => set({ selectedHeaderId: id }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),
    setDetailGridApi: (api) => set({ detailGridApi: api }),

    // 조회 액션
    search: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        // 조회 전 데이터 초기화 (웹스퀘어 로직 반영)
        set({ searchData: [], detailData: [], selectedHeaderId: null });

        // 날짜 포맷 변환 (YYYY-MM-DD -> YYYYMMDD)
        if (searchRequest.asStdDate) {
          searchRequest.asStdDate = searchRequest.asStdDate.replace(/[-/]/g, "");
        }

        // 실제 API 호출
        const response = await selectFgcryEvlList(searchRequest);
        let headerList: FgcryEvlHderListResponse[] = [];

        if (response.success && response.data) {
          headerList = response.data as FgcryEvlHderListResponse[];
        } else {
          showError(response.message || "조회에 실패했습니다.");
          set({ searchData: [], detailData: [] });
          return;
        }

        set({
          searchData: headerList,
          lastSearchRequest: searchRequest,
        });
        showSuccess(`조회 완료: ${headerList.length}건`);

        // 조회 후 첫 번째 행이 있으면 자동으로 상세 조회 (요구사항 3)
        if (headerList.length > 0) {
          // 첫 번째 행 자동 포커스 및 상세 조회는 LeftGrid에서 처리
          // 여기서는 상세 조회만 실행
          const firstRow = headerList[0];
          const headerId = firstRow.frExEvalId || firstRow.slpHeaderId || firstRow.slipNo;

          if (headerId) {
            // 첫 번째 행의 상세 조회
            await get().selectHeader(headerId);
          }
        } else {
          // 조회 결과가 없으면 상세 데이터 초기화
          set({ detailData: [], selectedHeaderId: null });
        }
      } catch (error) {
        showError("조회 중 오류가 발생했습니다.");
        set({ searchData: [], detailData: [] });
        console.error("조회 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // 헤더 선택 시 상세 조회
    selectHeader: async (headerId: string) => {
      if (!headerId) return;

      const state = get();
      if (state.loading) return;

      try {
        set({ loading: true, selectedHeaderId: headerId });

        // lastSearchRequest가 없으면 상세 조회 불가
        if (!state.lastSearchRequest) {
          showError("먼저 조회를 실행해주세요.");
          set({ loading: false });
          return;
        }

        // 필수 필드가 보장된 요청 객체 생성
        const detailRequest: FgcryEvlSrchRequest = {
          asOfficeId: state.lastSearchRequest.asOfficeId,
          asStdDate: state.lastSearchRequest.asStdDate,
          asType: state.lastSearchRequest.asType,
          asFrExEvalId: headerId, // 헤더 ID(전표번호 또는 외화평가ID)로 상세 조회
          asCurrDeci: "0",
          asCurrFormat: "###,###,###"
        };

        // 실제 API 호출
        const response = await selectFgcryEvlDetailList(detailRequest);
        let detailList: FgcryEvlDetailListResponse[] = [];

        if (response.success && response.data) {
          detailList = response.data;
        } else {
          showError(response.message || "상세 조회에 실패했습니다.");
          set({ detailData: [] });
          return;
        }

        set({ detailData: detailList });
      } catch (error) {
        showError("상세 조회 중 오류가 발생했습니다.");
        set({ detailData: [] });
        console.error("상세 조회 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // 재조회 액션
    refresh: async () => {
      const state = get();
      if (state.lastSearchRequest) {
        await get().search(state.lastSearchRequest);
      } else {
        showWarning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
      }
    },

    // 초기화 액션
    reset: () =>
      set({
        searchData: [],
        detailData: [],
        selectedHeaderId: null,
        loading: false,
        gridApi: null,
        detailGridApi: null,
        lastSearchRequest: null,
      }),

    // 회계일자 체크 액션
    checkGlDate: async (checkRequest) => {
      try {
        // 날짜 포맷 변환 (YYYY-MM-DD -> YYYYMMDD)
        if (checkRequest.glDate) {
          checkRequest.glDate = checkRequest.glDate.replace(/[-/]/g, "");
        }

        console.log("회계일자 체크 요청:", checkRequest);
        const response = await chkGlDate(checkRequest);
        if (response.success && response.data) {
          return response.data.result;
        }
        return 0;
      } catch (error) {
        console.error("회계일자 체크 실패:", error);
        return 0;
      }
    },

    // Create 액션
    create: async (createRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        // 날짜 포맷 변환 (YYYY-MM-DD -> YYYYMMDD)
        if (createRequest.pGlDate) {
          createRequest.pGlDate = createRequest.pGlDate.replace(/[-/]/g, "");
        }

        // 실제 API 호출
        const response = await createFgcryEvl(createRequest);
        if (!response.success) {
          showError(response.message || "Create에 실패했습니다.");
          return;
        }

        if (response.data?.perrbuff !== null && response.data?.perrbuff !== undefined) {
          console.log("Create 오류:", response.data.perrbuff);
          showError(response.data.perrbuff);
          return;
        } else {
          console.log("Create 성공:", response.data);
          showSuccess("Create가 완료되었습니다.");
        }

        //showSuccess("Create가 완료되었습니다.");

        // Create 후 자동으로 조회 실행 (요구사항 2)
        // 웹스퀘어 로직: sbm_btnCreate_submitdone에서 btnSearch_onclick 실행
        const categoryMap: Record<string, string> = {
          AP: "AP",
          AR: "AR",
          GL: "GL",
        };
        const asType = categoryMap[createRequest.pCategory] || createRequest.pCategory;

        const searchRequest: FgcryEvlSrchRequest = {
          asOfficeId: createRequest.pOfficeId,
          asStdDate: createRequest.pGlDate,
          asType: asType,
          asFrExEvalId: "",
          asCurrDeci: "",
          asCurrFormat: "",
        };

        // 자동 조회 실행
        await get().search(searchRequest);
      } catch (error) {
        showError("Create 중 오류가 발생했습니다.");
        console.error("Create 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // Delete 액션
    delete: async (deleteRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        // 실제 API 호출
        const response = await deleteFgcryEvl(deleteRequest);
        if (!response.success) {
          showError(response.message || "Delete에 실패했습니다.");
          return;
        }

        // API 응답에서 에러 메시지 확인
        if (response.data?.perrbuff) {
          showError(response.data.perrbuff);
          return;
        }

        showSuccess("Delete가 완료되었습니다.");

        // Delete 후 자동으로 조회 실행
        if (state.lastSearchRequest) {
          await get().search(state.lastSearchRequest);
        }
      } catch (error) {
        showError("Delete 중 오류가 발생했습니다.");
        console.error("Delete 실패:", error);
      } finally {
        set({ loading: false });
      }
    },

    // Reverse 액션
    reverse: async (reverseRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        // 날짜 포맷 변환 (YYYY-MM-DD -> YYYYMMDD)
        if (reverseRequest.pRevGlDate) {
          reverseRequest.pRevGlDate = reverseRequest.pRevGlDate.replace(/[-/]/g, "");
        }

        // 실제 API 호출
        const response = await reverseFgcryEvl(reverseRequest);
        if (!response.success) {
          showError(response.message || "Reverse에 실패했습니다.");
          return;
        }

        // API 응답에서 에러 메시지 확인
        if (response.data?.perrbuff) {
          showError(response.data.perrbuff);
          return;
        }

        showSuccess("Reverse가 완료되었습니다.");

        // Reverse 후 자동으로 조회 실행
        if (state.lastSearchRequest) {
          await get().search(state.lastSearchRequest);
        }
      } catch (error) {
        showError("Reverse 중 오류가 발생했습니다.");
        console.error("Reverse 실패:", error);
      } finally {
        set({ loading: false });
      }
    },
  })
);

