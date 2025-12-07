import { I18nModuleOptions } from "@harpy-js/i18n";

export const i18nConfig: I18nModuleOptions = {
  defaultLocale: "en",
  locales: ["en", "fr"],
  urlPattern: "header", // 'query' or 'header' - header is recommended for cleaner URLs
  translationsPath: "../dictionaries",
  cookieName: "locale",
  queryParam: "lang",
};
