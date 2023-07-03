import i18next from "i18next";

export const changeMsgLanguage = (resData: string, msg: string) => {
  let currentLanguage = i18next.language;
  return currentLanguage === "en" ? resData : msg;
};
