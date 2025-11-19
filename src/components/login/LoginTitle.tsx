import React from "react";

import { useTranslation } from "react-i18next";
import { StyledTitle } from "./LoginTitle.styles";

const LoginTitle: React.FC = () => {
  const { t } = useTranslation();

  return <StyledTitle level={2}>{t("login_page_title", "로그인")}</StyledTitle>;
};

export default LoginTitle;
