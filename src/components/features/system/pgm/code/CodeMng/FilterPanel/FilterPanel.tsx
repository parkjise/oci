import React, { useEffect, useCallback, useState } from "react";
import { Form } from "antd";
import {
  FormInput,
  FormSelect,
  SearchForm,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { useCodeMngStore } from "@store/system/pgm/code/codeMngStore";
import CodeTypeModal from "../CodeTypeModal/CodeTypeModal";

const FilterPanel: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const {
    moduleOptions,
    selectedModule,
    codeType,
    codeTypeName,
    loading,
    search,
    reset,
    setSelectedModule,
    setCodeType,
  } = useCodeMngStore();

  const getInitialValues = useCallback(() => {
    return {
      module: undefined,
      codeType: undefined,
      codeTypeName: undefined,
    };
  }, []);

  // 초기값 설정
  useEffect(() => {
    form.setFieldsValue(getInitialValues());
  }, [form, getInitialValues]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // 모듈 변경 핸들러
  const handleModuleChange = useCallback(
    (value: string | undefined) => {
      setSelectedModule(value);
      form.setFieldsValue({
        codeType: undefined,
        codeTypeName: undefined,
      });
    },
    [form, setSelectedModule]
  );

  // 공통코드구분 조회 모달 오픈
  const handleOpenTypeModal = useCallback(() => {
    if (!selectedModule) {
      // message는 store에서 처리
      return;
    }
    setIsTypeModalOpen(true);
  }, [selectedModule]);

  // 공통코드구분 선택 콜백
  const handleSelectType = useCallback(
    (type: string, typeName?: string) => {
      setCodeType(type, typeName);
      form.setFieldsValue({
        codeType: type,
        codeTypeName: typeName || "",
      });
    },
    [form, setCodeType]
  );

  // 조회 핸들러
  const handleSearch = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!values.module) {
        // message는 store에서 처리
        return;
      }
      if (!values.codeType) {
        // message는 store에서 처리
        return;
      }

      await search({
        module: values.module,
        type: values.codeType,
        enabledFlag: "Y",
        checkDateRange: true,
      });
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        console.error("입력값을 확인해주세요.");
      } else {
        console.error("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [form, search]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    form.setFieldsValue(getInitialValues());
    setSelectedModule(undefined);
    setCodeType("", "");
  }, [form, getInitialValues, setSelectedModule, setCodeType]);

  // 모듈 옵션
  const moduleSelectOptions = moduleOptions.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  // Form 값 동기화 (store 값 변경 시)
  useEffect(() => {
    form.setFieldsValue({
      module: selectedModule,
      codeType: codeType,
      codeTypeName: codeTypeName,
    });
  }, [form, selectedModule, codeType, codeTypeName]);

  return (
    <>
      <SearchForm
        form={form}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
        showReset={true}
        showExpand={false}
        visibleRows={1}
        columnsPerRow={4}
        className="page-layout__filter-panel"
      >
        <FormSelect
          name="module"
          label={t("모듈구분")}
          options={moduleSelectOptions}
          allowClear={false}
          useModalMessage={false}
          placeholder={t("모듈구분")}
          onChange={handleModuleChange}
        />
        <FormInput
          type="search"
          name="codeType"
          label={t("공통코드구분")}
          placeholder={t("공통코드구분")}
          onSearch={handleOpenTypeModal}
          onPopupOpen={handleOpenTypeModal}
          showReadOnlyBoxName="codeTypeName"
          onPressEnter={handleSearch}
          useModalMessage={false}
          onChange={(e) => {
            setCodeType(e.target.value, "");
            form.setFieldsValue({
              codeTypeName: "",
            });
          }}
        />
      </SearchForm>

      {/* 공통코드구분 조회 모달 */}
      <CodeTypeModal
        open={isTypeModalOpen}
        module={selectedModule}
        initialType={codeType}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={handleSelectType}
      />
    </>
  );
};

export default FilterPanel;
