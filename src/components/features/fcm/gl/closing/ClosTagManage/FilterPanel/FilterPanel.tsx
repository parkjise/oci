import React, { useCallback, useEffect, useRef } from "react";
import { Form } from "antd";
import { FormDatePicker, SearchForm } from "@components/ui/form";
import { useClosTagManageStore } from "@/store/fcm/gl/closing/closTagManageStore";
import { useAuthStore } from "@store/com/auth/authStore";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className, onRefReady }) => {
  // Form 인스턴스 생성
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { search, loading } = useClosTagManageStore();
  const { user } = useAuthStore();

  // 초기 로드 여부를 추적하는 ref (초기 로드 시에는 자동 조회하지 않음)
  const isInitialMount = useRef(true);
  const previousYearRef = useRef<string | null>(null);

  // 년도 필드 값 감시 (Form.useWatch 사용)
  const yearValue = Form.useWatch("year", form);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if (!form) return;
    form.setFieldsValue({
      year: dayjs(),
    });
  }, [form]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!form) return;

    try {
      const values = await form.validateFields();
      const searchParams = {
        year: values.year ? values.year.format("YYYY") : dayjs().format("YYYY"),
      };

      await search(searchParams, { officeId: user?.officeId });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("조회 실패:", error);
      }
    }
  }, [form, search, user]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  React.useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  // 초기값 설정 및 최초 화면 진입 시 자동 조회
  useEffect(() => {
    if (form && user?.officeId) {
      const initialYear = dayjs();
      form.setFieldsValue({
        year: initialYear,
      });
      previousYearRef.current = initialYear.format("YYYY");

      // 최초 화면 진입 시 자동 조회
      const searchParams = {
        year: initialYear.format("YYYY"),
      };

      // 초기값 설정 후 조회 실행
      setTimeout(async () => {
        try {
          await search(searchParams, { officeId: user.officeId });
          if (import.meta.env.DEV) {
            console.log("최초 화면 진입 시 자동 조회 완료:", searchParams);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("최초 화면 진입 시 자동 조회 실패:", error);
          }
        } finally {
          // 초기 마운트 플래그를 false로 변경
          isInitialMount.current = false;
        }
      }, 100);
    }
  }, [form, search, user?.officeId]);

  // 년도 변경 감지 및 자동 조회
  useEffect(() => {
    // 초기 마운트 시에는 자동 조회하지 않음
    if (isInitialMount.current) {
      return;
    }

    // yearValue가 유효한 경우에만 처리
    if (yearValue && dayjs.isDayjs(yearValue)) {
      const currentYear = yearValue.format("YYYY");

      // 이전 년도와 다를 때만 조회 실행
      if (previousYearRef.current !== currentYear) {
        previousYearRef.current = currentYear;

        if (import.meta.env.DEV) {
          console.log("년도 변경 감지 - 자동 조회 실행:", currentYear);
        }

        // 약간의 지연을 두어 Form의 상태 업데이트가 완료된 후 조회 실행
        setTimeout(() => {
          handleSearch();
        }, 100);
      }
    }
  }, [yearValue, handleSearch]);

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={1}
      columnsPerRow={4}
      className={className}
    >
      <FormDatePicker
        name="year"
        label={t("년도")}
        picker="year"
        format="YYYY"
        allowClear={false}
      />
    </SearchForm>
  );
};

export default FilterPanel;
