import React, { useEffect, useRef, useCallback } from "react";
import { Form, type FormInstance } from "antd";
import { FormInput, FormSelect, SearchForm } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { useMessageMngStore } from "@store/system/pgm/lang/message/messageMngStore";

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

const FilterPanel: React.FC = () => {
  const { t } = useTranslation();
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);

  // Store에서 상태와 액션 가져오기
  const { langTypeList, loading, search, reset } = useMessageMngStore();

  // 초기값 생성 함수
  const getInitialValues = useCallback(() => {
    return {
      lang: undefined,
      msgKey: undefined,
      msgContents: undefined,
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

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();

      // Store의 search 함수 호출
      await search({
        lang: values.lang || undefined,
        msgKey: values.msgKey || undefined,
        msgContents: values.msgContents || undefined,
      });
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        console.error("입력값을 확인해주세요.");
      } else {
        console.error("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [search]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

  // 언어 타입 옵션
  const langTypeOptions = langTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  return (
    <SearchForm
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      showExpand={false}
      visibleRows={1}
      columnsPerRow={4}
      className="page-layout__filter-panel"
    >
      <FormWatcher onFormInstanceReady={setForm} />
      <FormSelect
        name="lang"
        label={t("언어")}
        options={langTypeOptions}
        allowClear
        useModalMessage={false}
        placeholder={t("전체")}
      />
      <FormInput
        name="msgKey"
        label={t("메시지 키")}
        placeholder={t("메시지 키")}
        useModalMessage={false}
      />
      <FormInput
        name="msgContents"
        label={t("메시지 내용")}
        placeholder={t("메시지 내용")}
        useModalMessage={false}
      />
    </SearchForm>
  );
};

export default FilterPanel;
