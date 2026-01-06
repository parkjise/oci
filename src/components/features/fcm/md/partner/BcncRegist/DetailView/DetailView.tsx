import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  memo,
  lazy,
  Suspense,
} from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { AppPageModal } from "@components/ui/feedback";
import { DataForm } from "@components/ui/form";
import { confirm, info, warning, error } from "@components/ui/feedback/Message";
import { useBcncRegistStore } from "@store/fcm/md/partner/BcncRegist/BcncRegistStore";
import { useAuthStore } from "@store/com/auth/authStore";

import { usePageModal } from "@hooks/usePageModal";
import { getTableRows } from "./DetailView.config";
import { NTS_API_KEY } from "../Constants/Constants";
import { useOpenTab } from "@utils/menuTabUtils";

// 팝업 컴포넌트들을 lazy loading으로 변경 (성능 최적화)
const WrterInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.WrterInqirePopup,
  }))
);
const AcntInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.AcntInqirePopup,
  }))
);
const BcncInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.BcncInqirePopup,
  }))
);
const AdresInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.AdresInqirePopup,
  }))
);
const AccnutComCodeInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.AccnutComCodeInqirePopup,
  }))
);
const ComCodeInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.ComCodeInqirePopup,
  }))
);
const VatTyInqirePopup = lazy(() =>
  import("@/pages/com/popup").then((module) => ({
    default: module.VatTyInqirePopup,
  }))
);

import type { SelectedWriter } from "@/types/com/popup/WrterInqirePopup.types";
import type { SelectedAccount } from "@/pages/com/popup/AcntInqirePopup";
import type { SelectedBcnc } from "@/types/com/popup/BcncInqirePopup.types";
import type { SelectedAdres } from "@/pages/com/popup/AdresInqirePopup";
import type { SelectedAccnutComCode } from "@/pages/com/popup/AccnutComCodeInqirePopup";
import type { SelectedComCode } from "@/pages/com/popup/ComCodeInqirePopup";
import type { SelectedVatTy } from "@/pages/com/popup/VatTyInqirePopup";
import { selectPaymentTermsList } from "@/pages/com/biz/fcmCommonApi";

const DetailView: React.FC<{ className?: string; mode?: "view" | "edit" }> = ({
  className,
  mode: initialMode = "view",
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [form] = Form.useForm();

  // ✅ 사용자가 실제로 폼을 수정했는지 추적하는 플래그
  const userHasEditedFormRef = useRef(false);

  // ✅ Store 통구독 문제 해결: 필요한 상태만 개별 selector로 구독
  const detailData = useBcncRegistStore((state) => state.detailData);
  const detailViewMode = useBcncRegistStore((state) => state.detailViewMode);
  const saveBcncData = useBcncRegistStore((state) => state.save);
  const setDetailViewMode = useBcncRegistStore(
    (state) => state.setDetailViewMode
  );
  const getDetail = useBcncRegistStore((state) => state.getDetail);
  const getShipList = useBcncRegistStore((state) => state.getShipList);
  // 🚀 통합 액션 사용 (연쇄 리렌더링 방지)
  const initNew = useBcncRegistStore((state) => state.initNew);

  const { user } = useAuthStore();
  const { openTabByPgmNo } = useOpenTab();

  // 거래처계좌 조회 버튼 핸들러
  const handleBcncAcnutRegistClick = useCallback(() => {
    const { custno, custname } = form.getFieldsValue();

    if (!custno) {
      warning({
        content: "거래처가 선택되지 않았습니다.",
      });
      return;
    }

    const result = openTabByPgmNo("91715", {
      asCustno: custno,
      asCustName: custname,
    });

    if (!result) {
      warning({
        content:
          "거래처계좌 화면을 찾을 수 없습니다. 메뉴 권한을 확인해주세요.",
      });
    }
  }, [openTabByPgmNo, form]);

  // Store의 detailViewMode가 변경되면 내부 mode도 업데이트 (동기화)
  useEffect(() => {
    setMode(detailViewMode);
  }, [detailViewMode]);

  // detailData 변경 시 폼 값 업데이트 (성능 최적화: requestAnimationFrame 사용)
  const prevDetailDataRef = useRef<typeof detailData>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // 이전 요청이 있으면 취소
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // detailData가 변경되었을 때만 폼 업데이트
    if (detailData !== prevDetailDataRef.current) {
      // ⚡ [최적화] RAF로 다음 프레임에 실행하여 렌더링 블로킹 방지
      rafRef.current = requestAnimationFrame(() => {
        if (detailData) {
          // detailData가 있으면 폼에 값 설정
          // ⚡ [최적화] initNew에서 dayjs 객체로 준비하므로 변환 로직 간소화
          const formData: Record<string, any> = { ...detailData };
          const dateFields = [
            "sdate",
            "odate",
            "cdate",
            "contractFrom",
            "contractTo",
            "creationDate",
            "lastUpdateDate",
          ];
          dateFields.forEach((field) => {
            const val = formData[field];
            // 이미 dayjs 객체면 그대로 사용
            if (dayjs.isDayjs(val)) {
              return;
            }
            // 문자열이면 dayjs 객체로 변환
            if (val && typeof val === "string" && val.trim() !== "") {
              const dayjsValue = dayjs(val);
              if (dayjsValue.isValid()) {
                formData[field] = dayjsValue;
              } else {
                formData[field] = undefined;
              }
            } else if (val === null || val === "") {
              formData[field] = undefined;
            }
          });
          form.setFieldsValue(formData);
        } else {
          // ✅ [수정] 데이터가 없을 때 폼을 확실하게 비움
          form.resetFields();
        }
        prevDetailDataRef.current = detailData;
        rafRef.current = null;
      });
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [detailData, mode, form]);

  // 내부 모드 변경 시 Store도 업데이트하는 함수
  const handleChangeMode = useCallback(
    (newMode: "view" | "edit") => {
      setMode(newMode);
      setDetailViewMode(newMode);
    },
    [setDetailViewMode]
  );

  // ⚠️ [Dead Code 제거] searchPopup과 handleSearchInputClick은 사용되지 않음
  // 모든 검색 기능이 전용 핸들러(handleWriterClick 등)로 대체되었음
  // 하지만 getTableRows의 인터페이스 호환성을 위해 더미 함수로 유지
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSearchInputClick = useCallback((..._args: any[]) => {
    // No-op: 실제로는 호출되지 않음
    console.warn("[Dead Code] handleSearchInputClick should not be called");
  }, []);

  // ⚡ [최적화] 팝업 onReturn 콜백들을 useCallback으로 메모이제이션
  const handleWriterReturn = useCallback(
    (value: SelectedWriter) => {
      form.setFieldsValue({
        business: value.makeUser,
        empyNme: value.makeUserName,
      });
    },
    [form]
  );

  // 직원 팝업 모달
  const writerPopup = usePageModal<
    { asOfficeId?: string; initialUserId?: string; asDeptCode?: string },
    SelectedWriter
  >(WrterInqirePopup, {
    title: "직원 조회",
    width: 800,
    onReturn: handleWriterReturn,
  });

  // 직원 필드 클릭 핸들러
  const handleWriterClick = useCallback(
    (value: string) => {
      writerPopup.openModal({
        asOfficeId: user?.officeId,
        initialUserId: value,
      });
    },
    [writerPopup, user]
  );

  const handleAccount1Return = useCallback(
    (value: SelectedAccount) => {
      form.setFieldsValue({
        acctNum1: value.accCode,
        acctName1: value.accName,
      });
    },
    [form]
  );

  const handleAccount2Return = useCallback(
    (value: SelectedAccount) => {
      form.setFieldsValue({
        acctNum2: value.accCode,
        acctName2: value.accName,
      });
    },
    [form]
  );

  // 미지급금계정 팝업 모달
  const account1Popup = usePageModal<
    { asOfficeId?: string; initialAccCode?: string },
    SelectedAccount
  >(AcntInqirePopup, {
    title: "계정 조회",
    width: 800,
    onReturn: handleAccount1Return,
  });

  // 선급금계정 팝업 모달
  const account2Popup = usePageModal<
    { asOfficeId?: string; initialAccCode?: string },
    SelectedAccount
  >(AcntInqirePopup, {
    title: "계정 조회",
    width: 800,
    onReturn: handleAccount2Return,
  });

  // 미지급금계정 필드 클릭 핸들러
  const handleAccount1Click = useCallback(
    (value: string) => {
      account1Popup.openModal({
        asOfficeId: user?.officeId,
        initialAccCode: value,
      });
    },
    [account1Popup, user]
  );

  // 선급금계정 필드 클릭 핸들러
  const handleAccount2Click = useCallback(
    (value: string) => {
      account2Popup.openModal({
        asOfficeId: user?.officeId,
        initialAccCode: value,
      });
    },
    [account2Popup, user]
  );

  const handlePayToReturn = useCallback(
    (value: SelectedBcnc) => {
      form.setFieldsValue({
        payToCust: value.custno,
        payToName: value.custname,
      });
    },
    [form]
  );

  const handleBillToReturn = useCallback(
    (value: SelectedBcnc) => {
      form.setFieldsValue({
        billToCust: value.custno,
        billToName: value.custname,
      });
    },
    [form]
  );

  // Pay To 팝업 모달
  const payToPopup = usePageModal<
    { asOfficeId?: string; initialCustno?: string },
    SelectedBcnc
  >(BcncInqirePopup, {
    title: "거래처 조회",
    width: 1000,
    onReturn: handlePayToReturn,
  });

  // Bill To 팝업 모달
  const billToPopup = usePageModal<
    { asOfficeId?: string; initialCustno?: string },
    SelectedBcnc
  >(BcncInqirePopup, {
    title: "거래처 조회",
    width: 1000,
    onReturn: handleBillToReturn,
  });

  // Pay To 필드 클릭 핸들러
  const handlePayToClick = useCallback(
    (value: string) => {
      payToPopup.openModal({
        asOfficeId: user?.officeId,
        initialCustno: value,
      });
    },
    [payToPopup, user]
  );

  // Bill To 필드 클릭 핸들러
  const handleBillToClick = useCallback(
    (value: string) => {
      billToPopup.openModal({
        asOfficeId: user?.officeId,
        initialCustno: value,
      });
    },
    [billToPopup, user]
  );

  const handleZipCodeReturn = useCallback(
    (value: SelectedAdres) => {
      form.setFieldsValue({
        zipcode: value.zipNo,
        addr: value.roadAddr,
      });
    },
    [form]
  );

  // 우편번호 팝업 모달
  const zipCodePopup = usePageModal<{ initialKeyword?: string }, SelectedAdres>(
    AdresInqirePopup,
    {
      title: "주소 조회",
      width: 800,
      onReturn: handleZipCodeReturn,
    }
  );

  // 우편번호 필드 클릭 핸들러
  const handleZipCodeClick = useCallback(
    (value: string) => {
      zipCodePopup.openModal({
        initialKeyword: value,
      });
    },
    [zipCodePopup]
  );

  const handleNationalCodeReturn = useCallback(
    (value: SelectedAccnutComCode) => {
      form.setFieldsValue({
        nationalCde: value.code,
        nationName: value.codeNme,
      });
    },
    [form]
  );

  // 국가코드 팝업 모달
  const nationalCodePopup = usePageModal<
    { asOfficeId?: string; asCodeTy: string; initialCode?: string },
    SelectedAccnutComCode
  >(AccnutComCodeInqirePopup, {
    title: "국가코드 조회",
    width: 800,
    onReturn: handleNationalCodeReturn,
  });

  // 국가코드 필드 클릭 핸들러
  const handleNationalCodeClick = useCallback(
    (value: string) => {
      nationalCodePopup.openModal({
        asOfficeId: user?.officeId,
        asCodeTy: "NATION",
        initialCode: value,
      });
    },
    [nationalCodePopup, user]
  );

  const handlePaymentMethodReturn = useCallback(
    (value: SelectedComCode) => {
      form.setFieldsValue({
        method: value.code,
        mthdName: value.codeNme,
      });
    },
    [form]
  );

  // 지급방법 팝업 모달
  const paymentMethodPopup = usePageModal<
    { asOfficeId?: string; asCodeTy: string; initialCode?: string },
    SelectedComCode
  >(ComCodeInqirePopup, {
    title: "지급방법 조회",
    width: 800,
    onReturn: handlePaymentMethodReturn,
  });

  // 지급방법 필드 클릭 핸들러
  const handlePaymentMethodClick = useCallback(
    (value: string) => {
      paymentMethodPopup.openModal({
        asOfficeId: user?.officeId,
        asCodeTy: "PAYGRP",
        initialCode: value,
      });
    },
    [paymentMethodPopup, user]
  );

  const handleVatTypeApReturn = useCallback(
    (value: SelectedVatTy) => {
      form.setFieldsValue({
        vatType: value.taxCode,
        vatNmeAp: value.taxName,
      });
    },
    [form]
  );

  // VAT(매입) 팝업 모달
  const vatTypeApPopup = usePageModal<
    { asOfficeId?: string; asTaxTy: string; initialCode?: string },
    SelectedVatTy
  >(VatTyInqirePopup, {
    title: "부가세유형 조회(매입)",
    width: 800,
    onReturn: handleVatTypeApReturn,
  });

  // VAT(매입) 필드 클릭 핸들러
  const handleVatTypeApClick = useCallback(
    (value: string) => {
      vatTypeApPopup.openModal({
        asOfficeId: user?.officeId,
        asTaxTy: "AP",
        initialCode: value,
      });
    },
    [vatTypeApPopup, user]
  );

  const handleVatTypeArReturn = useCallback(
    (value: SelectedVatTy) => {
      form.setFieldsValue({
        vatType2: value.taxCode,
        vatNmeAr: value.taxName,
      });
    },
    [form]
  );

  // VAT(매출) 팝업 모달
  const vatTypeArPopup = usePageModal<
    { asOfficeId?: string; asTaxTy: string; initialCode?: string },
    SelectedVatTy
  >(VatTyInqirePopup, {
    title: "부가세유형 조회(매출)",
    width: 800,
    onReturn: handleVatTypeArReturn,
  });

  // VAT(매출) 필드 클릭 핸들러
  const handleVatTypeArClick = useCallback(
    (value: string) => {
      vatTypeArPopup.openModal({
        asOfficeId: user?.officeId,
        asTaxTy: "AR",
        initialCode: value,
      });
    },
    [vatTypeArPopup, user]
  );

  const handleBankReturn = useCallback(
    (value: SelectedComCode) => {
      form.setFieldsValue({
        category1: value.code,
        bankName: value.codeNme,
      });
    },
    [form]
  );

  // 가상계좌(은행) 팝업 모달
  const bankPopup = usePageModal<
    { asOfficeId?: string; asCodeTy: string; initialCode?: string },
    SelectedComCode
  >(ComCodeInqirePopup, {
    title: "은행 조회",
    width: 800,
    onReturn: handleBankReturn,
  });

  // 가상계좌(은행) 필드 클릭 핸들러
  const handleBankClick = useCallback(
    (value: string) => {
      bankPopup.openModal({
        asOfficeId: user?.officeId,
        asCodeTy: "BNKCDE",
        initialCode: value,
      });
    },
    [bankPopup, user]
  );

  const personYn = Form.useWatch("personYn", form) || "N";
  const custnoGb = Form.useWatch("custnoGb", form);
  const nationalCde = Form.useWatch("nationalCde", form);

  // nationalCde_chk 로직: 국가코드가 KOR이 아닐 경우 처리
  useEffect(() => {
    if (nationalCde && nationalCde !== "KOR") {
      const custno = form.getFieldValue("custno");
      form.setFieldsValue({
        regtno: custno,
        pidno: custno,
        custArea: "해외", // 거래처지역을 '해외'로 설정
      });
    }
  }, [nationalCde, form]);

  // 사업자등록번호 확인 핸들러
  const handleCheckBusRegNo = useCallback(async () => {
    const regtnoVal = form.getFieldValue("regtno");
    if (!regtnoVal) {
      warning({
        title: "알림",
        content: "사업자등록번호를 입력해주세요.",
      });
      return;
    }

    const cleanRegtno = regtnoVal.replace(/-/g, "");
    if (cleanRegtno.length !== 10) {
      warning({
        title: "알림",
        content: "유효하지 않은 사업자등록번호입니다.",
      });
      return;
    }

    try {
      // 국세청 공공데이터 API 호출
      const response = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${NTS_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            b_no: [cleanRegtno],
          }),
        }
      );

      const result = await response.json();
      const data = result.data?.[0];

      if (!data) {
        error({
          title: "오류",
          content: "사업자등록번호 조회 중 오류가 발생했습니다.",
        });
        return;
      }

      if (data.b_stt_cd === "") {
        info({ title: "안내", content: "미등록사업자입니다." });
        form.setFieldValue("custStatus", "미등록");
        return;
      }

      if (data.b_stt_cd === "02") {
        info({ title: "안내", content: "휴업 거래처입니다." });
        form.setFieldValue("custStatus", "휴업");
        return;
      }

      if (data.b_stt_cd === "03") {
        info({ title: "안내", content: "폐업 거래처입니다." });
        form.setFieldValue("custStatus", "폐업");
        return;
      }

      // 과세유형 설정
      let statusText = "";
      switch (data.tax_type_cd) {
        case "01":
          statusText = "일반과세자";
          break;
        case "02":
          statusText = "간이과세자";
          break;
        case "03":
          statusText = "과세특례자";
          break;
        case "04":
          statusText = "면세사업자";
          break;
        case "05":
          statusText = "비영리법인";
          break;
        case "06":
          statusText = "고유번호단체";
          break;
        case "07":
          statusText = "과특사업자";
          break;
        default:
          statusText = data.tax_type || "확인필요";
          break;
      }

      info({
        title: "안내",
        content: `부가가치세 ${statusText}입니다.`,
      });
      form.setFieldValue("custStatus", statusText);
    } catch (e) {
      console.error(e);
      error({
        title: "오류",
        content: "API 호출 중 오류가 발생했습니다.",
      });
    }
  }, [form]);

  // 지급조건 및 수금조건 옵션 상태
  const [stlmTermOptions, setStlmTermOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [stlmTermArOptions, setStlmTermArOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 지급조건 및 수금조건 옵션 로드
  useEffect(() => {
    const loadPaymentTermsOptions = async () => {
      try {
        // 지급조건 (type: "B")
        if (user?.officeId) {
          const stlmTermResponse = await selectPaymentTermsList({
            officeId: user.officeId,
            type: "B",
          });
          if (stlmTermResponse.success && stlmTermResponse.data) {
            const options = stlmTermResponse.data.map((item) => ({
              value: item.code || "",
              label: item.name || "",
            }));
            setStlmTermOptions(options);
          }
        }

        // 수금조건 (type: "A")
        if (user?.officeId) {
          const stlmTermArResponse = await selectPaymentTermsList({
            officeId: user.officeId,
            type: "A",
          });
          if (stlmTermArResponse.success && stlmTermArResponse.data) {
            const options = stlmTermArResponse.data.map((item) => ({
              value: item.code || "",
              label: item.name || "",
            }));
            setStlmTermArOptions(options);
          }
        }
      } catch (error) {
        console.error("지급/수금 조건 옵션 로드 실패:", error);
      }
    };

    loadPaymentTermsOptions();
  }, [user]);

  // ✅ 성능 최적화: 폼 구조(Layout)와 데이터(Value) 분리
  // detailData가 변경되어도 테이블 구조는 재계산하지 않음
  // 데이터는 form.setFieldsValue로만 주입
  const generatedTableRows = useMemo(
    () =>
      getTableRows({
        t,
        detailData: undefined, // ⚡ detailData 의존성 제거 (구조 설정에 불필요)
        personYn,
        custnoGb,
        nationalCde,
        handleSearchInputClick,
        form,
        onCheckBusRegNo: handleCheckBusRegNo,
        onBcncAcnutRegistClick: handleBcncAcnutRegistClick,
        onWriterClick: handleWriterClick,
        onAccount1Click: handleAccount1Click,
        onAccount2Click: handleAccount2Click,
        onPayToClick: handlePayToClick,
        onBillToClick: handleBillToClick,
        onZipCodeClick: handleZipCodeClick,
        onNationalCodeClick: handleNationalCodeClick,
        onPaymentMethodClick: handlePaymentMethodClick,
        onVatTypeApClick: handleVatTypeApClick,
        onVatTypeArClick: handleVatTypeArClick,
        onBankClick: handleBankClick,
        stlmTermOptions:
          stlmTermOptions.length > 0 ? stlmTermOptions : undefined,
        stlmTermArOptions:
          stlmTermArOptions.length > 0 ? stlmTermArOptions : undefined,
      }),
    [
      t,
      // ⚡ detailDataKey 제거: 데이터 변경시 구조 재계산 방지
      personYn,
      custnoGb,
      nationalCde,
      // ⚡ mode 제거: view/edit 전환은 DataForm의 mode prop에서 처리하므로 구조 재계산 불필요
      // 핸들러들은 useCallback으로 메모이제이션되어 있으므로 안정적
      handleSearchInputClick,
      handleCheckBusRegNo,
      handleBcncAcnutRegistClick,
      handleWriterClick,
      handleAccount1Click,
      handleAccount2Click,
      handlePayToClick,
      handleBillToClick,
      handleZipCodeClick,
      handleNationalCodeClick,
      handlePaymentMethodClick,
      handleVatTypeApClick,
      handleVatTypeArClick,
      handleBankClick,
      form, // ⚡ form 인스턴스 추가 (안정적이므로 문제없음)
      stlmTermOptions,
      stlmTermArOptions,
    ]
  );

  const handleSave = useCallback(async () => {
    if (mode !== "edit") {
      warning({
        title: "알림",
        content: "수정 가능한 상태가 아닙니다.",
      });
      return;
    }

    const values = form.getFieldsValue();

    // ✅ Grid API에서 직접 데이터 수집 (Store 대신)
    const { detailGridApi } = useBcncRegistStore.getState();
    const gridData: any[] = [];

    if (detailGridApi) {
      detailGridApi.forEachNode((node) => {
        if (node.data) {
          gridData.push(node.data);
        }
      });
    }

    const finalFormData = { ...detailData, ...values };
    ["sdate", "odate", "cdate"].forEach((field) => {
      const val = finalFormData[field];
      if (dayjs.isDayjs(val)) finalFormData[field] = val.format("YYYY-MM-DD");
    });

    if (user?.officeId) {
      // detailData의 rowStatus를 우선 사용, 없으면 detailData 존재 여부로 판단
      // detailData가 null이면 신규 생성("C"), 있으면 수정("U")
      const rowStatus =
        (detailData as Record<string, any>)?.rowStatus ||
        (detailData ? "U" : "C");
      const saveRequest = {
        bcncList: [{ ...finalFormData, officeId: user.officeId, rowStatus }],
        shipToList: gridData
          .filter((r: any) => r.rowStatus === "C" || r.rowStatus === "U")
          .map((r: any) => ({
            ...r,
            custno: finalFormData.custno,
            officeId: user.officeId,
            disposalOrgId: r.orgId || "HO", // orgId 값으로 disposalOrgId 설정
          })),
        rowStatus,
      };
      try {
        const savedCustno = finalFormData.custno;
        const savedOfficeId = user.officeId;

        await saveBcncData(saveRequest as any);

        // ✅ 저장 후 사용자 수정 플래그 초기화
        userHasEditedFormRef.current = false;

        handleChangeMode("view");

        // 저장 후 거래처코드로 상세 정보 재조회
        if (savedCustno && savedOfficeId) {
          await getDetail({
            asOfficeId: savedOfficeId,
            asCustno: savedCustno,
          });
          await getShipList({
            asOfficeId: savedOfficeId,
            asCustno: savedCustno,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [
    mode,
    form,
    detailData,
    user,
    saveBcncData,
    handleChangeMode,
    getDetail,
    getShipList,
  ]);

  // 🚀 신규 등록 핸들러 (통합 액션 사용)
  const handleCreate = useCallback(() => {
    if (!user?.officeId) return;

    const performCreate = () => {
      // ✅ 사용자 수정 플래그 초기화
      userHasEditedFormRef.current = false;

      // ✅ 폼 먼저 비우기 (이전 데이터 잔상 방지)
      form.resetFields();

      // ✅ Store 통합 액션 호출 (여러 상태를 한 번에 업데이트)
      initNew(user.officeId);
    };

    // ⚡ [최적화] edit 모드에서 실제로 수정했을 때만 confirm 표시
    if (detailViewMode === "edit") {
      const { detailGridApi } = useBcncRegistStore.getState();

      // 1️⃣ 폼 수정 여부 체크 (useRef 플래그 사용)
      const isFormEdited = userHasEditedFormRef.current;

      // 2️⃣ Grid 변경 여부 체크
      let isGridDirty = false;

      if (detailGridApi) {
        detailGridApi.forEachNode((node) => {
          if (
            node.data &&
            (node.data.rowStatus === "C" ||
              node.data.rowStatus === "U" ||
              node.data.rowStatus === "D")
          ) {
            isGridDirty = true;
            return; // 하나라도 찾으면 중단
          }
        });
      }

      // 3️⃣ 실제로 수정한 경우에만 confirm
      if (isFormEdited || isGridDirty) {
        confirm({
          title: "확인",
          content: "수정 중인 데이터가 있습니다. 새로 입력하시겠습니까?",
          onOk: performCreate,
        });
      } else {
        performCreate(); // ⚡ 수정 안 했으면 즉시 실행
      }
    } else {
      // view 모드: 조회만 한 경우이므로 즉시 실행
      performCreate();
    }
  }, [detailViewMode, user?.officeId, initNew, form]);

  const handleEdit = useCallback(() => {
    if (!detailData) {
      warning({
        title: "알림",
        content: "선택된 데이터가 없습니다.",
      });
      return;
    }
    // ✅ 수정 모드 진입 시 플래그 초기화
    userHasEditedFormRef.current = false;
    handleChangeMode("edit");
  }, [detailData, handleChangeMode]);

  // ✅ 폼 값 변경 감지 (사용자가 직접 입력한 경우)
  const handleFormValuesChange = useCallback(() => {
    // edit 모드일 때만 플래그 설정
    if (detailViewMode === "edit") {
      userHasEditedFormRef.current = true;
    }
  }, [detailViewMode]);

  // Debug tableRows usage
  // console.log("tableRows:", generatedTableRows);

  return (
    <>
      <DataForm
        // key prop 제거: detailData 변경 시 form.setFieldsValue로 처리하므로 불필요한 언마운트/마운트 방지
        form={form} // 부모의 form 인스턴스를 전달하여 자식과 상태 공유
        className={className}
        tableRows={generatedTableRows}
        // ⚡ tableData 최적화: 데이터는 form이 관리하므로 빈 객체 전달
        tableData={{}}
        mode={mode}
        onValuesChange={handleFormValuesChange} // ✅ 폼 변경 감지
        actionButtonGroup={{
          onButtonClick: {
            edit: handleEdit,
            save: handleSave, // handleSave 내부에서 setMode("view") 호출 중인데 이것도 확인 필요
            create: handleCreate,
          },
          hideButtons: ["copy", "delete"],
          // 아코디언이 시작되는 행 인덱스 배열
          accordionAt: [12, 16],
          defaultExpanded: true, // 모든 섹션 펼침
          //defaultExpandedSections: [5, 25], // 5번째와 25번째 섹션만 펼침
        }}
      />
      {/* searchPopup 제거: Dead Code */}
      <Suspense fallback={<div />}>
        <AppPageModal {...writerPopup.modalProps} />
        <AppPageModal {...account1Popup.modalProps} />
        <AppPageModal {...account2Popup.modalProps} />
        <AppPageModal {...payToPopup.modalProps} />
        <AppPageModal {...billToPopup.modalProps} />
        <AppPageModal {...zipCodePopup.modalProps} />
        <AppPageModal {...nationalCodePopup.modalProps} />
        <AppPageModal {...paymentMethodPopup.modalProps} />
        <AppPageModal {...vatTypeApPopup.modalProps} />
        <AppPageModal {...vatTypeArPopup.modalProps} />
        <AppPageModal {...bankPopup.modalProps} />
      </Suspense>
    </>
  );
};

// React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(DetailView);
