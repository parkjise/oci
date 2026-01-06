import React, { useCallback, useRef, useEffect } from "react";
import { Form, message, type FormInstance } from "antd";
import {
  FormDatePicker,
  FormSelect,
  SearchForm,
  FormInput,
} from "@components/ui/form";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import {
  DeptInqirePopup,
  BcncInqirePopup,
} from "@/pages/com/popup";

import type { SelectedDept } from "@/types/com/popup/DeptInqirePopup.types";
import type { SelectedBcnc } from "@/types/com/popup/BcncInqirePopup.types";
import { useAuthStore } from "@store/com/auth/authStore";

import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";
import type { AdvpayCtDtaCreatSearchRequest } from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import dayjs from "dayjs";

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
  onFormRefReady?: (formInstance: FormInstance | null) => void;
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
  onRefReady,
  onFormRefReady,
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  const { user } = useAuthStore();
  //const [form] = Form.useForm();
  const { search, loading } = useAdvpayCtDtaCreatStore();

  // 부서조회 팝업 모달 관리
  const deptModal = usePageModal<
    {
      initialDeptCode?: string;
      asOfficeId?: string;
      asStndDate?: string;
    },
    SelectedDept
  >(DeptInqirePopup, {
    title: "부서조회",
    width: 700,
    onReturn: (value) => {
      formRef.current?.setFieldsValue({
        asDept: value.makeDept || "",
        "asDeptName": value.makeDeptName || "",
      });
    },
  });

  // 거래처조회 팝역 모달 관리
  const bcncModal = usePageModal<
    {
      initialCustno?: string;
      asOfficeId?: string;
    },
    SelectedBcnc
  >(BcncInqirePopup, {
    title: "거래처조회",
    width: 700,
    onReturn: (value: SelectedBcnc) => {
      formRef.current?.setFieldsValue({
        asCust: value.custno || "",
        "asCustname": value.custname || "",
      });
    },
  });

  // 초기값 생성 함수 (중복 제거)
  const getInitialValues = useCallback(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");

    return {
      dateRange: [firstDay, today] as [dayjs.Dayjs, dayjs.Dayjs],
      asRpsnOffice: "",
      asDept: "",
      asCust: "",
    };
  }, []);

  // Form 인스턴스 설정 함수
  const setForm = useCallback(
    (instance: FormInstance | null) => {
      formRef.current = instance;

      // Form 인스턴스가 설정되면 초기값 설정
      if (instance) {
        instance.setFieldsValue(getInitialValues());
      }

      // 외부로 form 인스턴스 전달
      if (onFormRefReady) {
        onFormRefReady(instance);
      }
    },
    [getInitialValues, onFormRefReady]
  );

  // 초기화 핸들러 (SearchForm에 전달)
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

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

      // API 요청 파라미터 구성
      const searchRequest: AdvpayCtDtaCreatSearchRequest = {
        asOfficeId: user.officeId,
        asOrgId: values.asRpsnOffice || "",
        asDept: values.asDept || "",
        asCustno: values.asCust || "",
        asFrDate: dateRange[0].format("YYYYMMDD"),
        asToDate: dateRange[1].format("YYYYMMDD"),
        // 기준통화 정보 (기본값: KRW)
        asGCurr: "KRW",
        asGCurrDeci: "0",
        asGCurrFormat: "###,###,###",
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== API 요청 파라미터 ===");
        console.log("searchRequest:", searchRequest);
        console.log("Form values:", values);
        console.log("========================");
      }

      // store의 search 함수 호출
      await search(searchRequest);
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

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  return (
    <>
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
          name="asRpsnOffice"
          label="사업장"
          placeholder="전체"
          comCodeParams={{
            module: "PF",
            type: "ORG",
            enabledFlag: "Y",
          }}
          filterValues={["##"]}
          allOptionLabel="전체"
        />
        <FormInput
          type="search"
          name="asDept"
          label="귀속부서"
          width="250px"
          placeholder="귀속부서를 입력하세요"
          showReadOnlyBoxName="asDeptName"
          onSearch={(value) => {
            //귀속부서 팝업 열기
            deptModal.openModal({
              initialDeptCode: value || "",
              asOfficeId: user?.officeId,
              asStndDate: dayjs().format("YYYYMMDD"),
            });
          }}
        />
        <FormDatePicker
          name="dateRange"
          isRange={true}
          label="회계일자"
          placeholder={["시작일", "종료일"]}
        />
        <FormInput
          type="search"
          name="asCust"
          label="거래처"
          width="250px"
          placeholder="거래처를 입력하세요"
          showReadOnlyBoxName="asCustname"
          onSearch={(value) => {
            //거래처 팝업 열기
            bcncModal.openModal({
              initialCustno: value || "",
              asOfficeId: user?.officeId,
            });
          }}
        />
      </SearchForm>

      {/* 부서조회 팝업 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
      <AppPageModal {...deptModal.modalProps} />
      {/* 거래처조회 팝역 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
      <AppPageModal {...bcncModal.modalProps} />
    </>
  );
};

export default FilterPanel;