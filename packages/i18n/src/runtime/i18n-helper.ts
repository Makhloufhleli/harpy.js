/**
 * I18n Helper utilities for Bun runtime
 */

import type { I18nOptions } from './i18n-options';
import { normalizeI18nOptions } from './i18n-options';
import { serializeCookie } from '@harpy-js/core/runtime';

/**
 * I18n Helper class for URL and cookie management
 */
export class I18nHelper {
  private options: Required<I18nOptions>;

  constructor(options: I18nOptions) {
    this.options = normalizeI18nOptions(options);
  }

  /**
   * Build a URL with locale parameter
   */
  buildLocaleUrl(
    locale: string,
    currentPath: string,
    query?: Record<string, string>
  ): string {
    const { urlPattern, queryParam } = this.options;

    switch (urlPattern) {
      case 'query': {
        const params = new URLSearchParams(query || {});
        params.set(queryParam, locale);
        return `${currentPath}?${params.toString()}`;
      }

      case 'header':
      default: {
        if (query && Object.keys(query).length > 0) {
          const params = new URLSearchParams(query);
          return `${currentPath}?${params.toString()}`;
        }
        return currentPath;
      }
    }
  }

  /**
   * Create a Set-Cookie header value for locale
   */
  createLocaleCookie(locale: string): string {
    return serializeCookie(this.options.cookieName, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false,
      sameSite: 'Lax',
    });
  }

  /**
   * Validate and return a valid locale
   */
  validateLocale(locale: string): string {
    if (!this.options.locales.includes(locale)) {
      return this.options.defaultLocale;
    }
    return locale;
  }

  /**
   * Get client-side configuration
   */
  getClientConfig() {
    return {
      locales: this.options.locales,
      defaultLocale: this.options.defaultLocale,
      urlPattern: this.options.urlPattern,
      queryParam: this.options.queryParam,
    };
  }

  /**
   * Get all supported locales
   */
  getLocales(): string[] {
    return this.options.locales;
  }

  /**
   * Get the default locale
   */
  getDefaultLocale(): string {
    return this.options.defaultLocale;
  }
}

/**
 * Create an I18nHelper instance
 */
export function createI18nHelper(options: I18nOptions): I18nHelper {
  return new I18nHelper(options);
}
