import React from "react";
import { Button, Space } from "antd";
import { useTranslation } from "react-i18next";
import { StyledContainer } from "./LanguageSwitcher.styles";

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: "ko" | "en") => {
    i18n.changeLanguage(lang);
  };

  return (
    <StyledContainer>
      <Space>
        <Button
          onClick={() => changeLanguage("ko")}
          disabled={i18n.language === "ko"}
        >
          {t("change_to_korean", "한국어")}
        </Button>
        <Button
          onClick={() => changeLanguage("en")}
          disabled={i18n.language === "en"}
        >
          {t("change_to_english", "English")}
        </Button>
      </Space>
    </StyledContainer>
  );
};

export default LanguageSwitcher;
