import { BASE_EN, CONTENT_EN, SIDEBAR_EN } from "./locales/english";
import { BASE_VI, CONTENT_VI, SIDEBAR_VI } from "./locales/vietnamese";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const locales = {
  vi: "Tiếng việt",
  en: "English",
};

export const resources = {
  en: {
    sidebar: SIDEBAR_EN,
    content: CONTENT_EN,
    base: BASE_EN,
  },
  vi: {
    sidebar: SIDEBAR_VI,
    content: CONTENT_VI,
    base: BASE_VI,
  },
};

export const defaultNS = "sidebar";
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: ["sidebar", "content"],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
