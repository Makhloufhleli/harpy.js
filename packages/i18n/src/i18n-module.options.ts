export type I18nUrlPattern = "query" | "header";

export interface I18nModuleOptions {
  defaultLocale: string;
  locales: string[];
  urlPattern?: I18nUrlPattern;
  translationsPath?: string;
  cookieName?: string;
  queryParam?: string;
}

export const I18N_MODULE_OPTIONS = "I18N_MODULE_OPTIONS";
