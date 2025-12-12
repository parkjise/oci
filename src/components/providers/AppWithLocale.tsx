import React, { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import { useTranslation } from "react-i18next";
import ko_KR from "antd/locale/ko_KR";
import en_US from "antd/locale/en_US";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import "dayjs/locale/en";

interface AppWithLocaleProps {
  children: React.ReactNode;
}

/**
 * 언어에 따라 ConfigProvider를 동적으로 변경하는 컴포넌트
 * i18n 언어 변경을 감지하여 Ant Design locale과 dayjs locale을 자동으로 변경합니다.
 */
const AppWithLocale: React.FC<AppWithLocaleProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(ko_KR);

  useEffect(() => {
    const currentLang = i18n.language;

    if (currentLang === "ko") {
      setLocale(ko_KR);
      dayjs.locale("ko");
    } else if (currentLang === "en") {
      setLocale(en_US);
      dayjs.locale("en");
    }
  }, [i18n.language]);

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
};

export default AppWithLocale;
