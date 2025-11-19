import React, { useEffect, useState } from "react";
import { Form, Input, Checkbox, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { LoginFormValues } from "@/model/login";
import { loginApi } from "@apis/authApi";
import { useAuthStore } from "@/store/authStore";
import { showError, showInfo } from "@/components/common/message";
import { StyledForgotLink, StyledLoginButton } from "./LoginForm.styles";

const LoginForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // localStorage에서 저장된 아이디 불러오기
    const rememberedId: string | null = localStorage.getItem("rememberedId");
    if (rememberedId) {
      form.setFieldsValue({
        username: rememberedId,
        remember: true,
      });
    }
  }, [form]);

  const handleRememberChange = (checked: boolean) => {
    const username = form.getFieldValue("username");
    if (!checked && username) {
      // remember 체크 해제 시 localStorage에서 제거
      localStorage.removeItem("rememberedId");
    }
  };

  const onFinish: FormProps<LoginFormValues>["onFinish"] = async (values) => {
    if (import.meta.env.DEV) {
      // 개발 모드에서만 로그 출력
      console.log("로그인 정보:", values);
    }

    // remember 체크 시 localStorage에 아이디 저장
    if (values.remember && values.username) {
      localStorage.setItem("rememberedId", values.username);
    } else {
      localStorage.removeItem("rememberedId");
    }
    try {
      const response = await loginApi({
        empCode: values.username || "",
        password: values.password || "",
        locale: i18n.language,
      });
      if (response.success) {
        if (import.meta.env.DEV) {
          console.log("로그인 성공:", response.data);
        }
        // Zustand에 사용자 정보 저장
        if (response.data?.user) {
          setUser({
            officeId: response.data.user.officeId,
            empCode: response.data.user.empCode,
            empName: response.data.user.empName,
            deptCode: response.data.user.deptCode,
            password: response.data.user.password,
            useYn: response.data.user.useYn,
            emailId: response.data.user.emailId,
          });
        }
        // Ant Design Notification 표시
        notification.success({
          message: t("login_success", "로그인 성공!"),
          description: `${values.username}${t(
            "welcome_message",
            "님, 환영합니다!"
          )}`,
          placement: "topRight",
          duration: 2,
        });
        // 메인 페이지로 이동
        navigate("/app");
      } else {
        showError(
          t(
            "login_failed",
            "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
          )
        );
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("로그인 실패:", error);
      }
    }
  };

  const onFinishFailed: FormProps<LoginFormValues>["onFinishFailed"] = (
    errorInfo
  ) => {
    if (import.meta.env.DEV) {
      // 개발 모드에서만 로그 출력
      console.log("로그인 실패:", errorInfo);
    }
    showError(t("login_fail", "필수 항목을 모두 입력해주세요."));
  };

  const handleResetPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // 비밀번호 초기화 로직 구현
    showInfo(t("resetPassword", "비밀번호 초기화 기능은 준비 중입니다."));
  };

  const [showCaseWarning, setShowCaseWarning] = useState<boolean>(false);

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) {
      setShowCaseWarning(true);
    } else {
      setShowCaseWarning(false);
    }
  };

  const handlePasswordKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState("CapsLock")) {
      setShowCaseWarning(true);
    } else {
      setShowCaseWarning(false);
    }
  };

  return (
    <Form
      form={form}
      name="login_form"
      initialValues={{ remember: false }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item<LoginFormValues>
        name="username"
        rules={[
          {
            required: true,
            message: t("username_required", "아이디를 입력해주세요!"),
          },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t("username", "아이디")}
        />
      </Form.Item>

      <Form.Item<LoginFormValues>
        name="password"
        rules={[
          {
            required: true,
            message: t("password_required", "비밀번호를 입력해주세요!"),
          },
        ]}
        extra={
          showCaseWarning ? (
            <div style={{ color: "orange", marginTop: "5px" }}>
              {t("caps_lock_on", "Caps Lock이 켜져 있습니다.")}
            </div>
          ) : null
        }
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t("password", "비밀번호")}
          onKeyDown={handlePasswordKeyDown}
          onKeyUp={handlePasswordKeyUp}
        />
      </Form.Item>

      <Form.Item>
        <Form.Item<LoginFormValues>
          name="remember"
          noStyle
          valuePropName="checked"
        >
          <Checkbox onChange={(e) => handleRememberChange(e.target.checked)}>
            {t("save_id", "ID 저장")}
          </Checkbox>
        </Form.Item>
        <StyledForgotLink href="#" onClick={handleResetPassword}>
          {t("resetPassword", "비밀번호 초기화")}
        </StyledForgotLink>
      </Form.Item>

      <Form.Item>
        <StyledLoginButton type="primary" htmlType="submit" block>
          {t("login_button", "로그인")}
        </StyledLoginButton>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
