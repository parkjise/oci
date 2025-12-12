import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, message, type FormInstance } from "antd";
import { FormInput, FormSelect, SearchForm } from "@components/ui/form";
import { useAuthStore } from "@store/authStore";
import { useBcncRegistStore } from "@store/bcncRegistStore";
import type { BcncSrchRequest } from "@/types/fcm/md/partner/bcncRegist.types";

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

const FilterPanel: React.FC<FilterPanelProps> = ({ className, onRefReady }) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  // Form.useWatch를 위해 최소한의 state 필요 (setFormInstance만 사용)
  const [, setFormInstance] = useState<FormInstance | null>(null);
  const { user } = useAuthStore();
  const { search, loading } = useBcncRegistStore();

  // 초기값 생성 함수
  const getInitialValues = useCallback(() => {
    return {
      asType: "",
      searchCondition: "",
    };
  }, []);

  // Form 인스턴스 설정 함수
  const setForm = useCallback(
    (instance: FormInstance | null) => {
      formRef.current = instance;
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

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();

      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 검색조건에서 거래처코드 또는 거래처명 추출
      const searchCondition = values.searchCondition?.trim() || "";
      let asCustname: string | undefined;
      let asCustno: string | undefined;

      if (searchCondition) {
        // 숫자로만 구성되어 있으면 거래처코드로 간주, 그 외는 거래처명으로 간주
        if (/^\d+$/.test(searchCondition)) {
          asCustno = searchCondition;
        } else {
          asCustname = searchCondition;
        }
      }

      // API 요청 파라미터 구성
      const searchRequest: BcncSrchRequest = {
        asOfficeId: user.officeId,
        asType: values.asType || undefined,
        asCustname,
        asCustno,
      };

      // Store의 search 함수를 통해 API 호출
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
        name="asType"
        label="거래처구분"
        placeholder="전체"
        comCodeParams={{
          module: "MD",
          type: "CUSTGB",
          enabledFlag: "Y",
        }}
        allOptionLabel="ALL"
        allowClear
      />
      <FormInput
        name="searchCondition"
        label="검색조건"
        placeholder="거래처코드 또는 거래처명을 입력하세요"
      />
    </SearchForm>
  );
};

export default FilterPanel;
