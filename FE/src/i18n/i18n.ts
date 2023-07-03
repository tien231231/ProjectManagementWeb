import { BASE_EN, CONTENT_EN, MESSAGE_EN, SIDEBAR_EN } from "./locales/english";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  BASE_VI,
  CONTENT_VI,
  MESSAGE_VI,
  SIDEBAR_VI,
} from "./locales/vietnamese";

export const locales = {
  vi: "Tiếng việt",
  en: "English",
};

export const resources = {
  en: {
    sidebar: SIDEBAR_EN,
    content: CONTENT_EN,
    base: BASE_EN,
    message: MESSAGE_EN,
  },
  vi: {
    sidebar: SIDEBAR_VI,
    content: CONTENT_VI,
    base: BASE_VI,
    message: MESSAGE_VI,
  },
};

export const defaultNS = "sidebar";
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: ["sidebar", "content", "base", "message"],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
