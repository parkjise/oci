import React, { useEffect, useRef, useCallback } from "react";
import { Form } from "antd";
import {
  FormInput,
  FormDatePicker,
  FormSelect,
  FormRadioGroup,
  SearchForm,
} from "@components/ui/form";
import { showError } from "@/components/ui/feedback/Message";
import { useAuthStore } from "@store/com/auth/authStore";
import { useSlipPostStore } from "@store/fcm/gl/slip/SlipPost";
import type { SlipPostSearchRequest } from "@/types/fcm/gl/slip/slipPost.types";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

// 전표유형 필터에서 제외할 값들
const SLIP_TYPE_FILTER_VALUES = [
  "E",
  "F",
  "G",
  "H",
  "I",
  "M",
  "P",
  "R",
  "T",
  "U",
] as (string | number)[];

type FilterPanelProps = {
  className?: string;
  onPostYnChange?: (sPostYn: string) => void;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onPostYnChange,
  onRefReady,
}) => {
  // Form 인스턴스 생성
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { search, loading, setSPostYn } = useSlipPostStore();
  const isInitialMount = useRef(true);
  const isInitializing = useRef(true); // 초기값 설정 중인지 추적

  // 초기값 생성 함수 (중복 제거)
  const getInitialValues = useCallback(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");

    return {
      dateRange: [firstDay, today] as [dayjs.Dayjs, dayjs.Dayjs],
      sPostYn: "UNPOST" as const,
      asDvs: "",
      asSlipType: "",
    };
  }, []);

  // 초기값 설정
  useEffect(() => {
    if (form) {
      // 초기값 설정 중임을 표시
      isInitializing.current = true;
      form.setFieldsValue(getInitialValues());
      // 초기값 설정이 완료된 후 다음 렌더링 사이클에서 플래그 해제
      setTimeout(() => {
        isInitializing.current = false;
        isInitialMount.current = false;
      }, 0);
    }
  }, [form, getInitialValues]);

  // 초기화 핸들러 (SearchForm에 전달)
  const handleReset = useCallback(() => {
    if (!form) return;
    form.setFieldsValue(getInitialValues());
  }, [form, getInitialValues]);

  // sPostYn 값 감시 (라디오 버튼 변경 시 자동 조회)
  const sPostYn = Form.useWatch("sPostYn", form);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!form) return;

    try {
      const values = await form.validateFields();

      if (!user?.officeId) {
        showError("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 범위 검증
      const dateRange = values.dateRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        showError("회계일자를 선택해주세요.");
        return;
      }

      // sPostYn 값에 따라 asTgt 설정
      // UNPOST (전기) = 미전기 상태 = asTgt: "N"
      // POST (전기취소) = 전기 상태 = asTgt: "Y"
      let asTgtValue: string | undefined;
      if (values.sPostYn === "UNPOST") {
        asTgtValue = "N"; // 미전기 (전기 가능)
      } else if (values.sPostYn === "POST") {
        asTgtValue = "Y"; // 전기됨 (전기취소 가능)
      }

      // API 요청 파라미터 구성
      const searchRequest: SlipPostSearchRequest = {
        asRpsnOfficeId: user.officeId,
        asOfficeId: user.officeId,
        asFrDate: dateRange[0].format("YYYYMMDD"),
        asToDate: dateRange[1].format("YYYYMMDD"),
        asDvs: values.asDvs || undefined,
        asSlipType: values.asSlipType || undefined,
        asSlipExptnSrc: values.asSlipExptnSrc || undefined,
        asRem: values.asRem || undefined,
        asSlipNo: values.asSlipNo || undefined,
        // 기준화폐 정보 (기본값: KRW)
        asGCurr: "KRW",
        asGCurrDeci: "0",
        asGCurrFormat: "###,###,###",
        asTgt: asTgtValue,
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== API 요청 파라미터 ===");
        console.log("searchRequest:", searchRequest);
        console.log("Form values:", values);
        console.log("sPostYn:", values.sPostYn);
        console.log("asTgt 변환값:", asTgtValue);
        console.log("========================");
      }

      // store의 search 함수 호출 (sPostYn도 함께 전달)
      await search(searchRequest, values.sPostYn);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        showError("입력값을 확인해주세요.");
      } else {
        showError("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [form, user, search]);

  // sPostYn 값 변경 시 store 업데이트 및 자동 조회
  useEffect(() => {
    // sPostYn 값 변경 시 store에 저장
    if (sPostYn) {
      setSPostYn(sPostYn);
      // 상위 컴포넌트에 전달 (필요한 경우)
      if (onPostYnChange) {
        onPostYnChange(sPostYn);
      }
    }

    // 초기값 설정 중이거나 최초 마운트 시에는 자동 조회하지 않음
    if (isInitialMount.current || isInitializing.current) {
      return;
    }

    // 사용자가 sPostYn을 변경했을 때만 자동 조회 실행
    if (sPostYn) {
      handleSearch();
    }
  }, [sPostYn, handleSearch, setSPostYn, onPostYnChange]);

  // 초기 마운트 시 sPostYn 값 store에 저장
  useEffect(() => {
    if (!form) return;
    const initialSPostYn = form.getFieldValue("sPostYn");
    if (initialSPostYn) {
      setSPostYn(initialSPostYn);
      if (onPostYnChange) {
        onPostYnChange(initialSPostYn);
      }
    }
  }, [form, setSPostYn, onPostYnChange]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={2}
      columnsPerRow={4}
      className={className}
    >
      <FormSelect
        name="asDvs"
        label={t("사업부")}
        placeholder="전체"
        comCodeParams={{
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        }}
        filterValues={["##"]}
        allOptionLabel="ALL"
      />
      <FormDatePicker
        name="dateRange"
        isRange={true}
        label={t("회계일자")}
        placeholder={["시작일", "종료일"]}
      />
      <FormSelect
        name="asSlipType"
        label={t("전표유형")}
        placeholder="-선택-"
        comCodeParams={{
          module: "GL",
          type: "SLIPID",
          enabledFlag: "Y",
        }}
        filterComCodeParams={{
          module: "GL",
          type: "SLPORG",
          enabledFlag: "Y",
        }}
        filterFieldName="asSlipExptnSrc"
        filterValues={SLIP_TYPE_FILTER_VALUES}
        allOptionLabel="-선택-"
      />
      <FormInput name="asRem" label={t("대표적요")} />
      <FormInput name="asSlipNo" label="Slip No." />
      <FormRadioGroup
        name="sPostYn"
        label=""
        options={[
          { value: "UNPOST", label: t("전기") },
          { value: "POST", label: t("전기취소") },
        ]}
        layout="horizontal"
      />
    </SearchForm>
  );
};

export default FilterPanel;
