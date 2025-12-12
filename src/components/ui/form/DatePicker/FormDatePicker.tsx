import React from "react";
import { Form, DatePicker, Typography } from "antd";
import type { Rule } from "antd/es/form";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { DatePickerProps } from "antd/es/date-picker";
import type { RangePickerProps } from "antd/es/date-picker";
import type { FormItemLayout } from "antd/es/form/Form";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { canShowModal, resetModalFlag } from "@/utils/formModalUtils";
import { DatePickerStyles } from "@/components/ui/form/DatePicker/FormDatePicker.styles";
const { RangePicker } = DatePicker;
const { Text } = Typography;

// 단일 DatePicker Props
type SingleDatePickerProps = Omit<DatePickerProps, "mode" | "value"> & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  linkType?: "start" | "end";
  linkedTo?: string;
  isRange?: false;
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
  format?: string;
  value?: Dayjs | string | null; // 문자열도 지원
};

// 범위 DatePicker Props
type RangeDatePickerProps = Omit<RangePickerProps, "mode" | "value"> & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  isRange: true;
  linkType?: never;
  linkedTo?: never;
  useModalMessage?: boolean; // 모달 메시지 사용 여부 옵션 (기본값: true)
  mode?: "view" | "edit";
  emptyText?: string;
  format?: string;
  value?: [Dayjs, Dayjs] | [string, string] | null; // 문자열 배열도 지원
};

// Union 타입
type FormDatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  name,
  label,
  rules,
  isRange = false,
  linkType,
  linkedTo,
  layout,
  useModalMessage = true,
  mode = "edit",
  emptyText = "-",
  format = "YYYY-MM-DD",
  ...rest
}) => {
  const form = Form.useFormInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datePickerRef = React.useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rangePickerRef = React.useRef<any>(null);

  // useModalMessage가 true일 때만 required 규칙을 모달로 변환
  const processedRules = React.useMemo(() => {
    if (!rules || !useModalMessage) return rules;

    return rules.map((rule) => {
      if ("required" in rule && rule.required) {
        const ruleWithRequired = rule as Rule & {
          required: boolean;
          message?: string;
        };
        return {
          ...rule,
          validator: (
            _: unknown,
            value: Dayjs | [Dayjs, Dayjs] | null | undefined
          ) => {
            // 단일 DatePicker: Dayjs | null | undefined
            // RangePicker: [Dayjs, Dayjs] | null | undefined
            if (!value) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 DatePicker로 포커스 이동
                    setTimeout(() => {
                      if (isRange && rangePickerRef.current) {
                        rangePickerRef.current.focus();
                      } else if (!isRange && datePickerRef.current) {
                        datePickerRef.current.focus();
                      }
                    }, 500);
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            // RangePicker의 경우 배열의 각 요소가 null인지 체크
            if (Array.isArray(value) && (!value[0] || !value[1])) {
              const errorMessage =
                ruleWithRequired.message || `${label}을(를) 선택해주세요.`;

              // 첫 번째 모달만 표시
              if (canShowModal()) {
                MessageModal.error({
                  title: "선택 오류",
                  content: errorMessage,
                  onOk: () => {
                    resetModalFlag();
                    // 모달 닫힌 후 해당 RangePicker로 포커스 이동
                    setTimeout(() => {
                      if (rangePickerRef.current) {
                        rangePickerRef.current.focus();
                      }
                    }, 500);
                  },
                });
              }

              return Promise.reject(new Error(errorMessage));
            }
            return Promise.resolve();
          },
        } as Rule;
      }
      return rule;
    });
  }, [rules, label, useModalMessage, isRange]);

  // View 모드일 때 (모든 hooks 호출 후)
  if (mode === "view") {
    return (
      <Form.Item
        name={name}
        label={label}
        layout={layout as FormItemLayout}
        colon={false}
        style={{ marginBottom: 0 }}
      >
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const rawValue = getFieldValue(name);

            // 문자열을 dayjs 객체로 변환하는 헬퍼 함수
            const convertToDayjs = (value: unknown): Dayjs | null => {
              if (dayjs.isDayjs(value)) {
                return value;
              }
              if (typeof value === "string" && value) {
                const parsed = dayjs(value);
                return parsed.isValid() ? parsed : null;
              }
              return null;
            };

            if (isRange) {
              // 범위 선택
              const startValue = convertToDayjs(rawValue?.[0]);
              const endValue = convertToDayjs(rawValue?.[1]);
              const displayValue =
                startValue && endValue
                  ? `${startValue.format(format)} ~ ${endValue.format(format)}`
                  : emptyText;
              return <Text>{displayValue}</Text>;
            } else {
              // 단일 선택
              const value = convertToDayjs(rawValue);
              const displayValue = value ? value.format(format) : emptyText;
              return <Text>{displayValue}</Text>;
            }
          }}
        </Form.Item>
      </Form.Item>
    );
  }

  // 범위 선택 모드
  if (isRange) {
    // rest에서 value를 제외하고 나머지만 전달
    const { value, ...rangePickerRest } = rest as RangePickerProps & {
      value?: [Dayjs, Dayjs] | [string, string] | null;
    };

    // value prop 변환 (문자열 배열을 dayjs 객체 배열로)
    let processedValue: [Dayjs, Dayjs] | undefined = undefined;
    if (Array.isArray(value) && value.length === 2) {
      const startValue = dayjs.isDayjs(value[0])
        ? value[0]
        : typeof value[0] === "string"
        ? dayjs(value[0])
        : null;
      const endValue = dayjs.isDayjs(value[1])
        ? value[1]
        : typeof value[1] === "string"
        ? dayjs(value[1])
        : null;

      if (startValue?.isValid() && endValue?.isValid()) {
        processedValue = [startValue, endValue];
      }
    }

    return (
      <Form.Item
        name={name}
        label={label}
        rules={processedRules}
        layout={layout as FormItemLayout}
        colon={false}
        style={{ marginBottom: 0 }}
        {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
      >
        <DatePickerStyles
          as={RangePicker}
          ref={rangePickerRef}
          style={{ width: "100%" }}
          value={processedValue}
          {...rangePickerRest}
        />
      </Form.Item>
    );
  }

  // 단일 선택 모드 - 연동 기능 지원
  const disabledDate = (current: Dayjs | null): boolean => {
    if (!current) return false;

    // 연동 기능이 없으면 비활성화 없음
    if (!linkedTo || !linkType) {
      return false;
    }

    const linkedDate = form.getFieldValue(linkedTo) as Dayjs | undefined;
    if (!linkedDate) {
      return false;
    }

    // 시작일 선택 시: 종료일 이후 날짜 비활성화
    if (linkType === "start") {
      return current.isAfter(linkedDate, "day");
    }

    // 종료일 선택 시: 시작일 이전 날짜 비활성화
    if (linkType === "end") {
      return current.isBefore(linkedDate, "day");
    }

    return false;
  };

  // rest에서 onChange, onOk를 제외하고 나머지만 전달 (Form.Item이 onChange를 관리)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, onOk, value, ...datePickerRest } =
    rest as DatePickerProps & { value?: Dayjs | string | null };

  // value prop 변환 (문자열을 dayjs 객체로)
  let processedValue = undefined;
  if (dayjs.isDayjs(value)) {
    processedValue = value;
  } else if (typeof value === "string" && value) {
    const parsed = dayjs(value);
    if (parsed.isValid()) {
      processedValue = parsed;
    }
  }

  return (
    <Form.Item
      name={name}
      label={label}
      rules={processedRules}
      layout={layout as FormItemLayout}
      colon={false}
      style={{ marginBottom: 0 }}
      {...(useModalMessage ? { validateStatus: "", help: "" } : {})}
    >
      <DatePickerStyles
        ref={datePickerRef}
        style={{ width: "100%" }}
        disabledDate={disabledDate}
        value={processedValue}
        {...datePickerRest}
      />
    </Form.Item>
  );
};

export default FormDatePicker;
