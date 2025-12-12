import { useState, useCallback, useEffect, useMemo } from "react";
import type { FC } from "react";
import { Space, Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import { showError, showSuccess } from "@/components/ui/feedback/Message";
import { FormSelect, FormInput, FormButton } from "@components/ui/form";
import dayjs from "dayjs";

/**
 * 월마감 모달에서 반환할 데이터 타입
 */
export type MtClosResult = {
  division?: string; // 사업부
  year?: string; // 회계연도
  periodFrom?: string; // Period 시작
  periodTo?: string; // Period 종료
  realYmFrom?: string; // 실제 회계연월 시작
  realYmTo?: string; // 실제 회계연월 종료
};

/**
 * 월마감 모달 컴포넌트의 Props 타입
 */
interface MtClosProps {
  /** 초기 연도 (선택적) */
  initialYear?: string;
}

/**
 * Period 옵션 타입
 */
interface PeriodOption {
  value: string; // YYMM 형식
  label: string; // PERIOD_NAME
}

/**
 * 월마감 모달 팝업 컴포넌트
 * usePageModal 훅과 함께 사용됩니다.
 */
const MtClos: FC<MtClosProps & InjectedProps<MtClosResult>> = ({
  initialYear,
  returnValue: _returnValue, // eslint-disable-line @typescript-eslint/no-unused-vars
  close,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // 현재 연도 가져오기
  const currentYear = dayjs().format("YYYY");

  // Period 옵션을 useMemo로 캐시 (연도 변경 시에만 재생성)
  const periodOptions = useMemo<PeriodOption[]>(() => {
    const year = selectedYear || initialYear || currentYear;
    const mockPeriods: PeriodOption[] = [];
    for (let i = 1; i <= 12; i++) {
      const month = String(i).padStart(2, "0");
      mockPeriods.push({
        value: year + month,
        label: `${year}-${month}`, // YYYY-MM 형식
      });
    }
    return mockPeriods;
  }, [selectedYear, initialYear, currentYear]);

  // YYYYMM을 YYYY.MM 형식으로 변환 (실제 회계연월 포맷)
  const formatYearMonth = useCallback((yyyymm: string): string => {
    if (!yyyymm || yyyymm.length !== 6) return yyyymm;
    return `${yyyymm.substring(0, 4)}.${yyyymm.substring(4, 6)}`;
  }, []);

  // Period 목록 로드 (useMemo로 대체되어 연도 상태만 업데이트)
  const loadPeriodOptions = useCallback(async (year: string) => {
    setSelectedYear(year);
  }, []);

  // 모달 열릴 때 초기값 설정
  useEffect(() => {
    const year = initialYear || currentYear;
    const periodFrom = year + "01";
    const periodTo = year + "12";

    form.setFieldsValue({
      year: year,
      periodFrom: periodFrom,
      periodTo: periodTo,
      realYmFrom: formatYearMonth(periodFrom),
      realYmTo: formatYearMonth(periodTo),
    });

    // Period 목록 조회
    loadPeriodOptions(year);
  }, [initialYear, currentYear, form, loadPeriodOptions, formatYearMonth]);

  // 회계연도 변경 핸들러
  const handleYearChange = useCallback(
    (value: string) => {
      if (!value) return;

      const periodFrom = value + "01";
      const periodTo = value + "12";

      // 연도 상태 업데이트 (useMemo가 자동으로 periodOptions 재계산)
      setSelectedYear(value);

      // 폼 필드 업데이트
      form.setFieldsValue({
        periodFrom: periodFrom,
        periodTo: periodTo,
        realYmFrom: formatYearMonth(periodFrom),
        realYmTo: formatYearMonth(periodTo),
      });
    },
    [form, formatYearMonth]
  );

  // Period 시작 변경 핸들러
  const handlePeriodFromChange = useCallback(
    (value: string) => {
      if (!value) return;

      const selectedYear = value.substring(0, 4);
      const formYear = form.getFieldValue("year");

      // 회계연도와 일치하는지 검증
      if (selectedYear !== formYear) {
        showError("회계연도 확인 바랍니다.");
        const defaultPeriod = formYear + "01";
        form.setFieldsValue({
          periodFrom: defaultPeriod,
          realYmFrom: formatYearMonth(defaultPeriod),
        });
        return;
      }

      // 실제 회계연월 업데이트 (YYYY.MM 형식)
      form.setFieldsValue({
        realYmFrom: formatYearMonth(value),
      });
    },
    [form, formatYearMonth]
  );

  // Period 종료 변경 핸들러
  const handlePeriodToChange = useCallback(
    (value: string) => {
      if (!value) return;

      const selectedYear = value.substring(0, 4);
      const formYear = form.getFieldValue("year");

      // 회계연도와 일치하는지 검증
      if (selectedYear !== formYear) {
        showError("회계연도 확인 바랍니다.");
        const defaultPeriod = formYear + "12";
        form.setFieldsValue({
          periodTo: defaultPeriod,
          realYmTo: formatYearMonth(defaultPeriod),
        });
        return;
      }

      // 실제 회계연월 업데이트 (YYYY.MM 형식)
      form.setFieldsValue({
        realYmTo: formatYearMonth(value),
      });
    },
    [form, formatYearMonth]
  );

  // 확인 버튼 핸들러
  const handleConfirm = useCallback(async () => {
    try {
      await form.validateFields();
      setLoading(true);

      // TODO: 월마감 처리 API 호출
      // const result: MtClosResult = {
      //   division: values.division,
      //   year: values.year,
      //   periodFrom: values.periodFrom,
      //   periodTo: values.periodTo,
      //   realYmFrom: values.realYmFrom,
      //   realYmTo: values.realYmTo,
      // };
      // const response = await monthCloseTag({
      //   division: result.division,
      //   year: result.year,
      //   periodFrom: result.periodFrom,
      //   periodTo: result.periodTo,
      //   realYmFrom: result.realYmFrom,
      //   realYmTo: result.realYmTo,
      // });

      showSuccess("정상적으로 마감되었습니다.");
      // 모달은 닫지 않고 유지
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation 에러는 무시 (Ant Design이 자동 처리)
        return;
      }
      showError("월마감 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <div
      style={{
        padding: "24px",
        width: "100%",
        minHeight: "350px",
        maxHeight: "400px",
        overflow: "hidden",
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        style={{ width: "100%" }}
        className="mt-clos-form"
      >
        <style>{`
          .mt-clos-form {
            display: grid;
            grid-template-columns: 1fr;
            row-gap: 1.2rem;
          }
          .mt-clos-form .ant-form-item {
            margin-bottom: 0;
            display: flex;
            align-items: center;
          }
          .mt-clos-form .ant-form-item-label {
            text-align: left;
            min-width: 110px;
            width: 110px !important;
            flex-shrink: 0 !important;
            margin-right: 1.2rem;
          }
          .mt-clos-form .ant-form-item-label > label {
            font-size: 1.2rem;
            width: 100%;
            height: 28px;
            display: flex;
            align-items: center;
            white-space: nowrap;
          }
          .mt-clos-form .ant-form-item-control {
             display: flex;
             align-items: center;
             min-height: 28px;
          }
          .mt-clos-form .ant-input,
          .mt-clos-form .ant-select, 
          .mt-clos-form .ant-select-selector,
          .mt-clos-form .ant-picker {
            height: 28px !important;
            min-height: 28px !important;
            display: flex;
            align-items: center;
          }
          .mt-clos-form .ant-select-selection-item {
            line-height: 28px !important;
            display: flex;
            align-items: center;
          }
          /* 중첩 Form.Item 마진 제거 */
          .mt-clos-form .ant-form-item .ant-form-item {
            margin-bottom: 0 !important;
          }
          /* 중첩된 아이템의 라벨 숨김 (Space 내부의 Input/Select용) */
          .mt-clos-form .ant-form-item .ant-form-item .ant-form-item-label {
            display: none !important;
          }
          /* 버튼 행 우측 정렬 */
          .mt-clos-form .button-row {
            justify-content: flex-end;
          }
          .mt-clos-form .button-row .ant-form-item-control {
            width: auto;
            min-width: 0;
            flex: 1;
            display: flex;
            justify-content: flex-end;
          }
          .mt-clos-form .button-row .ant-form-item-control-input-content {
             width: 100%;
             display: flex;
             justify-content: flex-end;
          }
          .mt-clos-form .button-row .ant-form-item-label {
             display: none !important;
          }
        `}</style>

        <FormSelect
          name="division"
          label="사업부"
          placeholder="전체"
          comCodeParams={{
            module: "PF",
            type: "ORG",
            enabledFlag: "Y",
          }}
          filterValues={["##"]}
          allOptionLabel="ALL"
          style={{ width: "150px" }}
        />

        <FormInput
          name="year"
          label="회계연도"
          placeholder="예: 2025"
          maxLength={4}
          style={{ width: "150px" }}
          onKeyPress={(e) => {
            // 숫자만 입력 허용
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            // 입력값이 4자리일 때만 처리
            if (value.length === 4) {
              handleYearChange(value);
            }
          }}
        />

        <Form.Item label="Period" colon={false} style={{ marginBottom: 0 }}>
          <Space align="center">
            <FormSelect
              name="periodFrom"
              label=""
              placeholder="시작"
              options={periodOptions}
              rules={[
                { required: true, message: "Period 시작을 선택해주세요." },
              ]}
              style={{ width: "150px" }}
              onChange={handlePeriodFromChange}
            />
            <span style={{ margin: "0 4px" }}>~</span>
            <FormSelect
              name="periodTo"
              label=""
              placeholder="종료"
              options={periodOptions}
              rules={[
                { required: true, message: "Period 종료를 선택해주세요." },
              ]}
              style={{ width: "150px" }}
              onChange={handlePeriodToChange}
            />
          </Space>
        </Form.Item>

        <Form.Item
          label="실제 회계연월"
          colon={false}
          style={{ marginBottom: 0 }}
        >
          <Space align="center">
            <FormInput
              name="realYmFrom"
              label=""
              placeholder="YYYY.MM"
              disabled
              style={{ width: "150px" }}
            />
            <span style={{ margin: "0 4px" }}>~</span>
            <FormInput
              name="realYmTo"
              label=""
              placeholder="YYYY.MM"
              disabled
              style={{ width: "150px" }}
            />
          </Space>
        </Form.Item>

        <Form.Item
          label=""
          className="button-row"
          style={{ marginTop: "16px", marginBottom: 0 }}
        >
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <FormButton onClick={close}>취소</FormButton>
            <FormButton
              type="primary"
              onClick={handleConfirm}
              loading={loading}
            >
              저장
            </FormButton>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MtClos;
