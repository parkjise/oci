import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import dayjs from "dayjs";
import {
  selectAdvpayCtDtaCreatList,
  selectNewAdvpayCtDtaCreatList,
  saveAdvpayCtDtaCreat,
  deleteAdvpayCtDtaCreat,
} from "@apis/fcm/gl/settlement";
import type {
  AdvpayCtDtaCreatSearchRequest,
  AdvpayCtDtaCreatSearchResponse,
  AdvpayCtDtaCreatSaveRequest,
  AdvpayCtDtaCreatDetailData,
  AdvpayCtDtaCreatInvoiceLineData,
  AdvpayCtDtaCreatHeaderData,
} from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import { confirm, showWarning } from "@components/ui/feedback/Message";

/**
 * YYYYMMDD 형식 문자열을 dayjs 객체로 변환
 */
const parseDate = (dateStr?: string): dayjs.Dayjs | null => {
  if (!dateStr || dateStr.length !== 8) return null;
  const formatted = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  const date = dayjs(formatted);
  return date.isValid() ? date : null;
};

/**
 * 두 날짜 사이의 일 수 계산 (포함)
 */
const getDaysDiff = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;
  return end.diff(start, "day") + 1;
};

/**
 * 두 날짜 사이의 개월 수 계산 (포함)
 */
const getMonthsDiff = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;
  return end.diff(start, "month") + 1;
};

/**
 * 해당 월의 마지막 일자 반환
 */
const getLastDayOfMonth = (dateStr: string): number => {
  const date = parseDate(dateStr);
  if (!date) return 0;
  return date.endOf("month").date();
};

/**
 * 날짜에 개월 추가하고 YYYYMM 형식으로 반환
 */
const addMonthToYYYYMM = (dateStr: string, months: number): string => {
  const date = parseDate(dateStr);
  if (!date) return dateStr.substring(0, 6);
  return date.add(months, "month").format("YYYYMM");
};

interface AdvpayCtDtaCreatState {
  // 상태
  searchData: AdvpayCtDtaCreatSearchResponse[];
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: AdvpayCtDtaCreatSearchRequest | null; // 마지막 검색 조건 저장
  isCall: "Y" | "N"; // 신규자료검색 데이터만 생성(저장)하기 위한 구분 값

  // 액션
  setSearchData: (data: AdvpayCtDtaCreatSearchResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  setIsCall: (isCall: "Y" | "N") => void;
  search: (searchRequest: AdvpayCtDtaCreatSearchRequest) => Promise<void>;
  newSearch: (searchRequest: AdvpayCtDtaCreatSearchRequest) => Promise<void>; // 신규자료검색
  saveData: () => Promise<void>;
  deleteData: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useAdvpayCtDtaCreatStore = create<AdvpayCtDtaCreatState>(
  (set, get) => ({
    // 초기 상태
    searchData: [],
    loading: false,
    gridApi: null,
    lastSearchRequest: null,
    isCall: "N", // 초기값은 "N"

    // 상태 설정 액션
    setSearchData: (data) => set({ searchData: data }),
    setLoading: (loading) => set({ loading }),
    setGridApi: (api) => set({ gridApi: api }),
    setIsCall: (isCall) => set({ isCall }),


    // 조회 액션
    search: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await selectAdvpayCtDtaCreatList(searchRequest);

        if (response.success && response.data) {
          set({
            searchData: response.data,
            lastSearchRequest: searchRequest,
            isCall: "N", // 일반 검색 후 isCall을 "N"으로 설정
          });
          message.success(`조회 완료: ${response.data.length}건`);
        } else {
          message.error(response.message || "조회에 실패했습니다.");
          set({ searchData: [], isCall: "N" });
        }
      } catch (error) {
        message.error("조회 중 오류가 발생했습니다.");
        set({ searchData: [] });
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
          console.error("조회 데이터:", state.searchData);
        }
      } finally {
        set({ loading: false });
      }
    },

    // 신규자료검색 액션
    newSearch: async (searchRequest) => {
      const state = get();
      if (state.loading) return;

      set({ loading: true });

      try {
        const response = await selectNewAdvpayCtDtaCreatList(searchRequest);

        if (response.success && response.data) {
          if (response.data.length === 0) {
            message.warning("해당 자료가 존재하지 않습니다.");
            set({ searchData: [], isCall: "N" });
            return;
          }
          set({
            searchData: response.data,
            lastSearchRequest: searchRequest,
            isCall: "Y", // 신규자료검색 후 isCall을 "Y"로 설정
          });
          message.success(`신규자료검색 완료: ${response.data.length}건`);
        } else {
          message.error(response.message || "신규자료검색에 실패했습니다.");
          set({ searchData: [], isCall: "N" });
        }
      } catch (error) {
        message.error("신규자료검색 중 오류가 발생했습니다.");
        set({ searchData: [] });
        if (import.meta.env.DEV) {
          console.error("신규자료검색 실패:", error);
        }
      } finally {
        set({ loading: false });
      }
    },

    // 저장 액션
    saveData: async () => {
      const state = get();

      // isCall이 "N"이면 경고 메시지
      if (state.isCall === "N") {
        showWarning("신규자료검색 후 저장 바랍니다.");
        return;
      }

      if (!state.gridApi) {
        message.warning("그리드 정보를 찾을 수 없습니다.");
        return;
      }

      // 체크된 행 확인
      const selectedRows: AdvpayCtDtaCreatSearchResponse[] = [];
      state.gridApi.forEachNode((node) => {
        if (node.data && node.data.chk === "Y") {
          selectedRows.push(node.data);
          console.log("selectedRows:", node.data);
        }
      });

      if (selectedRows.length === 0) {
        message.warning("체크된 데이터가 없습니다.");
        return;
      }

      const currentData = state.searchData;
      if (currentData.length === 0) {
        message.warning("저장 할 데이터가 없습니다.");
        return;
      }

      // Confirm 후 저장 처리
      confirm({
        title: "확인",
        content: "데이터를 저장 하시겠습니까?",
        okText: "확인",
        cancelText: "취소",
        onOk: async () => {
          set({ loading: true });

          try {
            // 웹스퀘어 로직: chk == "Y" && creationYn == "Y" && modified == "N"인 행만 저장
            const rowsToSave = currentData.filter((row) => {
              const chk = row.chk || "N";
              const creationYn = row.creationYn || "N";
              const modified = row.modified || "N";
              return chk === "Y" && creationYn === "Y" && modified === "N";
            });
            console.log("[DEBUG] rowsToSave:", rowsToSave);

            if (rowsToSave.length === 0) {
              message.warning("저장할 데이터가 없습니다.");
              return;
            }

            const detailList: AdvpayCtDtaCreatDetailData[] = [];
            const invoiceLineList: AdvpayCtDtaCreatInvoiceLineData[] = [];

            // 기준통화 정보 (첫 번째 행에서 가져오거나 기본값)
            const firstRow = rowsToSave[0];
            const gCurr = firstRow.gCurr || "KRW";
            const gCurrDeci = parseInt(firstRow.gCurrDeci || "0", 10);
            const eCurrDeci = parseInt(firstRow.eCurrDeci || "2", 10);

            // 각 행에 대해 월별 데이터 생성
            for (const row of rowsToSave) {
              const chk = row.chk || "N";
              const creationYn = row.creationYn || "N";
              const modified = row.modified || "N";

              if (chk === "Y" && creationYn === "Y" && modified === "N") {
                const occurDate = row.occurDate || "";
                const maturDate = row.maturDate || "";
                const startDate = occurDate; // 시작일 (OCCUR_DATE)
                const endDate = maturDate; // 종료일 (MATUR_DATE)

                if (!startDate || !endDate || startDate.length !== 8 || endDate.length !== 8) {
                  console.warn("날짜 형식이 올바르지 않습니다:", { startDate, endDate });
                  continue;
                }

                // 날짜 계산
                const totDays = getDaysDiff(startDate, endDate); // 기간의 총날짜 수
                const months = getMonthsDiff(startDate, endDate); // 개월 수 (정산 개월)

                // 개시일 첫달 일 수 계산
                const startMonEndDate = parseDate(startDate)?.endOf("month");
                const startMonEndDateStr = startMonEndDate?.format("YYYYMMDD") || "";
                const curMonDays = getDaysDiff(startDate, startMonEndDateStr); // 첫달 일수

                // 금액 정보
                const occurAmt = parseFloat(String(row.occurAmt || 0));
                const frgnCurrAmt = parseFloat(String(row.frgnCurrAmt || 0));
                const monthly = row.attribute3 || "N"; // 월할여부

                // 잔액 추적 변수
                let remainAmt = occurAmt;
                let frgnRemainAmt = frgnCurrAmt;

                // 월별 데이터 생성
                for (let ii = 0; ii < months; ii++) {
                  const applyYm = addMonthToYYYYMM(startDate, ii); // 정산월 (YYYYMM)

                  // 월할계산
                  let monthAmt = 0;
                  let monthForeAmt = 0;

                  if (monthly === "Y") {
                    // 월할: 총금액 / 월수
                    monthAmt = parseFloat((occurAmt / months).toFixed(gCurrDeci));
                    monthForeAmt = parseFloat((frgnCurrAmt / months).toFixed(eCurrDeci));
                  } else {
                    // 일할: 첫달 = 총금액 / 총일수 * 첫달일수, 이후 = 총금액 / 총일수 * 해당월일수
                    if (ii === 0) {
                      monthAmt = parseFloat(((occurAmt / totDays) * curMonDays).toFixed(gCurrDeci));
                      monthForeAmt = parseFloat(((frgnCurrAmt / totDays) * curMonDays).toFixed(eCurrDeci));
                    } else {
                      const monDays = getLastDayOfMonth(applyYm + "01"); // 해당 월의 일수
                      monthAmt = parseFloat(((occurAmt / totDays) * monDays).toFixed(gCurrDeci));
                      monthForeAmt = parseFloat(((frgnCurrAmt / totDays) * monDays).toFixed(eCurrDeci));
                    }
                  }

                  // 잔액 조정 (웹스퀘어 로직)
                  if (remainAmt > 0) {
                    if (remainAmt > monthAmt) {
                      remainAmt = remainAmt - monthAmt;
                    } else {
                      monthAmt = remainAmt;
                      remainAmt = 0;
                    }
                  } else {
                    if (Math.abs(remainAmt) > Math.abs(monthAmt)) {
                      remainAmt = remainAmt - monthAmt;
                    } else {
                      monthAmt = remainAmt;
                      remainAmt = 0;
                    }
                  }

                  // 외화 잔액 조정 (기준통화와 다른 경우)
                  if (row.currency !== gCurr) {
                    if (frgnRemainAmt > monthForeAmt) {
                      frgnRemainAmt = frgnRemainAmt - monthForeAmt;
                    } else {
                      monthForeAmt = frgnRemainAmt;
                      frgnRemainAmt = 0;
                    }
                  }

                  // detailList 항목 추가
                  detailList.push({
                    officeId: row.officeId,
                    orgId: row.orgId,
                    mkDeptPayCertf: row.mkDeptPayCertf,
                    mkDatePayCertf: row.mkDatePayCertf,
                    serPayCertf: row.serPayCertf,
                    seqPayCertf: row.seqPayCertf,
                    applyYm: applyYm,
                    occurAmt: row.occurAmt,
                    frgnCurrAmt: frgnCurrAmt,
                    monthAmt: monthAmt,
                    monthForeAmt: monthForeAmt,
                    occurDate: row.occurDate,
                    maturDate: row.maturDate,
                    fromAccount: row.fromAccount,
                    toAccount: row.toAccount,
                    fromDept: row.fromDept,
                    toDept: row.toDept,
                    supplier: row.supplier,
                    attribute1: row.attribute1,
                    attribute3: row.attribute3,
                    numberTimes: row.numberTimes,
                    costCenter: row.costCenter,
                    dvs: row.dvs,
                    invoiceId: row.invoiceId,
                    invoiceLineId: row.invoiceLineId,
                    currency: row.currency,
                    rowStatus: "C", // 신규 저장이므로 "C"
                  });

                  // 잔액이 0이면 루프 종료
                  if (remainAmt === 0) {
                    break;
                  }
                }

                // InvoiceLineId 업데이트 (prepaidExp = "Y")
                if (row.invoiceLineId) {
                  invoiceLineList.push({
                    invoiceLineId: row.invoiceLineId,
                    prepaidExp: "Y",
                    rowStatus: "U",
                  });
                }
              }
            }

            if (detailList.length === 0) {
              message.warning("저장할 데이터가 없습니다.");
              return;
            }

            const saveRequest: AdvpayCtDtaCreatSaveRequest = {
              detailList: detailList,
              invoiceLineList: invoiceLineList.length > 0 ? invoiceLineList : undefined,
            };

            const response = await saveAdvpayCtDtaCreat(saveRequest);

            if (response.success) {
              message.success("저장되었습니다.");
              // 저장 후 재조회
              if (state.lastSearchRequest) {
                await get().search(state.lastSearchRequest);
              }
            } else {
              message.error(response.message || "저장에 실패했습니다.");
            }
          } catch (error) {
            console.error("저장 실패:", error);
            message.error("저장 중 오류가 발생했습니다.");
          } finally {
            set({ loading: false });
          }
        },
      });
    },

    // 삭제 액션
    deleteData: async () => {
      const state = get();

      // isCall이 "Y"이면 경고 메시지
      if (state.isCall === "Y") {
        showWarning("신규로 검색한 자료는 삭제 대상이 아닙니다. 검색 후 삭제 할 데이터 선택 바랍니다.");
        return;
      }

      if (!state.gridApi) {
        message.warning("그리드 정보를 찾을 수 없습니다.");
        return;
      }

      // 선택된 행 확인 (포커스를 준 행)
      const selectedRows = state.gridApi.getSelectedRows() as AdvpayCtDtaCreatSearchResponse[];

      if (selectedRows.length === 0) {
        message.warning("선택된 데이터가 없습니다.");
        return;
      }

      const currentData = state.searchData;
      if (currentData.length === 0) {
        message.warning("삭제 할 데이터가 없습니다.");
        return;
      }
      // ✅ WebSquare 규칙: MODIFIED=Y는 삭제 불가
      const targets = selectedRows.filter((r) => r.modified !== "Y");
      
      if (targets.length === 0) {
        showWarning("이관된 자료는 삭제 할 수 없습니다.");
        return;
      }

      // if (blocked.length > 0) {
      //   console.log("이관된 자료:", blocked.map((r) => r.modified));

      //   showWarning("이관된 자료는 삭제 할 수 없습니다.");
      //   return;
      // }

      // Confirm 후 삭제 처리
      confirm({
        title: "확인",
        content: "삭제 하시겠습니까?",
        okText: "확인",
        cancelText: "취소",
        onOk: async () => {
          set({ loading: true });

          try {
            const headerList: AdvpayCtDtaCreatHeaderData[] = targets
            .filter((r) => !!r.invoiceLineId)
            .map((r) => ({
              rowStatus: "D",
              prepaidExp : "N",
              officeId: r.officeId,
              invoiceLineId: r.invoiceLineId,
            }));
            console.log("[DEBUG] headerList:", headerList);
            
            // 삭제 요청 데이터 구성
            const detailList: AdvpayCtDtaCreatDetailData[] = targets
              .filter((r) => !!r.invoiceLineId)
              .map((r) => ({
                rowStatus: "D",
                officeId: r.officeId,
                invoiceLineId: r.invoiceLineId,
              }));
              console.log("[DEBUG] detailList:", detailList);
            if (detailList.length === 0) {
              message.warning("삭제 대상 데이터가 올바르지 않습니다.");
              return;
            }

            const invoiceLineList: AdvpayCtDtaCreatInvoiceLineData[] = targets
              .filter((r) => !!r.invoiceLineId)
              .map((r) => ({
                rowStatus: "U",
                invoiceLineId: r.invoiceLineId,
                prepaidExp: "N",
              }));
              console.log("[DEBUG] invoiceLineList:", invoiceLineList);

            const deleteRequest: AdvpayCtDtaCreatSaveRequest = {
              headerList: headerList,
              detailList: detailList,
              //invoiceLineList: invoiceLineList.length > 0 ? invoiceLineList : undefined,
              invoiceLineList: invoiceLineList.length ? invoiceLineList : undefined,
            };

            const response = await deleteAdvpayCtDtaCreat(deleteRequest);

            if (response.success) {
              message.success("삭제되었습니다.");
              // 삭제 후 재조회
              if (state.lastSearchRequest) {
                await get().search(state.lastSearchRequest);
              }
            } else {
              message.error(response.message || "삭제에 실패했습니다.");
            }
          } catch (error) {
            console.error("삭제 실패:", error);
            message.error("삭제 중 오류가 발생했습니다.");
          } finally {
            set({ loading: false });
          }
        },
      });
    },

    // 재조회 액션 (마지막 검색 조건으로 다시 조회)
    refresh: async () => {
      const state = get();
      if (state.lastSearchRequest) {
        await get().search(state.lastSearchRequest);
      } else {
        message.warning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
      }
    },

    // 초기화 액션
    reset: () =>
      set({
        searchData: [],
        loading: false,
        gridApi: null,
        lastSearchRequest: null,
        isCall: "N",
      }),
  })
);

