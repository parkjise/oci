import { useState, useCallback, useEffect } from "react";
import type { FC } from "react";
import { Space, Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import {
  showError,
  showSuccess,
  confirm,
} from "@/components/ui/feedback/Message";
import { FormSelect, FormInput } from "@components/ui/form";
import { useAuthStore } from "@store/com/auth/authStore";
import {
  createMtClosPopupTagCreat,
  selectMtClosPopupMT,
} from "@apis/fcm/gl/closing";
import type { MtClosPopupCreatRequest } from "@apis/fcm/gl/closing";
import { formatYearMonth } from "@utils/dateUtils";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

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
  value: string; // YYMM 형식 (예: "202501")
  label: string; // PERIOD_NAME (예: "2025-01")
  dateF?: string; // 시작일
  dateT?: string; // 종료일
}

/**
 * 월마감 모달 팝업 컴포넌트
 * usePageModal 훅과 함께 사용됩니다.
 */
const MtClos: FC<
  MtClosProps &
    InjectedProps<MtClosResult> & {
      setConfirmHandler?: (handler: (() => void) | null) => void;
    }
> = ({ initialYear, returnValue, setConfirmHandler }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [, setLoading] = useState(false);

  // Period 옵션을 State로 관리
  const [periodOptions, setPeriodOptions] = useState<PeriodOption[]>([]);

  // 현재 연도 가져오기
  const currentYear = dayjs().format("YYYY");

  // Period 목록 DB 조회
  const loadPeriodOptions = useCallback(
    async (year: string) => {
      if (!user?.officeId || !year) return;

      try {
        setLoading(true);

        const response = await selectMtClosPopupMT({
          officeId: user.officeId,
          year: year,
          adjustFlag: "N", // 마감되지 않은 기간만 조회
        });

        if (response.success && response.data) {
          const periods: PeriodOption[] = response.data.map((item) => ({
            value: item.yymm || "",
            label: item.periodName || "",
            dateF: item.dateF,
            dateT: item.dateT,
          }));

          setPeriodOptions(periods);

          // 첫 번째와 마지막 기간으로 자동 설정
          if (periods.length > 0) {
            form.setFieldsValue({
              periodFrom: periods[0].value,
              periodTo: periods[periods.length - 1].value,
              realYmFrom: formatYearMonth(periods[0].value),
              realYmTo: formatYearMonth(periods[periods.length - 1].value),
            });
          }
        }
      } catch {
        showError("회계기간 조회에 실패했습니다.");
        setPeriodOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [user, form]
  );

  // 모달 열릴 때 초기값 설정
  useEffect(() => {
    const year = initialYear || currentYear;

    form.setFieldsValue({
      year: year,
      periodFrom: "",
      periodTo: "",
      realYmFrom: "",
      realYmTo: "",
    });

    // Period 목록 조회 (자동으로 첫/마지막 값 설정됨)
    loadPeriodOptions(year);
  }, [initialYear, currentYear, form, loadPeriodOptions]);

  // 회계연도 변경 핸들러
  const handleYearChange = useCallback(
    (value: string) => {
      if (!value) return;
      if (value.length !== 4) return; // 4자리가 아니면 무시

      // DB에서 Period 목록 재조회 (자동으로 첫/마지막 값 설정됨)
      loadPeriodOptions(value);
    },
    [loadPeriodOptions]
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
    [form]
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
    [form]
  );

  // 확인 버튼 핸들러 (모달 기본 확인 버튼용)
  const handleConfirm = useCallback(async () => {
    try {
      const values = await form.validateFields();

      // 마감 확인 모달 추가
      confirm({
        content: "마감하시겠습니까?",
        onOk: async () => {
          try {
            setLoading(true);

            // 사용자 정보 확인
            if (!user?.officeId || !user?.empCode) {
              showError("사용자 정보를 찾을 수 없습니다.");
              return;
            }

            // Period 값이 YYYYMM 형식이므로 그대로 사용
            const realYmF = values.periodFrom || "";
            const realYmT = values.periodTo || "";

            if (!realYmF || !realYmT) {
              showError("Period를 선택해주세요.");
              return;
            }

            // API 요청 데이터 구성
            const request: MtClosPopupCreatRequest = {
              rspnOfficeId: user.officeId, // 대표사업장 ID
              officeId: user.officeId, // 사업장 ID
              realYmF: realYmF, // 실제 회계연월 시작 (YYYYMM 형식)
              realYmT: realYmT, // 실제 회계연월 종료 (YYYYMM 형식)
              dvs: values.division || "", // 사업부
              rapDept: "", // 담당부서 (필요시 추가)
              userId: user.empCode, // 사용자 ID
              programId: "MtClosPopup", // 프로그램 ID
              terminalId: "SYSTEM", // 터미널 ID
            };

            // API 호출
            const response = await createMtClosPopupTagCreat(request);

            if (response.success) {
              // 처리 성공 시 결과 반환
              const result: MtClosResult = {
                division: values.division,
                year: values.year,
                periodFrom: values.periodFrom,
                periodTo: values.periodTo,
                realYmFrom: values.realYmFrom,
                realYmTo: values.realYmTo,
              };

              showSuccess("정상적으로 마감되었습니다.");

              // 모달 닫기 및 결과 반환
              returnValue(result);
            } else {
              showError(
                response.message || "월마감 처리 중 오류가 발생했습니다."
              );
            }
          } catch {
            showError("월마감 처리 중 오류가 발생했습니다.");
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation 에러는 무시 (Ant Design이 자동 처리)
        return;
      }
      showError("입력값을 확인해주세요.");
    }
  }, [form, returnValue, user]);

  // 모달 기본 확인 버튼에 핸들러 등록
  useEffect(() => {
    if (setConfirmHandler) {
      setConfirmHandler(() => handleConfirm());
    }
    return () => {
      if (setConfirmHandler) {
        setConfirmHandler(null);
      }
    };
  }, [setConfirmHandler, handleConfirm]);

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
          label={t("사업부")}
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
          label={t("회계연도")}
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
          label={t("실제_회계연월")}
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
      </Form>
    </div>
  );
};

export default MtClos;
