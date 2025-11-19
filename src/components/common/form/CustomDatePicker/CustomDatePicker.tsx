import React from "react";
import { Form, DatePicker } from "antd";
import type { Rule } from "antd/es/form";
import type { Dayjs } from "dayjs";
import type { DatePickerProps } from "antd/es/date-picker";
import type { RangePickerProps } from "antd/es/date-picker";
import type { FormItemLayout } from "antd/es/form/Form";

const { RangePicker } = DatePicker;

// 단일 DatePicker Props
type SingleDatePickerProps = DatePickerProps & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  linkType?: "start" | "end";
  linkedTo?: string;
  isRange?: false;
};

// 범위 DatePicker Props
type RangeDatePickerProps = RangePickerProps & {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
  isRange: true;
  linkType?: never;
  linkedTo?: never;
};

// Union 타입
type CustomDatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  name,
  label,
  rules,
  isRange = false,
  linkType,
  linkedTo,
  layout,
  ...rest
}) => {
  const form = Form.useFormInstance();

  // 범위 선택 모드
  if (isRange) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={rules}
        layout={layout as FormItemLayout}
        colon={false}
      >
        <RangePicker
          style={{ width: "100%" }}
          {...(rest as RangePickerProps)}
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

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      layout={layout as FormItemLayout}
      colon={false}
    >
      <DatePicker
        style={{ width: "100%" }}
        disabledDate={disabledDate}
        {...(rest as DatePickerProps)}
      />
    </Form.Item>
  );
};

export default CustomDatePicker;
