import React from "react";
// Barrel 파일을 통해 컴포넌트들을 한번에 가져옵니다.
import {
  LanguageSwitcher,
  LoginForm,
  LoginTitle,
} from "@components/login/Index";
import { StyledLoginPage, StyledLoginCard } from "./Login.styles";

const Login: React.FC = () => {
  return (
    <StyledLoginPage>
      <StyledLoginCard>
        <LanguageSwitcher />
        <LoginTitle />
        <LoginForm />
      </StyledLoginCard>
    </StyledLoginPage>
  );
};
export default Login;
