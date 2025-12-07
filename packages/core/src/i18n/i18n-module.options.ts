/**
 * URL pattern for language detection
 * - 'query': /path?lang=en
 * - 'header': Uses headers only (x-lang, accept-language)
 */
export type I18nUrlPattern = "query" | "header";

/**
 * Configuration options for I18nModule
 */
export interface I18nModuleOptions {
  /**
   * Default locale to use when no locale is detected
   * @default 'en'
   */
  defaultLocale: string;

  /**
   * List of supported locales
   * @default ['en']
   */
  locales: string[];

  /**
   * URL pattern for language detection
   * @default 'query'
   */
  urlPattern?: I18nUrlPattern;

  /**
   * Path to the directory containing translation files
   * Files should be named {locale}.json
   * @default './dictionaries'
   */
  translationsPath?: string;

  /**
   * Cookie name for storing locale preference
   * @default 'locale'
   */
  cookieName?: string;

  /**
   * Query parameter name for locale (when urlPattern is 'query')
   * @default 'lang'
   */
  queryParam?: string;
}

/**
 * Token for injecting I18n module options
 */
export const I18N_MODULE_OPTIONS = "I18N_MODULE_OPTIONS";
