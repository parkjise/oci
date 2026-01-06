import React, { useCallback, useRef, useEffect } from "react";
import { Form, message, type FormInstance } from "antd";
import {
  FormSelect,
  SearchForm,
} from "@components/ui/form";
import { useAuthStore } from "@store/com/auth/authStore";
import { useAccnutMngCodeRegistStore } from "@/store/fcm/md/account/AccnutMngCodeRegistStore";
import type { AccnutMngCodeSrchRequest } from "@/types/fcm/md/account/AccnutMngCodeRegist.types";

type FilterPanelProps = {
  className?: string;
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
  onRefReady,
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  const { user } = useAuthStore();
  const {
    search,
    loading,
    mgmtDivCodeList,
    loadMgmtDivCodeList,
  } = useAccnutMngCodeRegistStore();

  // 초기값 생성 함수
  const getInitialValues = useCallback(() => {
    return {
      asMngType: "ACCMNG",
      asMngCode: "",
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
    },
    [getInitialValues]
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

      // API 요청 파라미터 구성
      const searchRequest: AccnutMngCodeSrchRequest = {
        asOfficeId: user.officeId,
        asModule: "GL",
        asType: values.asMngType || "ACCMNG",
        asCode: values.asMngCode || undefined,
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

  // 화면 로드 시 관리구분 코드 조회
  useEffect(() => {
    if (!user?.officeId) return;
  console.log("mgmtDivCodeList", user.officeId);
    loadMgmtDivCodeList({
      asOfficeId: user.officeId,
      asModule: "GL",
      asType: "ACCMNG",
    });
  }, [user?.officeId, loadMgmtDivCodeList]);
  

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
        name="asMngType"
        label="관리코드"
        placeholder="ACCMNG-Account Mgmt"
        options={[{value: "ACCMNG", label: "ACCMNG-Account Mgmt"}]}
      />
      <FormSelect
        name="asMngCode"
        label="관리구분"
        placeholder="전체"
        options={mgmtDivCodeList.map((item) => ({
          value: item.type || "",
          label: item.type || "",
        }))}
        allOptionLabel="전체"
      />

    </SearchForm>
  );
};

export default FilterPanel;