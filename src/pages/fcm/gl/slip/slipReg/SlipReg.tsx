import React, { useState, useCallback } from "react";
import { FilterPanel, RecordList, DetailView, DetailGrid, Detail } from "@components/features/fcm/gl/slip/slipReg";
import { showSuccess, showError, confirm } from "@components/ui/feedback/Message";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/authStore";
import { Article } from "./SlipReg.styles";
import type {
  SlipSrchRequest,
  SlipListResponse,
  SlipHderResponse,
  SlipDetailResponse,
  SlipSaveRequest,
  SlipHderRequest,
  SlipDetailRequest,
  ConfmRequest,
} from "@/types/fcm/gl/slip/slipRegist.types";
import {
  selectSlipRegistList,
  selectHderList,
  selectDetailList,
  createSlipHderId,
  selectSerialNumber,
  saveHderDetail,
  deleteHderDetail,
  saveCopyHderDetail,
  cancelConfm,
} from "@apis/fcm/gl/slip/slipApi";
import type { SlipMaster, SlipDetail } from "@components/features/fcm/gl/slip/slipReg/mockData";

const SlipReg: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  // 상태 관리
  const [slipList, setSlipList] = useState<SlipListResponse[]>([]);
  const [selectedSlipId, setSelectedSlipId] = useState<string>("");
  const [selectedSlip, setSelectedSlip] = useState<SlipHderResponse | null>(null);
  const [slipDetails, setSlipDetails] = useState<SlipDetailResponse[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [, setLoading] = useState(false);
  const [isNewSlip, setIsNewSlip] = useState(false);
  const [forceEditMode, setForceEditMode] = useState(false);
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<SlipSrchRequest | null>(null);

  // 데이터 변환 함수: SlipHderResponse → SlipMaster
  const convertToSlipMaster = useCallback((header: SlipHderResponse, details: SlipDetailResponse[]): SlipMaster => {
    return {
      id: header.slpHeaderId || "",
      status: header.edimStatusName || "",
      statusColor: header.edimStatusName ? "blue" : "",
      date: header.creationDate || "",
      company: header.makerName || "",
      makeDept: header.makeDept || "",
      deptName: header.deptNme || "",
      userId: header.userId || "",
      makerName: header.makerName || "",
      slipName: header.slipName || "",
      slipExptnName: header.slipExptnName || "",
      dvs: header.dvs || "",
      srcTblName: header.srcTblNme || "",
      sourceKey: header.sourceKey || "",
      glSlipNo: header.glSlipNo || "",
      exptnTgt: header.exptnTgt || "",
      edimStatusName: header.edimStatusName || "",
      creationDate: header.creationDate || "",
      reverseNo: "",
      description: header.description || "",
      closed: "",
      lastUpdateDate: header.lastUpdateDate || "",
      details: convertToSlipDetails(details),
    };
  }, []);

  // 데이터 변환 함수: SlipDetailResponse[] → SlipDetail[]
  const convertToSlipDetails = useCallback((details: SlipDetailResponse[]): SlipDetail[] => {
    return details.map((detail, index) => ({
      status: "",
      seq: index + 1,
      accountCode: detail.accCode || "",
      accountName: detail.accName || "",
      currency: detail.curr || "KRW",
      exchangeRateType: detail.exchgRateType || "",
      exchangeRate: parseFloat(detail.exchgRate || "1"),
      debitAmount: parseFloat(detail.drAmt || "0"),
      creditAmount: parseFloat(detail.crAmt || "0"),
      debitAmountConverted: parseFloat(detail.drAmt || "0"),
      creditAmountConverted: parseFloat(detail.crAmt || "0"),
      description: detail.rem || "",
      dept: detail.pssnDept || "",
      deptName: detail.deptName || "",
      partner: detail.accMgmtNbr3 || "",
      partnerName: detail.custname || "",
      manage1Name: detail.accMgmtNbr1Nme || "",
      manage2Name: detail.accMgmtNbr2Nme || "",
      trialBizArea: detail.dvs || "",
      bizArea: "",
      processCode: detail.costCode || "",
      processName: detail.costCodeName || "",
      itemGroup: detail.finGdsGrpCode || "",
      itemGroupName: "",
      itemCode: detail.itemCode || "",
      itemName: detail.itemName || "",
      project: detail.projectCode || "",
      projectName: detail.projectName || "",
    }));
  }, []);

  const applyHeaderDefaults = useCallback(
    (header?: SlipHderResponse | null): SlipHderResponse | null => {
      if (!header) {
        return null;
      }

      const today = dayjs().format("YYYY-MM-DD");
      const todayYYYYMMDD = dayjs().format("YYYYMMDD");

      return {
        ...header,
        bltOfficeId: header.bltOfficeId ?? user?.officeId ?? "",
        bltDeptAckSlp: header.bltDeptAckSlp ?? "MSD",
        bltDateAckSlp: header.bltDateAckSlp ?? todayYYYYMMDD,
        makeDept: header.makeDept ?? user?.deptCode ?? "",
        deptNme: header.deptNme ?? "",
        userId: header.userId ?? user?.empCode ?? "",
        makerName: header.makerName ?? user?.empName ?? "",
        slipType: header.slipType ?? "M",
        slipName: header.slipName ?? "대체전표",
        slipExptnName: header.slipExptnName ?? "대체전표",
        exptnTgt: header.exptnTgt ?? "N",
        creationDate: header.creationDate ?? today,
        lastUpdateDate: header.lastUpdateDate ?? today,
      };
    },
    [user]
  );

  // 전표 데이터 로드
  const loadSlipData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setSelectedSlipId(id);
      setIsNewSlip(false);
      // 다른 전표를 로드할 때 편집 모드 해제
      setEditingSlipId(null);

      // 헤더 정보 조회
      const headerResponse = await selectHderList({ slpHeaderId: id } as SlipSrchRequest);
      if (headerResponse.success && headerResponse.data) {
        const normalizedHeader = applyHeaderDefaults(headerResponse.data);
        if (normalizedHeader) {
          setSelectedSlip(normalizedHeader);
        }

        // 상세 정보 조회
        const detailResponse = await selectDetailList({ slpHeaderId: id } as SlipSrchRequest);
        if (detailResponse.success && detailResponse.data) {
          setSlipDetails(detailResponse.data);
        }
      }
    } catch (error) {
      showError("전표 정보 조회 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 수정 버튼 클릭 핸들러
  const handleEditClick = useCallback((slipId: string) => {
    setEditingSlipId(slipId);
  }, []);

  // 전표 선택 기능
  const handleSelectSlip = useCallback(
    async (id: string) => {
      setIsNewSlip(false);

      const exitToSlip = async () => {
        setIsModified(false);
        setEditingSlipId(null);
        await loadSlipData(id);
      };

      if (isModified) {
        confirm({
          title: "알림",
          content: "작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?",
          okText: "예",
          cancelText: "아니오",
          onOk: exitToSlip,
        });
        return;
      }

      if (editingSlipId) {
        setEditingSlipId(null);
      }

      await loadSlipData(id);
    },
    [isModified, editingSlipId, loadSlipData]
  );

  // 조회 기능
  const handleSearch = useCallback(async (searchParams: SlipSrchRequest, skipAutoSelect: boolean = false) => {
    try {
      setLoading(true);
      // 마지막 검색 조건 저장
      setLastSearchParams(searchParams);
      const response = await selectSlipRegistList(searchParams);
      
      if (response.success && response.data) {
        // 데이터가 배열인지 확인
        const dataArray = Array.isArray(response.data) ? response.data : [];
        
        setSlipList(dataArray);
        // skipAutoSelect가 false일 때만 첫 번째 항목 자동 선택
        if (!skipAutoSelect) {
          if (dataArray.length > 0 && dataArray[0].slpHeaderId) {
            await handleSelectSlip(dataArray[0].slpHeaderId);
          } else {
            setSelectedSlipId("");
            setSelectedSlip(null);
            setSlipDetails([]);
          }
        }
      } else {
        setSlipList([]);
      }
    } catch (error) {
      showError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [handleSelectSlip]);

  // 신규 입력 기능
  const handleInput = useCallback(async () => {
    if (isModified) {
      confirm({
        title: "알림",
        content: "작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?",
        okText: "예",
        cancelText: "아니오",
        onOk: async () => {
          setIsModified(false);
          setEditingSlipId(null); // 편집 모드 해제
          await createNewSlip();
        },
      });
      return;
    }
    setEditingSlipId(null); // 편집 모드 해제
    await createNewSlip();
  }, [isModified]);
  const handleExitEditMode = useCallback(() => {
    if (!editingSlipId) return;
    if (isModified) {
      confirm({
        title: "알림",
        content: "작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?",
        okText: "예",
        cancelText: "아니오",
        onOk: () => {
          setIsModified(false);
          setEditingSlipId(null);
          setIsNewSlip(false);
        },
      });
    } else {
      setEditingSlipId(null);
      setIsNewSlip(false);
    }
  }, [editingSlipId, isModified]);


  // 새 전표 생성
  const createNewSlip = useCallback(async () => {
    try {
      setLoading(true);
      // 헤더 ID 생성
      const headerIdResponse = await createSlipHderId({} as SlipSrchRequest);
      if (headerIdResponse.success && headerIdResponse.data) {
        const generatedHeaderId = headerIdResponse.data.slpHeaderId || "";
        // 일련번호 조회 (현재 날짜를 전표일자로 전달)
        const today = dayjs().format("YYYYMMDD");
        const serialResponse = await selectSerialNumber({ 
          asBltDate: today 
        } as SlipSrchRequest);
        if (serialResponse.success && serialResponse.data) {
          const normalizedHeader = applyHeaderDefaults({
            ...serialResponse.data,
            slpHeaderId: serialResponse.data.slpHeaderId || generatedHeaderId,
          });
          if (normalizedHeader) {
            normalizedHeader.dvs = normalizedHeader.dvs || "HO";
            const newHeaderId = normalizedHeader.slpHeaderId || generatedHeaderId;
            setSelectedSlip(normalizedHeader);
            setSelectedSlipId(newHeaderId);
            setEditingSlipId(newHeaderId); // 신규 전표는 즉시 편집 모드
          } else {
            setSelectedSlip(null);
            setSelectedSlipId("");
            setEditingSlipId(null);
          }
          setSlipDetails([]);
          setIsNewSlip(true);
        }
      }
    } catch (error) {
      showError("신규 전표 생성 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 유효성 검증 함수
  const validateSlipData = useCallback((header: SlipHderResponse | null, details: SlipDetailResponse[]): boolean => {
    // 헤더 검증
    if (!header) {
      showError("저장할 전표가 없습니다.");
      return false;
    }

    // 대표적요 필수 입력 체크
    if (!header.description || header.description.trim() === "") {
      showError(t("MSG_CM_0862", "대표적요를 입력하세요!"));
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
        showError(`${rowNum}번째 행에 ${t("MSG_CM_0088", "계정코드를 입력 하세요")}`);
        return false;
      }

      // 관리항목1 체크
      if (detail.accMgmtNbr1Opt === "1" && detail.accMgmtNbr1Type && detail.accMgmtNbr1Type !== "00") {
        if (!detail.accMgmtNbr1 || detail.accMgmtNbr1.trim() === "") {
          showError(`${rowNum}번째 행에 계정코드를 더블클릭하여 ${t("MSG_CM_0126", "관리항목을 입력 하세요")}`);
          return false;
        }
      }

      // 관리항목2 체크
      if (detail.accMgmtNbr2Opt === "1" && detail.accMgmtNbr2Type && detail.accMgmtNbr2Type !== "00") {
        if (!detail.accMgmtNbr2 || detail.accMgmtNbr2.trim() === "") {
          showError(`${rowNum}번째 행에 계정코드를 더블클릭하여 ${t("MSG_CM_0129", "관리항목을 입력 하세요")}`);
          return false;
        }
      }

      // 차변/대변 금액 체크
      const drAmt = parseFloat(detail.drAmt || "0");
      const crAmt = parseFloat(detail.crAmt || "0");
      if (drAmt === 0 && crAmt === 0) {
        showError(`${rowNum}번째 행에 ${t("MSG_CM_0091", "계정해당금액을 입력해 주십시요!")}`);
        return false;
      }

      totalDrAmt += drAmt;
      totalCrAmt += crAmt;

      // 화폐단위 필수 입력 체크
      if (!detail.curr || detail.curr.trim() === "") {
        showError(`${rowNum}번째 행에 ${t("MSG_CM_1173", "화폐단위를 입력하세요!")}`);
        return false;
      }

      // 환율 검증
      const exchgRate = parseFloat(detail.exchgRate || "1");
      if (detail.curr === "KRW") {
        // 원화인 경우 환율은 반드시 1
        if (exchgRate !== 1) {
          showError(t("MSG_CM_1578", "원화는 환율 1만 가능합니다."));
          return false;
        }

        // 원화인 경우 입력금액과 환산금액이 동일해야 함
        const occurAmt = parseFloat(detail.occurAmt || "0");
        const occurAmtFr = parseFloat(detail.occurAmtFr || "0");
        if (occurAmt !== occurAmtFr) {
          showError(t("MSG_CM_1579", "원화는 입력금액과 환산금액이 동일해야 합니다."));
          return false;
        }
      }

      // 부서 필수 입력 체크
      if (!detail.pssnDept || detail.pssnDept.trim() === "") {
        showError(`${rowNum}번째 행에 ${t("MSG_AC_0006", "부서를 입력해 주십시요.")}`);
        return false;
      }

      // 거래처 체크 (거래처코드 필수)
      if (!detail.accMgmtNbr3 || detail.accMgmtNbr3.trim() === "") {
        showError(`${rowNum}번째 행에 ${t("MSG_CM_0033", "거래처 코드를 입력 하세요.")}`);
        return false;
      }

      // 공정코드 체크 (옵션이 있는 경우만 검증 - 현재는 Response에 옵션 필드가 없을 수 있음)
      // 실제 구현 시 계정 정보 조회를 통해 옵션 확인 필요

      // 발생일자/만기일자 체크 (옵션이 있는 경우만 검증)
      // 실제 구현 시 계정 정보 조회를 통해 옵션 확인 필요

      // 품목군 코드 체크 (옵션이 있는 경우만 검증)
      // 실제 구현 시 계정 정보 조회를 통해 옵션 확인 필요

      // 부가세 세부내역 체크
      // vatYn 필드가 Response에 없을 수 있음 - 실제 구현 시 확인 필요
    }

    // 차변/대변 합계 검증
    if (totalDrAmt !== totalCrAmt) {
      showError(t("MSG_CM_1014", "차변/대변 합계가 불일치합니다!"));
      return false;
    }

    return true;
  }, [t]);

  // 저장 기능
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!selectedSlip) {
      showError("저장할 전표가 없습니다.");
      return false;
    }

    // 변경사항이 없으면 저장하지 않음
    if (!isModified && !isNewSlip) {
      showError("변경된 내용이 없습니다.");
      return false;
    }

    // 유효성 검증 수행
    if (!validateSlipData(selectedSlip, slipDetails)) {
      // 검증 실패 시 편집 모드로 전환
      setForceEditMode(true);
      // 다음 렌더링에서 forceEditMode를 false로 리셋하기 위해 setTimeout 사용
      setTimeout(() => setForceEditMode(false), 0);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      confirm({
        title: "저장 확인",
        content: "저장하시겠습니까?",
        okText: "저장",
        cancelText: "취소",
        onOk: async () => {
        try {
          setLoading(true);
          // DetailGrid의 현재 데이터를 SlipDetailRequest로 변환
          const detailRequests: SlipDetailRequest[] = slipDetails.map((detail, index) => {
            const drAmt = parseFloat(detail.drAmt || "0");
            const crAmt = parseFloat(detail.crAmt || "0");
            const drCrType = drAmt > 0 ? "D" : "C";
            
            return {
              // 기본 식별자 필드
              slpHeaderId: selectedSlip.slpHeaderId || "",
              bltOfficeId: selectedSlip.bltOfficeId || user?.officeId || "",
              bltDeptAckSlp: selectedSlip.bltDeptAckSlp || "MSD",
              bltDateAckSlp: selectedSlip.bltDateAckSlp || dayjs().format("YYYYMMDD"),
              serAckSlp: selectedSlip.serAckSlp || "",
              seqAckSlp: (index + 1).toString(),
              drCrType,
              
              // 헤더에서 가져올 수 있는 필드
              makeDept: selectedSlip.makeDept || user?.deptCode || "",
              slipType: selectedSlip.slipType || "M",
              exptnTgt: selectedSlip.exptnTgt || "N",
              slipExptnSrc: selectedSlip.slipExptnSrc || "",
              orgId: selectedSlip.orgId || "",
              userId: selectedSlip.userId || user?.empCode || "",
              ackSeq: selectedSlip.ackSeq || "",
              
              // 계정/금액 관련 필드
              accCode: detail.accCode || "",
              bdgtCode: detail.bdgtCode || "",
              occurAmt: drAmt > 0 ? drAmt.toString() : crAmt.toString(),
              rem: detail.rem || "",
              dvs: detail.dvs || selectedSlip.dvs || "",
              pssnDept: detail.pssnDept || "",
              
              // 계정관리번호 필드
              accMgmtNbr1Type: detail.accMgmtNbr1Type || "",
              accMgmtNbr1: detail.accMgmtNbr1 || "",
              accMgmtNbr2Type: detail.accMgmtNbr2Type || "",
              accMgmtNbr2: detail.accMgmtNbr2 || "",
              accMgmtNbr3Type: detail.accMgmtNbr3Type || "",
              accMgmtNbr3: detail.accMgmtNbr3 || "",
              
              // 기타 필드
              fundIcmExpnCde: detail.fundIcmExpnCde || "",
              occurDate: detail.occurDate || "",
              maturDate: detail.maturDate || "",
              unit: detail.unit || "",
              exchgRate: detail.exchgRate || "1",
              accRelAmt: detail.accRelAmt || "",
              vatWthTaxType: detail.vatWthTaxType || "",
              entExpnYn: detail.entExpnYn || "",
              cstInclsYn: detail.cstInclsYn || "",
              costCode: detail.costCode || "",
              finGdsGrpCode: detail.finGdsGrpCode || "",
              cashFlowCode: detail.cashFlowCode || selectedSlip.cashFlowCode || "",
              
              // 이체 관련 필드
              trReDept: detail.trReDept || "",
              trReType: detail.trReType || "",
              sendYn: detail.sendYn || "",
              bltOfficeIdTrr: detail.bltOfficeIdTrr || "",
              bltDeptTrrSlp: detail.bltDeptTrrSlp || "",
              bltDateTrrSlp: detail.bltDateTrrSlp || "",
              serTrrSlp: detail.serTrrSlp || "",
              seqTrrSlp: detail.seqTrrSlp || "",
              
              // 만들기 관련 필드
              mkOfficeId: selectedSlip.mkOfficeId || "",
              mkDeptActCertf: selectedSlip.mkDeptActCertf || "",
              mkDateActCertf: selectedSlip.mkDateActCertf || "",
              serActCertf: selectedSlip.serActCertf || "",
              seqActCertf: detail.seqActCertf || "",
              fixAssRgstYn: detail.fixAssRgstYn || "",
              
              // 프로젝트/품목 관련 필드
              projectCode: detail.projectCode || "",
              itemCode: detail.itemCode || "",
              channel1: detail.channel1 || "",
              channel2: detail.channel2 || "",
              channel3: detail.channel3 || "",
              itemSegment1: detail.itemSegment1 || "",
              itemSegment2: detail.itemSegment2 || "",
              itemSegment3: detail.itemSegment3 || "",
              
              // 화폐/환율 관련 필드
              curr: detail.curr || "KRW",
              occurAmtFr: detail.occurAmtFr || (drAmt > 0 ? drAmt.toString() : crAmt.toString()),
              exRateType: detail.exchgRateType || "",
              taxType: detail.taxType || "",
              intRate: detail.intRate || "",
              
              // 기타 필드
              paymentApplySeq: detail.paymentApplySeq || "",
              fromSource: detail.fromSource || "",
              attribute1: detail.attribute1 || "",
              attribute2: detail.attribute2 || "",
              attribute3: detail.attribute3 || "",
              attribute4: detail.attribute4 || "",
              attribute5: detail.attribute5 || "",
              
              // 시스템 필드
              createdBy: user?.empCode || "",
              lastUpdatedBy: user?.empCode || "",
              programId: selectedSlip.programId || "",
              terminalId: selectedSlip.terminalId || "",
              rowStatus: isNewSlip ? "C" : "U",
            } as SlipDetailRequest;
          });

          // 1. 금액/계산 관련 필드 계산
          let totalDrAmt = 0;
          let totalCrAmt = 0;
          slipDetails.forEach((detail) => {
            totalDrAmt += parseFloat(detail.drAmt || "0");
            totalCrAmt += parseFloat(detail.crAmt || "0");
          });
          // sumTotAmt: 총합계금액 (차변/대변 합계, 차변과 대변은 같아야 함)
          const calculatedSumTotAmt = totalDrAmt.toString();
          // crDbCnt: 차대개수 (상세 내역의 개수)
          const calculatedCrDbCnt = slipDetails.length.toString();

          // 2. 필수 필드 (기본 식별자)
          const headerRequest: SlipHderRequest = {
            slpHeaderId: selectedSlip.slpHeaderId || "",
            bltOfficeId: selectedSlip.bltOfficeId || user?.officeId || "",
            bltDeptAckSlp: selectedSlip.bltDeptAckSlp || "MSD",
            bltDateAckSlp: selectedSlip.bltDateAckSlp || dayjs().format("YYYYMMDD"),
            serAckSlp: selectedSlip.serAckSlp || "",
            makeDept: selectedSlip.makeDept || user?.deptCode || "",
            slipType: selectedSlip.slipType || "M",
            description: selectedSlip.description || "",
            
            // 3. 금액/계산 관련 필드 (계산된 값 사용)
            sumTotAmt: selectedSlip.sumTotAmt || calculatedSumTotAmt,
            crDbCnt: selectedSlip.crDbCnt || calculatedCrDbCnt,
            
            // 4. 입력/수정 관련 필드
            firstInput: selectedSlip.firstInput || user?.empCode || "",
            udateFrq: selectedSlip.udateFrq || "1",
            
            // 5. 승인 관련 필드
            ackPer: selectedSlip.ackPer || "",
            ackDate: selectedSlip.ackDate || "",
            ackSeq: selectedSlip.ackSeq || "",
            
            // 6. 전기/원천 관련 필드
            exptnTgt: selectedSlip.exptnTgt || "N",
            slipExptnSrc: selectedSlip.slipExptnSrc || "",
            
            // 7. 만들기/조직/화폐/참조/기타 필드
            mkOfficeId: selectedSlip.mkOfficeId || "",
            mkDeptActCertf: selectedSlip.mkDeptActCertf || "",
            mkDateActCertf: selectedSlip.mkDateActCertf || "",
            serActCertf: selectedSlip.serActCertf || "",
            orgId: selectedSlip.orgId || "",
            userId: selectedSlip.userId || user?.empCode || "",
            wrkDate: selectedSlip.wrkDate || dayjs().format("YYYYMMDD"),
            curUnit: selectedSlip.curUnit || "KRW",
            exchgRateType: selectedSlip.exchgRateType || "",
            exchgRate: selectedSlip.exchgRate || "1",
            bankCode: selectedSlip.bankCode || "",
            bankAccount: selectedSlip.bankAccount || "",
            reference1: selectedSlip.reference1 || "",
            reference2: selectedSlip.reference2 || "",
            reference3: selectedSlip.reference3 || "",
            reference4: selectedSlip.reference4 || "",
            reference5: selectedSlip.reference5 || "",
            reference6: selectedSlip.reference6 || "",
            reference7: selectedSlip.reference7 || "",
            reference8: selectedSlip.reference8 || "",
            reference9: selectedSlip.reference9 || "",
            reference10: selectedSlip.reference10 || "",
            sourceTable: selectedSlip.sourceTable || selectedSlip.srcTblNme || "",
            keyFieldNames: selectedSlip.keyFieldNames || "",
            keyDataType: selectedSlip.keyDataType || "",
            keyValue: selectedSlip.keyValue || selectedSlip.sourceKey || "",
            accMgmtNbr2: selectedSlip.accMgmtNbr2 || "",
            accMgmtNbr2Type: selectedSlip.accMgmtNbr2Type || "",
            cashFlowCode: selectedSlip.cashFlowCode || "",
            dvs: selectedSlip.dvs || "",
            attribute1: selectedSlip.attribute1 || "",
            attribute2: selectedSlip.attribute2 || "",
            attribute3: selectedSlip.attribute3 || "",
            attribute4: selectedSlip.attribute4 || "",
            attribute5: selectedSlip.attribute5 || "",
            attribute6: selectedSlip.attribute6 || "",
            attribute7: selectedSlip.attribute7 || "",
            attribute8: selectedSlip.attribute8 || "",
            attribute9: selectedSlip.attribute9 || "",
            attribute10: selectedSlip.attribute10 || "",
            eatKey: selectedSlip.eatKey || "",
            docId: selectedSlip.docId || "",
            appSeq: selectedSlip.appSeq || "",
            rowStatus: isNewSlip ? "C" : "U",
          } as SlipHderRequest;

          const saveRequest: SlipSaveRequest = {
            header: headerRequest,
            detailList: detailRequests,
          };

          await saveHderDetail(saveRequest);
          showSuccess("저장되었습니다.");
          
          // 수정 상태를 먼저 해제하여 알림 메시지가 뜨지 않도록 함
          setIsModified(false);
          setIsNewSlip(false);
          setEditingSlipId(null); // 편집 모드 해제

          // 전표 정보 재조회
          if (selectedSlipId) {
            await loadSlipData(selectedSlipId);
          }

          // 목록 재조회 (RecordList 새로고침) - 자동 선택 건너뛰기
          if (lastSearchParams) {
            await handleSearch(lastSearchParams, true);
          } else {
            // 마지막 검색 조건이 없으면 빈 조건으로 전체 조회 - 자동 선택 건너뛰기
            await handleSearch({} as SlipSrchRequest, true);
          }
          resolve(true); // 저장 성공
        } catch (error) {
          showError("저장 중 오류가 발생했습니다.");
          console.error(error);
          resolve(false); // 저장 실패
        } finally {
          setLoading(false);
        }
        },
        onCancel: () => {
          resolve(false); // 취소 시 false 반환
        },
      });
    });
  }, [selectedSlip, slipDetails, isNewSlip, isModified, selectedSlipId, loadSlipData, validateSlipData, user, lastSearchParams, handleSearch]);

  // 삭제 기능
  const handleDelete = useCallback(async () => {
    if (!selectedSlip) {
      showError("삭제할 전표가 없습니다.");
      return;
    }

    confirm({
      title: "삭제 확인",
      content: "정말로 삭제하시겠습니까?",
      okText: "삭제",
      cancelText: "취소",
      onOk: async () => {
        try {
          setLoading(true);
          
          // 상세 데이터를 SlipDetailRequest로 변환하여 삭제 요청에 포함
          const detailRequests: SlipDetailRequest[] = slipDetails.map((detail, index) => {
            return {
              slpHeaderId: selectedSlip.slpHeaderId || "",
              seqAckSlp: detail.seqAckSlp || (index + 1).toString(),
              serAckSlp: selectedSlip.serAckSlp || "",
              rowStatus: "D", // 삭제 상태
            } as SlipDetailRequest;
          });
          
          const deleteRequest: SlipSaveRequest = {
            header: {
              slpHeaderId: selectedSlip.slpHeaderId,
              rowStatus: "D",
            } as SlipHderRequest,
            detailList: detailRequests, // 실제 상세 데이터 포함
          };

          await deleteHderDetail(deleteRequest);
          showSuccess("삭제되었습니다.");
          setIsModified(false);
          setEditingSlipId(null); // 편집 모드 해제
          setSelectedSlipId("");
          setSelectedSlip(null);
          setSlipDetails([]);

          // 목록 재조회
          if (lastSearchParams) {
            await handleSearch(lastSearchParams);
          } else {
            // 마지막 검색 조건이 없으면 빈 조건으로 전체 조회
            await handleSearch({} as SlipSrchRequest);
          }
        } catch (error) {
          showError("삭제 중 오류가 발생했습니다.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  }, [selectedSlip, slipDetails, lastSearchParams, handleSearch]);

  // 복사 기능
  const handleCopy = useCallback(async () => {
    if (!selectedSlip) {
      showError("복사할 전표가 없습니다.");
      return;
    }

    confirm({
      title: "복사 확인",
      content: "현재 전표를 복사하시겠습니까?",
      okText: "복사",
      cancelText: "취소",
      onOk: async () => {
        try {
          setLoading(true);
          const copyRequest: SlipSaveRequest = {
            header: {
              ...selectedSlip,
              rowStatus: "C",
            } as SlipHderRequest,
            detailList: slipDetails.map((detail) => ({
              ...detail,
              rowStatus: "C",
            })) as SlipDetailRequest[],
          };

          await saveCopyHderDetail(copyRequest);
          showSuccess("복사되었습니다.");
          // 복사 후 목록 재조회 및 새 전표 선택
          // 이 부분은 실제 API 응답에 따라 조정 필요
        } catch (error) {
          showError("복사 중 오류가 발생했습니다.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  }, [selectedSlip, slipDetails]);

  // 승인 취소 기능
  const handleCancelConfm = useCallback(async () => {
    if (!selectedSlip || !selectedSlip.slpHeaderId) {
      showError("승인 취소할 전표가 없습니다.");
      return;
    }

    confirm({
      title: "승인 취소 확인",
      content: "승인을 취소하시겠습니까?",
      okText: "취소",
      cancelText: "닫기",
      onOk: async () => {
        try {
          setLoading(true);
          const confmRequest: ConfmRequest = {
            slpHeaderId: selectedSlip.slpHeaderId,
          };

          await cancelConfm(confmRequest);
          showSuccess("승인이 취소되었습니다.");
          // 전표 정보 재조회
          if (selectedSlipId) {
            await loadSlipData(selectedSlipId);
          }
        } catch (error) {
          showError("승인 취소 중 오류가 발생했습니다.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
    });
  }, [selectedSlip, selectedSlipId, loadSlipData]);

  // DetailGrid 데이터 변경 핸들러
  const handleDetailGridDataChange = useCallback((data: SlipDetail[]) => {
    // SlipDetail[]을 SlipDetailResponse[]로 변환하여 상태 업데이트
    const detailResponses: SlipDetailResponse[] = data.map((detail, index) => {
      const drAmt = detail.debitAmount || 0;
      const crAmt = detail.creditAmount || 0;
      const drCrType = drAmt > 0 ? "D" : "C";
      const occurAmt = drAmt > 0 ? drAmt : crAmt;
      
      return {
        seqAckSlp: (index + 1).toString(),
        drCrType,
        accCode: detail.accountCode || "",
        accName: detail.accountName || "",
        curr: detail.currency || "KRW",
        exchgRateType: detail.exchangeRateType || "",
        exchgRate: detail.exchangeRate?.toString() || "1",
        drAmt: drAmt.toString(),
        crAmt: crAmt.toString(),
        rem: detail.description || "",
        pssnDept: detail.dept || "",
        deptName: detail.deptName || "",
        accMgmtNbr3: detail.partner || "",
        custname: detail.partnerName || "",
        accMgmtNbr1Nme: detail.manage1Name || "",
        accMgmtNbr2Nme: detail.manage2Name || "",
        dvs: detail.trialBizArea || "",
        costCode: detail.processCode || "",
        costCodeName: detail.processName || "",
        finGdsGrpCode: detail.itemGroup || "",
        itemCode: detail.itemCode || "",
        itemName: detail.itemName || "",
        projectCode: detail.project || "",
        projectName: detail.projectName || "",
        occurAmt: occurAmt.toString(),
        occurAmtFr: (drAmt > 0 ? detail.debitAmountConverted : detail.creditAmountConverted)?.toString() || occurAmt.toString(),
      } as SlipDetailResponse;
    });
    setSlipDetails(detailResponses);
  }, []);

  // DetailView 데이터 변경 핸들러
  const handleDetailViewDataChange = useCallback((data: Partial<SlipMaster>) => {
    setSelectedSlip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        makeDept: data.makeDept ?? prev.makeDept,
        deptNme: data.deptName ?? prev.deptNme,
        userId: data.userId ?? prev.userId,
        makerName: data.makerName ?? prev.makerName,
        slipName: data.slipName ?? prev.slipName,
        slipExptnName: data.slipExptnName ?? prev.slipExptnName,
        srcTblNme: data.srcTblName ?? prev.srcTblNme,
        sourceKey: data.sourceKey ?? prev.sourceKey,
        glSlipNo: data.glSlipNo ?? prev.glSlipNo,
        exptnTgt: data.exptnTgt ?? prev.exptnTgt,
        edimStatusName: data.edimStatusName ?? prev.edimStatusName,
        creationDate: data.creationDate ?? prev.creationDate,
        lastUpdateDate: data.lastUpdateDate ?? prev.lastUpdateDate,
        description: data.description ?? prev.description,
      };
    });
  }, []);

  // 화면 표시용 데이터 변환
  const displaySlipMaster: SlipMaster | undefined = selectedSlip
    ? convertToSlipMaster(selectedSlip, slipDetails)
    : undefined;

  return (
    <Article className="page-layout page-layout-splitter">
      {/* 조회 */}
      <FilterPanel className="page-layout__filter-panel" onSearch={handleSearch} />
      {/* 조회 결과 */}
      <Detail
        left={
          <RecordList
            className="page-layout__record-list"
            items={slipList}
            selectedId={selectedSlipId}
            editingSlipId={editingSlipId}
            onSelect={handleSelectSlip}
          />
        }
        right={
          <div className="detail__stack">
            <div className="detail__stack-top">
              <DetailView
                className="page-layout__detail-view"
                data={displaySlipMaster}
                isNewSlip={isNewSlip}
                forceEditMode={forceEditMode}
                editingSlipId={editingSlipId}
                selectedSlipId={selectedSlipId}
                onInput={handleInput}
                onModify={(modified) => setIsModified(modified)}
                onSave={handleSave}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onCancelConfm={handleCancelConfm}
                onDataChange={handleDetailViewDataChange}
                onEditClick={handleEditClick}
                onExitEditMode={handleExitEditMode}
              />
            </div>
            <div className="detail__stack-bottom">
              <DetailGrid
                className="page-layout__detail-grid"
                rowData={displaySlipMaster?.details || []}
                description={displaySlipMaster?.description}
                isEditMode={editingSlipId === selectedSlipId}
                onModify={(modified) => setIsModified(modified)}
                onDataChange={handleDetailGridDataChange}
              />
            </div>
          </div>
        }
      />
    </Article>
  );
};

export default SlipReg;
