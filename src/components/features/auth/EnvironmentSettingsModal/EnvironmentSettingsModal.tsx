import React, { useState, useCallback, useMemo } from "react";
import type { FC } from "react";
import { Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import {
  FormInput,
  FormSelect,
  FormRadioGroup,
  FormButton,
  DataForm,
  type TableField,
  type TableRow,
} from "@components/ui/form";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { updateEnvApi } from "@apis/auth";
import { useAuthStore } from "@store/com/auth/authStore";
import type { UpdateEnvRequest } from "@/types/com/auth/auth.types";
import { EnvironmentSettingsStyles } from "./EnvironmentSettingsModal.styles";
import i18n from "@/i18n";

// 상수 정의 (컴포넌트 외부로 이동하여 재생성 방지)
const MAIN_SCREEN_OPTIONS = [{ value: "Default", label: "Default" }];

const EMAIL_RECEIVE_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
];

// 기본값 상수
const DEFAULT_VALUES = {
  emailReceiveYn: "Y",
  langType: "ko",
  mainType: "Default",
} as const;

// Validation rules 상수 (재생성 방지)
const EMAIL_RULES = [
  {
    required: true,
    message: "이메일을 입력하세요.",
  },
  {
    type: "email" as const,
    message: "올바른 이메일 형식이 아닙니다.",
  },
];

const MAIL_RECEIVE_RULE = {
  required: true,
  message: "메일수신여부를 선택하세요.",
};

// 입력 컴포넌트 래퍼 (DataForm의 inputComponent용)
// DataForm이 전달하는 props 중 필요한 것만 사용하고 나머지는 무시
interface InputWrapperProps {
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  type?: string;
  mode?: "view" | "edit";
  [key: string]: unknown;
}

// 필드 설정 헬퍼 함수 (ManageItemInputPopup 패턴 참고)
const createField = ({
  key,
  label,
  inputComponent,
  required,
  ...options
}: {
  key: string;
  label: string;
  inputComponent: React.ComponentType<InputWrapperProps>;
  required?: boolean;
  [key: string]: unknown;
}): TableField => ({
  key,
  label,
  required,
  inputComponent: (props: InputWrapperProps) =>
    React.createElement(inputComponent, { ...props, ...options }),
  ...options,
});

// 입력 컴포넌트 래퍼를 React.memo로 최적화하여 불필요한 리렌더링 방지
const TextInputWrapper = React.memo<InputWrapperProps>((props) => (
  <FormInput
    name={props.name}
    label=""
    placeholder={props.placeholder}
    disabled={props.disabled}
    type={props.type}
    mode={props.mode}
  />
));
TextInputWrapper.displayName = "TextInputWrapper";

const EmailInputWrapper = React.memo<InputWrapperProps>((props) => (
  <FormInput
    name={props.name}
    label=""
    placeholder={props.placeholder}
    type="email"
    mode={props.mode}
    rules={EMAIL_RULES}
  />
));
EmailInputWrapper.displayName = "EmailInputWrapper";

const SelectWrapper = React.memo<InputWrapperProps>((props) => {
  // placeholder 기반 메시지 생성 (메모이제이션)
  const rules = React.useMemo(
    () => [
      {
        required: true,
        message: `${props.placeholder || "값"}을(를) 선택하세요.`,
      },
    ],
    [props.placeholder]
  );

  return (
    <FormSelect
      name={props.name}
      label=""
      placeholder={props.placeholder}
      options={props.options}
      mode={props.mode}
      rules={rules}
    />
  );
});
SelectWrapper.displayName = "SelectWrapper";

const RadioGroupWrapper = React.memo<InputWrapperProps>((props) => (
  <FormRadioGroup
    name={props.name}
    label=""
    options={props.options}
    mode={props.mode}
    rules={[MAIL_RECEIVE_RULE]}
  />
));
RadioGroupWrapper.displayName = "RadioGroupWrapper";

/**
 * 환경 설정 모달 컴포넌트
 */
const EnvironmentSettingsModal: FC<InjectedProps<void>> = ({
  returnValue,
  close,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  // 폼 초기값 계산 (useMemo로 메모이제이션하여 불필요한 재계산 방지)
  const initialValues = useMemo(() => {
    if (!user) {
      return {
        userId: "",
        mailId: "",
        emailReceiveYn: DEFAULT_VALUES.emailReceiveYn,
        langType: DEFAULT_VALUES.langType,
        mainType: DEFAULT_VALUES.mainType,
      };
    }

    return {
      userId: user.empyId || user.empCode,
      mailId: user.emailId || "",
      emailReceiveYn: user.emailReceiveYn || DEFAULT_VALUES.emailReceiveYn,
      langType: user.langType || DEFAULT_VALUES.langType,
      mainType: user.mainType || DEFAULT_VALUES.mainType,
    };
  }, [user]);

  // 변경사항 확인에 필요한 필드만 감시 (전체 폼 감시보다 효율적)
  const mailId = Form.useWatch("mailId", form);
  const emailReceiveYn = Form.useWatch("emailReceiveYn", form);
  const langType = Form.useWatch("langType", form);
  const mainType = Form.useWatch("mainType", form);

  // 변경사항이 있는지 확인하는 함수
  const hasChanges = useMemo(() => {
    if (!initialValues) return false;

    return (
      mailId !== initialValues.mailId ||
      emailReceiveYn !== initialValues.emailReceiveYn ||
      langType !== initialValues.langType ||
      mainType !== initialValues.mainType
    );
  }, [mailId, emailReceiveYn, langType, mainType, initialValues]);

  // 사용자 정보 및 언어 업데이트 처리
  const updateUserAndLanguage = useCallback(
    async (formValues: {
      mailId: string;
      emailReceiveYn: string;
      langType: string;
      mainType: string;
    }) => {
      // 현재 사용자 정보를 폼 값으로 업데이트
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          emailId: formValues.mailId,
          emailReceiveYn: formValues.emailReceiveYn,
          langType: formValues.langType,
          mainType: formValues.mainType,
        });
      }

      // 언어 변경 시 i18n 언어도 변경
      if (formValues.langType && formValues.langType !== i18n.language) {
        await i18n.changeLanguage(formValues.langType);
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      // 변경사항이 없으면 저장하지 않음
      if (!hasChanges) {
        MessageModal.info({
          title: "알림",
          content: "변경된 내용이 없습니다.",
        });
        return;
      }

      const updateData: UpdateEnvRequest = {
        emailId: values.mailId,
        emailReceiveYn: values.emailReceiveYn,
        langType: values.langType,
        mainType: values.mainType,
      };

      setLoading(true);

      const response = await updateEnvApi(updateData);

      if (!response.success) {
        throw new Error(response.message || "환경 설정 저장에 실패했습니다.");
      }

      MessageModal.success({
        title: "성공",
        content: "환경 설정이 저장되었습니다.",
        onOk: async () => {
          // 모달이 닫히기 전에 사용자 정보 갱신
          await updateUserAndLanguage({
            mailId: values.mailId,
            emailReceiveYn: values.emailReceiveYn,
            langType: values.langType,
            mainType: values.mainType,
          });
          returnValue();
        },
      });
    } catch (err: unknown) {
      // Form validation error는 무시
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }

      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "환경 설정 저장에 실패했습니다.";

      MessageModal.error({
        title: "오류",
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [form, returnValue, updateUserAndLanguage, hasChanges]);

  // 저장 버튼 클릭 핸들러 (인라인 함수 대신 useCallback 사용)
  const handleSubmitClick = useCallback(() => {
    form.submit();
  }, [form]);

  // DataForm용 tableRows 정의
  const tableRows = useMemo<TableRow[]>(() => {
    return [
      {
        fields: [
          createField({
            key: "userId",
            label: "사용자 ID",
            required: false,
            inputComponent: TextInputWrapper,
            disabled: true,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "mailId",
            label: "mail_id",
            required: true,
            inputComponent: EmailInputWrapper,
            placeholder: "이메일을 입력하세요",
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "emailReceiveYn",
            label: "메일수신여부",
            required: true,
            inputComponent: RadioGroupWrapper,
            options: EMAIL_RECEIVE_OPTIONS,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "mainType",
            label: "메인화면",
            required: true,
            inputComponent: SelectWrapper,
            placeholder: "메인화면을 선택하세요",
            options: MAIN_SCREEN_OPTIONS,
          }),
        ],
      },
    ];
  }, []);

  return (
    <EnvironmentSettingsStyles className="environment-settings">
      <DataForm
        form={form}
        tableRows={tableRows}
        tableData={initialValues}
        mode="edit"
        onFinish={handleSubmit}
        className="environment-settings__form"
      />
      <div className="environment-settings__footer">
        <div className="environment-settings__actions">
          <FormButton type="default" onClick={close} disabled={loading}>
            닫기
          </FormButton>
          <FormButton
            type="primary"
            onClick={handleSubmitClick}
            loading={loading}
            className="navy"
          >
            저장
          </FormButton>
        </div>
      </div>
    </EnvironmentSettingsStyles>
  );
};

export default EnvironmentSettingsModal;
