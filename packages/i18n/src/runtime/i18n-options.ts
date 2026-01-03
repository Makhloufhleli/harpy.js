/**
 * I18n options for Bun runtime
 */

export type I18nUrlPattern = 'path' | 'query' | 'header';

export interface I18nOptions {
  /** Default locale to use when none is detected */
  defaultLocale: string;
  /** List of supported locales */
  locales: string[];
  /** URL pattern for locale detection: 'path' (/en/...), 'query' (?lang=en), 'header' (x-lang: en) */
  urlPattern?: I18nUrlPattern;
  /** Path to translations directory */
  translationsPath?: string;
  /** Cookie name for storing locale preference */
  cookieName?: string;
  /** Query parameter name for locale (when urlPattern is 'query') */
  queryParam?: string;
  /** Header name for locale detection (when urlPattern is 'header') */
  headerName?: string;
  /** Whether to detect locale from all sources (path, query, header, cookie) regardless of urlPattern */
  detectFromAll?: boolean;
}

export const I18N_OPTIONS = Symbol('I18N_OPTIONS');

/**
 * Normalize options with defaults
 */
export function normalizeI18nOptions(options: I18nOptions): Required<I18nOptions> {
  return {
    defaultLocale: options.defaultLocale || 'en',
    locales: options.locales || ['en'],
    urlPattern: options.urlPattern || 'query',
    translationsPath: options.translationsPath || './dictionaries',
    cookieName: options.cookieName || 'locale',
    queryParam: options.queryParam || 'lang',
    headerName: options.headerName || 'x-lang',
    detectFromAll: options.detectFromAll ?? true, // Default to true for flexibility
  };
}
