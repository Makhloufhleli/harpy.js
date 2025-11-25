import { Inject, Injectable } from '@nestjs/common';
import type { I18nModuleOptions } from './i18n-module.options';
import { I18N_MODULE_OPTIONS } from './i18n-module.options';

@Injectable()
export class I18nHelper {
  constructor(
    @Inject(I18N_MODULE_OPTIONS) private readonly options: I18nModuleOptions,
  ) {}

  /**
   * Build the URL for switching locale based on the configured URL pattern
   */
  buildLocaleUrl(
    locale: string,
    currentPath: string,
    query?: Record<string, string>,
  ): string {
    const { urlPattern, queryParam = 'lang' } = this.options;

    switch (urlPattern) {
      case 'query': {
        const params = new URLSearchParams(query || {});
        params.set(queryParam, locale);
        return `${currentPath}?${params.toString()}`;
      }

      case 'header':
      default: {
        // For header-based, just redirect to same URL
        // Cookie will be set and header will be checked on next request
        if (query && Object.keys(query).length > 0) {
          const params = new URLSearchParams(query);
          return `${currentPath}?${params.toString()}`;
        }
        return currentPath;
      }
    }
  }

  /**
   * Set the locale cookie in the response (Fastify)
   */
  setLocaleCookie(res: any, locale: string): void {
    const { cookieName = 'locale' } = this.options;
    res.setCookie(cookieName, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year in seconds for Fastify
      httpOnly: false, // Allow client-side reading if needed
      sameSite: 'lax',
    });
  }

  /**
   * Validate locale
   */
  validateLocale(locale: string): string {
    if (!this.options.locales?.includes(locale)) {
      return this.options.defaultLocale || 'en';
    }
    return locale;
  }

  /**
   * Get configuration for client-side usage
   */
  getClientConfig() {
    return {
      locales: this.options.locales || ['en'],
      defaultLocale: this.options.defaultLocale || 'en',
      urlPattern: this.options.urlPattern || 'query',
      queryParam: this.options.queryParam || 'lang',
    };
  }
}
