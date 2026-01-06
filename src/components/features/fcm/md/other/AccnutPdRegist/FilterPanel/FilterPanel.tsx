import React, { useEffect, useCallback } from "react";
import { Form, Space } from "antd";
import { useTranslation } from "react-i18next";
import { FormDatePicker, FormButton, SearchForm } from "@form";
import { useAccnutPdRegistStore } from "@/store/fcm/md/other/AccnutPdRegist/accnutPdRegistStore";
import dayjs from "dayjs";

interface FilterPanelProps {
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const currentYear = useAccnutPdRegistStore((state) => state.currentYear);
  const nextYear = useAccnutPdRegistStore((state) => state.nextYear);
  const loading = useAccnutPdRegistStore((state) => state.loading);
  const setCurrentYear = useAccnutPdRegistStore(
    (state) => state.setCurrentYear
  );
  const setNextYear = useAccnutPdRegistStore((state) => state.setNextYear);
  const moveYear = useAccnutPdRegistStore((state) => state.moveYear);
  const fetchPeriodList = useAccnutPdRegistStore(
    (state) => state.fetchPeriodList
  );
  const copyToNextYear = useAccnutPdRegistStore(
    (state) => state.copyToNextYear
  );

  // 초기값 설정
  useEffect(() => {
    if (form) {
      form.setFieldsValue({
        currentYear: dayjs(currentYear, "YYYY"),
        nextYear: dayjs(nextYear, "YYYY"),
      });
    }
  }, [form, currentYear, nextYear]);

  // 연도 변경 시
  const handleYearChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const year = date.format("YYYY");
      setCurrentYear(year);
    }
  };

  // Enter 키 이벤트 핸들러 (currentYear)
  const handleYearKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const formValues = form.getFieldsValue();
      const currentYearValue = formValues.currentYear
        ? formValues.currentYear.format("YYYY")
        : currentYear;
      const nextYearValue = formValues.nextYear
        ? formValues.nextYear.format("YYYY")
        : nextYear;

      setCurrentYear(currentYearValue);
      setNextYear(nextYearValue);
      fetchPeriodList(currentYearValue, nextYearValue);
    }
  };

  // Enter 키 이벤트 핸들러 (nextYear)
  const handleNextYearKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const formValues = form.getFieldsValue();
      const currentYearValue = formValues.currentYear
        ? formValues.currentYear.format("YYYY")
        : currentYear;
      const nextYearValue = formValues.nextYear
        ? formValues.nextYear.format("YYYY")
        : nextYear;

      setCurrentYear(currentYearValue);
      setNextYear(nextYearValue);
      fetchPeriodList(currentYearValue, nextYearValue);
    }
  };

  // 다음 연도 변경 시
  const handleNextYearChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const year = date.format("YYYY");
      setNextYear(year);
    }
  };

  // 조회 버튼
  const handleSearch = useCallback(() => {
    // 폼의 현재 값을 가져와서 직접 전달
    const formValues = form.getFieldsValue();
    const currentYearValue = formValues.currentYear
      ? formValues.currentYear.format("YYYY")
      : currentYear;
    const nextYearValue = formValues.nextYear
      ? formValues.nextYear.format("YYYY")
      : nextYear;

    // Store에도 반영
    setCurrentYear(currentYearValue);
    setNextYear(nextYearValue);

    // 조회 실행 (값을 직접 전달)
    fetchPeriodList(currentYearValue, nextYearValue);
  }, [
    form,
    currentYear,
    nextYear,
    fetchPeriodList,
    setCurrentYear,
    setNextYear,
  ]);

  // 초기화 버튼
  const handleReset = useCallback(() => {
    if (!form) return;
    const today = dayjs();
    const nextYearValue = today.add(1, "year");
    form.setFieldsValue({
      currentYear: today,
      nextYear: nextYearValue,
    });
    setCurrentYear(today.format("YYYY"));
    setNextYear(nextYearValue.format("YYYY"));
  }, [form, setCurrentYear, setNextYear]);

  // 이전 연도 버튼
  const handlePrevYear = () => {
    moveYear(-1);
  };

  // 다음 연도 버튼
  const handleNextYear = () => {
    moveYear(1);
  };

  // Copy to Next Year 버튼
  const handleCopyToNextYear = () => {
    // Form의 실제 값을 가져와서 전달
    const formValues = form.getFieldsValue();
    const currentYearValue = formValues.currentYear
      ? formValues.currentYear.format("YYYY")
      : currentYear;
    const nextYearValue = formValues.nextYear
      ? formValues.nextYear.format("YYYY")
      : nextYear;

    copyToNextYear(currentYearValue, nextYearValue);
  };

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      showExpand={false}
      visibleRows={1}
      columnsPerRow={4}
      className={className}
    >
      <Space>
        <FormDatePicker
          name="currentYear"
          label={t("연도")}
          picker="year"
          onChange={handleYearChange}
          onKeyDown={handleYearKeyDown}
          style={{ width: 120 }}
          format="YYYY"
        />
        <FormButton onClick={handlePrevYear}>◀</FormButton>
        <FormButton onClick={handleNextYear}>▶</FormButton>
      </Space>

      <Space>
        <FormButton onClick={handleCopyToNextYear}>
          Copy to Next Year
        </FormButton>
        <FormDatePicker
          name="nextYear"
          label=""
          picker="year"
          onChange={handleNextYearChange}
          onKeyDown={handleNextYearKeyDown}
          style={{ width: 120 }}
          format="YYYY"
        />
      </Space>
    </SearchForm>
  );
};

export default FilterPanel;
