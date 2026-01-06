import { useState, useCallback, useEffect } from "react";
import type { FC } from "react";
import { Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import {
  showError,
  showSuccess,
  confirm,
} from "@/components/ui/feedback/Message";
import { FormDatePicker } from "@components/ui/form";
import { useAuthStore } from "@store/com/auth/authStore";
import { processYyCyfd } from "@apis/fcm/gl/closing";
import type { YyCyfdPopupSrchRequest } from "@apis/fcm/gl/closing";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

/**
 * 연이월 모달에서 반환할 데이터 타입
 */
export type YyCyfdResult = {
  yearFrom?: string; // 시작연도
  yearTo?: string; // 종료연도
};

/**
 * 연이월 모달 컴포넌트의 Props 타입
 */
interface YyCyfdProps {
  /** 초기 연도 (선택적) */
  initialYear?: string;
}

/**
 * 연이월 모달 팝업 컴포넌트
 * usePageModal 훅과 함께 사용됩니다.
 */
const YyCyfd: FC<
  YyCyfdProps &
    InjectedProps<YyCyfdResult> & {
      setConfirmHandler?: (handler: (() => void) | null) => void;
    }
> = ({ initialYear, returnValue, setConfirmHandler }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [, setLoading] = useState(false);

  // 현재 연도 가져오기
  const currentYear = dayjs().format("YYYY");

  // 모달 열릴 때 초기값 설정 (as-is: 현재 연도, 현재 연도+1)
  useEffect(() => {
    const year = initialYear || currentYear;
    const nextYear = String(parseInt(year) + 1);
    const startOfYear = dayjs(`${year}-01-01`);
    const endOfYear = dayjs(`${nextYear}-12-31`);

    form.setFieldsValue({
      yearRange: [startOfYear, endOfYear],
    });
  }, [initialYear, currentYear, form]);

  // 확인 버튼 핸들러 (모달 기본 확인 버튼용)
  const handleConfirm = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const yearRange = values.yearRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;

      if (!yearRange || !yearRange[0] || !yearRange[1]) {
        showError("회계연도를 선택해주세요.");
        return;
      }

      const yearFrom = yearRange[0].format("YYYY");
      const yearTo = yearRange[1].format("YYYY");

      // 검증: 시작 연도가 종료 연도보다 작아야 함 (as-is 검증 로직)
      if (parseInt(yearFrom) >= parseInt(yearTo)) {
        showError("시작년도보다 종료년도가 커야합니다.");
        return;
      }

      // 사용자 정보 확인
      if (!user?.officeId || !user?.empCode) {
        showError("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // 확인 메시지 (as-is: "회계 당해년도 년마감을 실시 하시겠습니까?")
      confirm({
        content: "회계 당해년도 년마감을 실시 하시겠습니까?",
        onOk: async () => {
          try {
            setLoading(true);

            // API 요청 데이터 구성
            const request: YyCyfdPopupSrchRequest = {
              asRpsnOfficeId: user.officeId, // 대표사업장 ID
              asOfficeId: user.officeId, // 사업장 ID
              asYearFr: yearFrom, // 회계연도(시작)
              asYearTo: yearTo, // 회계연도(종료)
              asUserId: user.empCode, // 사용자 ID
              asProgramId: "YyCyfdPopup", // 프로그램 ID
              asTerminalId: "SYSTEM", // 터미널 ID
            };

            // API 호출
            const response = await processYyCyfd(request);

            if (response.success) {
              // 처리 성공 시 결과 반환
              const result: YyCyfdResult = {
                yearFrom: yearFrom,
                yearTo: yearTo,
              };

              // 성공 메시지 (as-is: "년이월 되었습니다!")
              showSuccess("년이월 되었습니다!");

              // 모달 닫기 및 결과 반환
              returnValue(result);
            } else {
              showError(response.message || "처리 중 오류가 발생했습니다.");
            }
          } catch {
            showError("처리 중 오류가 발생했습니다.");
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
        minHeight: "250px",
        maxHeight: "300px",
        overflow: "hidden",
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        style={{ width: "100%" }}
        className="yy-cyfd-form"
      >
        <style>{`
          .yy-cyfd-form {
            display: grid;
            grid-template-columns: 1fr;
            row-gap: 1.2rem;
          }
          .yy-cyfd-form .ant-form-item {
            margin-bottom: 0;
            display: flex;
            align-items: center;
          }
          .yy-cyfd-form .ant-form-item-label {
            text-align: left;
            min-width: 110px;
            width: 110px !important;
            flex-shrink: 0 !important;
            margin-right: 1.2rem;
          }
          .yy-cyfd-form .ant-form-item-label > label {
            font-size: 1.2rem;
            width: 100%;
            height: 28px;
            display: flex;
            align-items: center;
            white-space: nowrap;
          }
          .yy-cyfd-form .ant-form-item-control {
            display: flex;
            align-items: center;
            min-height: 28px;
            flex: 1;
          }
          .yy-cyfd-form .ant-picker {
            height: 28px !important;
            min-height: 28px !important;
            display: flex;
            align-items: center;
          }
          .yy-cyfd-form .button-row {
            justify-content: flex-end;
          }
          .yy-cyfd-form .button-row .ant-form-item-control {
            width: auto;
            min-width: 0;
            flex: 1;
            display: flex;
            justify-content: flex-end;
          }
          .yy-cyfd-form .button-row .ant-form-item-control-input-content {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
          .yy-cyfd-form .button-row .ant-form-item-label {
             display: none !important;
          }
        `}</style>

        <FormDatePicker
          name="yearRange"
          label={t("회계연도")}
          isRange={true}
          placeholder={["시작연도", "종료연도"]}
          picker="year"
          format="YYYY"
          rules={[{ required: true, message: "회계연도를 선택해주세요." }]}
        />
      </Form>
    </div>
  );
};

export default YyCyfd;
