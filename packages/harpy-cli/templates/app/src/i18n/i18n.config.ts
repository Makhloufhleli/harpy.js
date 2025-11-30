import { I18nModuleOptions } from "@hepta-solutions/harpy-i18n";

export const i18nConfig: I18nModuleOptions = {
  defaultLocale: "en",
  locales: ["en", "fr"],
  urlPattern: "query", // 'query' or 'header'
  translationsPath: "../dictionaries",
  cookieName: "locale",
  queryParam: "lang",
};
