import { create } from "zustand";
import dayjs from "dayjs";
import {
  selectSlipRegistList,
  selectHderList,
  selectDetailList,
  saveHderDetail,
  deleteHderDetail,
  saveCopyHderDetail,
  selectConfmList,
  cancelConfm,
  selectSerialNumber,
  createSlipHderId,
} from "@/apis/fcm/gl/slip/SlipRegist/SlipRegist";
import type {
  SlipRegistSrchRequest,
  SlipRegistListResponse,
  SlipRegistHderResponse,
  SlipRegistDetailResponse,
  SlipRegistSaveRequest,
  SlipRegistConfmRequest,
} from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import { showSuccess, showError, confirm } from "@components/ui/feedback/Message";
import { useAuthStore } from "@/store/authStore";

interface SlipRegistState {
  // 상태
  slipList: SlipRegistListResponse[];
  selectedSlipId: string | null;
  slipHeader: SlipRegistHderResponse | null;
  slipDetails: SlipRegistDetailResponse[];
  loading: boolean;
  searchParams: SlipRegistSrchRequest | null;
  editingSlipId: string | null;
  isNewSlip: boolean;

  // 액션
  setSlipList: (list: SlipRegistListResponse[]) => void;
  setSelectedSlipId: (id: string | null) => void;
  setSlipHeader: (header: SlipRegistHderResponse | null) => void;
  setSlipDetails: (details: SlipRegistDetailResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchParams: (params: SlipRegistSrchRequest | null) => void;
  setEditingSlipId: (id: string | null) => void;
  setIsNewSlip: (isNew: boolean) => void;
  
  // 비즈니스 로직 액션
  handleSelectSlip: (
    slpHeaderId: string,
    searchParamsOverride?: SlipRegistSrchRequest | null
  ) => Promise<void>;
  handleSearch: (params: SlipRegistSrchRequest) => Promise<void>;
  validateSlipData: (header: SlipRegistHderResponse | null, details: SlipRegistDetailResponse[]) => boolean;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCopy: () => Promise<void>;
  handleApprove: () => Promise<void>;
  handleCancelApprove: () => Promise<void>;
  handleNew: () => void;
  handleEdit: () => void;
  handleEditClick: () => void;
  handleNewClick: () => void;
  handleSaveClick: () => Promise<void>;
  handleSelectSlipWithEditMode: (id: string) => Promise<void>;
  reset: () => void;
}

export const useSlipRegistStore = create<SlipRegistState>((set, get) => ({
  // 초기 상태
  slipList: [],
  selectedSlipId: null,
  slipHeader: null,
  slipDetails: [],
  loading: false,
  searchParams: null,
  editingSlipId: null,
  isNewSlip: false,

  // 상태 설정 액션
  setSlipList: (list) => set({ slipList: list }),
  setSelectedSlipId: (id) => set({ selectedSlipId: id }),
  setSlipHeader: (header) => set({ slipHeader: header }),
  setSlipDetails: (details) => set({ slipDetails: details }),
  setLoading: (loading) => set({ loading }),
  setSearchParams: (params) => set({ searchParams: params }),
  setEditingSlipId: (id) => set({ editingSlipId: id }),
  setIsNewSlip: (isNew) => set({ isNewSlip: isNew }),

  // 전표 선택 시 헤더/상세 조회
  handleSelectSlip: async (slpHeaderId, _searchParamsOverride) => {
    if (!slpHeaderId) {
      return;
    }
    
    try {
      set({ 
        loading: true, 
        selectedSlipId: slpHeaderId,
        editingSlipId: null,
        isNewSlip: false,
      });

      // 헤더 조회 - slpHeaderId만 전달 (slipReg 예제 참고)
      const headerRequest: SlipRegistSrchRequest = {
        slpHeaderId,
      };
      
      const headerResponse = await selectHderList(headerRequest);
      
      if (headerResponse.success && headerResponse.data) {
        set({ slipHeader: headerResponse.data });
      } else {
        showError(headerResponse.message || "전표 헤더 조회에 실패했습니다.");
        set({ slipHeader: null });
      }

      // 상세 조회
      const detailResponse = await selectDetailList(headerRequest);
      
      if (detailResponse.success && detailResponse.data) {
        // 백엔드 응답의 환율타입 필드(exRateType / exchgRateType) 정규화
        const normalizedDetails = detailResponse.data.map((d: any) => {
          const exchgRateType = d.exchgRateType || d.exRateType || "";
          const exRateType = exchgRateType; // 저장/표시 시 일관성 있게 사용

          return {
            ...d,
            exchgRateType,
            exRateType,
          };
        });
        set({ slipDetails: normalizedDetails });
      } else {
        showError(detailResponse.message || "전표 상세 조회에 실패했습니다.");
        set({ slipDetails: [] });
      }
    } catch (error) {
      showError("전표 조회 중 오류가 발생했습니다.");
      console.error("Select slip error:", error);
      const currentState = get();
      // 신규 모드가 활성화되어 있으면 상태를 덮어쓰지 않음
      if (!currentState.isNewSlip) {
        set({ slipHeader: null, slipDetails: [] });
      }
    } finally {
      const currentState = get();
      // 신규 모드가 활성화되어 있으면 loading만 업데이트하고 다른 상태는 유지
      if (!currentState.isNewSlip) {
        set({ loading: false });
      }
    }
  },

  // 검색 및 목록 조회
  handleSearch: async (params) => {
    try {
      set({ loading: true, searchParams: params });
      
      const response = await selectSlipRegistList(params);
      
      if (response.success && response.data) {
        set({ slipList: response.data });
        
        // 검색 후 첫 번째 항목이 있으면 자동 선택
        if (response.data.length > 0) {
          const firstId = response.data[0].slpHeaderId;
          
          if (firstId) {
            // 최신 params를 직접 전달하여 이전 searchParams 사용 방지
            await get().handleSelectSlip(firstId, params);
          }
        } else {
          set({ 
            selectedSlipId: null,
            slipHeader: null,
            slipDetails: []
          });
        }
      } else {
        showError(response.message || "전표 목록 조회에 실패했습니다.");
        set({ slipList: [] });
      }
    } catch (error) {
      showError("전표 목록 조회 중 오류가 발생했습니다.");
      set({ slipList: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 유효성 검증 함수
  validateSlipData: (header: SlipRegistHderResponse | null, details: SlipRegistDetailResponse[]): boolean => {
    // 헤더 검증
    if (!header) {
      showError("저장할 전표가 없습니다.");
      return false;
    }

    // 대표적요 필수 입력 체크
    if (!header.description || header.description.trim() === "") {
      showError("대표적요를 입력하세요!");
      return false;
    }

    // 상세 목록 검증
    if (!details || details.length === 0) {
      showError("상세 내역이 없습니다.");
      return false;
    }

    let totalDrAmt = 0;
    let totalCrAmt = 0;

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      const rowNum = i + 1;

      // 계정코드 필수 입력 체크
      if (!detail.accCode || detail.accCode.trim() === "") {
        showError(`${rowNum}번째 행에 계정코드를 입력 하세요`);
        return false;
      }

      // 관리항목1 체크
      if (detail.accMgmtNbr1Opt === "1" && detail.accMgmtNbr1Type && detail.accMgmtNbr1Type !== "00") {
        if (!detail.accMgmtNbr1 || detail.accMgmtNbr1.trim() === "") {
          showError(`${rowNum}번째 행에 계정코드를 더블클릭하여 관리항목을 입력 하세요`);
          return false;
        }
      }

      // 관리항목2 체크
      if (detail.accMgmtNbr2Opt === "1" && detail.accMgmtNbr2Type && detail.accMgmtNbr2Type !== "00") {
        if (!detail.accMgmtNbr2 || detail.accMgmtNbr2.trim() === "") {
          showError(`${rowNum}번째 행에 계정코드를 더블클릭하여 관리항목을 입력 하세요`);
          return false;
        }
      }

      // 차변/대변 금액 체크
      const drAmt = parseFloat(detail.drAmt || "0");
      const crAmt = parseFloat(detail.crAmt || "0");
      if (drAmt === 0 && crAmt === 0) {
        showError(`${rowNum}번째 행에 계정해당금액을 입력해 주십시요!`);
        return false;
      }

      totalDrAmt += drAmt;
      totalCrAmt += crAmt;

      // 화폐단위 필수 입력 체크
      if (!detail.curr || detail.curr.trim() === "") {
        showError(`${rowNum}번째 행에 화폐단위를 입력하세요!`);
        return false;
      }

      // 환율 검증
      const exchgRate = parseFloat(detail.exchgRate || "1");
      if (detail.curr === "KRW") {
        // 원화인 경우 환율은 반드시 1
        if (exchgRate !== 1) {
          showError("원화는 환율 1만 가능합니다.");
          return false;
        }

        // 원화인 경우 입력금액과 환산금액이 동일해야 함
        const drRelAmt = parseFloat(detail.drRelAmt || "0");
        const crRelAmt = parseFloat(detail.crRelAmt || "0");
        if (drAmt > 0 && drAmt !== drRelAmt) {
          showError("원화는 입력금액과 환산금액이 동일해야 합니다.");
          return false;
        }
        if (crAmt > 0 && crAmt !== crRelAmt) {
          showError("원화는 입력금액과 환산금액이 동일해야 합니다.");
          return false;
        }
      }

      // 부서 필수 입력 체크
      if (!detail.pssnDept || detail.pssnDept.trim() === "") {
        showError(`${rowNum}번째 행에 부서를 입력해 주십시요.`);
        return false;
      }

      // 거래처 체크 (거래처코드 필수)
      if (!detail.accMgmtNbr3 || detail.accMgmtNbr3.trim() === "") {
        showError(`${rowNum}번째 행에 거래처 코드를 입력 하세요.`);
        return false;
      }
    }

    // 차변/대변 합계 검증
    if (totalDrAmt !== totalCrAmt) {
      showError("차변/대변 합계가 불일치합니다!");
      return false;
    }

    return true;
  },

  // 저장
  handleSave: async () => {
    const state = get();
    
    if (!state.slipHeader) {
      showError("저장할 전표 정보가 없습니다.");
      return;
    }

    // 행추가한 그리드가 없으면 에러
    if (!state.slipDetails || state.slipDetails.length === 0) {
      showError("저장할 데이터가 없습니다.");
      return;
    }

    try {
      set({ loading: true });
      
      // 사용자 정보 가져오기
      const user = useAuthStore.getState().user;
      
      // 신규 전표 여부 확인
      const isNewSlip = !state.selectedSlipId;
      
      // BLT_OFFICE_ID, BLT_DEPT_ACK_SLP, BLT_DATE_ACK_SLP 설정
      let officeId = state.slipHeader.bltOfficeId || state.searchParams?.asRpsnOffice || user?.officeId || "";
      let bltDeptAckSlp = state.slipHeader.bltDeptAckSlp || "MSD";
      let bltDateAckSlp = state.slipHeader.bltDateAckSlp || dayjs().format("YYYYMMDD");
      let serAckSlp = state.slipHeader.serAckSlp || "";
      let slpHeaderId = state.slipHeader.slpHeaderId || "";
      
      // 신규 전표이고 필수 값이 없으면 생성
      if (isNewSlip) {
        // slpHeaderId가 없으면 생성
        if (!slpHeaderId) {
          const headerIdResponse = await createSlipHderId({} as SlipRegistSrchRequest);
          if (headerIdResponse.success && headerIdResponse.data?.slpHeaderId) {
            slpHeaderId = headerIdResponse.data.slpHeaderId;
            // 헤더 상태 업데이트
            state.slipHeader.slpHeaderId = slpHeaderId;
          } else {
            showError("전표 헤더 ID 생성에 실패했습니다.");
            return;
          }
        }
        
        // serAckSlp가 없으면 일련번호 조회
        if (!serAckSlp) {
          const serialResponse = await selectSerialNumber({
            asBltDate: bltDateAckSlp,
            asRpsnOffice: officeId,
          } as SlipRegistSrchRequest);
          
          if (serialResponse.success && serialResponse.data?.serAckSlp) {
            serAckSlp = serialResponse.data.serAckSlp;
            // 헤더 상태 업데이트
            state.slipHeader.serAckSlp = serAckSlp;
            // selectSerialNumber 응답에서 다른 값들도 업데이트
            if (serialResponse.data.bltOfficeId) {
              officeId = serialResponse.data.bltOfficeId;
              state.slipHeader.bltOfficeId = officeId;
            }
            if (serialResponse.data.bltDeptAckSlp) {
              bltDeptAckSlp = serialResponse.data.bltDeptAckSlp;
              state.slipHeader.bltDeptAckSlp = bltDeptAckSlp;
            }
            if (serialResponse.data.bltDateAckSlp) {
              bltDateAckSlp = serialResponse.data.bltDateAckSlp;
              state.slipHeader.bltDateAckSlp = bltDateAckSlp;
            }
          } else {
            showError("일련번호 생성에 실패했습니다.");
            return;
          }
        }
      }
      
      // 최종 값 확인 및 설정
      if (!officeId) {
        officeId = user?.officeId || state.searchParams?.asRpsnOffice || "";
      }
      if (!bltDeptAckSlp) {
        bltDeptAckSlp = "MSD";
      }
      if (!bltDateAckSlp) {
        bltDateAckSlp = dayjs().format("YYYYMMDD");
      }
      
      const saveRequest: SlipRegistSaveRequest = {
        header: (() => {
          // 상세 금액 합계 계산 (차변/대변 동일 가정)
          let totalDrAmt = 0;
          let totalCrAmt = 0;
          state.slipDetails.forEach((d) => {
            totalDrAmt += parseFloat(d.drAmt || "0");
            totalCrAmt += parseFloat(d.crAmt || "0");
          });

          return {
            ...state.slipHeader,
            slpHeaderId: slpHeaderId || undefined,
            bltOfficeId: officeId,
            bltDeptAckSlp: bltDeptAckSlp,
            bltDateAckSlp: bltDateAckSlp,
            serAckSlp: serAckSlp,
            makeDept: state.slipHeader.makeDept || user?.deptCode || "",
            slipType: state.slipHeader.slipType || "M",
            description: state.slipHeader.description || "",
            sumTotAmt: state.slipHeader.sumTotAmt || totalDrAmt.toString(),
            crDbCnt: state.slipDetails.length.toString(),
            firstInput: state.slipHeader.firstInput || user?.empCode || "",
            udateFrq: state.slipHeader.udateFrq || "1",
            ackPer: state.slipHeader.ackPer || "",
            ackDate: state.slipHeader.ackDate || "",
            ackSeq: state.slipHeader.ackSeq || "",
            exptnTgt: state.slipHeader.exptnTgt || "N",
            slipExptnSrc: state.slipHeader.slipExptnSrc || "",
            mkOfficeId: state.slipHeader.mkOfficeId || "",
            mkDeptActCertf: state.slipHeader.mkDeptActCertf || "",
            mkDateActCertf: state.slipHeader.mkDateActCertf || "",
            serActCertf: state.slipHeader.serActCertf || "",
            orgId: state.slipHeader.orgId || "",
            userId: state.slipHeader.userId || user?.empCode || "",
            wrkDate: state.slipHeader.wrkDate || dayjs().format("YYYYMMDD"),
            curUnit: state.slipHeader.curUnit || "KRW",
            exchgRateType: state.slipHeader.exchgRateType || "",
            exchgRate: state.slipHeader.exchgRate || "1",
            bankCode: state.slipHeader.bankCode || "",
            bankAccount: state.slipHeader.bankAccount || "",
            reference1: state.slipHeader.reference1 || "",
            reference2: state.slipHeader.reference2 || "",
            reference3: state.slipHeader.reference3 || "",
            reference4: state.slipHeader.reference4 || "",
            reference5: state.slipHeader.reference5 || "",
            reference6: (state.slipHeader as any)?.reference6 || "",
            reference7: (state.slipHeader as any)?.reference7 || "",
            reference8: (state.slipHeader as any)?.reference8 || "",
            reference9: (state.slipHeader as any)?.reference9 || "",
            reference10: state.slipHeader.reference10 || "",
            sourceTable: state.slipHeader.sourceTable || state.slipHeader.srcTblNme || "",
            keyFieldNames: state.slipHeader.keyFieldNames || "",
            keyDataType: state.slipHeader.keyDataType || "",
            keyValue: state.slipHeader.keyValue || state.slipHeader.sourceKey || "",
            accMgmtNbr2: (state.slipHeader as any)?.accMgmtNbr2 || "",
            accMgmtNbr2Type: (state.slipHeader as any)?.accMgmtNbr2Type || "",
            cashFlowCode: state.slipHeader.cashFlowCode || "",
            dvs: state.slipHeader.dvs || "",
            attribute1: (state.slipHeader as any)?.attribute1 || "",
            attribute2: (state.slipHeader as any)?.attribute2 || "",
            attribute3: (state.slipHeader as any)?.attribute3 || "",
            attribute4: (state.slipHeader as any)?.attribute4 || "",
            attribute5: (state.slipHeader as any)?.attribute5 || "",
            attribute6: (state.slipHeader as any)?.attribute6 || "",
            attribute7: (state.slipHeader as any)?.attribute7 || "",
            attribute8: state.slipHeader.attribute8 || "",
            attribute9: (state.slipHeader as any)?.attribute9 || "",
            attribute10: state.slipHeader.attribute10 || "",
            eatKey: state.slipHeader.eatKey || "",
            docId: state.slipHeader.docId || "",
            appSeq: state.slipHeader.appSeq || "",
            rowStatus: isNewSlip ? "C" : "U",
          } as any;
        })(),
        detailList: state.slipDetails.map((detail, index) => {
          const drAmt = parseFloat(detail.drAmt || "0");
          const crAmt = parseFloat(detail.crAmt || "0");
          // 차변금액이 있으면 "D", 대변금액이 있으면 "C", 둘 다 없으면 빈 문자열
          const drCrType = drAmt > 0 ? "D" : (crAmt > 0 ? "C" : "");
          const occurAmt = drAmt > 0 ? drAmt.toString() : (crAmt > 0 ? crAmt.toString() : "0");

          return {
            ...detail,
            slpHeaderId: slpHeaderId || undefined,
            bltOfficeId: officeId,
            bltDeptAckSlp: bltDeptAckSlp,
            bltDateAckSlp: bltDateAckSlp,
            serAckSlp: serAckSlp,
            seqAckSlp: (index + 1).toString(),
            drCrType: drCrType || (drAmt > 0 ? "D" : (crAmt > 0 ? "C" : "")),
            makeDept: detail.makeDept || state.slipHeader?.makeDept || user?.deptCode || "",
            slipType: detail.slipType || state.slipHeader?.slipType || "M",
            exptnTgt: detail.exptnTgt || state.slipHeader?.exptnTgt || "N",
            slipExptnSrc: detail.slipExptnSrc || state.slipHeader?.slipExptnSrc || "",
            orgId: detail.orgId || state.slipHeader?.orgId || "",
            userId: detail.userId || state.slipHeader?.userId || user?.empCode || "",
            ackSeq: detail.ackSeq || state.slipHeader?.ackSeq || "",
            accCode: detail.accCode || "",
            bdgtCode: detail.bdgtCode || "",
            occurAmt: occurAmt || (drAmt > 0 ? drAmt.toString() : (crAmt > 0 ? crAmt.toString() : "0")),
            rem: detail.rem || "",
            dvs: detail.dvs || state.slipHeader?.dvs || "",
            pssnDept: detail.pssnDept || "",
            accMgmtNbr1Type: detail.accMgmtNbr1Type || "",
            accMgmtNbr1: detail.accMgmtNbr1 || "",
            accMgmtNbr2Type: detail.accMgmtNbr2Type || "",
            accMgmtNbr2: detail.accMgmtNbr2 || "",
            accMgmtNbr3Type: detail.accMgmtNbr3Type || "",
            accMgmtNbr3: detail.accMgmtNbr3 || "",
            fundIcmExpnCde: detail.fundIcmExpnCde || "",
            occurDate: detail.occurDate || "",
            maturDate: detail.maturDate || "",
            unit: detail.unit || "",
            exchgRate: (detail.exchgRate && detail.exchgRate.trim() !== "") ? detail.exchgRate : "1",
            accRelAmt: detail.accRelAmt || "",
            vatWthTaxType: detail.vatWthTaxType || "",
            entExpnYn: detail.entExpnYn || "",
            cstInclsYn: detail.cstInclsYn || "",
            costCode: detail.costCode || "",
            finGdsGrpCode: detail.finGdsGrpCode || "",
            cashFlowCode: detail.cashFlowCode || state.slipHeader?.cashFlowCode || "",
            trReDept: detail.trReDept || "",
            trReType: detail.trReType || "",
            sendYn: detail.sendYn || "",
            bltOfficeIdTrr: detail.bltOfficeIdTrr || "",
            bltDeptTrrSlp: detail.bltDeptTrrSlp || "",
            bltDateTrrSlp: detail.bltDateTrrSlp || "",
            serTrrSlp: detail.serTrrSlp || "",
            seqTrrSlp: detail.seqTrrSlp || "",
            mkOfficeId: detail.mkOfficeId || state.slipHeader?.mkOfficeId || "",
            mkDeptActCertf: detail.mkDeptActCertf || state.slipHeader?.mkDeptActCertf || "",
            mkDateActCertf: detail.mkDateActCertf || state.slipHeader?.mkDateActCertf || "",
            serActCertf: detail.serActCertf || state.slipHeader?.serActCertf || "",
            seqActCertf: detail.seqActCertf || "",
            fixAssRgstYn: detail.fixAssRgstYn || "",
            projectCode: detail.projectCode || "",
            itemCode: detail.itemCode || "",
            channel1: detail.channel1 || "",
            channel2: detail.channel2 || "",
            channel3: detail.channel3 || "",
            itemSegment1: detail.itemSegment1 || "",
            itemSegment2: detail.itemSegment2 || "",
            itemSegment3: detail.itemSegment3 || "",
            curr: detail.curr || "KRW",
            occurAmtFr: detail.occurAmtFr || occurAmt,
            exRateType: (detail.exchgRateType && detail.exchgRateType.trim() !== "") ? detail.exchgRateType : "",
            taxType: detail.taxType || "",
            intRate: detail.intRate || "",
            paymentApplySeq: detail.paymentApplySeq || "",
            fromSource: detail.fromSource || "",
            attribute1: detail.attribute1 || "",
            attribute2: detail.attribute2 || "",
            attribute3: detail.attribute3 || "",
            attribute4: detail.attribute4 || "",
            attribute5: detail.attribute5 || "",
            createdBy: user?.empCode || "",
            lastUpdatedBy: user?.empCode || "",
            programId: state.slipHeader?.programId || "",
            terminalId: state.slipHeader?.terminalId || "",
            rowStatus: isNewSlip ? "C" : detail.slpHeaderId ? "U" : "C",
          } as any;
        }) as any[],
      };

      const response = await saveHderDetail(saveRequest);
      
      if (response.success) {
        showSuccess("전표가 저장되었습니다.");
        // 편집 모드 해제
        set({ editingSlipId: null, isNewSlip: false });
        // 저장 후 목록 새로고침
        if (state.searchParams) {
          await get().handleSearch(state.searchParams);
        }
      } else {
        showError(response.message || "전표 저장에 실패했습니다.");
      }
    } catch (error) {
      showError("전표 저장 중 오류가 발생했습니다.");
      console.error("Save error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 삭제
  handleDelete: async () => {
    const state = get();
    
    if (!state.slipHeader || !state.selectedSlipId) {
      showError("삭제할 전표가 선택되지 않았습니다.");
      return;
    }

    confirm({
      title: "삭제 확인",
      content: "전표를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.",
      okText: "삭제",
      cancelText: "취소",
      onOk: async () => {
        try {
          set({ loading: true });
          
          const deleteRequest: SlipRegistSaveRequest = {
            header: {
              ...state.slipHeader,
              rowStatus: "D",
            } as any,
            detailList: state.slipDetails.map((detail) => ({
              ...detail,
              rowStatus: "D",
            })) as any[],
          };

          const response = await deleteHderDetail(deleteRequest);
          
          if (response.success) {
            showSuccess("전표가 삭제되었습니다.");
            // 삭제 후 목록 새로고침 및 선택 해제
            set({ 
              selectedSlipId: null,
              slipHeader: null,
              slipDetails: []
            });
            if (state.searchParams) {
              await get().handleSearch(state.searchParams);
            }
          } else {
            showError(response.message || "전표 삭제에 실패했습니다.");
          }
        } catch (error) {
          showError("전표 삭제 중 오류가 발생했습니다.");
          console.error("Delete error:", error);
        } finally {
          set({ loading: false });
        }
      },
    });
  },

  // 복사
  handleCopy: async () => {
    const state = get();
    
    if (!state.slipHeader) {
      showError("복사할 전표 정보가 없습니다.");
      return;
    }

    try {
      set({ loading: true });
      
      const copyRequest: SlipRegistSaveRequest = {
        header: {
          ...state.slipHeader,
          slpHeaderId: undefined,
          rowStatus: "C",
        } as any,
        detailList: state.slipDetails.map((detail) => ({
          ...detail,
          slpHeaderId: undefined,
          rowStatus: "C",
        })) as any[],
      };

      const response = await saveCopyHderDetail(copyRequest);
      
      if (response.success) {
        showSuccess("전표가 복사되었습니다.");
        // 복사 후 목록 새로고침
        if (state.searchParams) {
          await get().handleSearch(state.searchParams);
        }
      } else {
        showError(response.message || "전표 복사에 실패했습니다.");
      }
    } catch (error) {
      showError("전표 복사 중 오류가 발생했습니다.");
      console.error("Copy error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 승인
  handleApprove: async () => {
    const state = get();
    
    if (!state.selectedSlipId || !state.slipHeader) {
      showError("승인할 전표가 선택되지 않았습니다.");
      return;
    }

    try {
      set({ loading: true });
      
      const confmRequest: SlipRegistConfmRequest = {
        slpHeaderId: state.selectedSlipId,
        bltDeptAckSlp: state.slipHeader.bltDeptAckSlp,
        bltDateAckSlp: state.slipHeader.bltDateAckSlp,
        serAckSlp: state.slipHeader.serAckSlp,
      };

      const response = await selectConfmList(confmRequest);
      
      if (response.success && response.data) {
        showSuccess("승인 목록을 조회했습니다.");
        // 승인 후 목록 새로고침
        if (state.searchParams) {
          await get().handleSearch(state.searchParams);
        }
      } else {
        showError(response.message || "승인 처리에 실패했습니다.");
      }
    } catch (error) {
      showError("승인 처리 중 오류가 발생했습니다.");
      console.error("Approve error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 승인 취소
  handleCancelApprove: async () => {
    const state = get();
    
    if (!state.selectedSlipId || !state.slipHeader) {
      showError("승인 취소할 전표가 선택되지 않았습니다.");
      return;
    }

    try {
      set({ loading: true });
      
      const confmRequest: SlipRegistConfmRequest = {
        slpHeaderId: state.selectedSlipId,
        bltDeptAckSlp: state.slipHeader.bltDeptAckSlp,
        bltDateAckSlp: state.slipHeader.bltDateAckSlp,
        serAckSlp: state.slipHeader.serAckSlp,
      };

      const response = await cancelConfm(confmRequest);
      
      if (response.success) {
        showSuccess("승인이 취소되었습니다.");
        // 승인 취소 후 목록 새로고침
        if (state.searchParams) {
          await get().handleSearch(state.searchParams);
        }
      } else {
        showError(response.message || "승인 취소에 실패했습니다.");
      }
    } catch (error) {
      showError("승인 취소 중 오류가 발생했습니다.");
      console.error("Cancel approve error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 신규
  handleNew: () => {
    set({
      selectedSlipId: null,
      slipHeader: null,
      slipDetails: [],
      editingSlipId: null,
      isNewSlip: false,
    });
  },

  // 수정 모드 전환
  handleEdit: () => {
    // 수정 모드는 handleEditClick에서 처리
  },

  // 수정 버튼 클릭 핸들러
  handleEditClick: () => {
    const state = get();
    if (state.selectedSlipId) {
      set({ editingSlipId: state.selectedSlipId, isNewSlip: false });
      get().handleEdit();
    }
  },

  // 신규 버튼 클릭 핸들러
  handleNewClick: async () => {
    try {
      set({ loading: true });
      
      // 사용자 정보 가져오기
      const state = get();
      const user = useAuthStore.getState().user;
      const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
      const currentDateYmd = dayjs().format("YYYYMMDD");
      
      // 1. 전표 헤더 ID 생성
      const headerIdResponse = await createSlipHderId({} as SlipRegistSrchRequest);
      
      if (!headerIdResponse.success || !headerIdResponse.data?.slpHeaderId) {
        showError("전표 헤더 ID 생성에 실패했습니다.");
        return;
      }
      
      const generatedHeaderId = headerIdResponse.data.slpHeaderId;
      
      // 2. 일련번호 조회 (현재 날짜를 전표일자로 전달)
      const officeId = user?.officeId || state.searchParams?.asRpsnOffice || "";
      const serialResponse = await selectSerialNumber({
        asBltDate: currentDateYmd,
        asRpsnOffice: officeId,
      } as SlipRegistSrchRequest);
      
      if (!serialResponse.success || !serialResponse.data) {
        showError("일련번호 조회에 실패했습니다.");
        return;
      }
      
      // 3. 최종 전표 헤더 ID 결정
      const finalSlpHeaderId = serialResponse.data.slpHeaderId || generatedHeaderId;
      
      // 4. 기본값이 설정된 headerData 생성
      const defaultHeader: SlipRegistHderResponse = {
        slpHeaderId: finalSlpHeaderId,
        bltOfficeId: serialResponse.data.bltOfficeId || officeId,
        bltDeptAckSlp: serialResponse.data.bltDeptAckSlp || "MSD",
        bltDateAckSlp: serialResponse.data.bltDateAckSlp || currentDateYmd,
        serAckSlp: serialResponse.data.serAckSlp || "", // selectSerialNumber에서 받아온 값 사용
        makeDept: user?.deptCode || "",
        makerDeptName: user?.deptCode || "",
        makerName: user?.empName || "",
        slipType: "M",
        slipName: "대체전표",
        slipExptnName: "대체전표",
        slipExptnSrc: "M01",
        exptnTgt: "N",
        creationDate: currentDate,
        lastUpdateDate: currentDate,
        description: "",
      };
      
      // 상태를 한 번에 설정하여 다른 비동기 작업의 상태 업데이트를 덮어씀
      // loading도 함께 설정하여 handleSelectSlip의 finally 블록이 덮어쓰지 않도록
      set({
        isNewSlip: true,
        editingSlipId: finalSlpHeaderId, // 생성된 ID로 설정하여 편집 모드 유지
        selectedSlipId: null, // 신규 모드에서는 목록 선택 해제
        slipHeader: defaultHeader,
        slipDetails: [],
        loading: false, // loading도 함께 설정하여 handleSelectSlip의 finally 블록이 덮어쓰지 않도록
      });
    } catch (error) {
      showError("신규 전표 생성 중 오류가 발생했습니다.");
      console.error("Create new slip error:", error);
      set({ loading: false });
    }
  },

  // 저장 버튼 클릭 핸들러 (편집 모드 해제 포함)
  handleSaveClick: async () => {
    const state = get();
    
    // 유효성 검증 먼저 수행
    if (!get().validateSlipData(state.slipHeader, state.slipDetails)) {
      return;
    }

    confirm({
      title: "저장 확인",
      content: "전표를 저장하시겠습니까?",
      okText: "저장",
      cancelText: "취소",
      onOk: async () => {
        await get().handleSave();
      },
    });
  },

  // 전표 선택 시 편집 모드 해제
  handleSelectSlipWithEditMode: async (id: string) => {
    set({ editingSlipId: null, isNewSlip: false });
    await get().handleSelectSlip(id);
  },

  // 초기화
  reset: () => {
    set({
      slipList: [],
      selectedSlipId: null,
      slipHeader: null,
      slipDetails: [],
      loading: false,
      searchParams: null,
      editingSlipId: null,
      isNewSlip: false,
    });
  },
}));

/**
 * 호환성을 위한 커스텀 훅 (기존 코드와의 호환성 유지)
 * Zustand store를 사용하지만 기존 useSlipRegist와 동일한 인터페이스 제공
 */
export const useSlipRegist = () => {
  const store = useSlipRegistStore();
  
  return {
    // 상태
    slipList: store.slipList,
    selectedSlipId: store.selectedSlipId,
    slipHeader: store.slipHeader,
    slipDetails: store.slipDetails,
    loading: store.loading,
    searchParams: store.searchParams,
    editingSlipId: store.editingSlipId,
    isNewSlip: store.isNewSlip,
    // 핸들러
    handleSearch: store.handleSearch,
    handleSelectSlip: store.handleSelectSlip,
    handleSave: store.handleSave,
    handleDelete: store.handleDelete,
    handleCopy: store.handleCopy,
    handleApprove: store.handleApprove,
    handleCancelApprove: store.handleCancelApprove,
    handleNew: store.handleNew,
    handleEdit: store.handleEdit,
    handleEditClick: store.handleEditClick,
    handleNewClick: store.handleNewClick,
    handleSaveClick: store.handleSaveClick,
    handleSelectSlipWithEditMode: store.handleSelectSlipWithEditMode,
    // 상태 업데이트 함수
    setSlipDetails: store.setSlipDetails,
    setSlipHeader: store.setSlipHeader,
    // 초기화 함수
    reset: store.reset,
  };
};

