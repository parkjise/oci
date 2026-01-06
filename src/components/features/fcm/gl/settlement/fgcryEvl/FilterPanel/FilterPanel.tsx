import React, { useCallback, useRef, useEffect } from "react";
import { Form, message, type FormInstance } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import {
  FormDatePicker,
  FormRadioGroup,
  SearchForm
} from "@components/ui/form";
import { useAuthStore } from "@store/com/auth/authStore";
import { useFgcryEvlStore } from "@/store/fcm/gl/settlement/FgcryEvlStore";
import type { FgcryEvlSrchRequest } from "@/types/fcm/gl/settlement/fgcryEvl.types";
import dayjs from "dayjs";


type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: FilterPanelRef) => void;
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

export type FilterPanelRef = {
  handleSearch: () => Promise<void>;
  getCurrentDate: () => string | null;
  getCurrentCategory: () => string | null;
  validateFields: () => Promise<boolean>;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onRefReady
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  const { user } = useAuthStore();
  const { search, loading } = useFgcryEvlStore();

  // 초기값 생성 함수 (중복 제거)
  const getInitialValues = useCallback(() => {
    const today = dayjs();

    return {
      FgcryDate: today, // dayjs 객체로 설정
      "radio-group": "1",
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

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

  // 조회 실행 함수 (공통 로직)
  const executeSearch = useCallback(async (radioValue?: string) => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();
      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 검증 및 타입 명시
      const FgcryDate = values.FgcryDate as dayjs.Dayjs | undefined;
      if (!FgcryDate) {
        message.error("회계일자를 선택해주세요.");
        return;
      }

      // 라디오 값이 전달되면 사용, 없으면 폼의 현재 값 사용
      const radioGroupValue = radioValue || values["radio-group"];
      
      // 숫자를 AP/AR/GL로 변환
      const categoryMap: Record<string, string> = {
        "1": "AP",
        "2": "AR",
        "3": "GL",
      };
      const selectedType = categoryMap[radioGroupValue] || radioGroupValue;

      const fgcryEvlSrchRequest: FgcryEvlSrchRequest = {
        asOfficeId: user.officeId,
        asStdDate: FgcryDate.format("YYYYMMDD"),
        asType: selectedType, // AP, AR, GL 문자열로 변환된 값 사용
        asFrExEvalId: "",
        asCurrDeci: "",
        asCurrFormat: "",
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== API 요청 파라미터 ===");
        console.log("fgcryEvlSrchRequest:", fgcryEvlSrchRequest);
        console.log("Form values:", values);
        console.log("Selected type:", selectedType);
        console.log("========================");
      }

      await search(fgcryEvlSrchRequest);
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

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    await executeSearch();
  }, [executeSearch]);

  // 구분값 변경 시 자동 조회 핸들러
  const handleRadioChange = useCallback(async (e: RadioChangeEvent) => {
    // 라디오 값이 변경되면 자동으로 조회 실행
    const selectedValue = e.target.value;
    await executeSearch(selectedValue);
  }, [executeSearch]);

  // 현재 회계일자 가져오기
  const getCurrentDate = useCallback((): string | null => {
    if (!formRef.current) return null;
    const values = formRef.current.getFieldsValue();
    const FgcryDate = values.FgcryDate as dayjs.Dayjs | undefined;
    return FgcryDate ? FgcryDate.format("YYYYMMDD") : null;
  }, []);

  // 현재 구분값 가져오기 (1=AP, 2=AR, 3=GL)
  const getCurrentCategory = useCallback((): string | null => {
    if (!formRef.current) return null;
    const values = formRef.current.getFieldsValue();
    const category = values["radio-group"] as string | undefined;
    if (!category) return null;
    
    // 숫자를 AP/AR/GL로 변환
    const categoryMap: Record<string, string> = {
      "1": "AP",
      "2": "AR",
      "3": "GL",
    };
    return categoryMap[category] || null;
  }, []);

  // 필드 검증
  const validateFields = useCallback(async (): Promise<boolean> => {
    if (!formRef.current) return false;
    try {
      await formRef.current.validateFields();
      return true;
    } catch {
      return false;
    }
  }, []);

  // ref를 통해 메서드들을 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      const ref: FilterPanelRef = {
        handleSearch,
        getCurrentDate,
        getCurrentCategory,
        validateFields,
      };
      onRefReady(ref);
    }
  }, [onRefReady, handleSearch, getCurrentDate, getCurrentCategory, validateFields]);

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
      <FormDatePicker
        name="FgcryDate"
        label="회계일자"
        placeholder=""
        className="filter-panel__field"
      />
      <FormRadioGroup
        name="radio-group"
        label="구분"
        options={[
          { value: "1", label: "AP" },
          { value: "2", label: "AR" },
          { value: "3", label: "GL" },
        ]}
        className="filter-panel__field"
        onChange={handleRadioChange}
      />
      {/* <FormDatePicker
          name="Reverse일자"
          label="Reverse일자"
          placeholder=""
          className="filter-panel__field"
        /> */}
    </SearchForm>
  );
};

FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
