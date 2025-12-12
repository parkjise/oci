import { useState, useCallback, useEffect } from "react";
import type { FC } from "react";
import { Space, Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import { showError, showSuccess } from "@/components/ui/feedback/Message";
import { FormDatePicker, FormButton } from "@components/ui/form";
import dayjs from "dayjs";

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
const YyCyfd: FC<YyCyfdProps & InjectedProps<YyCyfdResult>> = ({
  initialYear,
  returnValue: _returnValue, // eslint-disable-line @typescript-eslint/no-unused-vars
  close,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 현재 연도 가져오기
  const currentYear = dayjs().format("YYYY");

  // 모달 열릴 때 초기값 설정
  useEffect(() => {
    const year = initialYear || currentYear;
    const startOfYear = dayjs(`${year}-01-01`);
    const endOfYear = dayjs(`${year}-12-31`);

    form.setFieldsValue({
      yearRange: [startOfYear, endOfYear],
    });
  }, [initialYear, currentYear, form]);

  // 확인 버튼 핸들러
  const handleConfirm = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const yearRange = values.yearRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;

      if (!yearRange || !yearRange[0] || !yearRange[1]) {
        showError("회계연도를 선택해주세요.");
        setLoading(false);
        return;
      }

      // TODO: 연이월 처리 API 호출
      // const result: YyCyfdResult = {
      //   yearFrom: yearRange[0].format("YYYY"),
      //   yearTo: yearRange[1].format("YYYY"),
      // };
      // const response = await yearCarryForward({
      //   yearFrom: result.yearFrom,
      //   yearTo: result.yearTo,
      // });

      showSuccess("정상적으로 처리되었습니다.");
      // 모달은 닫지 않고 유지
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation 에러는 무시 (Ant Design이 자동 처리)
        return;
      }
      showError("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [form]);

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
          label="회계연도"
          isRange={true}
          placeholder={["시작연도", "종료연도"]}
          picker="year"
          format="YYYY"
          rules={[{ required: true, message: "회계연도를 선택해주세요." }]}
        />

        <Form.Item
          label=""
          className="button-row"
          style={{ marginTop: "24px", marginBottom: 0 }}
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

export default YyCyfd;
