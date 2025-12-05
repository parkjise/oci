import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./language/en/translation.json";
import koTranslation from "./language/ko/translation.json";

i18n
  // 브라우저 언어 감지 플러그인
  .use(LanguageDetector)
  // i18next를 react-i18next에 전달
  .use(initReactI18next)
  // i18next 초기화
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ko: {
        translation: koTranslation,
      },
    },
    // 기본 언어를 한국어로 설정
    lng: "ko",
    // 초기 언어 설정 (브라우저 감지 실패 시)
    fallbackLng: "ko",
    // 언어 감지 옵션: 기본값을 한국어로 설정
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    // 키가 없으면 키를 반환하도록 설정
    returnEmptyString: false,
    returnNull: false,
    // 키가 없을 때 키 자체를 반환
    missingKeyHandler: (_lng, _ns, key) => {
      return key;
    },
    // 이 옵션은 Suspense를 사용할 때 기본값이 true입니다.
    // 명시적으로 false로 설정하지 않았다면 문제 없습니다.
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.DEV, // 개발 모드에서만 디버깅 활성화
  });

export default i18n;
