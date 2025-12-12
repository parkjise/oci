import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, message, type FormInstance } from "antd";
import {
  FormInput,
  FormDatePicker,
  FormSelect,
  FormRadioGroup,
  SearchForm,
} from "@components/ui/form";
import { useAuthStore } from "@store/authStore";
import { useSlipPostStore } from "@store/slipPostStore";
import type { SlipPostSearchRequest } from "@/types/fcm/gl/slip/slipPost.types";
import dayjs from "dayjs";

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

// Internal component to capture Form instance from SearchForm
const FormWatcher: React.FC<{
  onFormInstanceReady: (instance: FormInstance) => void;
}> = ({ onFormInstanceReady }) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    if (form) {
      onFormInstanceReady(form);
    }
  }, [form, onFormInstanceReady]);
  return null;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onPostYnChange,
  onRefReady,
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  // Form.useWatch를 위해 최소한의 state 필요 (useWatch가 form 인스턴스 변경을 감지하기 위해)
  const [formInstance, setFormInstance] = useState<FormInstance | null>(null);
  const { user } = useAuthStore();
  const { search, loading, setSPostYn } = useSlipPostStore();
  const isInitialMount = useRef(true);

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

  // Form 인스턴스 설정 함수
  const setForm = useCallback(
    (instance: FormInstance | null) => {
      formRef.current = instance;
      // Form.useWatch가 인스턴스 변경을 감지할 수 있도록 state 업데이트
      // (단, 이 state는 useWatch를 위해서만 사용되므로 최소한의 리렌더링만 발생)
      setFormInstance(instance);

      // Form 인스턴스가 설정되면 초기값 설정
      if (instance) {
        instance.setFieldsValue(getInitialValues());
      }
    },
    [getInitialValues]
  );

  // 초기화 핸들러 (SearchForm에 전달)
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

  // sPostYn 값 감시 (라디오 버튼 변경 시 자동 조회)
  // formInstance state를 사용하여 useWatch가 인스턴스 변경을 감지할 수 있도록 함
  const sPostYn = Form.useWatch("sPostYn", formInstance || undefined);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();

      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 범위 검증
      const dateRange = values.dateRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.error("회계일자를 선택해주세요.");
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
        message.error("입력값을 확인해주세요.");
      } else {
        message.error("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [user, search]);

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

    // 초기 마운트 시에는 조회하지 않음 (값만 저장)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // sPostYn 값이 있을 때만 조회 실행
    if (sPostYn) {
      handleSearch();
    }
  }, [sPostYn, handleSearch, setSPostYn, onPostYnChange]);

  // 초기 마운트 시 sPostYn 값 store에 저장
  useEffect(() => {
    if (!formRef.current) return;
    const initialSPostYn = formRef.current.getFieldValue("sPostYn");
    if (initialSPostYn) {
      setSPostYn(initialSPostYn);
      if (onPostYnChange) {
        onPostYnChange(initialSPostYn);
      }
    }
  }, [setSPostYn, onPostYnChange]);

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
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={2}
      columnsPerRow={4}
      className={className}
    >
      <FormWatcher onFormInstanceReady={setForm} />
      <FormSelect
        name="asDvs"
        label="사업부"
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
        label="회계일자"
        placeholder={["시작일", "종료일"]}
      />
      <FormSelect
        name="asSlipType"
        label="전표유형"
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
      <FormInput name="asRem" label="대표적요" />
      <FormInput name="asSlipNo" label="Slip No." />
      <FormRadioGroup
        name="sPostYn"
        label=""
        options={[
          { value: "UNPOST", label: "전기" },
          { value: "POST", label: "전기취소" },
        ]}
        layout="horizontal"
      />
    </SearchForm>
  );
};

export default FilterPanel;
