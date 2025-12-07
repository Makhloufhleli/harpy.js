import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { I18N_MODULE_OPTIONS } from "./i18n-module.options";
import type { I18nModuleOptions } from "./i18n-module.options";

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(
    @Inject(I18N_MODULE_OPTIONS) private options: I18nModuleOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const locales = this.options.locales;
    const defaultLocale = this.options.defaultLocale;

    let locale: string | undefined = undefined;
    let shouldSetCookie = false;

    // Extract locale based on URL pattern
    switch (this.options.urlPattern) {
      case "query":
        // Extract from query parameter
        const queryLang = request.query?.[this.options.queryParam || "lang"];
        if (queryLang && locales.includes(queryLang)) {
          locale = queryLang;
          shouldSetCookie = true; // Set cookie when lang is in URL
        }
        break;

      case "header":
        // Extract from x-lang header
        const xLang = request.headers["x-lang"];
        if (xLang && locales.includes(xLang)) {
          locale = xLang;
          shouldSetCookie = true; // Set cookie when header is present
        }
        break;
    }

    // Fallback to cookie if not found in URL/header
    const cookieLang = this.parseCookie(
      request.headers.cookie,
      this.options.cookieName || "locale",
    );
    if (!locale) {
      if (cookieLang && locales.includes(cookieLang)) {
        locale = cookieLang;
      }
    }

    // Fallback to accept-language header
    if (!locale) {
      const acceptLanguage = request.headers["accept-language"];
      if (acceptLanguage) {
        const preferredLocale = acceptLanguage
          .split(",")[0]
          .split("-")[0]
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

    // Automatically set cookie if locale was found in URL or header
    if (shouldSetCookie && cookieLang !== locale) {
      const cookieName = this.options.cookieName || "locale";
      const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
      response.header(
        "Set-Cookie",
        `${cookieName}=${locale}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`,
      );
    }

    return next.handle();
  }

  private parseCookie(
    cookieHeader: string | undefined,
    name: string,
  ): string | undefined {
    if (!cookieHeader) return undefined;

    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const cookie = cookies.find((c) => c.startsWith(`${name}=`));

    if (!cookie) return undefined;
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) return undefined;
    const value = cookie.slice(eqIndex + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value; // Return as-is if decoding fails
    }
  }
}
