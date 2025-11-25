import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { I18N_MODULE_OPTIONS } from './i18n-module.options';
import type { I18nModuleOptions } from './i18n-module.options';

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(
    @Inject(I18N_MODULE_OPTIONS) private options: I18nModuleOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const locales = this.options.locales;
    const defaultLocale = this.options.defaultLocale;

    let locale: string | undefined = undefined;

    // Extract locale based on URL pattern
    switch (this.options.urlPattern) {
      case 'query':
        // Extract from query parameter
        const queryLang = request.query?.[this.options.queryParam || 'lang'];
        if (queryLang && locales.includes(queryLang)) {
          locale = queryLang;
        }
        break;

      case 'header':
        // Use only headers (no URL modification)
        break;
    }

    // Fallback to cookie if not found in URL
    const cookieLang = this.parseCookie(
      request.headers.cookie,
      this.options.cookieName || 'locale',
    );
    if (!locale) {
      if (cookieLang && locales.includes(cookieLang)) {
        locale = cookieLang;
      }
    }

    // Fallback to x-lang header
    const xLang = request.headers['x-lang'];
    if (!locale) {
      if (xLang && locales.includes(xLang)) {
        locale = xLang;
      }
    }

    // Fallback to accept-language header
    const acceptLanguage = request.headers['accept-language'];
    if (!locale) {
      if (acceptLanguage) {
        const preferredLocale = acceptLanguage
          .split(',')[0]
          .split('-')[0]
          .toLowerCase();

        if (locales.includes(preferredLocale)) {
          locale = preferredLocale;
        }
      }
    }

    // Use default locale if nothing matched
    if (!locale) {
      locale = defaultLocale;
    }

    // Store locale in request object for later use
    request.locale = locale;

    return next.handle();
  }

  private parseCookie(
    cookieHeader: string | undefined,
    name: string,
  ): string | undefined {
    if (!cookieHeader) return undefined;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const cookie = cookies.find((c) => c.startsWith(`${name}=`));

    if (!cookie) return undefined;
    const eqIndex = cookie.indexOf('=');
    if (eqIndex === -1) return undefined;
    const value = cookie.slice(eqIndex + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value; // Return as-is if decoding fails
    }
  }
}
