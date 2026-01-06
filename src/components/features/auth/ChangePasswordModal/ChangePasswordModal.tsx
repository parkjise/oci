import { useState, useCallback } from "react";
import type { FC } from "react";
import { Form } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import { FormInput, FormButton } from "@components/ui/form";
import MessageModal from "@/components/ui/feedback/Message/MessageModal";
import { isValidPassword } from "@/utils/stringUtils";
import { changePasswordApi } from "@apis/auth";
import { useAuthStore } from "@store/com/auth/authStore";
import type { ChangePasswordResult } from "@/types/com/auth/auth.types";
import {
  ChangePwStyles,
  StyledPasswordRequirement,
} from "./ChangePasswordModal.styles";

/**
 * 비밀번호 변경 모달 컴포넌트
 */
const ChangePasswordModal: FC<InjectedProps<ChangePasswordResult>> = ({
  returnValue,
  close,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      // 비밀번호 일치 확인
      if (values.newPassword !== values.confirmPassword) {
        MessageModal.error({
          title: "입력 오류",
          content: "비밀번호가 일치하지 않습니다.",
        });
        return;
      }

      // 새 비밀번호 유효성 검증
      if (!isValidPassword(values.newPassword)) {
        MessageModal.error({
          title: "입력 오류",
          content: (
            <div>
              8자리 이상 영문 대/소문자, 숫자, 특수문자가 모두 포함되도록
              <br />
              입력하세요.
            </div>
          ),
        });
        return;
      }

      // 기존 비밀번호와 새 비밀번호가 같은지 확인
      if (values.currentPassword === values.newPassword) {
        form.setFields([
          {
            name: "newPassword",
            errors: ["기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다."],
          },
        ]);
        return;
      }

      setLoading(true);

      // 비밀번호 변경 API 호출
      if (!user?.empCode) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const response = await changePasswordApi({
        empCode: user.empCode,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (response.success) {
        MessageModal.success({
          title: "성공",
          content: "비밀번호가 변경되었습니다.",
          onOk: () => {
            returnValue({
              success: true,
              message: "비밀번호가 변경되었습니다.",
            });
          },
        });
      } else {
        throw new Error(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        // Form validation error
        return;
      }

      // // API 에러 메시지 추출
      // const errorMessage =
      //   err && typeof err === "object" && "message" in err
      //     ? String(err.message)
      //     : "비밀번호 변경에 실패했습니다.";

      // MessageModal.error({
      //   title: "오류",
      //   content: errorMessage,
      // });
    } finally {
      setLoading(false);
    }
  }, [form, returnValue, user?.empCode]);

  return (
    <ChangePwStyles className="password-change">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        className="password-change__form"
      >
        <Form.Item className="password-change__fields">
          <FormInput
            name="currentPassword"
            label="기존 비밀번호"
            type="password"
            prefix={<LockOutlined />}
            placeholder="기존 비밀번호를 입력하세요"
            className="password-change__field"
            rules={[
              {
                required: true,
                message: "기존 비밀번호를 입력하세요.",
              },
            ]}
          />

          <FormInput
            name="newPassword"
            label="새로운 비밀번호"
            type="password"
            prefix={<LockOutlined />}
            placeholder="새로운 비밀번호를 입력하세요"
            className="password-change__field"
            rules={[
              {
                required: true,
                message: "새로운 비밀번호를 입력하세요.",
              },
            ]}
          />

          <FormInput
            name="confirmPassword"
            label="비밀번호 확인"
            type="password"
            prefix={<LockOutlined />}
            placeholder="비밀번호 확인을 입력하세요"
            className="password-change__field"
            rules={[
              {
                required: true,
                message: "비밀번호 확인을 입력하세요.",
              },
            ]}
          />

          <StyledPasswordRequirement className="password-change__hint">
            * 8자리 이상 영문 대/소문자, 숫자, 특수문자가 모두 포함되도록
            입력하세요.
          </StyledPasswordRequirement>
        </Form.Item>
        <Form.Item className="password-change__footer">
          <div className="password-change__actions">
            <FormButton type="default" onClick={close} disabled={loading}>
              취소
            </FormButton>
            <FormButton
              type="primary"
              htmlType="submit"
              loading={loading}
              className="navy"
            >
              변경
            </FormButton>
          </div>
        </Form.Item>
      </Form>
    </ChangePwStyles>
  );
};

export default ChangePasswordModal;
